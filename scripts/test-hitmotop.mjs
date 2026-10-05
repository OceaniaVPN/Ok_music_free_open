import {parseHitmotopSearch} from "../src/api/providers/hitmotop.js";

const html=`
<ul>
<li class="tracks__item">
  <div class="track__img" style="background-image: url('/cover/a.jpg');"></div>
  <div class="track__title">Artist One — Track One</div>
  <div class="track__desc">Artist One</div>
  <div class="track__fulltime">3:42</div>
  <a class="track__download-btn" href="/get/music/artist_one_-_track_one_123456.mp3">x</a>
  <a class="track__info-l" href="/song/111">i</a>
</li>
<li class="tracks__item">
  <div class="track__img" style="background-image: url('https://statcore.hitmcdn.com/covers/b.jpg');"></div>
  <div class="track__title">Track Two</div>
  <div class="track__desc">Artist Two</div>
  <div class="track__fulltime">04:05</div>
  <a class="track__download-btn" href="/get/music/artist_two_-_track_two_654321.mp3">x</a>
  <a class="track__info-l" href="/song/222">i</a>
</li>
</ul>`;

const tracks=parseHitmotopSearch(html,"https://hitmos.me",5);
if(tracks.length!==2)throw new Error("expected 2 tracks");
if(tracks[0].title!=="Artist One — Track One"||tracks[0].artist!=="Artist One"||tracks[0].duration!==222)throw new Error("track 1 metadata failed");
if(!tracks[0].image.endsWith("/cover/a.jpg"))throw new Error("track 1 cover failed");
if(!tracks[0].audio.includes("/api/hitmotop/play?url="))throw new Error("track audio proxy failed");
if(tracks[1].title!=="Track Two"||tracks[1].artist!=="Artist Two"||tracks[1].duration!==245)throw new Error("track 2 metadata failed");
const divWrappedHtml=html
  .replace('<li class="tracks__item">','<div class="tracks__item">')
  .replace('</li>','</div>');
const divTracks=parseHitmotopSearch(divWrappedHtml,"https://hitmos.me",5);
if(divTracks.length!==2||divTracks[0].title!=="Artist One — Track One"||divTracks[1].artist!=="Artist Two"){
  throw new Error("parser must not depend on a surrounding li.tracks__item");
}


import {resolveHitmotopPlaybackUrl,getHitmotopSessionInfo} from "../src/api/providers/hitmotop.js";

const realFetch=globalThis.fetch;
const calls=[];
globalThis.fetch=async (input,options={})=>{
  const href=String(input);
  const cookie=options.headers?.cookie||"";
  const method=options.method||"GET";
  calls.push({href,method,cookie});
  if(href==="https://hitmos.me/"){
    const bootstrapCount=calls.filter(call=>call.href===href).length;
    if(bootstrapCount===1){
      return new Response("",{
        status:403,
        headers:{"set-cookie":"sid=challenge123; Path=/"}
      });
    }
    if(cookie!=="sid=challenge123"){
      throw new Error("session cookie was not preserved across 403 bootstrap");
    }
    return new Response("",{
      status:200,
      headers:{"set-cookie":"sid=ready456; Path=/"}
    });
  }
  if(href.includes("/get/music/")&&method==="HEAD"){
    if(cookie!=="sid=ready456"){
      throw new Error("playback HEAD did not receive the refreshed sid cookie");
    }
    const response=new Response("",{status:200,headers:{"content-type":"audio/mpeg"}});
    Object.defineProperty(response,"url",{value:"https://cdn.example/audio.mp3"});
    return response;
  }
  throw new Error("unexpected test fetch: "+href);
};

const resolved=await resolveHitmotopPlaybackUrl(
  "https://hitmos.me/get/music/artist_one_-_track_one_123456.mp3"
);
if(resolved!=="https://cdn.example/audio.mp3")throw new Error("direct playback URL resolution failed");
if(calls.length!==3)throw new Error("expected 403 bootstrap retry + HEAD playback probe");
if(calls[0].method!=="GET"||calls[0].cookie!=="")throw new Error("unexpected initial session request");
if(calls[1].method!=="GET"||calls[1].cookie!=="sid=challenge123")throw new Error("Hitmotop session did not retry with sid from 403");
if(calls[2].method!=="HEAD"||calls[2].cookie!=="sid=ready456")throw new Error("Hitmotop session cookie was not refreshed/forwarded");

const sessionInfo=await getHitmotopSessionInfo(
  "https://hitmos.me/get/music/artist_one_-_track_one_123456.mp3"
);
if(sessionInfo.cookie!=="sid=ready456")throw new Error("cached Hitmotop session was not reused between requests");
if(calls.length!==3)throw new Error("session info unexpectedly created a second network session");

globalThis.fetch=realFetch;

console.log(JSON.stringify({
  ok:true,
  count:tracks.length,
  resolved,
  sessionBootstrapRetry:true,
  sessionCacheReused:true
},null,2));
