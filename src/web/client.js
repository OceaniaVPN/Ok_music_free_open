const view = document.querySelector("#view");
const views = {
  mood: () => `<h2>Моё настроение</h2><p>Подборка на основе твоих лайков и выбранного настроения.</p><button>Следующий трек</button>`,
  search: () => `<h2>Поиск</h2><input id="q" placeholder="Исполнитель или трек"><button id="search">Найти</button><div id="results"></div>`,
  library: () => `<h2>Плейлисты и понравившиеся</h2><p>Здесь появятся твои лайки и плейлисты.</p>`
};
function render(name) {
  view.innerHTML = views[name]();
  if (name === "search") document.querySelector("#search").onclick = async () => {
    const q = document.querySelector("#q").value.trim();
    const r = await fetch("/api/search?q=" + encodeURIComponent(q));
    const data = await r.json();
    document.querySelector("#results").textContent = JSON.stringify(data.tracks);
  };
}
render("mood");
