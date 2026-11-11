/* Hiraeth v4.2 — consolidated classic scripts; execution order preserved. */

/* ===== BASE ===== */
function openTab(evt, categoryName) {
  const next = document.getElementById(categoryName);
  if (!next) return;
  pauseAllMedia();
  document.querySelectorAll('.tab-content').forEach(tab => { tab.style.display = tab === next ? 'block' : 'none'; });
  document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.toggle('active', btn === evt.currentTarget));
  if (typeof renderSection === 'function' && categoryName !== 'quotes') renderSection(categoryName);
  const wrapper = document.querySelector('.media-wrapper');
  if (wrapper) wrapper.scrollTop = 0;
}

window.hiraethBuildRain = () => {
  const container = document.getElementById('rainContainer');
  const dropCount = window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : (window.innerWidth < 768 ? 24 : 65);

  if (!container || container.childElementCount) return;
  const fragment = document.createDocumentFragment();
  for (let i = 0; i < dropCount; i++) {
    const drop = document.createElementNS("http://www.w3.org/2000/svg", "svg");

    const x = Math.floor(Math.random() * 100);
    const o = Math.random() * 0.8 + 0.2; // Opacity
    const a = Math.random() * 0.5 + 0.5; // Speed
    const d = 0;
    const s = Math.random() * 0.6 + 0.4; // Scale
    const delay = Math.random() * -20;

    drop.setAttribute("class", "rain__drop");
    drop.setAttribute("viewBox", "0 0 5 50");
    drop.setAttribute("preserveAspectRatio", "xMinYMin");

    // Setting the CSS variables
    drop.style.setProperty('--x', x);
    drop.style.setProperty('--o', o);
    drop.style.setProperty('--a', a);
    drop.style.setProperty('--d', d);
    drop.style.setProperty('--s', s);
    drop.style.setProperty('--delay', delay + 's');

    drop.innerHTML = `<path stroke="none" d="M 2.5,0 C 2.6949458,3.5392017 3.344765,20.524571 4.4494577,30.9559 5.7551357,42.666753 4.5915685,50 2.5,50 0.40843152,50 -0.75513565,42.666753 0.55054234,30.9559 1.655235,20.524571 2.3050542,3.5392017 2.5,0 Z"></path>`;

    fragment.appendChild(drop);
  }
  container.appendChild(fragment);
};
window.addEventListener('DOMContentLoaded', () => {
  const images = [
    'images/loader/Shaper.jpg',
    'images/loader/Frill.jpg'
  ];

  const randomImage = images[Math.floor(Math.random() * images.length)];
  const loaderImg = document.getElementById('loader-bg');

  if (loaderImg) {
    loaderImg.src = randomImage;
  }
});

// Never hold the first paint for an arbitrary extra delay.
window.addEventListener('DOMContentLoaded', () => {
  const loader = document.getElementById('loader');
  if (loader) requestAnimationFrame(() => loader.classList.add('loader-hidden'));
});
// Hàm dừng tất cả video và iframe
function pauseAllMedia() {
  // 1. Dừng tất cả video MP4 cục bộ
  const allVideos = document.querySelectorAll('video.js-video');
  allVideos.forEach(video => video.pause());

  // 2. Dừng tất cả YouTube Iframes
  const allIframes = document.querySelectorAll('iframe.js-video');
  allIframes.forEach(iframe => {
    iframe.contentWindow?.postMessage(JSON.stringify({event:'command',func:'pauseVideo',args:[]}), 'https://www.youtube.com');
  });
}

// Lắng nghe sự kiện Play
document.addEventListener('play', function (e) {
  // Nếu một video MP4 cục bộ được bật, dừng các cái khác
  if (e.target.tagName === 'VIDEO') {
    const allVideos = document.querySelectorAll('video.js-video');
    allVideos.forEach(video => {
      if (video !== e.target) video.pause();
    });

    // Dừng luôn cả YouTube
    const allIframes = document.querySelectorAll('iframe.js-video');
    allIframes.forEach(iframe => {
      iframe.contentWindow?.postMessage(JSON.stringify({event:'command',func:'pauseVideo',args:[]}), 'https://www.youtube.com');
    });
  }
}, true);


window.difyChatbotConfig = {
  token: 'pgcinwP29itISvIM',
  inputs: {
    // You can define the inputs from the Start node here
    // key is the variable name
    // e.g.
    // name: "NAME"
  },
  systemVariables: {
    // user_id: 'YOU CAN DEFINE USER ID HERE',
    // conversation_id: 'YOU CAN DEFINE CONVERSATION ID HERE, IT MUST BE A VALID UUID',
  },
  userVariables: {
    // avatar_url: 'YOU CAN DEFINE USER AVATAR URL HERE',
    // name: 'YOU CAN DEFINE USER NAME HERE',
  },
}

