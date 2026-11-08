#!/usr/bin/env python3
"""Згенерувати картинку через «Віддалений SD» і зберегти у файл. Для нейронок і скриптів (лише стандартна бібліотека).

Приклад:
  python3 sd_generate.py --prompt "fantasy book cover, dragon over castle" --out covers/book1.webp --width 768 --height 1024
Вхід: змінна середовища SD_KEY=логін:пароль (акаунт, підтверджений в адмінці), або SD_LOGIN + SD_PASSWORD. Сайт: SD_SITE (типово https://zbyrai.pages.dev).
Код виходу: 0 готово, 2 ПК вимкнений, 3 помилка входу/генерації, 4 таймаут."""
import argparse, json, os, sys, time, urllib.request, urllib.error

SITE = os.environ.get("SD_SITE", "https://zbyrai.pages.dev").rstrip("/")
KEY = os.environ.get("SD_KEY") or (os.environ.get("SD_LOGIN", "") + ":" + os.environ.get("SD_PASSWORD", ""))
TOKEN = ""


def call(path, payload=None, raw=False):
    req = urllib.request.Request(SITE + "/api/sd/" + path, data=None if payload is None else json.dumps(payload).encode(),
                                 headers={"x-token": TOKEN, "Content-Type": "application/json", "User-Agent": "zbyrai-sd-cli/1.0"})
    try:
        with urllib.request.urlopen(req, timeout=60) as r:
            return r.read() if raw else json.loads(r.read().decode())
    except urllib.error.HTTPError as e:
        try:
            msg = json.loads(e.read().decode()).get("error", "")
        except Exception:
            msg = ""
        sys.exit("Помилка %s: %s" % (e.code, msg or "запит відхилено"))


def main():
    a = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    a.add_argument("--prompt", required=True); a.add_argument("--out", required=True)
    a.add_argument("--negative", default="lowres, bad anatomy, blurry, watermark, text")
    a.add_argument("--width", type=int, default=768); a.add_argument("--height", type=int, default=1024)
    a.add_argument("--steps", type=int, default=0); a.add_argument("--cfg", type=float, default=0)  # 0 = як налаштовано на ПК
    a.add_argument("--seed", type=int, default=-1); a.add_argument("--timeout", type=int, default=900)
    a = a.parse_args()
    if len(KEY) < 3:
        sys.exit("Не задано SD_KEY (логін:пароль)")
    global TOKEN
    login, _, password = KEY.partition(":")
    TOKEN = call("login", {"login": login, "password": password})["token"]
    if not call("ping").get("online"):
        print("ПК із Stable Diffusion зараз вимкнений. Попроси користувача увімкнути ПК і воркер."); sys.exit(2)
    job = call("submit", {"prompt": a.prompt, "negative": a.negative, "width": a.width, "height": a.height,
                          "steps": a.steps, "cfg": a.cfg, "seed": a.seed})["id"]
    end = time.time() + a.timeout
    while time.time() < end:
        time.sleep(4)
        st = call("status?id=" + job)
        if st["status"] == "done":
            os.makedirs(os.path.dirname(os.path.abspath(a.out)), exist_ok=True)
            with open(a.out, "wb") as f:
                f.write(call("image?id=" + job, raw=True))
            print("Готово: %s (seed %s)" % (a.out, (st.get("info") or {}).get("seed", "?"))); return
        if st["status"] == "error":
            print("Помилка генерації:", st.get("error")); sys.exit(3)
    print("Таймаут очікування"); sys.exit(4)


if __name__ == "__main__":
    main()
