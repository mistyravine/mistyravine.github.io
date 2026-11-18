/* Snow/sakura geometry, random ranges and SVG reused from:
   https://mistyravine.github.io/seasonal.js (Hiraeth v4).
   Only FX rendering is included; Hiraeth weather/theme logic is not imported. */
(function(root){
  'use strict';
  function defaultChoice(date=new Date()){
    const month=Number(new Intl.DateTimeFormat('en-US',{timeZone:'Asia/Ho_Chi_Minh',month:'numeric'}).format(date));
    if(month===10)return 'fx5';
    return month===12?'fx3':month===1||month===2?'fx4':'flourish';
  }
  function countFor(mode,density,mobile){const base=mobile?(mode==='fx3'?16:10):(mode==='fx3'?36:20);return Math.round(base*Math.max(0,Math.min(100,density))/50)}
  function create(layer){
    const reduced=matchMedia('(prefers-reduced-motion: reduce)'),mobile=matchMedia('(max-width:875px)');
    let mode='none',density=50,speed=.75;
    const rand=(min,max)=>min+Math.random()*(max-min);
    function particle(){
      const snow=mode==='fx3',p=document.createElement('span');p.className=snow?'snow-particle':'sakura-particle';
      p.style.setProperty('--start',`${rand(0,100).toFixed(2)}vw`);
      p.style.setProperty('--drift',`${rand(-90,90).toFixed(1)}px`);
      p.style.setProperty('--size',`${rand(snow?2:8,snow?6:17).toFixed(1)}px`);
      p.style.setProperty('--duration',`${rand(9,snow?20:17).toFixed(1)}s`);
      p.style.setProperty('--delay',`${rand(-20,0).toFixed(1)}s`);
      p.style.setProperty('--opacity',rand(.4,.9).toFixed(2));
      if(!snow)p.innerHTML='<svg viewBox="0 0 32 40" aria-hidden="true"><path d="M16 36 C6 27 -1 16 5 7 Q10 0 16 7 Q22 0 27 7 C33 16 26 27 16 36Z" fill="#f5b2cb" stroke="#e895b5" stroke-width="1"/><path d="M16 8 Q11 21 16 34" fill="none" stroke="#ffe3ee" stroke-width="1.4"/></svg>';
      return p;
    }
    function render(){
      const active=['fx3','fx4'].includes(mode)&&!reduced.matches;
      const count=active?countFor(mode,density,mobile.matches):0;
      while(layer.children.length>count)layer.lastElementChild.remove();
      const fragment=document.createDocumentFragment();for(let i=layer.children.length;i<count;i++)fragment.append(particle());layer.append(fragment);
      layer.hidden=!active||count===0;
      layer.classList.toggle('is-paused',document.hidden);
      layer.getAnimations({subtree:true}).forEach(animation=>animation.updatePlaybackRate(speed));
    }
    reduced.addEventListener('change',render);mobile.addEventListener('change',render);
    document.addEventListener('visibilitychange',()=>layer.classList.toggle('is-paused',document.hidden));
    return{set(next,amount,rate){if(next!==mode){mode=next;layer.replaceChildren()}density=amount;speed=rate;render()}};
  }
  root.AfterglowFX={defaultChoice,countFor,create};
})(typeof window==='undefined'?globalThis:window);
