import { handleApi } from "./api/index.js";
import { handleMegaLocalMusic } from "./api/mega-local.js";
import { handleTelegramWebhook } from "./bot/telegram.js";
import { renderApp } from "./web/app.js";

const MEGA_CLIENT_SCRIPT='<script src="https://unpkg.com/megajs@1.3.10/dist/main.browser-umd.js"></script>';

const MEGA_AUDIO_SCRIPT=`<script>
(()=> {
  const NativePlay=HTMLMediaElement.prototype.play;
  const NativeLoad=HTMLMediaElement.prototype.load;
  const megaCache=new Map();

  function mimeFor(name){
    const ext=String(name||"").split(".").pop().toLowerCase();
    return ({
      mp3:"audio/mpeg",
      m4a:"audio/mp4",
      ogg:"audio/ogg",
      opus:"audio/ogg",
      wav:"audio/wav",
      aac:"audio/aac",
      flac:"audio/flac"
    })[ext]||"audio/mpeg";
  }

  async function resolveMega(element,src){
    const payload=JSON.parse(decodeURIComponent(String(src).slice(7)));
    const fileUrl=payload.folder+"/file/"+payload.id;
    let pending=megaCache.get(fileUrl);

    if(!pending){
      pending=(async()=>{
        if(!window.mega?.File)throw Error("MEGAJS не загрузился");
        const file=window.mega.File.fromURL(fileUrl);
        if(file.api)file.api.userAgent=null;
        await file.loadAttributes();
        const data=await file.downloadBuffer();
        return URL.createObjectURL(new Blob([data],{type:mimeFor(payload.name)}));
      })();
      megaCache.set(fileUrl,pending);
      try{
        const blobUrl=await pending;
        return blobUrl;
      }catch(error){
        megaCache.delete(fileUrl);
        throw error;
      }
    }

    return pending;
  }

  function fixKeynikLabels(root=document){
    const nodes=root.querySelectorAll?.("*")||[];
    for(const node of nodes){
      if(node.childElementCount===0&&typeof node.textContent==="string"&&node.textContent.includes("🔑 Ключник")){
        node.textContent=node.textContent.replaceAll("🔑 Ключник","🔐 Ключник");
      }
    }
  }
  if(document.readyState==="loading"){
    document.addEventListener("DOMContentLoaded",()=>fixKeynikLabels());
  }else{
    fixKeynikLabels();
  }
  new MutationObserver(mutations=>{
    for(const mutation of mutations){
      for(const node of mutation.addedNodes){
        if(node.nodeType===1)fixKeynikLabels(node);
      }
    }
  }).observe(document.documentElement,{childList:true,subtree:true});

  HTMLMediaElement.prototype.load=function(){
    const src=this.getAttribute("src")||"";
    if(src.startsWith("mega://"))return;
    return NativeLoad.call(this);
  };

  HTMLMediaElement.prototype.play=function(){
    const src=this.getAttribute("src")||this.src||"";
    if(!src.startsWith("mega://"))return NativePlay.call(this);

    const element=this;
    return resolveMega(element,src).then(blobUrl=>{
      element.src=blobUrl;
      NativeLoad.call(element);
      return NativePlay.call(element);
    }).catch(error=>{
      console.error("🔐 Ключник / MEGA:",error);
      throw error;
    });
  };
})();
</script>`;

async function renderWithMega(request,env){
  const response=renderApp(request,env);
  const type=response.headers.get("content-type")||"";
  if(!type.includes("text/html"))return response;
  let html=await response.text();
  html=html.replace("</head>",MEGA_CLIENT_SCRIPT+"</head>");
  html=html.replace("</body>",MEGA_AUDIO_SCRIPT+"</body>");
  return new Response(html,{
    status:response.status,
    headers:response.headers
  });
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if(url.pathname==="/api/local-music")return handleMegaLocalMusic(request,env);
    if(url.pathname.startsWith("/api/"))return handleApi(request,env);
    if(url.pathname.startsWith("/music/")&&env.ASSETS)return env.ASSETS.fetch(request);
    if(url.pathname==="/telegram/webhook"&&request.method==="POST"){
      return handleTelegramWebhook(request,env);
    }
    return renderWithMega(request,env);
  }
};
