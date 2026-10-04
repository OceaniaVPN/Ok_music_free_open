from workers import WorkerEntrypoint
from urllib.parse import quote_plus, urljoin
import re

from bs4 import BeautifulSoup
from js import fetch as js_fetch

BASE_URL = "https://eu.hitmoz.com"
STEP = 48
PAGES = 4

HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
    "Accept": "text/html,application/xhtml+xml;q=0.9,*/*;q=0.8",
    "Accept-Language": "ru-RU,ru;q=0.9,en;q=0.7",
    "Referer": BASE_URL + "/",
}

DL_RE = re.compile(r"/get/music/.*\\.mp3", re.I)


def error_message(error):
    return str(error) or error.__class__.__name__


async def fetch_soup(url):
    try:
        response = await js_fetch(url, {
            "headers": HEADERS,
            "redirect": "follow",
        })
        status = int(response.status)
        text = await response.text()
        if status < 200 or status >= 300:
            raise RuntimeError(f"HitMoz HTML HTTP {status}")
        return BeautifulSoup(str(text), "html.parser")
    except Exception as exc:
        raise RuntimeError(f"HitMoz HTML fetch failed: {error_message(exc)}") from exc


def abs_url(href):
    if not href:
        return ""
    return urljoin(BASE_URL + "/", str(href).strip())


def normalize(src):
    if not src:
        return ""
    return abs_url(src)


def find_song_row(link_tag):
    row = link_tag
    for _ in range(8):
        if row.parent is None:
            break
        if len(row.parent.find_all("a", href=DL_RE)) > 1:
            return row
        row = row.parent
    return row


def extract_cover(row):
    if not row:
        return ""

    for image in row.find_all("img"):
        for attr in (
            "src",
            "data-src",
            "data-lazy-src",
            "data-original",
            "data-bg",
            "data-image",
            "data-thumb",
        ):
            src = image.get(attr, "")
            if src and not str(src).startswith("data:"):
                return normalize(src)

    for element in row.find_all(True):
        style = str(element.get("style", ""))
        if "background" in style.lower():
            match = re.search(r'url\(["\']?([^"\')]+)["\']?\)', style, re.I)
            if match:
                return normalize(match.group(1))

    for element in row.find_all(True):
        for attr_name, attr_value in element.attrs.items():
            if not isinstance(attr_value, str):
                continue
            if str(attr_name).startswith("data-") and re.search(
                r"\.(jpg|jpeg|png|webp)", attr_value, re.I
            ):
                return normalize(attr_value)

    if row.parent:
        for image in row.parent.find_all("img", limit=5):
            for attr in ("src", "data-src", "data-lazy-src", "data-original"):
                src = image.get(attr, "")
                if src and not str(src).startswith("data:"):
                    return normalize(src)

    return ""


def extract_song_data(row):
    raw_texts = []
    for value in row.stripped_strings if row else []:
        text = str(value).strip()
        if not text or len(text) < 2:
            continue
        if text.lower() in {
            "скачать",
            "слушать",
            "play",
            "download",
            "хит",
            "★",
            "☆",
        }:
            continue
        raw_texts.append(text)

    duration = ""
    content = []
    for value in raw_texts:
        if re.fullmatch(r"\d{1,2}:\d{2}", value):
            duration = value
        else:
            content.append(value)

    title = content[0] if len(content) >= 1 else ""
    artist = content[1] if len(content) >= 2 else ""
    cover = extract_cover(row)
    return title, artist, duration, cover


def parse_duration(value):
    text = str(value or "").strip()
    parts = text.split(":")
    try:
        numbers = [int(part) for part in parts]
    except ValueError:
        return 0
    if len(numbers) == 3:
        return numbers[0] * 3600 + numbers[1] * 60 + numbers[2]
    if len(numbers) == 2:
        return numbers[0] * 60 + numbers[1]
    return numbers[0] if numbers else 0


def parse_filename(download_url):
    filename = download_url.rsplit("/", 1)[-1]
    filename = re.sub(r"\.mp3$", "", filename, flags=re.I)
    match = re.search(r"_(\d{6,})$", filename)
    song_id = match.group(1) if match else ""
    if match:
        filename = filename[:match.start()]

    if "_-_" in filename:
        artist, title = filename.split("_-_", 1)
        artist = artist.replace("_", " ").strip()
        title = title.replace("_", " ").strip()
    else:
        artist, title = "", filename.replace("_", " ").strip()

    return artist, title, song_id


def parse_page(soup, rank_offset):
    songs = []
    seen = set()

    for anchor in soup.find_all("a", href=DL_RE):
        href = abs_url(anchor.get("href", ""))
        if not href or href in seen:
            continue
        seen.add(href)

        row = find_song_row(anchor)
        title, artist, duration, cover = extract_song_data(row)

        file_artist, file_title, song_id = parse_filename(href)
        if not title:
            title = file_title
        if not artist:
            artist = file_artist

        songs.append(
            {
                "rank": rank_offset + len(songs) + 1,
                "title": title or "Без названия",
                "artist": artist or "Неизвестный исполнитель",
                "duration": duration,
                "cover": cover,
                "download": href,
                "link": f"{BASE_URL}/song/{song_id}" if song_id else "",
            }
        )

    return songs


async def parse_search(query, limit):
    base = f"{BASE_URL}/search?q={quote_plus(query)}"
    urls = [base] + [f"{base}&start={STEP * i}" for i in range(1, PAGES)]

    all_songs = []
    seen_downloads = set()

    for page_url in urls:
        soup = await fetch_soup(page_url)
        new_songs = parse_page(soup, len(all_songs))
        before = len(all_songs)

        for song in new_songs:
            download = song["download"]
            if download in seen_downloads:
                continue
            seen_downloads.add(download)
            song["rank"] = len(all_songs) + 1
            all_songs.append(song)
            if len(all_songs) >= limit:
                break

        if len(all_songs) == before or len(all_songs) >= limit:
            break

    return all_songs[:limit]


async def parse_top_today(limit):
    start_url = BASE_URL + "/songs/top-today"
    pages_urls = [start_url] + [
        f"{start_url}/start/{STEP * i}" for i in range(1, PAGES)
    ]

    all_songs = []
    for page_url in pages_urls:
        soup = await fetch_soup(page_url)
        all_songs.extend(parse_page(soup, len(all_songs)))
        if len(all_songs) >= limit:
            break

    return all_songs[:limit]


class Default(WorkerEntrypoint):
    async def search(self, query: str, limit: int = 30):
        query = str(query or "").strip()
        limit = max(1, min(int(limit or 30), 50))
        if not query:
            raise ValueError("Пустой поисковый запрос")

        songs = await parse_search(query, limit)
        if not songs:
            raise ValueError(f"По запросу «{query}» ничего не найдено")

        return {
            "success": True,
            "mode": "search",
            "query": query,
            "source": f"{BASE_URL}/search?q={quote_plus(query)}",
            "count": len(songs),
            "songs": songs,
        }

    async def top_today(self, limit: int = 192):
        limit = max(1, min(int(limit or 192), 192))
        songs = await parse_top_today(limit)
        if not songs:
            raise ValueError("Треки не найдены")

        return {
            "success": True,
            "mode": "top-today",
            "source": BASE_URL + "/songs/top-today",
            "count": len(songs),
            "songs": songs,
        }
