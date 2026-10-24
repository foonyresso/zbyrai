/* Розпорядок мешканця: вибір заняття (механіка schedule), дорога до місця, сон удома з «zZZ», обід у таверні, робота, відпочинок. */
const CHAT_PLACES=[['plaza',4],['tavern',2],['well',1],['park',2],['shop',1]];
function placeSpot(key){const a=S.L.spots[key];const p=a[Math.floor(S.R()*a.length)];return[p[0]+rand(-6,6),p[1]+rand(-3,3)]}
function nextAct(c){startAct(c,Mech.Schedule.choose(c.needs,S.T%24,S.R))}
function startAct(c,act){
  c.act=act;c.actEnd=S.T+Mech.Schedule.duration(act,S.R);c.partner=null;c.waitT=0;c.spotT=0;
  let g;
  switch(act){
    case'sleep':g=[c.home.door.x,c.home.door.y];break;
    case'eat':{const t=S.L.buildings.find(b=>b.type==='tavern');g=[t.door.x,t.door.y];break}
    case'work':g=placeSpot(c.job.work);break;
    case'chat':{let s=0;for(const[,w]of CHAT_PLACES)s+=w;let r=S.R()*s,k='plaza';for(const[n,w]of CHAT_PLACES){r-=w;if(r<=0){k=n;break}}g=placeSpot(k);break}
    case'relax':g=placeSpot(spick(['park','pond','well','park']));break;
    default:g=placeSpot(spick(['plaza','park','well','tavern','gate']));
  }
  setGoal(c,g[0],g[1]);
}
function enter(c,b){c.inside=b;c.arrived=true;c.state='idle';c.partner=null;if(b.type==='tavern')b.guests=(b.guests||0)+1;c.enterT=S.T}
function leave(c){const b=c.inside;if(b&&b.type==='tavern')b.guests=Math.max(0,(b.guests||1)-1);c.inside=null;c.x=c.home&&b===c.home?b.door.x:b.door.x;c.y=b.door.y+3;c.state='idle';c.t=0;c.path=null}
// один крок розпорядку; dt — секунди симуляції
function routineTick(c,dt){
  const dtH=dt/HOUR_SEC;
  if(c.inside){
    Mech.Needs.tick(c.needs,c.act,dtH);
    if(c.act==='sleep'){c.hp=Math.min(c.max,c.hp+dt*4);if(Mech.Schedule.shouldWake(c.needs,S.T%24)&&S.T>=c.enterT+1){leave(c);nextAct(c)}}
    else if(S.T>=c.enterT+.6||c.needs.hunger>=.98){leave(c);nextAct(c)}
    return;
  }
  const moving=!c.arrived;
  Mech.Needs.tick(c.needs,moving?'stroll':c.act,dtH);
  c.hp=Math.min(c.max,c.hp+dt*.6);
  if(moving){
    const sp=c.act==='eat'&&c.needs.hunger<.2?WALK*1.3:WALK;
    c.state='walk';
    if(follow(c,dt,sp))onArrive(c);
    else if(S.T>c.actEnd+2&&c.act!=='sleep')nextAct(c);
    greet(c,dt);
    return;
  }
  // на місці
  switch(c.act){
    case'work':
      c.state=c.job.anim;c.workT+=dt;coworkTalk(c,dt);
      if(c.workT>rand(7,14)){c.workT=0;const g=placeSpot(c.job.work);setGoal(c,g[0],g[1])}
      if(S.T>=c.actEnd)nextAct(c);break;
    case'chat':socialTick(c,dt);if(S.T>=c.actEnd){endTalk(c);nextAct(c)}break;
    case'relax':
      c.state=(Math.floor(S.now/3+c.id)%3===0)?'look':'idle';c.spotT+=dt;
      if(c.spotT>rand(8,16)){c.spotT=0;const g=placeSpot(spick(['park','pond','well']));setGoal(c,g[0],g[1])}
      if(S.T>=c.actEnd)nextAct(c);break;
    case'stroll':
      c.state='idle';c.spotT+=dt;if(c.spotT>1.5){const g=placeSpot(spick(['plaza','park','well','tavern','gate','shop']));setGoal(c,g[0],g[1]);c.spotT=0}
      if(S.T>=c.actEnd)nextAct(c);break;
    default:nextAct(c);
  }
}
function onArrive(c){
  if(c.act==='sleep'){enter(c,c.home);emoteOf(c,'zzz')}
  else if(c.act==='eat'){enter(c,S.L.buildings.find(b=>b.type==='tavern'));emoteOf(c,'food')}
  else{c.state='idle';c.t=0;c.waitT=0}
}
