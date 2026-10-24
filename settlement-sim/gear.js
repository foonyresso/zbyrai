/* Головні убори та зброя/знаряддя піксельних людей. */
function hatDraw(v,hx0,hy0,HW){
  const hcx=hx0+HW/2,m=ramp(v.hatC||'#8a8f99'),st=ramp(v.steel||'#9aa6b8'),gold=ramp('#e9c24a'),bone=ramp('#efe6cf');
  switch(v.hat){
    case'helm':box(hx0-1,hy0-2,HW+2,4,st);box(hx0-1,hy0+2,2,3,st);box(hx0+HW-1,hy0+2,2,3,st);fr(hcx-1,hy0-4,2,3,m[1]);fr(hcx-2,hy0-3,1,2,m[2]);break;
    case'wizard':box(hx0-2,hy0-1,HW+4,2,m);box(hx0+1,hy0-4,HW-2,3,m);box(hx0+3,hy0-7,HW-6,3,m);fr(hcx+1,hy0-8,2,1,m[1]);fr(hx0+1,hy0-2,HW-2,1,gold[1]);break;
    case'hood':box(hx0-1,hy0-2,HW+2,4,m);box(hx0-1,hy0+2,2,4,m);fr(hx0-2,hy0-1,1,2,m[2]);if(v.feather)fr(hcx+2,hy0-5,1,3,'#f2ead0');break;
    case'cleric':box(hx0-1,hy0-2,HW+2,4,m);fr(hcx,hy0-1,1,3,gold[1]);fr(hcx-1,hy0,3,1,gold[1]);break;
    case'horned':box(hx0-1,hy0-2,HW+2,4,st);box(hx0-3,hy0-4,2,4,bone);box(hx0+HW+1,hy0-4,2,4,bone);fr(hx0-3,hy0-5,1,1,bone[0]);fr(hx0+HW+2,hy0-5,1,1,bone[0]);break;
    case'mask':box(hx0-1,hy0-2,HW+2,4,m);box(hx0-1,hy0+2,2,4,m);box(hx0+1,hy0+HW/2-1,HW-2,3,m);fr(hx0-3,hy0+1,2,1,'#c0392b');break;
    case'gcap':box(hx0,hy0-2,HW,3,m);fr(hx0-3,hy0-3,3,2,m[1]);fr(hx0-4,hy0-1,2,2,m[2]);break;
    case'crown':box(hx0+1,hy0-3,HW-2,3,gold);fr(hx0+1,hy0-5,2,2,gold[1]);fr(hcx-1,hy0-5,2,2,gold[0]);fr(hx0+HW-3,hy0-5,2,2,gold[1]);break;
    case'rust':box(hx0-1,hy0-2,HW+2,4,ramp('#8a6a4a'));break;
    case'band':box(hx0-1,hy0,HW+2,2,m);fr(hx0-3,hy0+1,2,1,m[1]);fr(hx0-3,hy0+2,1,2,m[2]);break;
  }}
function weaponDraw(v,P,hx,hy){
  const wa=P.wa,dx=Math.sin(wa),dy=Math.cos(wa),px=dy,py=-dx,wood=ramp('#7a5230'),steel=ramp(v.metal||'#cfd6df'),gold=ramp('#e9c24a');
  switch(v.weapon){
    case'sword':seg(hx,hy,hx+dx*8,hy+dy*8,2,steel[1]);seg(hx+dx*2,hy+dy*2,hx+dx*8,hy+dy*8,1,steel[0]);seg(hx+dx*2-px*2,hy+dy*2-py*2,hx+dx*2+px*2,hy+dy*2+py*2,1,gold[1]);break;
    case'axe':seg(hx,hy,hx+dx*8,hy+dy*8,1,wood[1]);{const tx=hx+dx*7,ty=hy+dy*7;seg(tx-px*2,ty-py*2,tx+px*2,ty+py*2,3,steel[1]);seg(tx+px*2,ty+py*2,tx+px*2,ty+py*2,1,steel[0])}break;
    case'axe2':seg(hx,hy,hx+dx*9,hy+dy*9,1,wood[1]);{const tx=hx+dx*8,ty=hy+dy*8;seg(tx-px*3,ty-py*3,tx+px*3,ty+py*3,3,steel[1]);seg(tx-px*3,ty-py*3,tx+px*3,ty+py*3,1,steel[0])}break;
    case'club':seg(hx,hy,hx+dx*5,hy+dy*5,1,wood[1]);fr(hx+dx*6-1,hy+dy*6-1,3,3,wood[1]);fr(hx+dx*6-1,hy+dy*6-1,1,1,wood[0]);break;
    case'spear':seg(hx-dx*2,hy-dy*2,hx+dx*12,hy+dy*12,1,wood[1]);seg(hx+dx*11,hy+dy*11,hx+dx*14,hy+dy*14,2,steel[1]);break;
    case'dagger':seg(hx,hy,hx+dx*4,hy+dy*4,1,steel[0]);break;
    case'staff':{seg(hx+1,hy+3,hx+1,hy-11,1,wood[1]);const gy=hy-12;
      if(v.cross){fr(hx-1,gy,5,1,gold[1]);fr(hx+1,gy-2,1,5,gold[1])}else{box(hx,gy-1,3,3,ramp(v.orb));fr(hx,gy-1,1,1,'#fff')}
      if(P.glow){const gc=v.cross?'#b8ffc9':lt(v.orb,.55);for(const[ox,oy]of[[-2,-1],[4,-1],[1,-4],[1,3]])fr(hx+ox,gy+oy,1,1,gc)}break}
    case'bow':{const wd=ramp('#8a5a2b');for(let i=-5;i<=5;i++)fr(hx+2+Math.round(2-2*(i/5)*(i/5)),hy+i,1,1,wd[1]);
      const pl=P.pull<0?0:P.pull;for(let i=-5;i<=5;i++)fr(hx+2-Math.round(pl*(1-Math.abs(i)/5)),hy+i,1,1,'#efe6d0');
      if(P.pull>0){seg(hx+2-pl,hy,hx+9,hy,1,'#d9c8a0');fr(hx+9,hy,1,1,'#cfd6df')}break}
  }}
