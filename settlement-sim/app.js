/* Інтерфейс «Симуляції поселення»: полотно на весь екран, камера (зум колесом, перетягування, щипок), вибір жителя, панелі, швидкість часу. */
const cv=document.getElementById('cv'),ctx=cv.getContext('2d'),$=id=>document.getElementById(id);
const cam={x:560,y:420,z:1,fit:1};
let vw=0,vh=0,dpr=1;
const ACT_UA={sleep:'спить',work:'працює',eat:'обідає',chat:'розмовляє',relax:'відпочиває',stroll:'гуляє',defend:'захищає місто',idle:'стоїть'};
const NEED_UA={energy:'Сили',hunger:'Ситість',social:'Спілкування',fun:'Дозвілля'};
function resize(){
  dpr=Math.min(2,window.devicePixelRatio||1);const r=cv.getBoundingClientRect();vw=r.width;vh=r.height;cv.width=Math.round(vw*dpr);cv.height=Math.round(vh*dpr);
  cam.fit=Math.min(vw/S.L.W,vh/S.L.H);if(!cam.userZoom)fitView();
}
function fitView(){cam.userZoom=false;cam.x=S.L.W/2;cam.y=S.L.H/2+10;cam.z=Math.max(.3,Math.min(vw/S.L.W,vh/(S.L.H-30)))*.98;S.follow=false;refreshWho()}
const clampZ=z=>Math.max(cam.fit*.6,Math.min(8,z));
// ---------- керування мишею й дотиком ----------
const ptrs=new Map();let drag=null,pinch0=null;
const toWorld=(px,py)=>[cam.x+(px-vw/2)/cam.z,cam.y+(py-vh/2)/cam.z];
cv.addEventListener('wheel',e=>{e.preventDefault();const r=cv.getBoundingClientRect(),px=e.clientX-r.left,py=e.clientY-r.top,[wx,wy]=toWorld(px,py);
  cam.z=clampZ(cam.z*Math.exp(-e.deltaY*.0016));cam.userZoom=true;cam.x=wx-(px-vw/2)/cam.z;cam.y=wy-(py-vh/2)/cam.z},{passive:false});
cv.addEventListener('pointerdown',e=>{cv.setPointerCapture(e.pointerId);ptrs.set(e.pointerId,[e.clientX,e.clientY]);drag={x:e.clientX,y:e.clientY,moved:0};if(ptrs.size===2){const[a,b]=[...ptrs.values()];pinch0={d:Math.hypot(a[0]-b[0],a[1]-b[1]),z:cam.z}}});
cv.addEventListener('pointermove',e=>{
  if(!ptrs.has(e.pointerId))return;const prev=ptrs.get(e.pointerId);ptrs.set(e.pointerId,[e.clientX,e.clientY]);
  if(ptrs.size===2&&pinch0){const[a,b]=[...ptrs.values()];cam.z=clampZ(pinch0.z*Math.hypot(a[0]-b[0],a[1]-b[1])/pinch0.d);cam.userZoom=true;return}
  const dx=e.clientX-prev[0],dy=e.clientY-prev[1];drag.moved+=Math.abs(dx)+Math.abs(dy);
  if(drag.moved>4){cam.x-=dx/cam.z;cam.y-=dy/cam.z;cam.userZoom=true;S.follow=false}});
