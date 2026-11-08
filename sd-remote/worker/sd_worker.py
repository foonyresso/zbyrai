#!/usr/bin/env python3
"""Воркер «Віддаленого SD»: працює на твоєму ПК поруч із Forge Neo.
Раз на кілька секунд питає сайт, чи є нові задачі, генерує їх через локальний Forge і віддає картинку на сайт.
Вхідні підключення до ПК не потрібні. Лише стандартна бібліотека Python (+ Pillow, він уже є у venv Forge).

Запуск (з папки Forge, venv-Python):  venv\\Scripts\\python.exe sd_worker.py
Налаштування: змінні середовища SD_SITE, SD_TOKEN, SD_FORGE або файл worker.json поруч зі скриптом."""
import base64, hashlib, io, json, os, re, sys, threading, time, urllib.request, urllib.error

HERE = os.path.dirname(os.path.abspath(__file__))
cfg = {
    "site": "https://zbyrai.pages.dev", "token": "", "forge": "http://127.0.0.1:7860", "poll": 4,
    # налаштування генерації за замовчуванням (модель anima_turbo); кожне можна змінити в worker.json
    "steps": 8, "cfg": 1.4, "shift": 3, "sampler": "Euler a", "scheduler": "Beta",
    # Hires. fix (апскейл): множник приходить із сайту
    "hr_upscaler": "RealESRGAN_x4plus_anime_6B.pth", "hr_steps": 8, "hr_cfg": 1.4, "hr_shift": 8, "hr_denoise": 0.4,
    # ADetailer
    "ad_face_model": "face_yolov8n.pt",
    # збереження на ПК: Forge сам кладе картинки у свої звичайні папки (Images/Text2Img/ДАТА) за своїми налаштуваннями
    "forge_save": True,
    # додаткова власна копія PNG із метаданами (параметри + запит сайту) у папці save_dir поруч зі скриптом; типово вимкнена
    "save_png": False, "save_dir": "site_outputs",
    # метадані LoRA з Civitai (категорії, теги, тригер-слова, картинки): знаходить за хешем файлу, кеш у lora_cache.json; civitai_key (необов'язково) — ключ API Civitai
    "civitai": True, "civitai_key": "",
    "ad": {"ad_confidence": 0.75, "ad_dilate_erode": 4, "ad_mask_blur": 8, "ad_denoising_strength": 0.27,
           "ad_inpaint_only_masked": True, "ad_inpaint_only_masked_padding": 56,
           "ad_use_inpaint_width_height": True, "ad_inpaint_width": 1024, "ad_inpaint_height": 1024},
}
try:
    with open(os.path.join(HERE, "worker.json"), encoding="utf-8") as f:
        cfg.update(json.load(f))
except FileNotFoundError:
    pass
cfg["site"] = os.environ.get("SD_SITE", cfg["site"]).rstrip("/")
cfg["token"] = os.environ.get("SD_TOKEN", cfg["token"])
cfg["forge"] = os.environ.get("SD_FORGE", cfg["forge"]).rstrip("/")
UA = "zbyrai-sd-worker/1.0"  # без User-Agent Cloudflare може відхилити запит


def call(url, payload=None, token=None, timeout=30):
    headers = {"User-Agent": UA, "Content-Type": "application/json"}
    if token:
        headers["Authorization"] = "Bearer " + token
    data = json.dumps(payload).encode() if payload is not None else None
    req = urllib.request.Request(url, data=data, headers=headers, method="POST" if data is not None else "GET")
    with urllib.request.urlopen(req, timeout=timeout) as r:
        return json.loads(r.read().decode())


def adetailer_args(p):
    if not p.get("adFace"):
        return None
    unit = dict(cfg["ad"], ad_model=cfg["ad_face_model"], ad_prompt=p.get("adPrompt", ""), ad_negative_prompt=p.get("adNeg", ""))
    return [True, False, unit]


