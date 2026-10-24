/* Малювання кадру: земля, відсортовані за y споруди/дерева/істоти, ефекти, нічне затемнення з освітленими вікнами. */
const TOP={house:46,mayor:76,tavern:50,shop:46,church:88,smithy:52,barn:56};
const WINDOWS={tavern:[[-24,-18,6],[-16,-18,6],[10,-18,6],[20,-18,6]],mayor:[[-3,-47,6],[-24,-30,5],[-16,-30,5],[10,-30,5],[18,-30,5],[-24,-16,5],[-16,-16,5],[10,-16,5],[18,-16,5]],
  shop:[[-18,-12,7],[11,-12,7]],church:[[-24,-20,4],[-18,-20,4],[14,-20,4],[20,-20,4]],smithy:[[-9,-14,8]]};
let GROUND=null,STATICS=[];
function buildScene(){
  const L=S.L;GROUND=buildGround(L,S.seed);STATICS=[];
  const add=(img,x,y,extra)=>STATICS.push(Object.assign({img,x,y},extra||{}));
  for(const b of L.buildings){
    if(b.type==='house'){b.sprite=houseSprite(b.look);b.top=TOP.house}else{b.sprite=SPR[b.type];b.top=TOP[b.type]}
    add(b.sprite,b.x,b.y+2,{b});
  }
  for(const t of L.trees)add(SPR.trees[t.k],t.x,t.y);
  add(SPR.well,L.well.x,L.well.y+4);add(SPR.fountain,L.PLAZA.x,L.PLAZA.y+13);
  const P=L.PLAZA;[[-1,.5],[1,.5],[-1,-.7],[1,-.7]].forEach(([sx,sy])=>add(SPR.lamp,P.x+sx*(P.rx-8),P.y+sy*P.ry));
  [[-60,48],[60,48],[-60,-34],[60,-34]].forEach(([dx,dy])=>add(SPR.bench,P.x+dx,P.y+dy));
  for(const[x,y]of[[914,205],[990,200],[935,112],[1005,128],[884,150]])add(SPR.bench,x,y);
  for(const[x,y]of[[880,100],[1020,100],[870,220],[1022,222]])add(SPR.flowers[(x+y)%3],x,y);
  for(const[x,y]of[[455,545],[540,510]])add(SPR.crate,x,y);add(SPR.anvil,500,524);add(SPR.sacks,436,396);add(SPR.barrel,382,398);add(SPR.barrel,426,399);
  add(SPR.barrel,676,398);add(SPR.barrel,684,399);add(SPR.crate,736,399);add(SPR.sign,737+10,408);add(SPR.hay,236,640);add(SPR.hay,224,656);
  add(SPR.dummy,500,660);add(SPR.dummy,622,660);add(SPR.statue,520,270);add(SPR.statue,600,270);
  const Q=L.POND;add(SPR.reeds,Q.x-52,Q.y+16);add(SPR.reeds,Q.x+50,Q.y+10);add(SPR.reeds,Q.x+8,Q.y+Q.ry+4);add(SPR.boat,Q.x-6,Q.y+4);
  for(let x=96;x<=250;x+=24)add(SPR.fence,x,558);for(let y=584;y<=684;y+=24)add(SPR.fence,262,y);
  for(let x=275;x<500;x+=24)add(SPR.fence,x,574);
  // стіна з брамою (південна), вежі
  const W=L.WALL,g=W.gate;
  const seg=(x0,x1)=>{const spr=wallSegSprite(x1-x0);add(spr,x0,W.y1+0,{wall:1})};
  seg(W.x0-8,g.x-g.half-34);seg(g.x+g.half+34,W.x1+8);
  add(SPR.towerGate,g.x-g.half-14,W.y1+4);add(SPR.towerGate,g.x+g.half+14,W.y1+4);
  for(const[x,y]of[[W.x0,W.y0+8],[W.x1,W.y0+8],[W.x0,W.y1+4],[W.x1,W.y1+4]])add(SPR.cornerTower,x,y);
  STATICS.forEach(s=>{if(s.img.ax==null)s.img.ax=0});
}
// 0 — день, 1 — глибока ніч
function nightLevel(h){return h>=21||h<5?1:h>=19?(h-19)/2:h<7?1-(h-5)/2:0}
function drawCreature(ctx,c,sel){
  if(c.inside||c.hidden)return;
  const x=Math.round(c.x),y=Math.round(c.y),a=c.state;
  const f=frameOf(c,a,frameIdx(c,a)),sw=c.sw;
  ctx.fillStyle='rgba(20,50,20,.25)';ctx.fillRect(x-sw+2,y-1,sw*2-4,3);ctx.fillRect(x-sw,y,sw*2,1);
  if(sel){ctx.strokeStyle='#ffe27a';ctx.lineWidth=1;ctx.strokeRect(x-sw-1.5,y-2.5,sw*2+3,5)}
  ctx.save();ctx.translate(x,y);
  if(a==='dead')ctx.globalAlpha=Math.max(0,1-(c.t-1.6)/1);
  if(c.kind==='ghost')ctx.globalAlpha*=.85;
  if(c.face<0)ctx.scale(-1,1);
  ctx.drawImage(f.cv,-f.ox,-f.oy);
  if(c.flash>0){ctx.globalAlpha*=.8;ctx.drawImage(f.wh,-f.ox,-f.oy)}
  ctx.restore();
  if(a!=='dead'&&(c.hp<c.max||c.big)){
    const bw=c.big?20:12,by=y-c.ht-5,bx=x-bw/2;
    ctx.fillStyle='#1a1a1a';ctx.fillRect(bx-1,by-1,bw+2,5);ctx.fillStyle='#4a2a2a';ctx.fillRect(bx,by,bw,3);
    ctx.fillStyle=c.team==='d'?'#5fd35f':'#e0453a';ctx.fillRect(bx,by,Math.max(1,Math.round(bw*c.hp/c.max)),3);
    ctx.fillStyle='rgba(255,255,255,.35)';ctx.fillRect(bx,by,Math.max(1,Math.round(bw*c.hp/c.max)),1)}
  if(c.emote)drawEmote(ctx,c,x,y-c.ht-(c.hp<c.max?8:2));
}
function drawProj(ctx){for(const p of S.projs){const x=Math.round(p.x),y=Math.round(p.y);
  if(p.kind==='arrow'){const hz=Math.abs(p.vx)>Math.abs(p.vy);ctx.fillStyle='#efe6c8';
    if(hz){ctx.fillRect(x-(p.vx>0?4:0),y,5,1);ctx.fillStyle='#cfd6df';ctx.fillRect(x+(p.vx>0?1:-4),y-1,2,3);ctx.fillStyle='#c0392b';ctx.fillRect(x+(p.vx>0?-4:2),y-1,1,3)}
    else{ctx.fillRect(x,y-(p.vy>0?4:0),1,5);ctx.fillStyle='#cfd6df';ctx.fillRect(x-1,y+(p.vy>0?1:-3),3,2)}}
  else{ctx.fillStyle=p.col;ctx.fillRect(x-2,y-2,5,5);ctx.fillStyle='#fff';ctx.fillRect(x-1,y-1,3,3);ctx.fillStyle=p.col;ctx.fillRect(x-4,y,9,1);ctx.fillRect(x,y-4,1,9)}}}
