import { File as MegaFile } from "megajs";

const MEGA_FOLDER_URL="https://mega.nz/folder/u7wUyapJ#xO_ENcA9tFP4MIY1hlICaw";
const AUDIO_EXT=/\.(mp3|m4a|ogg|opus|wav|aac|flac)$/i;
let catalogPromise=null;

function parseName(name){
  const base=String(name||"").replace(/\.[^.]+$/,"").trim();
  const match=base.match(/^(.+?)\s+[-–—]\s+(.+)$/);
  if(match)return {artist:match[1].trim(),title:match[2].trim()};
  return {artist:"Ключник",title:base||"Без названия"};
}

function megaAudioUrl(fileId){
  return "mega://"+encodeURIComponent(JSON.stringify({folder:MEGA_FOLDER_URL,id:fileId}));
}

async function loadCatalog(){
  const folder=MegaFile.fromURL(MEGA_FOLDER_URL);
  if(folder.api)folder.api.userAgent=null;
  const loaded=await folder.loadAttributes();
  const children=Array.isArray(loaded?.children)?loaded.children:[];
  return children
    .filter(file=>!file.directory&&AUDIO_EXT.test(file.name||""))
    .map(file=>{
      const {artist,title}=parseName(file.name);
      return {
        id:"mega-key-"+file.nodeId,
        title,
        artist,
        album:"",
        image:"",
        audio:megaAudioUrl(file.nodeId),
        duration:0,
        license:"",
        source:"🔐 Ключник",
        sourceUrl:MEGA_FOLDER_URL,
        genre:"",
        mega:{folder:MEGA_FOLDER_URL,fileId:file.nodeId,name:file.name,size:Number(file.size||0)}
      };
    })
    .sort((a,b)=>a.title.localeCompare(b.title,"ru"));
}

export async function handleMegaLocalMusic(request,env){
  try{
    if(!catalogPromise)catalogPromise=loadCatalog();
    const tracks=await catalogPromise;
    return Response.json({
      ok:true,
      source:"🔐 Ключник",
      provider:"MEGA",
      folder:MEGA_FOLDER_URL,
      tracks:tracks.map(({mega,...track})=>track)
    },{
      headers:{
        "cache-control":"public,max-age=60",
        "access-control-allow-origin":"*"
      }
    });
  }catch(error){
    catalogPromise=null;
    return Response.json({
      ok:false,
      source:"🔐 Ключник",
      provider:"MEGA",
      error:error?.message||"Не удалось получить музыку из MEGA",
      tracks:[]
    },{
      status:502,
      headers:{"access-control-allow-origin":"*"}
    });
  }
}