def forge_body(p, with_ad=True):
    body = {"prompt": p["prompt"], "negative_prompt": p.get("negative", ""), "width": p["width"], "height": p["height"],
            "steps": p.get("steps") or cfg["steps"], "cfg_scale": p.get("cfg") or cfg["cfg"], "distilled_cfg_scale": cfg["shift"],
            "sampler_name": p.get("sampler") or cfg["sampler"], "scheduler": p.get("scheduler") or cfg["scheduler"],
            "seed": p.get("seed", -1), "batch_size": 1, "n_iter": 1, "save_images": bool(cfg["forge_save"]),
            "hr_additional_modules": ["Use same choices"]}   # завжди: інакше Forge падає (NoneType) під час Hires fix
    if p.get("upscale", 1) > 1:  # апскейл = Hires. fix із потрібним множником
        body.update({"enable_hr": True, "hr_scale": p["upscale"], "hr_upscaler": cfg["hr_upscaler"],
                     "hr_second_pass_steps": cfg["hr_steps"], "hr_cfg": cfg["hr_cfg"], "hr_distilled_cfg": cfg["hr_shift"],
                     "denoising_strength": cfg["hr_denoise"]})
    ad = adetailer_args(p) if with_ad else None
    if ad:
        body["alwayson_scripts"] = {"ADetailer": {"args": ad}}
    return body


def pack(png):
    """WebP із якістю, що знижується, доки base64 не влізе в ліміт сайту (~1.4 МБ)."""
    try:
        from PIL import Image
        im = Image.open(io.BytesIO(png)).convert("RGB")
        for q in (92, 85, 78, 70, 60, 50):
            buf = io.BytesIO(); im.save(buf, "WEBP", quality=q)
            b64 = base64.b64encode(buf.getvalue()).decode()
            if len(b64) < 1_400_000:
                return b64, "image/webp"
        return b64, "image/webp"
    except Exception:
        return base64.b64encode(png).decode(), "image/png"


def watch_progress(job_id, stop):
    """Поки Forge малює, раз на ~1 с читає його справжній прогрес і передає на сайт (лише якщо змінився)."""
    last = -1.0
    while not stop.wait(1.0):
        try:
            d = call(cfg["forge"] + "/sdapi/v1/progress?skip_current_image=true", timeout=10)
            p = max(last, float(d.get("progress") or 0))
            if p - last >= 0.02:
                call(cfg["site"] + "/api/sd/progress", {"id": job_id, "p": p}, cfg["token"], timeout=15)
                last = p
        except Exception:
            pass


def generate(p, job_id=None):
    stop = threading.Event()
    if job_id:
        threading.Thread(target=watch_progress, args=(job_id, stop), daemon=True).start()
    try:
        return _generate(p)
    finally:
        stop.set()


def fetch_bytes(url, timeout=120):
    req = urllib.request.Request(url, headers={"User-Agent": UA})
    with urllib.request.urlopen(req, timeout=timeout) as r:
        return r.read()


def inpaint_body(p, init_b64):
    """img2img із маскою: лише зафарбована ділянка (Only masked), без ADetailer і апскейлу; інше як при генерації."""
    return {"init_images": [init_b64], "mask": p["mask"], "mask_blur": p.get("blur", 8), "inpainting_fill": 1, "inpaint_full_res": True,
            "inpaint_full_res_padding": p.get("padding", 64), "inpainting_mask_invert": 0, "resize_mode": 0, "denoising_strength": p.get("denoise", 0.5),
            "prompt": p["prompt"], "negative_prompt": p.get("negative", ""), "width": p["width"], "height": p["height"],
            "steps": p.get("steps") or cfg["steps"], "cfg_scale": p.get("cfg") or cfg["cfg"], "distilled_cfg_scale": cfg["shift"],
            "sampler_name": p.get("sampler") or cfg["sampler"], "scheduler": p.get("scheduler") or cfg["scheduler"],
            "seed": p.get("seed", -1), "batch_size": 1, "n_iter": 1, "save_images": bool(cfg["forge_save"])}


