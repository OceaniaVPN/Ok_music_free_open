
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
export async function handleTelegramWebhook(request,env){
  try{
    const update=await request.json();
    const id=chatId(update);
    if(id===null)return Response.json({ok:true});
    const text=textOf(update);

    if(/^\/code(?:@[^\s]+)?(?:\s|$)/i.test(text)){
      const user=update.message.from;
      const code=await createTelegramCode(env,{
        id:String(user?.id||""),
        first_name:String(user?.first_name||""),
        last_name:String(user?.last_name||""),
        username:String(user?.username||""),
        photo_url:""
      },id);
      await sendTelegram(env,id,code
        ? "🔐 Код входа в Ok Music\n\n"+code+"\n\nВведи его на сайте. Код одноразовый и действует 5 минут."
        : "❌ Не удалось создать код. Попробуй ещё раз.");
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
      await sendTelegram(env,id,"🎵 Ok Music\n\n/start или /app — открыть приложение.\n");
      return Response.json({ok:true});
    }

    return Response.json({ok:true});
  }catch(error){
    console.error("[Telegram webhook]",error);
    return Response.json({ok:true});
  }
}
