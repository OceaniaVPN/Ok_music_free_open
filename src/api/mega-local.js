import { File as MegaFile } from "megajs";
import { LOCAL_MUSIC } from "../local-music.js";

const MEGA_FOLDER_URL="https://mega.nz/folder/u7wUyapJ#xO_ENcA9tFP4MIY1hlICaw";
const AUDIO_EXT=/\.(mp3|m4a|ogg|opus|wav|aac|flac)$/i;

let catalogData=null;
let catalogPromise=null;
let catalogError="";

function parseName(name){
  const filename=String(name||"").trim();
  const base=filename.replace(/\.[^.]+$/,"").trim();
  const match=base.match(/^(.+?)\s+[-–—]\s+(.+)$/);
  if(match)return {artist:match[1].trim(),title:match[2].trim()};
  return {artist:"Ключник",title:base||"Без названия"};
}

function megaAudioUrl(fileId,name){
  return "mega://"+encodeURIComponent(JSON.stringify({folder:MEGA_FOLDER_URL,id:fileId,name}));
}

async function loadMegaCatalog(){
  const folder=MegaFile.fromURL(MEGA_FOLDER_URL);
  if(folder.api)folder.api.userAgent=null;
  const loaded=await folder.loadAttributes();
  const children=Array.isArray(loaded?.children)?loaded.children:[];
  return children
    .filter(file=>!file.directory&&AUDIO_EXT.test(file.name||""))
    .map(file=>{
      const {artist,title}=parseName(file.name);
      return {
        id:"mega-key-"+file.nodeId,title,artist,album:"",image:"",
        audio:megaAudioUrl(file.nodeId,file.name),duration:0,license:"",
        source:"🔐 Ключник",sourceUrl:MEGA_FOLDER_URL,genre:"",year:0,
        trackNumber:"",discNumber:"",composer:"",bitrate:0,format:"",
        fileName:String(file.name||""),fileSize:Number(file.size||0),
        mega:{folder:MEGA_FOLDER_URL,fileId:file.nodeId,name:String(file.name||""),size:Number(file.size||0)}
      };
    })
    .sort((a,b)=>a.title.localeCompare(b.title,"ru"));
}

function warmMegaCatalog(ctx){
  if(catalogData||catalogPromise)return catalogPromise;
  catalogPromise=loadMegaCatalog()
    .then(tracks=>{
      catalogData=tracks;
      catalogError="";
      return tracks;
    })
    .catch(error=>{
      catalogError=String(error?.message||error||"MEGA недоступна");
      return [];
    })
    .finally(()=>{
      catalogPromise=null;
    });
  if(ctx?.waitUntil)ctx.waitUntil(catalogPromise);
  return catalogPromise;
}

function responseTracks(){
  const githubTracks=LOCAL_MUSIC.map(track=>({...track,source:"🔐 Ключник"}));
  const megaTracks=(catalogData||[]).map(({mega,...track})=>track);
  return {githubTracks,megaTracks};
}

export async function handleMegaLocalMusic(request,env,ctx){
  try{
    warmMegaCatalog(ctx);
    const {githubTracks,megaTracks}=responseTracks();
    const ready=Boolean(catalogData);
    return Response.json({
      ok:true,source:"🔐 Ключник",providers:["GitHub",...(ready?["MEGA"]:[])],
      folder:MEGA_FOLDER_URL,tracks:[...githubTracks,...megaTracks],
      mega:{ready,warming:Boolean(catalogPromise),count:megaTracks.length,error:catalogError||""}
    },{
      headers:{
        "cache-control":ready
          ?"public,max-age=60,stale-while-revalidate=300"
          :"public,max-age=5,stale-while-revalidate=30",
        "access-control-allow-origin":"*"
      }
    });
  }catch(error){
    const {githubTracks,megaTracks}=responseTracks();
    return Response.json({
      ok:true,source:"🔐 Ключник",providers:["GitHub",...(megaTracks.length?["MEGA"]:[])],
      folder:MEGA_FOLDER_URL,tracks:[...githubTracks,...megaTracks],
      mega:{ready:Boolean(catalogData),warming:Boolean(catalogPromise),count:megaTracks.length,error:String(error?.message||error||"")}
    },{
      headers:{"cache-control":"public,max-age=10","access-control-allow-origin":"*"}
    });
  }
}
