import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { parseFile, selectCover } from "music-metadata";

const root=process.cwd();
const musicDir=path.join(root,"music");
const publicDir=path.join(root,"public");
const publicMusic=path.join(publicDir,"music");
const generated=path.join(root,"src","local-music.js");
const audioExt=new Set([".mp3",".m4a",".ogg",".opus",".wav",".aac"]);
const imageExt=[".jpg",".jpeg",".png",".webp"];

fs.rmSync(publicMusic,{recursive:true,force:true});
fs.mkdirSync(publicMusic,{recursive:true});

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
function findCoverFile(file){
  const dir=path.dirname(file),base=path.basename(file,path.extname(file));
  for(const ext of imageExt){
    const exact=path.join(dir,base+ext);
    if(fs.existsSync(exact))return exact;
  }
  for(const name of ["cover","folder","front"]){
    for(const ext of imageExt){
      const candidate=path.join(dir,name+ext);
      if(fs.existsSync(candidate))return candidate;
    }
  }
  return "";
}
function extensionForMime(mime){
  const m=String(mime||"").toLowerCase();
  if(m.includes("png"))return ".png";
  if(m.includes("webp"))return ".webp";
  if(m.includes("gif"))return ".gif";
  return ".jpg";
}
async function readEmbeddedCover(file,hash){
  try{
    const metadata=await parseFile(file,{skipCovers:false});
    const picture=selectCover(metadata.common?.picture);
    if(!picture?.data?.length)return {metadata,picture:null};
    const name="cover-"+hash+extensionForMime(picture.format);
    const out=path.join(publicMusic,"covers",name);
    fs.mkdirSync(path.dirname(out),{recursive:true});
    fs.writeFileSync(out,picture.data);
    return {metadata,picture:{url:"/music/covers/"+name}};
  }catch(error){
    console.warn("🔐 Ключник metadata:",path.basename(file),error?.message||error);
    return {metadata:null,picture:null};
  }
}
async function main(){
  const tracks=[];
  const files=walk(musicDir).filter(f=>audioExt.has(path.extname(f).toLowerCase()));
  for(const file of files){
    const rel=path.relative(musicDir,file);
    const out=path.join(publicMusic,rel);
    fs.mkdirSync(path.dirname(out),{recursive:true});
    fs.copyFileSync(file,out);
    const hash=crypto.createHash("sha1").update(rel).digest("hex").slice(0,12);
    const parsed=await readEmbeddedCover(file,hash);
    const metadata=parsed.metadata;
    const filenameMeta=parseName(file);
    const artist=metadata?.common?.artist?.trim()||filenameMeta.artist||"Ключник";
    const title=metadata?.common?.title?.trim()||filenameMeta.title||"Без названия";
    const album=metadata?.common?.album?.trim()||(path.basename(path.dirname(rel))==="."?"":path.basename(path.dirname(rel)));
    const duration=Number(metadata?.format?.duration)||0;
    let image=parsed.picture?.url||"";
    if(!image){
      const coverFile=findCoverFile(file);
      if(coverFile){
        const coverRel=path.relative(musicDir,coverFile);
        const coverOut=path.join(publicMusic,coverRel);
        fs.mkdirSync(path.dirname(coverOut),{recursive:true});
        fs.copyFileSync(coverFile,coverOut);
        image="/music/"+encPath(coverRel);
      }
    }
    tracks.push({
      id:"key-"+hash,title,artist,album,image,
      audio:"/music/"+encPath(rel),duration,license:"",
      source:"🔐 Ключник",sourceUrl:"/music/"+encPath(rel),
      genre:Array.isArray(metadata?.common?.genre)?metadata.common.genre.filter(Boolean).join("; "):""
    });
  }
  tracks.sort((a,b)=>a.title.localeCompare(b.title,"ru"));
  fs.writeFileSync(generated,"export const LOCAL_MUSIC = "+JSON.stringify(tracks,null,2)+";\n");
  console.log("🔐 Ключник: "+tracks.length+" tracks, embedded covers extracted");
}
await main();
