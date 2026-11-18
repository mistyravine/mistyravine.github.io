const $=s=>document.querySelector(s);const storage={get(k,d){try{return JSON.parse(localStorage.getItem('afterglow:'+k))??d}catch{return d}},set(k,v){try{localStorage.setItem('afterglow:'+k,JSON.stringify(v))}catch{}}};
const DEFAULT_PLAYLIST={id:'afterglow-default',name:'Afterglow · mặc định',kind:'playlist',youtubeId:'PLOp1UMR_4g-o',url:'https://www.youtube.com/playlist?list=PLOp1UMR_4g-o'};
function initialSelection(savedLists,savedActive){const playlists=Array.isArray(savedLists)&&savedLists.length?savedLists:[{...DEFAULT_PLAYLIST}];const chosen=playlists.find(x=>x.id===savedActive)||playlists.find(x=>x.id!==DEFAULT_PLAYLIST.id)||playlists[0];return{playlists,activeId:chosen.id}}
const initial=initialSelection(storage.get('playlists',[]),storage.get('active',null));
let lists=initial.playlists,active=initial.activeId,player=null,ready=false,loop=true,scene=storage.get('scene','ocean');
let shuffle=storage.get('shuffle',false)===true,shufflePending=false;
function parseYouTube(value){let u;try{u=new URL(value)}catch{throw Error('Link chưa hợp lệ. Anh kiểm tra lại nhé.')}const host=u.hostname.toLowerCase();if(!['youtube.com','www.youtube.com','m.youtube.com','music.youtube.com','youtu.be','www.youtube-nocookie.com'].includes(host)||!['https:','http:'].includes(u.protocol))throw Error('Anh dùng link từ YouTube nhé.');const list=u.searchParams.get('list');if(list&&/^[a-zA-Z0-9_-]{10,160}$/.test(list)){if(list.startsWith('RD'))throw Error('YouTube Mix có thể thay đổi; anh dùng playlist đã lưu hoặc link video nhé.');return{kind:'playlist',youtubeId:list}}let video=host==='youtu.be'?u.pathname.split('/')[1]:u.searchParams.get('v')||u.pathname.match(/^\/(?:embed|shorts|live)\/([^/]+)/)?.[1];if(video&&/^[a-zA-Z0-9_-]{11}$/.test(video))return{kind:'video',youtubeId:video};throw Error('Không tìm thấy playlist hoặc video trong link này.');}
function parseMusic(value){let u;try{u=new URL(value)}catch{throw Error('Link chưa hợp lệ. Anh kiểm tra lại nhé.')}if(!['https:','http:'].includes(u.protocol))throw Error('Dùng link YouTube hoặc Spotify nhé.');if(u.hostname==='open.spotify.com'){const match=u.pathname.match(/^\/(?:intl-[a-zA-Z-]+\/)?(?:embed\/)?(playlist|track|album)\/([a-zA-Z0-9]{22})\/?$/);if(!match)throw Error('Spotify hỗ trợ link bài hát, playlist hoặc album công khai.');return{provider:'spotify',kind:match[1],spotifyId:match[2],url:'https://open.spotify.com/'+match[1]+'/'+match[2]}}if(['spotify.link','spoti.fi'].includes(u.hostname))throw Error('Anh mở link rút gọn rồi sao chép địa chỉ open.spotify.com đầy đủ nhé.');return{...parseYouTube(value),provider:'youtube',url:value}}
function isSpotify(item=selected()){return item?.provider==='spotify'}
function clearSpotify(){$('#spotify-player').replaceChildren();$('#spotify-player').hidden=true;$('.player').classList.remove('spotify')}
function showSpotify(item){if(ready)player.stopVideo();setEnabled(false);$('.player').classList.add('spotify');const wrap=$('#spotify-player');wrap.hidden=false;wrap.replaceChildren();const frame=document.createElement('iframe');frame.title='Spotify: '+item.name;frame.src='https://open.spotify.com/embed/'+item.kind+'/'+item.spotifyId+'?utm_source=generator';frame.width='100%';frame.height='152';frame.allow='autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture';frame.allowFullscreen=true;wrap.append(frame);$('#status').textContent='Bấm phát trong Spotify. Một số nội dung có thể chỉ phát bản nghe thử.'}
function selected(){return lists.find(x=>x.id===active)}function persist(){storage.set('playlists',lists);storage.set('active',active)}
function render(){const root=$('#saved');root.replaceChildren();if(!lists.length){const e=document.createElement('div');e.className='empty-library';e.innerHTML='<b>♫</b>Chưa có playlist nào.<br>Thêm những giai điệu anh muốn quay lại.';root.append(e)}lists.forEach((item,i)=>{const row=document.createElement('div');row.className='playlist-row'+(item.id===active?' active':'');const b=document.createElement('button');b.className='playlist-select';b.setAttribute('aria-pressed',String(item.id===active));const art=document.createElement('span');art.className='art';art.textContent=String(i+1).padStart(2,'0');const text=document.createElement('span'),name=document.createElement('strong'),sub=document.createElement('small');name.textContent=item.name;sub.textContent=isSpotify(item)?'Spotify · '+({track:'Bài hát',playlist:'Playlist',album:'Album'}[item.kind]):'YouTube · '+(item.kind==='playlist'?'Playlist':'Video');text.append(name,sub);b.append(art,text);b.onclick=()=>choose(item.id,true);const del=document.createElement('button');del.className='remove';del.textContent='×';del.setAttribute('aria-label','Xóa '+item.name);del.onclick=()=>{lists=lists.filter(x=>x.id!==item.id);if(active===item.id){active=null;clearSpotify();if(ready)player.stopVideo();setTrack('Một khoảng lặng');$('#status').textContent='Chọn một playlist để nghe.';$('#external').hidden=true;setEnabled(false)}persist();render()};row.append(b,del);root.append(row)})}
function setEnabled(value){['#play','#prev','#next','#seek'].forEach(s=>$(s).disabled=!value);syncShuffleButton()}
function choose(id,autoplay){shufflePending=true;active=id;persist();render();const item=selected();if(!item)return;setTrack(item.name);$('#external').href=item.url;$('#external').textContent=isSpotify(item)?'Mở trên Spotify ↗':'Mở trên YouTube ↗';$('#external').hidden=false;$('#elapsed').textContent='0:00';$('#duration').textContent='0:00';$('#seek').value=0;$('#play').innerHTML=icon('play');$('#play').setAttribute('aria-label','Phát nhạc');if(isSpotify(item)){showSpotify(item);return}clearSpotify();$('#status').textContent=ready?'Bấm phát để nghe nhạc.':'Đang kết nối YouTube…';if(ready){if(item.kind==='playlist'){const opts={listType:'playlist',list:item.youtubeId,index:0};autoplay?player.loadPlaylist(opts):player.cuePlaylist(opts)}else autoplay?player.loadVideoById(item.youtubeId):player.cueVideoById(item.youtubeId);setEnabled(true)}}
window.onYouTubeIframeAPIReady=()=>{player=new YT.Player('youtube-player',{width:300,height:200,playerVars:{playsinline:1,controls:1,rel:0,origin:location.origin},events:{onReady:()=>{ready=true;$('#empty-player').hidden=true;$('#empty-player').style.display='none';player.setVolume(storage.get('volume',60));if(selected()&&!isSpotify())choose(active,false);else if(!selected()) $('#status').textContent='Thêm nhạc để bắt đầu.'},onStateChange:e=>{if(isSpotify())return;if(e.data===1||e.data===5)applyShuffle();const playing=e.data===1;$('#play').innerHTML=icon(playing?'pause':'play');$('#play').setAttribute('aria-label',playing?'Tạm dừng':'Phát nhạc');if(playing){$('#status').textContent=selected()?.name||'Đang phát';setTrack(player.getVideoData()?.title||selected()?.name||'Đang phát');player.setLoop(loop)}if(e.data===0&&loop&&selected()?.kind==='video')player.playVideo()},onError:e=>{if(isSpotify())return;$('#status').textContent=([101,150,153].includes(e.data)?'Video không cho phép phát nhúng. Thử bài khác hoặc mở trên YouTube.':'Không phát được nội dung. Kiểm tra playlist công khai hoặc thử link khác.')}}});};
const script=document.createElement('script');script.src='https://www.youtube.com/iframe_api';script.onerror=()=>{if(!isSpotify())$('#status').textContent='Chưa kết nối được YouTube. Anh thử tải lại trang nhé.'};document.head.append(script);
setTimeout(()=>{if(!ready&&!isSpotify())$('#status').textContent='YouTube chưa sẵn sàng. Kiểm tra kết nối hoặc mở lại trang.'},18000);
$('#play').onclick=()=>{if(!ready||!selected()||isSpotify())return;player.getPlayerState()===1?player.pauseVideo():player.playVideo()};$('#prev').onclick=()=>{if(ready)player.previousVideo()};$('#next').onclick=()=>{if(ready)player.nextVideo()};$('#loop').onclick=()=>{loop=!loop;$('#loop').setAttribute('aria-pressed',String(loop));if(ready)player.setLoop(loop)};$('#volume').value=storage.get('volume',60);$('#volume').oninput=e=>{const v=Number(e.target.value);storage.set('volume',v);if(ready)player.setVolume(v)};$('#seek').oninput=e=>{if(ready)player.seekTo(player.getDuration()*Number(e.target.value)/1000,true)};function fmt(v){v=Math.floor(v||0);return Math.floor(v/60)+':'+String(v%60).padStart(2,'0')}setInterval(()=>{if(!ready||!selected()||isSpotify())return;const t=player.getCurrentTime()||0,d=player.getDuration()||0;$('#elapsed').textContent=fmt(t);$('#duration').textContent=fmt(d);if(document.activeElement!==$('#seek'))$('#seek').value=d?t/d*1000:0},1000);