def _inpaint(p):
    try:
        src = fetch_bytes(cfg["site"] + "/api/sd/image?id=" + p["srcId"])
    except Exception:
        raise RuntimeError("не вдалося завантажити вихідну картинку з сайту (її могло бути видалено)")
    body = inpaint_body(p, base64.b64encode(src).decode())
    r = call(cfg["forge"] + "/sdapi/v1/img2img", body, timeout=1800)
    png = base64.b64decode(r["images"][0])
    try:
        info = json.loads(r.get("info", "{}"))
    except Exception:
        info = {}
    texts = info.get("infotexts") or [""]
    img, mime = pack(png)
    light = dict(body, init_images=["<%d байт>" % len(src)], mask="<маска %d символів>" % len(p["mask"]))   # у лог без великих полів
    return img, mime, info.get("seed", -1), str(texts[0])[:6000], light, png


def _generate(p):
    if p.get("kind") == "inpaint":
        return _inpaint(p)
    body = forge_body(p)
    try:
        r = call(cfg["forge"] + "/sdapi/v1/txt2img", body, timeout=1800)
    except Exception as e:
        if not adetailer_args(p):
            raise
        print("  ADetailer не спрацював (%s), пробую без нього" % e)
        body = forge_body(p, with_ad=False)
        r = call(cfg["forge"] + "/sdapi/v1/txt2img", body, timeout=1800)
    png = base64.b64decode(r["images"][0])
    try:
        info = json.loads(r.get("info", "{}"))
    except Exception:
        info = {}
    texts = info.get("infotexts") or [""]
    img, mime = pack(png)
    return img, mime, info.get("seed", -1), str(texts[0])[:6000], body, png


def save_copy(png, infotext, job, request):
    """Копія результату на ПК: PNG із метаданими «parameters» (читається у PNG Info) + що саме надіслав сайт."""
    if not cfg.get("save_png"):
        return
    try:
        from PIL import Image
        from PIL.PngImagePlugin import PngInfo
        im = Image.open(io.BytesIO(png))
        meta = PngInfo()
        meta.add_text("parameters", im.info.get("parameters") or infotext)
        meta.add_text("sd_site", json.dumps({"job": job["id"], "site_params": {k: v for k, v in job["params"].items() if k != "mask"}, "forge_request": request}, ensure_ascii=False))
        d = os.path.join(HERE, cfg["save_dir"], time.strftime("%Y-%m-%d"))
        os.makedirs(d, exist_ok=True)
        path = os.path.join(d, "%s_%s.png" % (time.strftime("%H%M%S"), job["id"][:8]))
        im.save(path, "PNG", pnginfo=meta)
        print("  збережено:", path)
    except Exception as e:
        print("  не вдалося зберегти копію:", e)


def forge_outdir(inpaint=False):
    """Папка, куди Forge зберігає результати (з його налаштувань)."""
    try:
        o = call(cfg["forge"] + "/sdapi/v1/options", timeout=20)
        return o.get("outdir_img2img_samples" if inpaint else "outdir_txt2img_samples") or ""
    except Exception:
        return ""


def find_saved(outdir, since):
    """Найновіший файл у папці виводу Forge, створений не раніше since (щоб показати, де лежить результат)."""
    if not outdir:
        return ""
    for base in (outdir, os.path.join(HERE, outdir)):
        if not os.path.isdir(base):
            continue
        best, bt = "", 0
        for root, dirs, files in os.walk(base):
            if root[len(base):].count(os.sep) > 2:
                dirs[:] = []
                continue
            for f in files:
                if f.lower().endswith((".png", ".jpg", ".jpeg", ".webp")):
                    pth = os.path.join(root, f)
                    m = os.path.getmtime(pth)
                    if m >= since - 2 and m > bt:
                        best, bt = pth, m
        if best:
            return os.path.abspath(best)
    return ""


def read_json(path):
    try:
        with open(path, encoding="utf-8") as f:
            return json.load(f)
    except Exception:
        return None