/* ===== SCRIPT ===== */
const quoteData = [
    { text: "One day you will fly", author: "#Kalandra", bg: "https://d1lss44hh2trtw.cloudfront.net/assets/article/2022/08/10/kalandracinematic4_feature.jpg" },
    { text: "I shall never doubt the power of innocent dreamers", author: "#Queen Nehellenia", bg: "https://i.ytimg.com/vi/XKK5WUEMfbE/hqdefault.jpg" },
    { text: "Nothing. I felt nothing. No sadness or anger. No joy. No pain. No pleasure. I was free. Free to move, to go where I please. Free of desire. Free to see the universe for what it was. Empty.", author: "#Sirus", bg: "https://i.ytimg.com/vi/O0pwSQbwKPE/maxresdefault.jpg" },
    { text: "If I were you, I'd curse your incompetence!", author: "#Moriya Minakata #Last Blade", bg: "https://www.arcadequartermaster.com/lb2/win_moriya.png" },
    { text: "Nothing can erase my pain", author: "#Magician", bg: "https://i.ytimg.com/vi/PBnwj8WYNaY/hqdefault.jpg" },
];

function loadQuotes() {
    const container = document.getElementById('quotes');
    container.innerHTML = quoteData.map(item => `
  <div class="media-card" style="background: linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.6)), url(${item.bg}) no-repeat center/cover">
    <p class="quote-style">${item.text}</p>
    <div class="media-footer">${item.author}</div>
  </div>
`).join('');
}
const galleryData = {
    images: [
        { src: "images/Celeste.webp", tag: "#Celeste" },
        { src: "images/Patty.webp", tag: "#Patty #Mapple Town" },
        { src: "https://i.ytimg.com/vi/rm8Ctdm3oNM/maxresdefault.jpg", tag: "#Maria" }
    ],
    games: [
        { type: "youtube", src: "https://www.youtube.com/embed/5v025kIQBhY", tag: "#P4" },
        { type: "youtube", src: "https://www.youtube.com/embed/Z2sMGO38nAo", tag: "#Cookie Run" },
        { type: "img", src: "https://assets-prd.ignimgs.com/2024/04/08/persona-1712577088693.png", tag: "#Persona" },
        { type: "video", src: "videos/Lulingqi.mp4", tag: "#Dynasty Warriors" },
        { type: "video", src: "videos/Xushu.mp4", tag: "#Dynasty Warriors" },
        { type: "youtube", src: "https://www.youtube.com/embed/CAL4WMpBNs0", tag: "#Doki Doki" },
        { type: "youtube", src: "https://www.youtube.com/embed/2GcKrCnDBf4", tag: "#GGStrive" }
    ],
    music: [
        { type: "youtube", src: "https://www.youtube.com/embed/DSvksh6d21w", tag: "#Sacred Play" },
        { type: "video", src: "videos/I don't wanna live without your love.mp4", tag: "#I don't wanna live" },
        { type: "youtube", src: "https://www.youtube.com/embed/ZUDBd-md0VE", tag: "#Sienna" },
        { type: "youtube", src: "https://www.youtube.com/embed/tbIIf6CeXa4", tag: "#Some day this rain will stop" },
        { type: "youtube", src: "https://www.youtube.com/embed/XLwM3ZEHLJ0", tag: "#Partner" }
    ],
    videos: [
        { type: "video", src: "videos/Iloveyou.mp4", tag: "#Yuna" },
        { type: "youtube", src: "https://www.youtube.com/embed/vZO6Q0RfzS4", tag: "#Mistico" }
    ],
    personal: [
        {
            title: "I Choose Myself",
            content: `I'll think about what to write here soon`,
            footer: "Cập nhật lần cuối: 2026-06-29"
        }
    ]
};
const renderedSections = new Set();
function renderSection(sectionId) {
    if (renderedSections.has(sectionId)) return;
    {
        const container = document.getElementById(sectionId);
        if (!container) return;

        container.innerHTML = galleryData[sectionId].map(item => {
            // Xử lý riêng cho tab 'personal'
            if (sectionId === 'personal') {
                return `
                <article class="personal-article">
                    <h2 class="article-heading">${item.title || "About Me"}</h2>
                    <div class="article-content">${item.content || ""}</div>
                    <footer class="article-footer">${item.footer || ""}</footer>
                </article>`;
            }

            // Logic cũ cho các tab media (images, games, music, videos)
            let content = '';
            if (item.type === 'youtube') {
                content = `<iframe class="js-video" loading="lazy" src="${item.src}${item.src.includes('?') ? '&' : '?'}enablejsapi=1" title="${item.tag}" allow="autoplay; encrypted-media; picture-in-picture" allowfullscreen></iframe>`;
            } else if (item.type === 'video') {
                content = `<video class="js-video" controls preload="none" playsinline><source src="${item.src}" type="video/mp4"></video>`;
            } else {
                content = `<img src="${item.src}" alt="${item.tag}" loading="lazy" decoding="async">`;
            }

            return `
            <div class="media-card">
              <div class="media-content">${content}</div>
              <div class="media-footer">${item.tag}</div>
            </div>`;
        }).join('');
        renderedSections.add(sectionId);
    }
}
document.addEventListener('DOMContentLoaded', () => {
    loadQuotes();         // Render trích dẫn
    renderSection('images');
});




