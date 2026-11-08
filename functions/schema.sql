-- Схема бази D1 для «Віддаленого SD» (sd-remote). Виконати один раз у Cloudflare: Storage & Databases → D1 → твоя база → Console.
CREATE TABLE IF NOT EXISTS jobs (
  id TEXT PRIMARY KEY,
  user TEXT NOT NULL,
  status TEXT NOT NULL,          -- queued | running | done | error
  params TEXT NOT NULL,          -- JSON параметрів генерації
  image TEXT,                    -- готова картинка, base64 (WebP/PNG)
  mime TEXT,
  info TEXT,                     -- JSON: seed тощо
  error TEXT,
  created INTEGER NOT NULL,
  updated INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS jobs_status ON jobs (status, created);
CREATE TABLE IF NOT EXISTS meta (k TEXT PRIMARY KEY, v INTEGER);

-- Акаунти друзів: реєстрація → статус pending → ти підтверджуєш в адмінці (active)
CREATE TABLE IF NOT EXISTS users (
  login TEXT PRIMARY KEY, salt TEXT NOT NULL, hash TEXT NOT NULL,
  status TEXT NOT NULL,          -- pending | active | blocked
  fails INTEGER NOT NULL DEFAULT 0, locked INTEGER NOT NULL DEFAULT 0, created INTEGER NOT NULL
);
CREATE TABLE IF NOT EXISTS sessions (token TEXT PRIMARY KEY, login TEXT NOT NULL, legacy INTEGER NOT NULL DEFAULT 0, created INTEGER NOT NULL);

-- Список LoRA з ПК (воркер оновлює): назва, метадані з Civitai/безпечних файлів, мініатюра
CREATE TABLE IF NOT EXISTS sd_loras (name TEXT PRIMARY KEY, data TEXT NOT NULL);
