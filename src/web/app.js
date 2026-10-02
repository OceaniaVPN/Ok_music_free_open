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
@import url('https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&family=Space+Grotesk:wght@500;600;700&display=swap');
:root{color-scheme:dark;font-family:Manrope,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;--bg:#03040a;--panel:rgba(13,15,27,.68);--text:#f7f8ff;--muted:#9298ae;--line:rgba(255,255,255,.09);--violet:#8b7cff;--cyan:#48e7ff;--pink:#ff5eb8;--lime:#c8ff72;--radius:26px;--glow:0 22px 80px rgba(0,0,0,.42)}
*{box-sizing:border-box}html,body{margin:0;min-height:100%;background:var(--bg);color:var(--text)}html{-webkit-text-size-adjust:100%;text-size-adjust:100%}
body{position:relative;isolation:isolate;overflow-x:hidden;overscroll-behavior-x:none;background:radial-gradient(circle at 12% -4%,rgba(139,124,255,.18),transparent 30%),radial-gradient(circle at 92% 8%,rgba(72,231,255,.13),transparent 27%),radial-gradient(circle at 58% 78%,rgba(255,94,184,.09),transparent 30%),linear-gradient(160deg,#04040b 0%,#070912 48%,#04040a 100%)}
body:before{content:"";position:fixed;inset:-25%;z-index:-2;pointer-events:none;background:conic-gradient(from 210deg at 50% 50%,rgba(139,124,255,.22),rgba(72,231,255,.16),rgba(255,94,184,.18),rgba(139,124,255,.22));filter:blur(95px);opacity:.55;animation:aurora 20s ease-in-out infinite alternate}
body:after{content:"";position:fixed;inset:0;z-index:-1;pointer-events:none;opacity:.22;background:radial-gradient(circle at 20% 30%,rgba(255,255,255,.8) 0 1px,transparent 1.5px),radial-gradient(circle at 72% 68%,rgba(255,255,255,.7) 0 1px,transparent 1.5px),radial-gradient(circle at 46% 14%,rgba(255,255,255,.6) 0 1px,transparent 1.5px);background-size:170px 170px,230px 230px,310px 310px;mask-image:linear-gradient(to bottom,black,transparent 85%)}
@keyframes aurora{0%{transform:translate3d(-4%,-2%,0) scale(1)}100%{transform:translate3d(5%,3%,0) scale(1.08)}}
::selection{background:rgba(139,124,255,.35);color:#fff}
button,input{font:inherit;touch-action:manipulation}button{border:1px solid var(--line);border-radius:16px;padding:11px 14px;color:inherit;background:rgba(255,255,255,.045);cursor:pointer;transition:transform .18s ease,background .18s ease,border-color .18s ease,box-shadow .18s ease}button:hover{transform:translateY(-2px);background:rgba(255,255,255,.09);border-color:rgba(255,255,255,.16)}
.app{width:min(1180px,100%);margin:0 auto;padding:22px 22px 210px}.top{display:flex;align-items:center;justify-content:space-between;gap:18px;margin:4px 0 24px}.brand{display:flex;align-items:center;gap:14px}.logo{width:52px;height:52px;display:grid;place-items:center;border-radius:18px;font-family:"Space Grotesk",sans-serif;font-size:25px;background:linear-gradient(135deg,var(--violet),var(--pink) 53%,var(--cyan));box-shadow:0 12px 42px rgba(139,124,255,.28),inset 0 1px rgba(255,255,255,.35)}.brand h1{margin:0;font:700 23px/1 "Space Grotesk",sans-serif;letter-spacing:-.8px}.brand span{display:block;color:var(--muted);font-size:11px;margin-top:5px}.avatar{width:46px;height:46px;border-radius:50%;padding:0;background:rgba(255,255,255,.055);box-shadow:inset 0 1px rgba(255,255,255,.08)}
.hero{position:relative;overflow:hidden;isolation:isolate;margin-bottom:22px;padding:42px;border:1px solid rgba(255,255,255,.1);border-radius:34px;background:linear-gradient(135deg,rgba(20,23,46,.88),rgba(10,16,28,.66) 55%,rgba(24,10,29,.78)),radial-gradient(circle at 10% 0%,rgba(139,124,255,.34),transparent 38%);box-shadow:var(--glow),inset 0 1px rgba(255,255,255,.12)}
.hero:before,.hero:after{content:"";position:absolute;border-radius:50%;pointer-events:none;filter:blur(6px)}.hero:before{width:340px;height:340px;right:-150px;top:-155px;background:radial-gradient(circle,rgba(72,231,255,.28),transparent 70%)}.hero:after{width:300px;height:300px;left:38%;bottom:-220px;background:radial-gradient(circle,rgba(255,94,184,.22),transparent 70%)}
.hero h2{position:relative;z-index:1;max-width:760px;margin:0 0 15px;font:700 clamp(34px,6vw,68px)/.98 "Space Grotesk",sans-serif;letter-spacing:-2.8px}.hero h2 em{font-style:normal;background:linear-gradient(90deg,#fff,var(--cyan) 42%,var(--pink));-webkit-background-clip:text;background-clip:text;color:transparent}.hero p{position:relative;z-index:1;max-width:660px;margin:0 0 26px;color:#c4c8d8;font-size:14px;line-height:1.65}.searchbar{position:relative;z-index:2;display:flex;gap:10px;max-width:760px}.input{width:100%;min-height:52px;padding:14px 17px;border:1px solid rgba(255,255,255,.1);border-radius:17px;background:rgba(3,4,10,.58);color:#fff;outline:0;box-shadow:inset 0 1px rgba(255,255,255,.05)}.input::placeholder{color:#6e7488}.input:focus{border-color:rgba(139,124,255,.78);box-shadow:0 0 0 4px rgba(139,124,255,.11),inset 0 1px rgba(255,255,255,.06)}.primary{border:0!important;color:#0a0910;background:linear-gradient(135deg,#b7aaff,var(--pink) 55%,#75efff);box-shadow:0 12px 34px rgba(139,124,255,.25)}
.grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:16px}.card{min-width:0;position:relative;overflow:hidden;padding:12px;border:1px solid rgba(255,255,255,.085);border-radius:24px;background:linear-gradient(180deg,rgba(17,19,32,.78),rgba(8,10,19,.76));box-shadow:0 14px 40px rgba(0,0,0,.2),inset 0 1px rgba(255,255,255,.07);transition:transform .22s ease,border-color .22s ease,box-shadow .22s ease}.card:before{content:"";position:absolute;inset:0;background:linear-gradient(135deg,rgba(139,124,255,.06),transparent 42%,rgba(72,231,255,.04));pointer-events:none}.card:hover{transform:translateY(-6px);border-color:rgba(255,255,255,.16);box-shadow:0 22px 60px rgba(0,0,0,.34),0 0 0 1px rgba(139,124,255,.08),inset 0 1px rgba(255,255,255,.1)}
.cover{position:relative;overflow:hidden;aspect-ratio:1;border-radius:18px;display:grid;place-items:center;background:linear-gradient(145deg,#1d2040,#0b0d17);font-size:42px;box-shadow:inset 0 1px rgba(255,255,255,.08)}.cover:after{content:"";position:absolute;inset:0;background:linear-gradient(180deg,transparent 48%,rgba(4,5,10,.54));pointer-events:none}.cover img{width:100%;height:100%;object-fit:cover;transition:transform .35s ease;display:block}.card:hover .cover img{transform:scale(1.04)}.cover .play{position:absolute;z-index:2;right:11px;bottom:11px;width:47px;height:47px;padding:0;border:0;border-radius:50%;opacity:0;transform:translateY(6px);background:rgba(255,255,255,.94);color:#0a0b11;box-shadow:0 8px 24px rgba(0,0,0,.35);transition:.2s}.card:hover .cover .play,.cover .play:focus{opacity:1;transform:none}
.card-body{position:relative;z-index:1;padding:11px 3px 3px}.title-row{display:flex;align-items:center;gap:7px;min-width:0}.title{min-width:0;font-size:14px;font-weight:800;line-height:1.35;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.source-badge{flex:0 0 auto;max-width:100px;padding:4px 7px;border-radius:999px;font-size:8px;font-weight:800;letter-spacing:.3px;color:#e9edff;background:rgba(255,255,255,.055);border:1px solid rgba(255,255,255,.08);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.sub{font-size:11px;color:var(--muted);margin-top:4px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.track-meta{display:flex;flex-wrap:wrap;gap:5px;margin-top:9px}.meta-pill{display:inline-flex;align-items:center;gap:4px;padding:4px 7px;border-radius:999px;color:#b9c0d2;background:rgba(255,255,255,.04);font-size:9px;border:1px solid rgba(255,255,255,.06)}
.section{display:flex;align-items:end;justify-content:space-between;gap:14px;margin:34px 2px 14px}.section h2{margin:0;font:700 22px/1.15 "Space Grotesk",sans-serif;letter-spacing:-.7px}.section small{color:var(--muted);font-size:11px}.section-actions{display:flex;align-items:center;gap:8px}.section-actions button{min-width:44px}.home-play{width:52px;height:52px;padding:0;border:0;background:linear-gradient(135deg,var(--violet),var(--pink));border-radius:50%;box-shadow:0 12px 32px rgba(139,124,255,.3)}
.wave-card{position:relative;overflow:hidden;margin:0 0 24px;padding:12px;border-radius:31px;border:1px solid rgba(255,255,255,.1);background:linear-gradient(180deg,rgba(16,18,31,.84),rgba(8,10,19,.78));box-shadow:0 26px 75px rgba(0,0,0,.35),inset 0 1px rgba(255,255,255,.08)}.wave-cover{position:relative;overflow:hidden;aspect-ratio:21/10;border-radius:24px;cursor:pointer;background:linear-gradient(135deg,#1d2040,#080a12)}.wave-cover:before{content:"";position:absolute;inset:0;background:radial-gradient(circle at 72% 20%,rgba(72,231,255,.26),transparent 30%),linear-gradient(180deg,transparent 38%,rgba(2,3,7,.76));z-index:1;pointer-events:none}.wave-cover img{width:100%;height:100%;object-fit:cover;display:block;transform:scale(1.01);filter:saturate(1.04) contrast(1.03)}.wave-cover .wave-badge{position:absolute;z-index:2;top:15px;left:15px;padding:8px 11px;border-radius:999px;background:rgba(3,4,9,.52);backdrop-filter:blur(14px);font-size:10px;font-weight:800;border:1px solid rgba(255,255,255,.1)}.wave-info{display:grid;grid-template-columns:minmax(0,1fr) auto;align-items:center;gap:15px;padding:15px 6px 5px}.wave-info h2{margin:0;font:700 28px/1.08 "Space Grotesk",sans-serif;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.wave-info .sub{font-size:12px;margin-top:6px}.wave-actions{display:flex;align-items:center;gap:7px;flex-wrap:wrap;justify-content:flex-end}.wave-actions button{width:44px;height:44px;padding:0;border-radius:50%}.wave-actions .wave-main{width:57px;height:57px;border:0;background:#fff;color:#0b0d13;font-size:18px;box-shadow:0 10px 30px rgba(0,0,0,.26)}
.taste-panel{margin:0 0 24px;padding:19px;border:1px solid rgba(255,255,255,.08);border-radius:24px;background:rgba(11,13,23,.62);box-shadow:inset 0 1px rgba(255,255,255,.05)}.taste-panel h3{margin:0 0 6px;font-size:16px}.taste-panel p{margin:0;color:var(--muted);font-size:12px;line-height:1.5}
.moods{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:14px}.mood-card{min-height:165px;position:relative;overflow:hidden;text-align:left;padding:18px;display:flex;flex-direction:column;justify-content:flex-end;border-radius:24px;background:linear-gradient(145deg,rgba(25,28,50,.86),rgba(10,12,21,.72));border:1px solid rgba(255,255,255,.08);box-shadow:var(--glow)}.mood-card:before{content:"";position:absolute;width:130px;height:130px;right:-50px;top:-50px;border-radius:50%;background:radial-gradient(circle,rgba(139,124,255,.28),transparent 72%);filter:blur(7px)}.mood-card b{position:relative;font-size:37px;margin-bottom:auto}.mood-card strong{position:relative;font-size:16px}.mood-card span{position:relative;color:var(--muted);font-size:11px;margin-top:5px}
.results{display:grid;gap:8px}.result{display:flex;align-items:center;gap:13px;padding:11px;border:1px solid transparent;border-radius:19px;background:rgba(9,11,19,.42);transition:.18s}.result:hover{background:rgba(255,255,255,.045);border-color:rgba(255,255,255,.08)}.mini{width:64px;height:64px;flex:0 0 64px;border-radius:15px;overflow:hidden;background:linear-gradient(135deg,#22264b,#0c0e17);display:grid;place-items:center;font-size:23px}.mini img{width:100%;height:100%;object-fit:cover}.meta{min-width:0;flex:1}.meta strong{display:block;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.meta span{display:block;color:var(--muted);font-size:11px;margin-top:4px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.result .track-meta{margin-top:7px}.actions{display:flex;gap:7px}.icon{width:40px;height:40px;padding:0;border-radius:13px}.empty{border:1px dashed rgba(255,255,255,.1);border-radius:21px;padding:36px 24px;text-align:center;color:var(--muted);background:rgba(10,12,21,.42)}
.track-profile{border:1px solid rgba(255,255,255,.09);border-radius:30px;padding:22px;background:rgba(12,14,25,.74);box-shadow:var(--glow),inset 0 1px rgba(255,255,255,.06)}.track-head{display:grid;grid-template-columns:180px minmax(0,1fr);gap:22px;align-items:center}.track-cover{width:180px;height:180px;border-radius:25px;overflow:hidden;background:linear-gradient(135deg,#24274d,#090b14);display:grid;place-items:center;font-size:54px;box-shadow:0 20px 50px rgba(0,0,0,.32)}.track-cover img{width:100%;height:100%;object-fit:cover}.track-profile h2{margin:0;font:700 clamp(24px,4vw,42px)/1.02 "Space Grotesk",sans-serif;letter-spacing:-1.3px}.track-actions{display:flex;flex-wrap:wrap;gap:8px;margin-top:19px}.profile-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:10px;margin-top:21px}.track-stat{padding:13px;border-radius:17px;background:rgba(255,255,255,.035);border:1px solid rgba(255,255,255,.06)}.track-stat small{display:block;color:var(--muted);font-size:9px;text-transform:uppercase;letter-spacing:.6px}.track-stat strong{display:block;margin-top:5px;font-size:12px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.track-extra{margin-top:10px;color:#c9cedd;font-size:11px;line-height:1.5}.track-extra b{color:#fff}
.player{position:fixed;z-index:90;left:50%;bottom:86px;transform:translateX(-50%);width:min(900px,calc(100% - 24px));display:none;grid-template-columns:auto minmax(0,1fr) auto;align-items:center;gap:12px;padding:11px 13px;border:1px solid rgba(255,255,255,.11);border-radius:24px;background:rgba(9,11,18,.84);backdrop-filter:blur(26px) saturate(1.2);box-shadow:0 24px 80px rgba(0,0,0,.48),inset 0 1px rgba(255,255,255,.08)}.player.on{display:grid}.pcover{width:50px;height:50px;border-radius:14px;overflow:hidden;background:#1c1f36;display:grid;place-items:center}.pcover img{width:100%;height:100%;object-fit:cover}.pmeta{min-width:0}.pmeta strong,.pmeta span{display:block;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.pmeta strong{font-size:12px}.pmeta span{font-size:10px;color:var(--muted);margin-top:3px}.pc{display:flex;align-items:center;gap:7px}.pc .big{width:47px;height:47px;border-radius:50%;padding:0;border:0;background:#fff;color:#0a0b12}.seek{grid-column:1/-1;width:100%;accent-color:#b19cff}.time{grid-column:1/-1;font-size:9px;color:var(--muted);margin-top:-5px}.fx-panel{grid-column:1/-1;border-top:1px solid rgba(255,255,255,.07);padding:12px 4px 2px}.eq-grid{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:9px}.eq-band{min-width:0;text-align:center}.eq-band input{width:100%;accent-color:#b19cff}.eq-band small{display:block;color:var(--muted);font-size:9px;margin-top:3px}
.nav{position:fixed;z-index:70;left:50%;bottom:max(10px,env(safe-area-inset-bottom));transform:translateX(-50%);width:min(620px,calc(100% - 20px));display:grid;grid-template-columns:repeat(4,1fr);gap:5px;padding:7px;border:1px solid rgba(255,255,255,.1);border-radius:23px;background:rgba(8,10,17,.74);backdrop-filter:blur(24px) saturate(1.25);box-shadow:0 18px 55px rgba(0,0,0,.45),inset 0 1px rgba(255,255,255,.07)}.nav button{border:0;background:transparent;color:#7d8398;font-size:20px;min-height:51px;padding:7px 5px;border-radius:17px}.nav button span{display:block;font-size:9px;font-weight:800;margin-top:5px}.nav button.active{color:#fff;background:linear-gradient(135deg,rgba(139,124,255,.16),rgba(255,94,184,.1));box-shadow:inset 0 1px rgba(255,255,255,.06)}
.playlist{display:flex;align-items:center;gap:13px;padding:12px;border:1px solid rgba(255,255,255,.07);border-radius:20px;background:rgba(10,12,21,.55);margin-bottom:9px}.playlist .pic{width:58px;height:58px;border-radius:16px;background:linear-gradient(135deg,var(--violet),var(--pink));display:grid;place-items:center;font-size:24px}.playlist main{flex:1;min-width:0}.playlist strong{display:block}.playlist span{font-size:11px;color:var(--muted)}.danger{color:#ff86a4}
.modal{position:fixed;inset:0;z-index:200;background:rgba(2,3,8,.76);backdrop-filter:blur(14px);display:none;place-items:center;padding:18px}.modal.open{display:grid}.dialog{width:min(520px,100%);max-height:min(88vh,760px);overflow:auto;background:linear-gradient(180deg,#131728,#0b0e18);border:1px solid rgba(255,255,255,.1);border-radius:27px;padding:22px;box-shadow:0 35px 110px rgba(0,0,0,.6),inset 0 1px rgba(255,255,255,.07)}.dialog h3{margin:0 0 8px;font:700 22px "Space Grotesk",sans-serif}.dialog p{color:var(--muted);font-size:12px;line-height:1.55}.dialog .row{display:flex;gap:8px;margin-top:16px}.chips{display:flex;flex-wrap:wrap;gap:7px;margin-top:12px}.chip{padding:8px 11px;border-radius:999px;font-size:11px}.chip.on{background:linear-gradient(135deg,var(--violet),var(--pink));border-color:transparent}.taste-grid{display:grid;grid-template-columns:1fr 1fr;gap:12px}.taste-field label{display:block;font-size:10px;color:var(--muted);margin-bottom:6px}.taste-actions{display:flex;gap:8px;margin-top:14px}
.toast{position:fixed;z-index:300;top:20px;left:50%;transform:translate(-50%,-15px);opacity:0;pointer-events:none;padding:12px 16px;border:1px solid rgba(255,255,255,.1);background:rgba(16,18,28,.94);backdrop-filter:blur(18px);border-radius:15px;box-shadow:0 15px 45px rgba(0,0,0,.4);transition:.2s;font-size:12px}.toast.show{opacity:1;transform:translate(-50%,0)}
@media(max-width:1000px){.grid{grid-template-columns:repeat(3,minmax(0,1fr))}.moods{grid-template-columns:repeat(3,minmax(0,1fr))}.hero{padding:34px}}
@media(max-width:700px){.app{padding:14px 13px calc(220px + env(safe-area-inset-bottom))}.top{margin:2px 0 17px}.brand h1{font-size:21px}.logo{width:47px;height:47px}.hero{padding:22px;border-radius:25px}.hero h2{font-size:clamp(30px,9vw,40px);letter-spacing:-1.7px}.hero p{font-size:12px}.searchbar{flex-direction:column}.searchbar button{width:100%}.grid{grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}.card{padding:9px;border-radius:20px}.cover{border-radius:15px}.cover .play{opacity:1;transform:none}.card-body{padding:9px 2px 2px}.title{font-size:12px}.sub{font-size:10px}.source-badge{font-size:7px;padding:4px 6px}.meta-pill{font-size:8px;padding:4px 6px}.section{margin:25px 1px 11px}.section h2{font-size:19px}.section small{font-size:9px}.wave-card{padding:9px;border-radius:24px}.wave-cover{aspect-ratio:1/1;border-radius:18px}.wave-info{grid-template-columns:1fr;gap:9px;padding:12px 3px 3px}.wave-info h2{font-size:22px}.wave-actions{justify-content:space-between}.taste-panel{padding:14px;border-radius:21px}.moods{grid-template-columns:repeat(2,minmax(0,1fr));gap:9px}.mood-card{min-height:130px;padding:14px}.result{gap:9px;padding:8px}.mini{width:54px;height:54px;flex-basis:54px}.actions{gap:4px}.icon{width:36px;height:36px}.result .track-meta{display:none}.track-profile{padding:14px;border-radius:22px}.track-head{grid-template-columns:100px minmax(0,1fr);gap:12px;align-items:start}.track-cover{width:100px;height:100px;border-radius:17px}.track-profile h2{font-size:22px}.profile-grid{grid-template-columns:repeat(2,1fr);gap:8px}.player{bottom:calc(79px + env(safe-area-inset-bottom));width:calc(100% - 10px);padding:8px 9px;border-radius:19px;grid-template-columns:45px minmax(0,1fr) auto}.pcover{width:45px;height:45px}.pc{gap:4px}.pc .big{width:42px;height:42px}.fx-panel{padding-top:10px}.eq-grid{gap:3px}.eq-band input{height:92px;writing-mode:vertical-lr;direction:rtl}.nav{width:calc(100% - 12px);bottom:max(6px,env(safe-area-inset-bottom));padding:5px;border-radius:20px}.nav button{min-height:50px;font-size:19px;padding:7px 3px}.nav button span{font-size:8px}.input{font-size:16px}.empty{padding:28px 15px}.playlist{padding:10px;gap:9px}.playlist .pic{width:48px;height:48px}.playlist button{padding:9px 8px;font-size:10px}}
@media(max-width:350px){.app{padding-left:9px;padding-right:9px}.grid{gap:8px}.card{padding:8px}.title{font-size:11px}.sub{font-size:9px}.meta-pill{font-size:7px}.source-badge{display:none}}
</style></head>
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
let tracks=[], localTracks=[], current=null, currentIndex=-1, audio=new Audio(), nextAudio=new Audio(), playing=false, autoNext=true, nextPreloadToken=0;
audio.preload="auto";
audio.crossOrigin="anonymous";
nextAudio.preload="auto";
nextAudio.setAttribute("aria-hidden","true");
const AUDIO_KEY="okmusic:audio";
const eqBands=["60","250","1K","4K","12K"];
let audioFx={eq:[0,0,0,0,0]};
try{audioFx={...audioFx,...JSON.parse(localStorage.getItem(AUDIO_KEY)||"{}")}}catch{}
function saveAudioFx(){localStorage.setItem(AUDIO_KEY,JSON.stringify(audioFx))}
let audioCtx=null,audioSource=null,eqNodes=[],fxReady=false,showEq=false;
let eqLimiter=null;
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
   n.Q.value=i===0||i===4?0.7:1.0;
   n.gain.value=Number(audioFx.eq[i]||0);
   return n;
  });
  eqLimiter=audioCtx.createDynamicsCompressor();
  eqLimiter.threshold.value=-6;
  eqLimiter.knee.value=12;
  eqLimiter.ratio.value=4;
  eqLimiter.attack.value=0.003;
  eqLimiter.release.value=0.12;
  eqNodes.reduce((a,b)=>a.connect(b),audioSource);
  eqNodes[eqNodes.length-1].connect(eqLimiter);
  eqLimiter.connect(audioCtx.destination);
  fxReady=true;
  return true;
 }catch(e){return false}
}
function setEq(i,v){
 const value=Math.max(-12,Math.min(12,Number(v)||0));
 audioFx.eq[i]=value;
 if(eqNodes[i]&&audioCtx){
  const now=audioCtx.currentTime;
  eqNodes[i].gain.cancelScheduledValues(now);
  eqNodes[i].gain.setTargetAtTime(value,now,0.025);
 }
 saveAudioFx();
}
function toggleEq(){
 showEq=!showEq;
 if(showEq){
   if(!initAudioFx()){toast("Эквалайзер недоступен в этом браузере");showEq=false;return}
   if(audioCtx?.state==="suspended")audioCtx.resume().catch(()=>{});
 }
 drawPlayer();
}
function eqPanel(){
 if(!showEq)return "";
 return '<div class="fx-panel"><div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px"><strong>🎚 Эквалайзер</strong><small style="color:var(--muted)">±12 дБ</small></div><div class="eq-grid">'+eqBands.map((b,i)=>'<label class="eq-band"><input data-eq="'+i+'" type="range" min="-12" max="12" step="1" value="'+Number(audioFx.eq[i]||0)+'"><small>'+b+' Hz</small></label>').join("")+'</div></div>';
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
function card(t){return '<article class="card" data-track-profile="'+esc(t.id)+'"><div class="cover">'+(t.image?'<img src="'+esc(t.image)+'" loading="lazy">':"♫")+'<button class="play" data-play="'+esc(t.id)+'">▶</button></div><div class="title">'+esc(t.title)+'</div><div class="sub">'+esc(t.artist)+(t.source?" · "+esc(t.source):"")+'</div></article>'}
function result(t){const liked=state.liked.some(x=>x.id===t.id);return '<div class="result"><div class="mini">'+(t.image?'<img src="'+esc(t.image)+'" loading="lazy">':"♫")+'</div><div class="meta"><strong>'+esc(t.title)+'</strong><span>'+esc(t.artist)+(t.source?" · "+esc(t.source):"")+(t.album?" · "+esc(t.album):"")+'</span></div><div class="actions"><button class="icon" data-like="'+esc(t.id)+'">'+(liked?"♥":"♡")+'</button><button class="icon" data-add="'+esc(t.id)+'">＋</button><button class="icon" data-play="'+esc(t.id)+'">▶</button></div></div>'}
function bind(container=view){container.querySelectorAll("[data-play]").forEach(b=>b.onclick=e=>{e.stopPropagation();play(tracks.find(t=>t.id===b.dataset.play)||state.liked.find(t=>t.id===b.dataset.play))});container.querySelectorAll("[data-track-profile]").forEach(b=>b.onclick=e=>{if(e.target.closest("button"))return;openTrackProfile(b.dataset.trackProfile)});container.querySelectorAll("[data-like]").forEach(b=>b.onclick=()=>like(tracks.find(t=>t.id===b.dataset.like)||state.liked.find(t=>t.id===b.dataset.like)));container.querySelectorAll("[data-add]").forEach(b=>b.onclick=()=>addToPlaylist(tracks.find(t=>t.id===b.dataset.add)||state.liked.find(t=>t.id===b.dataset.add)))}
function openTrackProfile(id){const t=tracks.find(x=>x.id===id)||state.liked.find(x=>x.id===id);if(!t)return;view.innerHTML='<div class="section"><button id="backTrack">‹ Назад</button><small>Трек</small></div><section class="track-profile"><div class="track-head"><div class="track-cover">'+(t.image?'<img src="'+esc(t.image)+'">':"♫")+'</div><div><h2>'+esc(t.title)+'</h2><div class="sub" style="font-size:13px;margin-top:7px">'+esc(t.artist)+'</div><div class="sub">'+esc(t.album||"")+(t.source?" · "+esc(t.source):"")+'</div></div></div><div class="track-actions"><button id="trackPlay" class="primary">▶ Слушать</button><button id="trackLike">'+(state.liked.some(x=>x.id===t.id)?"♥ В любимое":"♡ В любимое")+'</button></div></section>';document.querySelector("#backTrack").onclick=()=>render("home");document.querySelector("#trackPlay").onclick=()=>play(t);document.querySelector("#trackLike").onclick=()=>like(t)}
function waveTrack(){return current||tracks[0]||demos[0]}
function drawHomeWave(){
 const box=document.querySelector("#homeWave");if(!box)return;
 const t=waveTrack(),liked=state.liked.some(x=>x.id===t.id);
 box.innerHTML='<div class="wave-cover" id="waveOpen">'+(t.image?'<img src="'+esc(t.image)+'" loading="eager">':"♫")+'<span class="wave-badge">♫ Моя волна</span></div><div class="wave-info"><div class="wave-meta"><h2>'+esc(t.title)+'</h2><div class="sub">'+esc(t.artist)+(t.source?" · "+esc(t.source):"")+'</div></div><div class="wave-actions"><button id="wavePrev" title="Предыдущий">⏮</button><button id="wavePlay" class="wave-main" title="Воспроизвести">'+(playing&&current?.id===t.id?"Ⅱ":"▶")+'</button><button id="waveNext" title="Следующий">⏭</button><button id="waveLike" title="Любимое">'+(liked?"♥":"♡")+'</button></div></div>';
 document.querySelector("#waveOpen").onclick=()=>openTrackProfile(t.id);
 document.querySelector("#wavePrev").onclick=playPrevious;
 document.querySelector("#waveNext").onclick=playNext;
 document.querySelector("#wavePlay").onclick=()=>{if(current?.id===t.id&&playing){audio.pause();return}play(t)};
 document.querySelector("#waveLike").onclick=()=>like(t);
}
function playPrevious(){
 if(audio.currentTime>3){audio.currentTime=0;return}
 const i=findTrackIndex(current),prev=i>0?tracks[i-1]:null;
 if(prev)play(prev);else if(tracks.length)play(tracks[0]);
}
function addToPlaylist(t){if(!t)return;if(!state.playlists.length){toast("Сначала создай плейлист");modal.classList.add("open");document.querySelector("#playlistName").focus();return}const names=state.playlists.map((p,i)=>(i+1)+". "+p.name+" ("+p.tracks.length+")").join("\n");const answer=window.prompt("Добавить в какой плейлист?\\n\\n"+names+"\\n\\nВведи номер:","1");const n=Number(answer);if(!Number.isInteger(n)||!state.playlists[n-1])return;const p=state.playlists[n-1];if(p.tracks.some(x=>x.id===t.id)){toast("Трек уже есть в плейлисте");return}p.tracks.push(t);save();toast("Добавлено в «"+p.name+"» ✨")}
const TASTE_GENRES=["Русский рэп","Поп","Рок","Электроника","Хип-хоп","Фонк","R&B","Lo-fi","Инди","Метал","Классика","Джаз","K-pop"]; const TASTE_MOODS=["Спокойно","Энергично","Грустно","Романтично","Ночью","Для дороги","Вечеринка","Фон для работы"]; function openTaste(){const m=document.querySelector("#tasteModal"),g=document.querySelector("#genreChips"),mo=document.querySelector("#moodChips");g.innerHTML=TASTE_GENRES.map(x=>'<button class="chip '+(state.taste.genres.includes(x)?"on":"")+'" data-g="'+esc(x)+'">'+esc(x)+'</button>').join("");mo.innerHTML=TASTE_MOODS.map(x=>'<button class="chip '+(state.taste.moods.includes(x)?"on":"")+'" data-m="'+esc(x)+'">'+esc(x)+'</button>').join("");g.querySelectorAll("[data-g]").forEach(b=>b.onclick=()=>{const x=b.dataset.g;state.taste.genres=state.taste.genres.includes(x)?state.taste.genres.filter(v=>v!==x):[...state.taste.genres,x];b.classList.toggle("on")});mo.querySelectorAll("[data-m]").forEach(b=>b.onclick=()=>{const x=b.dataset.m;state.taste.moods=state.taste.moods.includes(x)?state.taste.moods.filter(v=>v!==x):[...state.taste.moods,x];b.classList.toggle("on")});document.querySelector("#tasteArtists").value=state.taste.artists||"";document.querySelector("#tasteNow").value=state.taste.now||"";m.classList.add("open")} document.querySelector("#tasteBtn").onclick=openTaste; document.querySelector("#tasteCancel").onclick=()=>document.querySelector("#tasteModal").classList.remove("open"); document.querySelector("#tasteSave").onclick=()=>{state.taste.artists=document.querySelector("#tasteArtists").value.trim();state.taste.now=document.querySelector("#tasteNow").value.trim();save();document.querySelector("#tasteModal").classList.remove("open");toast("Вкус сохранён ✨");render("home")}; async function home(){
 tracks=demos;
 view.innerHTML='<section class="hero"><h2>Музыка, которая звучит <em>как ты.</em></h2><p>Умная подборка из музыкальных каталогов подстраивается под твои любимые треки.</p><div class="searchbar"><input id="homeQ" class="input" placeholder="Исполнитель, трек или настроение"><button id="homeSearch" class="primary">Найти музыку</button></div></section><div id="homeWave" class="wave-card"></div><div class="taste-panel"><h3>🎧 Твой музыкальный профиль</h3><p>Настрой предпочтения, и алгоритм будет учитывать их в каждом новом миксе.</p><button id="editTaste" style="margin-top:12px">Настроить вкус</button></div><div class="section"><div><h2>✨ Твой микс</h2><small id="mixStatus">Подбираю музыку…</small></div><div class="section-actions"><button id="refreshMix" title="Пересобрать подборку">↻</button><button id="mixPlay" class="home-play" title="Слушать микс">▶</button></div></div><div id="mix" class="grid"><div class="empty" style="grid-column:1/-1">Создаю персональную подборку…</div></div><div class="section"><div><h2>🔐 Ключник</h2><small>GitHub + MEGA</small></div></div><div id="localMusic" class="grid"><div class="empty" style="grid-column:1/-1">Загружаю локальную музыку…</div></div>';
 document.querySelector("#homeSearch").onclick=()=>doSearch(document.querySelector("#homeQ").value);document.querySelector("#homeQ").onkeydown=e=>{if(e.key==="Enter")doSearch(e.target.value)};
 document.querySelector("#editTaste").onclick=openTaste;
 document.querySelector("#refreshMix").onclick=()=>loadMix(true);
document.querySelector("#mixPlay").onclick=()=>{const t=waveTrack();if(t)play(t)};
drawHomeWave();
bind();
 await loadMix();
}
async function loadLocalMusic(){
 const box=document.querySelector("#localMusic");if(!box)return;
 try{
  const r=await fetch("/api/local-music",{cache:"no-store"});const d=await r.json();if(!d.ok)throw Error("Ключник недоступен");
  localTracks=Array.isArray(d.tracks)?d.tracks:[];
  if(!localTracks.length){box.innerHTML='<div class="empty" style="grid-column:1/-1">Ключник пока пуст.</div>';return}
  const renderLocal=()=>{box.innerHTML=localTracks.map(card).join("");bind(box)};
  tracks=[...tracks,...localTracks.filter(t=>!tracks.some(x=>x.id===t.id))];renderLocal();
  if(window.__megaEnrichLocalTracks)await window.__megaEnrichLocalTracks(localTracks,{onTrack:t=>{
   const ti=tracks.findIndex(x=>x.id===t.id);if(ti>=0)tracks[ti]=t;
   renderLocal();if(current?.id===t.id){current=t;drawPlayer();updateMediaSession()}
  }});
 }catch(e){
  console.error("🔐 Ключник:",e);localTracks=[];box.innerHTML='<div class="empty" style="grid-column:1/-1">Не удалось загрузить 🔐 Ключник.</div>';
 }
}

async function loadMix(force=false){
 const refresh=force?String(Date.now()):"";
 const seed=[...state.liked.slice(0,8).map(t=>t.artist),...state.liked.slice(0,5).map(t=>t.genre||""),...(state.taste.genres||[]),...(state.taste.moods||[]),state.taste.artists,state.taste.now].filter(Boolean).join(", ");
 const box=document.querySelector("#mix"), status=document.querySelector("#mixStatus");
 try{
   const shown=force?tracks.slice(0,24).map(t=>t.id).filter(Boolean).join(","):"";
 const likedArtists=[...new Set(state.liked.slice(0,20).map(t=>t.artist).filter(Boolean))].join(", ");
 const r=await fetch("/api/recommendations?limit=16&seed="+encodeURIComponent(seed)+"&genres="+encodeURIComponent(state.taste.genres.join(", "))+"&moods="+encodeURIComponent(state.taste.moods.join(", "))+"&artists="+encodeURIComponent(state.taste.artists)+"&likedArtists="+encodeURIComponent(likedArtists)+"&now="+encodeURIComponent(state.taste.now)+"&liked="+encodeURIComponent(state.liked.slice(0,10).map(t=>t.artist+" "+t.title).join(", "))+"&exclude="+encodeURIComponent(shown)+"&refresh="+encodeURIComponent(refresh));
   const d=await r.json();
   if(!d.ok || !d.tracks?.length) throw Error("Нет доступных рекомендаций");
   tracks=d.tracks;
   drawHomeWave();
   box.innerHTML=d.tracks.map(card).join("");
   status.textContent=(d.mode==="personalized"?"Под твои предпочтения":"Новая подборка")+" · "+(d.providers||[]).join(" + ");
   bind(box);
 }catch(e){
   tracks=demos;
   box.innerHTML=demos.map(card).join("");
   status.textContent="Демо-подборка · каталоги пока недоступны";
   bind(box);
 }
 await loadLocalMusic();
}

function mood(){
 const moodItems=[["🌙","Ночной вайб","Спокойное и атмосферное"],["⚡","Энергия","Больше ритма и движения"],["☁️","Chill","Расслабиться и выдохнуть"],["💜","Любовь","Мягкие и тёплые треки"],["🚗","В дорогу","Музыка для долгой поездки"],["🔥","Вечеринка","Ритм, который не отпускает"],["🖤","Фонк","Бас, дрифт и ночной вайб"]];
 view.innerHTML='<div class="section"><h2>Какое настроение?</h2><small>Выбери атмосферу</small></div><div class="moods">'+moodItems.map((x,i)=>'<button class="mood-card" data-mood="'+i+'"><b>'+x[0]+'</b><strong>'+x[1]+'</strong><span>'+x[2]+'</span></button>').join('')+'</div><div class="section"><h2>Популярное</h2><small>Для хорошего настроения</small></div><div class="grid">'+demos.map(card).join('')+'</div>';
 bind();view.querySelectorAll('[data-mood]').forEach(b=>b.onclick=()=>{toast('Подбираю: '+moodItems[Number(b.dataset.mood)][1]);tracks=[...demos];view.querySelector('.section h2').textContent=moodItems[Number(b.dataset.mood)][1];});
}
function searchView(){
 view.innerHTML='<div class="section"><h2>Поиск музыки</h2><small>Zaycev.net · Jamendo · 🔐 Ключник</small></div><div class="searchbar"><input id="q" class="input" placeholder="Исполнитель, название, жанр…"><button id="go" class="primary">Искать</button></div><div id="results" class="results" style="margin-top:18px"><div class="empty">Начни с названия трека или исполнителя.</div></div>';
 document.querySelector("#go").onclick=()=>doSearch(document.querySelector("#q").value);document.querySelector("#q").onkeydown=e=>{if(e.key==="Enter")doSearch(e.target.value)}
}
async function doSearch(q){
 q=String(q||"").trim(); if(!q){toast("Введи запрос");return}
 if(!document.querySelector("#results")){render("search");document.querySelector("#q").value=q}
 const box=document.querySelector("#results");box.innerHTML='<div class="empty">Ищу музыку…<br><small>Подбираю совпадения и обложки</small></div>';
 try{const [remote,local]=await Promise.all([fetch("/api/search?q="+encodeURIComponent(q)+"&limit=30").then(x=>x.json()),Promise.resolve(localTracks.length?localTracks:(await fetch("/api/local-music").then(x=>x.json())).tracks||[])]);if(!remote.ok)throw Error(remote.error||"Ошибка");localTracks=local;const ql=q.toLowerCase();const localMatches=local.filter(t=>(t.title+" "+t.artist+" "+(t.album||"")).toLowerCase().includes(ql));tracks=[...(remote.tracks||[]),...localMatches.filter(t=>!(remote.tracks||[]).some(x=>x.id===t.id))];box.innerHTML=tracks.length?tracks.map(result).join(""):'<div class="empty">Ничего не нашлось. Попробуй другой запрос.</div>';bind(box)}catch(e){box.innerHTML='<div class="empty">Поиск временно недоступен.<br><small>'+esc(e.message)+'</small></div>'}
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
 drawHomeWave();
 updateMediaSession();
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
function mediaArtworkUrl(image){
 if(!image)return "";
 try{
  const u=new URL(image,location.href);
  if(u.origin===location.origin)return u.href;
  const proxy=new URL("/api/artwork",location.origin);
  proxy.searchParams.set("url",u.href);
  return proxy.href;
 }catch{return ""}
}
function setMediaAction(name,handler){
 try{navigator.mediaSession.setActionHandler(name,handler)}catch{}
}
function updateMediaSession(){
 if(!("mediaSession" in navigator)||!current)return;
 const artwork=mediaArtworkUrl(current.image);
 navigator.mediaSession.metadata=new MediaMetadata({
  title:current.title||"Ok Music",
  artist:current.artist||"",
  album:current.album||"Ok Music",
  artwork:artwork?[
   {src:artwork,sizes:"96x96"},
   {src:artwork,sizes:"192x192"},
   {src:artwork,sizes:"512x512"}
  ]:[]
 });
 setMediaAction("play",()=>audio.play().catch(()=>{}));
 setMediaAction("pause",()=>audio.pause());
 setMediaAction("previoustrack",playPrevious);
 setMediaAction("nexttrack",playNext);
 setMediaAction("seekbackward",details=>{
  const step=Number(details?.seekOffset)||10;
  audio.currentTime=Math.max(0,audio.currentTime-step);
 });
 setMediaAction("seekforward",details=>{
  const step=Number(details?.seekOffset)||10;
  audio.currentTime=Math.min(audio.duration||Infinity,audio.currentTime+step);
 });
 setMediaAction("seekto",details=>{
  if(!Number.isFinite(audio.duration)||!Number.isFinite(details?.seekTime))return;
  audio.currentTime=Math.max(0,Math.min(audio.duration,details.seekTime));
 });
 navigator.mediaSession.playbackState=playing?"playing":"paused";
}
function drawPlayer(){if(!current){playerEl.className="player";return}
 playerEl.className="player on";
 playerEl.innerHTML='<div class="pcover" data-player-profile="1">'+(current.image?'<img src="'+esc(current.image)+'">':"♫")+'</div><div class="pmeta"><strong>'+esc(current.title)+'</strong><span>'+esc(current.artist)+'</span></div><div class="pc"><button id="prev" class="icon" title="Предыдущий">⏮</button><button id="pause" class="big">'+(playing?"Ⅱ":"▶")+'</button><button id="next" class="icon" title="Следующий">⏭</button><button id="eqToggle" class="icon eq-toggle" title="Эквалайзер">EQ</button></div><input id="seek" class="seek" type="range" min="0" max="100" value="0"><span class="time" id="ptime">'+fmt(audio.currentTime)+' / '+fmt(audio.duration)+'</span>'+eqPanel();
 document.querySelector("#pause").onclick=()=>{if(playing)audio.pause();else{if(showEq&&audioCtx?.state==="suspended")audioCtx.resume().catch(()=>{});audio.play().catch(()=>toast("Браузер не разрешил воспроизведение"))}};
 document.querySelector("#prev").onclick=playPrevious;
 document.querySelector("#next").onclick=playNext;
 document.querySelector("#eqToggle").onclick=toggleEq;
 document.querySelector("[data-player-profile]").onclick=()=>openTrackProfile(current.id);
 document.querySelector("#seek").oninput=e=>{if(audio.duration)audio.currentTime=audio.duration*e.target.value/100};
 document.querySelectorAll("[data-eq]").forEach(s=>s.oninput=e=>setEq(Number(e.target.dataset.eq),e.target.value));
}

audio.ontimeupdate=()=>{const s=document.querySelector("#seek"),t=document.querySelector("#ptime");if(s)s.value=audio.duration?audio.currentTime/audio.duration*100:0;if(t)t.textContent=fmt(audio.currentTime)+" / "+fmt(audio.duration);if("mediaSession" in navigator&&audio.duration)try{navigator.mediaSession.setPositionState({duration:audio.duration,playbackRate:audio.playbackRate,position:Math.min(audio.currentTime,audio.duration)})}catch{}}
audio.onplay=()=>{playing=true;if(audioCtx?.state==="suspended")audioCtx.resume().catch(()=>{});if("mediaSession" in navigator)navigator.mediaSession.playbackState="playing";updateMediaSession();drawPlayer();drawHomeWave()};audio.onpause=()=>{playing=false;if("mediaSession" in navigator)navigator.mediaSession.playbackState="paused";drawPlayer();drawHomeWave()};audio.onended=()=>{playing=false;if(autoNext)playNext();else{if("mediaSession" in navigator)navigator.mediaSession.playbackState="none";drawPlayer()}};audio.onerror=()=>{toast("Не удалось загрузить аудио");playing=false;drawPlayer()};
nextAudio.onerror=()=>{nextAudio.removeAttribute("src")};
audio.addEventListener("canplay",preloadNext);
document.querySelector("#closeModal").onclick=()=>modal.classList.remove("open");modal.onclick=e=>{if(e.target===modal)modal.classList.remove("open")};
document.querySelector("#createPlaylist").onclick=()=>{const name=document.querySelector("#playlistName").value.trim();if(!name)return toast("Введи название");state.playlists.unshift({id:"pl-"+Date.now(),name,tracks:[]});save();document.querySelector("#playlistName").value="";modal.classList.remove("open");library();toast("Плейлист создан ✨")}
function render(name){document.querySelectorAll(".nav button").forEach(b=>b.classList.toggle("active",b.dataset.view===name));({home,mood,search:searchView,library}[name]||home)()}
document.querySelector("#nav").addEventListener("click",e=>{const b=e.target.closest("button[data-view]");if(b)render(b.dataset.view)});
if(window.Telegram?.WebApp){window.Telegram.WebApp.ready();window.Telegram.WebApp.expand();window.Telegram.WebApp.setHeaderColor("#080a13");window.Telegram.WebApp.setBackgroundColor("#04040a")}
render("home");
</script>
</body></html>`;
  return new Response(html,{headers:{"content-type":"text/html; charset=utf-8","Referrer-Policy":"origin"}});
}
