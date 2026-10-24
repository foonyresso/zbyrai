/* Вигляд людей: шкіра/волосся/штани, створення істоти (newC), вигляд за класом бою (як у демо) і цивільні варіанти за професією. */
const SKIN=['#f3cfa6','#dca878','#b57a50','#7e4f33'],HAIR=['#2b1d12','#6b4423','#c7a24a','#a33b1f','#d8d8d8','#3b2a5a'];
const PANTS=['#3b4a6b','#5a4632','#2f2f38','#6b3b3b','#3f5a3b'],GOB=['#7cb342','#5f9a3a','#9ccc4a','#6aa84f'];
function newC(team,kind,r,v,ht,sw){const skin=v.skin;if(skin&&!v.skinR)v.skinR=ramp(skin);
  return{team,kind,r,v,ht,sw,x:0,y0:0,y:0,face:1,state:'idle',t:0,dur:2,phase:rnd(0,6),nextFlip:0,fired:0,flash:0,slowT:0,target:null,rt:0,cache:{},big:false}}
function human(x){const skin=pick(SKIN);return Object.assign({type:'human',bodyW:6,bodyH:5,headW:10,headH:8,skin,hair:pick(HAIR),hairStyle:pick(['short','short','spiky','long']),pants:pick(PANTS),boots:'#4a3322',outfit:'#888888'},x)}
function classLook(role){
  const col=pick(['#c0392b','#2e6fb7','#2f9e6f','#7a45a8']);
  switch(role){
    case'knight':return human({outfit:pick(['#8e9bb0','#9aa6b8','#a8b0bc']),armor:true,tabard:col,steel:'#aab4c4',hat:'helm',hatC:col,weapon:'sword',off:'shield',shieldC:col,pants:'#5a6475',boots:'#3a3a44',hairStyle:'short'});
    case'berserker':return human({bare:true,outfit:'#6b4a32',straps:true,pants:pick(['#6b4a32','#5a3a22']),boots:'#3a2a1e',hat:'horned',steel:'#8a8f99',weapon:'axe2',metal:'#c8ced6',beard:true,warpaint:true,hair:'#a33b1f',bodyW:8,bodyH:6,hairStyle:'short'});
    case'rogue':return human({outfit:'#4a4458',pants:'#3a3446',boots:'#2a2430',hat:'mask',hatC:'#3a3446',weapon:'dagger',off:'dagger',leather:true,pouch:true,cape:'#2f2a3a'});
    case'archer':return human({outfit:'#4f8f4f',pants:'#6b5a3a',boots:'#5a3a22',hat:pick(['hood','hood','band']),hatC:pick(['#3f7a45','#c0392b']),feather:true,weapon:'bow',quiver:true,leather:true});
    case'mage':{const c=pick(['#2e6fb7','#7a45a8','#16967f']);return human({robe:true,outfit:c,trim:'#e9c24a',sash:'#e9c24a',hat:'wizard',hatC:sh(c,.9),weapon:'staff',orb:pick(['#ff8a3d','#8fe0ff']),beard:Math.random()<.5,hair:pick(['#d8d8d8','#6b4423']),hairStyle:'short'})}
    default:return human({robe:true,outfit:'#f4f0e6',trim:'#e9c24a',sash:'#4fae6a',hat:'cleric',hatC:'#f4f0e6',weapon:'staff',cross:true,orb:'#7dffa0',hairStyle:'long'})}}
// вигляд за професією: клас бою задає зброю/одяг, цивільні деталі — поверх (джерело істини про професії — jobs.js)
function lookFor(job){
  const base=job.cls==='militia'?human({outfit:pick(['#a8743a','#7a8f5a','#8a6a4a']),pants:'#5a4632',boots:'#4a3322',hat:'band',hatC:'#e0c15a',weapon:'spear',leather:true}):classLook(job.cls);
  return Object.assign(base,job.look||{});
}
