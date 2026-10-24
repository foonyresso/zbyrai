/* Земля міста: одноразово малюється в окреме полотно (трава, дороги, площа, ставок, парк, поля, північна/західна/східна стіни). */
function buildGround(L,seed){
  const R=Mech.Rng.stream(seed,'ground'),cv=newCv(L.W,L.H);G=cv.getContext('2d');G.imageSmoothingEnabled=false;
  const rr=(a,b)=>a+R()*(b-a),ri2=(a,b)=>Math.floor(rr(a,b+1)),pk=a=>a[Math.floor(R()*a.length)];
  const WL=L.WALL,inside=(x,y)=>x>WL.x0&&x<WL.x1&&y>WL.y0&&y<WL.y1;
  // трава: всередині світліша, ззовні темніша
  for(let y=0;y<L.H;y+=4)for(let x=0;x<L.W;x+=4){const i=inside(x,y);fr(x,y,4,4,i?(R()<.22?'#58a048':'#5da64c'):(R()<.25?'#4a8a3e':'#4f9443'))}
  for(let i=0;i<1300;i++){const x=ri2(2,L.W-4),y=ri2(2,L.H-4);fr(x,y,1,2,'#47862f');fr(x+1,y+1,1,1,'#47862f')}
  // парк: світліший газон із м'яким краєм
  const P=L.PARK;for(let y=P.y0;y<P.y1;y+=4)for(let x=P.x0;x<P.x1;x+=4)if(R()<.97)fr(x,y,4,4,R()<.3?'#6bb858':'#68b355');
  // дороги: окантовка + пісок
  const strokes=[...L.ROADS];
  for(const[w,col]of[[4,'#9a7a48'],[0,'#cfae74']])for(const r of strokes){const rw=r[4]+w;
    const x0=Math.min(r[0],r[2]),x1=Math.max(r[0],r[2]),y0=Math.min(r[1],r[3]),y1=Math.max(r[1],r[3]);
    fr(x0-rw/2,y0-rw/2,x1-x0+rw,y1-y0+rw,col)}
  for(let i=0;i<500;i++){const r=L.ROADS[i%L.ROADS.length],x=rr(Math.min(r[0],r[2])-r[4]/2,Math.max(r[0],r[2])+r[4]/2),y=rr(Math.min(r[1],r[3])-r[4]/2,Math.max(r[1],r[3])+r[4]/2);fr(x,y,1,1,'#b9965e')}
  // стежки від дверей до вулиці
  for(const b of L.buildings){fr(b.door.x-2,b.door.y-1,5,14,'#cfae74');fr(b.door.x-3,b.door.y+3,1,10,'#9a7a48');fr(b.door.x+3,b.door.y+3,1,10,'#9a7a48')}
  // площа: бруківка
  const C=L.PLAZA;for(let y=-C.ry;y<=C.ry;y++)for(let x=-C.rx;x<=C.rx;x++){const nx=x/C.rx,ny=y/C.ry;if(nx*nx+ny*ny>1)continue;
    const edge=((x+200)%7===0)||((y+200+(((x+200)/7|0)&1)*2)%5===0);fr(C.x+x,C.y+y,1,1,nx*nx+ny*ny>.88?'#8d8a86':edge?'#8d8a86':'#b4afa7')}
  // ставок: берег, вода, латаття
  const Q=L.POND;ellipseFill(Q.x,Q.y+2,Q.rx+7,Q.ry+6,'#d9c58a');ellipseFill(Q.x,Q.y+1,Q.rx+3,Q.ry+3,'#b59f68');ellipseFill(Q.x,Q.y,Q.rx,Q.ry,'#3d86c6');ellipseFill(Q.x,Q.y-2,Q.rx-5,Q.ry-5,'#4f9fd8');
  for(let i=0;i<6;i++){const a=R()*6.28,d=R()*.7;const x=Q.x+Math.cos(a)*Q.rx*d,y=Q.y+Math.sin(a)*Q.ry*d;ellipseFill(x,y,4,2,'#5aa84c');fr(x+1,y-1,1,1,'#f4a6c0')}
  // поля: рядки грядок
  const F=L.FIELD;for(let y=F.y0;y<F.y1;y+=6){const crop=pk(['#8fc24a','#e0c15a','#5aa84c']);for(let x=F.x0;x<F.x1;x+=1){fr(x,y,1,3,'#7a5a3a');fr(x,y+3,1,2,(x>>1)&1?'#6a4a2e':'#7a5a3a');if(x%4===0)fr(x,y,2,2,crop)}}
  fr(F.x0-1,F.y0-2,F.x1-F.x0+2,1,'#a07848');
  // квіти
  for(let i=0;i<340;i++){const x=ri2(2,L.W-4),y=ri2(2,L.H-4);if(onRoadRect(L,x,y,3)||Math.hypot((x-C.x)/C.rx,(y-C.y)/C.ry)<1.1)continue;fr(x,y,2,2,pk(['#f2e56b','#f6f6f0','#e98ba8','#c08ae8','#7fb7ff']))}
  // північна, західна, східна стіни
  const st=ramp('#aaa39a');
  box(WL.x0-8,WL.y0-26,WL.x1-WL.x0+16,28,st);for(let x=WL.x0-8;x<WL.x1+8;x+=2)if(((x>>1)%4)<2)fr(x,WL.y0-30,2,4,st[1]);fr(WL.x0-8,WL.y0-14,WL.x1-WL.x0+16,1,st[2]);
  box(WL.x0-8,WL.y0,16,WL.y1-WL.y0,st);box(WL.x1-8,WL.y0,16,WL.y1-WL.y0,st);
  for(let y=WL.y0;y<WL.y1;y+=12){fr(WL.x0-8,y,16,1,st[2]);fr(WL.x1-8,y,16,1,st[2])}
  return cv;
}
function ellipseFill(cx,cy,rx,ry,col){cx=Math.round(cx);cy=Math.round(cy);for(let y=-ry;y<=ry;y++)for(let x=-rx;x<=rx;x++){const nx=x/(rx+.4),ny=y/(ry+.4);if(nx*nx+ny*ny<=1)fr(cx+x,cy+y,1,1,col)}}
function onRoadRect(L,x,y,pad){return L.ROADS.some(r=>x>=Math.min(r[0],r[2])-r[4]/2-pad&&x<=Math.max(r[0],r[2])+r[4]/2+pad&&y>=Math.min(r[1],r[3])-r[4]/2-pad&&y<=Math.max(r[1],r[3])+r[4]/2+pad)}
