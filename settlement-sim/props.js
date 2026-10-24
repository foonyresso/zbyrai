/* Дрібні споруди площі й парку, намальовані кодом: фонтан, лавка, ліхтар, клумба, стіг сіна, мішки, стійка з мішенню. */
SPR.fountain=mkSprite(64,50,32,44,()=>{
  const st=ramp('#b4afa7'),wt=ramp('#4f9fd8'),st2=ramp('#9a958c');
  ell(0,-8,26,12,st2);ell(0,-10,23,10,wt);ell(0,-11,19,7,ramp('#6ab8ea'));
  box(-4,-24,8,14,st);box(-8,-14,16,4,st);ell(0,-27,6,3,st);fr(-1,-31,2,5,wt[0]);fr(-3,-28,1,3,wt[0]);fr(2,-28,1,3,wt[0])});
SPR.bench=mkSprite(24,16,12,14,()=>{const w=ramp('#a07848'),m=ramp('#6a6f78');box(-9,-9,18,3,w);box(-9,-6,18,2,w);box(-10,-13,20,3,w);fr(-9,-4,2,4,m[1]);fr(7,-4,2,4,m[1])});
SPR.lamp=mkSprite(12,34,6,32,()=>{const m=ramp('#4a4f58');box(-1,-26,2,26,m);box(-3,-30,6,6,ramp('#f6d77a'));fr(-4,-31,8,1,m[1]);fr(-1,-1,2,1,m[2])});
SPR.flowers=[['#e2493f','#f2e56b'],['#c08ae8','#f6f6f0'],['#e98ba8','#7fb7ff']].map(c=>mkSprite(24,12,12,10,()=>{
  const g=ramp('#4c9a45'),d=ramp('#7a5230');box(-10,-5,20,5,d);for(let i=0;i<7;i++){const x=-9+i*3;fr(x,-8+(i%2),2,3,g[1]);fr(x,-9+(i%2),2,2,c[i%2])}}));
SPR.hay=mkSprite(26,22,13,20,()=>{const h=ramp('#e0c15a');ell(0,-7,11,7,h);fr(-6,-9,12,1,h[0]);fr(-8,-5,15,1,h[2]);fr(-1,-14,2,3,h[0])});
SPR.sacks=mkSprite(20,14,10,12,()=>{const s=ramp('#cdb98a');ell(-4,-4,4,4,s);ell(4,-4,4,4,s);ell(0,-8,4,4,s);fr(-5,-8,2,1,s[2]);fr(3,-8,2,1,s[2])});
SPR.anvil=mkSprite(16,12,8,10,()=>{const m=ramp('#6a6f78');box(-6,-6,12,3,m);box(-3,-3,6,3,m);box(-5,-8,4,2,m)});
SPR.dummy=mkSprite(16,26,8,24,()=>{const w=ramp('#a07848'),s=ramp('#cdb98a');box(-1,-16,2,16,w);box(-6,-14,12,2,w);ell(0,-18,4,4,s);fr(-1,-19,2,2,ramp('#c0392b')[1])});
SPR.statue=mkSprite(20,30,10,28,()=>{const s=ramp('#aaa39a');box(-6,-6,12,6,s);box(-3,-18,6,12,s);ell(0,-21,3,3,s);fr(-6,-14,3,2,s[2]);fr(3,-14,3,2,s[2])});
SPR.reeds=mkSprite(16,18,8,16,()=>{const g=ramp('#5f9a3a');for(const[x,h]of[[-5,10],[-2,14],[1,11],[4,13]]){fr(x,-h,1,h,g[1]);fr(x,-h-3,2,3,'#7a5230')}});
SPR.boat=mkSprite(30,16,15,12,()=>{const w=ramp('#8a5a2b');box(-11,-6,22,5,w);fr(-12,-8,3,2,w[0]);fr(10,-8,3,2,w[0]);fr(0,-14,1,8,'#cdb98a');fr(1,-14,5,4,'#efe6d0')});