const endPtr=e=>{if(ptrs.size===1&&drag&&drag.moved<=4){const r=cv.getBoundingClientRect();pickAt(...toWorld(e.clientX-r.left,e.clientY-r.top))}ptrs.delete(e.pointerId);if(ptrs.size<2)pinch0=null};
cv.addEventListener('pointerup',endPtr);cv.addEventListener('pointercancel',e=>{ptrs.delete(e.pointerId);pinch0=null});
cv.addEventListener('dblclick',fitView);
function pickAt(wx,wy){
  let best=null,bd=16/Math.max(.6,cam.z*.8);
  for(const c of S.citizens.concat(S.monsters)){if(c.inside||c.hidden)continue;const d=Math.hypot(c.x-wx,c.y-c.ht/2-wy);if(d<bd+8&&d<bd*2){bd=d;best=c}}
  S.sel=best&&best.team==='d'?best:null;if(!S.sel)S.follow=false;refreshWho();
}
// ---------- панелі ----------
function setSpeed(v){S.speed=v;document.querySelectorAll('[data-sp]').forEach(b=>b.classList.toggle('on',+b.dataset.sp===v))}
document.querySelectorAll('[data-sp]').forEach(b=>b.addEventListener('click',()=>{const v=+b.dataset.sp;setSpeed(v===0&&S.speed===0?1:v)}));
$('btnWave').onclick=$('btnWave2').onclick=()=>{callMonsters(4);toast('До воріт іде хвиля монстрів')};
$('btnBoss').onclick=()=>{spawnMon('boss','south');toast('До воріт іде бос!')};
$('btnCenter').onclick=fitView;
$('auto').onchange=e=>{autoWaves=e.target.checked};
$('hour').oninput=e=>{const h=+e.target.value,cur=S.T%24;S.T+=h-cur;if(h<cur)S.T+=0};
function toast(t){const el=$('toast');el.textContent=t;el.classList.add('show');clearTimeout(toast.t);toast.t=setTimeout(()=>el.classList.remove('show'),2200)}
function buildPeople(){
  const box=$('peopleList');box.innerHTML='';
  for(const c of S.citizens){
    const b=document.createElement('button');b.className='pbtn';b.dataset.id=c.id;b.title='Показати жителя на карті й стежити за ним';
    b.innerHTML=`<b></b><i></i><u></u>`;b.onclick=()=>{S.sel=c;S.follow=true;if(!cam.userZoom||cam.z<cam.fit*1.8)cam.z=Math.max(cam.z,cam.fit*2.2);cam.userZoom=true;refreshWho()};
    box.appendChild(b)}
}
function updatePeople(){
  const bs=$('peopleList').children;
  S.citizens.forEach((c,i)=>{const b=bs[i];if(!b)return;b.children[0].textContent=c.name;b.children[1].textContent=c.job.title;
    b.children[2].textContent=c.state==='dead'?'знепритомнів':ACT_UA[c.mode==='defend'?'defend':c.act]||c.act;b.classList.toggle('on',c===S.sel);b.classList.toggle('alert',c.mode==='defend')});
}
function bar(label,v,cls){return `<div class="nb"><span>${label}</span><i><b class="${cls||''}" style="width:${Math.round(v*100)}%"></b></i></div>`}
function refreshWho(){
  const c=S.sel,el=$('who');if(!c){el.hidden=true;return}
  const fr=S.citizens.filter(o=>o!==c).map(o=>[o,S.fr[c.id<o.id?c.id+'-'+o.id:o.id+'-'+c.id]||0]).filter(x=>x[1]>.02).sort((a,b)=>b[1]-a[1]).slice(0,3);
  const act=c.state==='dead'?'знепритомнів(ла), оговтається вдома':c.mode==='defend'?'захищає місто':(ACT_UA[c.act]||c.act)+(c.inside?(c.act==='sleep'?' (вдома)':' (у таверні)'):'');
  const hs=c.home.type==='mayor'?'дім старости':'будинок №'+(c.home.id+1);
  el.hidden=false;
  el.innerHTML=`<button class="x" title="Закрити картку жителя" id="whoX">×</button><h3>${c.name}</h3><p class="sub">${c.job.title} · ${Mech.Combat.CLASSES[c.role].name} · ${hs}</p><p>${act}</p>`+
    bar('Здоров’я',c.hp/c.max,'hp')+Mech.Needs.KEYS.map(k=>bar(NEED_UA[k],c.needs[k])).join('')+
    (fr.length?`<p class="sub">Друзі: ${fr.map(f=>f[0].name+' '+Math.min(99,Math.round(f[1]*100))).join(', ')}</p>`:'')+
    `<div class="row2"><button id="whoFollow" class="${S.follow?'on':''}" title="Тримати цього жителя в центрі екрана">${S.follow?'Не стежити':'Стежити'}</button></div>`;
  $('whoX').onclick=()=>{S.sel=null;S.follow=false;refreshWho()};
  $('whoFollow').onclick=()=>{S.follow=!S.follow;if(S.follow&&cam.z<cam.fit*1.8){cam.z=cam.fit*2.2;cam.userZoom=true}refreshWho()};
}
function updateHud(){
  const clk=clockOf(),alive=S.citizens.filter(c=>c.state!=='dead'),sleep=alive.filter(c=>c.inside&&c.act==='sleep').length,mons=S.monsters.filter(Mech.Combat.alive).length;
  const ph={night:'ніч',morning:'ранок',day:'день',evening:'вечір'}[Mech.Schedule.phase(clk.hour)];
  $('hud').innerHTML=`<b>${Mech.Schedule.fmt(clk.hour)}</b> · день ${clk.day} · ${ph}<br>Жителів: ${alive.length}/${S.citizens.length} (сплять: ${sleep})<br>`+
    (S.alert?`<span class="red">ТРИВОГА: монстрів ${mons}</span>`:`Монстрів: ${mons}`)+` · відбито: ${S.kills}`;
  $('hourOut').textContent=Mech.Schedule.fmt(clk.hour);if(document.activeElement!==$('hour'))$('hour').value=clk.hour;
}
// ---------- цикл ----------
let last=performance.now(),hudT=0,whoT=0;
function frame(now){
  const dt=Math.min(.1,(now-last)/1000);last=now;
  advance(dt);
  if(S.follow&&S.sel&&!S.sel.inside){cam.x+=(S.sel.x-cam.x)*Math.min(1,dt*5);cam.y+=(S.sel.y-18-cam.y)*Math.min(1,dt*5)}
  render(ctx,vw,vh,cam,dpr);
  hudT-=dt;if(hudT<=0){hudT=.25;updateHud();updatePeople()}
  whoT-=dt;if(whoT<=0){whoT=.5;if(S.sel)refreshWho()}
  requestAnimationFrame(frame);
}
function start(){
  initWorld('zbyrai-'+(new URLSearchParams(location.search).get('seed')||'1'));buildScene();buildPeople();resize();fitView();setSpeed(1);requestAnimationFrame(frame);
}
addEventListener('resize',resize);
start();
