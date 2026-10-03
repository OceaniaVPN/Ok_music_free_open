import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const root=process.cwd();
const musicDir=path.join(root,"music");
const generated=path.join(root,"src","local-music.js");
const audioExt=new Set([".mp3",".m4a",".ogg",".opus",".wav",".aac",".flac"]);
const RAW_BASE="https://raw.githubusercontent.com/OceaniaVPN/Ok_music_free_open/main/music/";

function walk(dir){
  if(!fs.existsSync(dir))return [];
  const out=[];
  for(const entry of fs.readdirSync(dir,{withFileTypes:true})){
    if(entry.name.startsWith("."))continue;
    const full=path.join(dir,entry.name);
    if(entry.isDirectory())out.push(...walk(full));
    else out.push(full);
  }
  return out;
}
function encPath(p){return p.split(path.sep).map(encodeURIComponent).join("/")}
function parseName(file){
  const base=path.basename(file,path.extname(file));
  const m=base.match(/^(.+?)\s+[-–—]\s+(.+)$/);
  return m?{artist:m[1].trim(),title:m[2].trim()}:{artist:"Ключник",title:base.trim()};
}
async function main(){
  const tracks=[];
  const files=walk(musicDir).filter(f=>audioExt.has(path.extname(f).toLowerCase()));
  for(const file of files){
    const rel=path.relative(musicDir,file);
    const hash=crypto.createHash("sha1").update(rel).digest("hex").slice(0,12);
    const filenameMeta=parseName(file);
    const audio=RAW_BASE+encPath(rel);
    tracks.push({
      id:"key-"+hash,
      title:filenameMeta.title,
      artist:filenameMeta.artist,
      album:"",
      image:"",
      audio,
      duration:0,
      license:"",
      source:"🔐 Ключник",
      sourceUrl:audio,
      genre:""
    });
  }
  tracks.sort((a,b)=>a.title.localeCompare(b.title,"ru"));
  fs.writeFileSync(generated,"export const LOCAL_MUSIC = "+JSON.stringify(tracks,null,2)+";\n");
  console.log("🔐 Ключник: "+tracks.length+" tracks (manifest-only build; audio stays external)");
}
await main();
