import { LOCAL_MUSIC } from "../local-music.js";
import recommendationArtists from "../data/recommendation-artists.json" with { type: "json" };
const LOCAL_MUSIC_CATALOG=Array.isArray(LOCAL_MUSIC)?LOCAL_MUSIC:[];

const ZAYCEV_BASE="https://zaycev.net";
const ZAYCEV_SEARCH="https://zaycev.net/search";
const ZAYCEV_TRACK_API="https://zaycev.net/api/external/track";
const ZAYCEV_HEADERS={
  "accept":"application/json, text/plain, */*",
  "accept-language":"ru-RU,ru;q=0.8,en-US;q=0.5,en;q=0.3",
  "content-type":"application/json;charset=utf-8",
  "origin":ZAYCEV_BASE,
  "referer":ZAYCEV_BASE+"/",
  "user-agent":"Mozilla/5.0 (X11; Linux x86_64; rv:129.0) Gecko/20100101 Firefox/129.0"
};

function stripHtml(value){
  return String(value||"").replace(/<script[\s\S]*?<\/script>/gi," ").replace(/<style[\s\S]*?<\/style>/gi," ").replace(/<[^>]+>/g," ").replace(/&nbsp;/gi," ").replace(/&amp;/gi,"&").replace(/&quot;/gi,'"').replace(/&#39;/gi,"'").replace(/&lt;/gi,"<").replace(/&gt;/gi,">").replace(/\s+/g," ").trim();
}
function parseDuration(value){
  const text=String(value||"").trim(), parts=text.split(":").map(Number);
  if(parts.some(Number.isNaN))return 0;
  if(parts.length===3)return parts[0]*3600+parts[1]*60+parts[2];
  if(parts.length===2)return parts[0]*60+parts[1];
  return parts[0]||0;
}
function parseZaycevSearch(html,limit){
  const out=[],seen=new Set();
  const chunks=String(html||"").match(/<(?:li|article|div)\b[^>]*(?:class=["'][^"']*(?:track|song|search|music)[^"']*["'])?[^>]*>[\s\S]*?<\/(?:li|article|div)>/gi)||[String(html||"")];
  for(const chunk of chunks){
    const links=[...chunk.matchAll(/<a\b[^>]*href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi)];
    const trackLink=links.find(x=>/\/pages\/\d+\/\d+\.shtml(?:[?#]|$)/i.test(x[1]));
    if(!trackLink)continue;
    const idm=trackLink[1].match(/\/(\d+)\.shtml(?:[?#]|$)/);if(!idm)continue;
    const id=idm[1];if(seen.has(id))continue;
    const texts=links.map(x=>stripHtml(x[2])).filter(Boolean);
    const title=stripHtml(trackLink[2])||"Без названия";
    const artist=texts.find(x=>x!==title&&x.length<160)||"Неизвестный исполнитель";
    const imgTag=chunk.match(/<(?:img|source)\b[^>]*>/i);
    const attrs=imgTag?imgTag[0]:"";
    const imageMatch=attrs.match(/(?:data-src|data-original|data-lazy-src|poster|src)=["']([^"']+)["']/i);
    const srcsetMatch=attrs.match(/(?:data-srcset|srcset)=["']([^"']+)["']/i);
    const imageCandidates=[imageMatch?.[1],srcsetMatch?srcsetMatch[1].split(",").pop().trim().split(/\s+/)[0]:""].filter(Boolean);
    const image=imageCandidates.find(x=>/cdnimg\.zaycev\.net\/commonImage\/album\//i.test(x)||/\/album\//i.test(x))||imageCandidates[0]||"";
    const dm=stripHtml(chunk).match(/\b(\d{1,2}:\d{2})\b/);
    seen.add(id);out.push({id,title,artist,image,duration:dm?parseDuration(dm[1]):0,sourceUrl:new URL(trackLink[1],ZAYCEV_BASE).href});
    if(out.length>=limit)break;
  }
  if(out.length<limit){
    const source=String(html||"");
    for(const m of source.matchAll(/href=["']([^"']*\/pages\/\d+\/\d+\.shtml[^"']*)["'][^>]*>([\s\S]*?)<\/a>/gi)){
      const idm=m[1].match(/\/(\d+)\.shtml/);if(!idm||seen.has(idm[1]))continue;
      seen.add(idm[1]);out.push({id:idm[1],title:stripHtml(m[2])||"Без названия",artist:"Неизвестный исполнитель",image:"",duration:0,sourceUrl:new URL(m[1],ZAYCEV_BASE).href});
      if(out.length>=limit)break;
    }
  }
  return out;
}
async function fetchZaycevSearch(q,limit){
  const u=new URL(ZAYCEV_SEARCH);u.searchParams.set("query_search",q);u.searchParams.set("type","track");
  const r=await fetch(u,{headers:{"accept":"text/html,application/xhtml+xml","accept-language":"ru-RU,ru;q=0.9,en;q=0.7","referer":ZAYCEV_BASE+"/","user-agent":ZAYCEV_HEADERS["user-agent"]},signal:AbortSignal.timeout(5_500)});
  const html=await r.text();if(!r.ok)throw Error("Zaycev search HTTP "+r.status);
  const found=parseZaycevSearch(html,limit);if(!found.length)throw Error("Zaycev search returned no parsable tracks");
  return found.map(t=>({id:"zaycev-"+t.id,zaycevId:Number(t.id),title:t.title,artist:t.artist,album:"",image:t.image?(new URL(t.image,ZAYCEV_BASE).href):"",audio:"/api/zaycev/play?id="+encodeURIComponent(t.id)+"&page="+encodeURIComponent(t.sourceUrl||""),duration:t.duration||0,license:"",source:"Zaycev.net",sourceUrl:t.sourceUrl,genre:""}));
}
async function zaycevCookieHeader(response){
  try{
    const raw=typeof response.headers.getSetCookie==="function"?response.headers.getSetCookie():[response.headers.get("set-cookie")||""];
    return raw.flatMap(value=>String(value||"").split(/,(?=[^;,=]+=[^;,]+)/))
      .map(value=>value.trim().split(";",1)[0])
      .filter(value=>/^[^=;]+=[^=;]*$/.test(value))
      .join("; ");
  }catch{return ""}
}
async function zaycevFileMeta(ids){
  const r=await fetch(ZAYCEV_TRACK_API+"/filezmeta",{
    method:"POST",headers:ZAYCEV_HEADERS,
    body:JSON.stringify({trackIds:ids.map(String),subscription:false}),
    signal:AbortSignal.timeout(7_000)
  });
  const text=await r.text();
  if(!r.ok)throw Error("Zaycev filezmeta HTTP "+r.status);
  let d;try{d=JSON.parse(text)}catch{throw Error("Zaycev filezmeta returned invalid JSON")}
  return Array.isArray(d?.tracks)?d.tracks:
    Array.isArray(d?.data?.tracks)?d.data.tracks:
    Array.isArray(d?.result?.tracks)?d.result.tracks:[];
}
function zaycevValue(value){
  if(value==null)return "";
  if(typeof value==="string")return value.trim();
  if(typeof value==="number")return String(value);
  if(Array.isArray(value)){
    for(const item of value){const found=zaycevValue(item);if(found)return found}
    return "";
  }
  if(typeof value==="object"){
    for(const key of ["url","href","download","streaming","stream","file","src","path","value"]){
      const found=zaycevValue(value[key]);if(found)return found;
    }
  }
  return "";
}
async function zaycevResolveResponse(response,label){
  const body=(await response.text()).trim();
  if(!response.ok)throw Error("Zaycev "+label+" HTTP "+response.status);
  if(/^https?:\/\//i.test(body))return body;
  try{
    const data=JSON.parse(body);
    const target=zaycevValue(data);
    if(/^https?:\/\//i.test(target))return target;
  }catch{}
  return "";
}
async function zaycevPageAudio(pageUrl){
  if(!pageUrl)return "";
  const response=await fetch(pageUrl,{
    headers:{
      accept:"text/html,application/xhtml+xml",
      "accept-language":"ru-RU,ru;q=0.9,en;q=0.7",
      referer:ZAYCEV_BASE+"/",
      "user-agent":ZAYCEV_HEADERS["user-agent"]
    },
    redirect:"follow",signal:AbortSignal.timeout(7_000)
  });
  const html=await response.text();
  if(!response.ok)throw Error("Zaycev track page HTTP "+response.status);
  const source=html.replace(/\\u0026/g,"&").replace(/\\//g,"/");
  const urls=[
    ...source.matchAll(/https?:\/\/[^"'\s<>]+\.mp3(?:\?[^"'\s<>]*)?/ig),
    ...source.matchAll(/(?:https?:)?\/\/[^"'\s<>]+\.mp3(?:\?[^"'\s<>]*)?/ig)
  ];
  for(const match of urls){
    const raw=match[0];
    try{
      const candidate=new URL(raw,ZAYCEV_BASE).href;
      if(/\.mp3(?:$|[?#])/i.test(candidate))return candidate;
    }catch{}
  }
  return "";
}
async function zaycevPlay(id,pageUrl=""){
  let meta=null;
  try{meta=(await zaycevFileMeta([id]))[0]||null}catch{}
  if(meta){
    const download=zaycevValue(meta.download);
    if(download){
      if(/^https?:\/\//i.test(download))return download;
      const r=await fetch(ZAYCEV_TRACK_API+"/download/"+encodeURIComponent(download),{
        headers:{
          accept:"text/plain,application/json,*/*",
          "user-agent":ZAYCEV_HEADERS["user-agent"],
          referer:pageUrl||ZAYCEV_BASE+"/"
        },
        redirect:"follow",signal:AbortSignal.timeout(7_000)
      });
      const target=await zaycevResolveResponse(r,"download");
      if(target)return target;
    }
    const streaming=zaycevValue(meta.streaming);
    if(streaming){
      if(/^https?:\/\//i.test(streaming))return streaming;
      const r=await fetch(ZAYCEV_TRACK_API+"/play/"+encodeURIComponent(streaming),{
        headers:ZAYCEV_HEADERS,redirect:"follow",signal:AbortSignal.timeout(7_000)
      });
      const target=await zaycevResolveResponse(r,"stream");
      if(target)return target;
    }
  }
  const pageTarget=await zaycevPageAudio(pageUrl);
  if(pageTarget)return pageTarget;
  throw Error("Zaycev playback URL missing");
}

const HITMOTOP_BASES=["https://hitmos.me","https://hitmos.fm","https://eu.hitmoz.com","https://ru.hitmoz.org","https://rus.hitmoz.org"];
// Public deployment of the open-source Shukurov777/hitmoz-parser project.
// It runs the original Python + BeautifulSoup parser outside the Cloudflare Worker.
const HITMOZ_PARSER_API_BASE="https://bakha.me/";
const PROVIDER_CACHE=new Map();
const PROVIDER_CACHE_TTL=45_000;
const PROVIDER_TIMEOUT_MS=6_500;
function providerCacheKey(provider,q,limit){return provider+"|"+String(q||"").trim().toLowerCase()+"|"+String(limit||0)}
function withTimeout(promise,ms,label){
  return new Promise((resolve,reject)=>{
    let settled=false;
    const timer=setTimeout(()=>{if(settled)return;settled=true;reject(Error(label+" timeout"))},ms);
    Promise.resolve(promise).then(value=>{
      if(settled)return;settled=true;clearTimeout(timer);resolve(value);
    },error=>{
      if(settled)return;settled=true;clearTimeout(timer);reject(error);
    });
  });
}
async function cachedProviderSearch(provider,q,limit,loader,timeoutMs=PROVIDER_TIMEOUT_MS){
  const key=providerCacheKey(provider,q,limit),now=Date.now(),hit=PROVIDER_CACHE.get(key);
  if(hit&&now-hit.time<PROVIDER_CACHE_TTL&&"value" in hit)return hit.value;
  if(hit?.promise)return hit.promise;
  const promise=(async()=>{
    try{
      const value=await withTimeout(loader(),timeoutMs,provider);
      PROVIDER_CACHE.set(key,{time:Date.now(),value});
      if(PROVIDER_CACHE.size>48){
        const oldest=[...PROVIDER_CACHE.entries()].sort((a,b)=>a[1].time-b[1].time)[0];
        if(oldest)PROVIDER_CACHE.delete(oldest[0]);
      }
      return value;
    }catch(error){PROVIDER_CACHE.delete(key);throw error}
  })();
  PROVIDER_CACHE.set(key,{time:now,promise});
  return promise;
}

const HITMOTOP_HEADERS={
  "accept":"text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
  "accept-language":"ru-RU,ru;q=0.8,en-US;q=0.5,en;q=0.3",
  "cache-control":"no-cache",
  "user-agent":"Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0 Safari/537.36"
};

function hitmotopAbsoluteUrl(value,base){
  const raw=String(value||"").trim();
  if(!raw)return "";
  try{return new URL(raw,base).href}catch{return ""}
}

function hitmotopCookieHeader(response){
  try{
    const values=typeof response.headers.getSetCookie==="function"?response.headers.getSetCookie():[response.headers.get("set-cookie")||""];
    return values
      .flatMap(value=>String(value||"").split(/,(?=[^;,=]+=[^;,]+)/))
      .map(value=>value.trim().split(";",1)[0])
      .filter(value=>/^[^=;]+=[^=;]*$/.test(value))
      .join("; ");
  }catch{return ""}
}

function hitmotopExtractAttr(tag,name){
  const wanted=String(name||"").toLowerCase();
  for(const match of String(tag||"").matchAll(/([A-Za-z0-9:-]+)\s*=\s*["']([^"']+)["']/g)){
    if(String(match[1]).toLowerCase()===wanted)return match[2];
  }
  return "";
}

function hitmotopExtractImageFromTag(tag,base){
  const style=hitmotopExtractAttr(tag,"style");
  const direct=hitmotopExtractAttr(tag,"src")||hitmotopExtractAttr(tag,"data-src")||hitmotopExtractAttr(tag,"data-original");
  const fromStyle=style.match(/url\(\s*["']?([^"')]+)["']?\s*\)/i);
  const image=fromStyle?.[1]||direct;
  return image?hitmotopAbsoluteUrl(image,base):"";
}

function hitmotopFilenameMeta(downloadUrl){
  try{
    const url=new URL(downloadUrl);
    let filename=decodeURIComponent(url.pathname.split("/").pop()||"").replace(/\.mp3$/i,"");
    filename=filename.replace(/_\d{6,}$/,"").trim();
    const parts=filename.split(/_-_| - |—/).map(x=>x.replace(/_/g," ").trim()).filter(Boolean);
    if(parts.length>=2){
      return {artist:parts[0],title:parts.slice(1).join(" - ")};
    }
    return {artist:"",title:filename.replace(/_/g," ").trim()};
  }catch{return {artist:"",title:""}}
}
function hitmotopBuildTrack(raw,base){
  const downloadHref=hitmotopExtractAttr(raw.download||"","href")||String(raw.download||"");
  const infoHref=hitmotopExtractAttr(raw.info||"","href")||String(raw.info||"");
  const urlDown=hitmotopAbsoluteUrl(downloadHref,base);
  const pageUrl=hitmotopAbsoluteUrl(infoHref,base);
  if(!urlDown)return null;
  let title=stripHtml(raw.title||"").replace(/[/\\:*?"<>|]/g,"").trim();
  let artist=stripHtml(raw.artist||"").trim();
  const fallback=hitmotopFilenameMeta(urlDown);
  if(!title||title==="Без названия"||title==="Неизвестный исполнитель"||recommendationText(title)===recommendationText(artist)){
    title=fallback.title||title||"Без названия";
  }
  if(!artist||artist==="Неизвестный исполнитель"||recommendationText(title)===recommendationText(artist)){
    artist=fallback.artist||artist||"Неизвестный исполнитель";
  }
  const duration=parseDuration(String(raw.duration||"").match(/\b\d{1,2}:\d{2}(?::\d{2})?\b/)?.[0]||"");
  const image=hitmotopExtractImageFromTag(raw.image||"",base);
  const key=pageUrl||urlDown;
  const idPart=(key.match(/\/([^/?#]+)(?:[?#]|$)/)?.[1]||key).replace(/[^a-zA-Z0-9_-]/g,"-").slice(-140);
  return {id:"hitmotop-"+idPart,title,artist,album:"",image,audio:"/api/hitmotop/play?url="+encodeURIComponent(urlDown)+"&page="+encodeURIComponent(pageUrl||""),duration,license:"",source:"Hitmotop",sourceUrl:pageUrl||urlDown,genre:"",downloadUrl:urlDown};
}
function parseHitmotopSearch(html,base,limit){
  const source=String(html||""),out=[],seen=new Set();
  const cards=source.match(/<li\b[^>]*class=["'][^"']*\btracks__item\b[^"']*["'][\s\S]*?<\/li>/gi)||[];
  for(const card of cards){
    if(out.length>=limit)break;
    const title=card.match(/<div\b[^>]*class=["'][^"']*\btrack__title\b[^"']*["'][^>]*>([\s\S]*?)<\/div>/i)?.[1]||"";
    const artist=card.match(/<div\b[^>]*class=["'][^"']*\btrack__desc\b[^"']*["'][^>]*>([\s\S]*?)<\/div>/i)?.[1]||"";
    const duration=card.match(/<div\b[^>]*class=["'][^"']*\btrack__fulltime\b[^"']*["'][^>]*>([\s\S]*?)<\/div>/i)?.[1]||"";
    const image=card.match(/<div\b[^>]*class=["'][^"']*\btrack__img\b[^"']*["'][^>]*>/i)?.[0]||"";
    const download=card.match(/<a\b[^>]*class=["'][^"']*\btrack__download-btn\b[^"']*["'][^>]*>/i)?.[0]||"";
    const info=card.match(/<a\b[^>]*class=["'][^"']*\btrack__info-l\b[^"']*["'][^>]*>/i)?.[0]||"";
    const track=hitmotopBuildTrack({title,artist,duration,image,download,info},base);
    if(track&&!seen.has(track.id)){seen.add(track.id);out.push(track)}
  }
  if(out.length>=limit)return out;
  const collect=(re)=>[...source.matchAll(re)].map(m=>m[1]);
  const titles=collect(/<div\b[^>]*class=["'][^"']*\btrack__title\b[^"']*["'][^>]*>([\s\S]*?)<\/div>/gi);
  const artists=collect(/<div\b[^>]*class=["'][^"']*\btrack__desc\b[^"']*["'][^>]*>([\s\S]*?)<\/div>/gi);
  const durations=collect(/<div\b[^>]*class=["'][^"']*\btrack__fulltime\b[^"']*["'][^>]*>([\s\S]*?)<\/div>/gi);
  const images=collect(/<div\b[^>]*class=["'][^"']*\btrack__img\b[^"']*["'][^>]*>/gi);
  const downloads=collect(/<a\b[^>]*class=["'][^"']*\btrack__download-btn\b[^"']*["'][^>]*>/gi);
  const infoLinks=collect(/<a\b[^>]*class=["'][^"']*\btrack__info-l\b[^"']*["'][^>]*>/gi);
  const count=Math.min(limit,titles.length,artists.length,durations.length,images.length,downloads.length,infoLinks.length);
  for(let i=0;i<count&&out.length<limit;i++){
    const track=hitmotopBuildTrack({title:titles[i],artist:artists[i],duration:durations[i],image:images[i],download:downloads[i],info:infoLinks[i]},base);
    if(track&&!seen.has(track.id)){seen.add(track.id);out.push(track)}
  }
  if(out.length<limit){
    const seenUrls=new Set(out.map(t=>t.downloadUrl).filter(Boolean));
    for(const match of source.matchAll(/href=["']([^"']+)["']/gi)){
      if(out.length>=limit)break;
      const rawHref=match[1]||"";
      if(!/\/get\/music\/[^"']+\.mp3(?:[?#]|$)/i.test(rawHref))continue;
      const urlDown=hitmotopAbsoluteUrl(rawHref,base);
      if(!urlDown||seenUrls.has(urlDown))continue;
      seenUrls.add(urlDown);
      const fallback=hitmotopFilenameMeta(urlDown);
      const key=urlDown,id="hitmotop-"+Math.abs([...key].reduce((h,c)=>((h<<5)-h+c.charCodeAt(0))|0,0));
      out.push({id,title:fallback.title||"Без названия",artist:fallback.artist||"Неизвестный исполнитель",album:"",image:"",audio:"/api/hitmotop/play?url="+encodeURIComponent(urlDown),duration:0,license:"",source:"Hitmotop",sourceUrl:urlDown,genre:"",downloadUrl:urlDown});
    }
  }
  return out;
}

async function hitmotopSearchRequest(searchUrl,headers,limit){
  const response=await fetch(searchUrl,{headers,redirect:"follow",signal:AbortSignal.timeout(4_500)});
  const html=await response.text();
  if(!response.ok)throw Error("Hitmo search HTTP "+response.status);
  const finalBase=new URL(response.url||searchUrl).origin;
  const tracks=parseHitmotopSearch(html,finalBase,limit);
  if(!tracks.length)throw Error("Hitmo search returned no parsable tracks");
  return tracks;
}
async function hitmotopHtmlProviderSearch(base,q,limit){
  const home=await fetch(base+"/",{headers:HITMOTOP_HEADERS,redirect:"follow",signal:AbortSignal.timeout(4_500)});
  if(!home.ok)throw Error("Hitmo home HTTP "+home.status);
  const origin=new URL(home.url||base).origin;
  let cookie=hitmotopCookieHeader(home);
  const headers={...HITMOTOP_HEADERS,referer:origin+"/"};
  if(cookie)headers.cookie=cookie;
  const params=["q","search","query"];
  let lastError=null;
  for(const key of params){
    try{
      const search=new URL("/search",origin);
      search.searchParams.set(key,q);
      const tracks=await hitmotopSearchRequest(search.href,headers,limit);
      if(tracks.length)return tracks;
    }catch(error){lastError=error}
  }
  throw lastError||Error("Hitmo search unavailable");
}

function normalizeHitmozParserSongs(data,limit){
  if(data?.success!==true||!Array.isArray(data.songs))throw Error(data?.error||"HitMoz parser returned no songs");
  const out=[],seen=new Set();
  for(const song of data.songs.slice(0,limit)){
    const downloadUrl=hitmotopAbsoluteUrl(song?.download,"https://eu.hitmoz.com");
    const sourceUrl=hitmotopAbsoluteUrl(song?.link,"https://eu.hitmoz.com");
    if(!downloadUrl||seen.has(downloadUrl))continue;
    const target=new URL(downloadUrl);
    const host=target.hostname.toLowerCase();
    const audioAllowed=host==="eu.hitmoz.com"||host.endsWith(".eu.hitmoz.com")||host==="ru.hitmoz.org"||host.endsWith(".ru.hitmoz.org")||host==="rus.hitmoz.org"||host.endsWith(".rus.hitmoz.org")||host==="hitmos.me"||host.endsWith(".hitmos.me")||host==="hitmos.fm"||host.endsWith(".hitmos.fm");
    if(!audioAllowed||!target.pathname.toLowerCase().startsWith("/get/music/")||!target.pathname.toLowerCase().endsWith(".mp3"))continue;
    seen.add(downloadUrl);
    const idMatch=sourceUrl.match(/\/song\/(\d+)/i);
    const fileId=downloadUrl.match(/_(\d{6,})\.mp3(?:$|[?#])/i)?.[1];
    const id=idMatch?.[1]||fileId||String(out.length+1);
    let image="";
    const cover=String(song?.cover||song?.image||song?.cover_url||song?.thumbnail||song?.album_image||"").trim();
    if(cover){
      try{
        const u=new URL(cover,downloadUrl),h=u.hostname.toLowerCase();
        if(h==="eu.hitmoz.com"||h.endsWith(".eu.hitmoz.com")||h==="statcore.hitmcdn.com"||h.endsWith(".hitmcdn.com"))image=u.href;
      }catch{}
    }
    const filenameMeta=hitmotopFilenameMeta(downloadUrl);
    let title=stripHtml(song?.title||song?.name)||"Без названия";
    let artist=stripHtml(song?.artist||song?.author||song?.artist_name)||"Неизвестный исполнитель";
    if(!title||title==="Без названия"||recommendationText(title)===recommendationText(artist))title=filenameMeta.title||title;
    if(!artist||artist==="Неизвестный исполнитель"||recommendationText(title)===recommendationText(artist))artist=filenameMeta.artist||artist;
    out.push({
      id:"hitmotop-"+id,
      title,
      artist,
      album:"",
      image,
      audio:"/api/hitmotop/play?url="+encodeURIComponent(downloadUrl)+"&page="+encodeURIComponent(sourceUrl||""),
      duration:parseDuration(String(song?.duration||"")),
      license:"",
      source:"Hitmotop",
      sourceUrl:sourceUrl||downloadUrl,
      genre:"",
      downloadUrl
    });
  }
  if(!out.length)throw Error("HitMoz parser returned no usable tracks");
  return out;
}

async function fetchHitmozPython(q,limit,env){
  const rpc=env?.HITMOZ_PYTHON;
  if(!rpc||typeof rpc.search!=="function")throw Error("HitMoz Python service is not configured");
  const data=await withTimeout(rpc.search(q,limit),5_500,"HitMoz Python service");
  return normalizeHitmozParserSongs(data,limit);
}

async function fetchHitmozParserApi(q,limit){
  const api=new URL(HITMOZ_PARSER_API_BASE);
  api.searchParams.set("search",q);
  const response=await fetch(api.href,{signal:AbortSignal.timeout(5_500),headers:{
    accept:"application/json",
    "accept-language":"ru-RU,ru;q=0.9,en;q=0.7",
    "user-agent":HITMOTOP_HEADERS["user-agent"]
  },redirect:"follow"});
  const body=await response.text();
  if(!response.ok)throw Error("HitMoz parser API HTTP "+response.status);
  let data;
  try{data=JSON.parse(body)}catch{throw Error("HitMoz parser API returned invalid JSON")}
  return normalizeHitmozParserSongs(data,limit);
}

async function fetchHitmotopSearch(q,limit,env){
  let lastError=null;
  // Parser API is preferred because it returns the title/artist/cover/file as
  // one record. HTML array-parsing can mix metadata when cards are lazy-loaded.
  try{return await fetchHitmozParserApi(q,limit)}catch(error){lastError=error}
  try{return await fetchHitmozPython(q,limit,env)}catch(error){lastError=error}
  const bases=HITMOTOP_BASES.slice(0,3);
  const attempts=await Promise.allSettled(bases.map(base=>hitmotopHtmlProviderSearch(base,q,limit)));
  for(const attempt of attempts){
    if(attempt.status==="fulfilled"&&attempt.value?.length)return attempt.value;
    if(attempt.status==="rejected")lastError=attempt.reason;
  }
  throw lastError||Error("Hitmo unavailable");
}

async function hitmotopPlaybackUrl(rawUrl){
  let target;
  try{target=new URL(rawUrl)}catch{throw Error("Invalid Hitmotop audio URL")}
  const host=target.hostname.toLowerCase();
  const allowed=host==="eu.hitmoz.com"||host.endsWith(".eu.hitmoz.com")||
    host==="ru.hitmoz.org"||host.endsWith(".ru.hitmoz.org")||
    host==="rus.hitmoz.org"||host.endsWith(".rus.hitmoz.org")||
    host==="hitmos.me"||host.endsWith(".hitmos.me")||
    host==="hitmos.fm"||host.endsWith(".hitmos.fm")||
    host==="hitmotop.com"||host.endsWith(".hitmotop.com");
  if(!allowed||!/^https?:$/.test(target.protocol))throw Error("Hitmotop audio host is not allowed");
  try{
    const probe=await fetch(target.href,{
      method:"HEAD",
      headers:{...HITMOTOP_HEADERS,accept:"audio/mpeg,audio/*,*/*;q=0.8"},
      redirect:"follow",signal:AbortSignal.timeout(4_500)
    });
    if(probe.ok)return probe.url||target.href;
  }catch{}
  try{
    const probe=await fetch(target.href,{
      headers:{...HITMOTOP_HEADERS,accept:"audio/mpeg,audio/*,*/*;q=0.8",range:"bytes=0-0"},
      redirect:"follow",signal:AbortSignal.timeout(4_500)
    });
    const finalUrl=probe.url||target.href;
    try{await probe.body?.cancel()}catch{}
    return finalUrl;
  }catch{return target.href}
}

function trackDedupeKey(track) {
  const normalize = value => String(value || "")
    .normalize("NFKD")
    .replace(/[\\u0300-\\u036f]/g, "")
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/\\b(feat(?:uring)?|ft)\\.?.*$/i, "")
    .replace(/[^a-z0-9а-яё]+/gi, " ")
    .replace(/\\s+/g, " ")
    .trim();

  const artist = normalize(track?.artist);
  const title = normalize(track?.title);
  return artist && title ? artist + " | " + title : "";
}

function uniqueTracks(tracks, limit) {
  const seenIds = new Set();
  const seenSongs = new Set();
  return tracks.filter(track => {
    if (!track?.id || seenIds.has(track.id)) return false;
    const key = trackDedupeKey(track);
    if (key && seenSongs.has(key)) return false;
    seenIds.add(track.id);
    if (key) seenSongs.add(key);
    return true;
  }).slice(0, limit);
}

function hasPlayableTrackAudio(track){
  return Boolean(track?.zaycevId||String(track?.audio||"").trim()||String(track?.src||"").trim());
}
function mergeProviderTracks(providerLists, limit) {
  const out = [];
  const seenIds = new Set();
  const seenSongs = new Set();
  // Prefer Jamendo for the first result because its stream is now served
  // through our same-origin Worker proxy; keep all other providers available.
  const lists = providerLists.filter(Array.isArray);
  if(lists.length===3){
    // Incoming order: Zaycev, Jamendo, Hitmotop.
    [lists[0],lists[1]]=[lists[1],lists[0]];
  }
  let cursor = 0;

  const available = () => lists.some(list => list.some(track => {
    if (!track?.id || seenIds.has(track.id)) return false;
    const key = trackDedupeKey(track);
    return !key || !seenSongs.has(key);
  }));

  while (out.length < limit && available()) {
    const list = lists[cursor % lists.length];
    cursor++;

    const track = list.find(item => {
      if (!item?.id || seenIds.has(item.id) || !hasPlayableTrackAudio(item)) return false;
      const key = trackDedupeKey(item);
      return !key || !seenSongs.has(key);
    });
    if (!track) continue;

    seenIds.add(track.id);
    const key = trackDedupeKey(track);
    if (key) seenSongs.add(key);
    out.push(track);
  }

  return out;
}

function normalizeJamendo(t) {
  return {
    id: "jamendo-" + t.id,
    jamendoId: Number(t.id)||0,
    title: t.name || "Без названия",
    artist: t.artist_name || "Неизвестный исполнитель",
    album: t.album_name || "",
    image: t.image || t.album_image || "",
    audio: t.id?"/api/jamendo/play?id="+encodeURIComponent(String(t.id)):"",
    duration: Number(t.duration || 0),
    license: t.license_ccurl || "",
    source: "Jamendo",
    sourceUrl: t.shareurl || ("https://www.jamendo.com/track/" + t.id),
    genre: t.musicinfo?.tags?.genres?.[0] || ""
  };
}

async function searchJamendo(q, limit, env) {
  const clientId = env.JAMENDO_CLIENT_ID;
  if (!clientId) return [];

  const api = new URL("https://api.jamendo.com/v3.0/tracks/");
  api.searchParams.set("client_id", clientId);
  api.searchParams.set("format", "json");
  api.searchParams.set("limit", String(limit));
  api.searchParams.set("search", q);
  api.searchParams.set("type", "single albumtrack");
  api.searchParams.set("imagesize", "300");
  api.searchParams.set("audioformat", "mp32");
  api.searchParams.set("include", "musicinfo");
  api.searchParams.set("order", "relevance");

  const response = await fetch(api, { headers: { accept: "application/json" } });
  if (!response.ok) throw new Error("Jamendo HTTP " + response.status);
  const data = await response.json();
  return (data.results || []).filter(t => !isChartLikeTrack(t)).map(normalizeJamendo).filter(t => t.audio);
}

function isChartLikeTrack(t){
  const raw=[t?.sourceUrl,t?.shareurl,t?.name,t?.album_name].map(v=>String(v||"")).join(" ").toLowerCase();
  return /(?:^|[\s\/_-])(chart|charts|top\s*tracks?|top\s*music|trending|trend|weekly|week|popular\s*this\s*week|топ|чарт|недель)/i.test(raw);
}
function recommendationText(value){
  return String(value||"").normalize("NFKD").replace(/[\u0300-\u036f]/g,"").toLowerCase().replace(/&/g," and ").replace(/[^a-z0-9а-яё]+/gi," ").replace(/\s+/g," ").trim();
}
const RECOMMENDATION_VOCAB={
  "русский рэп":["russian rap","hip hop","rap"],
  "поп":["pop"],
  "рок":["rock","alternative rock"],
  "электроника":["electronic","electro","edm"],
  "хип-хоп":["hip hop","rap"],
  "фонк":["phonk","drift phonk"],
  "r&b":["rnb","r&b","soul"],
  "lo-fi":["lofi","chill","beats"],
  "инди":["indie","indie pop","alternative"],
  "метал":["metal","heavy metal"],
  "классика":["classical"],
  "джаз":["jazz"],
  "k-pop":["k-pop","korean pop"],
  "спокойно":["chill","calm","ambient"],
  "энергично":["energetic","dance","upbeat"],
  "грустно":["sad","melancholic","emotional"],
  "романтично":["romantic","love","soft"],
  "ночью":["night","late night","dark"],
  "для дороги":["road trip","driving"],
  "вечеринка":["party","dance"],
  "фонк":["phonk","drift"]
};
const RECOMMENDATION_ARTIST_POOLS=recommendationArtists&&typeof recommendationArtists==="object"?recommendationArtists:{};function recommendationGenreKey(value){
  const text=recommendationText(value);
  if(!text)return "";
  if(RECOMMENDATION_ARTIST_POOLS[text])return text;
  for(const key of Object.keys(RECOMMENDATION_ARTIST_POOLS)){
    if((RECOMMENDATION_VOCAB[key]||[]).some(alias=>recommendationText(alias)===text))return key;
  }
  return "";
}
function recommendationGenreKeys(values){
  return recommendationUnique(values.map(recommendationGenreKey).filter(Boolean));
}
function recommendationArtistName(value){
  if(typeof value==="string")return value.trim();
  if(!value||typeof value!=="object")return "";
  return String(value.name||value.artist||"").trim();
}
function recommendationKnownArtists(keys,salt,count=2){
  const pool=keys.flatMap(key=>{
    const value=RECOMMENDATION_ARTIST_POOLS[key];
    const artists=Array.isArray(value)?value:(Array.isArray(value?.artists)?value.artists:[]);
    return artists.map(recommendationArtistName).filter(Boolean);
  });
  const unique=recommendationUnique(pool);
  return unique.sort((a,b)=>{
    const sa=recommendationHash(String(salt)+"|known|"+a);
    const sb=recommendationHash(String(salt)+"|known|"+b);
    return sa-sb;
  }).slice(0,Math.max(0,count));
}
function recommendationArtistMatches(value,set){
  const text=recommendationText(recommendationArtistName(value)||value);
  if(!text)return false;
  for(const artist of set){
    const known=recommendationText(recommendationArtistName(artist)||artist);
    if(text===known||text.includes(known)||known.includes(text))return true;
  }
  return false;
}
function normalizeArtistName(value){
  return recommendationText(String(value||""))
    .replace(/\b(feat\.?|ft\.?|featuring|with)\b.*$/i,"")
    .replace(/\s*[-–—]\s*(official|music|topic|vevo)\b.*$/i,"")
    .trim();
}
function normalizeRecommendationTrack(track){
  if(!track||typeof track!=="object")return track;
  const artist=String(track.artist||"").trim();
  let title=String(track.title||"").trim();
  if(artist&&title){
    const titleLower=title.toLowerCase();
    const artistLower=artist.toLowerCase();
    for(const sep of [" - "," — "," – ",": "," | "]){
      const prefix=artistLower+sep;
      if(titleLower.startsWith(prefix)){title=title.slice(prefix.length).trim();break}
    }
  }
  if(artist&&title&&recommendationText(artist)===recommendationText(title)&&track.source==="Hitmotop"&&track.downloadUrl){
    try{
      let filename=decodeURIComponent(new URL(track.downloadUrl).pathname.split("/").pop()||"")
        .replace(/\.mp3$/i,"").replace(/_\d{6,}$/i,"");
      const parts=filename.split(/_-_| - |—/).map(x=>x.replace(/_/g," ").trim()).filter(Boolean);
      if(parts.length>=2)title=parts.slice(1).join(" - ").trim();
    }catch{}
  }
  if(title)track.title=title;
  return track;
}
function isLikelyTrackTitleAsArtist(artist,title){
  const a=normalizeArtistName(artist), t=recommendationText(title);
  return Boolean(a&&t&&a===t);
}

function recommendationTerms(value){
  return String(value||"").split(/[,;]+/).map(recommendationText).filter(Boolean).flatMap(x=>{
    const mapped=RECOMMENDATION_VOCAB[x];
    return mapped?mapped.flatMap(v=>recommendationText(v).split(/\s+/).filter(v=>v.length>2)):x.split(/\s+/).filter(v=>v.length>2);
  });
}
function recommendationUnique(values){
  return [...new Set(values.map(x=>String(x||"").trim()).filter(Boolean))];
}
function recommendationHash(value){
  let h=2166136261;
  for(const ch of String(value||"")){h^=ch.charCodeAt(0);h=Math.imul(h,16777619)}
  return h>>>0;
}
function recommendationOverlap(text,terms){
  let score=0;
  for(const term of terms)if(term&&text.includes(term))score++;
  return score;
}
function searchLocalTracks(q,limit=10){
  const terms=recommendationTerms(q);
  const query=recommendationText(q);
  const scored=LOCAL_MUSIC_CATALOG
    .filter(t=>t?.id&&String(t.audio||t.src||"").trim())
    .map(t=>{
      const title=recommendationText(t.title);
      const artist=recommendationText(t.artist);
      const album=recommendationText(t.album);
      const genre=recommendationText(t.genre);
      const searchable=[title,artist,album,genre].filter(Boolean).join(" ");
      let score=0;
      if(query&&searchable.includes(query))score+=45;
      if(query&&title===query)score+=80;
      if(query&&artist===query)score+=65;
      score+=recommendationOverlap(searchable,terms)*18;
      if(artist&&query.includes(artist))score+=25;
      if(title&&query.includes(title))score+=30;
      score+=(recommendationHash(query+"|"+t.id)%100)/100;
      return {track:t,score};
    })
    .filter(x=>x.score>0)
    .sort((a,b)=>b.score-a.score)
    .slice(0,Math.max(1,limit));
  return scored.map(x=>x.track);
}

function chooseRecommendations(pool,limit,context){
  const selected=[],used=new Set(),artistCounts=new Map(),sourceCounts=new Map();
  const knownArtists=new Set((context.knownArtists||[]).map(recommendationText).filter(Boolean));
  const knownQuota=knownArtists.size?Math.min(limit,Math.max(1,Math.round(limit*0.4))):0;
  let knownSelected=0;
  const scoreTrack=t=>{
    const artist=recommendationText(t.artist),title=recommendationText(t.title),source=String(t.source||"");
    const isKnown=recommendationArtistMatches(t.artist,knownArtists);
    let score=Number(t.__score||0);
    const ac=artistCounts.get(artist)||0,sc=sourceCounts.get(source)||0;
    score-=ac*24+sc*8;
    if(ac>=2)score-=70;
    if(selected.length&&recommendationText(selected[selected.length-1]?.artist)===artist)score-=28;
    if(context.currentArtist&&artist===context.currentArtist)score+=4;
    if(context.currentTitle&&title===context.currentTitle)score-=1000;
    if(isKnown){
      if(knownSelected<knownQuota)score+=90;
      else score-=50;
    }
    score+=(recommendationHash(context.salt+"|"+t.id)%1000)/1000;
    return score;
  };
  const pickBest=(filter)=>{
    let best=null,bestScore=-Infinity;
    for(const t of pool){
      if(!t?.id||used.has(t.id)||!filter(t))continue;
      const score=scoreTrack(t);
      if(score>bestScore){bestScore=score;best=t}
    }
    return best;
  };
  while(selected.length<knownQuota){
    const best=pickBest(t=>recommendationArtistMatches(t.artist,knownArtists));
    if(!best)break;
    used.add(best.id);
    const artist=recommendationText(best.artist),source=String(best.source||"");
    artistCounts.set(artist,(artistCounts.get(artist)||0)+1);
    sourceCounts.set(source,(sourceCounts.get(source)||0)+1);
    knownSelected++;
    delete best.__score;
    delete best.__queryScore;
    selected.push(best);
  }
  // Every autoplay batch should use the providers that actually returned
  // playable tracks. Reserve one slot for Zaycev and one for Hitmotop when
  // both are available; the remaining slots are scored normally.
  for(const requiredSource of ["Zaycev.net","Hitmotop"]){
    if(selected.length>=limit)break;
    const best=pickBest(t=>String(t?.source||"")===requiredSource);
    if(!best)continue;
    used.add(best.id);
    const artist=recommendationText(best.artist),source=String(best.source||"");
    artistCounts.set(artist,(artistCounts.get(artist)||0)+1);
    sourceCounts.set(source,(sourceCounts.get(source)||0)+1);
    delete best.__score;
    delete best.__queryScore;
    selected.push(best);
  }
  while(selected.length<limit){
    const nonKnownAvailable=pool.some(t=>t?.id&&!used.has(t.id)&&!recommendationArtistMatches(t.artist,knownArtists));
    const best=pickBest(t=>!nonKnownAvailable||!recommendationArtistMatches(t.artist,knownArtists));
    if(!best)break;
    used.add(best.id);
    const artist=recommendationText(best.artist),source=String(best.source||"");
    artistCounts.set(artist,(artistCounts.get(artist)||0)+1);
    sourceCounts.set(source,(sourceCounts.get(source)||0)+1);
    delete best.__score;
    delete best.__queryScore;
    selected.push(best);
  }
  return selected;
}

export async function handleApi(request,env){
  const url=new URL(request.url);
  if(url.pathname==="/api/health")return Response.json({ok:true,service:env.APP_NAME||"Ok Music",version:"7.0",providers:["Zaycev.net","Jamendo","Hitmotop"],zaycev:{configured:true,mode:"current-web-api"},jamendo:{configured:Boolean(String(env.JAMENDO_CLIENT_ID||"").trim())},hitmotop:{configured:true,mode:"Python parser RPC + open-source parser API + HTML fallback",pythonRpc:Boolean(env.HITMOZ_PYTHON)}});
  if(url.pathname==="/api/hitmotop/test"){
    const q=(url.searchParams.get("q")||"Linkin Park").trim().slice(0,160);
    try{
      const tracks=await fetchHitmotopSearch(q,5,env);
      return Response.json({
        ok:true,
        provider:"Hitmotop",
        query:q,
        count:tracks.length,
        tracks:tracks.map(t=>({id:t.id,title:t.title,artist:t.artist,duration:t.duration,sourceUrl:t.sourceUrl,hasAudio:Boolean(t.audio),hasImage:Boolean(t.image)}))
      });
    }catch(error){
      return Response.json({ok:false,provider:"Hitmotop",query:q,error:error?.message||"unknown error"},{status:502});
    }
  }

  if(url.pathname==="/api/search"){
    const q=(url.searchParams.get("q")||"").trim(),limit=Math.min(Math.max(Number(url.searchParams.get("limit")||24),1),50);
    if(!q)return Response.json({ok:true,query:"",tracks:[],providers:[]});
    const providerLimit=Math.min(30,Math.max(10,Math.ceil(limit/2)+8));
    const [z,j,h]=await Promise.allSettled([
      cachedProviderSearch("zaycev",q,providerLimit,()=>fetchZaycevSearch(q,providerLimit)),
      cachedProviderSearch("jamendo",q,providerLimit,()=>searchJamendo(q,providerLimit,env)),
      cachedProviderSearch("hitmotop",q,providerLimit,()=>fetchHitmotopSearch(q,providerLimit,env))
    ]);
    const zTracks=z.status==="fulfilled"?z.value:[],jTracks=j.status==="fulfilled"?j.value:[],hTracks=h.status==="fulfilled"?h.value:[];
    const localTracks=searchLocalTracks(q,limit);
     const remoteTracks=mergeProviderTracks([zTracks,jTracks,hTracks],limit);
     const tracks=uniqueTracks([...remoteTracks,...localTracks],limit);
    const errors=[
      ...(z.status==="rejected"?["Zaycev.net: "+(z.reason?.message||"ошибка")]:[]),
      ...(j.status==="rejected"?["Jamendo: "+(j.reason?.message||"ошибка")]:[]),
      ...(h.status==="rejected"?["Hitmotop: "+(h.reason?.message||"ошибка")]:[])
    ];
    if(!tracks.length)return Response.json({
      ok:false,
      error:errors.length?"Музыкальные каталоги временно недоступны":"Ничего не найдено",
      details:errors,query:q,tracks:[],
      diagnostics:{zaycevConfigured:true,jamendoConfigured:Boolean(String(env.JAMENDO_CLIENT_ID||"").trim()),hitmotopConfigured:true,errors}
    },{status:errors.length?502:200});
    return Response.json({
      ok:true,query:q,
      providers:[...(zTracks.length?["Zaycev.net"]:[]),...(jTracks.length?["Jamendo"]:[]),...(hTracks.length?["Hitmotop"]:[]),...(localTracks.length?["Локальная библиотека"]:[])],
      tracks,errors:[...new Set(errors)].slice(0,6)
    });
  }
  if(url.pathname==="/api/jamendo/play"){
    const id=(url.searchParams.get("id")||"").trim();
    if(!/^\d+$/.test(id))return Response.json({ok:false,error:"Invalid Jamendo track id"},{status:400});
    try{
      const clientId=String(env.JAMENDO_CLIENT_ID||"").trim();
      if(!clientId)throw Error("Jamendo client id is not configured");
      const api=new URL("https://api.jamendo.com/v3.0/tracks/file/");
      api.searchParams.set("client_id",clientId);
      api.searchParams.set("id",id);
      api.searchParams.set("action","stream");
      api.searchParams.set("audioformat","mp31");
      const range=request.headers.get("range")||"";
      const upstream=await fetch(api.href,{headers:{
        ...(range?{range}:{}),
        accept:"audio/*,audio/mpeg,*/*;q=0.8",
        "user-agent":ZAYCEV_HEADERS["user-agent"],
        referer:"https://www.jamendo.com/"
      },redirect:"follow",signal:AbortSignal.timeout(10_000)});
      if(!upstream.ok&&upstream.status!==206)throw Error("Jamendo audio HTTP "+upstream.status);
      const contentType=(upstream.headers.get("content-type")||"").toLowerCase();
      if(contentType.includes("text/html")||contentType.includes("application/json")||contentType.includes("text/plain"))throw Error("Jamendo returned non-audio");
      const outHeaders=new Headers();
      for(const name of ["content-type","content-length","content-range","etag","last-modified"]){
        const value=upstream.headers.get(name);if(value)outHeaders.set(name,value);
      }
      outHeaders.set("cache-control","no-store");
      outHeaders.set("access-control-allow-origin","*");
      outHeaders.set("access-control-expose-headers","Content-Length,Content-Range,Accept-Ranges,Content-Type");
      outHeaders.set("accept-ranges",outHeaders.get("accept-ranges")||"bytes");
      outHeaders.set("content-type",outHeaders.get("content-type")||"audio/mpeg");
      return new Response(upstream.body,{status:upstream.status,headers:outHeaders});
    }catch(e){return Response.json({ok:false,error:e?.message||"Jamendo playback unavailable"},{status:502})}
  }
  if(url.pathname==="/api/artwork"){
    const raw=(url.searchParams.get("url")||"").trim();
    let target;
    try{target=new URL(raw)}catch{return Response.json({ok:false,error:"Invalid artwork URL"},{status:400})}
    const host=target.hostname.toLowerCase();
    const allowed=host==="zaycev.net"||host.endsWith(".zaycev.net")||host==="jamendo.com"||host.endsWith(".jamendo.com")||host==="eu.hitmoz.com"||host.endsWith(".eu.hitmoz.com")||host==="ru.hitmoz.org"||host.endsWith(".ru.hitmoz.org")||host==="rus.hitmoz.org"||host.endsWith(".rus.hitmoz.org")||host==="hitmos.me"||host.endsWith(".hitmos.me")||host==="static.hitmos.fm"||host==="hitmos.fm"||host.endsWith(".hitmos.fm")||host==="statcore.hitmcdn.com"||host.endsWith(".hitmcdn.com");
    if(!allowed||!/^https?:$/.test(target.protocol))return Response.json({ok:false,error:"Artwork host is not allowed"},{status:403});
    try{
      const upstream=await fetch(target,{headers:{
        accept:"image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8",
        referer:host.endsWith("zaycev.net")?ZAYCEV_BASE+"/":host.endsWith("jamendo.com")?"https://www.jamendo.com/":"https://"+host+"/",
        "user-agent":ZAYCEV_HEADERS["user-agent"]
      }});
      if(!upstream.ok)throw Error("Artwork HTTP "+upstream.status);
      const headers=new Headers();
      headers.set("content-type",upstream.headers.get("content-type")||"image/jpeg");
      headers.set("cache-control","public,max-age=86400");
      headers.set("access-control-allow-origin","*");
      return new Response(upstream.body,{status:200,headers});
    }catch(e){
      return Response.json({ok:false,error:e?.message||"Artwork unavailable"},{status:502});
    }
  }

  if(url.pathname==="/api/hitmotop/play"){
    const raw=(url.searchParams.get("url")||"").trim();
    const page=(url.searchParams.get("page")||"").trim();
    try{
      const target=await hitmotopPlaybackUrl(raw);
      const range=request.headers.get("range")||"";
      const targetUrl=new URL(target);
      let cookie="";
      let referer=targetUrl.origin+"/";

      // HitMoz may require the session cookie from the track page before
      // accepting the direct /get/music/*.mp3 request.
      if(page){
        try{
          const pageUrl=new URL(page);
          const pageHost=pageUrl.hostname.toLowerCase();
          const allowedPage=pageHost==="eu.hitmoz.com"||pageHost.endsWith(".eu.hitmoz.com")||
            pageHost==="ru.hitmoz.org"||pageHost.endsWith(".ru.hitmoz.org")||
            pageHost==="rus.hitmoz.org"||pageHost.endsWith(".rus.hitmoz.org")||
            pageHost==="hitmos.me"||pageHost.endsWith(".hitmos.me")||
            pageHost==="hitmos.fm"||pageHost.endsWith(".hitmos.fm");
          if(allowedPage){
            referer=pageUrl.href;
            const pageResponse=await fetch(pageUrl.href,{headers:HITMOTOP_HEADERS,redirect:"follow"});
            cookie=hitmotopCookieHeader(pageResponse);
          }
        }catch{}
      }

      const makeAudioHeaders=(withCookie=true)=>{
        const headers={
          "accept":"audio/mpeg,audio/*;q=0.9,*/*;q=0.8",
          "accept-language":"ru-RU,ru;q=0.9,en;q=0.7",
          "user-agent":HITMOTOP_HEADERS["user-agent"],
          "referer":referer,
          "sec-fetch-dest":"audio",
          "sec-fetch-mode":"no-cors",
          "sec-fetch-site":"cross-site"
        };
        if(withCookie&&cookie)headers.cookie=cookie;
        if(range)headers.range=range;
        return headers;
      };

      const isAudioResponse=response=>{
        const type=(response.headers.get("content-type")||"").toLowerCase();
        return Boolean(type.startsWith("audio/"))||type.includes("mpeg")||type.includes("octet-stream");
      };

      // Try the direct MP3 first with the track-page session, then retry without
      // the cookie. Some HitMoz mirrors reject one of these two request shapes.
      let upstream=await fetch(target,{headers:makeAudioHeaders(true),redirect:"follow"});
      let contentType=(upstream.headers.get("content-type")||"").toLowerCase();

      if(!isAudioResponse(upstream)||!upstream.ok){
        if(upstream.body)try{await upstream.body.cancel()}catch{}
        upstream=await fetch(target,{headers:makeAudioHeaders(false),redirect:"follow"});
        contentType=(upstream.headers.get("content-type")||"").toLowerCase();
      }

      if(!isAudioResponse(upstream)&&contentType.includes("text/html")){
        const html=await upstream.text();
        const patterns=[
          /["'](\/get\/[^"']+\.mp3(?:\?[^"']*)?)["']/i,
          /["'](https?:\/\/[^"']+\/get\/[^"']+\.mp3(?:\?[^"']*)?)["']/i,
          /href=["']([^"']+\.mp3(?:\?[^"']*)?)["']/i
        ];
        let direct="";
        for(const pattern of patterns){
          const match=html.match(pattern);
          if(match?.[1]){direct=hitmotopAbsoluteUrl(match[1],targetUrl.origin);if(direct)break;}
        }
        if(!direct){
          const button=html.match(/<a\b[^>]*class=["'][^"']*track__download-btn[^"']*["'][^>]*>/i);
          direct=hitmotopAbsoluteUrl(hitmotopExtractAttr(button?.[0],"href"),targetUrl.origin);
        }
        if(!direct)throw Error("Hitmotop audio URL not found");
        upstream=await fetch(direct,{headers:makeAudioHeaders(false),redirect:"follow"});
        contentType=(upstream.headers.get("content-type")||"").toLowerCase();
      }

      if(!upstream.ok&&upstream.status!==206)throw Error("Hitmotop audio HTTP "+upstream.status);
      if(!isAudioResponse(upstream)){
        throw Error("Hitmotop returned non-audio content-type: "+(contentType||"unknown"));
      }
      const headers=new Headers(upstream.headers);
      headers.set("cache-control","no-store");
      headers.set("access-control-allow-origin","*");
      headers.set("accept-ranges",headers.get("accept-ranges")||"bytes");
      headers.set("content-type",headers.get("content-type")||"audio/mpeg");
      return new Response(upstream.body,{status:upstream.status,headers});
    }catch(e){return Response.json({ok:false,error:e?.message||"Hitmotop playback unavailable"},{status:502})}
  }
  if(url.pathname==="/api/zaycev/play"){
    const id=(url.searchParams.get("id")||"").trim();
    const page=(url.searchParams.get("page")||"").trim();
    if(!/^\d+$/.test(id))return Response.json({ok:false,error:"Invalid Zaycev track id"},{status:400});
    try{
      const target=await zaycevPlay(id,page);
      const range=request.headers.get("range")||"";
      let cookie="";
      if(page){
        try{
          const pageResponse=await fetch(page,{
            headers:{
              accept:"text/html,application/xhtml+xml",
              "accept-language":"ru-RU,ru;q=0.9,en;q=0.7",
              referer:ZAYCEV_BASE+"/",
              "user-agent":ZAYCEV_HEADERS["user-agent"]
            },
            redirect:"follow",signal:AbortSignal.timeout(5_000)
          });
          cookie=await zaycevCookieHeader(pageResponse);
          try{await pageResponse.body?.cancel()}catch{}
        }catch{}
      }
      const upstream=await fetch(target,{
        headers:{
          ...(range?{range}:{}),
          ...(cookie?{cookie}:{}),
          accept:"audio/*,audio/mpeg,audio/mp4,*/*;q=0.8",
          "user-agent":ZAYCEV_HEADERS["user-agent"],
          referer:page||ZAYCEV_BASE+"/"
        },
        redirect:"follow",signal:AbortSignal.timeout(10_000)
      });
      if(!upstream.ok&&upstream.status!==206)throw Error("Zaycev audio HTTP "+upstream.status);
      const contentType=(upstream.headers.get("content-type")||"").toLowerCase();
      if(contentType.includes("text/html")||contentType.includes("application/json")||contentType.includes("text/plain")){
        const sample=(await upstream.text()).slice(0,200).replace(/\s+/g," ");
        throw Error("Zaycev returned non-audio: "+sample);
      }
      const headers=new Headers();
      for(const name of ["content-type","content-length","content-range","etag","last-modified"]){
        const value=upstream.headers.get(name);if(value)headers.set(name,value);
      }
      headers.set("cache-control","no-store");
      headers.set("access-control-allow-origin","*");
      headers.set("access-control-expose-headers","Content-Length,Content-Range,Accept-Ranges,Content-Type");
      headers.set("accept-ranges",headers.get("accept-ranges")||"bytes");
      headers.set("content-type",headers.get("content-type")||"audio/mpeg");
      return new Response(upstream.body,{status:upstream.status,headers});
    }catch(e){return Response.json({ok:false,error:e?.message||"Zaycev playback unavailable"},{status:502})}
  }
  if(url.pathname==="/api/recommendations"){
    const limit=Math.min(Math.max(Number(url.searchParams.get("limit")||5),1),10);
    const currentArtist=recommendationText(url.searchParams.get("artist")||"");
    const currentTitle=recommendationText(url.searchParams.get("title")||"");
    const mood=recommendationText(url.searchParams.get("mood")||"");
    const genres=recommendationTerms(url.searchParams.get("genres")||"");
    const moods=recommendationTerms(url.searchParams.get("moods")||mood);
    const now=recommendationTerms(url.searchParams.get("now")||"");
    const preferredArtists=recommendationUnique([
      ...(url.searchParams.get("artists")||"").split(/[,;]+/),
      ...(url.searchParams.get("likedArtists")||"").split(/[,;]+/),
      currentArtist
    ]).map(recommendationText).filter(Boolean).slice(0,12);
    const likedText=recommendationText(url.searchParams.get("liked")||"");
    const seed=recommendationText(url.searchParams.get("seed")||"");
    const excluded=new Set((url.searchParams.get("exclude")||"").split(",").map(x=>x.trim()).filter(Boolean));
    if(currentArtist&&currentTitle)excluded.add(currentArtist+" | "+currentTitle);

    const rawGenres=recommendationUnique((url.searchParams.get("genres")||"").split(/[,;]+/).map(recommendationText).filter(Boolean));
    const rawMoods=recommendationUnique((url.searchParams.get("moods")||mood||"").split(/[,;]+/).map(recommendationText).filter(Boolean));
    const rawNow=recommendationUnique((url.searchParams.get("now")||"").split(/[,;]+/).map(recommendationText).filter(Boolean));
    const mappedNow=rawNow.flatMap(x=>RECOMMENDATION_VOCAB[x]||[]).map(recommendationText);
    const genreQueries=rawGenres.map(x=>(RECOMMENDATION_VOCAB[x]||[x]).slice(0,3).join(" "));
    const moodQueries=rawMoods.map(x=>(RECOMMENDATION_VOCAB[x]||[x]).slice(0,2).join(" "));
    const primaryArtist=preferredArtists[0]||currentArtist;
    const contextQuery=[currentArtist,currentTitle].filter(Boolean).join(" ");
    const genreKeys=recommendationGenreKeys(rawGenres);
    const knownArtists=recommendationKnownArtists(genreKeys,String(url.searchParams.get("refresh")||Date.now()),2);
    const knownArtistQueries=knownArtists.map(artist=>artist);
    const hasPersonalContext=Boolean(knownArtists.length||preferredArtists.length||genres.length||moods.length||now.length);
    // Autoplay must stay inside the user's context. Generic genre soup is only
    // useful for a true discovery request with no artist/genre/mood signal.
    const discoveryQueries=hasPersonalContext?[]:["rock","electronic","party"];
    // Reserve the first queries for known genre anchors and the user's preferred
    // artist. Do not put the current track title into provider search when we have
    // a stronger genre/artist signal; song titles are noisy recommendation seeds.
    const remoteContextQueries=hasPersonalContext
      ? [primaryArtist,...genreQueries.slice(0,1),...moodQueries.slice(0,1)]
      : [contextQuery,primaryArtist,...genreQueries.slice(0,1),...moodQueries.slice(0,1)];
    const queries=recommendationUnique([
      ...knownArtistQueries,
      ...remoteContextQueries
    ]).filter(q=>q.length>1).slice(0,5);

    const errors=[],providerHits={z:0,j:0,h:0,l:0};
    const pool=[],seenIds=new Set(),seenSongs=new Set();
    const context={currentArtist,currentTitle,preferredArtists,genres,moods,now,likedText,knownArtists,salt:String(url.searchParams.get("refresh")||Date.now())};

    const addList=(list,key,query)=>{
      if(!Array.isArray(list))return;
      providerHits[key]+=list.length;
      for(const rawTrack of list){
        const t=normalizeRecommendationTrack(rawTrack);
        const hasAudio=Boolean(t?.zaycevId||String(t?.audio||"").trim()||String(t?.downloadUrl||"").trim()||String(t?.src||"").trim());
        if(!hasAudio||!t?.id||isChartLikeTrack(t)||excluded.has(t.id)||seenIds.has(t.id))continue;
        const songKey=trackDedupeKey(t);
        if(songKey&&seenSongs.has(songKey))continue;
        const artist=recommendationText(t.artist),title=recommendationText(t.title);
        const trackGenre=recommendationText(t.genre);
        const genreMismatch=genres.length&&trackGenre&&!recommendationOverlap(trackGenre,genres);
        if(genreMismatch)continue;
        if(isLikelyTrackTitleAsArtist(t.artist,t.title))continue;
        if(currentArtist&&currentTitle&&artist===currentArtist&&title===currentTitle)continue;
        seenIds.add(t.id);if(songKey)seenSongs.add(songKey);
        let score=0;
        const searchable=title+" "+normalizeArtistName(artist)+" "+recommendationText(t.genre);
        const queryTerms=recommendationText(query).split(/\s+/).filter(x=>x.length>2);
        const queryScore=recommendationOverlap(searchable,queryTerms);
        const knownArtist=recommendationArtistMatches(t.artist,knownArtists);
        score+=queryScore*20;
        if(knownArtist)score+=75;
        if(artist&&preferredArtists.includes(artist))score+=70;
        else if(artist&&preferredArtists.some(a=>artist.includes(a)||a.includes(artist)))score+=40;
        if(currentArtist&&artist===currentArtist)score+=18;
        if(currentArtist&&artist&&artist.includes(currentArtist)&&artist!==currentArtist)score+=9;
        const genreOverlap=recommendationOverlap(recommendationText(t.genre),genres);
        const textGenreOverlap=recommendationOverlap(searchable,genres);
        const moodOverlap=recommendationOverlap(searchable,moods);
        const nowOverlap=recommendationOverlap(searchable,now);
        score+=genreOverlap*24;
        score+=textGenreOverlap*8;
        score+=moodOverlap*10;
        score+=nowOverlap*3;
        if((genres.length||moods.length) && queryScore===0 && genreOverlap===0 && moodOverlap===0)score-=45;
        if(likedText&&(likedText.includes(artist)||likedText.includes(title)))score+=18;
        if(t.image)score+=2;
        if(t.duration>=90&&t.duration<=480)score+=2;
        if(String(t.source||"")==="Hitmotop")score+=1;
        if(String(t.source||"")==="Jamendo")score+=1;
        score+=(recommendationHash(context.salt+"|"+t.id)%100)/100;
        t.__queryScore=queryScore;
        t.__score=score;
        pool.push(t);
      }
    };

    for(let round=0;round<Math.min(5,queries.length);round++){
      const q=queries[round];
      if(!q)continue;
      const providerLimit=Math.max(5,Math.min(10,limit+1));
      // Always ask all three catalogs in the same round. Each provider is
      // independently time-bounded so one slow source cannot freeze Play.
      const [z,j,h]=await Promise.allSettled([
        cachedProviderSearch("zaycev",q,providerLimit,()=>fetchZaycevSearch(q,providerLimit)),
        cachedProviderSearch("jamendo",q,providerLimit,()=>searchJamendo(q,providerLimit,env)),
        cachedProviderSearch("hitmotop",q,providerLimit,()=>fetchHitmotopSearch(q,providerLimit,env))
      ]);
      if(z.status==="fulfilled")addList(z.value,"z",q);else errors.push("Zaycev.net: "+(z.reason?.message||"ошибка"));
      if(j.status==="fulfilled")addList(j.value,"j",q);else errors.push("Jamendo: "+(j.reason?.message||"ошибка"));
      if(h.status==="fulfilled")addList(h.value,"h",q);else errors.push("Hitmotop: "+(h.reason?.message||"ошибка"));
      if(pool.length>=Math.max(limit,5))break;
    }

         if(pool.length<Math.max(limit,5)){
       for(const q of discoveryQueries){
         const providerLimit=Math.max(5,Math.min(8,limit+1));
         const [z,j,h]=await Promise.allSettled([
           cachedProviderSearch("zaycev",q,providerLimit,()=>fetchZaycevSearch(q,providerLimit)),
           cachedProviderSearch("jamendo",q,providerLimit,()=>searchJamendo(q,providerLimit,env)),
           cachedProviderSearch("hitmotop",q,providerLimit,()=>fetchHitmotopSearch(q,providerLimit,env))
         ]);
         if(z.status==="fulfilled")addList(z.value,"z",q);else errors.push("Zaycev.net: "+(z.reason?.message||"ошибка"));
         if(j.status==="fulfilled")addList(j.value,"j",q);else errors.push("Jamendo: "+(j.reason?.message||"ошибка"));
         if(h.status==="fulfilled")addList(h.value,"h",q);else errors.push("Hitmotop: "+(h.reason?.message||"ошибка"));
         if(pool.length>=Math.max(limit,5))break;
       }
     }

     if(pool.length<Math.max(limit,5)){
       const localQueries=recommendationUnique([
         contextQuery,primaryArtist,
         ...genreQueries.slice(0,2),
         ...moodQueries.slice(0,2),
         mappedNow.slice(0,2).join(" ")
       ]).filter(q=>q.length>1);
       for(const q of localQueries){
         addList(searchLocalTracks(q,Math.max(8,limit*2)),"l",q);
         if(pool.length>=Math.max(limit,5))break;
       }
     }
     if(pool.length<Math.max(limit,5)){
       const fallback=LOCAL_MUSIC_CATALOG
         .filter(t=>t?.id&&hasPlayableTrackAudio(t))
         .slice()
         .sort((a,b)=>(recommendationHash(context.salt+"|"+a.id)-recommendationHash(context.salt+"|"+b.id)));
       addList(fallback.slice(0,Math.max(10,limit*3)),"l",contextQuery||primaryArtist||"");
     }

const tracks=chooseRecommendations(pool,limit,context);
    const providers=[...(providerHits.z?["Zaycev.net"]:[]),...(providerHits.j?["Jamendo"]:[]),...(providerHits.h?["Hitmotop"]:[]),...(providerHits.l?["Локальная библиотека"]:[])];

    return Response.json({
      ok:true,
      algorithm:"adaptive-autoplay-v3",
      batchSize:limit,
      mode:(preferredArtists.length||genres.length||moods.length||now.length)?"personalized":"discovery",
      context:{artist:currentArtist||"",mood:mood||"",genres:[...new Set(genres)].slice(0,6),moods:[...new Set(moods)].slice(0,6)},
      providers,
      tracks,
      errors:[...new Set(errors)].slice(0,8)
    });
  }
  return Response.json({ok:false,error:"Not found"},{status:404});
}