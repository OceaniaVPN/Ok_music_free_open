export async function handleApi(request, env) {
  const url = new URL(request.url);

  if (url.pathname === "/api/health") {
    return Response.json({ ok: true, service: env.APP_NAME || "Ok Music" });
  }

  if (url.pathname === "/api/search") {
    const q = (url.searchParams.get("q") || "").trim();
    const zaycevUrl = "https://zaycev.net/search.html?query_search=" + encodeURIComponent(q);
    return Response.json({
      ok: true,
      query: q,
      source: "ZAYCEV.NET",
      sourceUrl: zaycevUrl,
      tracks: q ? [{ id: "zaycev-search", title: "Результаты поиска ZAYCEV.NET", artist: "Открыть оригинальный каталог", source: "ZAYCEV.NET", url: zaycevUrl }] : []
    });
  }

  if (url.pathname === "/api/recommendations") {
    return Response.json({ ok: true, tracks: [] });
  }

  return Response.json({ ok: false, error: "Not found" }, { status: 404 });
}