/* ===== AMBIENT ===== */
/* Lightweight desktop HUD; no third-party dependencies. */
document.addEventListener('DOMContentLoaded', () => {
  const clock = document.getElementById('ambient-clock');
  const date = document.getElementById('ambient-date');
  const audio = document.getElementById('localAudio');
  const state = document.getElementById('ambient-audio-state');
  const progress = document.getElementById('ambient-progress');
  const playButton = document.getElementById('hud-play-btn');
  const time = document.getElementById('ambient-audio-time');
  const trackName = document.getElementById('hud-track-name');
  const two = n => String(Math.floor(n)).padStart(2, '0');
  const format = seconds => Number.isFinite(seconds) ? `${two(seconds / 60)}:${two(seconds % 60)}` : '--:--';
  function updateClock() {
    const now = new Date();
    if (clock) clock.textContent = now.toLocaleTimeString(undefined, {hour:'2-digit', minute:'2-digit', hour12:false});
    if (date) date.textContent = now.toLocaleDateString(undefined, {weekday:'short', month:'short', day:'numeric', year:'numeric'}).toUpperCase();
  }
  function updateAudio() {
    if (!audio) return;
    if (state) state.textContent = audio.paused ? '// PAUSED' : '// PLAYING';
    if (playButton) { playButton.textContent = audio.paused ? '▶' : '⏸'; playButton.setAttribute('aria-label', audio.paused ? `Play ${trackName?.textContent || 'music'}` : `Pause ${trackName?.textContent || 'music'}`); playButton.setAttribute('aria-pressed', String(!audio.paused)); }
    if (time) time.textContent = `${format(audio.currentTime)} / ${format(audio.duration)}`;
    if (progress) progress.style.width = Number.isFinite(audio.duration) && audio.duration > 0 ? `${Math.min(100, audio.currentTime / audio.duration * 100)}%` : '0%';
  }
  if (playButton && audio) playButton.addEventListener('click', async () => {
    if (audio.paused) { audio.volume = 0.6; try { await audio.play(); } catch (error) { console.warn('Audio playback unavailable:', error); } }
    else audio.pause();
    updateAudio();
  });
  updateClock(); updateAudio();
  // One minute timer only while the page is visible.
  let clockTimer;
  function syncTimer() { clearInterval(clockTimer); if (!document.hidden) { updateClock(); clockTimer = setInterval(updateClock, 60000); } }
  document.addEventListener('visibilitychange', syncTimer); syncTimer();
  if (audio) ['play','pause','timeupdate','durationchange','loadedmetadata','ended'].forEach(name => audio.addEventListener(name, updateAudio));
});


