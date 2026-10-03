const COOKIE="okmusic_session";
const SESSION_AGE=60*60*24*30;
const CODE_TTL=5*60;

function cookie(token,maxAge=SESSION_AGE){
  return COOKIE+"="+encodeURIComponent(token)+"; Path=/; Max-Age="+maxAge+"; HttpOnly; Secure; SameSite=Lax";
}
function b64(bytes){
  let s=""; for(const b of bytes)s+=String.fromCharCode(b);
  return btoa(s).replace(/\+/g,"-").replace(/\//g,"_").replace(/=+$/,"");
}
function unb64(s){
  s=String(s||"").replace(/-/g,"+").replace(/_/g,"/");
  s+="=".repeat((4-s.length%4)%4);
  const r=atob(s),o=new Uint8Array(r.length);
  for(let i=0;i<r.length;i++)o[i]=r.charCodeAt(i);
  return o;
}
async function sign(data,key){
  const k=await crypto.subtle.importKey("raw",new TextEncoder().encode(key),{name:"HMAC",hash:"SHA-256"},false,["sign"]);
  return new Uint8Array(await crypto.subtle.sign("HMAC",k,new TextEncoder().encode(data)));
}
function randomToken(bytes=18){
  const a=new Uint8Array(bytes);crypto.getRandomValues(a);return b64(a);
}
async function session(user,secret){
  const payload=b64(new TextEncoder().encode(JSON.stringify({u:user,t:Math.floor(Date.now()/1000)})));
  return payload+"."+b64(await sign(payload,secret));
}
function getCookie(request){
  const hit=(request.headers.get("Cookie")||"").split(";").map(x=>x.trim()).find(x=>x.startsWith(COOKIE+"="));
  return hit?decodeURIComponent(hit.slice(COOKIE.length+1)):"";
}
async function readSession(request,secret){
  if(!secret)return null;
  const token=getCookie(request),parts=token.split(".");
  if(parts.length!==2)return null;
  const expected=await sign(parts[0],secret);
  const actual=unb64(parts[1]);
  if(expected.length!==actual.length||!expected.every((v,i)=>v===actual[i]))return null;
  try{
    const d=JSON.parse(new TextDecoder().decode(unb64(parts[0])));
    if(!d?.u||Date.now()/1000-Number(d.t||0)>SESSION_AGE)return null;
    return d.u;
  }catch{return null}
}
async function doCall(env,path,options={}){
  if(!env.AUTH_CODES)return new Response("AuthCodes binding is not configured",{status:503});
  const id=env.AUTH_CODES.idFromName("global");
  return env.AUTH_CODES.get(id).fetch("https://auth"+path,{...options});
}
export async function handleAuth(request,env){
  const url=new URL(request.url);

  if(url.pathname==="/api/auth/challenge"&&request.method==="POST"){
    const challenge=randomToken(18);
    const r=await doCall(env,"/challenge",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({challenge,ttl:CODE_TTL})});
    if(!r.ok)return Response.json({ok:false,error:"Не удалось создать запрос авторизации"},{status:503});
    return Response.json({ok:true,challenge,botUrl:"https://t.me/"+String(env.TELEGRAM_BOT_USERNAME||"").replace(/^@/,"")+"?start=auth_"+challenge,expiresIn:CODE_TTL});
  }

  if(url.pathname==="/api/auth/verify"&&request.method==="POST"){
    try{
      const body=await request.json(),challenge=String(body.challenge||""),code=String(body.code||"").replace(/\D/g,"");
      if(code.length!==6)return Response.json({ok:false,error:"Нужен 6-значный код"},{status:400});
      const r=await doCall(env,"/consume",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({challenge,code})});
      const result=await r.json();
      if(!result.ok)return Response.json({ok:false,error:result.error||"Код неверный или уже использован"},{status:401});
      const token=await session(result.user,env.TELEGRAM_BOT_TOKEN);
      return new Response(JSON.stringify({ok:true,user:result.user}),{status:200,headers:{"content-type":"application/json","cache-control":"no-store","set-cookie":cookie(token)}});
    }catch(error){return Response.json({ok:false,error:error?.message||"Ошибка авторизации"},{status:400})}
  }

  if(url.pathname==="/api/auth/me"){
    const user=await readSession(request,env.TELEGRAM_BOT_TOKEN);
    return Response.json({ok:true,authenticated:Boolean(user),user:user||null});
  }
  if(url.pathname==="/api/auth/logout"&&request.method==="POST"){
    return new Response(JSON.stringify({ok:true}),{headers:{"content-type":"application/json","set-cookie":cookie("",0)}});
  }
  return null;
}
export async function activateTelegramChallenge(env,challenge,chatId){
  if(!challenge||chatId===null)return false;
  const r=await doCall(env,"/activate",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({challenge,chatId:String(chatId),ttl:CODE_TTL})});
  return r.ok;
}
export async function getActiveTelegramChallenge(env,chatId){
  if(chatId===null)return "";
  const r=await doCall(env,"/active",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({chatId:String(chatId)})});
  if(!r.ok)return "";
  const d=await r.json().catch(()=>({}));
  return String(d.challenge||"");
}
export async function checkTelegramCodeCooldown(env,chatId){
  if(chatId===null)return {allowed:false,wait:0};
  const r=await doCall(env,"/code-cooldown",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({chatId:String(chatId),ttl:1800})});
  if(!r.ok)return {allowed:false,wait:0,error:true};
  return r.json().catch(()=>({allowed:false,wait:0,error:true}));
}
export async function createTelegramChallenge(env,challenge,user,chatId=""){

  if(!user?.id)return false;
  const a=new Uint32Array(1);crypto.getRandomValues(a);
  const code=String(100000+(a[0]%900000));
  const r=await doCall(env,"/bind",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({challenge,code,user,chatId:String(chatId||""),ttl:CODE_TTL})});
  return r.ok?code:false;
}

export async function createStandaloneTelegramCode(env,user,chatId=""){
  return createTelegramChallenge(env,"",user,chatId);
}

export async function createStandaloneTelegramCode(env,user,chatId=""){
  return createTelegramChallenge(env,"",user,chatId);
}
