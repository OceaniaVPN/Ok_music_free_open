import { detectKnownArtist, stripKnownArtistPrefix } from "../src/data/artist-detector.js";

const cases = [
  ["Александр Пушной ясный мой свет", "Александр Пушной", "ясный мой свет"],
  ["Arctic Monkeys - Do I Wanna Know?", "Arctic Monkeys", "Do I Wanna Know?"],
  ["Pendulum - Witchcraft", "Pendulum", "Witchcraft"]
];

for (const [input, expectedArtist, expectedTitle] of cases) {
  const artist = detectKnownArtist(input);
  if (artist !== expectedArtist) {
    throw new Error("artist mismatch: " + input + " -> " + artist);
  }
  const split = stripKnownArtistPrefix(input, artist);
  if (split.title !== expectedTitle) {
    throw new Error("title mismatch: " + input + " -> " + split.title);
  }
}

if (detectKnownArtist("совершенно неизвестный артист") !== "") {
  throw new Error("unexpected known artist match");
}

console.log(JSON.stringify({ ok: true, cases: cases.length }));
