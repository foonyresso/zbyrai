# vendor: обгортка ffmpeg.wasm

Що тут: `ffmpeg.js` і `814.ffmpeg.js` з пакета `@ffmpeg/ffmpeg@0.12.15` (ліцензія MIT, https://github.com/ffmpegwasm/ffmpeg.wasm), без змін. Це лише невелика обгортка (воркер і клас `FFmpeg`).

Саме ядро (`@ffmpeg/core@0.12.10`: `ffmpeg-core.js` і `ffmpeg-core.wasm`, ~32 МБ, збірка ffmpeg під GPL з lame, vorbis, opus тощо) у репозиторій не кладеться (завелике для хостингу) і завантажується з CDN при першому експорті в MP3/OGG/M4A/FLAC; див. `../ffmpeg-loader.js`.
