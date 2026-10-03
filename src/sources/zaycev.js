const API_BASE = "https://api.zaycev.net/external";
const DEFAULT_STATIC_KEY = "kmskoNkYHDnl3ol2";
let authCache = { token: "", expiresAt: 0, pending: null };
function leftRotate(x,c){return (x<<c)|(x>>>(32-c))}
function md5(input){
 const bytes=new TextEncoder().encode(String(input)),bitLen=bytes.length*8,blocks=(((bytes.length+8)>>6)+1)*16,words=new Uint32Array(blocks);
 for(let i=0;i<bytes.length;i++)words[i>>2]|=bytes[i]<<((i&3)*8);
 words[bytes.length>>2]|=0x80<<((bytes.length&3)*8);words[blocks-2]=bitLen>>>0;words[blocks-1]=Math.floor(bitLen/0x100000000)>>>0;
 let a0=0x67452301,b0=0xefcdab89,c0=0x98badcfe,d0=0x10325476;
 const k=[0xd76aa478,0xe8c7b756,0x242070db,0xc1bdceee,0xf57c0faf,0x4787c62a,0xa8304613,0xfd469501,0x698098d8,0x8b44f7af,0xffff5bb1,0x895cd7be,0x6b901122,0xfd987193,0xa679438e,0x49b40821,0xf61e2562,0xc040b340,0x265e5a51,0xe9b6c7aa,0xd62f105d,0x02441453,0xd8a1e681,0xe7d3fbc8,0x21e1cde6,0xc33707d6,0xf4d50d87,0x455a14ed,0xa9e3e905,0xfcefa3f8,0x676f02d9,0x8d2a4c8a,0xfffa3942,0x8771f681,0x6d9d6122,0xfde5380c,0xa4beea44,0x4bdecfa9,0xf6bb4b60,0xbebfbc70,0x289b7ec6,0xeaa127fa,0xd4ef3085,0x04881d05,0xd9d4d039,0xe6db99e5,0x1fa27cf8,0xc4ac5665,0xf4292244,0x432aff97,0xab9423a7,0xfc93a039,0x655b59c3,0x8f0ccc92,0xffeff47d,0x85845dd1,0x6fa87e4f,0xfe2ce6e0,0xa3014314,0x4e0811a1,0xf7537e82,0xbd3af235,0x2ad7d2bb,0xeb86d391];
 const s=[7,12,17,22,7,12,17,22,7,12,17,22,7,12,17,22,5,9,14,20,5,9,14,20,5,9,14,20,5,9,14,20,4,11,16,23,4,11,16,23,4,11,16,23,4,11,16,23,6,10,15,21,6,10,15,21,6,10,15,21,6,10,15,21];
 for(let offset=0;offset<words.length;offset+=16){let a=a0,b=b0,c=c0,d=d0;
  for(let i=0;i<64;i++){let f,g;if(i<16){f=(b&c)|(~b&d);g=i}else if(i<32){f=(d&b)|(~d&c);g=(5*i+1)&15}else if(i<48){f=b^c^d;g=(3*i+5)&15}else{f=c^(b|~d);g=(7*i)&15}
   const sum=(a+f+k[i]+words[offset+g])|0;a=d;d=c;c=b;b=(b+leftRotate(sum,s[i]))|0;
  }a0=(a0+a)|0;b0=(b0+b)|0;c0=(c0+c)|0;d0=(d0+d)|0;
 }
 const out=new Uint8Array(16),values=[a0,b0,c0,d0];
 for(let i=0;i<values.length;i++){const v=values[i]>>>0;out[i*4]=v&255;out[i*4+1]=(v>>>8)&255;out[i*4+2]=(v>>>16)&255;out[i*4+3]=(v>>>24)&255}
 return [...out].map(v=>v.toString(16).padStart(2,"0")).join("")
}
async function getJson(url){const r=await fetch(url,{headers:{accept:"application/json"}});if(!r.ok)throw new Error("ZAYCEV.NET HTTP "+r.status);return r.json()}
async function getAccessToken(env){
 const staticKey=String(env.ZAYCEV_STATIC_KEY||DEFAULT_STATIC_KEY).trim();if(!staticKey)throw new Error("ZAYCEV_STATIC_KEY не задан");
 const now=Date.now();if(authCache.token&&authCache.expiresAt>now+60000)return authCache.token;if(authCache.pending)return authCache.pending;
 authCache.pending=(async()=>{const hello=await getJson(API_BASE+"/hello"),helloToken=String(hello?.token||"").trim();if(!helloToken)throw new Error("ZAYCEV.NET не вернул hello token");
  const auth=await getJson(API_BASE+"/auth?code="+encodeURIComponent(helloToken)+"&hash="+md5(helloToken+staticKey)),token=String(auth?.token||"").trim();if(!token)throw new Error("ZAYCEV.NET не вернул access token");
  authCache={token,expiresAt:now+20*60*60*1000,pending:null};return token;
 })();
 try{return await authCache.pending}finally{authCache.pending=null}
}
function parseDuration(value){if(Number.isFinite(Number(value)))return Number(value);const m=String(value||"").match(/^(\d+):([0-5]\d)$/);return m?Number(m[1])*60+Number(m[2]):0}
function normalizeTrack(t){return{id:"zaycev-"+t.id,zaycevId:Number(t.id),title:t.track||"Без названия",artist:t.artistName||"Неизвестный исполнитель",album:"",image:t.artistImageUrlSquare250||t.artistImageUrlSquare100||"",audio:"",duration:parseDuration(t.duration),license:"",source:"ZAYCEV.NET",sourceUrl:"https://zaycev.net/",genre:""}}
export async function searchZaycev(query,limit,env){const q=String(query||"").trim();if(!q)return[];const token=await getAccessToken(env),url=new URL(API_BASE+"/search");url.searchParams.set("query",q);url.searchParams.set("page","1");url.searchParams.set("type","all");url.searchParams.set("sort","popularity");url.searchParams.set("style","");url.searchParams.set("access_token",token);const data=await getJson(url.toString());return(data?.tracks||[]).filter(x=>x?.id).slice(0,limit).map(normalizeTrack)}
export async function getZaycevPlayback(trackId,env){const id=Number(trackId);if(!Number.isFinite(id)||id<=0)throw new Error("Некорректный ZAYCEV.NET track id");const token=await getAccessToken(env),url=API_BASE+"/track/"+encodeURIComponent(id)+"/play?access_token="+encodeURIComponent(token)+"&encoded_identifier=",data=await getJson(url);const playbackUrl=String(data?.url||"").trim();if(!playbackUrl)throw new Error("ZAYCEV.NET не вернул playback URL");return playbackUrl}
export const zaycev={name:"Zaycev.net",search:searchZaycev,playback:getZaycevPlayback};
