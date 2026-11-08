#!/usr/bin/env python3
"""Згенерувати картинку через «Віддалений SD» і зберегти у файл. Для нейронок і скриптів (лише стандартна бібліотека).

За замовчуванням робить те саме, що кнопка «Згенерувати» на сайті: ті самі три LoRA (на початку промпта), той самий негативний промпт,
пропорція 9:16 з довгою стороною 1344 (кратно 64), апскейл 1.65×, ADetailer для обличчя. Усе змінюється прапорцями нижче.

Приклади:
  python3 sd_generate.py --prompt "masterpiece, 1girl, castle, dragon" --out covers/book1.webp --ratio 3:4
  python3 sd_generate.py --prompt "scenery, forest" --out img/forest.webp --landscape --no-adetailer --upscale 1
  python3 sd_generate.py --prompt "..." --out x.webp --dry-run      # лише показати, що буде відправлено

Вхід: змінна середовища SD_KEY=логін:пароль (акаунт, підтверджений в адмінці), або SD_LOGIN + SD_PASSWORD. Сайт: SD_SITE (типово https://zbyrai.pages.dev).
Код виходу: 0 готово, 2 ПК вимкнений, 3 помилка входу/генерації, 4 таймаут."""
import argparse, json, os, re, sys, time, urllib.request, urllib.error

SITE = os.environ.get("SD_SITE", "https://zbyrai.pages.dev").rstrip("/")
KEY = os.environ.get("SD_KEY") or (os.environ.get("SD_LOGIN", "") + ":" + os.environ.get("SD_PASSWORD", ""))
TOKEN = ""

# Ті самі значення за замовчуванням, що й на сайті (sd-remote/app.js)
NEG_DEFAULT = ("bad quality, worst quality, low quality, lowres, score_1, score_2, jpeg artifacts, logo, watermark,\n"
               "bad anatomy, bad hands, fewer fingers, missing fingers,\nflat color, 2d, anime, monochrome,\n(abs, muscular),")
LORAS_DEFAULT = [("Epistail_0.1", 0.2), ("UTV_v0.1", 0.15), ("PFT_ASH_0.1", 0.3)]
RATIOS = ["1:1", "2:3", "3:4", "4:5", "5:7", "9:16", "9:21"]


def size_for(ratio, landscape=False, long_side=1344):
    """Розмір за пропорцією: довга сторона = long_side, коротка кратна 64 (як на сайті)."""
    a, b = (int(x) for x in ratio.split(":"))
    lo, hi = min(a, b), max(a, b)
    short = max(64, round(long_side * lo / hi / 64) * 64)
    return (long_side, short) if landscape else (short, long_side)


def fmt_w(w):
    return ("%g" % round(w, 2))


def lora_tags(loras):
    return ", ".join("<lora:%s:%s>" % (n, fmt_w(w)) for n, w in loras)


def build_prompt(text, loras):
    """LoRA спочатку, потім теги (так само, як на сайті)."""
    text = re.sub(r",\s*$", "", text.strip())
    return ", ".join(x for x in (lora_tags(loras), text) if x)


def parse_lora(spec):
    name, _, w = spec.partition(":")
    if not name.strip():
        raise argparse.ArgumentTypeError("очікується назва:сила, напр. Epistail_0.1:0.2")
    try:
        return name.strip(), float(w) if w else 0.8
    except ValueError:
        raise argparse.ArgumentTypeError("сила LoRA має бути числом: " + spec)


def build_request(a):
    """Тіло запиту до сайту за аргументами (чиста функція, без мережі)."""
    if a.width and a.height:
        w, h = int(round(a.width / 64) * 64), int(round(a.height / 64) * 64)
    else:
        w, h = size_for(a.ratio, a.landscape, a.long)
    loras = [] if a.no_lora else (a.lora or LORAS_DEFAULT)
    neg = a.negative if a.negative is not None else NEG_DEFAULT
    if a.negative_add:
        neg = neg.rstrip().rstrip(",") + ", " + a.negative_add.strip()
    return {"prompt": build_prompt(a.prompt, loras), "negative": neg, "width": w, "height": h, "steps": a.steps, "seed": a.seed,
            "upscale": a.upscale, "adFace": not a.no_adetailer, "adPrompt": a.ad_prompt, "adNeg": a.ad_negative}


def describe(body, loras_used):
    up = body["upscale"]
    lines = ["Промпт: " + body["prompt"], "Негативний: " + " ".join(body["negative"].split()),
             "Розмір: %dx%d" % (body["width"], body["height"]) + (" -> апскейл %s×" % fmt_w(up) if up > 1 else ""),
             "ADetailer: " + ("обличчя" if body["adFace"] else "вимкнено"), "Seed: " + ("випадковий" if body["seed"] < 0 else str(body["seed"]))]
    return "\n".join(lines)


