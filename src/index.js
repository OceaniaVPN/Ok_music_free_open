import { DurableObject } from "cloudflare:workers";
import { handleMegaLocalMusic } from "./api/mega-local.js";
import { handleApi } from "./api/index.js";
import { handleTelegramWebhook } from "./bot/telegram.js";
import { renderApp } from "./web/app.js";
import { handleAuth } from "./auth/telegram.js";

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
const NativePlay=HTMLMediaElement.prototype.play;
const NativeLoad=HTMLMediaElement.prototype.load;
async function __megaResolve(src){
  const payload=JSON.parse(decodeURIComponent(String(src).slice(7)));
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


// Legacy class kept exported so the already-provisioned namespace remains intact.
export class AuthCodes extends DurableObject {
  async fetch(){ return new Response("AuthCodes legacy namespace",{status:404}); }
}

export class AuthCodesV2 extends DurableObject {
  constructor(ctx,env){super(ctx,env);this.ctx=ctx}
  async fetch(request){
    const url=new URL(request.url);
    let body={}; try{body=await request.json()}catch{}
    const ttl=Number(body.ttl)||300;
    const get=key=>this.ctx.storage.get(key);
    const put=(key,value)=>this.ctx.storage.put(key,value,{expiration:Date.now()+ttl*1000});

    if(request.method==="POST"&&url.pathname==="/challenge"){
      if(!body.challenge)return Response.json({ok:false},{status:400});
      await put("challenge:"+String(body.challenge),{created:Date.now()});
      return Response.json({ok:true});
    }
    if(request.method==="POST"&&url.pathname==="/activate"){
      const challenge=String(body.challenge||""),chatId=String(body.chatId||"");
      const ch=challenge?await get("challenge:"+challenge):true;
      if(!ch||!chatId)return Response.json({ok:false},{status:400});
      await put("chat:"+chatId,{challenge});
      return Response.json({ok:true});
    }
    if(request.method==="POST"&&url.pathname==="/active"){
      const chatId=String(body.chatId||"");
      const record=await get("chat:"+chatId);
      return Response.json({ok:true,challenge:record?.challenge||""});
    }
    if(request.method==="POST"&&url.pathname==="/code-cooldown"){
      const chatId=String(body.chatId||"");
      if(!chatId)return Response.json({ok:false},{status:400});
      const key="code-cooldown:"+chatId;
      const now=Date.now();
      const last=Number(await get(key)||0);
      const wait=Math.max(0,1800-Math.floor((now-last)/1000));
      if(wait>0)return Response.json({ok:true,allowed:false,wait});
      await put(key,now);
      return Response.json({ok:true,allowed:true,wait:0});
    }
    if(request.method==="POST"&&url.pathname==="/bind"){
      const challenge=String(body.challenge||"");
      const ch=await get("challenge:"+challenge);
      if(!ch||!body.code||!body.user?.id)return Response.json({ok:false},{status:400});
      await put("code:"+String(body.code),{
        challenge,
        user:body.user,
        chatId:String(body.chatId||"")
      });
      return Response.json({ok:true});
    }
    if(request.method==="POST"&&url.pathname==="/consume"){
      const code=String(body.code||"");
      const record=await get("code:"+code);
      if(!record||(record.challenge&&record.challenge!==String(body.challenge||""))){
        return Response.json({ok:false,error:"Код неверный или уже использован"},{status:401});
      }
      await this.ctx.storage.delete("code:"+code);
      if(record.challenge)await this.ctx.storage.delete("challenge:"+record.challenge);
      if(record.chatId)await this.ctx.storage.delete("chat:"+record.chatId);
      return Response.json({ok:true,user:record.user});
    }
    return Response.json({ok:false},{status:404});
  }
}

export default {
  async fetch(request,env,ctx) {
    const url=new URL(request.url);

    const authResponse=await handleAuth(request,env);
    if(authResponse)return authResponse;

    if (url.pathname==="/api/local-music") return handleMegaLocalMusic(request,env,ctx);
    if (url.pathname.startsWith("/api/")) return handleApi(request,env);
    if (env.ASSETS && (url.pathname === "/sw.js" || url.pathname.startsWith("/music/"))) return env.ASSETS.fetch(request);
    if (url.pathname==="/telegram/webhook" && request.method==="POST") {
      return handleTelegramWebhook(request,env);
    }

    const response=renderApp(request,env);
    const type=response.headers.get("content-type")||"";
    if(!type.includes("text/html"))return response;

    let html=await response.text();
    html=html.replace("</head>",MEGA_RUNTIME+"</head>");

    const headers=new Headers(response.headers);
    headers.set("content-type","text/html; charset=utf-8");
    headers.set("Cache-Control","no-store, no-cache, must-revalidate");
    headers.set("Vary","Accept-Encoding");
    return new Response(html,{status:response.status,headers});
  }
};
