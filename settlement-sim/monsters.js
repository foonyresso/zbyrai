/* Вигляд монстрів (гоблін, скелет, орк/бос, вовк, слиз, кажан, павук, привид) і створення монстра зі статами механіки combat. */
function monLook(kind){
  if(kind==='goblin'){const skin=pick(GOB);const v={type:'goblin',bodyW:6,bodyH:4,headW:10,headH:8,skin,outfit:pick(['#7a5230','#5a4632','#6b3b3b']),pants:pick(['#4a3a2a','#3a3a44']),boots:'#2f2418',ears:'gob',
      hat:pick(['none','gcap','rust','band']),hatC:pick(['#c0392b','#7a45a8','#d98a2b']),weapon:pick(['club','spear','dagger']),leather:true};return newC('m',kind,'biped',v,22,6)}
  if(kind==='skeleton'){const v={type:'skeleton',skeleton:true,skelLeg:true,glowEye:true,bodyW:6,bodyH:5,headW:10,headH:8,skin:'#ebe6d3',outfit:'#ebe6d3',pants:'#ebe6d3',boots:'#d9d3bd',
      hat:pick(['none','rust','rust','crown']),hatC:'#8a6a4a',weapon:'sword',sword:12,metal:'#a8a090',off:Math.random()<.5?'shield':null,shieldC:'#6b4a32'};return newC('m',kind,'biped',v,24,6)}
  if(kind==='orc'||kind==='boss'){const b=kind==='boss',skin=b?'#5a7f3a':pick(['#6f9a4a','#7a8f5a','#5f8a56']);
    const v={type:'orc',bodyW:8,bodyH:6,headW:10,headH:8,skin,outfit:'#6b4a32',pants:'#4a3a2a',boots:'#2f2418',ears:'orc',leather:true,spikes:true,steel:'#8a8f99',
      hat:b?pick(['crown','horned']):pick(['none','horned','rust']),hatC:'#8a6a4a',weapon:b?'club':pick(['axe','club'])};
    const c=newC('m',kind,'biped',v,26,7);if(b){c.big=true;c.ht=52;c.sw=13}return c}
  if(kind==='wolf')return newC('m',kind,'wolf',{fur:pick(['#8a8f99','#6b5a4a','#4a4650','#c9a36a']),belly:pick(['#d9d2c0','#c9c2b0'])},12,9);
  if(kind==='slime'){const col=pick(['#58c7a3','#6aa8e8','#e8788f','#b980e0','#e6c34a','#8fd45a']);const v={col,w:ri(11,15),h:ri(9,12),crown:Math.random()<.25,core:Math.random()<.3?pick(['#fff3a0','#ff8a8a']):null};return newC('m',kind,'slime',v,v.h+4,v.w/2+1)}
  if(kind==='bat')return newC('m',kind,'bat',{col:pick(['#5b4a78','#4a4458','#7a3a5a']),wing:pick(['#6b3a8a','#8a3a4a','#3a4a8a'])},20,5);
  if(kind==='spider')return newC('m',kind,'spider',{col:pick(['#3a3040','#5a3a4a','#2f4a3a'])},10,7);
  return newC('m',kind,'ghost',{col:pick(['#cfe6f6','#e6dcf6','#d6f0e0'])},18,6)}
function makeMon(kind,x,y){
  const c=monLook(kind),m=Mech.Combat.MONSTERS[kind];
  Object.assign(c,{role:null,hp:m.hp,max:m.hp,dmg:m.dmg,P:m.P,range:m.range,spd:m.spd,mst:m.st,x,y,name:m.name,lastHit:-1e9});return c}
