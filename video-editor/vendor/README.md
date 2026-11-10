# vendor: сторонні бібліотеки відео редактора

Що тут: обгортка ffmpeg.wasm. Нічого не змінено, файли взято як є з npm-пакета.

| Що | Версія | Ліцензія | Звідки | Де використовується |
|---|---|---|---|---|
| `ffmpeg/*.js` (клас `FFmpeg`, воркер) | `@ffmpeg/ffmpeg` 0.12.15 | MIT (автор Jerome Wu, проєкт ffmpegwasm) | https://www.npmjs.com/package/@ffmpeg/ffmpeg, https://github.com/ffmpegwasm/ffmpeg.wasm | лежить у репозиторії, бо воркер мусить бути з того ж походження |
| `ffmpeg-core.js` + `ffmpeg-core.wasm` | `@ffmpeg/core` 0.12.10 | GPL-2.0-or-later (збірка FFmpeg з x264, libvpx, lame, opus тощо) | CDN: `cdn.jsdelivr.net/npm/@ffmpeg/core@0.12.10/dist/esm/` (запасний `unpkg.com`) | не лежить у репозиторії (≈32 МБ, понад ліміт Cloudflare Pages 25 МБ); завантажується браузером користувача без змін |

Про ліцензії: сайт не змінює й не вбудовує ядро, а запускає незмінений двійковий файл із CDN; вихідний код ядра і FFmpeg доступний у https://github.com/ffmpegwasm/ffmpeg.wasm та на https://ffmpeg.org. Чужий код в інших місцях не використовувався, решта файлів `video-editor/` написана для цього сайту.

Оновлення: змінити `CORE_VERSION` у `ve-engine.js` і замінити `vendor/ffmpeg/*.js` файлами з `dist/esm` того самого випуску `@ffmpeg/ffmpeg` (потрібна сумісність версій ядра й обгортки; див. https://ffmpegwasm.netlify.app).
