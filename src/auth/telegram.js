const COOKIE="okmusic_session";
const MAX_AGE=60*60*24*30;

function base64url(bytes){
  let s="";
  for(const b of bytes)s+=String.fromCharCode(b);
  return btoa(s).replace(/\+/g,"-").replace(/\//g,"_").replace(/=+$/,"");
}
function base64urlText(text){
  return base64url(new TextEncoder().encode(text));
}
function fromBase64url(text){
  const s=String(text||"").replace(/-/g,"+").replace(/_/g,"/");
  const pad="=".repeat((4-s.length%4)%4);
  const raw=atob(s+pad),out=new Uint8Array(raw.length);
  for(let i=0;i<raw.length;i++)out[i]=raw.charCodeAt(i);
  return out;
}
async function hmac(keyText,data){
  const key=await crypto.subtle.importKey("raw",new TextEncoder().encode(keyText),{name:"HMAC",hash:"SHA-256"},false,["sign"]);
  return new Uint8Array(await crypto.subtle.sign("HMAC",key,new TextEncoder().encode(data)));
}
function constantTimeEqual(a,b){
  if(a.length!==b.length)return false;
  let x=0;
  for(let i=0;i<a.length;i++)x|=a[i]^b[i];
  return x===0;
}
function cookieValue(request){
  const raw=request.headers.get("Cookie")||"";
  const hit=raw.split(";").map(x=>x.trim()).find(x=>x.startsWith(COOKIE+"="));
  return hit?decodeURIComponent(hit.slice(COOKIE.length+1)):"";
}
async function verifyTelegramPayload(data,botToken){
  if(!botToken)throw Error("Telegram bot token is not configured");
  const input={...data};
  const received=String(input.hash||"");
  delete input.hash;
  delete input.signature;
  const check=Object.keys(input).sort().map(k=>k+"="+String(input[k]??"")).join("\n");
  const secret=await crypto.subtle.digest("SHA-256",new TextEncoder().encode(botToken));
  const key=await crypto.subtle.importKey("raw",secret,{name:"HMAC",hash:"SHA-256"},false,["sign"]);
  const expected=new Uint8Array(await crypto.subtle.sign("HMAC",key,new TextEncoder().encode(check)));
  const actual=fromBase64url(received.replace(/[^A-Za-z0-9_-]/g,""));
  // Telegram Login Widget returns a hexadecimal HMAC.
  const hex=Array.from(expected,b=>b.toString(16).padStart(2,"0")).join("");
  const hexBytes=new TextEncoder().encode(hex);
  const receivedHex=new TextEncoder().encode(received.toLowerCase());
  if(hexBytes.length!==receivedHex.length||!constantTimeEqual(hexBytes,receivedHex))return null;
  const authDate=Number(data.auth_date||0);
  if(!authDate||Math.abs(Date.now()/1000-authDate)>86400)return null;
  if(!data.id)return null;
  return {
    id:String(data.id),
    first_name:String(data.first_name||""),
    last_name:String(data.last_name||""),
    username:String(data.username||""),
    photo_url:String(data.photo_url||"")
  };
}
async function makeSession(user,botToken){
  const payload=base64urlText(JSON.stringify({u:user,t:Math.floor(Date.now()/1000)}));
  const sig=base64url(await hmac(botToken,payload));
  return payload+"."+sig;
}
async function readSession(request,botToken){
  if(!botToken)return null;
  const token=cookieValue(request);
  const [payload,sig]=token.split(".");
  if(!payload||!sig)return null;
  const expected=await hmac(botToken,payload);
  const actual=fromBase64url(sig);
  if(!constantTimeEqual(expected,actual))return null;
  try{
    const data=JSON.parse(new TextDecoder().decode(fromBase64url(payload)));
    if(!data?.u||Date.now()/1000-Number(data.t||0)>MAX_AGE)return null;
    return data.u;
  }catch{return null}
}
function cookie(token,maxAge=MAX_AGE){
  return COOKIE+"="+encodeURIComponent(token)+"; Path=/; Max-Age="+maxAge+"; HttpOnly; Secure; SameSite=Lax";
}
export async function handleAuth(request,env){
  const url=new URL(request.url);
  if(url.pathname==="/api/auth/me"){
    const user=await readSession(request,env.TELEGRAM_BOT_TOKEN);
    return Response.json({ok:true,authenticated:Boolean(user),user:user||null});
  }
  if(url.pathname==="/api/auth/logout"&&request.method==="POST"){
    return new Response(JSON.stringify({ok:true}),{status:200,headers:{
      "content-type":"application/json; charset=utf-8",
      "set-cookie":cookie("",0)
    }});
  }
  if(url.pathname==="/api/auth/telegram"&&request.method==="POST"){
    try{
      if(!env.TELEGRAM_BOT_TOKEN)return Response.json({ok:false,error:"TELEGRAM_BOT_TOKEN не настроен"},{status:503});
      const data=await request.json();
      const user=await verifyTelegramPayload(data,env.TELEGRAM_BOT_TOKEN);
      if(!user)return Response.json({ok:false,error:"Неверная или устаревшая авторизация Telegram"},{status:401});
      const session=await makeSession(user,env.TELEGRAM_BOT_TOKEN);
      return new Response(JSON.stringify({ok:true,user}),{status:200,headers:{
        "content-type":"application/json; charset=utf-8",
        "cache-control":"no-store",
        "set-cookie":cookie(session)
      }});
    }catch(error){
      return Response.json({ok:false,error:error?.message||"Ошибка авторизации"},{status:400});
    }
  }
  return null;
}
