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
    html=html.replace("</head>","<script src=\"https://unpkg.com/megajs@1.3.10/dist/main.browser-umd.js\"></script><script type=\"module\">\nwindow.__megaMetaReady=import(\"https://esm.unpkg.com/music-metadata@11.16.1\").catch(()=>null);\nwindow.__megaEnrichLocalTracks=async function(input){\n const tracks=Array.isArray(input)?input:[], mega=tracks.filter(t=>String(t.audio||\"\").startsWith(\"mega://\"));\n if(!mega.length)return tracks;\n const mm=await window.__megaMetaReady;if(!mm?.parseBlob)return tracks;\n const cache=window.__megaMetaCache||(window.__megaMetaCache=new Map());\n const work=async t=>{\n  if(cache.has(t.id)){Object.assign(t,cache.get(t.id));return t}\n  try{\n   if(!window.mega?.File)throw Error(\"MEGAJS не загрузился\");\n   const payload=JSON.parse(decodeURIComponent(String(t.audio).slice(7)));\n   const file=window.mega.File.fromURL(payload.folder+\"/file/\"+payload.id);\n   if(file.api)file.api.userAgent=null;\n   await file.loadAttributes();\n   const data=await file.downloadBuffer();\n   const ext=String(payload.name||\"\").split(\".\").pop().toLowerCase();\n   const mime=({mp3:\"audio/mpeg\",m4a:\"audio/mp4\",ogg:\"audio/ogg\",opus:\"audio/ogg\",wav:\"audio/wav\",aac:\"audio/aac\",flac:\"audio/flac\"})[ext]||\"audio/mpeg\";\n   const meta=await mm.parseBlob(new Blob([data],{type:mime}),{skipCovers:false});\n   const common=meta?.common||{};\n   const patch={\n    title:String(common.title||t.title||\"Без названия\").trim(),\n    artist:String(common.artist||t.artist||\"Ключник\").trim(),\n    album:String(common.album||\"\").trim(),\n    duration:Number(meta?.format?.duration||t.duration||0),\n    genre:Array.isArray(common.genre)?common.genre.filter(Boolean).join(\"; \"):String(common.genre||\"\").trim(),\n    fileName:String(file.name||payload.name||t.fileName||\"\")\n   };\n   const picture=Array.isArray(common.picture)&&common.picture[0];\n   if(picture?.data?.length)patch.image=URL.createObjectURL(new Blob([picture.data],{type:picture.format||\"image/jpeg\"}));\n   cache.set(t.id,patch);Object.assign(t,patch);\n  }catch(error){console.warn(\"🔐 Ключник / MEGA metadata:\",t.fileName||t.title,error)}\n  return t;\n };\n for(let i=0;i<mega.length;i+=2)await Promise.all(mega.slice(i,i+2).map(work));\n return tracks;\n};\n</script>"+"</head>");
    return new Response(html,{status:response.status,headers:response.headers});
  }
};
