# Ok Music HitMoz Python service

Отдельный Python Worker, который переносит основную логику Shukurov777/hitmoz-parser в Cloudflare Python Workers.

Сохраняется оригинальная схема:
- источник: https://eu.hitmoz.com;
- поиск /search?q=...;
- пагинация по 48;
- поиск прямых /get/music/*.mp3;
- извлечение title / artist / duration / cover;
- fallback из имени MP3;
- выдача success / mode / songs.

Отличие только в рантайме: вместо локального requests.Session() используется встроенный Worker fetch(), потому что subprocess/Python CLI внутри JavaScript Worker запускать нельзя.

RPC-методы:
- search(query, limit)
- top_today(limit)

Основной JS Worker может вызывать этот сервис через Cloudflare Service Binding / RPC.