/* ===== INTERACTIVE ===== */
/* Hiraeth v3 — customizable lists. Add your own local backgrounds/music below. */
const HIRAETH_BACKGROUNDS = [
  {name:'Original', src:'https://d235zo2kjgm9jl.cloudfront.net/original/3X/7/a/7ad8e0a35a7c6ce2885e0dbf5864130644ea83cb.jpg'},
  {name:'Shaper', src:'images/loader/Shaper.jpg'},
  {name:'Frill', src:'images/loader/Frill.jpg'}
];
const HIRAETH_TRACKS = [
  {name:'Freesia', src:'music/Freesia.mp3'}
  // Example: {name:'My second song', src:'music/second-song.mp3'}
];
const HIRAETH_MOODS = {
 dream: {'--mood-accent':'#69dfff','--mood-soft':'#e4f7ff','--mood-muted':'#b4c5d8','--mood-glass':'rgba(5,14,29,.76)','--mood-panel':'rgba(5,24,42,.78)','--mood-line':'rgba(105,223,255,.5)'},
 dusk: {'--mood-accent':'#f0b5dc','--mood-soft':'#ffe9f5','--mood-muted':'#d9c1d4','--mood-glass':'rgba(31,15,35,.82)','--mood-panel':'rgba(42,19,44,.8)','--mood-line':'rgba(240,181,220,.48)'},
 serene: {'--mood-accent':'#a8dfb8','--mood-soft':'#effff3','--mood-muted':'#c0d8c9','--mood-glass':'rgba(9,29,25,.82)','--mood-panel':'rgba(11,40,34,.8)','--mood-line':'rgba(168,223,184,.48)'}
};
document.addEventListener('DOMContentLoaded', () => {
  const root=document.documentElement;
  const safeGet=(k,f)=>{try{return localStorage.getItem(k)||f}catch{return f}};
  const safeSet=(k,v)=>{try{localStorage.setItem(k,v)}catch{}};
  const menus=[['mood-toggle','mood-options'],['background-toggle','background-options'],['track-toggle','track-options']];
  function closeMenus(except) { for(const [b,m] of menus) { if(m===except)continue; document.getElementById(m).hidden=true;document.getElementById(b).setAttribute('aria-expanded','false'); } }
  menus.forEach(([b,m])=>{const btn=document.getElementById(b), menu=document.getElementById(m);btn?.addEventListener('click',e=>{e.stopPropagation();const willOpen=menu.hidden;closeMenus(m);menu.hidden=!willOpen;btn.setAttribute('aria-expanded',String(willOpen));});});
  document.addEventListener('click',e=>{if(!e.target.closest('.picker-wrap,.hud-track-select'))closeMenus();});
  const moodButtons=document.querySelectorAll('[data-mood]');
  function applyMood(key) {
    if (key !== 'auto' && !HIRAETH_MOODS[key]) key='auto';
    const palette = key==='auto' ? (window.hiraethSeasonalPalette?.() || HIRAETH_MOODS.dream) : HIRAETH_MOODS[key];
    Object.entries(palette).forEach(([k,v])=>root.style.setProperty(k,v));
    moodButtons.forEach(b=>b.setAttribute('aria-current',String(b.dataset.mood===key)));
    safeSet('hiraeth-mood',key);
    window.dispatchEvent(new CustomEvent('hiraeth:moodchange',{detail:{mood:key}}));
  }
  window.hiraethRefreshAutoMood = () => { if(safeGet('hiraeth-mood','auto')==='auto')applyMood('auto'); };
  moodButtons.forEach(b=>b.addEventListener('click',()=>{applyMood(b.dataset.mood);closeMenus();}));
  // v4 starts in Auto Seasonal once, even for visitors who saved a v3 mood.
  const initialMood = safeGet('hiraeth-mood-v4-initialized','') ? safeGet('hiraeth-mood','auto') : 'auto';
  safeSet('hiraeth-mood-v4-initialized','1');
  applyMood(initialMood);
  const bgMenu=document.getElementById('background-options');
  const seasonalBackgrounds={
    christmas:'images/seasonal/christmas.webp',
    tet:'images/seasonal/tet.webp',
    midautumn:'images/seasonal/midautumn.webp',
    halloween:'images/seasonal/halloween.webp',
    birthday:'images/seasonal/birthday.webp'
  };
  const bgChoices=[{name:'✦ Auto Seasonal',mode:'auto'},...HIRAETH_BACKGROUNDS.map((bg,i)=>({...bg,mode:String(i)}))];
  let currentBackgroundMode='auto',backgroundLoadId=0;
  bgChoices.forEach(bg=>{
    const b=document.createElement('button');b.type='button';b.textContent=bg.name;
    b.dataset.background=bg.mode;
    b.addEventListener('click',()=>{setBackground(bg.mode);closeMenus();});
    bgMenu.append(b);
  });
  function markBackground(mode){[...bgMenu.children].forEach(b=>b.setAttribute('aria-current',String(b.dataset.background===mode)));}
  function displayBackground(src){document.body.style.backgroundImage=`url("${src.replaceAll('"','%22')}")`;}
  function setBackground(mode){
    if(mode!=='auto' && (!/^(0|[1-9]\d*)$/.test(mode) || !HIRAETH_BACKGROUNDS[Number(mode)]))mode='auto';
    currentBackgroundMode=mode;
    safeSet('hiraeth-background-mode',mode);
    markBackground(mode);
    const token=++backgroundLoadId;
    const fallback=HIRAETH_BACKGROUNDS[0]?.src;
    if(mode!=='auto') {displayBackground(HIRAETH_BACKGROUNDS[Number(mode)].src);return;}
    const key=window.hiraethSeasonalThemeKey?.();
    const seasonalSrc=seasonalBackgrounds[key];
    if(!seasonalSrc){if(fallback)displayBackground(fallback);return;}
    // Only swap after the asset loads; missing seasonal assets use the original background.
    const preload=new Image();
    preload.onload=()=>{if(token===backgroundLoadId && currentBackgroundMode==='auto')displayBackground(seasonalSrc);};
    preload.onerror=()=>{if(token===backgroundLoadId && currentBackgroundMode==='auto' && fallback)displayBackground(fallback);};
    preload.src=seasonalSrc;
  }
  window.hiraethRefreshAutoBackground=()=>{if(currentBackgroundMode==='auto')setBackground('auto');};
  // Migrate existing v4 manual background choice, while new visitors default to Auto Seasonal.
  const storedMode=safeGet('hiraeth-background-mode','');
  const legacyBg=safeGet('hiraeth-background','');
  const initialBg=storedMode || (legacyBg!==''?legacyBg:'auto');
  setBackground(initialBg);
  const audio=document.getElementById('localAudio'), trackMenu=document.getElementById('track-options'), trackName=document.getElementById('hud-track-name');
  HIRAETH_TRACKS.forEach((t,i)=>{const b=document.createElement('button');b.type='button';b.textContent=t.name;b.addEventListener('click',async()=>{const wasPlaying=!audio.paused;audio.pause();audio.src=t.src;audio.load();trackName.textContent=t.name;markTrack(i);closeMenus();if(wasPlaying)try{await audio.play()}catch{};});trackMenu.append(b);});
  function markTrack(i){[...trackMenu.children].forEach((b,j)=>b.setAttribute('aria-current',String(i===j)));}markTrack(0);
  const lightbox=document.getElementById('image-lightbox'), big=document.getElementById('lightbox-image'),caption=document.getElementById('lightbox-caption');
  let images=[], index=0, previousFocus=null;
  function show(i){if(!images.length)return;index=(i+images.length)%images.length;big.src=images[index].src;big.alt=images[index].alt;caption.textContent=images[index].alt||'';}
  function open(img){images=[...document.querySelectorAll('.tab-content .media-content img')].filter(el=>getComputedStyle(el.closest('.tab-content')).display!=='none').concat([...document.querySelectorAll('.media-extra img')]);index=images.indexOf(img);if(index<0){images=[img];index=0;}previousFocus=document.activeElement;show(index);lightbox.hidden=false;lightbox.setAttribute('aria-hidden','false');document.body.style.overflow='hidden';lightbox.querySelector('.lightbox-close').focus();}
  function close(){lightbox.hidden=true;lightbox.setAttribute('aria-hidden','true');big.removeAttribute('src');document.body.style.overflow='';previousFocus?.focus?.();}
  document.addEventListener('click',e=>{const img=e.target.closest('.media-content img,.media-extra img');if(img)open(img);});
  lightbox.querySelector('.lightbox-close').addEventListener('click',close);
  lightbox.querySelector('.lightbox-prev').addEventListener('click',()=>show(index-1));
  lightbox.querySelector('.lightbox-next').addEventListener('click',()=>show(index+1));
  lightbox.addEventListener('click',e=>{if(e.target===lightbox)close();});
  document.addEventListener('keydown',e=>{if(e.key==='Escape'){if(!lightbox.hidden)close();closeMenus();}if(!lightbox.hidden){if(e.key==='ArrowLeft')show(index-1);if(e.key==='ArrowRight')show(index+1);if(e.key==='Tab'){const buttons=[...lightbox.querySelectorAll('button')];if(e.shiftKey&&document.activeElement===buttons[0]){e.preventDefault();buttons.at(-1).focus();}else if(!e.shiftKey&&document.activeElement===buttons.at(-1)){e.preventDefault();buttons[0].focus();}}}});
  const fine=matchMedia('(pointer:fine) and (prefers-reduced-motion:no-preference)').matches;
  if(fine){const halo=document.createElement('div');halo.className='cursor-halo';halo.setAttribute('aria-hidden','true');document.body.append(halo);let pending=false,x=0,y=0;document.addEventListener('pointermove',e=>{x=e.clientX;y=e.clientY;if(pending)return;pending=true;requestAnimationFrame(()=>{halo.style.left=x+'px';halo.style.top=y+'px';pending=false;});},{passive:true});document.addEventListener('pointerdown',e=>{if(e.button!==0)return;const ripple=document.createElement('span');ripple.className='click-ripple';ripple.style.left=e.clientX+'px';ripple.style.top=e.clientY+'px';document.body.append(ripple);ripple.addEventListener('animationend',()=>ripple.remove(),{once:true});},{passive:true});}
});

