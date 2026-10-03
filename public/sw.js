const CACHE_NAME="okmusic-shell-v2";
const AUDIO_CACHE="okmusic-audio-v2";

self.addEventListener("install",event=>{
  self.skipWaiting();
  event.waitUntil(caches.open(CACHE_NAME).then(cache=>cache.add("/")).catch(()=>{}));
});

self.addEventListener("activate",event=>{
  event.waitUntil(
    caches.keys().then(keys=>Promise.all(
      keys.filter(key=>![CACHE_NAME,AUDIO_CACHE].includes(key)).map(key=>caches.delete(key))
    )).then(()=>self.clients.claim())
  );
});

self.addEventListener("message",event=>{
  if(event.data?.type==="SKIP_WAITING")self.skipWaiting();
});

function isAudio(request){
  const url=new URL(request.url);
  return request.method==="GET" &&
    (url.pathname.startsWith("/music/") ||
     url.pathname.startsWith("/api/zaycev/play") ||
     /\.(mp3|m4a|ogg|opus|wav|aac|flac)(?:$|\?)/i.test(url.pathname));
}

self.addEventListener("fetch",event=>{
  const request=event.request;
  if(request.method!=="GET")return;
  const url=new URL(request.url);
  if(url.origin!==self.location.origin)return;

  if(isAudio(request)){
    event.respondWith(
      caches.open(AUDIO_CACHE).then(async cache=>{
        const cached=await cache.match(request);
        if(cached)return cached;
        try{
          return await fetch(request);
        }catch{
          return cached||new Response("Offline audio unavailable",{status:503});
        }
      })
    );
    return;
  }

  if(request.mode==="navigate"){
    event.respondWith(
      fetch(request).then(response=>{
        if(response.ok){
          caches.open(CACHE_NAME).then(cache=>cache.put("/",response.clone())).catch(()=>{});
        }
        return response;
      }).catch(()=>caches.match("/").then(r=>r||new Response("Offline",{status:503})))
    );
  }
});
