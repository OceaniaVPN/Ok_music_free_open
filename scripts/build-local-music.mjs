import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
const root=process.cwd(),musicDir=path.join(root,"music"),publicDir=path.join(root,"public"),publicMusic=path.join(publicDir,"music"),generated=path.join(root,"src","local-music.js");
const audioExt=new Set([".mp3",".m4a",".ogg",".opus",".wav",".aac"]),imageExt=[".jpg",".jpeg",".png",".webp"];
fs.rmSync(publicMusic,{recursive:true,force:true});fs.mkdirSync(publicMusic,{recursive:true});
function walk(dir){if(!fs.existsSync(dir))return [];const out=[];for(const entry of fs.readdirSync(dir,{withFileTypes:true})){if(entry.name.startsWith("."))continue;const full=path.join(dir,entry.name);if(entry.isDirectory())out.push(...walk(full));else out.push(full)}return out}
function encPath(p){return p.split(path.sep).map(encodeURIComponent).join("/")}
function parseName(file){const base=path.basename(file,path.extname(file)),m=base.match(/^(.+?)\s+[-–—]\s+(.+)$/);return m?{artist:m[1].trim(),title:m[2].trim()}:{artist:"Ключник",title:base.trim()}}
function findCover(file){const dir=path.dirname(file),base=path.basename(file,path.extname(file));for(const ext of imageExt){const exact=path.join(dir,base+ext);if(fs.existsSync(exact))return exact}for(const name of ["cover","folder","front"]){for(const ext of imageExt){const candidate=path.join(dir,name+ext);if(fs.existsSync(candidate))return candidate}}return ""}
const tracks=[];
for(const file of walk(musicDir).filter(f=>audioExt.has(path.extname(f).toLowerCase()))){const rel=path.relative(musicDir,file),out=path.join(publicMusic,rel);fs.mkdirSync(path.dirname(out),{recursive:true});fs.copyFileSync(file,out);const meta=parseName(file),relUrl=encPath(rel),hash=crypto.createHash("sha1").update(rel).digest("hex").slice(0,12),cover=findCover(file);let image="";if(cover){const coverRel=path.relative(musicDir,cover),coverOut=path.join(publicMusic,coverRel);fs.mkdirSync(path.dirname(coverOut),{recursive:true});fs.copyFileSync(cover,coverOut);image="/music/"+encPath(coverRel)}tracks.push({id:"key-"+hash,title:meta.title||"Без названия",artist:meta.artist||"Ключник",album:path.basename(path.dirname(rel))==="."?"":path.basename(path.dirname(rel)),image,audio:"/music/"+relUrl,duration:0,license:"",source:"🔑 Ключник",sourceUrl:"/music/"+relUrl,genre:""})}
tracks.sort((a,b)=>a.title.localeCompare(b.title,"ru"));fs.writeFileSync(generated,"export const LOCAL_MUSIC = "+JSON.stringify(tracks,null,2)+";\n");console.log("🔑 Ключник: "+tracks.length+" tracks");
