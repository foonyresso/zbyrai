/* Ядро симуляції: стан світу S, час, створення мешканців, рух по шляху із зіткненнями. Мешканець = істота (people.js) + потреби/заняття. */
const S={L:null,seed:'zbyrai',R:null,T:7.5,now:0,speed:1,citizens:[],monsters:[],animals:[],projs:[],parts:[],alert:false,alertT:0,spawner:null,kills:0,deaths:0,sel:null,follow:false,fr:{},houseZ:{},wavesSeen:0};
const HOUR_SEC=12,WALK=24,SIM_STEP=.05;
const clockOf=()=>({hour:S.T%24,day:Math.floor(S.T/24)+1});
const rand=(a,b)=>a+S.R()*(b-a),spick=a=>a[Math.floor(S.R()*a.length)];
function initWorld(seed){
  Object.assign(S,{seed,L:SS.Layout.build(seed),R:Mech.Rng.stream(seed,'sim'),T:7.3,now:0,citizens:[],monsters:[],animals:[],projs:[],parts:[],alert:false,kills:0,deaths:0,sel:null,fr:{},houseZ:{}});
  S.spawner=Mech.Spawner.create(seed);
  const homes=S.L.houses.slice();for(let i=homes.length-1;i>0;i--){const j=Math.floor(S.R()*(i+1));[homes[i],homes[j]]=[homes[j],homes[i]]}
  const mayorHome=S.L.buildings.find(b=>b.type==='mayor'),names=NAMES.slice().sort(()=>S.R()-.5);
  JOBS.forEach((job,i)=>{
    const home=i===0?mayorHome:homes[i-1],cl=Mech.Combat.CLASSES[job.cls],v=lookFor(job);
    const c=newC('d',job.cls,'biped',v,24,6);
    Object.assign(c,{id:i,name:names[i],job,home,role:job.cls,hp:cl.hp,max:cl.hp,P:cl.P,range:cl.range,spd:cl.spd,dmg:cl.dmg,spell:v.orb==='#8fe0ff'?'ice':'fire',lastHit:-1e9,
      needs:Mech.Needs.create(S.R),act:'idle',actEnd:0,inside:null,path:null,arrived:true,partner:null,mode:'routine',emote:null,greetCd:rand(0,8),workT:0,reviveT:0,x:home.door.x,y:home.door.y+3});
    S.citizens.push(c);
  });
  // частина мешканців іще спить удома, решта вже на ногах
  for(const c of S.citizens){c.t=rand(0,2);if(S.R()<.3){c.needs.energy=.45;startAct(c,'sleep');c.inside=c.home;c.arrived=true;c.enterT=S.T-1;c.actEnd=S.T+2}else{c.x+=rand(-30,30);c.y+=rand(8,40);nextAct(c)}}
  spawnAnimals();
}
// ---------- рух ----------
function walkable(x,y){const g=S.L.grid,[cx,cy]=Mech.Pathgrid.cellOf(g,x,y);return !Mech.Pathgrid.blocked(g,cx,cy)}
function moveBy(c,dx,dy){
  const nx=c.x+dx,ny=c.y+dy;
  if(!walkable(c.x,c.y)||walkable(nx,ny)){c.x=nx;c.y=ny}else if(walkable(nx,c.y))c.x=nx;else if(walkable(c.x,ny))c.y=ny;
  if(Math.abs(dx)>.01)c.face=dx>0?1:-1;
  c.x=Math.max(4,Math.min(S.L.W-4,c.x));c.y=Math.max(10,Math.min(S.L.H-2,c.y));
}
function setGoal(c,x,y){c.goal=[x,y];c.path=Mech.Pathgrid.find(S.L.grid,c.x,c.y,x,y)||[[x,y]];c.arrived=false}
// іде по c.path; true, коли дійшов
function follow(c,dt,speed){
  if(!c.path||!c.path.length){c.arrived=true;return true}
  const[tx,ty]=c.path[0],dx=tx-c.x,dy=ty-c.y,d=Math.hypot(dx,dy),st=Math.min(d,speed*dt);
  if(d<2){c.path.shift();if(!c.path.length){c.arrived=true;return true}return false}
  moveBy(c,dx/d*st,dy/d*st);return false;
}
// переслідування цілі: напряму, якщо видно; інакше шляхом A* з перерахунком
function chase(c,tx,ty,dt,speed){
  c.pathT=(c.pathT||0)-dt;
  if(Mech.Pathgrid.lineClear(S.L.grid,c.x,c.y,tx,ty)){c.path=null;const dx=tx-c.x,dy=ty-c.y,d=Math.hypot(dx,dy)||1;moveBy(c,dx/d*speed*dt,dy/d*speed*dt);return}
  if(!c.path||c.pathT<=0){c.pathT=.7;c.path=Mech.Pathgrid.find(S.L.grid,c.x,c.y,tx,ty)||[[tx,ty]]}
  follow(c,dt,speed);
}
function separate(){
  const all=S.citizens.concat(S.monsters);
  for(const a of all){if(a.state==='dead'||a.inside)continue;
    for(const b of all){if(a===b||b.state==='dead'||b.inside)continue;const dx=a.x-b.x,dy=a.y-b.y,d=Math.hypot(dx,dy);
      const lim=a.partner===b?9:5;if(d<lim){const k=(lim-d)*.12,m=d||1;moveBy(a,(dx||rand(-1,1))/m*k,(dy||rand(-1,1))/m*k)}}}
}
