/* Будівлі міста, намальовані кодом у стилі істот (блоки box/ell, 3 тони + темний контур): житлові будинки різних кольорів, дім старости, таверна, крамниця, церква, кав, комора, вежі воріт.
   Якір спрайта — середина низу будівлі. Ліхтарі вікон і двері малюємо окремо в рендері за даними DOOR/WIN. */
const DARKWD='#6b4526';
// ступінчастий дах: ряди завширшки w0, що звужуються на shrink за ряд; смуги чергуються
function roof(y0,w0,rows,shrink,rp){for(let i=0;i<rows;i++){const w=w0-i*shrink;if(w<2)break;fr(-w/2,y0-i,w,1,(i>>1)&1?rp[2]:rp[1])}fr(-w0/2,y0,w0,1,rp[2])}
function windowAt(x,y,lit,sz){box(x,y,sz||5,sz||5,ramp(DARKWD));box(x+1,y+1,(sz||5)-2,(sz||5)-2,ramp(lit||'#f6d77a'))}
function doorAt(x,y,w,h,arch){box(x,y,w,h,ramp(DARKWD));fr(x+w-2,y+Math.floor(h/2),1,1,'#e9c24a');if(arch)fr(x+1,y-1,w-2,1,ramp(DARKWD)[1])}
const WALLS=['#e6d5b4','#d9b98a','#e8c9c0','#c9d6c0','#d8d0e0','#b9c4d4'],ROOFS=['#b8452f','#3a62a8','#4c8a4a','#8a5a2b','#7a45a8','#c0702f'];
// житловий будинок: o = {wall, roof, hw (півширина), chim, flowers, shutters}
function houseSprite(o){return mkSprite(2*o.hw+22,58,o.hw+11,56,()=>{
  const st=ramp('#a39c90'),wl=ramp(o.wall),rf=ramp(o.roof),hw=o.hw;
  box(-hw-1,-5,2*hw+2,5,st);box(-hw,-20,2*hw,15,wl);
  if(o.timber){fr(-hw,-20,2*hw,1,ramp(DARKWD)[1]);fr(-hw+4,-19,1,14,ramp(DARKWD)[1]);fr(hw-5,-19,1,14,ramp(DARKWD)[1])}
  roof(-20,2*hw+10,Math.floor((2*hw+8)/3),3,rf);
  if(o.chim){box(hw-9,-38,5,10,st);fr(hw-9,-39,5,1,st[2])}
  doorAt(-3,-13,6,13);
  for(const wx of[-hw+3,hw-8]){windowAt(wx,-17,o.lit,5);if(o.shutters){fr(wx-1,-17,1,5,rf[2]);fr(wx+5,-17,1,5,rf[2])}if(o.flowers)fr(wx,-11,5,2,'#e2493f')}
  if(o.flag){fr(0,-50,1,10,'#5a3a22');fr(1,-50,5,3,o.flag)}})}
function pickHouse(R){const hw=pick([15,16,17,18]);return{wall:pick(WALLS),roof:pick(ROOFS),hw,chim:R()<.7,flowers:R()<.5,shutters:R()<.5,timber:R()<.3}}
const DOOR_Y=0; // двері — в основі спрайта

SPR.mayor=mkSprite(110,92,55,90,()=>{
  const st=ramp('#a39c90'),wl=ramp('#efe3c8'),rf=ramp('#7a2e3a'),gold=ramp('#e9c24a'),dk=ramp(DARKWD);
  box(-31,-6,62,6,st);box(-30,-34,60,28,wl);fr(-30,-20,60,1,wl[2]);
  for(const x of[-30,-8,7,29])fr(x,-34,2,28,dk[1]);
  roof(-34,76,18,4,rf);
  box(-9,-50,18,16,wl);roof(-50,24,8,3,rf);windowAt(-3,-47,'#f6d77a',6);
  for(const x of[-24,-16,10,18])windowAt(x,-30,'#f6d77a',5);for(const x of[-24,-16,10,18])windowAt(x,-16,'#f6d77a',5);
  box(-8,-8,16,3,gold);box(-5,-21,10,13,dk);fr(-4,-22,8,1,dk[1]);fr(3,-14,1,1,'#e9c24a');
  box(-12,-7,2,7,st);box(10,-7,2,7,st);
  box(21,-46,5,12,st);fr(21,-47,5,1,st[2]);
  fr(0,-68,1,18,'#5a3a22');fr(1,-68,7,4,'#c0392b');fr(1,-66,7,1,gold[1]);
  box(-27,-24,6,3,ramp('#c0392b'));box(23,-24,6,3,ramp('#c0392b'))});
SPR.tavern=mkSprite(90,64,45,62,()=>{
  const st=ramp('#a39c90'),wl=ramp('#d9b98a'),rf=ramp('#6b3a24'),dk=ramp(DARKWD);
  box(-29,-5,58,5,st);box(-28,-22,56,17,wl);
  for(const x of[-28,-14,0,14,27])fr(x,-22,2,17,dk[1]);fr(-28,-22,56,2,dk[1]);fr(-28,-14,56,1,dk[1]);
  roof(-22,70,15,4,rf);box(14,-44,6,12,st);fr(14,-45,6,1,st[2]);
  doorAt(-4,-15,8,15,true);windowAt(-24,-18,'#ffb74a',6);windowAt(-16,-18,'#ffb74a',6);windowAt(10,-18,'#ffb74a',6);windowAt(20,-18,'#ffb74a',6);
  fr(26,-26,1,14,dk[1]);fr(26,-27,12,1,dk[1]);box(29,-24,9,8,ramp('#a07848'));fr(31,-22,5,3,'#f2c230');fr(35,-21,2,2,'#f2c230');
  box(-34,-9,6,9,ramp('#8a5a2b'));fr(-34,-6,6,1,'#6a6f78')});
