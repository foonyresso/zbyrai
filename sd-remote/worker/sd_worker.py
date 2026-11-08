#!/usr/bin/env python3
"""Воркер «Віддаленого SD»: працює на твоєму ПК поруч із Forge Neo.
Раз на кілька секунд питає сайт, чи є нові задачі, генерує їх через локальний Forge і віддає картинку на сайт.
Вхідні підключення до ПК не потрібні. Лише стандартна бібліотека Python (+ Pillow, він уже є у venv Forge).

Запуск (з папки Forge, venv-Python):  venv\\Scripts\\python.exe sd_worker.py
Налаштування: змінні середовища SD_SITE, SD_TOKEN, SD_FORGE або файл worker.json поруч зі скриптом."""
import base64, io, json, os, sys, time, urllib.request, urllib.error

HERE = os.path.dirname(os.path.abspath(__file__))
cfg = {"site": "https://zbyrai.pages.dev", "token": "", "forge": "http://127.0.0.1:7860", "poll": 4}
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


def generate(p):
    body = {"prompt": p["prompt"], "negative_prompt": p.get("negative", ""), "width": p["width"], "height": p["height"],
            "steps": p["steps"], "cfg_scale": p["cfg"], "seed": p.get("seed", -1), "batch_size": 1, "n_iter": 1}
    if p.get("sampler"):
        body["sampler_name"] = p["sampler"]
    if p.get("scheduler"):
        body["scheduler"] = p["scheduler"]
    r = call(cfg["forge"] + "/sdapi/v1/txt2img", body, timeout=900)
    png = base64.b64decode(r["images"][0])
    try:
        seed = json.loads(r.get("info", "{}")).get("seed", -1)
    except Exception:
        seed = -1
    try:  # WebP у ~10 разів легший за PNG; Pillow є у venv Forge
        from PIL import Image
        buf = io.BytesIO()
        Image.open(io.BytesIO(png)).convert("RGB").save(buf, "WEBP", quality=92)
        return base64.b64encode(buf.getvalue()).decode(), "image/webp", seed
    except Exception:
        return base64.b64encode(png).decode(), "image/png", seed


def main():
    if not cfg["token"]:
        sys.exit("Не задано токен: SD_TOKEN або worker.json {\"token\": \"...\"}")
    print(f"Воркер запущено. Сайт: {cfg['site']}  Forge: {cfg['forge']}  (Ctrl+C щоб зупинити)")
    while True:
        try:
            job = call(cfg["site"] + "/api/sd/next", {}, cfg["token"]).get("job")
        except urllib.error.HTTPError as e:
            print("Сайт відповів помилкою", e.code, "(перевір токен)"); time.sleep(15); continue
        except Exception as e:
            print("Немає зв'язку із сайтом:", e); time.sleep(10); continue
        if not job:
            time.sleep(cfg["poll"]); continue
        print("Задача", job["id"], "-", job["params"]["prompt"][:60])
        try:
            img, mime, seed = generate(job["params"])
            out = {"id": job["id"], "image": img, "mime": mime, "info": {"seed": seed}}
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
