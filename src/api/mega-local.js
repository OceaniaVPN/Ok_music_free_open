import { File as MegaFile } from "megajs";
import { LOCAL_MUSIC } from "../local-music.js";

const MEGA_FOLDER_URL="https://mega.nz/folder/u7wUyapJ#xO_ENcA9tFP4MIY1hlICaw";
const AUDIO_EXT=/\.(mp3|m4a|ogg|opus|wav|aac|flac)$/i;
let catalogPromise=null;

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
  return children.filter(file=>!file.directory&&AUDIO_EXT.test(file.name||"")).map(file=>{
    const {artist,title}=parseName(file.name);
    return {
      id:"mega-key-"+file.nodeId,title,artist,album:"",image:"",
      audio:megaAudioUrl(file.nodeId,file.name),duration:0,license:"",
      source:"🔐 Ключник",sourceUrl:MEGA_FOLDER_URL,genre:"",
      fileName:String(file.name||""),
      mega:{folder:MEGA_FOLDER_URL,fileId:file.nodeId,name:String(file.name||""),size:Number(file.size||0)}
    };
  }).sort((a,b)=>a.title.localeCompare(b.title,"ru"));
}
export async function handleMegaLocalMusic(){
  try{
    if(!catalogPromise)catalogPromise=loadMegaCatalog();
    const megaTracks=await catalogPromise;
    const githubTracks=LOCAL_MUSIC.map(track=>({...track,source:"🔐 Ключник"}));
    return Response.json({
      ok:true,source:"🔐 Ключник",providers:["GitHub","MEGA"],folder:MEGA_FOLDER_URL,
      tracks:[...githubTracks,...megaTracks.map(({mega,...track})=>track)]
    },{headers:{"cache-control":"public,max-age=60","access-control-allow-origin":"*"}});
  }catch(error){
    catalogPromise=null;
    const githubTracks=LOCAL_MUSIC.map(track=>({...track,source:"🔐 Ключник"}));
    return Response.json({
      ok:true,source:"🔐 Ключник",providers:["GitHub"],folder:MEGA_FOLDER_URL,
      warning:"MEGA: "+(error?.message||"не удалось получить каталог"),tracks:githubTracks
    },{headers:{"cache-control":"public,max-age=30","access-control-allow-origin":"*"}});
  }
}
