import { createTelegramChallenge } from "../auth/telegram.js";

function appUrl(request, env) {
  return String(env.TELEGRAM_WEBAPP_URL || new URL(request.url).origin).replace(/\/$/, "");
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
      });
      if(!code)return Response.json({method:"sendMessage",chat_id:id,text:"❌ Запрос авторизации истёк. Вернись на сайт и нажми «Получить код» ещё раз."});
      return Response.json({
        method:"sendMessage",chat_id:id,
        text:"🔐 Код входа в Ok Music\n\n"+code+"\n\nВведи этот код на сайте. Код одноразовый и действует 5 минут."
      });
    }
    const isStart=/^\/start(?:@[^\s]+)?(?:\s|$)/i.test(text);
    if(isStart){
      return Response.json({
        method:"sendMessage",chat_id:id,
        text:"🎵 Ok Music\n\nЧтобы войти с браузера, сначала открой сайт и нажми «Получить код в Telegram». Я пришлю одноразовый код сюда."
      });
    }
    if(/^\/(help|app|music)(?:@[^\s]+)?(?:\s|$)/i.test(text)){
      return Response.json({
        method:"sendMessage",chat_id:id,
        text:"🎵 Ok Music\n\nБраузер: открой сайт → «Получить код в Telegram» → вернись сюда → введи присланный код на сайте."
      });
    }
    return Response.json({ok:true});
  }catch(error){
    return Response.json({ok:true});
  }
}
