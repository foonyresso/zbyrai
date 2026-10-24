/* Кадри істот: таблиця анімацій, вибір кадру, кеш спрайтів (кадр = окремий полотно з контуром). */
const SZ=32,OX=16,OY=28;
const ANIM={idle:[2,2],walk:[4,0],run:[4,0],attack:[4,0],shoot:[4,0],cast:[4,0],wave:[2,5],jump:[4,6],dance:[2,5],look:[2,3],work:[2,3],sleep:[1,1],dead:[1,1]};
const atkCycle=c=>(c.t/c.P)%1;
function frameIdx(c,a){const[n,fps]=ANIM[a];
  if(a==='walk'||a==='run')return Math.floor(((c.phase%6.2832)/6.2832)*n)%n;
  if(a==='attack'||a==='shoot'||a==='cast')return Math.min(n-1,Math.floor(atkCycle(c)*n));
  return Math.floor(c.t*fps)%n}
const NB={wave:'idle',look:'idle',cast:'idle',shoot:'idle',dance:'jump',sleep:'dead'};
function frameOf(c,a,fi){
  const key=a+fi;let f=c.cache[key];if(f)return f;
  const cv=newCv(SZ,SZ);G=cv.getContext('2d');G.imageSmoothingEnabled=false;
  G.save();G.translate(OX,OY);
  const ra=c.r==='biped'?a:(NB[a]||a);
  RENDER[c.r](c,ra,c.r==='biped'?fi:Math.min(fi,(ANIM[ra]||[1])[0]-1));
  G.restore();
  let o=outline(cv);const s=c.big?2:1;
  if(s>1){const b=newCv(SZ*s,SZ*s);b.getContext('2d').drawImage(o,0,0,SZ*s,SZ*s);o=b}
  const wc=newCv(o.width,o.height),wg=wc.getContext('2d');wg.drawImage(o,0,0);wg.globalCompositeOperation='source-atop';wg.fillStyle='rgba(255,255,255,.75)';wg.fillRect(0,0,o.width,o.height);
  f=c.cache[key]={cv:o,wh:wc,ox:OX*s,oy:OY*s};return f}
