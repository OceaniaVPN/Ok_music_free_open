import { handleMegaLocalMusic } from "./api/mega-local.js";
import { handleApi } from "./api/index.js";
import { handleTelegramWebhook } from "./bot/telegram.js";
import { renderApp } from "./web/app.js";

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === "/api/local-music") return handleMegaLocalMusic(request, env);
    if (url.pathname.startsWith("/api/")) return handleApi(request, env);
    if (url.pathname.startsWith("/music/") && env.ASSETS) return env.ASSETS.fetch(request);
    if (url.pathname === "/telegram/webhook" && request.method === "POST") {
      return handleTelegramWebhook(request, env);
    }
    const response=renderApp(request, env);
    const type=response.headers.get("content-type")||"";
    if(!type.includes("text/html"))return response;
    let html=await response.text();
    html=html.replace("</head>","<script src=\"https://unpkg.com/megajs@1.3.10/dist/main.browser-umd.js\"></script><script type=\"module\">\nwindow.__megaMetaReady=import(\"https://esm.unpkg.com/music-metadata@11.16.1\").catch(()=>null);\nwindow.__megaMetaCache=window.__megaMetaCache||new Map();\nwindow.__megaBlobCache=window.__megaBlobCache||new Map();\nfunction __megaMime(name){const ext=String(name||\"\").split(\".\").pop().toLowerCase();return ({mp3:\"audio/mpeg\",m4a:\"audio/mp4\",ogg:\"audio/ogg\",opus:\"audio/ogg\",wav:\"audio/wav\",aac:\"audio/aac\",flac:\"audio/flac\"})[ext]||\"audio/mpeg\"}\nasync function __megaFile(payload){if(!window.mega?.File)throw Error(\"MEGAJS не загрузился\");const file=window.mega.File.fromURL(payload.folder+\"/file/\"+payload.id);if(file.api)file.api.userAgent=null;await file.loadAttributes();return file}\nwindow.__megaEnrichLocalTracks=async function(input){\n const tracks=Array.isArray(input)?input:[],mega=tracks.filter(t=>String(t.audio||\"\").startsWith(\"mega://\"));if(!mega.length)return tracks;\n const mm=await window.__megaMetaReady;if(!mm?.parseBlob)return tracks;\n const work=async t=>{if(window.__megaMetaCache.has(t.id)){Object.assign(t,window.__megaMetaCache.get(t.id));return t}try{\n  const payload=JSON.parse(decodeURIComponent(String(t.audio).slice(7))),file=await __megaFile(payload),data=await file.downloadBuffer();\n  const meta=await mm.parseBlob(new Blob([data],{type:__megaMime(payload.name)}),{skipCovers:false}),common=meta?.common||{};\n  const patch={title:String(common.title||t.title||\"Без названия\").trim(),artist:String(common.artist||t.artist||\"Ключник\").trim(),album:String(common.album||\"\").trim(),duration:Number(meta?.format?.duration||t.duration||0),genre:Array.isArray(common.genre)?common.genre.filter(Boolean).join(\"; \"):String(common.genre||\"\").trim(),fileName:String(file.name||payload.name||t.fileName||\"\")};\n  const picture=Array.isArray(common.picture)&&common.picture[0];if(picture?.data?.length)patch.image=URL.createObjectURL(new Blob([picture.data],{type:picture.format||\"image/jpeg\"}));\n  window.__megaMetaCache.set(t.id,patch);Object.assign(t,patch);\n }catch(error){console.warn(\"🔐 Ключник / MEGA metadata:\",t.fileName||t.title,error)}return t};\n for(let i=0;i<mega.length;i+=2)await Promise.all(mega.slice(i,i+2).map(work));return tracks;\n};\nconst NativePlay=HTMLMediaElement.prototype.play,NativeLoad=HTMLMediaElement.prototype.load;\nasync function __megaResolve(src){const payload=JSON.parse(decodeURIComponent(String(src).slice(7)));if(window.__megaBlobCache.has(payload.id))return window.__megaBlobCache.get(payload.id);const pending=(async()=>{const file=await __megaFile(payload),data=await file.downloadBuffer();return URL.createObjectURL(new Blob([data],{type:__megaMime(payload.name)}))})();window.__megaBlobCache.set(payload.id,pending);try{const url=await pending;window.__megaBlobCache.set(payload.id,url);return url}catch(error){window.__megaBlobCache.delete(payload.id);throw error}}\nHTMLMediaElement.prototype.load=function(){const src=this.getAttribute(\"src\")||\"\";if(src.startsWith(\"mega://\"))return;return NativeLoad.call(this)};\nHTMLMediaElement.prototype.play=function(){const src=this.getAttribute(\"src\")||this.src||\"\";if(!src.startsWith(\"mega://\"))return NativePlay.call(this);const element=this;return __megaResolve(src).then(blobUrl=>{element.src=blobUrl;NativeLoad.call(element);return NativePlay.call(element)}).catch(error=>{console.error(\"🔐 Ключник / MEGA playback:\",error);throw error})};\n</script>"+"</head>");
    return new Response(html,{status:response.status,headers:response.headers});
  }
};
