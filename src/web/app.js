export function renderApp(request, env) {
  return new Response(`<!doctype html>
<html lang="ru">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>${env.APP_NAME || "Ok Music"}</title>
  <link rel="stylesheet" href="/app.css">
</head>
<body>
  <main class="app">
    <header><h1>Ok Music</h1><p>Музыка под твоё настроение</p></header>
    <section id="view" class="view"></section>
    <nav>
      <button data-view="mood">Моё настроение</button>
      <button data-view="search">Поиск</button>
      <button data-view="library">Плейлисты</button>
    </nav>
    <footer>Ok_music_llc<br>© 2026–2027. Все права защищены.<br>Источники: Hitmos.me · Zaycev.net · Zvuch.com · My.Mail.ru Music</footer>
  </main>
  <script type="module" src="/client.js"></script>
</body>
</html>`, { headers: { "content-type": "text/html; charset=utf-8" } });
}
