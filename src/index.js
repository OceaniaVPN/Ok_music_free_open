import { handleMegaLocalMusic } from "./api/mega-local.js";
import { handleApi } from "./api/index.js";
import { handleTelegramWebhook } from "./bot/telegram.js";
import { renderApp } from "./web/app.js";

const PWA_MANIFEST=JSON.stringify({name:"Ok Music",short_name:"Ok Music",start_url:"/",scope:"/",display:"standalone",background_color:"#050c09",theme_color:"#07140f",description:"Музыкальный веб-плеер с офлайн-треками."});
const SERVICE_WORKER="const CACHE=\"okmusic-shell-v2\";self.addEventListener(\"install\",event=>event.waitUntil(caches.open(CACHE).then(c=>c.addAll([\"/\",\"/manifest.webmanifest\"])).then(()=>self.skipWaiting())));self.addEventListener(\"activate\",event=>event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));self.addEventListener(\"fetch\",event=>{const r=event.request;if(r.method!==\"GET\")return;const u=new URL(r.url);if(u.origin!==self.location.origin||u.pathname.startsWith(\"/api/\")||u.pathname.startsWith(\"/music/\")||u.pathname===\"/sw.js\"||u.pathname.startsWith(\"/__okmusic_offline__/\"))return;if(r.mode===\"navigate\"){event.respondWith((async()=>{try{const n=await fetch(r);const c=await caches.open(CACHE);await c.put(\"/\",n.clone());return n}catch{return (await caches.match(\"/\"))||Response.error()}})());return}event.respondWith((async()=>{const c=await caches.open(CACHE),hit=await c.match(r);if(hit)return hit;try{const n=await fetch(r);if(n.ok)await c.put(r,n.clone());return n}catch{return hit||Response.error()}})())});";

