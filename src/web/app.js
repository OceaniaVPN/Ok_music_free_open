export function renderApp(request, env) {
  const appName = env.APP_NAME || "Ok Music";
  const html = String.raw`<!doctype html>
<html lang="ru">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<meta name="theme-color" content="#06100d"><meta name="referrer" content="strict-origin-when-cross-origin"><script defer src="https://telegram.org/js/telegram-web-app.js?63"></script>
<title>${appName}</title>
<style>
:root{
 color-scheme:dark;
 --bg:#06110b;--panel:#0b1c12;--panel2:#0f2518;--card:#10261a;
 --text:#f3fff7;--muted:#91aa9b;--line:rgba(166,255,205,.13);
 --green:#4ee48f;--green2:#24c978;--green3:#8af7b5;--danger:#ff7e8a;
 --shadow:0 24px 70px rgba(0,0,0,.42)
}
*{box-sizing:border-box}
html,body{margin:0;min-height:100%;background:var(--bg);color:var(--text)}
html{-webkit-text-size-adjust:100%;text-size-adjust:100%;scroll-behavior:smooth}
body{
 font-family:Manrope,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;
 overflow-x:hidden;overscroll-behavior-x:none;
 background:
 radial-gradient(850px 520px at -8% -10%,rgba(78,228,143,.17),transparent 62%),
 radial-gradient(700px 520px at 108% 8%,rgba(36,201,120,.10),transparent 60%),
 radial-gradient(700px 520px at 50% 115%,rgba(138,247,181,.07),transparent 64%),
 linear-gradient(160deg,#04100a 0%,#07170e 52%,#051009 100%);
}
body:before{
 content:"";position:fixed;inset:-25%;z-index:-1;pointer-events:none;
 background:conic-gradient(from 220deg at 50% 50%,rgba(78,228,143,.12),rgba(36,201,120,.08),rgba(138,247,181,.12),rgba(78,228,143,.12));
 filter:blur(90px);opacity:.55;animation:aurora 22s ease-in-out infinite alternate
}
@keyframes aurora{0%{transform:translate3d(-3%,-2%,0) scale(1)}100%{transform:translate3d(4%,3%,0) scale(1.06)}}
::selection{background:rgba(78,228,143,.28);color:#fff}
button,input{font:inherit;touch-action:manipulation}
button{
 border:1px solid var(--line);border-radius:15px;padding:10px 13px;color:inherit;
 background:rgba(255,255,255,.04);cursor:pointer;
 transition:transform .18s ease,background .18s ease,border-color .18s ease,box-shadow .18s ease,opacity .18s ease
}
button:hover{transform:translateY(-2px);background:rgba(78,228,143,.08);border-color:rgba(78,228,143,.28)}
button:disabled{opacity:.5;cursor:wait;transform:none}
img{max-width:100%}
.app{width:min(1180px,100%);margin:0 auto;padding:20px 20px 220px}
.top{display:flex;align-items:center;justify-content:space-between;gap:16px;margin:3px 0 22px;padding-bottom:15px;border-bottom:1px solid rgba(166,255,205,.08)}
.brand{display:flex;align-items:center;gap:13px;min-width:0}
.logo{
 width:52px;height:52px;display:grid;place-items:center;border-radius:17px;
 font:700 24px/1 Space Grotesk,sans-serif;color:#06130b;
 background:linear-gradient(135deg,var(--green3),var(--green));
 box-shadow:0 14px 38px rgba(36,201,120,.22),inset 0 1px rgba(255,255,255,.5)
}
.brand h1{margin:0;font:700 23px/1 Space Grotesk,sans-serif;letter-spacing:-.7px}
.brand span{display:block;color:var(--muted);font-size:10px;margin-top:6px}
.brand span:before{content:"●";color:var(--green);font-size:8px;margin-right:6px}
.avatar{width:46px;height:46px;border-radius:50%;padding:0;background:rgba(13,35,22,.78);border-color:rgba(78,228,143,.18)}
.hero{
 position:relative;overflow:hidden;isolation:isolate;margin-bottom:22px;padding:38px;
 border:1px solid rgba(166,255,205,.11);border-radius:31px;
 background:linear-gradient(145deg,rgba(16,38,25,.92),rgba(7,20,12,.82));
 box-shadow:var(--shadow),inset 0 1px rgba(255,255,255,.07)
}
.hero:before{content:"";position:absolute;width:360px;height:360px;right:-170px;top:-170px;border-radius:50%;background:radial-gradient(circle,rgba(78,228,143,.22),transparent 70%);filter:blur(8px);pointer-events:none}
.hero:after{content:"";position:absolute;width:360px;height:260px;left:35%;bottom:-210px;border-radius:50%;background:radial-gradient(ellipse,rgba(36,201,120,.12),transparent 70%);pointer-events:none}
.hero-main,.hero-bottom,.hero-kicker,.hero-quick{position:relative;z-index:2}
.hero-kicker{display:flex;flex-wrap:wrap;gap:7px;margin-bottom:16px}
.hero-kicker span{
 padding:6px 9px;border-radius:999px;font-size:9px;font-weight:800;letter-spacing:.5px;
 color:#c9fbe0;background:rgba(78,228,143,.06);border:1px solid rgba(78,228,143,.14)
}
.live-dot:before{content:"";display:inline-block;width:6px;height:6px;border-radius:50%;margin-right:6px;background:var(--green);box-shadow:0 0 13px var(--green)}
.hero h2{max-width:850px;margin:0 0 14px;font:700 clamp(38px,6vw,72px)/.98 Space Grotesk,sans-serif;letter-spacing:-2.8px}
.hero h2 em{font-style:normal;color:var(--green3)}
.hero p{max-width:720px;margin:0 0 24px;color:#bed5c8;font-size:14px;line-height:1.65}
.searchbar{position:relative;z-index:2;display:flex;gap:8px;max-width:800px}
.input{
 width:100%;min-height:52px;padding:13px 16px;outline:none;color:var(--text);
 background:rgba(2,10,6,.65);border:1px solid rgba(166,255,205,.12);border-radius:16px;
 box-shadow:inset 0 1px rgba(255,255,255,.03)
}
.input::placeholder{color:#6f897b}
.input:focus{border-color:rgba(78,228,143,.52);box-shadow:0 0 0 4px rgba(78,228,143,.09)}
.primary{
 border:0!important;color:#041108!important;
 background:linear-gradient(135deg,var(--green3),var(--green2));
 box-shadow:0 12px 34px rgba(36,201,120,.2)
}
.hero-quick{display:flex;flex-wrap:wrap;gap:8px;margin-top:14px}
.hero-quick button{font-size:10px;padding:8px 10px}
.hero-bottom{display:flex;align-items:center;justify-content:space-between;gap:12px;margin-top:20px;padding-top:16px;border-top:1px solid rgba(166,255,205,.08)}
.hero-note{font-size:10px;color:var(--muted)}
.hero-note strong{color:#d5fbe6}
.hero-providers{display:flex;gap:6px;flex-wrap:wrap;justify-content:flex-end}
.hero-providers span{padding:5px 8px;border-radius:999px;background:rgba(255,255,255,.035);border:1px solid rgba(166,255,205,.07);color:#a7bfb1;font-size:9px}
.section{display:flex;align-items:end;justify-content:space-between;gap:14px;margin:30px 2px 13px}
.section h2{margin:0;font:700 22px/1.1 Space Grotesk,sans-serif;letter-spacing:-.6px}
.section small{color:var(--muted);font-size:10px}
.section-actions{display:flex;gap:7px;align-items:center}
.section-actions button{min-width:42px}
.home-play{width:50px;height:50px;padding:0;border:0;border-radius:50%;background:linear-gradient(135deg,var(--green3),var(--green2));color:#041108;box-shadow:0 12px 30px rgba(36,201,120,.18)}
.grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:14px}
.card{
 min-width:0;position:relative;overflow:hidden;padding:10px;border-radius:22px;
 border:1px solid rgba(166,255,205,.10);
 background:linear-gradient(155deg,rgba(14,35,22,.86),rgba(6,16,10,.82));
 box-shadow:0 16px 45px rgba(0,0,0,.24),inset 0 1px rgba(255,255,255,.05);
 transition:transform .2s ease,border-color .2s ease,box-shadow .2s ease
}
.card:hover{transform:translateY(-5px);border-color:rgba(78,228,143,.25);box-shadow:0 22px 58px rgba(0,0,0,.33),0 0 0 1px rgba(78,228,143,.05)}
.cover{position:relative;overflow:hidden;aspect-ratio:1;border-radius:17px;display:grid;place-items:center;background:linear-gradient(145deg,#163b28,#0b1a11);font-size:38px}
.cover:after{content:"";position:absolute;inset:0;background:linear-gradient(180deg,transparent 45%,rgba(2,8,5,.55));pointer-events:none}
.cover img{width:100%;height:100%;object-fit:cover;display:block;transition:transform .3s ease}
.card:hover .cover img{transform:scale(1.035)}
.cover .play,.cover .offline-btn{position:absolute;z-index:3;bottom:9px;width:43px;height:43px;padding:0;border-radius:50%}
.cover .play{right:9px;opacity:0;transform:translateY(4px);border:0;background:#effff5;color:#06120a;box-shadow:0 8px 22px rgba(0,0,0,.35)}
.cover .offline-btn{left:9px;background:rgba(3,14,8,.72);border-color:rgba(78,228,143,.25);color:#9df4bd;backdrop-filter:blur(10px)}
.card:hover .cover .play,.cover .play:focus{opacity:1;transform:none}
.card-body{position:relative;z-index:1;padding:10px 2px 2px}
.title-row{display:flex;align-items:center;gap:6px;min-width:0}
.title{min-width:0;font-size:13px;font-weight:800;line-height:1.35;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.source-badge{flex:0 0 auto;max-width:95px;padding:4px 7px;border-radius:999px;font-size:8px;font-weight:800;color:#c9fbe0;background:rgba(78,228,143,.06);border:1px solid rgba(78,228,143,.12);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.sub{margin-top:4px;font-size:10px;color:var(--muted);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.track-meta{display:flex;flex-wrap:wrap;gap:5px;margin-top:8px}
.meta-pill{padding:4px 7px;border-radius:999px;background:rgba(255,255,255,.035);border:1px solid rgba(166,255,205,.07);color:#aec7b8;font-size:8px}
.wave-card,.taste-panel,.track-profile{
 position:relative;overflow:hidden;margin-bottom:22px;padding:11px;border-radius:27px;
 border:1px solid rgba(166,255,205,.10);background:linear-gradient(145deg,rgba(14,34,22,.84),rgba(6,15,10,.76));
 box-shadow:var(--shadow),inset 0 1px rgba(255,255,255,.06)
}
.wave-cover{position:relative;overflow:hidden;aspect-ratio:21/10;border-radius:21px;background:#0d2115}
.wave-cover:before{content:"";position:absolute;inset:0;z-index:1;background:linear-gradient(180deg,transparent 40%,rgba(2,8,5,.66));pointer-events:none}
.wave-cover img{width:100%;height:100%;display:block;object-fit:cover}
.wave-badge{position:absolute;z-index:2;left:13px;top:13px;padding:7px 9px;border-radius:999px;background:rgba(3,12,7,.62);backdrop-filter:blur(12px);font-size:9px;font-weight:800;border:1px solid rgba(166,255,205,.10)}
.wave-info{display:grid;grid-template-columns:minmax(0,1fr) auto;align-items:center;gap:14px;padding:13px 4px 3px}
.wave-info h2{margin:0;font:700 27px/1.06 Space Grotesk,sans-serif;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.wave-info .sub{font-size:11px;margin-top:5px}
.wave-actions{display:flex;align-items:center;gap:7px;justify-content:flex-end;flex-wrap:wrap}
.wave-actions button{width:42px;height:42px;padding:0;border-radius:50%}
.wave-actions .wave-main{width:54px;height:54px;border:0;background:#effff5;color:#06120a}
.wave-meta{font-size:10px;color:var(--muted)}
.taste-panel{padding:17px}.taste-panel h3{margin:0 0 5px;font-size:16px}.taste-panel p{margin:0;color:var(--muted);font-size:11px;line-height:1.55}
.offline-panel{
 display:flex;align-items:center;justify-content:space-between;gap:12px;margin:0 0 22px;padding:14px 16px;
 border-radius:20px;border:1px solid rgba(78,228,143,.15);
 background:linear-gradient(135deg,rgba(78,228,143,.08),rgba(36,201,120,.04))
}
.offline-panel strong{display:block;font-size:12px}.offline-panel span{display:block;color:var(--muted);font-size:10px;margin-top:4px}.offline-panel button{white-space:nowrap;font-size:10px}
.moods{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:12px}
.mood-card{min-height:155px;position:relative;overflow:hidden;text-align:left;padding:17px;display:flex;flex-direction:column;justify-content:flex-end;border-radius:21px;background:linear-gradient(145deg,rgba(16,38,24,.88),rgba(6,16,10,.78));border:1px solid rgba(166,255,205,.08);box-shadow:0 17px 50px rgba(0,0,0,.25)}
.mood-card:before{content:"";position:absolute;width:135px;height:135px;right:-50px;top:-50px;border-radius:50%;background:radial-gradient(circle,rgba(78,228,143,.18),transparent 72%)}
.mood-card b,.mood-card strong,.mood-card span{position:relative}.mood-card b{font-size:34px;margin-bottom:auto}.mood-card strong{font-size:15px}.mood-card span{margin-top:4px;font-size:10px;color:var(--muted)}
.results{display:grid;gap:7px}.result{display:flex;align-items:center;gap:10px;min-width:0;padding:9px;border-radius:18px;background:rgba(7,18,11,.5);border:1px solid transparent}.result:hover{background:rgba(78,228,143,.045);border-color:rgba(166,255,205,.10)}
.mini{width:60px;height:60px;flex:0 0 60px;display:grid;place-items:center;overflow:hidden;border-radius:14px;background:linear-gradient(135deg,#163b28,#0a1710);font-size:22px}.mini img{width:100%;height:100%;object-fit:cover}
.meta{min-width:0;flex:1;overflow:hidden}.meta strong{display:block;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.meta span{display:block;margin-top:4px;color:var(--muted);font-size:10px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.actions{display:flex;flex:0 0 auto;align-items:center;justify-content:flex-end;gap:5px;flex-wrap:wrap}
.icon,.actions .offline-btn,.track-actions .offline-btn{position:static;width:38px;height:38px;padding:0;border-radius:12px}.actions .offline-btn{color:#a6f6c2;background:rgba(78,228,143,.05)}
.empty{padding:32px 20px;text-align:center;color:var(--muted);border:1px dashed rgba(166,255,205,.10);border-radius:19px;background:rgba(7,18,11,.38)}
.track-profile{padding:20px}.track-head{display:grid;grid-template-columns:170px minmax(0,1fr);gap:20px;align-items:center}
.track-cover{width:170px;height:170px;overflow:hidden;border-radius:23px;display:grid;place-items:center;background:#102d1c;font-size:48px;box-shadow:0 18px 45px rgba(0,0,0,.3)}.track-cover img{width:100%;height:100%;object-fit:cover}
.track-profile h2{margin:0;font:700 clamp(25px,4vw,42px)/1.03 Space Grotesk,sans-serif;letter-spacing:-1.1px}
.track-actions{display:flex;flex-wrap:wrap;gap:8px;margin-top:18px}.profile-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:9px;margin-top:19px}
.track-stat{padding:12px;border-radius:16px;background:rgba(255,255,255,.03);border:1px solid rgba(166,255,205,.06)}.track-stat small{display:block;color:var(--muted);font-size:8px;text-transform:uppercase;letter-spacing:.55px}.track-stat strong{display:block;margin-top:4px;font-size:11px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.track-extra{margin-top:10px;font-size:10px;line-height:1.5;color:#bcd4c6}
.playlist{display:flex;align-items:center;gap:10px;padding:10px;margin-bottom:8px;border-radius:18px;background:rgba(7,18,11,.5);border:1px solid rgba(166,255,205,.07)}
.playlist .pic{width:52px;height:52px;flex:0 0 52px;border-radius:15px;display:grid;place-items:center;background:linear-gradient(135deg,var(--green3),var(--green2));color:#06120a;font-size:21px}
.playlist main{min-width:0;flex:1}.playlist strong,.playlist span{display:block}.playlist span{margin-top:3px;color:var(--muted);font-size:9px}.playlist button{font-size:10px;padding:8px 9px}.danger{color:#ff95a0}
.player{
 position:fixed;z-index:90;left:50%;bottom:86px;transform:translateX(-50%);width:min(900px,calc(100% - 24px));
 display:none;grid-template-columns:auto minmax(0,1fr) auto;align-items:center;gap:11px;padding:10px 12px;
 border:1px solid rgba(166,255,205,.11);border-radius:21px;background:rgba(6,18,11,.88);backdrop-filter:blur(23px) saturate(1.15);
 box-shadow:0 22px 70px rgba(0,0,0,.45),inset 0 1px rgba(255,255,255,.06)
}
.player.on{display:grid}.pcover{width:49px;height:49px;border-radius:13px;overflow:hidden;display:grid;place-items:center;background:#12311f}.pcover img{width:100%;height:100%;object-fit:cover}.pmeta{min-width:0;overflow:hidden}.pmeta strong,.pmeta span{display:block;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.pmeta strong{font-size:12px}.pmeta span{font-size:10px;color:var(--muted);margin-top:3px}
.pc{display:flex;align-items:center;gap:6px}.pc .big{width:45px;height:45px;padding:0;border:0;border-radius:50%;background:#effff5;color:#06120a}.seek{grid-column:1/-1;width:100%;accent-color:var(--green)}.time{grid-column:1/-1;color:var(--muted);font-size:9px;margin-top:-5px}
.fx-panel{grid-column:1/-1;border-top:1px solid rgba(166,255,205,.07);padding:11px 3px 2px}.eq-grid{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:8px}.eq-band{text-align:center;min-width:0}.eq-band input{width:100%;accent-color:var(--green)}.eq-band small{display:block;color:var(--muted);font-size:8px;margin-top:3px}.spatial3d{margin-top:12px;padding:10px 11px;border:1px solid rgba(166,255,205,.08);border-radius:14px;background:rgba(78,228,143,.035)}.spatial3d-head{display:flex;align-items:center;justify-content:space-between;font-size:11px;margin-bottom:5px}.spatial3d-head span{color:var(--green);font-variant-numeric:tabular-nums}.spatial3d input{width:100%;accent-color:var(--green)}.spatial3d>small{display:block;color:var(--muted);font-size:8px;margin-top:3px}
.nav{
 position:fixed;z-index:70;left:50%;bottom:max(9px,env(safe-area-inset-bottom));transform:translateX(-50%);
 width:min(620px,calc(100% - 18px));display:grid;grid-template-columns:repeat(4,1fr);gap:4px;padding:6px;
 border:1px solid rgba(166,255,205,.10);border-radius:21px;background:rgba(5,17,10,.83);backdrop-filter:blur(22px) saturate(1.15);
 box-shadow:0 17px 52px rgba(0,0,0,.42),inset 0 1px rgba(255,255,255,.05)
}
.nav button{border:0;background:transparent;color:#748f80;min-height:49px;padding:6px 4px;border-radius:15px;font-size:19px}.nav button span{display:block;font-size:8px;font-weight:800;margin-top:4px}.nav button.active{color:#effff5;background:rgba(78,228,143,.10);box-shadow:inset 0 1px rgba(255,255,255,.05)}
.modal{position:fixed;inset:0;z-index:200;display:none;place-items:center;padding:18px;background:rgba(1,8,4,.75);backdrop-filter:blur(12px)}.modal.open{display:grid}
.dialog{width:min(530px,100%);max-height:min(88vh,760px);overflow:auto;padding:21px;border-radius:25px;border:1px solid rgba(166,255,205,.11);background:linear-gradient(180deg,#10251a,#07140d);box-shadow:0 35px 100px rgba(0,0,0,.6)}.dialog h3{margin:0 0 8px;font:700 21px Space Grotesk,sans-serif}.dialog p{color:var(--muted);font-size:11px;line-height:1.55}.dialog .row{display:flex;gap:8px;margin-top:15px}.chips{display:flex;flex-wrap:wrap;gap:7px;margin-top:12px}.chip{padding:8px 10px;border-radius:999px;font-size:10px}.chip.on{background:linear-gradient(135deg,var(--green3),var(--green2));color:#051109;border-color:transparent}.taste-grid{display:grid;grid-template-columns:1fr 1fr;gap:11px}.taste-field label{display:block;color:var(--muted);font-size:9px;margin-bottom:5px}.taste-actions{display:flex;gap:8px;margin-top:13px}
.toast{position:fixed;z-index:300;top:18px;left:50%;transform:translate(-50%,-14px);opacity:0;pointer-events:none;padding:11px 15px;border:1px solid rgba(166,255,205,.11);border-radius:14px;background:rgba(5,17,10,.94);backdrop-filter:blur(18px);box-shadow:0 14px 42px rgba(0,0,0,.38);transition:.2s;font-size:11px}.toast.show{opacity:1;transform:translate(-50%,0)}
@media(max-width:1000px){.grid{grid-template-columns:repeat(3,minmax(0,1fr))}.moods{grid-template-columns:repeat(3,minmax(0,1fr))}}
@media(max-width:700px){
 .app{padding:12px 10px calc(220px + env(safe-area-inset-bottom))}
 .top{margin:1px 0 16px}
 .logo{width:47px;height:47px;border-radius:15px}.brand h1{font-size:20px}
 .hero{padding:22px 17px;border-radius:24px}.hero h2{font-size:clamp(31px,10vw,44px);letter-spacing:-1.8px}.hero p{font-size:12px}
 .hero-bottom{align-items:flex-start;flex-direction:column}.hero-providers{justify-content:flex-start}.searchbar{flex-direction:column}.searchbar .primary{width:100%}
 .grid{grid-template-columns:repeat(2,minmax(0,1fr));gap:9px}.card{padding:8px;border-radius:19px}.cover{border-radius:15px}.card-body{padding:8px 2px 2px}.title{font-size:11px}.sub{font-size:9px}.source-badge{font-size:7px;padding:4px 6px}.meta-pill{font-size:7px;padding:4px 6px}
 .cover .play,.cover .offline-btn{opacity:1;transform:none;width:39px;height:39px;bottom:8px}.cover .play{right:8px}.cover .offline-btn{left:8px}
 .section{margin:24px 1px 10px}.section h2{font-size:18px}
 .wave-info{grid-template-columns:1fr;gap:8px;padding:11px 3px 3px}.wave-cover{aspect-ratio:1/1;border-radius:18px}.wave-info h2{font-size:21px}.wave-actions{justify-content:space-between}
 .taste-panel{padding:14px;border-radius:20px}.offline-panel{padding:12px 13px;border-radius:18px}
 .moods{grid-template-columns:repeat(2,minmax(0,1fr));gap:8px}.mood-card{min-height:125px;padding:13px}
 .result{align-items:flex-start;padding:8px}.mini{width:52px;height:52px;flex-basis:52px}.meta{padding-top:1px}.actions{max-width:145px}.icon,.actions .offline-btn,.track-actions .offline-btn{width:34px;height:34px;border-radius:10px}
 .track-profile{padding:13px;border-radius:21px}.track-head{grid-template-columns:90px minmax(0,1fr);gap:11px;align-items:start}.track-cover{width:90px;height:90px;border-radius:16px}.track-profile h2{font-size:21px}.profile-grid{grid-template-columns:repeat(2,1fr);gap:7px}.track-stat{padding:10px}
 .player{left:5px;right:5px;width:auto;transform:none;bottom:calc(79px + env(safe-area-inset-bottom));padding:8px;border-radius:18px;grid-template-columns:44px minmax(0,1fr) auto}
 .pcover{width:44px;height:44px}.pc{gap:3px}.pc .big{width:40px;height:40px}.pc .icon{flex:0 0 35px}.eq-grid{gap:3px}.eq-band input{height:88px;writing-mode:vertical-lr;direction:rtl}
 .nav{left:5px;right:5px;width:auto;transform:none;bottom:max(6px,env(safe-area-inset-bottom));border-radius:19px}.nav button{min-height:48px;font-size:18px}
 .taste-grid{grid-template-columns:1fr}
 .playlist .pic{width:46px;height:46px;flex-basis:46px}.playlist button{padding:8px 7px;font-size:9px}
}
@media(max-width:360px){.grid{gap:7px}.card{padding:7px}.title{font-size:10px}.actions{max-width:130px}.icon,.actions .offline-btn,.track-actions .offline-btn{width:32px;height:32px}}
@media(prefers-reduced-motion:reduce){*,*:before,*:after{animation-duration:.001ms!important;transition-duration:.001ms!important;scroll-behavior:auto!important}}

:root[data-theme="night"]{--bg:#080a18;--panel:#101126;--panel2:#171833;--card:#14152c;--green:#8d8bff;--green2:#706cf0;--green3:#c2c0ff;--muted:#a4a5c5;--line:rgba(175,174,255,.16)}
:root[data-theme="energy"]{--bg:#151005;--panel:#241a08;--panel2:#30200a;--card:#271b08;--green:#ffb33f;--green2:#ff8b21;--green3:#ffd27b;--muted:#cbb79a;--line:rgba(255,190,78,.16)}
:root[data-theme="chill"]{--bg:#041317;--panel:#082027;--panel2:#0b2932;--card:#0a252d;--green:#53d8e8;--green2:#2aaec3;--green3:#9af1f8;--muted:#9bbbc0;--line:rgba(83,216,232,.16)}
:root[data-theme="love"]{--bg:#16070f;--panel:#27101b;--panel2:#351522;--card:#2a111d;--green:#ff7fba;--green2:#ef4f98;--green3:#ffb1d5;--muted:#c8a4b5;--line:rgba(255,127,186,.16)}
:root[data-theme="road"]{--bg:#111006;--panel:#211d09;--panel2:#30290b;--card:#282209;--green:#e6d15a;--green2:#c6ad32;--green3:#fff09b;--muted:#c0b98e;--line:rgba(230,209,90,.16)}
:root[data-theme="party"]{--bg:#100719;--panel:#1e0d2c;--panel2:#28103a;--card:#21102e;--green:#d66cff;--green2:#a844ef;--green3:#efb3ff;--muted:#bda7c9;--line:rgba(214,108,255,.17)}
:root[data-theme="phonk"]{--bg:#0e0809;--panel:#1d0d0e;--panel2:#281113;--card:#211012;--green:#ff5b68;--green2:#dc303f;--green3:#ff9da5;--muted:#c5a4a8;--line:rgba(255,91,104,.16)}
html,body,.app,.top,.hero,.card,.wave-card,.taste-panel,.track-profile,.result,.playlist,.player,.nav,.dialog,.mood-card,.offline-panel,.input,.logo,.primary,.nav button.active,.home-play{transition:background-color .65s ease,background .65s ease,border-color .65s ease,color .65s ease,box-shadow .65s ease,filter .65s ease}
</style></head>
<body>
<div class="app">
  <header class="top"><div class="brand"><div class="logo">♫</div><div><h1>Ok Music</h1><span>Твоя музыка. Твоё настроение.</span></div></div><button class="avatar" id="tasteBtn" title="Мой музыкальный вкус">✦</button></header>
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
const MUSIC_THEMES=[{id:"default",telegram:"#07140d"},{id:"night",telegram:"#080a18"},{id:"energy",telegram:"#151005"},{id:"chill",telegram:"#041317"},{id:"love",telegram:"#16070f"},{id:"road",telegram:"#111006"},{id:"party",telegram:"#100719"},{id:"phonk",telegram:"#0e0809"}];
function applyMusicTheme(id){
 const t=MUSIC_THEMES.find(x=>x.id===id)||MUSIC_THEMES[0];
 document.documentElement.dataset.theme=t.id;
 try{localStorage.setItem("okmusic:theme",t.id)}catch{}
 try{if(window.Telegram?.WebApp){window.Telegram.WebApp.setHeaderColor(t.telegram);window.Telegram.WebApp.setBackgroundColor(t.telegram)}}catch{}
}
try{applyMusicTheme(localStorage.getItem("okmusic:theme")||"default")}catch{applyMusicTheme("default")}
const AUDIO_KEY="okmusic:audio";
const eqBands=["60","250","1K","4K","12K"];
let audioFx={eq:[0,0,0,0,0]};
try{audioFx={...audioFx,...JSON.parse(localStorage.getItem(AUDIO_KEY)||"{}")}}catch{}
function saveAudioFx(){localStorage.setItem(AUDIO_KEY,JSON.stringify(audioFx))}
let audioCtx=null,audioSource=null,eqNodes=[],fxReady=false,showEq=false;
let eqLimiter=null,spatial3dNode=null,spatial3dFrame=0;
let spatial3d=0;
try{spatial3d=Math.max(0,Math.min(1,Number(JSON.parse(localStorage.getItem(AUDIO_KEY)||"{}").spatial3d)||0))}catch{}
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
  spatial3dNode=typeof PannerNode==="function"
   ? new PannerNode(audioCtx,{panningModel:"HRTF",distanceModel:"inverse",refDistance:1,maxDistance:8,rolloffFactor:0.35,coneInnerAngle:360,coneOuterAngle:360,coneOuterGain:0})
   : audioCtx.createPanner();
  spatial3dNode.panningModel="HRTF";
  spatial3dNode.distanceModel="inverse";
  spatial3dNode.refDistance=1;
  spatial3dNode.maxDistance=8;
  spatial3dNode.rolloffFactor=0.35;
  spatial3dNode.positionX.value=0;spatial3dNode.positionY.value=0;spatial3dNode.positionZ.value=0;
  eqLimiter.disconnect();
  eqLimiter.connect(spatial3dNode);
  spatial3dNode.connect(audioCtx.destination);
  fxReady=true;
  updateSpatial3d();
  return true;
 }catch(e){return false}
}
function updateSpatial3d(){
 if(!spatial3dNode)return;
 const amount=Math.max(0,Math.min(1,Number(spatial3d)||0));
 if(!amount){spatial3dNode.positionX.value=0;spatial3dNode.positionZ.value=0;return}
 const now=performance.now()/1000;
 const x=Math.sin(now*0.72)*amount*2.2;
 const z=-Math.cos(now*0.72)*amount*2.8;
 spatial3dNode.positionX.value=x;
 spatial3dNode.positionZ.value=z;
 if(playing){spatial3dFrame=requestAnimationFrame(updateSpatial3d)}
}
function setSpatial3d(v){
 spatial3d=Math.max(0,Math.min(1,Number(v)||0));
 audioFx.spatial3d=spatial3d;
 saveAudioFx();
 updateSpatial3d();
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
 return '<div class="fx-panel"><div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px"><strong>🎚 Эквалайзер</strong><small style="color:var(--muted)">±12 дБ</small></div><div class="eq-grid">'+eqBands.map((b,i)=>'<label class="eq-band"><input data-eq="'+i+'" type="range" min="-12" max="12" step="1" value="'+Number(audioFx.eq[i]||0)+'"><small>'+b+' Hz</small></label>').join("")+'</div><div class="spatial3d"><div class="spatial3d-head"><strong>🌀 3D звук</strong><span>'+Math.round(spatial3d*100)+'%</span></div><input data-spatial3d type="range" min="0" max="1" step="0.01" value="'+spatial3d+'"><small>HRTF · пространственное вращение</small></div></div>';
}
function esc(s){return String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[c]))}
function save(){localStorage.setItem(KEY,JSON.stringify(state))}
function toast(s){toastEl.textContent=s;toastEl.classList.add("show");clearTimeout(window._toast);window._toast=setTimeout(()=>toastEl.classList.remove("show"),1800)}
function fmt(n){return Number.isFinite(n)&&n>0?Math.floor(n/60)+":"+String(Math.floor(n%60)).padStart(2,"0"):"0:00"}
function playableAudio(t){
 if(!t)return "";
 if(t.zaycevId)return "/api/zaycev/play?id="+encodeURIComponent(String(t.zaycevId));
 if(t.audio&&!String(t.audio).startsWith("mega://"))return String(t.audio);
 if(t.src&&!String(t.src).startsWith("mega://"))return String(t.src);
 return "";
}
const OK_OFFLINE_CACHE="okmusic-audio-v2";
const OK_OFFLINE_META="okmusic:offline:v2";
function __okOfflineMeta(){
  try{return JSON.parse(localStorage.getItem(OK_OFFLINE_META)||"{}")}catch{return {}}
}
function __okOfflineSetMeta(meta){try{localStorage.setItem(OK_OFFLINE_META,JSON.stringify(meta))}catch{}}
async function __okOfflineCache(){return caches.open(OK_OFFLINE_CACHE)}
window.__okOfflineList=async function(){return Object.keys(__okOfflineMeta())};
window.__okOfflineHas=async function(id){
  const meta=__okOfflineMeta(),key=String(id||"");
  if(!meta[key])return false;
  const cache=await __okOfflineCache();
  return Boolean(await cache.match(meta[key].url));
};
window.__okOfflineSave=async function(t){
  const raw=playableAudio(t);
  if(!raw)throw Error(String(t?.audio||"").startsWith("mega://")?"Этот трек из MEGA пока нельзя сохранить":"У трека нет аудиопотока");
  const url=new URL(raw,location.href).href;
  const response=await fetch(url,{credentials:"same-origin",cache:"no-store"});
  if(!response.ok)throw Error("Аудио HTTP "+response.status);
  const cache=await __okOfflineCache();
  await cache.put(url,response.clone());
  const meta=__okOfflineMeta();
  meta[String(t.id)]={
    url,title:t.title||"",artist:t.artist||"",album:t.album||"",
    image:t.image||"",source:t.source||"",savedAt:Date.now()
  };
  __okOfflineSetMeta(meta);
  return true;
};
window.__okOfflineResolve=async function(t){
  const meta=__okOfflineMeta(),entry=meta[String(t?.id||"")];
  if(!entry?.url)return null;
  try{
    const cache=await __okOfflineCache(),response=await cache.match(entry.url);
    if(!response)return null;
    return URL.createObjectURL(await response.blob());
  }catch{return null}
};
window.__okOfflineRemove=async function(id){
  const meta=__okOfflineMeta(),key=String(id||""),entry=meta[key];
  if(entry?.url){try{await (await __okOfflineCache()).delete(entry.url)}catch{}}
  delete meta[key];__okOfflineSetMeta(meta);
};
window.__okOfflineClear=async function(){
  try{await caches.delete(OK_OFFLINE_CACHE)}catch{}
  try{localStorage.removeItem(OK_OFFLINE_META)}catch{}
};
async function refreshOfflineButtons(container=view){
 if(!window.__okOfflineList)return;
 try{const ids=new Set(await window.__okOfflineList());container.querySelectorAll("[data-offline]").forEach(b=>{const on=ids.has(b.dataset.offline);b.classList.toggle("is-offline",on);if(b.id==="trackOffline")b.textContent=on?"✓ Сохранено":"⇩ Офлайн";else if(b.classList.contains("offline-btn"))b.textContent=on?"✓":"⇩"});const count=ids.size;const text=document.querySelector("#offlineHomeText");if(text)text.textContent=count?"Сохранено "+count+" треков · доступны без сети.":"Сохраняй треки кнопкой ⇩ и слушай их без интернета.";const clear=document.querySelector("#clearOffline");if(clear)clear.disabled=!count}catch{}
}
async function toggleOffline(t,button){
 if(!t||!window.__okOfflineSave)return;button.disabled=true;
 try{if(await window.__okOfflineHas(t.id)){await window.__okOfflineRemove(t.id);toast("Удалено из офлайн")}else{button.textContent="…";await window.__okOfflineSave(t);toast("Сохранено для офлайн 🎧")}}
 catch(error){console.warn("Ok Music offline:",error);toast(error?.message?.includes("MEGA")?"MEGA пока не поддерживает офлайн-сохранение":"Не удалось сохранить трек")}
 finally{button.disabled=false;await refreshOfflineButtons(view)}
}
async function clearOffline(){if(!window.__okOfflineClear)return;try{await window.__okOfflineClear();toast("Офлайн-кэш очищен");await refreshOfflineButtons(view)}catch{toast("Не удалось очистить кэш")}}
function card(t){
 const pills=[Number(t.duration)>0?"◷ "+fmt(t.duration):"",t.genre?"♪ "+t.genre:"",t.year?"▣ "+t.year:""].filter(Boolean).slice(0,3);
 return '<article class="card" data-track-profile="'+esc(t.id)+'"><div class="cover">'+(t.image?'<img src="'+esc(t.image)+'" loading="lazy">':"♫")+'<button class="play" data-play="'+esc(t.id)+'" aria-label="Слушать">▶</button></div><div class="card-body"><div class="title-row"><div class="title">'+esc(t.title||"Без названия")+'</div>'+(t.source?'<span class="source-badge">'+esc(t.source)+'</span>':"")+'</div><div class="sub">'+esc(t.artist||"Неизвестный исполнитель")+'</div>'+(pills.length?'<div class="track-meta">'+pills.map(x=>'<span class="meta-pill">'+esc(x)+'</span>').join("")+'</div>':"")+'</div></article>';
}
function result(t){
 const liked=state.liked.some(x=>x.id===t.id);
 const pills=[Number(t.duration)>0?"◷ "+fmt(t.duration):"",t.genre?"♪ "+t.genre:""].filter(Boolean).slice(0,2);
 return '<div class="result"><div class="mini">'+(t.image?'<img src="'+esc(t.image)+'" loading="lazy">':"♫")+'</div><div class="meta"><strong>'+esc(t.title||"Без названия")+'</strong><span>'+esc(t.artist||"Неизвестный исполнитель")+(t.album?" · "+esc(t.album):"")+(t.source?" · "+esc(t.source):"")+'</span>'+(pills.length?'<div class="track-meta">'+pills.map(x=>'<span class="meta-pill">'+esc(x)+'</span>').join("")+'</div>':"")+'</div><div class="actions"><button class="icon" data-like="'+esc(t.id)+'">'+(liked?"♥":"♡")+'</button><button class="icon" data-add="'+esc(t.id)+'">＋</button><button class="offline-btn" data-offline="'+esc(t.id)+'" aria-label="Офлайн" title="Сохранить для офлайн">⇩</button><button class="icon" data-play="'+esc(t.id)+'">▶</button></div></div>';
}
function bind(container=view){container.querySelectorAll("[data-offline]").forEach(b=>b.onclick=e=>{e.stopPropagation();const t=tracks.find(t=>t.id===b.dataset.offline)||state.liked.find(t=>t.id===b.dataset.offline);toggleOffline(t,b)});container.querySelectorAll("[data-play]").forEach(b=>b.onclick=e=>{e.stopPropagation();play(tracks.find(t=>t.id===b.dataset.play)||state.liked.find(t=>t.id===b.dataset.play))});container.querySelectorAll("[data-track-profile]").forEach(b=>b.onclick=e=>{if(e.target.closest("button"))return;openTrackProfile(b.dataset.trackProfile)});container.querySelectorAll("[data-like]").forEach(b=>b.onclick=()=>like(tracks.find(t=>t.id===b.dataset.like)||state.liked.find(t=>t.id===b.dataset.like)));container.querySelectorAll("[data-add]").forEach(b=>b.onclick=()=>addToPlaylist(tracks.find(t=>t.id===b.dataset.add)||state.liked.find(t=>t.id===b.dataset.add)));void refreshOfflineButtons(container)}
function waveTrack(){return current||tracks[0]||localTracks[0]||null}
function drawHomeWave(){
 const box=document.querySelector("#homeWave");if(!box)return;
 const t=waveTrack();
 if(!t){box.innerHTML='<div class="wave-empty"><strong>🎵 Каталог загружается</strong><span>Подожди немного — локальная музыка появится здесь.</span></div>';return}
 const liked=state.liked.some(x=>x.id===t.id);
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
 tracks=[];
 view.innerHTML='<section class="hero hero-v2"><div class="hero-grid"></div><div class="hero-main"><div class="hero-kicker"><span>✦ OK MUSIC</span><span class="live-dot">КАТАЛОГ ОНЛАЙН</span><span>ЧИСТЫЙ ЗВУК</span></div><h2>Твоя музыка.<br><em>Твой ритм.</em></h2><p>Поиск, любимые треки, умные подборки и твоя библиотека — в одном музыкальном пространстве без лишних экранов.</p><div class="searchbar"><input id="homeQ" class="input" placeholder="Исполнитель, трек или настроение" autocomplete="off"><button id="homeSearch" class="primary">Найти музыку</button></div><div class="hero-quick"><button type="button" data-quick-q="Ночной вайб">🌙 Ночной вайб</button><button type="button" data-quick-q="Энергия">⚡ Энергия</button><button type="button" data-quick-q="Lo-fi">☁ Lo-fi</button><button type="button" data-quick-q="В дорогу">🚗 В дорогу</button></div></div><div class="hero-bottom"><div class="hero-note">🔐 <span><strong>Ключник</strong> · локальная музыка + MEGA metadata</span></div><div class="hero-providers"><span>Zaycev</span><span>Jamendo</span><span>MEGA</span></div></div></section><div id="homeWave" class="wave-card"></div><div class="taste-panel"><h3>🎧 Твой музыкальный профиль</h3><p>Настрой предпочтения, и алгоритм будет учитывать их в каждом новом миксе.</p><button id="editTaste" style="margin-top:12px">Настроить вкус</button></div><div class="offline-panel" id="offlineHome"><div><strong>◉ Офлайн-режим</strong><span id="offlineHomeText">Сохраняй треки кнопкой ⇩ и слушай их без интернета.</span></div><button id="clearOffline">Очистить</button></div><div class="section"><div><h2>✨ Твой микс</h2><small id="mixStatus">Подбираю музыку…</small></div><div class="section-actions"><button id="refreshMix" title="Пересобрать подборку">↻</button><button id="mixPlay" class="home-play" title="Слушать микс">▶</button></div></div><div id="mix" class="grid"><div class="empty" style="grid-column:1/-1">Создаю персональную подборку…</div></div><div class="section"><div><h2>🔐 Ключник</h2><small>GitHub + MEGA</small></div></div><div id="localMusic" class="grid"><div class="empty" style="grid-column:1/-1">Загружаю локальную музыку…</div></div>';
 document.querySelector("#homeSearch").onclick=()=>doSearch(document.querySelector("#homeQ").value);document.querySelector("#homeQ").onkeydown=e=>{if(e.key==="Enter")doSearch(e.target.value)};view.querySelectorAll("[data-quick-q]").forEach(b=>b.onclick=()=>doSearch(b.dataset.quickQ));
 document.querySelector("#editTaste").onclick=openTaste;
 document.querySelector("#refreshMix").onclick=()=>loadMix(true);
document.querySelector("#mixPlay").onclick=()=>{const t=waveTrack();if(t)play(t)};
drawHomeWave();
 const initialMix=document.querySelector("#mix");if(initialMix){initialMix.innerHTML='<div class="empty" style="grid-column:1/-1">Создаю персональную подборку…</div>'}
 bind();
 void loadLocalMusic();
 void loadMix();
}
async function loadLocalMusic(attempt=0){
 const box=document.querySelector("#localMusic");if(!box)return;
 try{
  const r=await fetch("/api/local-music",{cache:attempt?"no-store":"default"});const d=await r.json();if(!d.ok)throw Error("Ключник недоступен");
  localTracks=Array.isArray(d.tracks)?d.tracks:[];try{localStorage.setItem("okmusic:catalog:v1",JSON.stringify(localTracks))}catch{};
  if(d.mega?.ready===false&&attempt<4)setTimeout(()=>void loadLocalMusic(attempt+1),2500);
  if(!localTracks.length){box.innerHTML='<div class="empty" style="grid-column:1/-1">Ключник пока пуст.</div>';return}
  const renderLocal=()=>{box.innerHTML=localTracks.map(card).join("");bind(box)};
  tracks=[...tracks,...localTracks.filter(t=>!tracks.some(x=>x.id===t.id))];
  renderLocal();
  if(!current){drawHomeWave()}
  if(window.__megaEnrichLocalTracks){
   const idle=window.requestIdleCallback?fn=>window.requestIdleCallback(fn,{timeout:4500}):fn=>setTimeout(fn,900);
   idle(()=>{
    void Promise.resolve(window.__megaEnrichLocalTracks(localTracks,{onTrack:t=>{
      const ti=tracks.findIndex(x=>x.id===t.id);if(ti>=0)tracks[ti]=t;
      renderLocal();if(current?.id===t.id){current=t;drawPlayer();updateMediaSession()}
    }})).catch(error=>console.warn("🔐 Ключник metadata background:",error));
   });
  }
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
   tracks=[...d.tracks,...localTracks.filter(t=>!d.tracks.some(x=>x.id===t.id))];
   drawHomeWave();
   box.innerHTML=d.tracks.map(card).join("");
   status.textContent=(d.mode==="personalized"?"Под твои предпочтения":"Новая подборка")+" · "+(d.providers||[]).join(" + ");
   bind(box);
 }catch(e){
   tracks=[...localTracks];
   box.innerHTML=localTracks.length?localTracks.slice(0,8).map(card).join(""):'<div class="empty" style="grid-column:1/-1">Подборка пока недоступна.</div>';
   status.textContent="Каталоги временно недоступны";
   bind(box);
 }
}

function mood(){
 const moodItems=[["🌙","Ночной вайб","Спокойное и атмосферное"],["⚡","Энергия","Больше ритма и движения"],["☁️","Chill","Расслабиться и выдохнуть"],["💜","Любовь","Мягкие и тёплые треки"],["🚗","В дорогу","Музыка для долгой поездки"],["🔥","Вечеринка","Ритм, который не отпускает"],["🖤","Фонк","Бас, дрифт и ночной вайб"]];
 view.innerHTML='<div class="section"><h2>Какое настроение?</h2><small>Выбери атмосферу</small></div><div class="moods">'+moodItems.map((x,i)=>'<button class="mood-card" data-mood="'+i+'"><b>'+x[0]+'</b><strong>'+x[1]+'</strong><span>'+x[2]+'</span></button>').join('')+'</div><div class="section"><h2>Популярное</h2><small>Из твоего каталога</small></div><div class="grid">'+(localTracks.length?localTracks:tracks).map(card).join('')+'</div>';
 bind();view.querySelectorAll("[data-mood]").forEach(b=>b.onclick=()=>{
 const i=Number(b.dataset.mood),item=moodItems[i];
 applyMusicTheme(["night","energy","chill","love","road","party","phonk"][i]||"default");
 toast("Подбираю: "+item[1]);tracks=[...localTracks];view.querySelector(".section h2").textContent=item[1];
});
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
 view.innerHTML='<div class="section"><h2>Моя музыка</h2><button id="newPlaylist" class="primary">＋ Плейлист</button></div><div class="offline-panel"><div><strong>◉ Офлайн-хранилище</strong><span>Скачанные треки доступны без сети.</span></div><button id="clearOffline">Очистить</button></div><div class="section"><h2>♥ Понравившиеся</h2><small>'+state.liked.length+' треков</small></div><div id="liked" class="results"></div><div class="section"><h2>Мои плейлисты</h2></div><div id="playlists"></div>';
 const liked=document.querySelector("#liked");liked.innerHTML=state.liked.length?state.liked.map(result).join(""):'<div class="empty">Пока ничего нет.<br>Нажимай ♡ рядом с любимыми треками.</div>';bind(liked);
 document.querySelector("#newPlaylist").onclick=()=>{modal.classList.add("open");document.querySelector("#playlistName").focus()}; const clear=document.querySelector("#clearOffline");if(clear)clear.onclick=clearOffline; void refreshOfflineButtons(view);
 const ps=document.querySelector("#playlists");ps.innerHTML=state.playlists.length?state.playlists.map(p=>'<div class="playlist"><div class="pic">♫</div><main><strong>'+esc(p.name)+'</strong><span>'+p.tracks.length+' треков</span></main><button data-pl="'+esc(p.id)+'">Открыть</button><button class="danger" data-del="'+esc(p.id)+'">×</button></div>').join(""):'<div class="empty">Создай первый плейлист — например, «В дорогу».</div>';
 ps.querySelectorAll("[data-pl]").forEach(b=>b.onclick=()=>openPlaylist(b.dataset.pl));ps.querySelectorAll("[data-del]").forEach(b=>b.onclick=()=>{state.playlists=state.playlists.filter(p=>p.id!==b.dataset.del);save();library();toast("Плейлист удалён")});
}
function openPlaylist(id){const p=state.playlists.find(x=>x.id===id);if(!p)return;tracks=p.tracks;view.innerHTML='<div class="section"><h2>'+esc(p.name)+'</h2><small>'+p.tracks.length+' треков</small></div><div class="results">'+(p.tracks.length?p.tracks.map(result).join(""):'<div class="empty">Добавляй треки из поиска.</div>')+'</div>';bind()}
function like(t){if(!t)return;const i=state.liked.findIndex(x=>x.id===t.id);if(i>=0){state.liked.splice(i,1);toast("Убрано из любимого")}else{state.liked.unshift(t);toast("♥ Добавлено в любимое")}save();render(document.querySelector(".nav button.active").dataset.view)}
function findTrackIndex(t){return tracks.findIndex(x=>x?.id===t?.id)}
function preloadNext(){
 const i=findTrackIndex(current), next=i>=0?tracks[i+1]:null, token=++nextPreloadToken;
 const src=playableAudio(next);
 if(!src){nextAudio.removeAttribute("src");return}
 if(nextAudio.src===new URL(src,location.href).href)return;
 nextAudio.src=src;
 nextAudio.load();
 void token;
}
function play(t,{fromEnded=false}={}){
 if(!t)return;
 const idx=findTrackIndex(t);currentIndex=idx;current=t;drawHomeWave();updateMediaSession();
 const src=playableAudio(t);
 if(!src){toast(String(t?.audio||"").startsWith("mega://")?"MEGA-трек пока не готов к воспроизведению":"У этого трека нет аудиопотока");return}
 const token=++window.__okPlayToken;
 try{
  const absolute=new URL(src,location.href).href;
  if(audio.src!==absolute){audio.src=src;audio.load()}
  const promise=audio.play();
  Promise.resolve(promise).then(()=>{
   if(token===window.__okPlayToken&&current?.id===t.id){playing=true;updateMediaSession();drawPlayer();preloadNext()}
  }).catch(error=>{console.warn("Ok Music playback:",error);toast(error?.name==="NotAllowedError"?"Нажми ▶ ещё раз для запуска":"Не удалось воспроизвести трек")});
 }catch(error){console.warn("Ok Music playback:",error);toast("Не удалось воспроизвести трек")}
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
 const spatial=document.querySelector("[data-spatial3d]");
 if(spatial)spatial.oninput=e=>{setSpatial3d(e.target.value);const out=spatial.closest(".spatial3d")?.querySelector("span");if(out)out.textContent=Math.round(spatial3d*100)+"%"};
}

audio.onplay=()=>{playing=true;if(audioCtx?.state==="suspended")audioCtx.resume().catch(()=>{});if(spatial3d)updateSpatial3d();if("mediaSession" in navigator)navigator.mediaSession.playbackState="playing";updateMediaSession();drawPlayer();drawHomeWave()};audio.ontimeupdate=()=>{const s=document.querySelector("#seek"),t=document.querySelector("#ptime");if(s)s.value=audio.duration?audio.currentTime/audio.duration*100:0;if(t)t.textContent=fmt(audio.currentTime)+" / "+fmt(audio.duration);if("mediaSession" in navigator&&audio.duration)try{navigator.mediaSession.setPositionState({duration:audio.duration,playbackRate:audio.playbackRate,position:Math.min(audio.currentTime,audio.duration)})}catch{}}
audio.onpause=()=>{playing=false;if("mediaSession" in navigator)navigator.mediaSession.playbackState="paused";drawPlayer();drawHomeWave()};audio.onended=()=>{playing=false;if(autoNext)playNext();else{if("mediaSession" in navigator)navigator.mediaSession.playbackState="none";drawPlayer()}};audio.onerror=()=>{toast("Не удалось загрузить аудио");playing=false;drawPlayer()};
nextAudio.onerror=()=>{nextAudio.removeAttribute("src")};
audio.addEventListener("canplay",preloadNext);
document.querySelector("#closeModal").onclick=()=>modal.classList.remove("open");modal.onclick=e=>{if(e.target===modal)modal.classList.remove("open")};
document.querySelector("#createPlaylist").onclick=()=>{const name=document.querySelector("#playlistName").value.trim();if(!name)return toast("Введи название");state.playlists.unshift({id:"pl-"+Date.now(),name,tracks:[]});save();document.querySelector("#playlistName").value="";modal.classList.remove("open");library();toast("Плейлист создан ✨")}
function render(name){document.querySelectorAll(".nav button").forEach(b=>b.classList.toggle("active",b.dataset.view===name));({home,mood,search:searchView,library}[name]||home)()}
document.querySelector("#nav").addEventListener("click",e=>{const b=e.target.closest("button[data-view]");if(b)render(b.dataset.view)});
function initTelegram(){if(!window.Telegram?.WebApp)return;window.Telegram.WebApp.ready();window.Telegram.WebApp.expand();const id=document.documentElement.dataset.theme||"default",t=MUSIC_THEMES.find(x=>x.id===id)||MUSIC_THEMES[0];window.Telegram.WebApp.setHeaderColor(t.telegram);window.Telegram.WebApp.setBackgroundColor(t.telegram)}
initTelegram();window.addEventListener("DOMContentLoaded",initTelegram,{once:true});
if("serviceWorker" in navigator)navigator.serviceWorker.register("/sw.js",{scope:"/"}).catch(e=>console.warn("Ok Music PWA:",e));
render("home");
</script>
</body></html>`;
  return new Response(html,{headers:{"content-type":"text/html; charset=utf-8","Referrer-Policy":"origin"}});
}