// Apply once after each playlist load, not on every track transition.
function canShuffle(){return ready&&!isSpotify()&&selected()?.kind==='playlist'}
function syncShuffleButton(){const button=$('#shuffle');button.disabled=!canShuffle();button.setAttribute('aria-pressed',String(shuffle));button.title=canShuffle()?('Shuffle '+(shuffle?'bật':'tắt')):'Shuffle chỉ dùng cho playlist YouTube'}
function applyShuffle(){if(!shufflePending||!canShuffle())return;const items=player.getPlaylist?.();if(!Array.isArray(items)||!items.length)return;shufflePending=false;try{player.setShuffle(shuffle)}catch{shufflePending=true}}
$('#shuffle').onclick=()=>{if(!canShuffle())return;shuffle=!shuffle;storage.set('shuffle',shuffle);shufflePending=true;syncShuffleButton();applyShuffle()};
syncShuffleButton();

$('#add').onclick=()=>$('#playlist-dialog').showModal();document.querySelectorAll('[data-close]').forEach(b=>b.onclick=()=>closeControlOrDialog(b));document.querySelectorAll('dialog').forEach(d=>d.addEventListener('click',e=>{if(e.target===d){const r=d.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)d.close()}}));$('#playlist-form').onsubmit=e=>{e.preventDefault();try{const url=$('#playlist-url').value.trim(),parsed=parseMusic(url),name=$('#playlist-name').value.trim();if(!name)throw Error('Đặt một tên gợi nhớ nhé.');const existing=lists.find(x=>(x.provider||'youtube')===parsed.provider&&x.kind===parsed.kind&&(parsed.provider==='spotify'?x.spotifyId===parsed.spotifyId:x.youtubeId===parsed.youtubeId));let id=existing?.id||crypto.randomUUID();if(existing){existing.name=name;existing.url=parsed.url;}else lists.push({id,name,url,...parsed});persist();$('#form-error').textContent='';$('#playlist-dialog').close();e.target.reset();choose(id,true)}catch(error){$('#form-error').textContent=error.message}};
function applyScene(s){scene=s;document.body.dataset.scene=s;storage.set('scene',s);document.querySelectorAll('button[data-scene]').forEach(b=>{b.classList.toggle('selected',b.dataset.scene===s);b.setAttribute('aria-pressed',String(b.dataset.scene===s))})}document.querySelectorAll('button[data-scene]').forEach(b=>b.onclick=()=>applyScene(b.dataset.scene));applyScene(scene);
function focusMode(v){closeControls();document.body.classList.toggle('focus',v);$('#focus').setAttribute('aria-pressed',String(v));$('#exit-focus').hidden=!v;(v?$('#exit-focus'):$('#focus')).focus()}$('#focus').onclick=()=>focusMode(!document.body.classList.contains('focus'));$('#exit-focus').onclick=()=>focusMode(false);document.addEventListener('keydown',e=>{if(e.key==='Escape'&&document.body.classList.contains('focus'))focusMode(false)});
$('#settings').onclick=()=>toggleControl('settings-dialog');$('#motion').checked=storage.get('motion',false);document.body.classList.toggle('motion',$('#motion').checked);$('#motion').onchange=()=>{storage.set('motion',$('#motion').checked);document.body.classList.toggle('motion',$('#motion').checked)};
const background = $('.landscape');
const backgroundUrl = $('#custom-url');
const backgroundFile = $('#custom-file');
const backgroundStatus = $('#custom-status');
let activeFileUrl = null;
let backgroundRequest = 0;