def top_tags(meta, n=8):
    """Найчастіші теги навчання зі службових полів LoRA (запасний варіант, коли немає тригер-слів)."""
    try:
        freq = json.loads(meta.get("ss_tag_frequency") or "{}")
        total = {}
        for d in freq.values():
            for t, c in d.items():
                total[t] = total.get(t, 0) + c
        return [t for t, _ in sorted(total.items(), key=lambda x: -x[1])[:n]]
    except Exception:
        return []


def lora_thumb(stem):
    for ext in (".preview.png", ".preview.jpg", ".preview.jpeg", ".preview.webp", ".png", ".jpg", ".jpeg", ".webp"):
        if os.path.isfile(stem + ext):
            try:
                from PIL import Image
                im = Image.open(stem + ext).convert("RGB"); im.thumbnail((400, 600))
                buf = io.BytesIO(); im.save(buf, "WEBP", quality=72)
                return base64.b64encode(buf.getvalue()).decode()
            except Exception:
                return ""
    return ""


def as_list(v):
    if isinstance(v, list):
        return [str(x).strip() for x in v if str(x).strip()]
    return [x.strip() for x in str(v or "").split(",") if x.strip()]


ADULT_TAGS = {"nsfw", "sexy", "porn", "hentai", "explicit", "adult", "erotic", "lewd", "18+"}


def lora_flags(ci, um):
    """Теги, тип і позначка 18+ з метаданих Civitai/Forge."""
    model = ci.get("model") or {}
    tags = [str(t) for t in (model.get("tags") or ci.get("tags") or [])][:16]
    lvl = ci.get("nsfwLevel") or model.get("nsfwLevel") or 0
    adult = bool(model.get("nsfw") or ci.get("nsfw") or um.get("nsfw") or (isinstance(lvl, int) and lvl >= 4) or any(t.lower() in ADULT_TAGS for t in tags))
    return tags, str(model.get("type") or ""), adult


# ---- Civitai: знаходимо LoRA за SHA256 файлу, беремо категорії/теги/тригери/картинку; результат кешується на диск
CACHE_FILE = os.path.join(HERE, "lora_cache.json")
CIV = {"cache": None, "lock": threading.Lock(), "thread": None}


def civ_cache():
    with CIV["lock"]:
        if CIV["cache"] is None:
            CIV["cache"] = read_json(CACHE_FILE) or {}
        return CIV["cache"]


def civ_save():
    with CIV["lock"]:
        try:
            with open(CACHE_FILE, "w", encoding="utf-8") as f:
                json.dump(CIV["cache"], f, ensure_ascii=False)
        except Exception as e:
            print("Не вдалося записати кеш LoRA:", e)


def file_sha256(path):
    h = hashlib.sha256()
    with open(path, "rb") as f:
        for chunk in iter(lambda: f.read(8 << 20), b""):
            h.update(chunk)
    return h.hexdigest()


def civ_get(url, binary=False):
    headers = {"User-Agent": UA}
    if cfg.get("civitai_key"):
        headers["Authorization"] = "Bearer " + cfg["civitai_key"]
    with urllib.request.urlopen(urllib.request.Request(url, headers=headers), timeout=40) as r:
        data = r.read()
    return data if binary else json.loads(data.decode("utf-8"))


def strip_html(t):
    return re.sub(r"\s+", " ", re.sub(r"<[^>]+>", " ", str(t or ""))).strip()


def civ_parse(ver, model):
    """Потрібні поля з відповідей Civitai (версія за хешем + сама модель)."""
    vm = ver.get("model") or {}
    tags = [t if isinstance(t, str) else str(t.get("name", "")) for t in (model.get("tags") or [])]
    img = next((i for i in (ver.get("images") or []) if i.get("url") and str(i.get("type", "image")) == "image"), None)
    return {"modelId": ver.get("modelId") or model.get("id"), "title": vm.get("name") or model.get("name") or "", "version": ver.get("name") or "",
            "base": ver.get("baseModel") or "", "triggers": [str(x) for x in (ver.get("trainedWords") or []) if str(x).strip()], "tags": [t for t in tags if t][:20],
            "type": vm.get("type") or model.get("type") or "", "nsfw": bool(vm.get("nsfw") or model.get("nsfw")),
            "image": re.sub(r"/width=\d+", "/width=450", img["url"]) if img else "", "note": strip_html(model.get("description"))[:400]}


