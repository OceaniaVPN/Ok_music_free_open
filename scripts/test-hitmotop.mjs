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
console.log(JSON.stringify({ok:true,count:tracks.length,tracks},null,2));