function applyCustomBackground(source, video, fileUrl = null) {
  background.replaceChildren(...(video ? [video] : []));
  background.style.backgroundImage = video || !source ? '' : `url(${JSON.stringify(source)})`;
  if (activeFileUrl) URL.revokeObjectURL(activeFileUrl);
  activeFileUrl = fileUrl;
  if (video) video.play().catch(() => {});
}

function loadBackgroundMedia(source, isVideo) {
  return new Promise((resolve, reject) => {
    const media = isVideo ? document.createElement('video') : new Image();
    if (isVideo) {
      media.muted = true;
      media.loop = true;
      media.playsInline = true;
      media.preload = 'auto';
      media.onloadeddata = () => resolve(media);
    } else {
      media.onload = () => resolve(null);
    }
    media.onerror = reject;
    media.src = source;
  });
}

async function setBackgroundUrl(value) {
  const request = ++backgroundRequest;
  let url;
  try {
    url = new URL(value.trim());
    if (!['https:', 'http:'].includes(url.protocol)) throw new Error();
  } catch {
    backgroundStatus.textContent = 'Nhập URL trực tiếp bắt đầu bằng https:// hoặc http://.';
    return;
  }
  backgroundStatus.textContent = 'Đang tải nền…';
  try {
    const video = await loadBackgroundMedia(url.href, /\.(mp4|webm)$/i.test(url.pathname));
    if (request !== backgroundRequest) return;
    applyCustomBackground(url.href, video);
    storage.set('backgroundUrl', url.href);
    backgroundUrl.value = url.href;
    backgroundFile.value = '';
    backgroundStatus.textContent = 'Đã áp dụng nền từ URL.';
  } catch {
    if (request === backgroundRequest) {
      backgroundStatus.textContent = 'Không tải được nền. Hãy dùng link ảnh trực tiếp hoặc video MP4/WebM.';
    }
  }
}

$('#settings-form').onsubmit = event => {
  event.preventDefault();
  setBackgroundUrl(backgroundUrl.value);
};

backgroundFile.onchange = async () => {
  const file = backgroundFile.files[0];
  if (!file) return;
  const request = ++backgroundRequest;
  const source = URL.createObjectURL(file);
  backgroundStatus.textContent = 'Đang tải nền…';
  try {
    const video = await loadBackgroundMedia(source, file.type.startsWith('video/') || /\.(mp4|webm)$/i.test(file.name));
    if (request !== backgroundRequest) {
      URL.revokeObjectURL(source);
      return;
    }
    applyCustomBackground(source, video, source);
    storage.set('backgroundUrl', null);
    backgroundUrl.value = '';
    backgroundStatus.textContent = 'Đã áp dụng nền từ tệp.';
  } catch {
    URL.revokeObjectURL(source);
    if (request === backgroundRequest) {
      backgroundFile.value = '';
      backgroundStatus.textContent = 'Không mở được tệp này.';
    }
  }
};