const MEGA_RUNTIME=String.raw`<script>
window.__megaMetaReady=null;
window.__megaMegaReady=null;
window.__megaMetaLoad=function(){
  if(window.__megaMetaReady)return window.__megaMetaReady;
  window.__megaMetaReady=import("https://esm.sh/music-metadata@11.16.1?bundle").catch(error=>{
    console.warn("🔐 Ключник / metadata module:",error);
    return null;
  });
  return window.__megaMetaReady;
};
window.__megaLoadMega=function(){
  if(window.mega?.File)return Promise.resolve(window.mega);
  if(window.__megaMegaReady)return window.__megaMegaReady;
  window.__megaMegaReady=new Promise((resolve,reject)=>{
    const existing=document.querySelector("script[data-okmusic-mega]");
    if(existing){
      existing.addEventListener("load",()=>window.mega?.File?resolve(window.mega):reject(Error("MEGAJS не создал window.mega")),{once:true});
      existing.addEventListener("error",()=>reject(Error("MEGAJS не загрузился")),{once:true});
      return;
    }
    const script=document.createElement("script");
    script.src="https://unpkg.com/megajs@1.3.10/dist/main.browser-umd.js";
    script.async=true;
    script.dataset.okmusicMega="1";
    script.onload=()=>window.mega?.File?resolve(window.mega):reject(Error("MEGAJS не создал window.mega"));
    script.onerror=()=>reject(Error("MEGAJS не загрузился"));
    document.head.appendChild(script);
  });
  return window.__megaMegaReady;
};
function __megaText(value,fallback=""){
  if(Array.isArray(value))return value.filter(Boolean).join(", ").trim()||fallback;
  return String(value??"").trim()||fallback;
}
function __megaDataUrl(blob){
  return new Promise((resolve,reject)=>{
    const reader=new FileReader();
    reader.onload=()=>resolve(String(reader.result||""));
    reader.onerror=reject;
    reader.readAsDataURL(blob);
  });
}
function __megaMime(name){
  const ext=String(name||"").split(".").pop().toLowerCase();
  return ({mp3:"audio/mpeg",m4a:"audio/mp4",ogg:"audio/ogg",opus:"audio/ogg",wav:"audio/wav",aac:"audio/aac",flac:"audio/flac"})[ext]||"audio/mpeg";
}
async function __megaFile(payload){
  await window.__megaLoadMega();
  const mainFile=window.mega.File.fromURL(payload.folder+"/file/"+payload.id);
  if(mainFile.api)mainFile.api.userAgent=null;
  const selected=await mainFile.loadAttributes();
  const file=selected&&typeof selected.downloadBuffer==="function"?selected:mainFile;
  if(!file?.downloadBuffer)throw Error("MEGAJS не вернул файл из общей папки");
  return file;
}
window.__megaEnrichLocalTracks=async function(input,options={}){
  const tracks=Array.isArray(input)?input:[],mega=tracks.filter(t=>String(t.audio||"").startsWith("mega://"));
  if(!mega.length)return tracks;
  const mm=await window.__megaMetaLoad();
  if(!mm?.parseBlob){console.warn("🔐 Ключник: music-metadata не загрузился");return tracks}
  const work=async t=>{
    try{
      const payload=JSON.parse(decodeURIComponent(String(t.audio).slice(7)));
      const key=String(t?.id||payload?.id||"")+"|"+String(t?.fileSize||payload?.size||"")+"|"+String(payload?.name||"");
      window.__megaMetaCache=window.__megaMetaCache||new Map();
      window.__megaMetaStore=window.__megaMetaStore||(()=>{
        try{return JSON.parse(localStorage.getItem("okmusic:mega-meta:v2")||"{}")}catch{return {}}
      })();
      window.__megaBlobCache=window.__megaBlobCache||new Map();
      if(window.__megaMetaCache.has(key)){
        Object.assign(t,window.__megaMetaCache.get(key));
        options?.onTrack?.(t);
        return t;
      }
      const stored=window.__megaMetaStore[key];
      if(stored){
        window.__megaMetaCache.set(key,stored);
        Object.assign(t,stored);
        if(stored.imageData)t.image=stored.imageData;
        options?.onTrack?.(t);
        return t;
      }
      const file=await __megaFile(payload);
      const data=await file.downloadBuffer();
      const meta=await mm.parseBlob(new Blob([data],{type:__megaMime(payload.name)}),{skipCovers:false,duration:true});
      const common=meta?.common||{},format=meta?.format||{};
      const patch={
        title:__megaText(common.title,t.title||"Без названия"),
        artist:__megaText(common.artist,common.albumartist||t.artist||"Ключник"),
        album:__megaText(common.album,""),
        year:Number(common.year||0)||0,
        trackNumber:common.track?.no!=null?String(common.track.no):"",
        discNumber:common.disk?.no!=null?String(common.disk.no):"",
        genre:__megaText(common.genre,""),
        composer:__megaText(common.composer,""),
        duration:Number(format.duration||t.duration||0)||0,
        bitrate:Number(format.bitrate||0)||0,
        format:String(format.codec||format.container||"").trim(),
        fileName:String(file.name||payload.name||t.fileName||""),
        fileSize:Number(file.size||t.fileSize||0)||0
      };
      const picture=Array.isArray(common.picture)&&common.picture[0];
      if(picture?.data?.length){
        const imageBlob=new Blob([picture.data],{type:picture.format||"image/jpeg"});
        patch.image=URL.createObjectURL(imageBlob);
        if(imageBlob.size<=350000)patch.imageData=await __megaDataUrl(imageBlob);
      }
      window.__megaMetaCache.set(key,patch);
      window.__megaMetaStore[key]=Object.fromEntries(Object.entries(patch).filter(([k])=>k!=="image"));
      try{localStorage.setItem("okmusic:mega-meta:v2",JSON.stringify(window.__megaMetaStore))}catch{}
      Object.assign(t,patch);
      options?.onTrack?.(t);
    }catch(error){
      console.warn("🔐 Ключник / MEGA metadata:",t.fileName||t.title,error);
    }
    return t;
  };
  for(let i=0;i<mega.length;i+=2)await Promise.all(mega.slice(i,i+2).map(work));
  return tracks;
};
const OFFLINE_CACHE_NAME="okmusic-audio-v1";
window.__okOfflineKey=id=>new URL("/__okmusic_offline__/"+encodeURIComponent(String(id)),location.origin).href;
window.__okOfflineUrls=window.__okOfflineUrls||new Map();
async function __okOfflineCache(){return await caches.open(OFFLINE_CACHE_NAME)}
window.__okOfflineHas=async id=>{const c=await __okOfflineCache();return !!(await c.match(window.__okOfflineKey(id)))};
window.__okOfflineList=async()=>{const c=await __okOfflineCache(),keys=await c.keys();return keys.map(r=>decodeURIComponent(new URL(r.url).pathname.split("/").pop()||"")).filter(Boolean)};
window.__okOfflineSave=async track=>{if(!track?.id)return;const key=window.__okOfflineKey(track.id),c=await __okOfflineCache();if(await c.match(key))return true;try{if(navigator.storage?.persist)await navigator.storage.persist().catch(()=>{})}catch{}const src=String(track.audio||track.src||"");if(!src)throw Error("У трека нет источника");let response,type="audio/mpeg";if(src.startsWith("mega://")){const payload=JSON.parse(decodeURIComponent(src.slice(7))),file=await __megaFile(payload),data=await file.downloadBuffer();type=__megaMime(payload.name);response=new Response(data,{headers:{"Content-Type":type,"Cache-Control":"public,max-age=31536000"}})}else{response=await fetch(src,{cache:"no-store"});if(!response.ok&&response.type!=="opaque")throw Error("HTTP "+response.status);type=response.headers.get("content-type")||type;if(response.type==="opaque")throw Error("Источник не разрешает офлайн-копирование")}await c.put(key,response.clone());return true};
window.__okOfflineRemove=async id=>{const c=await __okOfflineCache();const key=window.__okOfflineKey(id);await c.delete(key);const u=window.__okOfflineUrls.get(String(id));if(u)try{URL.revokeObjectURL(u)}catch{}window.__okOfflineUrls.delete(String(id))};
window.__okOfflineClear=async()=>{const c=await __okOfflineCache(),keys=await c.keys();for(const k of keys)await c.delete(k);for(const u of window.__okOfflineUrls.values())try{URL.revokeObjectURL(u)}catch{}window.__okOfflineUrls.clear()};
window.__okOfflineResolve=async track=>{if(!track?.id)return null;const id=String(track.id),cachedUrl=window.__okOfflineUrls.get(id);if(cachedUrl)return cachedUrl;const c=await __okOfflineCache(),response=await c.match(window.__okOfflineKey(id));if(!response)return null;const url=URL.createObjectURL(await response.blob());window.__okOfflineUrls.set(id,url);return url};
const NativePlay=HTMLMediaElement.prototype.play;
const NativeLoad=HTMLMediaElement.prototype.load;
async function __megaResolve(src){
  const payload=JSON.parse(decodeURIComponent(String(src).slice(7)));
  const offline=await window.__okOfflineResolve?.({id:payload.id,audio:src});
  if(offline)return offline;
  window.__megaBlobCache=window.__megaBlobCache||new Map();
  if(window.__megaBlobCache.has(payload.id))return window.__megaBlobCache.get(payload.id);
  const pending=(async()=>{
    const file=await __megaFile(payload);
    const data=await file.downloadBuffer();
    return URL.createObjectURL(new Blob([data],{type:__megaMime(payload.name)}));
  })();
  window.__megaBlobCache.set(payload.id,pending);
  try{
    const url=await pending;
    window.__megaBlobCache.set(payload.id,url);
    return url;
  }catch(error){
    window.__megaBlobCache.delete(payload.id);
    throw error;
  }
}
HTMLMediaElement.prototype.load=function(){
  const src=this.getAttribute("src")||"";
  if(src.startsWith("mega://"))return;
  return NativeLoad.call(this);
};
HTMLMediaElement.prototype.play=function(){
  const src=this.getAttribute("src")||this.src||"";
  if(!src.startsWith("mega://"))return NativePlay.call(this);
  const element=this;
  return __megaResolve(src).then(blobUrl=>{
    element.src=blobUrl;
    NativeLoad.call(element);
    return NativePlay.call(element);
  }).catch(error=>{
    console.error("🔐 Ключник / MEGA playback:",error);
    throw error;
  });
};
</script>`;