def civ_thumb(url):
    try:
        from PIL import Image
        im = Image.open(io.BytesIO(civ_get(url, binary=True))).convert("RGB"); im.thumbnail((400, 600))
        buf = io.BytesIO(); im.save(buf, "WEBP", quality=72)
        return base64.b64encode(buf.getvalue()).decode()
    except Exception:
        return ""


def civitai_pass(items):
    """У фоні: для LoRA без запису в кеші рахує хеш і питає Civitai (повільно й обережно; без інтернету тихо завершується)."""
    cache, changed = civ_cache(), False
    try:
        for it in items:
            path = it.get("path") or ""
            if not os.path.isfile(path):
                continue
            st, key = os.stat(path), it["name"]
            ent = cache.get(key)
            if ent and ent.get("size") == st.st_size and ent.get("mtime") == int(st.st_mtime) and (ent.get("data") is not None or time.time() - ent.get("t", 0) < 7 * 86400):
                continue
            ent = {"size": st.st_size, "mtime": int(st.st_mtime), "t": time.time(), "data": None}
            try:
                ver = civ_get("https://civitai.com/api/v1/model-versions/by-hash/" + file_sha256(path))
                try:
                    model = civ_get("https://civitai.com/api/v1/models/%s" % ver.get("modelId"))
                except Exception:
                    model = {}
                data = civ_parse(ver, model)
                data["thumb"] = civ_thumb(data["image"]) if data["image"] and not lora_thumb(os.path.splitext(path)[0]) else ""
                ent["data"] = data
                print("  Civitai: знайдено «%s»" % (data["title"] or key))
            except urllib.error.HTTPError as e:
                if e.code != 404:
                    raise
            with CIV["lock"]:
                cache[key] = ent
            civ_save(); changed = True; time.sleep(0.7)
    except Exception as e:
        print("Civitai: зупинено (%s). Спробую пізніше." % e)
    CIV["thread"] = None
    if changed:
        sync_loras(force=True)


def ensure_civitai(items):
    if not cfg.get("civitai") or (CIV["thread"] and CIV["thread"].is_alive()):
        return
    cache = civ_cache()
    todo = [i for i in items if i.get("path") and os.path.isfile(i["path"]) and i["name"] not in cache]
    if todo:
        CIV["thread"] = threading.Thread(target=civitai_pass, args=(items,), daemon=True); CIV["thread"].start()


def lora_folder(it, root):
    try:
        rel = os.path.relpath(os.path.dirname(it.get("path") or ""), root)
        return "" if rel in (".", "") else rel.replace("\\", "/")
    except Exception:
        return ""


def lora_info(it, root=""):
    """Метадані LoRA: Civitai (.civitai.info), Forge (.json), службові поля safetensors, прев'ю поруч."""
    stem = os.path.splitext(it.get("path") or "")[0]
    meta = it.get("metadata") or {}
    ci = read_json(stem + ".civitai.info") or {}
    um = read_json(stem + ".json") or {}
    model = ci.get("model") or {}
    weight = um.get("preferred weight") or 0
    try:
        weight = float(weight)
    except Exception:
        weight = 0
    tags, mtype, adult = lora_flags(ci, um)
    cv = ((civ_cache().get(it["name"]) or {}).get("data")) or {}   # дані з Civitai за хешем (якщо знайдено)
    if cv:
        tags = tags or cv.get("tags", []); mtype = mtype or cv.get("type", ""); adult = adult or bool(cv.get("nsfw"))
    return {
        "folder": lora_folder(it, root), "tags": tags, "type": mtype, "nsfw": adult,
        "name": it["name"], "title": model.get("name") or cv.get("title") or meta.get("ss_output_name") or it["name"],
        "version": ci.get("name") or cv.get("version") or "", "base": ci.get("baseModel") or cv.get("base") or um.get("sd version") or meta.get("ss_base_model_version") or "",
        "triggers": as_list(ci.get("trainedWords") or um.get("activation text") or cv.get("triggers")), "hints": top_tags(meta),
        "weight": weight, "civitai": ("https://civitai.com/models/%s" % (ci.get("modelId") or cv.get("modelId"))) if (ci.get("modelId") or cv.get("modelId")) else "",
        "note": str(um.get("description") or um.get("notes") or cv.get("note") or "")[:400], "thumb": lora_thumb(stem) or cv.get("thumb", ""),
    }


