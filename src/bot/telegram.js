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
      const activated=await activateTelegramChallenge(env,authChallenge,id);
      await sendTelegram(env,id,activated
        ? "🔐 Запрос авторизации получен. Теперь отправь /code — только эта команда выдаст одноразовый код."
        : "❌ Запрос авторизации истёк. Вернись на сайт и нажми «Получить код в Telegram» ещё раз.");
      return Response.json({ok:true});
    }
    if(/^\/code(?:@[^\\s]+)?(?:\\s|$)/i.test(text)){
      const challenge=await getActiveTelegramChallenge(env,id);
      if(!challenge){
        await sendTelegram(env,id,"❌ Активного запроса авторизации нет. Сначала открой сайт и нажми «Получить код в Telegram».");
        return Response.json({ok:true});
      }
      const user=update.message.from;
      const code=await createTelegramChallenge(env,challenge,{
        id:String(user?.id||""),
        first_name:String(user?.first_name||""),
        last_name:String(user?.last_name||""),
        username:String(user?.username||""),
        photo_url:""
      },id);
      await sendTelegram(env,id,code
        ? "🔐 Код входа в Ok Music\n\n"+code+"\n\nВведи этот код на сайте. Код одноразовый и действует 5 минут."
        : "❌ Запрос авторизации истёк. Вернись на сайт и нажми «Получить код в Telegram» ещё раз.");
      return Response.json({ok:true});
    }
    if(/^\/start(?:@[^\s]+)?(?:\s|$)/i.test(text)||/^\/app(?:@[^\s]+)?(?:\s|$)/i.test(text)){
      const appUrl=String(env.TELEGRAM_WEBAPP_URL||"").replace(/\/$/,"");
      if(appUrl){
        await sendTelegram(env,id,"🎵 Ok Music\n\nОткрывай приложение:",{
          inline_keyboard:[[{text:"🎵 Открыть Ok Music",web_app:{url:appUrl}}]]
        });
      }else{
        await sendTelegram(env,id,"❌ TELEGRAM_WEBAPP_URL не настроен.");
      }
      return Response.json({ok:true});
    }
    if(/^\/(?:help|music)(?:@[^\s]+)?(?:\s|$)/i.test(text)){
      await sendTelegram(env,id,"🎵 Ok Music\n\n/start или /app — открыть приложение.\n/code — выдать одноразовый код для активного запроса авторизации в браузере.");
      return Response.json({ok:true});
    }
    return Response.json({ok:true});
  }catch(error){
    console.error("[Telegram webhook]",error);
    return Response.json({ok:true});
  }
}