SPR.shop=mkSprite(70,56,35,54,()=>{
  const st=ramp('#a39c90'),wl=ramp('#e8c9c0'),rf=ramp('#3a62a8');
  box(-23,-5,46,5,st);box(-22,-22,44,17,wl);roof(-22,54,13,3.5,rf);
  for(let i=0;i<22;i++)fr(-22+i*2,-19,2,5,i&1?'#f4f0e6':'#c0392b');fr(-22,-14,44,1,ramp('#c0392b')[2]);
  doorAt(-3,-13,6,13);windowAt(-18,-12,'#f6d77a',7);windowAt(11,-12,'#f6d77a',7);
  box(-30,-8,7,8,ramp('#a8743a'));fr(-30,-4,7,1,'#6a4a22');box(23,-9,6,9,ramp('#8a5a2b'));fr(23,-6,6,1,'#6a6f78');
  box(-8,-27,16,5,ramp('#a07848'));fr(-5,-25,10,1,'#f2c230')});
SPR.church=mkSprite(84,100,42,98,()=>{
  const st=ramp('#bdb7ac'),rf=ramp('#4a5f86'),dk=ramp(DARKWD),gold=ramp('#e9c24a');
  box(-31,-6,62,6,ramp('#a39c90'));box(-30,-26,60,20,st);roof(-26,70,13,5,rf);
  box(-10,-62,20,56,st);for(const y of[-48,-34,-20])fr(-10,y,20,1,st[2]);
  box(-5,-58,10,8,dk);fr(-4,-57,8,1,'#2a2330');
  for(let i=0;i<14;i++){const w=24-i*2;if(w<2)break;fr(-w/2,-62-i,w,1,i&1?rf[2]:rf[1])}
  fr(0,-84,1,10,gold[1]);fr(-2,-81,5,1,gold[1]);
  box(-4,-18,8,12,dk);fr(-3,-19,6,1,dk[1]);ell(0,-40,3,3,ramp('#7fb7ff'));
  for(const x of[-24,-18,14,20]){box(x,-20,4,8,dk);fr(x+1,-19,2,6,'#7fb7ff')}});
SPR.smithy=mkSprite(80,60,40,58,()=>{
  const st=ramp('#8d8a86'),rf=ramp('#4a4650'),dk=ramp('#3a3038'),fire=ramp('#ff8a3d');
  box(-26,-5,52,5,ramp('#a39c90'));box(-25,-22,50,17,st);roof(-22,62,13,4,rf);
  box(12,-48,8,26,st);fr(12,-49,8,1,st[2]);fr(14,-50,4,1,'#9a9aa0');
  box(-13,-17,22,12,dk);box(-9,-14,8,8,fire);fr(-9,-14,2,2,'#ffe27a');fr(-6,-12,3,3,'#fff3a0');
  box(-24,-14,5,9,ramp('#7a5230'));fr(-23,-12,1,5,'#cfd6df');box(17,-16,6,11,ramp('#5a3a22'))});
SPR.barn=mkSprite(86,66,43,64,()=>{
  const rd=ramp('#a8432f'),rf=ramp('#6b4a32');
  box(-30,-5,60,5,ramp('#a39c90'));box(-29,-28,58,23,rd);
  roof(-28,70,19,3.5,rf);fr(-1,-24,2,19,'#f4f0e6');fr(-29,-28,58,1,'#f4f0e6');
  box(-10,-22,20,17,ramp('#7a2e1e'));fr(-10,-22,20,1,'#f4f0e6');for(let i=0;i<8;i++){fr(-9+i*2,-21+i*2,1,1,'#f4f0e6');fr(8-i*2,-21+i*2,1,1,'#f4f0e6')}
  box(-5,-38,10,8,ramp('#7a2e1e'));fr(-4,-37,8,1,'#f4f0e6')});
SPR.towerGate=mkSprite(40,92,20,90,()=>{
  const st=ramp('#aaa39a'),bl=ramp('#3a62a8');
  box(-14,-52,28,52,st);fr(4,-52,10,52,st[2]);for(const y of[-44,-34,-24,-14])fr(-14,y,28,1,st[2]);
  box(-17,-58,34,7,st);for(const x of[-17,-7,3,12])fr(x,-62,6,5,st[1]);
  for(let i=0;i<14;i++){const w=30-i*2;if(w<2)break;fr(-w/2,-58-i,w,1,i&1?bl[2]:bl[1])}
  fr(0,-86,1,14,'#5a3a22');fr(1,-86,7,4,'#c0392b');fr(-2,-40,4,8,'#1d1424');fr(-3,-6,6,6,'#6b4526')});
SPR.cornerTower=mkSprite(34,76,17,74,()=>{
  const st=ramp('#aaa39a'),bl=ramp('#7a2e3a');
  box(-11,-40,22,40,st);fr(3,-40,8,40,st[2]);for(const y of[-30,-20,-10])fr(-11,y,22,1,st[2]);
  box(-13,-46,26,6,st);for(const x of[-13,-4,5])fr(x,-50,5,5,st[1]);
  for(let i=0;i<11;i++){const w=24-i*2;if(w<2)break;fr(-w/2,-46-i,w,1,i&1?bl[2]:bl[1])}fr(-1,-30,2,6,'#1d1424')});
function wallSegSprite(w){return mkSprite(w+4,40,2,38,()=>{
  const st=ramp('#aaa39a');box(0,-24,w,24,st);fr(0,-12,w,1,st[2]);fr(0,-20,w,1,st[2]);
  for(let x=0;x<w;x+=2)if(((x>>1)%4)<2)fr(x,-28,2,4,st[1]);for(let x=((w/6)|0);x<w-3;x+=14)fr(x,-18,1,5,st[2])})}