LORA_STATE = {"hash": None, "at": 0}


def sync_loras(force=False):
    """Раз на 5 хв (і на старті) надсилає список LoRA із папки Forge на сайт, якщо він змінився."""
    if not force and time.time() - LORA_STATE["at"] < 300:
        return
    LORA_STATE["at"] = time.time()
    try:
        items = call(cfg["forge"] + "/sdapi/v1/loras", timeout=60)
        try:   # спільна коренева папка LoRA: від неї рахуються підпапки-групи
            root = os.path.commonpath([os.path.dirname(i["path"]) for i in items if i.get("path")])
        except Exception:
            root = ""
        data = sorted((lora_info(i, root) for i in items), key=lambda x: x["name"].lower())
        ensure_civitai(items)
        h = hash(json.dumps(data, sort_keys=True))
        if h != LORA_STATE["hash"]:
            call(cfg["site"] + "/api/sd/loras-sync", {"loras": data}, cfg["token"], timeout=120)
            LORA_STATE["hash"] = h
            print("LoRA оновлено на сайті: %d шт." % len(data))
    except Exception as e:
        print("LoRA: не вдалося оновити список (%s)" % e)


def main():
    if not cfg["token"]:
        sys.exit("Не задано токен: SD_TOKEN або worker.json {\"token\": \"...\"}")
    print(f"Воркер запущено. Сайт: {cfg['site']}  Forge: {cfg['forge']}  (Ctrl+C щоб зупинити)")
    d = forge_outdir()
    print("Forge зберігає картинки в:", d or "(не вдалося дізнатися; перевір, що Forge запущений з --api)")
    sync_loras(force=True)
    while True:
        sync_loras()
        try:
            job = call(cfg["site"] + "/api/sd/next", {}, cfg["token"]).get("job")
        except urllib.error.HTTPError as e:
            print("Сайт відповів помилкою", e.code, "(перевір токен)"); time.sleep(15); continue
        except Exception as e:
            print("Немає зв'язку із сайтом:", e); time.sleep(10); continue
        if not job:
            time.sleep(cfg["poll"]); continue
        print("Задача", job["id"], "-", job["params"]["prompt"][:60])
        t0 = time.time()
        try:
            img, mime, seed, infotext, request, png = generate(job["params"], job["id"])
            save_copy(png, infotext, job, request)
            outdir = forge_outdir(job["params"].get("kind") == "inpaint")
            saved = find_saved(outdir, t0) if cfg["forge_save"] else ""
            print("  Forge зберіг:", saved) if saved else print("  файл не знайдено; папка Forge:", outdir or "невідома")
            out = {"id": job["id"], "image": img, "mime": mime, "info": {"seed": seed, "infotext": infotext, "request": request, "saved": saved or ("папка Forge: " + outdir)}}
        except Exception as e:
            print("  помилка генерації:", e)
            out = {"id": job["id"], "error": "Помилка генерації на ПК: " + str(e)[:200]}
        for attempt in range(3):
            try:
                call(cfg["site"] + "/api/sd/result", out, cfg["token"], timeout=60); print("  готово"); break
            except Exception as e:
                print("  не вдалося віддати результат:", e); time.sleep(5)


if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("Зупинено.")
