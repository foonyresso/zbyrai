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
