export function renderApp(request, env) {
  const appName = env.APP_NAME || "Ok Music";
  const html = String.raw`<!doctype html>
<html lang="ru">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<meta name="theme-color" content="#090a10"><meta name="referrer" content="strict-origin-when-cross-origin"><script src="https://telegram.org/js/telegram-web-app.js?63"></script>
<title>${appName}</title>
<style>
@import url('https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&display=swap');
:root{color-scheme:dark;font-family:Manrope,system-ui,sans-serif;--bg:#080910;--panel:rgba(19,21,32,.72);--panel2:#151827;--text:#f8f8ff;--muted:#9499ad;--line:rgba(255,255,255,.09);--a:#8b5cf6;--b:#22d3ee;--pink:#ec4899}
*{box-sizing:border-box}html,body{margin:0;min-height:100%;background:radial-gradient(circle at 15% 0%,#24134a 0,transparent 34%),radial-gradient(circle at 90% 18%,#063b50 0,transparent 30%),var(--bg);color:var(--text)}
body{overflow-x:hidden}.app{width:min(1080px,100%);margin:auto;padding:20px 20px 190px}.top{display:flex;align-items:center;justify-content:space-between;gap:16px;margin:6px 0 28px}.brand{display:flex;align-items:center;gap:12px}.logo{width:48px;height:48px;border-radius:16px;background:linear-gradient(135deg,var(--a),var(--pink) 55%,var(--b));display:grid;place-items:center;box-shadow:0 10px 40px #8b5cf633;font-size:24px}.brand h1{margin:0;font-size:22px;letter-spacing:-.7px}.brand span{display:block;color:var(--muted);font-size:11px;margin-top:2px}.avatar{width:42px;height:42px;border:1px solid var(--line);border-radius:50%;background:var(--panel);color:white}
.hero{position:relative;overflow:hidden;border:1px solid var(--line);border-radius:30px;padding:34px;background:linear-gradient(135deg,rgba(139,92,246,.25),rgba(34,211,238,.08) 55%,rgba(236,72,153,.12));box-shadow:0 30px 90px #0008;margin-bottom:22px}.hero:after{content:"";position:absolute;width:260px;height:260px;border-radius:50%;background:#8b5cf655;filter:blur(70px);right:-100px;top:-100px}.hero h2{position:relative;z-index:1;font-size:clamp(30px,6vw,58px);line-height:1.02;max-width:650px;margin:0 0 12px;letter-spacing:-2px}.hero p{position:relative;z-index:1;color:#c1c5d5;margin:0 0 24px;max-width:600px}.searchbar{position:relative;z-index:2;display:flex;gap:10px;max-width:700px}.searchbar input{flex:1;min-width:0}.input{width:100%;border:1px solid var(--line);border-radius:17px;padding:15px 17px;background:rgba(8,9,16,.62);color:white;outline:0}.input:focus{border-color:#9b7aff;box-shadow:0 0 0 4px #8b5cf622}.primary{border:0!important;background:linear-gradient(135deg,var(--a),var(--pink));font-weight:800;box-shadow:0 10px 30px #8b5cf633}
.grid{display:grid;grid-template-columns:repeat(4,1fr);gap:14px}.card{border:1px solid var(--line);background:var(--panel);backdrop-filter:blur(20px);border-radius:22px;padding:14px;transition:.2s transform,.2s border-color}.card:hover{transform:translateY(-3px);border-color:#ffffff25}.cover{aspect-ratio:1;border-radius:17px;background:linear-gradient(135deg,#272a3d,#11121c);overflow:hidden;position:relative;display:grid;place-items:center;font-size:38px}.cover img{width:100%;height:100%;object-fit:cover}.cover .play{position:absolute;right:10px;bottom:10px;width:44px;height:44px;border:0;border-radius:50%;background:white;color:#111;opacity:0;transform:translateY(5px);transition:.2s;font-size:16px}.card:hover .cover .play{opacity:1;transform:none}.title{font-weight:800;margin-top:12px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.sub{font-size:12px;color:var(--muted);margin-top:4px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.section{display:flex;align-items:end;justify-content:space-between;margin:30px 2px 14px}.section h2{margin:0;font-size:21px;letter-spacing:-.6px}.section small{color:var(--muted)}
.results{display:grid;gap:8px}.result{display:flex;align-items:center;gap:14px;padding:10px;border:1px solid transparent;border-radius:18px;transition:.15s}.result:hover{background:rgba(255,255,255,.04);border-color:var(--line)}.mini{width:62px;height:62px;flex:0 0 62px;border-radius:14px;overflow:hidden;background:linear-gradient(135deg,#292d40,#11121a);display:grid;place-items:center;font-size:23px}.mini img{width:100%;height:100%;object-fit:cover}.meta{min-width:0;flex:1}.meta strong{display:block;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.meta span{display:block;color:var(--muted);font-size:12px;margin-top:4px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.actions{display:flex;gap:7px}.icon{width:40px;height:40px;padding:0;border-radius:13px}
button{font:inherit;color:inherit;cursor:pointer;border:1px solid var(--line);background:rgba(255,255,255,.045);border-radius:14px;padding:11px 14px;transition:.15s}button:hover{background:rgba(255,255,255,.1);transform:translateY(-1px)}
.empty{border:1px dashed var(--line);border-radius:20px;padding:35px;text-align:center;color:var(--muted)}
.player{position:fixed;z-index:60;left:50%;bottom:14px;transform:translateX(-50%);width:min(820px,calc(100% - 22px));border:1px solid #ffffff18;background:rgba(14,15,24,.94);backdrop-filter:blur(28px);border-radius:24px;padding:12px 14px;box-shadow:0 25px 80px #000b;display:none}.player.on{display:grid;grid-template-columns:auto minmax(0,1fr) auto;align-items:center;gap:13px}.fx-panel{grid-column:1/-1;border-top:1px solid var(--line);padding:12px 4px 2px}.eq-grid{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:8px}.eq-band{min-width:0;text-align:center}.eq-band input{width:100%;accent-color:#a78bfa}.eq-band small{display:block;color:var(--muted);font-size:9px;margin-top:3px}.pcover{width:50px;height:50px;border-radius:14px;overflow:hidden;background:#25283a;display:grid;place-items:center}.pcover img{width:100%;height:100%;object-fit:cover}.pmeta{min-width:0}.pmeta strong,.pmeta span{display:block;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.pmeta span{font-size:11px;color:var(--muted);margin-top:3px}.pc{display:flex;align-items:center;gap:7px}.pc .big{width:48px;height:48px;border-radius:50%;background:white;color:#111;border:0}.seek{grid-column:1/-1;width:100%;accent-color:#a78bfa}.time{font-size:10px;color:var(--muted)}
.nav{position:fixed;z-index:50;bottom:max(12px,env(safe-area-inset-bottom));left:50%;transform:translateX(-50%);width:min(560px,calc(100% - 20px));display:grid;grid-template-columns:repeat(4,1fr);gap:5px;padding:7px;pointer-events:auto;border:1px solid #ffffff15;border-radius:22px;background:rgba(13,14,22,.78);backdrop-filter:blur(22px);box-shadow:0 20px 60px #0009}.nav button{border:0;background:transparent;padding:9px 5px;color:#8f93a7;font-size:20px;line-height:1;min-height:48px;touch-action:manipulation}.nav button span{display:block;font-size:10px;font-weight:700;margin-top:5px}.nav button.active{background:linear-gradient(135deg,#8b5cf622,#ec489922);color:white}
.playlist{display:flex;align-items:center;gap:14px;padding:13px;border:1px solid var(--line);border-radius:20px;background:var(--panel);margin-bottom:10px}.playlist .pic{width:58px;height:58px;border-radius:15px;background:linear-gradient(135deg,var(--a),var(--pink));display:grid;place-items:center;font-size:24px}.playlist main{flex:1;min-width:0}.playlist strong{display:block}.playlist span{font-size:12px;color:var(--muted)}.danger{color:#fb7185}
.modal{position:fixed;inset:0;z-index:20;background:#0009;backdrop-filter:blur(10px);display:none;place-items:center;padding:18px}.modal.open{display:grid}.dialog{width:min(440px,100%);background:#131521;border:1px solid var(--line);border-radius:25px;padding:22px;box-shadow:0 30px 100px #000}.dialog h3{margin:0 0 8px}.dialog p{color:var(--muted);font-size:13px}.dialog .row{display:flex;gap:8px;margin-top:16px}
.toast{position:fixed;z-index:30;top:20px;left:50%;transform:translate(-50%,-15px);opacity:0;pointer-events:none;padding:12px 17px;border:1px solid var(--line);background:#171927eF;border-radius:15px;transition:.2s}.toast.show{opacity:1;transform:translate(-50%,0)}
@media(max-width:800px){.grid{grid-template-columns:repeat(2,1fr)}.hero{padding:25px}.player{bottom:82px}.nav{bottom:12px}}@media(max-width:480px){.app{padding:18px 14px 150px}.top{margin-bottom:20px}.hero{border-radius:24px;padding:22px}.searchbar{flex-direction:column}.grid{gap:10px}.card{padding:10px}.cover .play{opacity:1;transform:none}.player.on{grid-template-columns:auto 1fr}.pc{grid-column:3}.player{padding:10px}.nav{width:calc(100% - 18px)}}
</style>
<style id="mobile-fix">
.moods{display:grid;grid-template-columns:repeat(3,1fr);gap:12px}.mood-card{min-height:150px;text-align:left;padding:18px;display:flex;flex-direction:column;justify-content:flex-end;border-radius:22px;background:linear-gradient(145deg,rgba(139,92,246,.2),rgba(255,255,255,.035));border:1px solid var(--line);touch-action:manipulation}.mood-card b{font-size:35px;margin-bottom:auto}.mood-card strong{font-size:16px}.mood-card span{color:var(--muted);font-size:11px;margin-top:5px}@media(max-width:600px){.app{padding:14px 12px 215px}.top{margin:4px 0 18px}.hero{padding:19px}.hero h2{font-size:31px;letter-spacing:-1.2px}.hero p{font-size:13px}.grid{grid-template-columns:repeat(2,minmax(0,1fr));gap:9px}.card{min-width:0;border-radius:18px}.cover{border-radius:14px}.title{font-size:13px}.sub{font-size:10px}.section{margin:23px 2px 11px}.section h2{font-size:19px}.moods{grid-template-columns:repeat(2,minmax(0,1fr));gap:9px}.mood-card{min-height:135px;padding:14px}.result{gap:9px;padding:8px}.mini{width:54px;height:54px;flex-basis:54px}.actions{gap:4px}.icon{width:36px;height:36px;padding:0}.player{bottom:79px;width:calc(100% - 10px);padding:8px 9px;border-radius:18px}.player.on{grid-template-columns:45px minmax(0,1fr) auto;gap:8px}.pcover{width:45px;height:45px}.pc{gap:4px}.pc .big{width:40px;height:40px}.fx-panel{padding-top:10px}.eq-grid{gap:3px}.eq-band input{height:92px;writing-mode:vertical-lr;direction:rtl}.eq-band small{font-size:8px}.nav{z-index:70}.pmeta strong{font-size:12px}.pmeta span{font-size:10px}.pc .big{width:42px;height:42px}.nav{width:calc(100% - 12px);bottom:max(6px,env(safe-area-inset-bottom));border-radius:20px;padding:5px}.nav button{min-height:50px;padding:7px 3px}.nav button span{font-size:9px}.searchbar button{width:100%}.input{font-size:16px}.empty{padding:27px 15px}.playlist{padding:10px;gap:9px}.playlist .pic{width:48px;height:48px}.playlist button{padding:9px 8px;font-size:11px}}@media(max-width:350px){.grid{grid-template-columns:1fr}.moods{grid-template-columns:1fr}.mood-card{min-height:105px}.nav button span{font-size:8px}}
.taste-panel{border:1px solid var(--line);border-radius:24px;padding:18px;background:var(--panel);margin:0 0 20px}.taste-panel h3{margin:0 0 6px}.taste-panel p{margin:0;color:var(--muted);font-size:12px}.chips{display:flex;flex-wrap:wrap;gap:8px;margin-top:12px}.chip{padding:9px 12px;border-radius:999px;font-size:12px}.chip.on{background:linear-gradient(135deg,var(--a),var(--pink));border-color:transparent}.taste-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:12px}.taste-field label{display:block;font-size:11px;color:var(--muted);margin-bottom:7px}.taste-actions{display:flex;gap:8px;margin-top:14px}@media(max-width:600px){.taste-grid{grid-template-columns:1fr}.taste-panel{padding:14px}}</style></head>
<body>
<div class="app">
  <header class="top"><div class="brand"><div class="logo">♫</div><div><h1>Ok Music</h1><span>Твоя музыка. Твоё настроение.</span></div></div><button class="avatar" id="tasteBtn" title="Мой музыкальный вкус">♪</button></header>
  <main id="view"></main>
</div>
<div id="player" class="player"></div>
<nav class="nav" id="nav"><button data-view="home" class="active">⌂<span>Главная</span></button><button data-view="mood">◈<span>Настроение</span></button><button data-view="search">⌕<span>Поиск</span></button><button data-view="library">♫<span>Плейлисты</span></button></nav>
<div id="modal" class="modal"><div class="dialog"><h3>Новый плейлист</h3><p>Придумай название — треки можно будет добавлять из поиска.</p><input id="playlistName" class="input" placeholder="Например: Ночная поездка"><div class="row"><button id="closeModal">Отмена</button><button id="createPlaylist" class="primary">Создать</button></div></div></div>
<div id="toast" class="toast"></div><div id="tasteModal" class="modal"><div class="dialog"><h3>🎧 Мой музыкальный вкус</h3><p>Выбери любимые направления и настроение — Ok Music будет учитывать их в каждом миксе.</p><div class="taste-grid"><div class="taste-field"><label>Любимые жанры</label><div id="genreChips" class="chips"></div></div><div class="taste-field"><label>Настроение</label><div id="moodChips" class="chips"></div></div></div><div style="margin-top:14px"><label style="display:block;font-size:11px;color:var(--muted);margin-bottom:7px">Любимые исполнители</label><input id="tasteArtists" class="input" placeholder="Например: Miyagi, The Weeknd, Кино"></div><div style="margin-top:14px"><label style="display:block;font-size:11px;color:var(--muted);margin-bottom:7px">Что хочется сейчас</label><input id="tasteNow" class="input" placeholder="Например: спокойный русский рэп для дороги"></div><div class="taste-actions"><button id="tasteCancel">Отмена</button><button id="tasteSave" class="primary" style="flex:1">Сохранить вкус ✨</button></div></div></div>
<script>
const view=document.querySelector("#view"), playerEl=document.querySelector("#player"), modal=document.querySelector("#modal"), toastEl=document.querySelector("#toast");
const KEY="okmusic:v2";
let state;
try{state=JSON.parse(localStorage.getItem(KEY)||"{}")}catch{state={}}
state=state&&typeof state==="object"?state:{};
state.liked=Array.isArray(state.liked)?state.liked:[];
state.playlists=Array.isArray(state.playlists)?state.playlists:[];
state.taste=state.taste&&typeof state.taste==="object"?state.taste:{};
state.taste.genres=Array.isArray(state.taste.genres)?state.taste.genres:[];
state.taste.moods=Array.isArray(state.taste.moods)?state.taste.moods:[];
state.taste.artists=typeof state.taste.artists==="string"?state.taste.artists:"";
state.taste.now=typeof state.taste.now==="string"?state.taste.now:"";
let tracks=[], current=null, currentIndex=-1, audio=new Audio(), nextAudio=new Audio(), playing=false, autoNext=true, nextPreloadToken=0;
audio.preload="auto";
audio.crossOrigin="anonymous";
nextAudio.preload="auto";
nextAudio.setAttribute("aria-hidden","true");
const AUDIO_KEY="okmusic:audio";
const eqBands=["60","250","1K","4K","12K"];
let audioFx={eq:[0,0,0,0,0]};
try{audioFx={...audioFx,...JSON.parse(localStorage.getItem(AUDIO_KEY)||"{}")}}catch{}
function saveAudioFx(){localStorage.setItem(AUDIO_KEY,JSON.stringify(audioFx))}
let audioCtx=null,audioSource=null,eqNodes=[],fxReady=false;
function initAudioFx(){
 if(fxReady)return true;
 try{
  audioCtx=new (window.AudioContext||window.webkitAudioContext)();
  audioSource=audioCtx.createMediaElementSource(audio);
  const freqs=[60,250,1000,4000,12000];
  eqNodes=freqs.map((f,i)=>{
   const n=audioCtx.createBiquadFilter();
   n.type=i===0?"lowshelf":i===4?"highshelf":"peaking";
   n.frequency.value=f;
   n.Q.value=i===0||i===4?0.7:1.1;
   n.gain.value=Number(audioFx.eq[i]||0);
   return n;
  });
  eqNodes.reduce((a,b)=>a.connect(b),audioSource);
  eqNodes[4].connect(audioCtx.destination);
  fxReady=true;
  return true;
 }catch(e){return false}
}
function setEq(i,v){
 audioFx.eq[i]=Number(v);
 if(eqNodes[i])eqNodes[i].gain.value=Number(v);
 saveAudioFx();
}
const demos=[
{id:"demo-1",title:"Midnight Waves",artist:"Ok Music",image:"",audio:"https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",source:"Demo"},
{id:"demo-2",title:"Neon Drive",artist:"Ok Music",image:"",audio:"https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",source:"Demo"},
{id:"demo-3",title:"Afterglow",artist:"Ok Music",image:"",audio:"https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",source:"Demo"},
{id:"demo-4",title:"Ocean Lights",artist:"Ok Music",image:"",audio:"https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3",source:"Demo"}];
function esc(s){return String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[c]))}
function save(){localStorage.setItem(KEY,JSON.stringify(state))}
function toast(s){toastEl.textContent=s;toastEl.classList.add("show");clearTimeout(window._toast);window._toast=setTimeout(()=>toastEl.classList.remove("show"),1800)}
function fmt(n){return Number.isFinite(n)&&n>0?Math.floor(n/60)+":"+String(Math.floor(n%60)).padStart(2,"0"):"0:00"}
function card(t){return '<article class="card"><div class="cover">'+(t.image?'<img src="'+esc(t.image)+'" loading="lazy">':"♫")+'<button class="play" data-play="'+esc(t.id)+'">▶</button></div><div class="title">'+esc(t.title)+'</div><div class="sub">'+esc(t.artist)+'</div></article>'}
function result(t){const liked=state.liked.some(x=>x.id===t.id);return '<div class="result"><div class="mini">'+(t.image?'<img src="'+esc(t.image)+'" loading="lazy">':"♫")+'</div><div class="meta"><strong>'+esc(t.title)+'</strong><span>'+esc(t.artist)+(t.source?" · "+esc(t.source):"")+(t.album?" · "+esc(t.album):"")+'</span></div><div class="actions"><button class="icon" data-like="'+esc(t.id)+'">'+(liked?"♥":"♡")+'</button><button class="icon" data-add="'+esc(t.id)+'">＋</button><button class="icon" data-play="'+esc(t.id)+'">▶</button></div></div>'}
function bind(container=view){container.querySelectorAll("[data-play]").forEach(b=>b.onclick=()=>play(tracks.find(t=>t.id===b.dataset.play)||state.liked.find(t=>t.id===b.dataset.play)));container.querySelectorAll("[data-like]").forEach(b=>b.onclick=()=>like(tracks.find(t=>t.id===b.dataset.like)||state.liked.find(t=>t.id===b.dataset.like)));container.querySelectorAll("[data-add]").forEach(b=>b.onclick=()=>addToPlaylist(tracks.find(t=>t.id===b.dataset.add)||state.liked.find(t=>t.id===b.dataset.add)))}
function addToPlaylist(t){if(!t)return;if(!state.playlists.length){toast("Сначала создай плейлист");modal.classList.add("open");document.querySelector("#playlistName").focus();return}const names=state.playlists.map((p,i)=>(i+1)+". "+p.name+" ("+p.tracks.length+")").join("\n");const answer=window.prompt("Добавить в какой плейлист?\\n\\n"+names+"\\n\\nВведи номер:","1");const n=Number(answer);if(!Number.isInteger(n)||!state.playlists[n-1])return;const p=state.playlists[n-1];if(p.tracks.some(x=>x.id===t.id)){toast("Трек уже есть в плейлисте");return}p.tracks.push(t);save();toast("Добавлено в «"+p.name+"» ✨")}
const TASTE_GENRES=["Русский рэп","Поп","Рок","Электроника","Хип-хоп","R&B","Lo-fi","Инди","Метал","Классика","Джаз","K-pop"]; const TASTE_MOODS=["Спокойно","Энергично","Грустно","Романтично","Ночью","Для дороги","Вечеринка","Фон для работы"]; function openTaste(){const m=document.querySelector("#tasteModal"),g=document.querySelector("#genreChips"),mo=document.querySelector("#moodChips");g.innerHTML=TASTE_GENRES.map(x=>'<button class="chip '+(state.taste.genres.includes(x)?"on":"")+'" data-g="'+esc(x)+'">'+esc(x)+'</button>').join("");mo.innerHTML=TASTE_MOODS.map(x=>'<button class="chip '+(state.taste.moods.includes(x)?"on":"")+'" data-m="'+esc(x)+'">'+esc(x)+'</button>').join("");g.querySelectorAll("[data-g]").forEach(b=>b.onclick=()=>{const x=b.dataset.g;state.taste.genres=state.taste.genres.includes(x)?state.taste.genres.filter(v=>v!==x):[...state.taste.genres,x];b.classList.toggle("on")});mo.querySelectorAll("[data-m]").forEach(b=>b.onclick=()=>{const x=b.dataset.m;state.taste.moods=state.taste.moods.includes(x)?state.taste.moods.filter(v=>v!==x):[...state.taste.moods,x];b.classList.toggle("on")});document.querySelector("#tasteArtists").value=state.taste.artists||"";document.querySelector("#tasteNow").value=state.taste.now||"";m.classList.add("open")} document.querySelector("#tasteBtn").onclick=openTaste; document.querySelector("#tasteCancel").onclick=()=>document.querySelector("#tasteModal").classList.remove("open"); document.querySelector("#tasteSave").onclick=()=>{state.taste.artists=document.querySelector("#tasteArtists").value.trim();state.taste.now=document.querySelector("#tasteNow").value.trim();save();document.querySelector("#tasteModal").classList.remove("open");toast("Вкус сохранён ✨");render("home")}; async function home(){
 tracks=demos;
 view.innerHTML='<section class="hero"><h2>Музыка, которая звучит <em>как ты.</em></h2><p>Умная подборка из музыкальных каталогов подстраивается под твои любимые треки.</p><div class="searchbar"><input id="homeQ" class="input" placeholder="Исполнитель, трек или настроение"><button id="homeSearch" class="primary">Найти музыку</button></div></section><div class="taste-panel"><h3>🎧 Твой музыкальный профиль</h3><p>Настрой предпочтения, и алгоритм будет учитывать их в каждом новом миксе.</p><button id="editTaste" style="margin-top:12px">Настроить вкус</button></div><div class="section" style="display:flex;align-items:center;justify-content:space-between;gap:10px"><div><h2>✨ Твой микс</h2><small id="mixStatus">Подбираю музыку…</small></div><button id="refreshMix" class="primary" title="Пересобрать подборку">↻ Обновить</button></div><div id="mix" class="grid"><div class="empty" style="grid-column:1/-1">Создаю персональную подборку…</div></div>';
 document.querySelector("#homeSearch").onclick=()=>doSearch(document.querySelector("#homeQ").value);document.querySelector("#homeQ").onkeydown=e=>{if(e.key==="Enter")doSearch(e.target.value)};
 document.querySelector("#editTaste").onclick=openTaste;
 document.querySelector("#refreshMix").onclick=()=>loadMix(true);
 bind();
 await loadMix();
}
async function loadMix(force=false){
 const refresh=force?String(Date.now()):"";
 const seed=[...state.liked.slice(0,8).map(t=>t.artist),...state.liked.slice(0,5).map(t=>t.genre||""),...(state.taste.genres||[]),...(state.taste.moods||[]),state.taste.artists,state.taste.now].filter(Boolean).join(", ");
 const box=document.querySelector("#mix"), status=document.querySelector("#mixStatus");
 try{
   const r=await fetch("/api/recommendations?limit=16&seed="+encodeURIComponent(seed)+"&genres="+encodeURIComponent(state.taste.genres.join(", "))+"&moods="+encodeURIComponent(state.taste.moods.join(", "))+"&artists="+encodeURIComponent(state.taste.artists)+"&now="+encodeURIComponent(state.taste.now)+"&liked="+encodeURIComponent(state.liked.slice(0,10).map(t=>t.artist+" "+t.title).join(", "))+"&refresh="+encodeURIComponent(refresh));
   const d=await r.json();
   if(!d.ok || !d.tracks?.length) throw Error("Нет доступных рекомендаций");
   tracks=d.tracks;
   box.innerHTML=d.tracks.map(card).join("");
   status.textContent=(d.mode==="personalized"?"Под твои предпочтения":"Новая подборка")+" · "+(d.providers||[]).join(" + ");
   bind(box);
 }catch(e){
   tracks=demos;
   box.innerHTML=demos.map(card).join("");
   status.textContent="Демо-подборка · каталоги пока недоступны";
   bind(box);
 }
}

function mood(){
 const moodItems=[["🌙","Ночной вайб","Спокойное и атмосферное"],["⚡","Энергия","Больше ритма и движения"],["☁️","Chill","Расслабиться и выдохнуть"],["💜","Любовь","Мягкие и тёплые треки"],["🚗","В дорогу","Музыка для долгой поездки"],["🔥","Вечеринка","Ритм, который не отпускает"]];
 view.innerHTML='<div class="section"><h2>Какое настроение?</h2><small>Выбери атмосферу</small></div><div class="moods">'+moodItems.map((x,i)=>'<button class="mood-card" data-mood="'+i+'"><b>'+x[0]+'</b><strong>'+x[1]+'</strong><span>'+x[2]+'</span></button>').join('')+'</div><div class="section"><h2>Популярное</h2><small>Для хорошего настроения</small></div><div class="grid">'+demos.map(card).join('')+'</div>';
 bind();view.querySelectorAll('[data-mood]').forEach(b=>b.onclick=()=>{toast('Подбираю: '+moodItems[Number(b.dataset.mood)][1]);tracks=[...demos];view.querySelector('.section h2').textContent=moodItems[Number(b.dataset.mood)][1];});
}
function searchView(){
 view.innerHTML='<div class="section"><h2>Поиск музыки</h2><small>Zaycev.net · Jamendo</small></div><div class="searchbar"><input id="q" class="input" placeholder="Исполнитель, название, жанр…"><button id="go" class="primary">Искать</button></div><div id="results" class="results" style="margin-top:18px"><div class="empty">Начни с названия трека или исполнителя.</div></div>';
 document.querySelector("#go").onclick=()=>doSearch(document.querySelector("#q").value);document.querySelector("#q").onkeydown=e=>{if(e.key==="Enter")doSearch(e.target.value)}
}
async function doSearch(q){
 q=String(q||"").trim(); if(!q){toast("Введи запрос");return}
 if(!document.querySelector("#results")){render("search");document.querySelector("#q").value=q}
 const box=document.querySelector("#results");box.innerHTML='<div class="empty">Ищу музыку…<br><small>Подбираю совпадения и обложки</small></div>';
 try{const r=await fetch("/api/search?q="+encodeURIComponent(q)+"&limit=30");const d=await r.json();if(!d.ok)throw Error(d.error||"Ошибка");tracks=d.tracks||[];box.innerHTML=tracks.length?tracks.map(result).join(""):'<div class="empty">Ничего не нашлось. Попробуй другой запрос.</div>';bind(box)}catch(e){box.innerHTML='<div class="empty">Поиск временно недоступен.<br><small>'+esc(e.message)+'</small></div>'}
}
function library(){
 view.innerHTML='<div class="section"><h2>Моя музыка</h2><button id="newPlaylist" class="primary">＋ Плейлист</button></div><div class="section"><h2>♥ Понравившиеся</h2><small>'+state.liked.length+' треков</small></div><div id="liked" class="results"></div><div class="section"><h2>Мои плейлисты</h2></div><div id="playlists"></div>';
 const liked=document.querySelector("#liked");liked.innerHTML=state.liked.length?state.liked.map(result).join(""):'<div class="empty">Пока ничего нет.<br>Нажимай ♡ рядом с любимыми треками.</div>';bind(liked);
 document.querySelector("#newPlaylist").onclick=()=>{modal.classList.add("open");document.querySelector("#playlistName").focus()};
 const ps=document.querySelector("#playlists");ps.innerHTML=state.playlists.length?state.playlists.map(p=>'<div class="playlist"><div class="pic">♫</div><main><strong>'+esc(p.name)+'</strong><span>'+p.tracks.length+' треков</span></main><button data-pl="'+esc(p.id)+'">Открыть</button><button class="danger" data-del="'+esc(p.id)+'">×</button></div>').join(""):'<div class="empty">Создай первый плейлист — например, «В дорогу».</div>';
 ps.querySelectorAll("[data-pl]").forEach(b=>b.onclick=()=>openPlaylist(b.dataset.pl));ps.querySelectorAll("[data-del]").forEach(b=>b.onclick=()=>{state.playlists=state.playlists.filter(p=>p.id!==b.dataset.del);save();library();toast("Плейлист удалён")});
}
function openPlaylist(id){const p=state.playlists.find(x=>x.id===id);if(!p)return;tracks=p.tracks;view.innerHTML='<div class="section"><h2>'+esc(p.name)+'</h2><small>'+p.tracks.length+' треков</small></div><div class="results">'+(p.tracks.length?p.tracks.map(result).join(""):'<div class="empty">Добавляй треки из поиска.</div>')+'</div>';bind()}
function like(t){if(!t)return;const i=state.liked.findIndex(x=>x.id===t.id);if(i>=0){state.liked.splice(i,1);toast("Убрано из любимого")}else{state.liked.unshift(t);toast("♥ Добавлено в любимое")}save();render(document.querySelector(".nav button.active").dataset.view)}
function findTrackIndex(t){return tracks.findIndex(x=>x?.id===t?.id)}
function preloadNext(){
 const i=findTrackIndex(current), next=i>=0?tracks[i+1]:null, token=++nextPreloadToken;
 if(!next?.audio&&!next?.src){nextAudio.removeAttribute("src");return}
 const src=next.audio||next.src;
 if(nextAudio.src===new URL(src,location.href).href)return;
 nextAudio.src=src;
 nextAudio.load();
 void token;
}
function play(t,{fromEnded=false}={}){
 if(!t)return;
 const idx=findTrackIndex(t);
 currentIndex=idx;
 current=t;
 if(!(t.audio||t.src)){toast("У этого трека нет прямого воспроизведения");return}
 const src=t.audio||t.src;
 if(audio.src!==new URL(src,location.href).href){
   audio.src=src;
   audio.load();
 }
 audio.play().then(()=>{playing=true;updateMediaSession();drawPlayer();preloadNext()}).catch(()=>toast("Браузер не разрешил воспроизведение"));
}
function playNext(){
 const next=tracks[currentIndex+1];
 if(next){play(next,{fromEnded:true});return}
 playing=false;
 if("mediaSession" in navigator)navigator.mediaSession.playbackState="none";
 drawPlayer();
}
function updateMediaSession(){
 if(!("mediaSession" in navigator)||!current)return;
 navigator.mediaSession.metadata=new MediaMetadata({
  title:current.title||"Ok Music",
  artist:current.artist||"",
  album:current.album||"Ok Music",
  artwork:current.image?[{src:current.image,sizes:"300x300"}]:[]
 });
 navigator.mediaSession.setActionHandler("play",()=>audio.play().catch(()=>{}));
 navigator.mediaSession.setActionHandler("pause",()=>audio.pause());
 navigator.mediaSession.playbackState=playing?"playing":"paused";
 navigator.mediaSession.setActionHandler("seekbackward",()=>{audio.currentTime=Math.max(0,audio.currentTime-10)});
 navigator.mediaSession.setActionHandler("seekforward",()=>{audio.currentTime=Math.min(audio.duration||Infinity,audio.currentTime+10)});
}
function drawPlayer(){if(!current){playerEl.className="player";return}
 playerEl.className="player on";

 playerEl.innerHTML='<div class="pcover">'+(current.image?'<img src="'+esc(current.image)+'">':"♫")+'</div><div class="pmeta"><strong>'+esc(current.title)+'</strong><span>'+esc(current.artist)+'</span></div><div class="pc"><button id="pause" class="big">'+(playing?"Ⅱ":"▶")+'</button></div><input id="seek" class="seek" type="range" min="0" max="100" value="0"><span class="time" id="ptime">'+fmt(audio.currentTime)+' / '+fmt(audio.duration)+'</span>';
 document.querySelector("#pause").onclick=()=>{if(playing){audio.pause();playing=false}else{audio.play();playing=true}drawPlayer()};document.querySelector("#seek").oninput=e=>{if(audio.duration)audio.currentTime=audio.duration*e.target.value/100}
}

audio.ontimeupdate=()=>{const s=document.querySelector("#seek"),t=document.querySelector("#ptime");if(s)s.value=audio.duration?audio.currentTime/audio.duration*100:0;if(t)t.textContent=fmt(audio.currentTime)+" / "+fmt(audio.duration);if("mediaSession" in navigator&&audio.duration)try{navigator.mediaSession.setPositionState({duration:audio.duration,playbackRate:audio.playbackRate,position:Math.min(audio.currentTime,audio.duration)})}catch{}}
audio.onplay=()=>{playing=true;if("mediaSession" in navigator)navigator.mediaSession.playbackState="playing";updateMediaSession();drawPlayer()};audio.onpause=()=>{playing=false;if("mediaSession" in navigator)navigator.mediaSession.playbackState="paused";drawPlayer()};audio.onended=()=>{playing=false;if(autoNext)playNext();else{if("mediaSession" in navigator)navigator.mediaSession.playbackState="none";drawPlayer()}};audio.onerror=()=>{toast("Не удалось загрузить аудио");playing=false;drawPlayer()};
nextAudio.onerror=()=>{nextAudio.removeAttribute("src")};
audio.addEventListener("canplay",preloadNext);
document.querySelector("#closeModal").onclick=()=>modal.classList.remove("open");modal.onclick=e=>{if(e.target===modal)modal.classList.remove("open")};
document.querySelector("#createPlaylist").onclick=()=>{const name=document.querySelector("#playlistName").value.trim();if(!name)return toast("Введи название");state.playlists.unshift({id:"pl-"+Date.now(),name,tracks:[]});save();document.querySelector("#playlistName").value="";modal.classList.remove("open");library();toast("Плейлист создан ✨")}
function render(name){document.querySelectorAll(".nav button").forEach(b=>b.classList.toggle("active",b.dataset.view===name));({home,mood,search:searchView,library}[name]||home)()}
document.querySelector("#nav").addEventListener("click",e=>{const b=e.target.closest("button[data-view]");if(b)render(b.dataset.view)});
if(window.Telegram?.WebApp){window.Telegram.WebApp.ready();window.Telegram.WebApp.expand();window.Telegram.WebApp.setHeaderColor("#090a10");window.Telegram.WebApp.setBackgroundColor("#080910")}
render("home");
</script>
</body></html>`;
  return new Response(html,{headers:{"content-type":"text/html; charset=utf-8","Referrer-Policy":"origin"}});
}
