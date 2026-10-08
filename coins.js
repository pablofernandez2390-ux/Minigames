/* Monedas de Minigames Retro: se guardan solo en este navegador, sin cuentas.
   Ganás 1 moneda por cada minuto de juego activo (máx. 60 por juego y por día) y 5 de regalo el primer día de cada visita. */
(function(){
'use strict';
if(window.Coins)return;
var KEY='minigames.coins.v1',SEG=60,GAP=20000,TOPE=60,REGALO=5;
var CASINO={'ovni-slot':1};
var game=(function(){var p=location.pathname.split('/').pop().replace(/\.html?$/i,'');return(!p||p==='index'||p==='ajustes-pad')?null:p;})();
var mem=null,listeners=[];
function hoy(){var d=new Date();return d.getFullYear()+'-'+(d.getMonth()+1)+'-'+d.getDate();}
function vacio(){return{v:1,c:0,e:0,day:'',g:{},acc:0,gift:''};}
function load(){try{var s=JSON.parse(localStorage.getItem(KEY));if(s&&typeof s.c==='number'){if(!s.g)s.g={};return s;}}catch(_){}return mem||vacio();}
function save(s){mem=s;try{localStorage.setItem(KEY,JSON.stringify(s));}catch(_){}}
function dia(s){var h=hoy();if(s.day!==h){s.day=h;s.g={};}return s;}
function avisar(){var b=Coins.balance();listeners.forEach(function(f){try{f(b);}catch(_){}});}
/* ---------- aviso en pantalla ---------- */
var toastEl=null,toastT=0,iconURL='';
function icono(){if(iconURL)return iconURL;try{var rows=['..oooo..','.oyyyyo.','oyyhhyyo','oyyhyyyo','oyyyyyyo','oyyyyyyo','.oyyyyo.','..oooo..'],pal={o:'#a86b10',y:'#ffd23f',h:'#fff3a0'},c=document.createElement('canvas');c.width=c.height=8;var g=c.getContext('2d');rows.forEach(function(r,y){for(var x=0;x<8;x++){var k=pal[r[x]];if(k){g.fillStyle=k;g.fillRect(x,y,1,1);}}});iconURL=c.toDataURL();}catch(_){}return iconURL;}
function toast(txt){
  if(!document.body)return;
  if(!toastEl){toastEl=document.createElement('div');toastEl.setAttribute('aria-live','polite');
    toastEl.style.cssText='position:fixed;top:max(8px,env(safe-area-inset-top));left:50%;transform:translateX(-50%);z-index:2147483000;display:none;align-items:center;gap:7px;padding:5px 11px 5px 8px;background:#1b1714;color:#ffd23f;font:700 13px "Courier New",monospace;letter-spacing:.04em;pointer-events:none;box-shadow:0 -2px 0 0 #a63d2f,0 2px 0 0 #a63d2f,-2px 0 0 0 #a63d2f,2px 0 0 0 #a63d2f;opacity:.96';
    document.body.appendChild(toastEl);}
  toastEl.innerHTML='<img alt="" src="'+icono()+'" width="16" height="16" style="image-rendering:pixelated"><span></span>';
  toastEl.lastChild.textContent=txt;toastEl.style.display='flex';clearTimeout(toastT);toastT=setTimeout(function(){toastEl.style.display='none';},2000);}
/* ---------- API ---------- */
var Coins=window.Coins={
  balance:function(){return load().c;},
  stats:function(){var s=dia(load());return{coins:s.c,total:s.e,hoy:s.g,tope:TOPE,regalo:REGALO,juego:game};},
  add:function(n,ganancia){n=Math.round(n)||0;if(!n)return;var s=dia(load());s.c=Math.max(0,s.c+n);if(ganancia&&n>0)s.e+=n;save(s);avisar();},
  spend:function(n){n=Math.round(n)||0;var s=dia(load());if(n<=0||s.c<n)return false;s.c-=n;save(s);avisar();return true;},
  reset:function(){save(vacio());avisar();},
  onChange:function(f){listeners.push(f);},
  toast:toast
};
/* ---------- regalo diario ---------- */
function regalo(){var s=dia(load()),h=hoy();if(s.gift!==h){var primero=!s.gift;s.gift=h;s.c+=REGALO;s.e+=REGALO;save(s);avisar();
  var go=function(){toast('Regalo diario +'+REGALO);};if(document.body)setTimeout(go,600);else document.addEventListener('DOMContentLoaded',function(){setTimeout(go,600);});}}
regalo();
/* ---------- actividad ---------- */
var ultima=Date.now();
function act(){ultima=Date.now();}
['pointerdown','pointermove','keydown','touchstart','mousedown','wheel'].forEach(function(t){window.addEventListener(t,act,{capture:true,passive:true});});
var sigPad='';
function mirarPad(){try{var gp=navigator.getGamepads?navigator.getGamepads():[],sig='';for(var i=0;i<gp.length;i++){var p=gp[i];if(!p)continue;for(var b=0;b<p.buttons.length;b++)if(p.buttons[b].pressed||p.buttons[b].value>.5)sig+='b'+b;for(var a=0;a<p.axes.length;a++)if(Math.abs(p.axes[a])>.5)sig+='a'+a+(p.axes[a]>0?'+':'-');}
  if(sig&&sig!==sigPad)act();else if(sig)act();sigPad=sig;}catch(_){}}
setInterval(mirarPad,250);
/* ---------- tiempo jugado ---------- */
var antes=Date.now(),acc=null,guardado=0;
function tick(){
  var ahora=Date.now(),dt=Math.min(2.5,(ahora-antes)/1000);antes=ahora;
  if(!game||CASINO[game])return;
  if(document.visibilityState!=='visible'||ahora-ultima>GAP)return;
  var s=dia(load());if(acc===null)acc=s.acc||0;
  if((s.g[game]||0)>=TOPE)return;
  acc+=dt;
  if(acc>=SEG){acc-=SEG;s.g[game]=(s.g[game]||0)+1;s.c+=1;s.e+=1;s.acc=acc;save(s);avisar();toast('+1');guardado=ahora;return;}
  if(ahora-guardado>5000){s.acc=acc;save(s);guardado=ahora;}
}
setInterval(tick,1000);
function guardarYa(){if(acc===null||!game)return;var s=dia(load());s.acc=acc;save(s);}
document.addEventListener('visibilitychange',function(){if(document.visibilityState==='hidden')guardarYa();else{antes=Date.now();acc=null;}});
window.addEventListener('pagehide',guardarYa);
window.addEventListener('storage',function(e){if(e.key===KEY)avisar();});
})();