def call(path, payload=None, raw=False):
    req = urllib.request.Request(SITE + "/api/sd/" + path, data=None if payload is None else json.dumps(payload).encode(),
                                 headers={"x-token": TOKEN, "Content-Type": "application/json", "User-Agent": "zbyrai-sd-cli/1.1"})
    try:
        with urllib.request.urlopen(req, timeout=60) as r:
            return r.read() if raw else json.loads(r.read().decode())
    except urllib.error.HTTPError as e:
        try:
            msg = json.loads(e.read().decode()).get("error", "")
        except Exception:
            msg = ""
        sys.exit("Помилка %s: %s" % (e.code, msg or "запит відхилено"))


def save_image(data, out):
    """Сайт віддає WebP. Для .png/.jpg конвертуємо через Pillow, якщо він є; інакше зберігаємо як .webp."""
    ext = os.path.splitext(out)[1].lower()
    os.makedirs(os.path.dirname(os.path.abspath(out)), exist_ok=True)
    if ext in (".png", ".jpg", ".jpeg"):
        try:
            import io
            from PIL import Image
            im = Image.open(io.BytesIO(data))
            im.convert("RGB").save(out, "JPEG" if ext != ".png" else "PNG", **({"quality": 95} if ext != ".png" else {}))
            return out
        except Exception:
            out = os.path.splitext(out)[0] + ".webp"
            print("Pillow недоступний: збережено як WebP -> " + out)
    with open(out, "wb") as f:
        f.write(data)
    return out


def parser():
    a = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    a.add_argument("--prompt", required=True, help="теги/опис англійською")
    a.add_argument("--out", required=True, help="куди зберегти (.webp найточніше; .png/.jpg через Pillow)")
    a.add_argument("--negative", default=None, help="замінити негативний промпт (типово як на сайті)")
    a.add_argument("--negative-add", default="", help="додати до типового негативного промпта")
    a.add_argument("--ratio", default="9:16", choices=RATIOS, help="пропорції (типово 9:16)")
    a.add_argument("--landscape", action="store_true", help="горизонтально (типово вертикально)")
    a.add_argument("--long", type=int, default=1344, help="довга сторона до апскейлу, кратна 64 (640–1536)")
    a.add_argument("--width", type=int, default=0, help="точна ширина (разом із --height; перекриває --ratio)")
    a.add_argument("--height", type=int, default=0)
    a.add_argument("--upscale", type=float, default=1.65, help="апскейл 1–2× (1 = вимкнено; типово 1.65)")
    a.add_argument("--no-adetailer", action="store_true", help="вимкнути ADetailer для обличчя")
    a.add_argument("--ad-prompt", default="", help="позитивний промпт ADetailer"); a.add_argument("--ad-negative", default="", help="негативний промпт ADetailer")
    a.add_argument("--lora", action="append", type=parse_lora, help="LoRA назва:сила (можна кілька; замінює типові три)")
    a.add_argument("--no-lora", action="store_true", help="без LoRA")
    a.add_argument("--steps", type=int, default=0, help="2–12; 0 = як налаштовано на ПК")
    a.add_argument("--seed", type=int, default=-1); a.add_argument("--timeout", type=int, default=900)
    a.add_argument("--dry-run", action="store_true", help="показати, що буде відправлено, і вийти")
    return a


def main():
    a = parser().parse_args()
    body = build_request(a)
    print(describe(body, None), flush=True)
    if a.dry_run:
        print(json.dumps(body, ensure_ascii=False)); return
    if len(KEY) < 3:
        sys.exit("Не задано SD_KEY (логін:пароль)")
    global TOKEN
    login, _, password = KEY.partition(":")
    TOKEN = call("login", {"login": login, "password": password})["token"]
    if not call("ping").get("online"):
        print("ПК із Stable Diffusion зараз вимкнений. Попроси користувача увімкнути ПК і воркер."); sys.exit(2)
    job = call("submit", body)["id"]
    end = time.time() + a.timeout
    while time.time() < end:
        time.sleep(4)
        st = call("status?id=" + job)
        if st["status"] == "done":
            path = save_image(call("image?id=" + job, raw=True), a.out)
            print("Готово: %s (seed %s)" % (path, (st.get("info") or {}).get("seed", "?"))); return
        if st["status"] == "error":
            print("Помилка генерації:", st.get("error")); sys.exit(3)
    print("Таймаут очікування"); sys.exit(4)


if __name__ == "__main__":
    main()
