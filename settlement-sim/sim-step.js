/* Крок симуляції: час, мешканці, монстри, снаряди, тварини, прибирання. dt — секунди симуляції (ділиться на кроки SIM_STEP). */
let autoWaves=true;
function updateCitizen(c,dt){
  c.t+=dt;c.flash=Math.max(0,c.flash-dt);c.slowT=Math.max(0,c.slowT-dt);
  if(c.state==='dead'){
    if(c.t>2.8)c.hidden=true;
    c.reviveT-=dt;if(c.reviveT<=0)revive(c);return;
  }
  const st=c.state;c.phase+=dt*(st==='run'?16:st==='walk'?9:6);
  if(c.mode==='defend')citizenFightTick(c,dt);else routineTick(c,dt);
}
function revive(c){
  c.hp=Math.round(c.max*.5);c.hidden=false;c.state='idle';c.t=0;c.x=c.home.door.x;c.y=c.home.door.y+3;c.inside=null;
  if(S.alert){callToArms(c)}else{c.mode='routine';c.needs.energy=Math.min(c.needs.energy,.35);startAct(c,'sleep')}
}
function updateMonster(m,dt){
  m.t+=dt;m.flash=Math.max(0,m.flash-dt);
  if(m.state==='dead')return;
  const st=m.state;m.phase+=dt*(st==='run'?(m.kind==='slime'?9:16):st==='walk'?(m.kind==='slime'?6:9):6);
  monsterTick(m,dt);
}
function simStep(dt){
  S.now+=dt;S.T+=dt/HOUR_SEC;
  if(autoWaves)spawnTick(dt);
  alertCheck(dt);
  for(const c of S.citizens)updateCitizen(c,dt);
  for(const m of S.monsters)updateMonster(m,dt);
  for(let i=S.monsters.length-1;i>=0;i--)if(S.monsters[i].state==='dead'&&S.monsters[i].t>2.8)S.monsters.splice(i,1);
  separate();updProj(dt);updParts(dt);updEmotes(dt);updAnimals(dt);
}
function advance(realDt){
  let left=realDt*S.speed,n=0;
  while(left>1e-6&&n<12){const d=Math.min(SIM_STEP,left);simStep(d);left-=d;n++}
}