$('#custom-default').onclick = () => {
  ++backgroundRequest;
  applyCustomBackground(null, null);
  storage.set('backgroundUrl', null);
  backgroundFile.value = '';
  backgroundUrl.value = '';
  backgroundStatus.textContent = 'Đã khôi phục nền mặc định.';
};

const savedBackgroundUrl = storage.get('backgroundUrl', '');
if (typeof savedBackgroundUrl === 'string' && savedBackgroundUrl) {
  backgroundUrl.value = savedBackgroundUrl;
  setBackgroundUrl(savedBackgroundUrl);
}
function tick(){$('#clock').textContent=new Intl.DateTimeFormat('en-GB',{hour:'2-digit',minute:'2-digit'}).format(new Date())}tick();setInterval(tick,1000);render();if(selected()){setTrack(selected().name);$('#external').href=selected().url;$('#external').hidden=false}

function icon(type){const paths={play:'<path d="M8 5v14l11-7z"/>',pause:'<path d="M6 5h4v14H6zM14 5h4v14h-4z"/>',prev:'<path d="M5 5h2v14H5zM19 5v14L8 12z"/>',next:'<path d="M17 5h2v14h-2zM5 5v14l11-7z"/>'};return '<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">'+paths[type]+'</svg>'}$('#play').innerHTML=icon('play');$('#prev').innerHTML=icon('prev');$('#next').innerHTML=icon('next');

if(isSpotify())choose(active,false);

// Scroll only overflowing titles, with a pause at each end.
function setTrack(text){const heading=$('#track');let label=heading.querySelector('.track-title');if(!label){label=document.createElement('span');label.className='track-title';heading.replaceChildren(label)}label.textContent=text;heading.title=text;requestAnimationFrame(updateTrackMotion)}
function updateTrackMotion(){const heading=$('#track'),label=heading.querySelector('.track-title');if(!label)return;const distance=Math.max(0,Math.ceil(label.scrollWidth-heading.clientWidth));heading.classList.remove('marquee');heading.style.setProperty('--title-travel',`-${distance}px`);heading.style.setProperty('--title-duration',`${Math.max(10,distance/22*2+6)}s`);if(distance>2){void heading.offsetWidth;heading.classList.add('marquee')}}
new ResizeObserver(()=>requestAnimationFrame(updateTrackMotion)).observe($('#track'));
if(document.fonts)document.fonts.ready.then(updateTrackMotion);
setTrack($('#track').textContent);

