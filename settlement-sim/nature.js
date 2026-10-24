/* Декорації природи й дрібниці: дерева, кущі, каміння, бочки, ящики, паркан, колодязь, табличка. Малюємо кодом у стилі істот (3 тони + контур). */
function mkSprite(w,h,ax,ay,fn){const cv=newCv(w,h);G=cv.getContext('2d');G.imageSmoothingEnabled=false;G.translate(ax,ay);fn();return{cv:outline(cv),ax,ay}}
const SPR={};
function treeRound(){return mkSprite(32,40,16,38,()=>{
  const g=ramp(pick(['#4c9a45','#5aa84c','#3f8f4a'])),wd=ramp('#7a5230');
  box(-2,-12,4,12,wd);ell(0,-22,10,9,g);ell(-6,-17,6,5,g);ell(6,-17,6,5,g);fr(-4,-26,3,2,g[0])})}
function treePine(){return mkSprite(26,42,13,40,()=>{
  const g=ramp('#2f7d4a'),wd=ramp('#6b4526');box(-2,-8,4,8,wd);
  for(let t=0;t<3;t++){const y=-8-t*9,w=9-t*2;for(let i=0;i<10;i++){const ww=Math.max(2,Math.round(w*2*(i/9)));fr(-ww/2,y-10+i,ww,1,i>6?g[2]:g[1])}}})}
SPR.trees=[treeRound(),treeRound(),treePine(),treePine(),treeRound(),treePine()];
SPR.bushes=[0,1].map(i=>mkSprite(20,12,10,10,()=>{const g=ramp('#4c9a45');ell(-4,-4,5,4,g);ell(4,-4,5,4,g);ell(0,-6,5,4,g);if(i)fr(2,-5,2,2,'#e2493f')}));
SPR.rocks=[0,1].map(i=>mkSprite(22,14,11,12,()=>{const r=ramp('#9ea3ab');ell(0,-4,7-i,4,r);ell(-6,-2,4,3,r);ell(6,-2,3,2,r)}));
SPR.barrel=mkSprite(14,16,7,14,()=>{const w=ramp('#8a5a2b');box(-4,-12,8,12,w);fr(-4,-9,8,1,'#6a6f78');fr(-4,-4,8,1,'#6a6f78')});
SPR.crate=mkSprite(14,14,7,13,()=>{const w=ramp('#a8743a');box(-5,-10,10,10,w);fr(-5,-6,10,1,w[2]);fr(0,-10,1,10,w[2])});
SPR.fence=mkSprite(26,14,13,12,()=>{const w=ramp('#a07848');box(-11,-9,2,9,w);box(0,-9,2,9,w);box(9,-9,2,9,w);box(-11,-7,22,2,w);box(-11,-3,22,2,w)});
SPR.well=mkSprite(26,30,13,26,()=>{const st=ramp('#a39c90'),wd=ramp('#7a5230');box(-7,-8,14,8,st);ell(0,-8,7,2,ramp('#3a62a8'));box(-7,-22,2,14,wd);box(5,-22,2,14,wd);
  for(let i=0;i<5;i++){const w=18-i*3;fr(-w/2,-24-i,w,1,i&1?'#7a3a2a':'#b8452f')}});
SPR.sign=mkSprite(16,20,8,18,()=>{const w=ramp('#a07848');box(-1,-14,2,14,w);box(-6,-16,12,6,w);fr(-4,-14,8,1,w[2])});
