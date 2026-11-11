/* Hiraeth v4 — Phu Quoc weather, Vietnamese seasonal dates, lightweight particles. */
(() => {
  'use strict';
  const TZ = 'Asia/Ho_Chi_Minh';
  const COORDS = { latitude: 10.2899, longitude: 103.9840 };
  const CACHE_KEY = 'hiraeth-weather-v4';
  const CACHE_MS = 20 * 60 * 1000;
  const REFRESH_MS = 20 * 60 * 1000;
  const palettes = {
    christmas: {'--mood-accent':'#f3b8bd','--mood-soft':'#fff4ed','--mood-muted':'#cdd8d2','--mood-glass':'rgba(21,40,37,.83)','--mood-panel':'rgba(23,50,44,.84)','--mood-line':'rgba(243,184,189,.48)'},
    tet: {'--mood-accent':'#f3ce78','--mood-soft':'#fff1dc','--mood-muted':'#e6c8b7','--mood-glass':'rgba(52,29,35,.85)','--mood-panel':'rgba(60,32,36,.85)','--mood-line':'rgba(243,206,120,.50)'},
    midautumn: {'--mood-accent':'#b7d8ff','--mood-soft':'#f4f7ff','--mood-muted':'#c4d4e8','--mood-glass':'rgba(16,35,62,.85)','--mood-panel':'rgba(20,44,70,.84)','--mood-line':'rgba(183,216,255,.48)'},
    halloween: {'--mood-accent':'#ffb67b','--mood-soft':'#fff1e5','--mood-muted':'#d2bedc','--mood-glass':'rgba(32,25,45,.86)','--mood-panel':'rgba(41,29,49,.86)','--mood-line':'rgba(255,182,123,.48)'},
    birthday: {'--mood-accent':'#ffd0e9','--mood-soft':'#fff1fb','--mood-muted':'#dacde9','--mood-glass':'rgba(43,31,61,.84)','--mood-panel':'rgba(48,35,66,.85)','--mood-line':'rgba(255,208,233,.50)'}
  };
  const greetings = {
    christmas: '🎄 Merry Christmas', tet: '🧧 Chúc Mừng Năm Mới',
    midautumn: '🌕 Happy Mid-Autumn', halloween: '🎃 Happy Halloween',
    birthday: '🎂 Happy Birthday, Rayne!'
  };
  // Vietnamese holiday dates in Gregorian calendar, checked for 2026–2030.
  // Outside this range, Intl's Chinese lunar calendar is an approximation and may differ from VN dates.
  const lunarDates = {
    2026: {tet:'02-17',midautumn:'09-25'},
    2027: {tet:'02-06',midautumn:'09-15'},
    2028: {tet:'01-26',midautumn:'10-03'},
    2029: {tet:'02-13',midautumn:'09-22'},
    2030: {tet:'02-03',midautumn:'09-12'}
  };
  const vnParts = (date = new Date()) => {
    const p = Object.fromEntries(new Intl.DateTimeFormat('en-US',{timeZone:TZ,year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(date).filter(x=>x.type!=='literal').map(x=>[x.type,Number(x.value)]));
    return {year:p.year,month:p.month,day:p.day};
  };
  const utcDay = (y,m,d) => Date.UTC(y,m-1,d)/86400000;
  function approximateLunarDate(year, targetMonth, targetDay) {
    const fmt = new Intl.DateTimeFormat('en-u-ca-chinese',{timeZone:TZ,month:'numeric',day:'numeric'});
    const begin = Date.UTC(year,0,1);
    for(let i=0;i<366;i++) {
      const date=new Date(begin+i*86400000);
      if(date.getUTCFullYear()!==year)break;
      const parts=Object.fromEntries(fmt.formatToParts(date).filter(p=>p.type!=='literal').map(p=>[p.type,p.value]));
      if(Number(parts.month)===targetMonth && Number(parts.day)===targetDay && !String(parts.month).includes('bis'))
        return `${String(date.getUTCMonth()+1).padStart(2,'0')}-${String(date.getUTCDate()).padStart(2,'0')}`;
    }
    return null;
  }
  function holidaysForYear(y) {
    return lunarDates[y] || {tet:approximateLunarDate(y,1,1),midautumn:approximateLunarDate(y,8,15)};
  }
  const eventsForYear = y => {
    const lunar=holidaysForYear(y);
    return [
      {key:'birthday',date:'12-12'}, {key:'christmas',date:'12-25'},
      {key:'tet',date:lunar.tet}, {key:'midautumn',date:lunar.midautumn},
      {key:'halloween',date:'10-31'}
    ].filter(e=>e.date).map(e=>({...e,year:y}));
  };
  function activeEvent() {
    const {year,month,day}=vnParts(),today=utcDay(year,month,day);
    const events=[...eventsForYear(year-1),...eventsForYear(year),...eventsForYear(year+1)];
    const matching=events.filter(e=>{
      const [m,d]=e.date.split('-').map(Number),diff=utcDay(e.year,m,d)-today;
      return diff>=0 && diff<=3;
    });
    matching.sort((a,b)=>{
      const priority={birthday:0,tet:1,christmas:2,midautumn:3,halloween:4};
      return priority[a.key]-priority[b.key] || a.year-b.year;
    });
    return matching[0] || null;
  }
  // Theme windows are independent from holiday greeting windows.
  function seasonalThemeKey() {
    const {year,month,day}=vnParts();
    if(month===12 && day===12)return 'birthday';
    const greeting=activeEvent();
    if(greeting?.key==='midautumn')return 'midautumn';
    if(month===1 || month===2)return 'tet';
    if(month===10)return 'halloween';
    if(month===12)return 'christmas';
    return null;
  }
  window.hiraethSeasonalThemeKey=seasonalThemeKey;
  window.hiraethSeasonalPalette = () => palettes[seasonalThemeKey()] || window.HIRAETH_MOODS?.dream || {
    '--mood-accent':'#69dfff','--mood-soft':'#e4f7ff','--mood-muted':'#b4c5d8','--mood-glass':'rgba(5,14,29,.76)','--mood-panel':'rgba(5,24,42,.78)','--mood-line':'rgba(105,223,255,.5)'
  };
  function renderEvent() {
    const el=document.getElementById('hiraeth-event'); if(!el)return;
    const event=activeEvent();
    el.hidden=!event;
    if(event) {
      const [m,d]=event.date.split('-').map(Number), now=vnParts();
      const days=utcDay(event.year,m,d)-utcDay(now.year,now.month,now.day);
      el.textContent=days===0?greetings[event.key]:`${greetings[event.key]} · ${days}d`;
    }
    window.hiraethRefreshAutoMood?.();
    window.hiraethRefreshAutoBackground?.();
  }
  const getStoredWeather=()=>{try{const v=JSON.parse(localStorage.getItem(CACHE_KEY));return v && typeof v.at==='number' && v.data?v:null;}catch{return null;}};
  const storeWeather=data=>{try{localStorage.setItem(CACHE_KEY,JSON.stringify({at:Date.now(),data}));}catch{}};
  function describeWeather(code) {
    if([0].includes(code))return ['☀️','Clear'];
    if([1,2].includes(code))return ['🌤️','Partly cloudy'];
    if([3].includes(code))return ['☁️','Cloudy'];
    if([45,48].includes(code))return ['🌫️','Fog'];
    if([51,53,55,56,57].includes(code))return ['🌦️','Drizzle'];
    if([61,63,65,66,67,80,81,82].includes(code))return ['🌧️','Rain'];
    if([95,96,99].includes(code))return ['⛈️','Thunderstorm'];
    if([71,73,75,77,85,86].includes(code))return ['🌨️','Snow'];
    return ['☁️','Weather'];
  }
  function isRaining(code,precipitation) {
    return [51,53,55,56,57,61,63,65,66,67,80,81,82,95,96,99].includes(code) || (Number.isFinite(precipitation)&&precipitation>0);
  }
  const reduceMotion=matchMedia('(prefers-reduced-motion: reduce)');
  let mode='none';
  function setAtmosphere(next) {
    if(reduceMotion.matches)next='none';
    if(next===mode)return;
    mode=next;
    const rain=document.getElementById('rainContainer');
    const particles=document.getElementById('seasonal-particles');
    if(!rain||!particles)return;
    rain.hidden=next!=='rain';
    particles.hidden=next!=='snow'&&next!=='sakura';
    if(next==='rain')window.hiraethBuildRain?.();
    else rain.replaceChildren();
    particles.replaceChildren();
    if(next!=='snow'&&next!=='sakura')return;
    const count=innerWidth<=875?(next==='snow'?16:10):(next==='snow'?36:20);
    const fragment=document.createDocumentFragment();
    for(let i=0;i<count;i++) {
      const particle=document.createElement('span');
      particle.className=next==='snow'?'snow-particle':'sakura-particle';
      const rand=(min,max)=>min+Math.random()*(max-min);
      particle.style.setProperty('--start',`${rand(0,100).toFixed(2)}vw`);
      particle.style.setProperty('--drift',`${rand(-90,90).toFixed(1)}px`);
      particle.style.setProperty('--size',`${rand(next==='snow'?2:8,next==='snow'?6:17).toFixed(1)}px`);
      particle.style.setProperty('--duration',`${rand(next==='snow'?9:9,next==='snow'?20:17).toFixed(1)}s`);
      particle.style.setProperty('--delay',`${rand(-20,0).toFixed(1)}s`);
      particle.style.setProperty('--opacity',rand(.4,.9).toFixed(2));
      if(next==='sakura')particle.innerHTML='<svg viewBox="0 0 32 40" aria-hidden="true"><path d="M16 36 C6 27 -1 16 5 7 Q10 0 16 7 Q22 0 27 7 C33 16 26 27 16 36Z" fill="#f5b2cb" stroke="#e895b5" stroke-width="1"/><path d="M16 8 Q11 21 16 34" fill="none" stroke="#ffe3ee" stroke-width="1.4"/></svg>';
      fragment.append(particle);
    }
    particles.append(fragment);
  }
  let lastWeather=null;
  function selectAtmosphere(weather) {
    const {month}=vnParts();
    if(weather && isRaining(Number(weather.weather_code),Number(weather.precipitation)))return 'rain';
    return month===12?'snow':month===2?'sakura':'none';
  }
  function showWeather(data) {
    const el=document.getElementById('hiraeth-weather');
    if(!el)return;
    if(!data) {el.textContent='☁️ Phú Quốc · --°C';return;}
    const [icon,label]=describeWeather(Number(data.weather_code));
    const temp=Number.isFinite(Number(data.temperature_2m))?`${Math.round(Number(data.temperature_2m))}°C`:'--°C';
    el.textContent=`${icon} ${label} · ${temp}`;
    el.title='Current weather · Phú Quốc, Vietnam';
  }
  async function refreshWeather() {
    const cache=getStoredWeather();
    if(cache && Date.now()-cache.at<CACHE_MS){lastWeather=cache.data;showWeather(lastWeather);setAtmosphere(selectAtmosphere(lastWeather));return;}
    const controller=new AbortController(),timeout=setTimeout(()=>controller.abort(),8000);
    try {
      const q=new URLSearchParams({...COORDS,current:'temperature_2m,weather_code,precipitation',timezone:TZ});
      const res=await fetch(`https://api.open-meteo.com/v1/forecast?${q}`,{signal:controller.signal});
      if(!res.ok)throw new Error(`Weather HTTP ${res.status}`);
      const payload=await res.json();
      if(!payload.current || !Number.isFinite(Number(payload.current.weather_code)))throw new Error('Invalid weather payload');
      lastWeather=payload.current;storeWeather(lastWeather);
    } catch(error) {
      console.info('Hiraeth weather unavailable; seasonal fallback active.',error);
      lastWeather=null;
    } finally {clearTimeout(timeout);}
    showWeather(lastWeather);setAtmosphere(selectAtmosphere(lastWeather));
  }
  document.addEventListener('DOMContentLoaded',()=>{
    renderEvent();
    const cached=getStoredWeather();
    if(cached && Date.now()-cached.at<CACHE_MS){lastWeather=cached.data;showWeather(lastWeather);}
    setAtmosphere(selectAtmosphere(lastWeather));
    refreshWeather();
    setInterval(()=>{if(!document.hidden){renderEvent();refreshWeather();}},REFRESH_MS);
    document.addEventListener('visibilitychange',()=>{if(!document.hidden){renderEvent();refreshWeather();}});
    reduceMotion.addEventListener?.('change',()=>setAtmosphere(selectAtmosphere(lastWeather)));
  });
})();