// Video and CSS particles share controls but never replace the scenery.
const FX_SOURCES={flourish:'https://mistyravine.github.io/videos/overlay/fx1.mp4',fx2:'https://mistyravine.github.io/videos/overlay/fx2.mp4',fx5:'https://mistyravine.github.io/videos/overlay/fx5.mp4'};
const fxVideo=$('#fx-video'),particleFx=AfterglowFX.create($('#fx-particles'));
let fxChoice=AfterglowFX.defaultChoice();
function boundedNumber(value,min,max,fallback){const n=Number(value);return Number.isFinite(n)?Math.min(max,Math.max(min,n)):fallback}
if(!storage.get('fxOpacityV2',false)){storage.set('fxOpacity',15);storage.set('fxOpacityV2',true)}
const fxAmounts={flourish:boundedNumber(storage.get('fxOpacity',15),0,100,15),fx2:100,fx3:boundedNumber(storage.get('fxDensity:fx3',50),0,100,50),fx4:boundedNumber(storage.get('fxDensity:fx4',50),0,100,50),fx5:15};
let fxOpacity=fxAmounts[fxChoice],fxSpeed=boundedNumber(storage.get('fxSpeed',.75),.5,1.5,.75),fxLoadTimer=null;
const isParticleFx=()=>fxChoice==='fx3'||fxChoice==='fx4';
const isVideoFx=()=>Boolean(FX_SOURCES[fxChoice]);
function fxState(state,message){$('#fx-button').dataset.state=state;$('#fx-status').textContent=message;$('#fx-status').hidden=state!=='error'}
function tuneFx(){
  fxOpacity=Number($('#fx-opacity').value);fxSpeed=Number($('#fx-speed').value);
  if(fxChoice!=='none')fxAmounts[fxChoice]=fxOpacity;
  fxVideo.style.setProperty('--fx-opacity',fxOpacity/100);fxVideo.defaultPlaybackRate=fxSpeed;fxVideo.playbackRate=fxSpeed;
  particleFx.set(fxChoice,fxOpacity,fxSpeed);
  $('#fx-opacity-value').textContent=fxOpacity+'%';$('#fx-speed-value').textContent=fxSpeed.toFixed(2)+'×';
  storage.set('fxSpeed',fxSpeed);
  if(fxChoice==='flourish')storage.set('fxOpacity',fxOpacity);
  if(isParticleFx())storage.set('fxDensity:'+fxChoice,fxOpacity);
}
async function playFx(){if(!isVideoFx()||document.hidden)return;const choice=fxChoice;try{await fxVideo.play()}catch(e){if(e.name==='AbortError'||choice!==fxChoice||!isVideoFx())return;fxState('error',e.name==='NotAllowedError'?'Trình duyệt chưa cho tự phát. Bấm Phát lại FX để bắt đầu.':'FX chưa phát được. Bấm Phát lại FX để thử lại.');$('#fx-retry').hidden=false}}
function chooseFx(value){
  clearTimeout(fxLoadTimer);const previous=fxChoice;
  fxChoice=FX_SOURCES[value]||['fx3','fx4'].includes(value)?value:'none';
  if(fxChoice==='fx3'||fxChoice==='fx4')document.body.dataset.fxTheme=fxChoice;else delete document.body.dataset.fxTheme;
  if(fxChoice==='fx2'&&previous!=='fx2')fxAmounts.fx2=100;
  storage.set('fx',fxChoice);$('#fx-select').value=fxChoice;$('#fx-retry').hidden=true;
  fxVideo.pause();fxVideo.classList.remove('is-playing');fxVideo.removeAttribute('src');fxVideo.removeAttribute('data-src');fxVideo.load();
  $('#fx-amount-label').textContent=isParticleFx()?'Mật độ':'Độ đậm';$('#fx-opacity').disabled=fxChoice==='none';$('#fx-speed').disabled=fxChoice==='none';
  $('#fx-opacity').value=fxAmounts[fxChoice]??15;tuneFx();
  if(fxChoice==='none'){fxState('off','Đã tắt FX.');return}
  if(isParticleFx()){fxState('playing',fxChoice==='fx3'?'Tuyết rơi':'Hoa đào');return}
  fxState('loading','Đang tải video FX…');fxVideo.muted=true;fxVideo.defaultMuted=true;fxVideo.defaultPlaybackRate=fxSpeed;fxVideo.playbackRate=fxSpeed;
  fxVideo.dataset.src=FX_SOURCES[fxChoice];fxVideo.src=fxVideo.dataset.src;fxVideo.load();playFx();
  fxLoadTimer=setTimeout(()=>{if(isVideoFx()&&fxVideo.readyState<3){fxState('loading','Video tải chậm hoặc nguồn không phản hồi.');$('#fx-retry').hidden=false}},15000);
}
fxVideo.addEventListener('loadedmetadata',()=>{fxVideo.playbackRate=fxSpeed});
fxVideo.addEventListener('playing',()=>{if(!isVideoFx())return;clearTimeout(fxLoadTimer);fxVideo.classList.add('is-playing');fxState('playing','FX đang phát');$('#fx-retry').hidden=true});
fxVideo.addEventListener('waiting',()=>{if(isVideoFx())fxState('loading','Đang đệm video FX…')});
fxVideo.addEventListener('error',()=>{if(!isVideoFx())return;clearTimeout(fxLoadTimer);fxVideo.classList.remove('is-playing');fxState('error','Không tải được video FX. Kiểm tra nguồn hoặc thử lại.');$('#fx-retry').hidden=false});
$('#fx-select').onchange=e=>chooseFx(e.target.value);$('#fx-speed').value=fxSpeed;$('#fx-opacity').oninput=tuneFx;$('#fx-speed').oninput=tuneFx;$('#fx-retry').onclick=()=>chooseFx(fxChoice);
document.addEventListener('visibilitychange',()=>{if(document.hidden)fxVideo.pause();else playFx()});chooseFx(fxChoice);

$('#fx-button').onclick=()=>toggleControl('fx-dialog');

function closeControls(except){document.querySelectorAll('[data-control-panel]').forEach(panel=>{if(panel.id===except)return;panel.hidden=true;document.querySelector(`[aria-controls="${panel.id}"]`)?.setAttribute('aria-expanded','false')})}
function toggleControl(id){const panel=document.getElementById(id),opening=panel.hidden;closeControls();panel.hidden=!opening;document.querySelector(`[aria-controls="${id}"]`).setAttribute('aria-expanded',String(opening))}
function closeControlOrDialog(button){const panel=button.closest('[data-control-panel]');if(panel){closeControls();document.querySelector(`[aria-controls="${panel.id}"]`).focus()}else button.closest('dialog').close()}
document.addEventListener('click',event=>{if(!event.target.closest('.control-group'))closeControls()});
document.addEventListener('keydown',event=>{if(event.key==='Escape'){const open=document.querySelector('[data-control-panel]:not([hidden])');if(open){closeControls();document.querySelector(`[aria-controls="${open.id}"]`).focus()}}});