export default {
  async fetch(request,env,ctx) {
    const url=new URL(request.url);

    if (url.pathname==="/sw.js") return new Response(SERVICE_WORKER,{headers:{"content-type":"application/javascript; charset=utf-8","Cache-Control":"no-cache"}});
    if (url.pathname==="/manifest.webmanifest") return new Response(PWA_MANIFEST,{headers:{"content-type":"application/manifest+json; charset=utf-8","Cache-Control":"public, max-age=3600"}});
    if (url.pathname==="/api/local-music") return handleMegaLocalMusic(request,env,ctx);
    if (url.pathname.startsWith("/api/")) return handleApi(request,env);
    if (url.pathname.startsWith("/music/") && env.ASSETS) return env.ASSETS.fetch(request);
    if (url.pathname==="/telegram/webhook" && request.method==="POST") {
      return handleTelegramWebhook(request,env);
    }

    const response=renderApp(request,env);
    const type=response.headers.get("content-type")||"";
    if(!type.includes("text/html"))return response;

    let html=await response.text();
    html=html.replace("</body>",MEGA_RUNTIME+"</body>");

    const headers=new Headers(response.headers);
    headers.set("content-type","text/html; charset=utf-8");
    headers.set("Cache-Control","no-store, no-cache, must-revalidate");
    headers.set("Pragma","no-cache");
    headers.set("Vary","Accept-Encoding");
    return new Response(html,{status:response.status,headers});
  }
};
