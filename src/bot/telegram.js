import { activateTelegramChallenge, createTelegramChallenge, getActiveTelegramChallenge } from "../auth/telegram.js";

async function sendTelegram(env,chatId,text,reply_markup){

  const token=String(env.TELEGRAM_BOT_TOKEN||"");
  if(!token)throw new Error("TELEGRAM_BOT_TOKEN is not configured");
  const r=await fetch("https://api.telegram.org/bot"+token+"/sendMessage",{
    method:"POST",
    headers:{"content-type":"application/json"},
    body:JSON.stringify({chat_id:chatId,text,...(reply_markup?{reply_markup}: {})})
  });
  if(!r.ok)throw new Error("Telegram sendMessage failed: "+r.status);
  return r;
}

function textOf(update){return String(update?.message?.text||"").trim()}
function chatId(update){return update?.message?.chat?.id??null}
function startArg(text){
  const m=text.match(/^\/start(?:@[^\s]+)?\s+auth_([A-Za-z0-9_-]+)$/i);
  return m?m[1]:"";
}
export async function handleTelegramWebhook(request,env){
  try{
    const update=await request.json();
    const id=chatId(update);
    if(id===null)return Response.json({ok:true});
    const text=textOf(update);
    const authChallenge=startArg(text);
    if(authChallenge){
      const user=update.message.from;
      const code=await createTelegramChallenge(env,authChallenge,{
        id:String(user?.id||""),
        first_name:String(user?.first_name||""),
        last_name:String(user?.last_name||""),
        username:String(user?.username||""),
        photo_url:""
      },id);
      await sendTelegram(env,id,code
        ? "🔐 Код входа в Ok Music\n\n"+code+"\n\nВведи этот код на сайте. Код одноразовый и действует 5 минут."
        : "❌ Запрос авторизации истёк. Вернись на сайт и нажми «Получить код» ещё раз.");
      return Response.json({ok:true});
    }
    if(/^\/start(?:@[^\s]+)?(?:\s|$)/i.test(text)){
      await sendTelegram(env,id,"🎵 Ok Music\n\nЧтобы войти с браузера, сначала открой сайт и нажми «Получить код в Telegram». Я пришлю одноразовый код сюда.");
      return Response.json({ok:true});
    }
    if(/^\/(?:help|app|music)(?:@[^\s]+)?(?:\s|$)/i.test(text)){
      await sendTelegram(env,id,"🎵 Ok Music\n\nБраузер: открой сайт → «Получить код в Telegram» → вернись сюда → введи присланный код на сайте.");
      return Response.json({ok:true});
    }
    return Response.json({ok:true});
  }catch(error){
    console.error("[Telegram webhook]",error);
    return Response.json({ok:true});
  }
}