// Phu Quoc: public model-based current weather, refreshed every 15 minutes.
function weatherDescription(code,isDay){if(code===0)return[isDay?'Trời quang':'Đêm quang',isDay?'sun':'moon'];if(code===1||code===2)return['Ít mây',isDay?'partly':'moon'];if(code===3)return['Nhiều mây','cloud'];if(code===45||code===48)return['Sương mù','fog'];if([51,53,55,56,57].includes(code))return['Mưa phùn','rain'];if([61,63,65,66,67].includes(code))return['Có mưa','rain'];if([71,73,75,77,85,86].includes(code))return['Có tuyết','snow'];if([80,81,82].includes(code))return['Mưa rào','rain'];if([95,96,99].includes(code))return['Dông','storm'];return['Thời tiết','cloud']}
function weatherIcon(kind){const cloud='<path d="M6 17a4 4 0 0 1 0-8 6 6 0 0 1 11-1 4.5 4.5 0 0 1 1 9Z"/>';const paths={sun:'<circle cx="12" cy="12" r="4"/><path d="M12 1v2m0 18v2M1 12h2m18 0h2M4 4l2 2m12 12 2 2M4 20l2-2M18 6l2-2"/>',moon:'<path d="M20 15A9 9 0 0 1 9 4a9 9 0 1 0 11 11Z"/>',cloud,partly:'<path d="M4 3v2M1 8h2M8 1v2M4 8a4 4 0 0 1 8-1"/>'+cloud,rain:cloud+'<path d="m7 20-1 2m6-2-1 2m6-2-1 2"/>',fog:cloud+'<path d="M3 20h18M6 23h12"/>',snow:cloud+'<path d="M7 21h.01M12 23h.01M17 21h.01"/>',storm:cloud+'<path d="m12 17-3 4h4l-2 3"/>'};return '<svg viewBox="0 0 24 26" width="18" height="19" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">'+(paths[kind]||cloud)+'</svg>'}
function paintWeather(data,stale=false){const [label,icon]=weatherDescription(data.weather_code,data.is_day);$('#weather-icon').innerHTML=weatherIcon(icon);$('#weather-condition').textContent=label;$('#weather-temp').textContent=Math.round(data.temperature_2m)+'°C';$('#weather').title='Phú Quốc · '+label+' · Open-Meteo'+(stale?' · dữ liệu lưu gần nhất':'');$('#weather').setAttribute('aria-label','Phú Quốc: '+label+', '+Math.round(data.temperature_2m)+' độ C'+(stale?', dữ liệu lưu gần nhất':''))}
let weatherInFlight=false;async function refreshWeather(){if(weatherInFlight)return;const cache=storage.get('weatherCache',null);if(cache&&Date.now()-cache.savedAt<15*60*1000){paintWeather(cache.data);return}if(cache&&Date.now()-cache.savedAt<2*60*60*1000)paintWeather(cache.data,true);weatherInFlight=true;const controller=new AbortController(),timeout=setTimeout(()=>controller.abort(),12000);try{const response=await fetch('https://api.open-meteo.com/v1/forecast?latitude=10.2899&longitude=103.9840&current=temperature_2m,weather_code,is_day&timezone=Asia%2FBangkok',{signal:controller.signal});if(!response.ok)throw Error('Weather unavailable');const result=await response.json(),data=result.current;if(!Number.isFinite(data?.temperature_2m)||!Number.isFinite(data?.weather_code))throw Error('Weather invalid');storage.set('weatherCache',{savedAt:Date.now(),data});paintWeather(data)}catch{if(!(cache&&Date.now()-cache.savedAt<2*60*60*1000)){$('#weather-condition').textContent='Chưa có dữ liệu';$('#weather-temp').textContent='—°C';$('#weather').title='Thời tiết Phú Quốc tạm thời không tải được · Open-Meteo'}}finally{clearTimeout(timeout);weatherInFlight=false}}
refreshWeather();setInterval(refreshWeather,15*60*1000);
const DRINKS=[
{id:'mojito',category:'cocktail',name:'Mojito',note:'Mát · chua nhẹ · thơm bạc hà',description:'Rum trắng, chanh, bạc hà và soda. Tươi mát, sảng khoái như một buổi tối gần biển.'},
{id:'margarita',category:'cocktail',name:'Margarita',note:'Chua · citrus · viền muối',description:'Tequila hòa cùng rượu cam và nước chanh. Vị chua rõ, cân bằng bằng chút ngọt và muối.'},
{id:'pina',category:'cocktail',name:'Piña Colada',note:'Ngọt · dừa · dứa',description:'Rum, nước dứa và kem dừa. Mềm, béo nhẹ và mang hương vị nhiệt đới.'},
{id:'gin-tonic',category:'cocktail',name:'Gin & Tonic',note:'Thanh · thảo mộc · đắng nhẹ',description:'Gin cùng tonic và một lát chanh. Đơn giản, thơm mùi thảo mộc với hậu vị khô.'},
{id:'spritz',category:'light',name:'Aperol Spritz',note:'Cam · đắng dịu · sủi bọt',description:'Aperol, prosecco và soda. Hương cam nổi bật, có bọt nhẹ và hậu vị đắng đặc trưng.'},
{id:'rose',category:'light',name:'Rosé',note:'Trái cây · tươi · thanh',description:'Một ly vang hồng ướp mát. Vị trái cây và độ ngọt thay đổi theo loại vang.'},
{id:'prosecco',category:'light',name:'Prosecco',note:'Sủi bọt · lê · táo',description:'Vang sủi của Ý, thường có hương táo và lê. Nhẹ nhàng trong cảm giác thưởng thức.'},
{id:'cider',category:'light',name:'Apple Cider',note:'Táo · chua ngọt · có ga',description:'Đồ uống lên men từ táo, dùng lạnh. Hương trái cây và chút bọt vui miệng.'},
{id:'cola',category:'soft',name:'Cola',note:'Caramel · ngọt · có ga',description:'Cola lạnh cùng đá và một lát chanh. Một lựa chọn quen thuộc cho đêm nghe nhạc.'},
{id:'orange',category:'soft',name:'Orange Soda',note:'Cam · ngọt · có ga',description:'Soda cam mát lạnh, vị ngọt và hương citrus. Một chút màu nắng giữa căn phòng đêm.'},
{id:'lime-soda',category:'soft',name:'Lime Soda',note:'Chanh · thanh · sảng khoái',description:'Chanh tươi, soda và chút đường tùy thích. Tươi mát, gọn nhẹ và không cồn.'},
{id:'sparkling',category:'soft',name:'Sparkling Water',note:'Tinh khiết · bọt nhẹ · không ngọt',description:'Nước khoáng có ga dùng lạnh. Có thể thêm lát chanh để thơm dịu hơn.'}
];
let drinkCategory='cocktail',drinkChoice=null;
function renderDrinks(){const list=$('#drink-list');list.replaceChildren();DRINKS.filter(d=>d.category===drinkCategory).forEach(drink=>{const row=document.createElement('label');row.className='drink-card'+(drinkChoice===drink.id?' selected':'');const radio=document.createElement('input');radio.type='radio';radio.name='bar-drink';radio.value=drink.id;radio.checked=drinkChoice===drink.id;const image=document.createElement('div');image.className='drink-placeholder';image.setAttribute('aria-hidden','true');const photo=document.createElement('img');photo.src=drinkImage(drink.id);photo.alt='';photo.width=64;photo.height=76;photo.loading='lazy';photo.decoding='async';photo.onerror=()=>{photo.hidden=true};image.append(photo);const copy=document.createElement('div');copy.className='drink-copy';const name=document.createElement('strong'),note=document.createElement('small'),description=document.createElement('p');name.textContent=drink.name;note.textContent=drink.note;description.textContent=drink.description;copy.append(name,note,description);row.append(radio,image,copy);radio.onchange=()=>{drinkChoice=drink.id;list.querySelectorAll('.drink-card').forEach(card=>card.classList.toggle('selected',card.querySelector('input').checked));$('#drink-selected').textContent=drink.name;$('#drink-confirm').disabled=false};list.append(row)})}
$('#bar-sign').onclick=()=>{closeControls();drinkChoice=null;$('#drink-selected').textContent='Chọn một món anh thích.';$('#drink-confirm').disabled=true;renderDrinks();$('#bar-dialog').showModal()};document.querySelectorAll('[data-drink-category]').forEach(button=>button.onclick=()=>{drinkCategory=button.dataset.drinkCategory;drinkChoice=null;$('#drink-confirm').disabled=true;$('#drink-selected').textContent='Chọn một món anh thích.';document.querySelectorAll('[data-drink-category]').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));renderDrinks()});$('#drink-confirm').onclick=()=>{const drink=DRINKS.find(d=>d.id===drinkChoice);if(!drink)return;$('#bar-dialog').close();serveDrink(drink)};