function drawWater(ctx){
  const Q=S.L.POND,t=S.now;ctx.fillStyle='rgba(255,255,255,.55)';
  for(let i=0;i<9;i++){const a=i*2.4+Math.floor(t*.6+i)%7,x=Q.x+Math.cos(a*7.3)*Q.rx*.7,y=Q.y+Math.sin(a*5.1)*Q.ry*.6;if(((t*2+i)%3)<1)ctx.fillRect(Math.round(x),Math.round(y),3,1)}
  const P=S.L.PLAZA;for(let i=0;i<7;i++){const k=((t*1.3+i/7)%1),a=i*0.9;ctx.fillStyle='rgba(180,225,255,'+(1-k)+')';ctx.fillRect(Math.round(P.x+Math.cos(a)*k*9),Math.round(P.y-9+k*k*14-(1-k)*10),1,1)}
}
function render(ctx,vw,vh,cam,dpr){
  const k=cam.z*dpr;ctx.setTransform(1,0,0,1,0,0);ctx.fillStyle='#2f5a2a';ctx.fillRect(0,0,vw*dpr,vh*dpr);
  ctx.setTransform(k,0,0,k,vw*dpr/2-cam.x*k,vh*dpr/2-cam.y*k);ctx.imageSmoothingEnabled=false;
  const x0=cam.x-vw/2/cam.z-60,x1=cam.x+vw/2/cam.z+60,y0=cam.y-vh/2/cam.z-60,y1=cam.y+vh/2/cam.z+140;
  ctx.drawImage(GROUND,0,0);drawWater(ctx);
  const dr=[];
  for(const s of STATICS)if(s.x>x0-80&&s.x<x1+80&&s.y>y0&&s.y<y1+120)dr.push({y:s.y,f:()=>ctx.drawImage(s.img.cv,Math.round(s.x-s.img.ax),Math.round(s.y-s.img.ay))});
  for(const c of S.citizens)if(!c.inside)dr.push({y:c.y-(c.state==='dead'?1:0),f:()=>drawCreature(ctx,c,c===S.sel)});
  for(const m of S.monsters)dr.push({y:m.y-(m.state==='dead'?1:0),f:()=>drawCreature(ctx,m,false)});
  for(const a of S.animals)dr.push({y:a.y,f:()=>drawAnimal(ctx,a)});
  dr.sort((a,b)=>a.y-b.y).forEach(o=>o.f());
  // «zZZ» над будинками зі сплячими
  for(const b of S.L.buildings){const n=S.citizens.filter(c=>c.inside===b&&c.act==='sleep').length;if(n)drawZs(ctx,b.x+(b.w||36)/2-10,b.y-b.top+2,S.now+b.x)}
  drawProj(ctx);drawParts(ctx);
  // ніч: множення синім + освітлені вікна
  const nl=nightLevel(S.T%24);
  if(nl>0){
    ctx.save();ctx.setTransform(1,0,0,1,0,0);ctx.globalCompositeOperation='multiply';
    const m=Math.round(255-nl*(255-95)),m2=Math.round(255-nl*(255-110)),m3=Math.round(255-nl*(255-170));
    ctx.fillStyle=`rgb(${m},${m2},${m3})`;ctx.fillRect(0,0,vw*dpr,vh*dpr);ctx.restore();
    ctx.setTransform(k,0,0,k,vw*dpr/2-cam.x*k,vh*dpr/2-cam.y*k);
    drawLights(ctx,nl);
  }
}
function drawLights(ctx,nl){
  const h=S.T%24;
  for(const b of S.L.buildings){
    const occ=S.citizens.filter(c=>c.inside===b);
    let lit=false;
    if(b.type==='house'||b.type==='mayor'){const owner=S.citizens.find(c=>c.home===b);lit=occ.some(c=>c.act!=='sleep')||(h>=18&&h<23&&!(owner&&owner.inside===b&&owner.act==='sleep'))}
    else if(b.type==='tavern')lit=h>=17||h<2||b.guests>0;
    else if(b.type==='church')lit=h>=18&&h<22;else lit=h>=17&&h<21;
    if(!lit)continue;
    const ws=b.type==='house'?[[-b.hw+3,-17,5],[b.hw-8,-17,5]]:(WINDOWS[b.type]||[]);
    for(const[wx,wy,sz]of ws){
      const x=b.x+wx,y=b.y+2+wy;
      ctx.globalAlpha=.22*nl;ctx.fillStyle='#ffd36a';ctx.fillRect(x-3,y-3,sz+6,sz+6);ctx.globalAlpha=1;
      ctx.fillStyle='#ffe9a0';ctx.fillRect(x+1,y+1,sz-2,sz-2)}
  }
  ctx.fillStyle='rgba(255,210,120,.18)';
  const P=S.L.PLAZA;for(const[sx,sy]of[[-1,.5],[1,.5],[-1,-.7],[1,-.7]]){const x=P.x+sx*(P.rx-8),y=P.y+sy*P.ry-27;ctx.globalAlpha=nl*.5;ctx.beginPath();ctx.arc(x,y,13,0,6.3);ctx.fill();ctx.globalAlpha=1;ctx.fillStyle='#fff3b0';ctx.fillRect(x-1,y-1,3,3);ctx.fillStyle='rgba(255,210,120,.18)'}
}
