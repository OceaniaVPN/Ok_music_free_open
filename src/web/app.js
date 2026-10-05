export function renderApp(request, env) {
  const appName = env.APP_NAME || "Ok Music";
  const html = String.raw`<!doctype html>
<html lang="ru">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<meta name="theme-color" content="#07080d"><meta name="referrer" content="strict-origin-when-cross-origin"><title>${appName}</title>
<style>
:root{color-scheme:dark;--bg:#07080d;--panel:#11141e;--card:#131722;--ink:#f7f5ff;--muted:#8e95aa;--line:#252a3a;--violet:#8b5cf6;--cyan:#22d3ee;--pink:#f472b6;--danger:#fb7185;--sound-level:0;--sound-low:0;--sound-mid:0;--sound-high:0;--sound-hue:255;--shadow:0 22px 70px rgba(0,0,0,.42)}
*{box-sizing:border-box}html{background:var(--bg);color:var(--ink);scroll-behavior:smooth}body{margin:0;min-height:100%;background:radial-gradient(circle at 12% 8%,hsla(var(--sound-hue),90%,62%,calc(.05 + var(--sound-level)*.14)),transparent 30%),radial-gradient(circle at 88% 18%,rgba(34,211,238,.07),transparent 24%),linear-gradient(180deg,#07080d,#0a0c12 52%,#07080d);color:var(--ink);font-family:Inter,ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;overflow-x:hidden}
body,button,input{font:inherit}button{border:1px solid var(--line);border-radius:14px;padding:10px 13px;color:var(--ink);background:rgba(17,20,30,.84);cursor:pointer;transition:transform .16s ease,border-color .16s ease,background .16s ease,box-shadow .16s ease}button:hover{transform:translateY(-1px);border-color:#3b4053;box-shadow:0 10px 28px rgba(0,0,0,.2)}button:disabled{opacity:.42;cursor:wait;transform:none;box-shadow:none}img{max-width:100%}
.app{width:min(1340px,100%);margin:0 auto;padding:28px 28px 220px}.top{position:sticky;top:12px;z-index:80;display:flex;align-items:center;justify-content:space-between;gap:20px;padding:13px 15px;margin:0 0 24px;border:1px solid rgba(255,255,255,.08);border-radius:22px;background:rgba(9,11,17,.78);backdrop-filter:blur(20px);box-shadow:0 14px 40px rgba(0,0,0,.18)}.brand{display:flex;align-items:center;gap:13px;min-width:0}.logo{width:48px;height:48px;border-radius:15px;display:grid;place-items:center;font:900 16px/1 Inter,sans-serif;letter-spacing:.08em;color:#fff;background:linear-gradient(135deg,#8b5cf6,#22d3ee);box-shadow:0 0 34px rgba(139,92,246,.28)}.brand h1{margin:0;font:850 19px/1 Inter,sans-serif}.brand span{display:block;margin-top:5px;color:#727a91;font-size:9px;letter-spacing:.12em;text-transform:uppercase}.top-tools{display:flex;align-items:center;gap:8px}.avatar{width:42px;height:42px;padding:0;border-radius:13px;background:#141824;color:#d8d2ff;border-color:#2b3042}
.hero{position:relative;overflow:hidden;display:grid;grid-template-columns:minmax(0,1.25fr) minmax(300px,.75fr);gap:18px;min-height:380px;margin-bottom:30px;padding:30px;border:1px solid #25293a;border-radius:30px;background:linear-gradient(145deg,#121522,#0f1119 62%,#12101b);box-shadow:var(--shadow)}.hero:before{content:"";position:absolute;inset:-40%;pointer-events:none;background:radial-gradient(circle at 28% 28%,hsla(var(--sound-hue),90%,65%,calc(.05 + var(--sound-level)*.2)),transparent 28%);transform:rotate(-8deg)}.hero-main,.hero-aside{position:relative;z-index:1}.hero-main{display:flex;flex-direction:column;justify-content:space-between;min-width:0}.hero-kicker{display:flex;flex-wrap:wrap;gap:7px;margin-bottom:18px}.hero-kicker span{padding:7px 10px;border:1px solid #2c3040;border-radius:999px;background:#151825;color:#b5bbcc;font-size:8px;font-weight:800;letter-spacing:.08em}.live-dot:before{content:"";display:inline-block;width:7px;height:7px;border-radius:50%;margin-right:6px;background:#22d3ee;box-shadow:0 0 0 4px rgba(34,211,238,.12)}.hero h2{max-width:830px;margin:0 0 14px;font:900 clamp(38px,6vw,78px)/.93 Inter,sans-serif;letter-spacing:-3.4px}.hero h2 em{font-style:normal;background:linear-gradient(100deg,#f7f5ff,#9e8cff 45%,#55e7ff);-webkit-background-clip:text;background-clip:text;color:transparent}.hero p{max-width:720px;margin:0 0 24px;color:#9ca3b6;font-size:13px;line-height:1.72}.searchbar{position:relative;z-index:2;display:flex;gap:8px;max-width:760px}.input{width:100%;min-height:52px;padding:13px 15px;outline:none;color:var(--ink);background:#0b0e15;border:1px solid #2a3040;border-radius:15px}.input::placeholder{color:#62697b}.input:focus{border-color:#8b5cf6;box-shadow:0 0 0 4px rgba(139,92,246,.12)}.primary{border:0!important;color:#fff!important;background:linear-gradient(135deg,#8b5cf6,#635bff);box-shadow:0 14px 34px rgba(99,91,255,.22)}.hero-quick{display:flex;flex-wrap:wrap;gap:7px;margin-top:14px}.hero-quick button{font-size:9px;padding:8px 11px;background:#10131c;color:#afb6c7;border-color:#2b3040}.hero-aside{display:grid;grid-template-rows:auto 1fr auto;gap:12px;padding:18px;border-radius:22px;border:1px solid #2a2f40;background:linear-gradient(180deg,#171a26,#0e1017)}.hero-aside strong{font-size:9px;letter-spacing:.14em;text-transform:uppercase;color:#7d859a}.hero-aside .metric{align-self:end;font:900 clamp(58px,8vw,92px)/.88 Inter,sans-serif;letter-spacing:-5px}.hero-aside span{color:#8f97aa;font-size:10px;line-height:1.6}.hero-aside .line{height:1px;background:#282d3c;margin:4px 0}
.section{display:flex;align-items:end;justify-content:space-between;gap:14px;margin:28px 2px 13px}.section h2{margin:0;font:850 24px/1 Inter,sans-serif}.section small{color:#7c8498;font-size:9px}.section-actions{display:flex;gap:7px}.home-play{width:52px;height:52px;padding:0;border:0;border-radius:17px;background:linear-gradient(135deg,#22d3ee,#8b5cf6);color:#05060a}.grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:14px}.card{min-width:0;position:relative;overflow:hidden;padding:10px;border:1px solid #252a39;border-radius:21px;background:linear-gradient(180deg,#141722,#10131b);box-shadow:0 16px 42px rgba(0,0,0,.22)}.card:hover{transform:translateY(-4px);border-color:#3b4053}.cover{position:relative;overflow:hidden;aspect-ratio:1;border-radius:16px;display:grid;place-items:center;background:#0c0f16;color:#6f778d;font-size:34px}.cover:after{content:"";position:absolute;inset:0;background:linear-gradient(180deg,transparent 56%,rgba(0,0,0,.5));pointer-events:none}.cover img{width:100%;height:100%;object-fit:cover;display:block}.cover .play,.cover .offline-btn{position:absolute;z-index:3;bottom:9px;width:42px;height:42px;padding:0;border-radius:50%}.cover .play{right:9px;opacity:0;transform:translateY(4px);border:0;background:#f7f5ff;color:#0b0d12}.cover .offline-btn{left:9px;background:rgba(9,11,17,.75);border-color:#3a4051;color:#67e8f9}.card:hover .cover .play,.cover .play:focus{opacity:1;transform:none}.card-body{padding:10px 2px 2px}.title-row{display:flex;align-items:center;gap:6px;min-width:0}.title{min-width:0;font-size:13px;font-weight:800;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.source-badge{flex:0 0 auto;max-width:105px;padding:4px 7px;border-radius:999px;font-size:7px;font-weight:800;color:#c4b5fd;background:#1c1730;border:1px solid #33285a;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.sub{margin-top:4px;font-size:10px;color:#81899e;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.track-meta{display:flex;flex-wrap:wrap;gap:5px;margin-top:8px}.meta-pill{padding:4px 7px;border-radius:999px;background:#0e1119;border:1px solid #252a38;color:#7f879b;font-size:8px}.taste-panel,.track-profile{position:relative;overflow:hidden;margin-bottom:22px;padding:18px;border:1px solid #282d3d;border-radius:24px;background:linear-gradient(160deg,#121521,#0d1017);box-shadow:var(--shadow)}.taste-panel h3{margin:0 0 5px;font-size:17px}.taste-panel p{margin:0;color:#81899e;font-size:11px;line-height:1.55}.offline-panel{display:flex;align-items:center;justify-content:space-between;gap:12px;margin:0 0 22px;padding:15px 16px;border-radius:18px;border:1px solid #272c3b;background:#10131b}.offline-panel strong{display:block;font-size:12px}.offline-panel span{display:block;color:#7c8498;font-size:10px;margin-top:4px}.moods{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:12px}.mood-card{min-height:170px;position:relative;overflow:hidden;text-align:left;padding:18px;display:flex;flex-direction:column;justify-content:flex-end;border-radius:21px;background:#10131b;border:1px solid #262b3a}.mood-card:nth-child(1){border-top:3px solid #8b5cf6}.mood-card:nth-child(2){border-top:3px solid #f472b6}.mood-card:nth-child(3){border-top:3px solid #22d3ee}.mood-card:nth-child(4){border-top:3px solid #a78bfa}.mood-card:nth-child(5){border-top:3px solid #f59e0b}.mood-card:nth-child(6){border-top:3px solid #ec4899}.mood-card:nth-child(7){border-top:3px solid #64748b}.mood-card b{font-size:34px;margin-bottom:auto}.mood-card strong{font-size:15px}.mood-card span{margin-top:4px;font-size:10px;color:#7f879b}.results{display:grid;gap:8px}.result{display:flex;align-items:center;gap:11px;min-width:0;padding:10px;border-radius:17px;background:#10131b;border:1px solid #272c3b}.mini{width:60px;height:60px;flex:0 0 60px;display:grid;place-items:center;overflow:hidden;border-radius:13px;background:#0b0f16;color:#69728a;font-size:22px}.mini img{width:100%;height:100%;object-fit:cover}.meta{min-width:0;flex:1;overflow:hidden}.meta strong{display:block;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.meta span{display:block;margin-top:4px;color:#80889c;font-size:10px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.actions{display:flex;flex:0 0 auto;align-items:center;justify-content:flex-end;gap:6px;flex-wrap:wrap}.icon,.actions .offline-btn,.track-actions .offline-btn{position:static;width:38px;height:38px;padding:0;border-radius:11px}.empty{padding:38px 20px;text-align:center;color:#747c90;border:1px dashed #303546;border-radius:18px;background:#0d1017}.track-head{display:grid;grid-template-columns:210px minmax(0,1fr);gap:22px;align-items:center}.track-cover{width:210px;height:210px;overflow:hidden;border-radius:22px;display:grid;place-items:center;background:#0b0e15;color:#68718a;font-size:48px}.track-cover img{width:100%;height:100%;object-fit:contain;background:#0b0e15}.track-profile h2{margin:0;font:900 clamp(25px,4vw,48px)/1 Inter,sans-serif}.track-actions{display:flex;flex-wrap:wrap;gap:8px;margin-top:18px}.profile-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:9px;margin-top:19px}.track-stat{padding:12px;border-radius:15px;background:#0d1017;border:1px solid #252a38}.profile-back{display:flex;align-items:center;gap:8px;margin-bottom:12px}.artist-link,.album-link{border:0;background:none;padding:0;color:#67e8f9}.playlist{display:flex;align-items:center;gap:10px;padding:10px;margin-bottom:8px;border-radius:17px;background:#10131b;border:1px solid #272c3b}.playlist .pic{width:52px;height:52px;flex:0 0 52px;border-radius:14px;display:grid;place-items:center;background:linear-gradient(135deg,#8b5cf6,#22d3ee);color:#07080d}.playlist main{min-width:0;flex:1}.playlist strong,.playlist span{display:block}.playlist span{margin-top:3px;color:#788095;font-size:9px}.danger{color:var(--danger)}
.player{position:fixed;z-index:90;left:50%;bottom:14px;transform:translateX(-50%);width:min(1240px,calc(100% - 28px));display:none;grid-template-columns:auto minmax(0,1fr) auto;align-items:center;gap:11px;min-width:0;padding:12px 14px;border:1px solid #2b3040;border-radius:24px;background:rgba(10,12,18,.9);color:#fff;box-shadow:0 30px 90px rgba(0,0,0,.55);backdrop-filter:blur(24px);overflow:hidden}.player:before{content:"";position:absolute;left:0;right:0;bottom:0;height:2px;background:linear-gradient(90deg,hsl(var(--sound-hue),92%,65%),#22d3ee,#f472b6);opacity:calc(.35 + var(--sound-level)*.65)}.player.on{display:grid}.pcover{width:54px;height:54px;border-radius:15px;overflow:hidden;display:grid;place-items:center;background:#111522;color:#7b8499;cursor:pointer;position:relative;z-index:1}.pcover img{width:100%;height:100%;object-fit:cover}.pmeta{min-width:0;overflow:hidden;position:relative;z-index:1}.pmeta strong,.pmeta span{min-width:0}.pmeta strong,.pmeta span{display:block;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.pmeta strong{font-size:12px}.pmeta span{font-size:9px;color:#8991a5;margin-top:3px}.pc{display:flex;align-items:center;justify-content:flex-end;gap:6px;position:relative;z-index:2;flex-wrap:wrap}.pc .big{width:46px;height:46px;padding:0;border:0;border-radius:50%;background:#f7f5ff;color:#090b11}.pc .icon{background:#111520;border-color:#30364a;color:#dfe2ec}.pc .auto-toggle{width:42px;min-width:42px;font-size:16px;padding:0;color:#67e8f9}.seek{grid-column:1/-1;width:100%;accent-color:hsl(var(--sound-hue),92%,65%);position:relative;z-index:2}.time{grid-column:1/-1;color:#737c91;font-size:9px;margin-top:-5px;position:relative;z-index:2}.visualizer-strip{grid-column:1/-1;height:42px;position:relative;overflow:hidden;border-radius:13px;border:1px solid #222838;background:#0a0d13}.visualizer-strip:after{content:"";position:absolute;inset:0;pointer-events:none;background:radial-gradient(circle at 50% 100%,hsla(var(--sound-hue),95%,65%,calc(.06 + var(--sound-level)*.22)),transparent 68%)}.audio-visualizer{width:100%;height:100%;display:block}.fx-panel{grid-column:1/-1;border-top:1px solid #252a38;padding:11px 3px 2px}.eq-switch{display:inline-flex;align-items:center;gap:7px;font-size:9px;color:#a9b0c0;cursor:pointer}.eq-switch input{width:34px;height:18px;margin:0;accent-color:#8b5cf6}.eq-grid{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:8px}.eq-band{text-align:center;min-width:0}.eq-band input{width:100%;accent-color:#8b5cf6}.eq-band small{display:block;color:#7c8498;font-size:8px;margin-top:3px}.spatial3d{margin-top:12px;padding:10px 11px;border:1px solid #2a3040;border-radius:14px;background:#0d1017}.spatial3d-head{display:flex;align-items:center;justify-content:space-between;font-size:11px;margin-bottom:5px}.spatial3d-head span{color:#67e8f9;font-variant-numeric:tabular-nums}.spatial3d input{width:100%;accent-color:#22d3ee}.spatial3d>small{display:block;color:#7c8498;font-size:8px;margin-top:3px}
.fullscreen-player{position:fixed;inset:0;z-index:9999;display:none;place-items:center;overflow:auto;background:#06070b;color:var(--ink)}.fullscreen-player.open{display:grid}.fullscreen-player:before{content:"";position:absolute;inset:-20%;pointer-events:none;background:radial-gradient(circle at 20% 25%,hsla(var(--sound-hue),95%,60%,calc(.06 + var(--sound-level)*.22)),transparent 24%),radial-gradient(circle at 82% 72%,rgba(34,211,238,calc(.04 + var(--sound-high)*.14)),transparent 22%);filter:blur(12px)}.fs-inner{position:relative;z-index:1;width:min(900px,100%);min-height:100%;padding:24px 24px max(28px,env(safe-area-inset-bottom));display:grid;grid-template-rows:auto 1fr auto;gap:18px}.fs-top{display:flex;justify-content:space-between;align-items:center}.fs-top strong{font-size:10px;letter-spacing:.18em;text-transform:uppercase;color:#7f8799}.fs-close{width:42px;height:42px;border-radius:50%;padding:0;background:#111520;border-color:#2b3040}.fs-art-wrap{min-height:0;display:grid;place-items:center;padding:10px;position:relative}.fs-art{display:block;width:auto;height:auto;max-width:min(68vw,620px);max-height:55vh;object-fit:contain;border-radius:26px;box-shadow:0 30px 90px rgba(0,0,0,.55);background:#10131b}.fs-art-fallback{display:grid;place-items:center;width:min(68vw,620px);height:min(68vw,620px);border-radius:26px;background:#10131b;border:1px solid #2b3040;font-size:84px;color:#66708a}.fs-visualizer{position:absolute;inset:auto 8% 2%;height:78px;width:84%;pointer-events:none;opacity:calc(.44 + var(--sound-level)*.56)}.fs-bottom{display:grid;gap:12px}.fs-title{font:900 clamp(24px,5vw,52px)/1.02 Inter,sans-serif}.fs-artist{margin-top:5px;color:#7f8799;font-size:12px}.fs-seek{width:100%;accent-color:hsl(var(--sound-hue),92%,65%)}.fs-time{display:flex;justify-content:space-between;color:#7a8295;font-size:9px}.fs-controls{display:flex;justify-content:center;align-items:center;gap:10px}.fs-controls button{width:44px;height:44px;border-radius:50%;padding:0;background:#111520}.fs-controls .fs-play{width:64px;height:64px;border:0;background:linear-gradient(135deg,#8b5cf6,#22d3ee);color:#07080d}.nav{position:fixed;z-index:92;left:50%;top:86px;transform:translateX(-50%);display:flex;gap:6px;padding:7px;border:1px solid #252a38;border-radius:18px;background:rgba(10,12,18,.92);backdrop-filter:blur(20px);max-width:calc(100vw - 24px);overflow-x:auto;overflow-y:hidden}.nav button{width:82px;min-width:82px;min-height:42px;padding:7px 6px;border:0;border-radius:12px;background:transparent;color:#777f93;display:grid;place-items:center;gap:1px;box-shadow:none}.nav button.active{background:#171a26;color:#f7f5ff;box-shadow:inset 0 0 0 1px #2d3343}.nav button span{font-size:8px}.modal{position:fixed;z-index:1000;inset:0;display:none;place-items:center;padding:18px;background:rgba(2,3,6,.72);backdrop-filter:blur(12px)}.modal.open{display:grid}.dialog{width:min(560px,100%);max-height:min(88vh,760px);overflow:auto;padding:22px;border-radius:24px;border:1px solid #2a3040;background:#11141e;box-shadow:0 30px 100px rgba(0,0,0,.55)}.dialog h3{margin:0 0 8px;font:850 22px Inter,sans-serif}.dialog p{color:#7e8699;font-size:11px;line-height:1.55}.dialog .row{display:flex;gap:8px;margin-top:15px}.chips{display:flex;flex-wrap:wrap;gap:7px;margin-top:12px}.chip{padding:8px 10px;border-radius:999px;font-size:10px;background:#0d1017;border-color:#282d3d}.chip.on{background:#27203f;color:#ddd6fe;border-color:#4b3b74}.taste-grid{display:grid;grid-template-columns:1fr 1fr;gap:11px}.taste-field label{display:block;color:#7e8699;font-size:9px;margin-bottom:5px}.taste-actions{display:flex;gap:8px;margin-top:13px}.toast{position:fixed;z-index:1100;left:50%;bottom:110px;transform:translateX(-50%) translateY(15px);opacity:0;pointer-events:none;padding:11px 14px;border-radius:13px;background:#f7f5ff;color:#090b11;font-size:10px;transition:opacity .18s ease,transform .18s ease;box-shadow:0 16px 40px rgba(0,0,0,.38)}.toast.show{opacity:1;transform:translateX(-50%) translateY(0)}
@media(max-width:1050px){.app{padding-left:18px;padding-right:18px}.hero{grid-template-columns:1fr}.hero-aside{min-height:180px}.grid{grid-template-columns:repeat(3,minmax(0,1fr))}.moods{grid-template-columns:repeat(3,minmax(0,1fr))}}
@media(max-width:720px){.app{padding-top:18px;padding-bottom:250px}.top{top:8px}.brand span{display:none}.nav{top:74px;bottom:auto;width:calc(100% - 16px);justify-content:flex-start}.nav button{flex:0 0 76px;width:76px}.hero{padding:22px;border-radius:25px}.hero h2{font-size:43px;letter-spacing:-2.4px}.hero-aside{display:none}.grid{grid-template-columns:repeat(2,minmax(0,1fr))}.moods{grid-template-columns:repeat(2,minmax(0,1fr))}.player{width:calc(100% - 16px);bottom:8px;padding:10px;border-radius:20px;grid-template-columns:54px minmax(0,1fr);row-gap:8px}.pc{grid-column:1/-1;gap:4px;justify-content:space-between}.pmeta{align-self:center}.pc .icon{width:34px;height:34px}.pc .big{width:42px;height:42px}.visualizer-strip{height:34px}.track-head{grid-template-columns:1fr}.track-cover{width:100%;height:auto;aspect-ratio:1}.profile-grid{grid-template-columns:1fr 1fr}.fs-art{max-width:88vw;max-height:49vh}.fs-visualizer{height:55px}.fs-title{font-size:30px}.fullscreen-player .fs-inner{padding-left:14px;padding-right:14px}}
@media(max-width:460px){.nav{top:70px}.top{padding:11px 12px}.brand h1{font-size:17px}.avatar{width:40px;height:40px}.hero h2{font-size:36px}.searchbar{flex-direction:column}.grid{grid-template-columns:1fr}.result{gap:8px}.mini{width:52px;height:52px;flex-basis:52px}.player{grid-template-columns:auto 1fr}.player .pc{grid-column:1/-1;justify-content:space-between}.player .seek,.player .time,.player .visualizer-strip{grid-column:1/-1}}
</style></head>
<body><script>document.documentElement.dataset.telegramBot="${String(env.TELEGRAM_BOT_USERNAME||"").replace(/"/g,"&quot;")}";</script>
<div class="app">
  <header class="top"><div class="brand"><div class="logo">∞</div><div><h1>OK / SOUND LAB</h1><span>Живой микс · реактивный звук · независимые каталоги</span></div></div><div class="top-tools"><button class="avatar" id="tasteBtn" title="Мой музыкальный вкус">⌁</button></div></header>
  <main id="view"></main>
</div>
<div id="player" class="player on"><div class="pcover">♫</div><div class="pmeta"><strong>Sound Lab</strong><span>Нажми ▶ — запускаю живой автоподбор</span></div><div class="pc"><button class="icon" disabled>⏮</button><button id="initialPlay" class="big" type="button" title="Начать автоподбор">▶</button><button class="icon" disabled>⏭</button><button class="icon" disabled>EQ</button><button class="icon auto-toggle" disabled aria-label="Автопереход">↻</button></div><div class="visualizer-strip"><canvas data-visualizer class="audio-visualizer" width="900" height="42"></canvas></div><input class="seek" type="range" min="0" max="100" value="0" disabled><span class="time">0:00 / 0:00</span></div>
<div id="fullscreenPlayer" class="fullscreen-player" aria-hidden="true"></div><nav class="nav" id="nav"><button data-view="home" class="active">⌂<span>Главная</span></button><button data-view="mood">◈<span>Настроение</span></button><button data-view="search">⌕<span>Поиск</span></button><button data-view="library">♫<span>Плейлисты</span></button></nav>
<div id="modal" class="modal"><div class="dialog"><h3>Новый плейлист</h3><p>Придумай название — треки можно будет добавлять из поиска.</p><input id="playlistName" class="input" placeholder="Например: Ночная поездка"><div class="row"><button id="closeModal">Отмена</button><button id="createPlaylist" class="primary">Создать</button></div></div></div>
<audio id="okAudio" preload="auto" playsinline></audio><div id="toast" class="toast"></div><div id="tasteModal" class="modal"><div class="dialog"><h3>🎧 Мой музыкальный вкус</h3><p>Выбери любимые направления и настроение — Ok Music будет учитывать их в каждом миксе.</p><div class="taste-grid"><div class="taste-field"><label>Любимые жанры</label><div id="genreChips" class="chips"></div></div><div class="taste-field"><label>Настроение</label><div id="moodChips" class="chips"></div></div></div><div style="margin-top:14px"><label style="display:block;font-size:11px;color:var(--muted);margin-bottom:7px">Любимые исполнители</label><input id="tasteArtists" class="input" placeholder="Например: Miyagi, The Weeknd, Кино"></div><div style="margin-top:14px"><label style="display:block;font-size:11px;color:var(--muted);margin-bottom:7px">Что хочется сейчас</label><input id="tasteNow" class="input" placeholder="Например: спокойный русский рэп для дороги"></div><div class="taste-actions"><button id="tasteCancel">Отмена</button><button id="tasteSave" class="primary" style="flex:1">Сохранить вкус ✨</button></div></div></div>
<script>
const view=document.querySelector("#view"), playerEl=document.querySelector("#player"), modal=document.querySelector("#modal"), toastEl=document.querySelector("#toast");
const KEY="okmusic:v2";
const KEY_VERSION=2;

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
function loadAutoNext(){
 try{return localStorage.getItem("okmusic:auto-next")!=="false"}catch{return true}
}
function setAutoNext(value){
 autoNext=Boolean(value);
 try{localStorage.setItem("okmusic:auto-next",autoNext?"true":"false")}catch{}
 drawPlayer();
 toast(autoNext?"Автопереход включён":"Автопереход выключен");
}
let tracks=[], localTracks=[], current=null, currentIndex=-1, audio=document.querySelector("#okAudio"), nextAudio=document.createElement("audio"), playing=false, autoNext=loadAutoNext(), nextPreloadToken=0;
let playbackAttemptActive=false;
audio.setAttribute("playsinline","");
audio.preload="auto";
audio.autoplay=false;
audio.muted=false;
audio.volume=1;
nextAudio.setAttribute("playsinline","");
let playbackQueue=[], queueIndex=-1, recommendationLoading=false, recommendationSeen=new Set(), recommendationContextKey="", recommendationLastPrefetchIndex=-1;
audio.crossOrigin="anonymous";
nextAudio.preload="auto";
nextAudio.crossOrigin="anonymous";
nextAudio.setAttribute("aria-hidden","true");
const MUSIC_THEMES=[{id:"default",telegram:"#090b12"},{id:"night",telegram:"#24134d"},{id:"energy",telegram:"#35101e"},{id:"chill",telegram:"#0b2530"},{id:"love",telegram:"#351329"},{id:"road",telegram:"#2f2110"},{id:"party",telegram:"#21164a"},{id:"phonk",telegram:"#10131b"}];
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
let audioCtx=null,audioSource=null,eqPreGain=null,eqNodes=[],fxReady=false,showEq=false,eqEnabled=audioFx.eqEnabled!==false;
let analyser=null,visualizerData=null,visualizerFrame=0;
function saveAudioFx(){localStorage.setItem(AUDIO_KEY,JSON.stringify(audioFx))}
let eqLimiter=null,spatial3dNode=null,spatial3dFrame=0;
let spatial3d=0;
try{spatial3d=Math.max(0,Math.min(1,Number(JSON.parse(localStorage.getItem(AUDIO_KEY)||"{}").spatial3d)||0))}catch{}
function updateEqHeadroom(){
 if(!eqPreGain)return;
 const positive=audioFx.eq.map(v=>Math.max(0,Number(v)||0));
 const maxBoost=Math.max(0,...positive);
 const target=eqEnabled?Math.pow(10,-(maxBoost+3)/20):1;
 const now=audioCtx.currentTime;
 eqPreGain.gain.cancelScheduledValues(now);
 eqPreGain.gain.setTargetAtTime(target,now,0.035);
 eqNodes.forEach((node,i)=>{
   const value=eqEnabled?Number(audioFx.eq[i]||0):0;
   node.gain.cancelScheduledValues(now);
   node.gain.setTargetAtTime(value,now,0.035);
 });
}
function initAudioFx(){
 if(fxReady){updateEqHeadroom();return true}
 try{
  audioCtx=new (window.AudioContext||window.webkitAudioContext)();
  audioSource=audioCtx.createMediaElementSource(audio);
  eqPreGain=audioCtx.createGain();
  eqPreGain.gain.value=1;
  const freqs=[60,250,1000,4000,12000];
  eqNodes=freqs.map((f,i)=>{
   const n=audioCtx.createBiquadFilter();
   n.type=i===0?"lowshelf":i===4?"highshelf":"peaking";
   n.frequency.value=f;
   n.Q.value=i===0||i===4?0.7:1.0;
   n.gain.value=0;
   return n;
  });
  eqLimiter=audioCtx.createDynamicsCompressor();
  eqLimiter.threshold.value=-10;
  eqLimiter.knee.value=18;
  eqLimiter.ratio.value=8;
  eqLimiter.attack.value=0.005;
  eqLimiter.release.value=0.18;
  audioSource.connect(eqPreGain);
  eqPreGain.connect(eqNodes[0]);
  eqNodes.reduce((a,b)=>a.connect(b));
  eqNodes[eqNodes.length-1].connect(eqLimiter);
  spatial3dNode=typeof PannerNode==="function"
   ? new PannerNode(audioCtx,{panningModel:"HRTF",distanceModel:"inverse",refDistance:1,maxDistance:8,rolloffFactor:0.35,coneInnerAngle:360,coneOuterAngle:360,coneOuterGain:0})
   : audioCtx.createPanner();
  spatial3dNode.panningModel="HRTF";
  spatial3dNode.distanceModel="inverse";
  spatial3dNode.refDistance=1;
  spatial3dNode.maxDistance=8;
  spatial3dNode.rolloffFactor=0.35;
  spatial3dNode.positionX.value=0;spatial3dNode.positionY.value=0;spatial3dNode.positionZ.value=0;
  eqLimiter.connect(spatial3dNode);
  spatial3dNode.connect(audioCtx.destination);
  fxReady=true;
  updateEqHeadroom();
  updateSpatial3d();
  return true;
 }catch(e){console.warn("Ok Music audio FX:",e);return false}
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
 if(fxReady)updateEqHeadroom();
 saveAudioFx();
}
function setEqEnabled(value){
 eqEnabled=Boolean(value);
 audioFx.eqEnabled=eqEnabled;
 if(eqEnabled&&!fxReady&&!initAudioFx()){eqEnabled=false;audioFx.eqEnabled=false;toast("Эквалайзер недоступен в этом браузере")}
 if(fxReady)updateEqHeadroom();
 saveAudioFx();
 drawPlayer();
}
function toggleEq(){
 showEq=!showEq;
 if(showEq&&!initAudioFx()){toast("Эквалайзер недоступен в этом браузере");showEq=false;return}
 if(showEq&&audioCtx?.state==="suspended")audioCtx.resume().catch(()=>{});
 drawPlayer();
}
function eqPanel(){
 if(!showEq)return "";
 return '<div class="fx-panel"><div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px"><strong>🎚 Эквалайзер</strong><label class="eq-switch"><input data-eq-enabled type="checkbox" '+(eqEnabled?"checked":"")+'><span>'+(eqEnabled?"ВКЛ":"ВЫКЛ")+'</span></label></div><div class="eq-grid">'+eqBands.map((b,i)=>'<label class="eq-band"><input data-eq="'+i+'" type="range" min="-12" max="12" step="1" value="'+Number(audioFx.eq[i]||0)+'" '+(eqEnabled?"":"disabled")+'><small>'+b+' Hz</small></label>').join("")+'</div><div class="spatial3d"><div class="spatial3d-head"><strong>🌀 3D звук</strong><span>'+Math.round(spatial3d*100)+'%</span></div><input data-spatial3d type="range" min="0" max="1" step="0.01" value="'+spatial3d+'"><small>HRTF · пространственное вращение</small></div></div>';
}
function esc(s){return String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[c]))}
function ensureVisualizer(){
 if(!fxReady&&!initAudioFx())return false;
 if(!analyser){
  try{
   analyser=audioCtx.createAnalyser();
   analyser.fftSize=128;
   analyser.smoothingTimeConstant=.84;
   eqNodes[eqNodes.length-1].connect(analyser);
   visualizerData=new Uint8Array(analyser.frequencyBinCount);
  }catch(error){console.warn("Ok Music visualizer:",error);return false}
 }
 if(audioCtx?.state==="suspended")audioCtx.resume().catch(()=>{});
 if(!visualizerFrame)visualizerFrame=requestAnimationFrame(drawVisualizer);
 return true;
}
function drawVisualizer(){
 visualizerFrame=0;
 if(!analyser||!visualizerData||!playing){
  document.documentElement.style.setProperty("--sound-level","0");
  if(!playing)document.querySelectorAll("[data-visualizer]").forEach(canvas=>{
   const ctx=canvas.getContext("2d");if(ctx)ctx.clearRect(0,0,canvas.width,canvas.height);
  });
  return;
 }
 analyser.getByteFrequencyData(visualizerData);
 const n=visualizerData.length;
 let low=0,mid=0,high=0;
 for(let i=0;i<n;i++){
  const v=visualizerData[i]/255;
  if(i<n*.18)low+=v;else if(i<n*.55)mid+=v;else high+=v;
 }
 low/=Math.max(1,Math.floor(n*.18));mid/=Math.max(1,Math.floor(n*.37));high/=Math.max(1,Math.floor(n*.45));
 const level=Math.min(1,(low*.5+mid*.32+high*.18)*1.32);
 const hue=Math.round(238+high*78-low*34);
 document.documentElement.style.setProperty("--sound-level",level.toFixed(3));
 document.documentElement.style.setProperty("--sound-low",low.toFixed(3));
 document.documentElement.style.setProperty("--sound-mid",mid.toFixed(3));
 document.documentElement.style.setProperty("--sound-high",high.toFixed(3));
 document.documentElement.style.setProperty("--sound-hue",String(hue));
 document.querySelectorAll("[data-visualizer]").forEach(canvas=>{
  const rect=canvas.getBoundingClientRect(),dpr=Math.max(1,Math.min(2,window.devicePixelRatio||1));
  const w=Math.max(1,Math.floor(rect.width*dpr)),h=Math.max(1,Math.floor(rect.height*dpr));
  if(canvas.width!==w||canvas.height!==h){canvas.width=w;canvas.height=h}
  const ctx=canvas.getContext("2d");if(!ctx)return;
  ctx.clearRect(0,0,w,h);
  const bars=Math.min(40,n),step=w/bars;
  for(let i=0;i<bars;i++){
   const v=Math.pow(visualizerData[Math.floor(i*n/bars)]/255,1.15);
   const bh=Math.max(2,v*h*.92),x=i*step+1,y=(h-bh)/2;
   ctx.fillStyle="hsla("+((hue+i*2.4)%360)+",92%,"+(62+v*22)+"%,"+(.16+v*.84)+")";
   ctx.fillRect(x,y,Math.max(1,step-2),bh);
  }
 });
 visualizerFrame=requestAnimationFrame(drawVisualizer);
}

function save(){localStorage.setItem(KEY,JSON.stringify(state))}
function toast(s){toastEl.textContent=s;toastEl.classList.add("show");clearTimeout(window._toast);window._toast=setTimeout(()=>toastEl.classList.remove("show"),1800)}
function fmt(n){return Number.isFinite(n)&&n>0?Math.floor(n/60)+":"+String(Math.floor(n%60)).padStart(2,"0"):"0:00"}
function playableAudioCandidates(t){
 if(!t)return [];
 const out=[];
 const add=value=>{
  const src=String(value||"").trim();
  if(src&&!out.includes(src))out.push(src);
 };
 // Hitmotop is played through the same-origin Worker proxy first.
 // The direct MP3 remains a last-resort fallback.
 if(String(t.source||"")==="Hitmotop"){
  if(t.audio)add(t.audio);
 }else{
  if(t.zaycevId)add("/api/zaycev/play?id="+encodeURIComponent(String(t.zaycevId)));
  add(t.audio);
  add(t.src);
 }
 return out;
}
function playableAudio(t){return playableAudioCandidates(t)[0]||"";}
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
  if(!raw)throw Error("У трека нет аудиопотока");
  if(String(raw).startsWith("mega://"))throw Error("Этот трек из MEGA пока нельзя сохранить");
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
 return '<article class="card" data-track-profile="'+esc(t.id)+'"><div class="cover">'+(t.image?'<img src="'+esc(t.image)+'" loading="lazy">':"♫")+'<button class="play" data-play="'+esc(t.id)+'" aria-label="Слушать">▶</button></div><div class="card-body"><div class="title-row"><div class="title">'+esc(t.title||"Без названия")+'</div>'+(t.source?'<span class="source-badge">'+esc(t.source)+'</span>':"")+'</div><div class="sub"><button class="artist-link" data-artist="'+esc(t.artist||"Неизвестный исполнитель")+'">'+esc(t.artist||"Неизвестный исполнитель")+'</button>'+(t.album?' · <button class="album-link" data-album="'+esc(t.album)+'">'+esc(t.album)+'</button>':"")+'</div>'+(pills.length?'<div class="track-meta">'+pills.map(x=>'<span class="meta-pill">'+esc(x)+'</span>').join("")+'</div>':"")+'<div class="card-actions"><button class="offline-btn" data-offline="'+esc(t.id)+'" aria-label="Офлайн" title="Сохранить для офлайн">⇩</button><button class="icon" data-like="'+esc(t.id)+'" aria-label="Любимое">'+(state.liked.some(x=>x.id===t.id)?"♥":"♡")+'</button></div></div></article>';
}
function result(t){
 const liked=state.liked.some(x=>x.id===t.id);
 const pills=[Number(t.duration)>0?"◷ "+fmt(t.duration):"",t.genre?"♪ "+t.genre:""].filter(Boolean).slice(0,2);
 return '<div class="result catalog-track" data-track-profile="'+esc(t.id)+'"><div class="mini">'+(t.image?'<img src="'+esc(t.image)+'" loading="lazy">':"♫")+'</div><div class="meta"><strong>'+esc(t.title||"Без названия")+'</strong><span><button class="artist-link" data-artist="'+esc(t.artist||"Неизвестный исполнитель")+'">'+esc(t.artist||"Неизвестный исполнитель")+'</button>'+(t.album?' · <button class="album-link" data-album="'+esc(t.album)+'">'+esc(t.album)+'</button>':"")+(t.source?" · "+esc(t.source):"")+'</span>'+(pills.length?'<div class="track-meta">'+pills.map(x=>'<span class="meta-pill">'+esc(x)+'</span>').join("")+'</div>':"")+'</div><div class="actions"><button class="icon" data-like="'+esc(t.id)+'">'+(liked?"♥":"♡")+'</button><button class="icon" data-add="'+esc(t.id)+'">＋</button><button class="offline-btn" data-offline="'+esc(t.id)+'" aria-label="Офлайн" title="Сохранить для офлайн">⇩</button><button class="icon" data-play="'+esc(t.id)+'">▶</button></div></div>';
}
function findTrack(id){return tracks.find(t=>t.id===id)||localTracks.find(t=>t.id===id)||state.liked.find(t=>t.id===id)||(current?.id===id?current:null)}
function bind(container=view){
 container.querySelectorAll("[data-offline]").forEach(b=>b.onclick=e=>{e.stopPropagation();toggleOffline(findTrack(b.dataset.offline),b)});
 container.querySelectorAll("[data-play]").forEach(b=>b.onclick=e=>{
  e.stopPropagation();
  const track=findTrack(b.dataset.play);
  if(!track)return;
  const candidates=Array.isArray(tracks)&&tracks.length?tracks:[track];
  const idx=candidates.findIndex(x=>x?.id===track.id);
  playbackQueue=idx>=0?[...candidates]:[track];
  queueIndex=idx>=0?idx:0;
  recommendationSeen=new Set(playbackQueue.map(x=>String(x?.id||"")).filter(Boolean));
  recommendationLastPrefetchIndex=-1;
  play(track,{keepQueue:true});
 });
 container.querySelectorAll("[data-track-profile]").forEach(b=>b.onclick=e=>{if(e.target.closest("button"))return;openTrackProfile(b.dataset.trackProfile)});
 container.querySelectorAll("[data-artist]").forEach(b=>b.onclick=e=>{e.stopPropagation();openArtist(b.dataset.artist)});
 container.querySelectorAll("[data-album]").forEach(b=>b.onclick=e=>{e.stopPropagation();openAlbum(b.dataset.album)});
 container.querySelectorAll("[data-like]").forEach(b=>b.onclick=e=>{e.stopPropagation();like(findTrack(b.dataset.like))});
 container.querySelectorAll("[data-add]").forEach(b=>b.onclick=e=>{e.stopPropagation();addToPlaylist(findTrack(b.dataset.add))});
 void refreshOfflineButtons(container)
}
function trackInfoHtml(t){
 const image=t?.image?'<img src="'+esc(t.image)+'" loading="eager">':"♫";
 const artist=esc(t?.artist||"Неизвестный исполнитель"),album=t?.album?esc(t.album):"";
 const stats=[Number(t?.duration)>0?["Длительность",fmt(t.duration)]:null,t?.source?["Источник",t.source]:null,t?.genre?["Жанр",t.genre]:null,t?.year?["Год",t.year]:null].filter(Boolean);
 return '<div class="profile-back"><button id="profileBack">← Назад</button></div><section class="track-profile"><div class="track-head"><div class="track-cover">'+image+'</div><div><div class="profile-kicker"><span>♫ ТРЕК</span>'+(t?.source?'<span>'+esc(t.source)+'</span>':"")+'</div><h2>'+esc(t?.title||"Без названия")+'</h2><div class="sub" style="margin-top:8px"><button class="artist-link" data-artist="'+artist+'">'+artist+'</button>'+(album?' · <button class="album-link" data-album="'+album+'">'+album+'</button>':"")+'</div><div class="track-actions"><button id="profilePlay" class="primary">▶ Слушать</button><button id="profileLike">'+(state.liked.some(x=>x.id===t.id)?"♥ В любимом":"♡ В любимое")+'</button><button id="profileOffline" data-offline="'+esc(t.id)+'">⇩ Офлайн</button></div></div></div>'+(stats.length?'<div class="profile-grid">'+stats.map(x=>'<div class="track-stat"><small>'+esc(x[0])+'</small><strong>'+esc(x[1])+'</strong></div>').join("")+'</div>':"")+'</section>';
}
function openTrackProfile(id){
 const t=findTrack(id);if(!t)return toast("Трек не найден");
 view.innerHTML=trackInfoHtml(t);
 document.querySelector("#profileBack").onclick=()=>render("search");
 document.querySelector("#profilePlay").onclick=()=>play(t);
 document.querySelector("#profileLike").onclick=()=>{like(t);openTrackProfile(t.id)};
 document.querySelector("#profileOffline").onclick=e=>toggleOffline(t,e.currentTarget);
 view.querySelectorAll("[data-artist]").forEach(b=>b.onclick=()=>openArtist(b.dataset.artist));
 view.querySelectorAll("[data-album]").forEach(b=>b.onclick=()=>openAlbum(b.dataset.album));
 void refreshOfflineButtons(view);window.scrollTo({top:0,behavior:"smooth"})
}
async function openArtist(name){
 const artist=String(name||"").trim();if(!artist)return;
 view.innerHTML='<div class="section"><div><h2>'+esc(artist)+'</h2><small>Исполнитель · загружаю песни</small></div></div><div class="empty">Ищу все доступные песни исполнителя…</div>';
 try{
  const r=await fetch("/api/search?q="+encodeURIComponent(artist)+"&limit=50").then(x=>x.json());if(!r.ok)throw Error(r.error||"Ошибка");
  const needle=artist.toLowerCase();
  tracks=(r.tracks||[]).filter(t=>String(t.artist||"").toLowerCase()===needle||String(t.artist||"").toLowerCase().includes(needle));
  view.innerHTML='<div class="profile-back"><button id="artistBack">← Назад</button></div><div class="catalog-title"><div><h2>🎤 '+esc(artist)+'</h2><small>Все найденные песни исполнителя</small></div><small>'+tracks.length+' треков</small></div><div class="catalog-list results">'+(tracks.length?tracks.map(result).join(""):'<div class="empty">Песен не найдено.</div>')+'</div>';
  document.querySelector("#artistBack").onclick=()=>render("search");bind(view);if(tracks.length)toast("Найдено "+tracks.length+" песен")
 }catch(e){view.innerHTML='<div class="profile-back"><button id="artistBack">← Назад</button></div><div class="empty">Не удалось загрузить песни исполнителя.<br><small>'+esc(e.message)+'</small></div>';document.querySelector("#artistBack").onclick=()=>render("search")}
}
async function openAlbum(name){
 const album=String(name||"").trim();if(!album)return;
 view.innerHTML='<div class="section"><div><h2>'+esc(album)+'</h2><small>Альбом · загружаю треки</small></div></div><div class="empty">Ищу треки альбома…</div>';
 try{
  const r=await fetch("/api/search?q="+encodeURIComponent(album)+"&limit=50").then(x=>x.json());if(!r.ok)throw Error(r.error||"Ошибка");
  const needle=album.toLowerCase();
  tracks=(r.tracks||[]).filter(t=>String(t.album||"").toLowerCase()===needle||String(t.album||"").toLowerCase().includes(needle));
  view.innerHTML='<div class="profile-back"><button id="albumBack">← Назад</button></div><div class="catalog-title"><div><h2>💿 '+esc(album)+'</h2><small>Треки альбома</small></div><small>'+tracks.length+' треков</small></div><div class="catalog-list results">'+(tracks.length?tracks.map(result).join(""):'<div class="empty">Треки этого альбома не найдены в доступных каталогах.</div>')+'</div>';
  document.querySelector("#albumBack").onclick=()=>render("search");bind(view);if(tracks.length)toast("В альбоме "+tracks.length+" треков")
 }catch(e){view.innerHTML='<div class="profile-back"><button id="albumBack">← Назад</button></div><div class="empty">Не удалось загрузить альбом.<br><small>'+esc(e.message)+'</small></div>';document.querySelector("#albumBack").onclick=()=>render("search")}
}
function addToPlaylist(t){if(!t)return;if(!state.playlists.length){toast("Сначала создай плейлист");modal.classList.add("open");document.querySelector("#playlistName").focus();return}const names=state.playlists.map((p,i)=>(i+1)+". "+p.name+" ("+p.tracks.length+")").join("\n");const answer=window.prompt("Добавить в какой плейлист?\\n\\n"+names+"\\n\\nВведи номер:","1");const n=Number(answer);if(!Number.isInteger(n)||!state.playlists[n-1])return;const p=state.playlists[n-1];if(p.tracks.some(x=>x.id===t.id)){toast("Трек уже есть в плейлисте");return}p.tracks.push(t);save();toast("Добавлено в «"+p.name+"» ✨")}
const TASTE_GENRES=["Русский рэп","Поп","Рок","Электроника","Хип-хоп","Фонк","R&B","Lo-fi","Инди","Метал","Классика","Джаз","K-pop"]; const TASTE_MOODS=["Спокойно","Энергично","Грустно","Романтично","Ночью","Для дороги","Вечеринка","Фон для работы"]; function openTaste(){const m=document.querySelector("#tasteModal"),g=document.querySelector("#genreChips"),mo=document.querySelector("#moodChips");g.innerHTML=TASTE_GENRES.map(x=>'<button class="chip '+(state.taste.genres.includes(x)?"on":"")+'" data-g="'+esc(x)+'">'+esc(x)+'</button>').join("");mo.innerHTML=TASTE_MOODS.map(x=>'<button class="chip '+(state.taste.moods.includes(x)?"on":"")+'" data-m="'+esc(x)+'">'+esc(x)+'</button>').join("");g.querySelectorAll("[data-g]").forEach(b=>b.onclick=()=>{const x=b.dataset.g;state.taste.genres=state.taste.genres.includes(x)?state.taste.genres.filter(v=>v!==x):[...state.taste.genres,x];b.classList.toggle("on")});mo.querySelectorAll("[data-m]").forEach(b=>b.onclick=()=>{const x=b.dataset.m;state.taste.moods=state.taste.moods.includes(x)?state.taste.moods.filter(v=>v!==x):[...state.taste.moods,x];b.classList.toggle("on")});document.querySelector("#tasteArtists").value=state.taste.artists||"";document.querySelector("#tasteNow").value=state.taste.now||"";m.classList.add("open")} document.querySelector("#tasteBtn").onclick=openTaste; document.querySelector("#tasteCancel").onclick=()=>document.querySelector("#tasteModal").classList.remove("open"); document.querySelector("#tasteSave").onclick=()=>{state.taste.artists=document.querySelector("#tasteArtists").value.trim();state.taste.now=document.querySelector("#tasteNow").value.trim();save();document.querySelector("#tasteModal").classList.remove("open");toast("Вкус сохранён ✨");render("home")}; async function home(){
 view.innerHTML='<section class="hero hero-v2"><div class="hero-grid"></div><div class="hero-main"><div class="hero-kicker"><span>✦ OK MUSIC</span><span class="live-dot">КАТАЛОГ ОНЛАЙН</span><span>УМНЫЙ АВТОПОДБОР</span></div><h2>Твоя музыка.<br><em>Твой ритм.</em></h2><p>Ищи любую музыку и слушай без лишних экранов. Следующие треки подбираются скрыто и заранее — без спойлеров очереди.</p><div class="searchbar"><input id="homeQ" class="input" placeholder="Исполнитель, трек или настроение" autocomplete="off"><button id="homeSearch" class="primary">Найти музыку</button></div><div class="hero-quick"><button type="button" data-quick-q="Ночной вайб">🌙 Ночной вайб</button><button type="button" data-quick-q="Энергия">⚡ Энергия</button><button type="button" data-quick-q="Lo-fi">☁ Lo-fi</button><button type="button" data-quick-q="В дорогу">🚗 В дорогу</button></div></div><div class="hero-bottom"><div class="hero-note">🎧 Следующие песни подбираются автоматически</div><div class="hero-providers"><span>Zaycev</span><span>Jamendo</span><span>Hitmotop</span></div></div></section><div class="taste-panel"><h3>🎧 Музыкальный профиль</h3><p>Жанры, настроение и любимые исполнители используются скрыто внутри автоподбора. Никаких списков будущих песен на экране.</p><button id="editTaste" style="margin-top:12px">Настроить вкус</button></div><div class="offline-panel" id="offlineHome"><div><strong>◉ Офлайн-режим</strong><span id="offlineHomeText">Сохраняй треки кнопкой ⇩ и слушай их без интернета.</span></div><button id="clearOffline">Очистить</button></div>';
 document.querySelector("#homeSearch").onclick=()=>doSearch(document.querySelector("#homeQ").value);
 document.querySelector("#homeQ").onkeydown=e=>{if(e.key==="Enter")doSearch(e.target.value)};
 view.querySelectorAll("[data-quick-q]").forEach(b=>b.onclick=()=>doSearch(b.dataset.quickQ));
 document.querySelector("#editTaste").onclick=openTaste;
 const clear=document.querySelector("#clearOffline");if(clear)clear.onclick=clearOffline;
 void refreshOfflineButtons(view);
}
let homeBootstrapPromise=null,homeBootstrapController=null,homeBootstrapBusy=false,homePrefetchPromise=null;
async function fetchRecommendationBatch(extra={},signal,options={}){
 const force=Boolean(options?.force);
 if(recommendationPromise)return recommendationPromise;
 if(!force&&queueIndex>=0&&recommendationLastPrefetchIndex===queueIndex)return [];
 recommendationLoading=true;
 const runner=(async()=>{
  try{
   const p=recommendationParams(extra);
   const qs=new URLSearchParams({
    limit:"5",seed:p.seed,artist:p.artist,title:p.title,mood:p.mood,
    genres:p.genres,moods:p.moods,artists:p.artists,likedArtists:p.likedArtists,
    now:p.now,liked:p.liked,exclude:p.exclude,refresh:p.refresh
   });
   const controller=new AbortController();
   const timer=setTimeout(()=>controller.abort(),8500);
   const onAbort=()=>controller.abort();
   if(signal)signal.addEventListener("abort",onAbort,{once:true});
   let r;
   try{
    r=await fetch("/api/recommendations?"+qs.toString(),{cache:"no-store",signal:controller.signal});
   }finally{
    clearTimeout(timer);
    if(signal)signal.removeEventListener("abort",onAbort);
   }
   const d=await r.json();
   if(!d.ok||!Array.isArray(d.tracks))throw Error(d.error||"Нет рекомендаций");
   const existing=new Set(playbackQueue.map(t=>String(t?.id||"")));
   const fresh=d.tracks.filter(t=>t?.id&&playableAudio(t)&&!existing.has(String(t.id))&&!recommendationSeen.has(String(t.id)));
   fresh.forEach(t=>recommendationSeen.add(String(t.id)));
   playbackQueue.push(...fresh);
   recommendationContextKey=p.seed;
   recommendationLastPrefetchIndex=queueIndex;
   preloadNext();
   return fresh;
  }catch(error){
   if(error?.name==="AbortError")throw error;
   console.warn("Ok Music recommendations:",error);
   return [];
  }finally{
   recommendationLoading=false;
  }
 })();
 recommendationPromise=runner;
 try{return await runner}
 finally{if(recommendationPromise===runner)recommendationPromise=null}
}

async function fillQueue(extra={},signal){
 let next=playbackQueue[queueIndex+1];
 if(next)return next;
 // Wave is online-only. Local music remains implemented but is not wired into autoplay.
 for(let round=0;round<3;round++){
  const added=await fetchRecommendationBatch({...extra,refresh:String(Date.now())},signal,{force:true});
  next=playbackQueue[queueIndex+1];
  if(next)return next;
  if(!added?.length)await new Promise(resolve=>setTimeout(resolve,180));
 }
 return playbackQueue[queueIndex+1]||null;
}

async function ensureRecommendationWindow(extra={}){
 const remaining=playbackQueue.length-queueIndex-1;
 if(recommendationLoading||remaining>1)return;
 await fetchRecommendationBatch(extra);
}

async function startRecommendationFromContext(extra={}){
 playbackQueue=current?[current]:[];
 queueIndex=current?0:-1;
 recommendationSeen=new Set(current?[String(current.id)]:[]);
 recommendationLastPrefetchIndex=-1;
 recommendationContextKey="";
 for(let round=0;round<3&&playbackQueue.length<5;round++){
  const batch=await fetchRecommendationBatch({...extra,refresh:String(Date.now())},undefined,{force:true});
  if(!batch?.length)await new Promise(resolve=>setTimeout(resolve,180));
 }
 if(!current&&playbackQueue.length){
  queueIndex=0;
  play(playbackQueue[0],{keepQueue:true,fromBootstrap:true});
 }else if(current)preloadNext();
}

function prepareHomeQueue(){
 if(current||playbackQueue.length||homePrefetchPromise)return homePrefetchPromise;
 homePrefetchPromise=(async()=>{
  try{
   playbackQueue=[];
   queueIndex=-1;
   recommendationSeen=new Set();
   recommendationLastPrefetchIndex=-1;
   recommendationContextKey="";
   let remoteTracks=[];
   for(let round=0;round<3&&remoteTracks.length<5;round++){
    remoteTracks=await fetchRecommendationBatch({refresh:String(Date.now())},undefined,{force:true});
    if(remoteTracks.length<5)await new Promise(resolve=>setTimeout(resolve,180));
   }
   if(playbackQueue.length){
    queueIndex=-1;
    const first=playbackQueue[0],src=playableAudio(first);
    if(src){audio.src=new URL(src,location.href).href;audio.load()}
    preloadNext();
    drawPlayer();
    return playbackQueue;
   }
   toast("Каталоги не ответили — нажми ▶ для повторного поиска");
  }catch(error){
   if(error?.name!=="AbortError")console.warn("Ok Music home prefetch:",error);
  }finally{
   homePrefetchPromise=null;
  }
 })();
 return homePrefetchPromise;
}

async function initializeHomePlayer({force=false}={}){
 if(current)return;
 if(force){
  homeBootstrapController?.abort();
  homeBootstrapController=null;
  homeBootstrapPromise=null;
  homePrefetchPromise=null;
  recommendationLoading=false;
  recommendationPromise=null;
 }
 if(playbackQueue.length&&queueIndex<0){
  queueIndex=0;
  play(playbackQueue[0],{keepQueue:true,fromBootstrap:true});
  return;
 }
 if(homeBootstrapPromise)return homeBootstrapPromise;
 const controller=new AbortController();
 homeBootstrapController=controller;
 homeBootstrapBusy=true;
 drawPlayer();
 homeBootstrapPromise=(async()=>{
  try{
   playbackQueue=[];
   queueIndex=-1;
   recommendationSeen=new Set();
   recommendationLastPrefetchIndex=-1;
   let remote=[];
   for(let round=0;round<3&&remote.length<5;round++){
    if(controller.signal.aborted)throw new DOMException("Aborted","AbortError");
    remote=await fetchRecommendationBatch({refresh:String(Date.now())},controller.signal,{force:true});
    if(remote.length<5)await new Promise(resolve=>setTimeout(resolve,180));
   }
   if(playbackQueue.length){
    queueIndex=0;
    recommendationSeen=new Set(playbackQueue.map(t=>String(t?.id||"")));
    play(playbackQueue[0],{keepQueue:true,fromBootstrap:true});
    return;
   }
   toast("Не удалось найти музыку");
  }catch(error){
   if(error?.name!=="AbortError"){
    console.warn("Ok Music home bootstrap:",error);
    toast("Не удалось загрузить музыку");
   }
  }finally{
   if(homeBootstrapController===controller){
    homeBootstrapController=null;
    homeBootstrapPromise=null;
    homeBootstrapBusy=false;
    drawPlayer();
   }
  }
 })();
 return homeBootstrapPromise;
}

function mood(){
 const moodItems=[["🌙","Ночной вайб","Спокойное и атмосферное"],["⚡","Энергия","Больше ритма и движения"],["☁️","Chill","Расслабиться и выдохнуть"],["💜","Любовь","Мягкие и тёплые треки"],["🚗","В дорогу","Музыка для долгой поездки"],["🔥","Вечеринка","Ритм, который не отпускает"],["🖤","Фонк","Бас, дрифт и ночной вайб"]];
 view.innerHTML='<div class="section"><h2>Подбор по настроению</h2><small>Выбери атмосферу — песни не показываются заранее</small></div><div class="moods">'+moodItems.map((x,i)=>'<button class="mood-card" data-mood="'+i+'"><b>'+x[0]+'</b><strong>'+x[1]+'</strong><span>'+x[2]+'</span></button>').join("")+'</div><div class="empty" style="margin-top:16px">Выбранное настроение будет влиять на скрытую очередь автоподбора.</div>';
 view.querySelectorAll("[data-mood]").forEach(b=>b.onclick=async()=>{
  const i=Number(b.dataset.mood),item=moodItems[i];
  applyMusicTheme(["night","energy","chill","love","road","party","phonk"][i]||"default");
  state.taste.moods=[item[1]];
  save();
  toast("Подбираю "+item[1]+"…");
  await startRecommendationFromContext({mood:item[1]});
 });
}
function searchView(){
 view.innerHTML='<div class="section"><h2>Поиск музыки</h2><small>Zaycev.net · Jamendo · Hitmotop</small></div><div class="searchbar"><input id="q" class="input" placeholder="Исполнитель, название, жанр…"><button id="go" class="primary">Искать</button></div><div id="results" class="results" style="margin-top:18px"><div class="empty">Начни с названия трека или исполнителя.</div></div>';
 document.querySelector("#go").onclick=()=>doSearch(document.querySelector("#q").value);document.querySelector("#q").onkeydown=e=>{if(e.key==="Enter")doSearch(e.target.value)}
}
async function doSearch(q){
 q=String(q||"").trim(); if(!q){toast("Введи запрос");return}
 if(!document.querySelector("#results")){render("search");document.querySelector("#q").value=q}
 const box=document.querySelector("#results");box.innerHTML='<div class="empty">Ищу музыку…<br><small>Подбираю совпадения и обложки</small></div>';
 try{const remote=await fetch("/api/search?q="+encodeURIComponent(q)+"&limit=30",{cache:"no-store"}).then(x=>x.json());if(!remote.ok)throw Error(remote.error||"Ошибка");tracks=Array.isArray(remote.tracks)?remote.tracks:[];box.innerHTML=tracks.length?tracks.map(result).join(""):'<div class="empty">Ничего не нашлось. Попробуй другой запрос.</div>';bind(box)}catch(e){box.innerHTML='<div class="empty">Поиск временно недоступен.<br><small>'+esc(e.message)+'</small></div>'}
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
function recommendationExcludeList(){return [...recommendationSeen].slice(-60)}
function recommendationParams(extra={}){
 const explicitMood=Boolean(String(extra.mood||"").trim());
 const artist=String(extra.artist||(explicitMood?"":current?.artist)||"").trim(),title=String(extra.title||(explicitMood?"":current?.title)||"").trim();
 return {
  seed:[artist,title,...state.liked.slice(0,8).map(t=>t.artist),...state.taste.genres,...state.taste.moods,state.taste.artists,state.taste.now].filter(Boolean).join(", "),
  artist,title,mood:String(extra.mood||""),genres:state.taste.genres.join(", "),moods:state.taste.moods.join(", "),
  artists:state.taste.artists,likedArtists:[...new Set(state.liked.slice(0,20).map(t=>t.artist).filter(Boolean))].join(", "),
  now:state.taste.now,liked:state.liked.slice(0,10).map(t=>t.artist+" "+t.title).join(", "),
  exclude:recommendationExcludeList().join(","),refresh:String(Date.now())
 };
}
function findTrackIndex(t){return playbackQueue.findIndex(x=>x?.id===t?.id)}
function preloadNext(){
 const next=playbackQueue[queueIndex+1],token=++nextPreloadToken,src=playableAudio(next);
 if(!src){nextAudio.removeAttribute("src");return}
 const absolute=new URL(src,location.href).href;
 if(nextAudio.src===absolute)return;
 nextAudio.src=src;nextAudio.load();void token;
}
window.__okPlayToken=Number(window.__okPlayToken)||0;
function play(t,{fromEnded=false,keepQueue=false,fromBootstrap=false}={}){
 if(!t)return;
 let idx=playbackQueue.findIndex(x=>String(x?.id||"")===String(t.id||""));
 if(!keepQueue||idx<0){
  playbackQueue=[t];
  idx=0;
  recommendationSeen=new Set([String(t.id)]);
  recommendationContextKey="";
  recommendationLastPrefetchIndex=-1;
 }
 queueIndex=idx;
 currentIndex=idx;
 current=t;
 playing=false;
 updateMediaSession();
 drawPlayer();
 const candidates=playableAudioCandidates(t);
 if(!candidates.length){
  toast("У этого трека нет аудиопотока — пропускаю");
  void playNext();
  return;
 }
 const token=++window.__okPlayToken;
 playbackAttemptActive=true;
 let candidateIndex=0;
 const tryCandidate=()=>{
  if(token!==window.__okPlayToken||current?.id!==t.id)return;
  const src=candidates[candidateIndex];
  try{
   const absolute=new URL(src,location.href).href;
   audio.pause();
   audio.src=absolute;
   audio.load();

   let settled=false;
   let timer=0;
   const cleanup=()=>{
    clearTimeout(timer);
    audio.removeEventListener("error",onAudioError);
   };
   const fail=(error)=>{
    if(settled)return;
    settled=true;
    cleanup();
    if(token!==window.__okPlayToken)return;
    if(error?.name==="NotAllowedError"){
     toast("Браузер запретил автозапуск — нажми ▶");
     return;
    }
    // Hitmotop may leave the media request pending or return a non-playable
    // response. Give the next candidate a chance before dropping the track.
    if(candidateIndex<candidates.length-1){
     candidateIndex++;
     tryCandidate();
     return;
    }
    playbackAttemptActive=false;
    console.warn("Ok Music playback:",{error,current:t,candidates});
    const failedIndex=playbackQueue.findIndex(x=>String(x?.id||"")===String(t.id||""));
    if(failedIndex>=0){
     playbackQueue.splice(failedIndex,1);
     recommendationSeen.delete(String(t.id||""));
     queueIndex=Math.max(-1,failedIndex-1);
    }
    current=null;
    playing=false;
    toast("Поток не ответил — переключаюсь");
    setTimeout(()=>void playNext(),60);
   };
   const onAudioError=()=>fail(new Error("Audio element error"));
   audio.addEventListener("error",onAudioError,{once:true});
   timer=setTimeout(()=>fail(new Error("Audio load timeout")),7000);

   Promise.resolve(audio.play()).then(()=>{
    if(settled)return;
    settled=true;
    cleanup();
    if(token!==window.__okPlayToken||current?.id!==t.id){playbackAttemptActive=false;return}
    playbackAttemptActive=false;
    playing=true;
    ensureVisualizer();
    updateMediaSession();
    drawPlayer();
    preloadNext();
    void ensureRecommendationWindow();
   }).catch(fail);
  }catch(error){
   if(candidateIndex<candidates.length-1){candidateIndex++;tryCandidate();return;}
   playbackAttemptActive=false;
   console.warn("Ok Music playback:",error);
   current=null;
   playing=false;
   setTimeout(()=>void playNext(),60);
  }
 };
 tryCandidate();
}


function playPrevious(){
 if(queueIndex>0){
  const previous=playbackQueue[queueIndex-1];
  if(previous){
   play(previous,{keepQueue:true});
   return;
  }
 }
 try{
  audio.currentTime=0;
  const promise=audio.play();
  Promise.resolve(promise).catch(()=>{});
 }catch{}
}
async function playNext(){
 const next=await fillQueue({},undefined);
 if(next){
  play(next,{fromEnded:true,keepQueue:true});
  return;
 }
 playing=false;
 if("mediaSession" in navigator)navigator.mediaSession.playbackState="none";
 toast("Очередь закончилась — ищу ещё музыку");
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
function closeFullscreenPlayer(){
 const fs=document.querySelector("#fullscreenPlayer");
 if(!fs)return;
 fs.classList.remove("open");
 fs.setAttribute("aria-hidden","true");
 fs.innerHTML="";
}
function openFullscreenPlayer(){
 if(!current)return;
 const fs=document.querySelector("#fullscreenPlayer");
 if(!fs)return;
 const art=mediaArtworkUrl(current.image);
 fs.innerHTML='<div class="fs-inner"><div class="fs-top"><strong>NOW PLAYING</strong><button class="fs-close" id="fsClose" aria-label="Закрыть">✕</button></div><div class="fs-art-wrap">'+(art?'<img class="fs-art" src="'+esc(art)+'" alt="'+esc(current.title||"Обложка")+'">':'<div class="fs-art-fallback">♫</div>')+'<canvas data-visualizer class="fs-visualizer" width="900" height="78"></canvas></div><div class="fs-bottom"><div><div class="fs-title">'+esc(current.title||"Без названия")+'</div><div class="fs-artist">'+esc(current.artist||"Неизвестный исполнитель")+'</div></div><input id="fsSeek" class="fs-seek" type="range" min="0" max="100" value="0"><div class="fs-time"><span id="fsCur">0:00</span><span id="fsDur">'+fmt(audio.duration)+'</span></div><div class="fs-controls"><button id="fsPrev" title="Предыдущий">⏮</button><button id="fsPlay" class="fs-play">'+(playing?"Ⅱ":"▶")+'</button><button id="fsNext" title="Следующий">⏭</button><button id="fsInfo" title="Информация о треке">ⓘ</button></div></div></div>';
 fs.classList.add("open");
 fs.setAttribute("aria-hidden","false");
 const close=fs.querySelector("#fsClose");if(close)close.onclick=closeFullscreenPlayer;
 const prev=fs.querySelector("#fsPrev");if(prev)prev.onclick=playPrevious;
 const next=fs.querySelector("#fsNext");if(next)next.onclick=playNext;
 const info=fs.querySelector("#fsInfo");if(info)info.onclick=()=>openTrackProfile(current.id);
 const playButton=fs.querySelector("#fsPlay");if(playButton)playButton.onclick=()=>playing?audio.pause():audio.play().catch(()=>toast("Нажми ▶ ещё раз для запуска"));
 const seek=fs.querySelector("#fsSeek");if(seek)seek.oninput=e=>{if(audio.duration)audio.currentTime=audio.duration*Number(e.target.value)/100};
}
if(!window.__okFsKeyHandler){
 window.__okFsKeyHandler=true;
 document.addEventListener("keydown",e=>{if(e.key==="Escape")closeFullscreenPlayer()});
}
function syncFullscreenPlayer(){
 const fs=document.querySelector("#fullscreenPlayer");
 if(!fs||!fs.classList.contains("open"))return;
 if(!current){closeFullscreenPlayer();return}
 const art=mediaArtworkUrl(current.image);
 const artWrap=fs.querySelector(".fs-art-wrap");
 if(artWrap){
 const visual=artWrap.querySelector("[data-visualizer]");
 artWrap.innerHTML=(art?'<img class="fs-art" src="'+esc(art)+'" alt="'+esc(current.title||"Обложка")+'">':'<div class="fs-art-fallback">♫</div>')+(visual?'':'<canvas data-visualizer class="fs-visualizer" width="900" height="78"></canvas>');
 if(visual)artWrap.appendChild(visual);
}
 const title=fs.querySelector(".fs-title");
 const artist=fs.querySelector(".fs-artist");
 const playButton=fs.querySelector("#fsPlay");
 if(title)title.textContent=current.title||"Без названия";
 if(artist)artist.textContent=current.artist||"Неизвестный исполнитель";
 if(playButton)playButton.textContent=playing?"Ⅱ":"▶";
}
function drawPlayer(){if(!current){
 closeFullscreenPlayer();
 const busy=homeBootstrapBusy;
 playerEl.className="player on";
 playerEl.innerHTML='<div class="pcover">♫</div><div class="pmeta"><strong>Sound Lab</strong><span>'+(busy?"Синхронизирую каталоги…":"Нажми ▶ — начну живой автоподбор")+'</span></div><div class="pc"><button class="icon" disabled>⏮</button><button id="startAutoPlay" class="big" '+(busy?"disabled":"")+' title="Начать автоматический поиск">'+(busy?"…":"▶")+'</button><button class="icon" disabled>⏭</button><button class="icon" disabled>EQ</button></div><input class="seek" type="range" min="0" max="100" value="0" disabled><span class="time">'+(busy?"Жду потоки":"Готов к миксу")+'</span>';
 const start=document.querySelector("#startAutoPlay");
  if(start)start.onclick=()=>{
   if(homeBootstrapBusy)return;
   clearTimeout(window.__okHomeRetry);
   if(playbackQueue.length&&queueIndex<0){
    queueIndex=0;
    play(playbackQueue[0],{keepQueue:true,fromBootstrap:true});
    return;
   }
   initializeHomePlayer({force:true});
  };
  return;
 }
 playerEl.className="player on";
 playerEl.innerHTML='<div class="pcover" data-player-profile="1" title="Открыть плеер на весь экран">'+(current.image?'<img src="'+esc(current.image)+'">':"♫")+'</div><div class="pmeta"><strong>'+esc(current.title)+'</strong><span>'+esc(current.artist)+'</span></div><div class="pc"><button id="prev" class="icon" title="Предыдущий">⏮</button><button id="pause" class="big">'+(playing?"Ⅱ":"▶")+'</button><button id="next" class="icon" title="Следующий">⏭</button><button id="eqToggle" class="icon eq-toggle" title="Эквалайзер">EQ</button><button id="autoNextToggle" class="icon auto-toggle" title="Автопереход" aria-label="Автопереход">'+(autoNext?"↻":"×")+'</button><button id="trackInfo" class="icon" title="Информация о треке">ⓘ</button></div><div class="visualizer-strip"><canvas data-visualizer class="audio-visualizer" width="900" height="42"></canvas></div><input id="seek" class="seek" type="range" min="0" max="100" value="0"><span class="time" id="ptime">'+fmt(audio.currentTime)+' / '+fmt(audio.duration)+'</span>'+eqPanel();
 document.querySelector("#pause").onclick=()=>{
  if(playing){audio.pause();return}
  const promise=audio.play();
  Promise.resolve(promise).catch(error=>toast(error?.name==="NotAllowedError"?"Нажми ▶ ещё раз для запуска":"Не удалось воспроизвести трек"));
};
 document.querySelector("#prev").onclick=playPrevious;
 document.querySelector("#next").onclick=playNext;
 document.querySelector("#eqToggle").onclick=toggleEq;
 document.querySelector("#autoNextToggle").onclick=()=>setAutoNext(!autoNext);
 document.querySelector("#trackInfo").onclick=()=>openTrackProfile(current.id);
 document.querySelector("[data-player-profile]").onclick=()=>openFullscreenPlayer();
 document.querySelector("#seek").oninput=e=>{if(audio.duration)audio.currentTime=audio.duration*e.target.value/100};
 document.querySelectorAll("[data-eq]").forEach(s=>s.oninput=e=>setEq(Number(e.target.dataset.eq),e.target.value));
 const eqSwitch=document.querySelector("[data-eq-enabled]");
 if(eqSwitch)eqSwitch.onchange=e=>setEqEnabled(e.target.checked);
 const spatial=document.querySelector("[data-spatial3d]");
 if(spatial)spatial.oninput=e=>{setSpatial3d(e.target.value);const out=spatial.closest(".spatial3d")?.querySelector("span");if(out)out.textContent=Math.round(spatial3d*100)+"%"};
}
 syncFullscreenPlayer();
audio.onplay=()=>{playing=true;ensureVisualizer();if(audioCtx?.state==="suspended")audioCtx.resume().catch(()=>{});if(spatial3d)updateSpatial3d();if("mediaSession" in navigator)navigator.mediaSession.playbackState="playing";updateMediaSession();drawPlayer()};audio.ontimeupdate=()=>{const s=document.querySelector("#seek"),t=document.querySelector("#ptime"),fsSeek=document.querySelector("#fsSeek"),fsCur=document.querySelector("#fsCur"),fsDur=document.querySelector("#fsDur");if(s)s.value=audio.duration?audio.currentTime/audio.duration*100:0;if(t)t.textContent=fmt(audio.currentTime)+" / "+fmt(audio.duration);if(fsSeek)fsSeek.value=audio.duration?audio.currentTime/audio.duration*100:0;if(fsCur)fsCur.textContent=fmt(audio.currentTime);if(fsDur)fsDur.textContent=fmt(audio.duration);if("mediaSession" in navigator&&audio.duration)try{navigator.mediaSession.setPositionState({duration:audio.duration,playbackRate:audio.playbackRate,position:Math.min(audio.currentTime,audio.duration)})}catch{}}
audio.onpause=()=>{playing=false;if("mediaSession" in navigator)navigator.mediaSession.playbackState="paused";drawPlayer()};audio.onended=()=>{playing=false;if(autoNext)void playNext();else{if("mediaSession" in navigator)navigator.mediaSession.playbackState="none";drawPlayer()}};audio.onerror=()=>{
 if(playbackAttemptActive)return;
 const code=audio.error?.code||0;
 console.warn("Ok Music audio error",{code,src:audio.src,current:current?.id,source:current?.source});
 playing=false;
 const failedId=String(current?.id||"");
 if(failedId){
  const failedIndex=playbackQueue.findIndex(x=>String(x?.id||"")===failedId);
  if(failedIndex>=0){
   playbackQueue.splice(failedIndex,1);
   recommendationSeen.delete(failedId);
   queueIndex=Math.max(-1,failedIndex-1);
  }
 }
 current=null;
 closeFullscreenPlayer();
 toast("Поток не ответил — переключаюсь");
 setTimeout(()=>void playNext(),60);
};
nextAudio.onerror=()=>{nextAudio.removeAttribute("src")};
audio.addEventListener("canplay",()=>{preloadNext();const remaining=playbackQueue.length-queueIndex-1;if(remaining<=1)void fetchRecommendationBatch()});
document.querySelector("#closeModal").onclick=()=>modal.classList.remove("open");modal.onclick=e=>{if(e.target===modal)modal.classList.remove("open")};
document.querySelector("#createPlaylist").onclick=()=>{const name=document.querySelector("#playlistName").value.trim();if(!name)return toast("Введи название");state.playlists.unshift({id:"pl-"+Date.now(),name,tracks:[]});save();document.querySelector("#playlistName").value="";modal.classList.remove("open");library();toast("Плейлист создан ✨")}
function render(name){document.querySelectorAll(".nav button").forEach(b=>b.classList.toggle("active",b.dataset.view===name));({home,mood,search:searchView,library}[name]||home)()}
document.querySelector("#nav").addEventListener("click",e=>{const b=e.target.closest("button[data-view]");if(b)render(b.dataset.view)});
render("home");
void prepareHomeQueue();
const initialPlay=document.querySelector("#initialPlay");
if(initialPlay)initialPlay.onclick=()=>{
 clearTimeout(window.__okHomeRetry);
 if(playbackQueue.length&&queueIndex<0){
  queueIndex=0;
  play(playbackQueue[0],{keepQueue:true,fromBootstrap:true});
  return;
 }
 initializeHomePlayer({force:true});
};
function initTelegram(){if(!window.Telegram?.WebApp)return;window.Telegram.WebApp.ready();window.Telegram.WebApp.expand();const id=document.documentElement.dataset.theme||"default",t=MUSIC_THEMES.find(x=>x.id===id)||MUSIC_THEMES[0];window.Telegram.WebApp.setHeaderColor(t.telegram);window.Telegram.WebApp.setBackgroundColor(t.telegram)}
initTelegram();window.addEventListener("DOMContentLoaded",initTelegram,{once:true});
if("serviceWorker" in navigator)navigator.serviceWorker.register("/sw.js",{scope:"/"}).catch(e=>console.warn("Ok Music PWA:",e));

</script>
</body></html>`;
  return new Response(html,{headers:{"content-type":"text/html; charset=utf-8","Referrer-Policy":"origin"}});
}