const DRINK_IMAGES={mojito:'mojito',margarita:'margarita',pina:'pinacolada','gin-tonic':'gintonic',spritz:'aperolspritz',rose:'rose',prosecco:'prosecco',cider:'applecider-clear',cola:'coca',orange:'orangesoda','lime-soda':'limesoda',sparkling:'sparklingwater'};
function drinkImage(id){return 'assets/menu/'+DRINK_IMAGES[id]+'.webp'}
const servedDrinks=[],activeDrinkFalls=new Set();
function reduceDrinkMotion(){return window.matchMedia('(prefers-reduced-motion: reduce)').matches}
function flyOldestOut(entry){const rect=entry.node.getBoundingClientRect();if(reduceDrinkMotion())return;const image=document.createElement('img');image.className='drink-flight drink-leaving';image.src=drinkImage(entry.drink.id);image.alt='';image.setAttribute('aria-hidden','true');Object.assign(image.style,{left:rect.left+'px',top:rect.top+'px',width:rect.width+'px',height:rect.height+'px'});document.body.append(image);const animation=image.animate([{transform:'translate3d(0,0,0) rotate(0)',opacity:1},{transform:`translate3d(${-rect.right-40}px,30px,0) rotate(-18deg)`,opacity:0}],{duration:550,easing:'ease-in',fill:'forwards'});animation.finished.catch(()=>{}).finally(()=>image.remove())}
function dropIntoTray(entry){const target=entry.node.querySelector('img'),rect=target.getBoundingClientRect();if(!entry.node.isConnected)return;if(reduceDrinkMotion()||document.hidden){target.style.opacity='1';return}while(activeDrinkFalls.size>=3){const oldest=activeDrinkFalls.values().next().value;oldest.animation.finish() ;activeDrinkFalls.delete(oldest)}const image=document.createElement('img');image.className='drink-flight';image.src=target.src;image.alt='';image.setAttribute('aria-hidden','true');Object.assign(image.style,{left:'0',top:'0',width:rect.width+'px',height:rect.height+'px'});document.body.append(image);const x=rect.left,y=rect.top;const animation=image.animate([{transform:`translate3d(${x-16}px,${-rect.height-20}px,0) rotate(-13deg)`,opacity:0},{transform:`translate3d(${x+22}px,${y*.25}px,0) rotate(12deg)`,opacity:1,offset:.3},{transform:`translate3d(${x-15}px,${y*.68}px,0) rotate(-9deg)`,opacity:1,offset:.65},{transform:`translate3d(${x+4}px,${y+5}px,0) rotate(3deg)`,opacity:1,offset:.91},{transform:`translate3d(${x}px,${y}px,0) rotate(0)`,opacity:1}],{duration:1000,easing:'cubic-bezier(.3,.05,.6,1)',fill:'forwards'});const flight={animation,image,entry};activeDrinkFalls.add(flight);animation.finished.catch(()=>{}).finally(()=>{image.remove();target.style.opacity='1';activeDrinkFalls.delete(flight)})}
function serveDrink(drink){const tray=$('#drink-tray'),list=$('#served-drinks');tray.hidden=false;document.body.classList.add('has-served-drinks');const previous=new Map(servedDrinks.map(entry=>[entry.node,entry.node.getBoundingClientRect()]));if(servedDrinks.length===9){const oldest=servedDrinks.shift();for(const flight of activeDrinkFalls){if(flight.entry===oldest){flight.animation.cancel();activeDrinkFalls.delete(flight)}}flyOldestOut(oldest);oldest.node.remove()}const node=document.createElement('li');node.className='served-drink';node.title=drink.name;const image=document.createElement('img');image.src=drinkImage(drink.id);image.alt=drink.name;image.draggable=false;image.style.opacity='0';node.append(image);list.append(node);const entry={drink,node};servedDrinks.push(entry);requestAnimationFrame(()=>{if(!reduceDrinkMotion())for(const item of servedDrinks){const old=previous.get(item.node);if(old){const now=item.node.getBoundingClientRect();const dx=old.left-now.left;if(dx)item.node.animate([{transform:`translateX(${dx}px)`},{transform:'translateX(0)'}],{duration:350,easing:'ease-out'})}}const ready=image.decode?image.decode().catch(()=>{}):Promise.resolve();ready.then(()=>{if(node.isConnected)dropIntoTray(entry)})})}
function settleDrinkFlights(){for(const flight of activeDrinkFalls)flight.animation.finish()}
window.addEventListener('resize',settleDrinkFlights);document.addEventListener('visibilitychange',()=>{if(document.hidden)settleDrinkFlights()});

