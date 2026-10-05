import recommendationArtists from "./recommendation-artists.json" with { type: "json" };

function normalize(value) {
  return String(value || "")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9а-яё]+/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function collect(value, out) {
  if (typeof value === "string") {
    const name = value.trim();
    if (name) out.push(name);
    return;
  }
  if (!value || typeof value !== "object") return;
  if (Array.isArray(value)) {
    for (const item of value) collect(item, out);
    return;
  }
  if (typeof value.name === "string") out.push(value.name.trim());
  if (typeof value.artist === "string") out.push(value.artist.trim());
  for (const item of Object.values(value)) {
    if (item !== value) collect(item, out);
  }
}

const rawArtists = [];
collect(recommendationArtists, rawArtists);

export const KNOWN_ARTISTS = [...new Map(
  rawArtists
    .map(name => [normalize(name), name])
    .filter(([key]) => key.length >= 3)
)].map(([, name]) => name).sort((a, b) => {
  const aw = normalize(a).split(" ").length;
  const bw = normalize(b).split(" ").length;
  if (aw !== bw) return bw - aw;
  return normalize(b).length - normalize(a).length;
});

function startsWithArtist(text, artist) {
  const source = normalize(text);
  const target = normalize(artist);
  if (!source || !target) return false;
  return source === target || source.startsWith(target + " ");
}

export function detectKnownArtist(value) {
  const source = normalize(value);
  if (!source) return "";
  const tokens = source.split(" ");

  for (const artist of KNOWN_ARTISTS) {
    if (startsWithArtist(source, artist)) return artist;
  }

  for (const artist of KNOWN_ARTISTS) {
    const needle = normalize(artist).split(" ");
    if (needle.length > tokens.length) continue;
    for (let i = 0; i <= tokens.length - needle.length; i++) {
      let matched = true;
      for (let j = 0; j < needle.length; j++) {
        if (tokens[i + j] !== needle[j]) {
          matched = false;
          break;
        }
      }
      if (matched) return artist;
    }
  }

  return "";
}

function artistPrefixRegExp(artist) {
  const escaped = String(artist || "")
    .trim()
    .split(/\s+/)
    .map(part => part.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))
    .join("[\\s_-]+");
  if (!escaped) return null;
  return new RegExp("^\\s*" + escaped + "(?:\\s*[-–—:|]+\\s*|\\s+)", "iu");
}

export function stripKnownArtistPrefix(value, artist = detectKnownArtist(value)) {
  const source = String(value || "").trim();
  if (!source || !artist) return { artist: artist || "", title: source };
  const match = source.match(artistPrefixRegExp(artist));
  if (!match) return { artist: "", title: source };
  const title = source.slice(match[0].length).trim();
  return { artist, title };
}
