/* Оборона: тривога, бій мешканців (за класом), ШІ монстрів, снаряди, смерть і повернення додому. Статистика й вибір цілей — механіка combat. */
const C=Mech.Combat;
const RALLY=()=>[S.L.WALL.gate.x,S.L.WALL.y1-70];
function alertCheck(dt){
  S.alertT-=dt;if(S.alertT>0)return;S.alertT=.5;
  const g=S.L.WALL.gate,live=S.monsters.filter(C.alive);
  const near=live.some(m=>m.y<S.L.WALL.y1+90&&m.x>S.L.WALL.x0-40&&m.x<S.L.WALL.x1+40&&(Math.hypot(m.x-g.x,m.y-g.y)<260||m.y<S.L.WALL.y1));
  if(near&&!S.alert){S.alert=true;S.wavesSeen++;for(const c of S.citizens)if(c.mode==='routine')callToArms(c)}
  else if(!near&&S.alert&&!live.some(m=>m.y<S.L.WALL.y1+30)){S.alert=false;for(const c of S.citizens)if(c.mode==='defend'){c.mode='routine';c.target=null;c.path=null;nextAct(c)}}
}
function callToArms(c){
  if(c.state==='dead')return;
  c.mode='defend';c.partner=null;c.target=null;c.path=null;c.arrived=true;c.delay=rand(0,1.6);
  if(c.inside)leave(c);emoteOf(c,'sword');c.state='idle';c.fired=0;
}
function citizenFightTick(c,dt){
  if(c.delay>0){c.delay-=dt;return}
  Mech.Needs.tick(c.needs,'defend',dt/HOUR_SEC);
  c.rt-=dt;if(c.rt<=0){c.rt=.3;c.target=chooseDef(c)}
  let t=c.target;if(t&&!C.alive(t))t=c.target=null;
  if(t){
    const d=C.dist(c,t);
    if(d>c.range){state(c,'run');chase(c,t.x,t.y,dt,c.spd*1.8)}else perform(c,t);
    return;
  }
  const rp=RALLY();
  if(Math.hypot(c.x-rp[0],c.y-rp[1])>46+c.id%5*8){state(c,'run');chase(c,rp[0]+(c.id%5-2)*14,rp[1]+(c.id%3)*8,dt,c.spd*1.8)}
  else{state(c,'idle');c.face=1}
}
function chooseDef(c){
  if(c.role==='healer'){const h=C.mostHurt(c,S.citizens,240,.85);if(h)return h}
  return C.nearest(c,S.monsters,c.role==='militia'||c.role==='rogue'?200:300);
}
function state(c,s){if(c.state!==s){c.state=s;c.t=0;c.fired=0}}
function perform(c,t){
  const isM=c.team==='m',a=isM?'attack':C.CLASSES[c.role].anim;state(c,a);
  if(Math.abs(t.x-c.x)>1)c.face=t.x>c.x?1:-1;
  const n=Math.floor(c.t/c.P+.5);if(n>c.fired){c.fired=n;strike(c,t)}
}
function strike(c,t){
  if(c.team==='m'){hitUnit(c,t,c.dmg);return}
  if(c.role==='archer')fire(c,t,'arrow',c.dmg);
  else if(c.role==='mage')fire(c,t,c.spell,c.dmg,true);
  else if(c.role==='healer'){if(t.team==='d')healUnit(t,c.dmg);else fire(c,t,'fire',Math.round(c.dmg*.6),true)}
  else if(C.dist(c,t)<=c.range+10){hitUnit(c,t,c.dmg);
    if(c.role==='berserker')for(const o of S.monsters)if(o!==t&&C.alive(o)&&C.dist(c,o)<17)hitUnit(c,o,Math.round(c.dmg*.6))}
}
function hitUnit(a,t,dmg){
  if(!C.alive(t))return;
  C.hit(t,dmg);t.flash=.12;
  if(a)moveBy(t,Math.sign(t.x-a.x||1)*(t.big?.5:1),0);
  ptc(t.x,t.y-t.ht/2,5,'#fff3b0',1.1,.3);
  if(t.hp<=0)die(t);
}
function healUnit(t,amt){C.heal(t,amt);ptc(t.x,t.y-t.ht*.6,3,'#5fe07f',.5,.8,-14,'plus')}
function fire(c,tgt,kind,dmg,aoe){S.projs.push({x:c.x+c.face*5,y:c.y-c.ht*.55,tgt,kind,dmg,aoe,from:c,col:kind==='ice'?'#8fe0ff':'#ff8a3d',life:3,vx:c.face,vy:0})}
function updProj(dt){
  for(let i=S.projs.length-1;i>=0;i--){
    const p=S.projs[i],t=p.tgt;
    if(!C.alive(t)){S.projs.splice(i,1);continue}
    const tx=t.x,ty=t.y-t.ht/2,dx=tx-p.x,dy=ty-p.y,d=Math.hypot(dx,dy),sp=p.kind==='arrow'?160:100;
    p.life-=dt;
    if(d<3||p.life<=0){
      if(p.aoe){ptc(tx,ty,18,p.col,1.5,.5,0,'big');ptc(tx,ty,8,'#fff',.8,.3);
        for(const o of S.monsters)if(C.alive(o)&&Math.hypot(o.x-tx,o.y-o.ht/2-ty)<15){hitUnit(p.from,o,o===t?p.dmg:Math.round(p.dmg*.5));if(p.kind==='ice')o.slowT=2}
      }else hitUnit(p.from,t,p.dmg);
      S.projs.splice(i,1);continue;
    }
    p.x+=dx/d*sp*dt;p.y+=dy/d*sp*dt;p.vx=dx/d;p.vy=dy/d;
    if(p.aoe&&S.R()<.9)ptc(p.x,p.y,1,p.col,.25,.3);
  }
}
function die(c){
  c.hp=0;c.state='dead';c.t=0;c.partner=null;ptc(c.x,c.y-c.ht/2,12,c.team==='m'?'#e8e8e8':'#f6f6f0',1.2,.6,0,'big');
  if(c.team==='m'){S.kills++}else{S.deaths++;c.reviveT=22}
}
// ---------- монстри ----------
function monsterTick(m,dt){
  m.slowT=Math.max(0,m.slowT-dt);m.rt-=dt;
  if(m.rt<=0){m.rt=.4;m.target=C.nearest(m,S.citizens,140,o=>!o.inside&&o.state!=='dead')}
  let t=m.target;if(t&&(!C.alive(t)||t.inside))t=m.target=null;
  const sp=m.spd*1.5*(m.slowT>0?.5:1)*(m.kind==='slime'?.2+Math.max(0,Math.sin(m.phase))*1.3:1);
  if(t){const d=C.dist(m,t);if(d>m.range){state(m,m.mst);chase(m,t.x,t.y,dt,sp)}else perform(m,t);return}
  const gx=S.L.PLAZA.x+m.hox,gy=S.L.PLAZA.y+34;
  if(Math.hypot(m.x-gx,m.y-gy)>16){state(m,m.mst);chase(m,gx,gy,dt,sp)}else{state(m,'idle')}
}
function spawnMon(kind,side){
  const L=S.L,R=S.R;let x,y;
  if(side==='west'){x=10;y=300+R()*360}else if(side==='east'){x=L.W-10;y=300+R()*360}else{x=380+R()*360;y=L.H-8}
  const m=makeMon(kind,x+rand(-8,8),y+rand(-8,8));
  Object.assign(m,{team:'m',hox:rand(-30,30),face:x<L.W/2?1:-1,rt:0});
  S.monsters.push(m);ptc(m.x,m.y-10,12,'#b070e0',1,.6,0,'big');return m;
}
function spawnTick(dt){
  const orders=Mech.Spawner.tick(S.spawner,dt,{day:clockOf().day,alive:S.monsters.filter(C.alive).length});
  for(const o of orders)spawnMon(o.kind,o.side);
}
function callMonsters(n){for(const o of Mech.Spawner.force(S.spawner,n))spawnMon(o.kind,o.side)}