function resetDrinkTray(){for(const flight of activeDrinkFalls)flight.animation.cancel();activeDrinkFalls.clear();document.querySelectorAll('.drink-flight').forEach(image=>{image.getAnimations().forEach(animation=>animation.cancel());image.remove()});servedDrinks.length=0;$('#served-drinks').replaceChildren();$('#drink-tray').hidden=true;document.body.classList.remove('has-served-drinks');drinkChoice=null;$('#drink-selected').textContent='Chọn một món anh thích.';$('#drink-confirm').disabled=true;$('#bar-dialog').close()}
$('#drink-reset').onclick=resetDrinkTray;

// Seasonal greetings take priority; normal evenings use a cached online quote.
const ROOM_QUOTES=[
  {quote:'Take your time. The night is yours.',author:''},
  {quote:'Let the music keep you company for a while.',author:''},
  {quote:'A quiet moment is a lovely place to begin.',author:''},
  {quote:'There is no hurry here. Just breathe and listen.',author:''}
];
let roomQuote=ROOM_QUOTES[Math.floor(Math.random()*ROOM_QUOTES.length)],roomDay='',roomQuotePending=false;
function validRoomQuote(q){return q&&typeof q.quote==='string'&&q.quote.trim().length>0&&q.quote.length<=160&&typeof q.author==='string'&&q.author.length<=60}
function paintRoomStatus(){const season=AfterglowCalendar.seasonAt();$('#room-status').dataset.season=season.kind;const message=season.kind==='ordinary'?roomQuote.quote:season.message,author=season.kind==='ordinary'?roomQuote.author:'';if($('#room-message').textContent!==message)$('#room-message').textContent=message;if($('#room-author').textContent!==author)$('#room-author').textContent=author}
async function refreshRoomQuote(){
  if(roomQuotePending||AfterglowCalendar.seasonAt().kind!=='ordinary')return;
  const cache=storage.get('roomQuoteV1',null);
  if(cache&&validRoomQuote(cache.data)){roomQuote=cache.data;paintRoomStatus();if(Date.now()-cache.savedAt<3600000)return}
  roomQuotePending=true;const controller=new AbortController(),timeout=setTimeout(()=>controller.abort(),6000);
  try{for(let attempt=0;attempt<3;attempt++){const response=await fetch('https://dummyjson.com/quotes/random',{signal:controller.signal,cache:'no-store'});if(!response.ok)throw Error('Quote unavailable');const q=await response.json();if(validRoomQuote(q)){roomQuote={quote:q.quote.trim(),author:q.author.trim()};storage.set('roomQuoteV1',{savedAt:Date.now(),data:roomQuote});paintRoomStatus();break}}}catch{/* Keep the last good quote or a local room whisper. */}finally{clearTimeout(timeout);roomQuotePending=false}
}
function refreshRoomDay(){const day=new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Ho_Chi_Minh'}).format(new Date());paintRoomStatus();if(day!==roomDay){roomDay=day;refreshRoomQuote()}}
refreshRoomDay();setInterval(refreshRoomDay,30000);
document.addEventListener('visibilitychange',()=>{if(!document.hidden)refreshRoomDay()});
