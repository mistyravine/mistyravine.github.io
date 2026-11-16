/* Vietnamese lunisolar calculations (UTC+7), based on Ho Ngoc Duc's
   published Meeus algorithms: https://www.informatik.uni-leipzig.de/~duc/amlich/ */
(function(root){
  'use strict';
  const floor=Math.floor,PI=Math.PI,rad=PI/180,DAY=86400000;
  function jd(d,m,y){const a=floor((14-m)/12),yy=y+4800-a,mm=m+12*a-3;return d+floor((153*mm+2)/5)+365*yy+floor(yy/4)-floor(yy/100)+floor(yy/400)-32045}
  function newMoon(k){
    const T=k/1236.85,T2=T*T,T3=T2*T;
    let J=2415020.75933+29.53058868*k+.0001178*T2-.000000155*T3;
    J+=.00033*Math.sin((166.56+132.87*T-.009173*T2)*rad);
    const M=(359.2242+29.10535608*k-.0000333*T2-.00000347*T3)*rad;
    const MP=(306.0253+385.81691806*k+.0107306*T2+.00001236*T3)*rad;
    const F=(21.2964+390.67050646*k-.0016528*T2-.00000239*T3)*rad;
    let C=(.1734-.000393*T)*Math.sin(M)+.0021*Math.sin(2*M)-.4068*Math.sin(MP)+.0161*Math.sin(2*MP)-.0004*Math.sin(3*MP);
    C+=.0104*Math.sin(2*F)-.0051*Math.sin(M+MP)-.0074*Math.sin(M-MP)+.0004*Math.sin(2*F+M)-.0004*Math.sin(2*F-M)-.0006*Math.sin(2*F+MP)+.001*Math.sin(2*F-MP)+.0005*Math.sin(2*MP+M);
    const delta=T < -11 ? .001+.000839*T+.0002261*T2-.00000845*T3-.000000081*T*T3 : -.000278+.000265*T+.000262*T2;
    return floor(J+C-delta+.5+7/24);
  }
  function sun(j){const T=(j-2451545.5-7/24)/36525,T2=T*T;
    const M=(357.52910+35999.05030*T-.0001559*T2-.00000048*T*T2)*rad;
    let L=(280.46645+36000.76983*T+.0003032*T2+(1.914600-.004817*T-.000014*T2)*Math.sin(M)+(.019993-.000101*T)*Math.sin(2*M)+.000290*Math.sin(3*M))*rad;
    L-=PI*2*floor(L/(PI*2));return floor(L/PI*6);
  }
  function month11(y){const k=floor((jd(31,12,y)-2415021)/29.530588853);let n=newMoon(k);if(sun(n)>=9)n=newMoon(k-1);return n}
  function leapOffset(a){const k=floor((a-2415021.076998695)/29.530588853+.5);let i=1,arc=sun(newMoon(k+i)),last;do{last=arc;i++;arc=sun(newMoon(k+i))}while(arc!==last&&i<14);return i-1}
  function lunar(d,m,y){const n=jd(d,m,y),k=floor((n-2415021.076998695)/29.530588853);let start=newMoon(k+1);if(start>n)start=newMoon(k);let a=month11(y),b=a,year;if(a>=start){year=y;a=month11(y-1)}else{year=y+1;b=month11(y+1)}const day=n-start+1,diff=floor((start-a)/29);let month=diff+11,leap=0;if(b-a>365){const off=leapOffset(a);if(diff>=off){month=diff+10;if(diff===off)leap=1}}if(month>12)month-=12;if(month>=11&&diff<4)year--;return{day,month,year,leap}}
  const tetCache=new Map();
  function tetDay(y){if(tetCache.has(y))return tetCache.get(y);for(let day=15;day<=65;day++){const dt=new Date(Date.UTC(y,0,day)),l=lunar(dt.getUTCDate(),dt.getUTCMonth()+1,y);if(l.month===1&&l.day===1&&!l.leap){const n=dt.getTime()/DAY;tetCache.set(y,n);return n}}return null}
  function seasonAt(date=new Date()){
    const parts=new Intl.DateTimeFormat('en-GB',{timeZone:'Asia/Ho_Chi_Minh',year:'numeric',month:'numeric',day:'numeric'}).formatToParts(date);
    const v=Object.fromEntries(parts.map(p=>[p.type,p.value])),y=+v.year,m=+v.month,d=+v.day;
    if((m===12&&d===31)||(m===1&&d===1))return{kind:'new-year',message:'Happy New Year'};
    if(m===12&&d>=23&&d<=25)return{kind:'christmas',message:'Merry Christmas'};
    const today=Date.UTC(y,m-1,d)/DAY;
    for(const year of [y,y+1]){const tet=tetDay(year);if(tet!==null&&today>=tet-14&&today<=tet+9)return{kind:'lunar-new-year',message:'Happy Lunar New Year'}}
    return{kind:'ordinary',message:''};
  }
  root.AfterglowCalendar={seasonAt,lunar,tetDay};
})(typeof window==='undefined'?globalThis:window);
