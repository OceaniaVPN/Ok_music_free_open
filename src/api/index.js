export async function handleApi(request, env) {
  const url = new URL(request.url);

  if (url.pathname === "/api/health") {
    return Response.json({ ok: true, service: env.APP_NAME || "Ok Music" });
  }

  if (url.pathname === "/api/search") {
    const q = (url.searchParams.get("q") || "").trim().toLowerCase();
    const demo = [
      { id: "demo-1", title: "Демо-трек", artist: "Ok Music", src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3" },
      { id: "demo-2", title: "Демо-трек 2", artist: "Ok Music", src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3" }
    ];
    const tracks = q ? demo.filter(t => (t.title + " " + t.artist).toLowerCase().includes(q)) : demo;
    return Response.json({ ok: true, query: q, tracks });
  }

  if (url.pathname === "/api/recommendations") {
    return Response.json({ ok: true, tracks: [] });
  }

  return Response.json({ ok: false, error: "Not found" }, { status: 404 });
}
