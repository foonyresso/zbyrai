/* Спілкування мешканців: пари для розмови на місці (жести, бульбашки, дружба), вітання на ходу, балачки колег по роботі. */
const GESTURES=['idle','wave','look','idle','jump','dance','look'];
const pairKey=(a,b)=>a.id<b.id?a.id+'-'+b.id:b.id+'-'+a.id;
function socialTick(c,dt){
  const p=c.partner;
  if(p){
    if(!Mech.Combat.alive(p)||p.partner!==c||p.inside||p.act!=='chat'){endTalk(c);return}
    const d=Math.hypot(p.x-c.x,p.y-c.y);
    c.face=p.x>c.x?1:-1;
    if(d>17){c.state='walk';c.phase+=0;moveBy(c,(p.x-c.x)/d*WALK*.6*dt,(p.y-c.y)/d*WALK*.6*dt);return}
    c.gestT=(c.gestT||0)-dt;
    if(c.gestT<=0){c.gestT=rand(1.1,2.4);c.state=spick(GESTURES);c.t=0;if(S.R()<.55)emoteOf(c,spick(['talk','talk','excl','note','heart','ques','smile']))}
    S.fr[pairKey(c,p)]=(S.fr[pairKey(c,p)]||0)+dt*.02;
    return;
  }
  c.state='idle';c.waitT+=dt;
  if(!c.talkCd||S.now>c.talkCd){
    const o=Mech.Combat.nearest(c,S.citizens,56,x=>x.act==='chat'&&x.arrived&&!x.partner&&!x.inside&&x.mode==='routine'&&Mech.Combat.alive(x));
    if(o){c.partner=o;o.partner=c;c.waitT=o.waitT=0;c.gestT=0;o.gestT=.8;emoteOf(c,'smile');emoteOf(o,'wave');c.state='wave';return}
  }
  if(c.waitT>9){const g=placeSpot(spick(['plaza','tavern','park','well']));setGoal(c,g[0],g[1]);c.waitT=0}
}
function endTalk(c){const p=c.partner;c.partner=null;c.talkCd=S.now+6;if(p&&p.partner===c){p.partner=null;p.talkCd=S.now+6}}
// вітання й балачки на ходу, раз на пів секунди
function greet(c,dt){
  c.greetCd-=dt;if(c.greetCd>0)return;c.greetCd=rand(14,28);
  const o=Mech.Combat.nearest(c,S.citizens,18,x=>x.mode==='routine'&&!x.inside&&Mech.Combat.alive(x)&&x.act!=='sleep');
  if(!o)return;
  emoteOf(c,spick(['wave','smile','talk']));emoteOf(o,spick(['wave','smile']));c.face=o.x>c.x?1:-1;
  c.needs.social=Math.min(1,c.needs.social+.04);o.needs.social=Math.min(1,o.needs.social+.04);
  S.fr[pairKey(c,o)]=(S.fr[pairKey(c,o)]||0)+.03;
}
// колеги на одній роботі іноді перемовляються
function coworkTalk(c,dt){
  c.cowT=(c.cowT||rand(8,20))-dt;if(c.cowT>0)return;c.cowT=rand(14,30);
  const o=Mech.Combat.nearest(c,S.citizens,46,x=>x.act==='work'&&x.arrived&&!x.inside&&x.job.work===c.job.work);
  if(o){emoteOf(c,'talk');emoteOf(o,'talk');S.fr[pairKey(c,o)]=(S.fr[pairKey(c,o)]||0)+.03}
}
