/* Домашні тварини біля ферми (корови, вівці, свині, кури): прості спрайти кодом, блукають загоном і не б'ються. */
function animalSprite(kind){
  const w=kind==='chicken'?12:22,h=kind==='chicken'?12:18;
  return mkSprite(w+4,h+4,Math.floor((w+4)/2),h+1,()=>{
    if(kind==='cow'){const b=ramp('#f4f0e6'),d=ramp('#4a3a32'),pk=ramp('#e8a8a0');box(-8,-9,16,7,b);fr(-5,-8,4,3,d[1]);fr(2,-6,3,3,d[1]);box(-12,-12,6,6,b);fr(-13,-9,2,2,pk[1]);fr(-9,-13,1,2,d[2]);fr(-7,-8,1,1,'#1d1424');box(-8,-2,2,2,d);box(-3,-2,2,2,d);box(2,-2,2,2,d);box(6,-2,2,2,d);fr(8,-9,2,1,b[2])}
    else if(kind==='sheep'){const wl=ramp('#f1ece0'),f=ramp('#4a3a32');ell(0,-7,8,5,wl);ell(-4,-9,4,3,wl);ell(4,-9,4,3,wl);box(-12,-9,5,5,f);fr(-10,-8,1,1,'#fff');box(-5,-2,2,2,f);box(3,-2,2,2,f)}
    else if(kind==='pig'){const p=ramp('#f0a8a0');box(-8,-8,16,6,p);box(-12,-9,5,5,p);fr(-13,-7,2,2,ramp('#d87a78')[1]);fr(-10,-8,1,1,'#1d1424');box(-6,-2,2,2,p);box(4,-2,2,2,p);fr(8,-9,2,2,p[2])}
    else{const c=ramp('#f4f0e6'),r=ramp('#d23a2a');box(-4,-7,8,5,c);box(-6,-10,4,4,c);fr(-6,-11,2,1,r[1]);fr(-7,-8,1,1,'#e9a02b');fr(-5,-9,1,1,'#1d1424');fr(4,-9,2,3,c[2]);fr(-2,-2,1,2,'#e9a02b');fr(1,-2,1,2,'#e9a02b')}
  })}
function spawnAnimals(){
  const kinds=[['cow',2],['sheep',3],['pig',2],['chicken',4]];
  for(const[k,n]of kinds)for(let i=0;i<n;i++){
    const img=animalSprite(k),a={k,img,dir:-1,x:rand(100,255),y:rand(575,672),face:1,t:rand(0,3),st:'rest',dur:rand(1,4),tx:0,ty:0};
    if(!walkable(a.x,a.y)){a.x=150;a.y=650}S.animals.push(a)}
}
const PASTURE={x0:92,y0:560,x1:262,y1:684};
function updAnimals(dt){
  for(const a of S.animals){a.t+=dt;
    if(a.st==='rest'&&a.t>a.dur){a.st='walk';a.t=0;a.dur=rand(2,5);a.tx=Math.max(PASTURE.x0,Math.min(PASTURE.x1,a.x+rand(-50,50)));a.ty=Math.max(PASTURE.y0,Math.min(PASTURE.y1,a.y+rand(-24,24)))}
    else if(a.st==='walk'){const dx=a.tx-a.x,dy=a.ty-a.y,d=Math.hypot(dx,dy);
      if(d<2||a.t>a.dur){a.st='rest';a.t=0;a.dur=rand(1.5,5)}
      else{const sp=a.k==='chicken'?14:9,nx=a.x+dx/d*sp*dt,ny=a.y+dy/d*sp*dt;if(walkable(nx,ny)){a.x=nx;a.y=ny}else{a.st='rest';a.t=0}if(Math.abs(dx)>.5)a.face=dx>0?1:-1}}}
}
function drawAnimal(ctx,a){
  const x=Math.round(a.x),y=Math.round(a.y),w=a.img.cv.width;
  ctx.fillStyle='rgba(20,50,20,.25)';ctx.fillRect(x-Math.floor(w/2)+2,y-1,w-4,2);
  const hop=a.st==='walk'?-(Math.floor(a.t*(a.k==='chicken'?10:6))%2):0;
  ctx.save();ctx.translate(x,y+hop);if(a.face!==a.dir)ctx.scale(-1,1);ctx.drawImage(a.img.cv,-a.img.ax,-a.img.ay);ctx.restore()}
