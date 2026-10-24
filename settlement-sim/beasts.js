/* Звірі й монстри: вовк, слиз, кажан, павук, привид; реєстр RENDER. */
function wolf(c,a,fi){
  const v=c.v,bd=ramp(v.fur),bl=ramp(v.belly);
  let bob=0,lift=[0,0,0,0],hx=0,jaw=0,tail=0;
  const s=Math.sin(fi/4*6.2832);
  if(a==='idle'){bob=fi?1:0}
  if(a==='walk'){lift=[Math.max(0,s),Math.max(0,-s),Math.max(0,-s),Math.max(0,s)];bob=-(fi%2)}
  if(a==='run'){lift=[Math.max(0,s)*2,Math.max(0,-s)*2,Math.max(0,-s)*2,Math.max(0,s)*2];bob=-(fi%2)*2;tail=1}
  if(a==='attack'){hx=[-1,-1,3,1][fi];jaw=fi===2;bob=[1,1,0,0][fi]}
  if(a==='dead'){box(-6,-4,12,4,bd);box(4,-5,5,4,bd);fr(7,-4,1,1,OUT);return}
  const by=-6+bob;
  seg(-6,by,-9,by-3-tail,2,bd[1]);
  [[-5,lift[0]],[-2,lift[1]],[2,lift[2]],[4,lift[3]]].forEach(([x,l])=>{const h=Math.max(1,3-Math.round(l));box(x,-h,2,h,bd);});
  box(-6,by-4,12,5,bd);fr(-5,by,9,1,bl[1]);
  const hx0=5+hx;box(hx0,by-7,6,6,bd);box(hx0+5,by-4,3,3,bl);fr(hx0+7,by-4,1,1,OUT);
  fr(hx0+3,by-5,1,1,'#ff4a3a');fr(hx0,by-9,2,2,bd[1]);fr(hx0+3,by-9,2,2,bd[2]);
  if(jaw)fr(hx0+5,by-1,3,1,'#c0302a')}

function slime(c,a,fi){
  const v=c.v,rp=ramp(v.col);
  let w=v.w,h=v.h,lx=0,dy=0;
  if(a==='idle'){h+=fi?-1:0;w+=fi?1:0}
  if(a==='walk'||a==='run'){const k=[0,1,0,-1][fi];dy=k>0?-3:0;if(k<0){h-=2;w+=2}}
  if(a==='attack'){[[0,0],[1,-2],[-1,2],[0,0]][fi].forEach((q,i)=>{if(i===0)w+=q;else h+=q});lx=[0,-1,3,1][fi]}
  if(a==='dead'){ell(0,-2,w/2+1,2,rp);fr(-2,-3,1,1,OUT);fr(1,-3,1,1,OUT);return}
  G.translate(lx,dy);
  ell(0,-h/2,Math.floor(w/2),Math.ceil(h/2),rp);
  const ey=-Math.round(h*.55);
  fr(-3,ey,2,3,'#fff');fr(1,ey,2,3,'#fff');fr(-2,ey+1,1,2,OUT);fr(2,ey+1,1,2,OUT);
  if(v.crown){const g=ramp('#e9c24a');box(-3,-h-2,7,2,g);fr(-3,-h-3,1,1,g[1]);fr(0,-h-4,2,2,g[0]);fr(3,-h-3,1,1,g[1])}}

function bat(c,a,fi){
  const v=c.v,bd=ramp(v.col),wg=ramp(v.wing);
  let fly=-12,fx=0,mouth=0;const fl=fi%2;
  if(a==='attack'){fly=[-12,-14,-8,-10][fi];fx=[0,-1,3,1][fi];mouth=fi>=2}
  if(a==='dead'){box(-3,-3,6,3,bd);fr(-6,-2,3,1,wg[2]);fr(3,-2,3,1,wg[2]);return}
  G.translate(fx,fly);
  const wy=fl?2:-3;
  for(const sd of[-1,1]){seg(sd*2,0,sd*7,wy,2,wg[sd<0?2:1]);seg(sd*7,wy,sd*8,wy+3,1,wg[2])}
  box(-2,-2,4,5,bd);box(-2,-4,4,3,bd);fr(-2,-6,1,2,bd[1]);fr(1,-6,1,2,bd[1]);fr(-1,-3,1,1,'#ff4a3a');fr(1,-3,1,1,'#ff4a3a');
  if(mouth)fr(-1,0,2,1,OUT)}

function spider(c,a,fi){
  const v=c.v,bd=ramp(v.col),lg=ramp(sh(v.col,.9));
  let bob=0,att=0;const s=Math.sin(fi/4*6.2832);
  if(a==='idle')bob=fi?1:0;
  if(a==='attack'){att=[0,1,2,1][fi];bob=[0,1,-1,0][fi]}
  if(a==='dead'){box(-4,-3,8,3,bd);return}
  const by=-6+bob;
  for(const sd of[-1,1])for(let i=0;i<3;i++){
    const ph=(a==='walk'||a==='run')?Math.sin((fi/4)*6.2832+i*2+(sd<0?3.14:0)):0,l=Math.max(0,ph)*2,bx=-2+i*3;
    seg(bx,by,bx+sd*3,by-3-l-(i===2&&att?att:0),1,lg[1]);seg(bx+sd*3,by-3-l,bx+sd*5,-l,1,lg[2])}
  box(-5,by-3,7,5,bd);box(2,by-2,4,4,bd);fr(5,by-2,1,1,'#ff4a3a');fr(3,by-2,1,1,'#ff4a3a');fr(-3,by-1,2,1,'#c0302a')}

function ghost(c,a,fi){
  const v=c.v,rp=ramp(v.col);
  let fy=-3-(a==='idle'&&fi?1:0),fx=0,mouth=0;
  if(a==='walk'||a==='run')fy=-3-(fi%2);
  if(a==='attack'){fx=[0,-1,3,1][fi];mouth=fi>=1}
  if(a==='dead'){box(-4,-2,8,2,rp);return}
  G.translate(fx,fy);
  ell(0,-12,5,5,rp);box(-5,-12,11,8,rp);
  for(let x=-5;x<=5;x++){fr(x,-4,1,((x+(fi%2?1:0))&1)?2:1,rp[1])}
  fr(-3,-13,2,3,OUT);fr(1,-13,2,3,OUT);
  if(mouth)fr(-1,-8,3,2,OUT);else fr(-1,-8,3,1,OUT)}

const RENDER={biped,wolf,slime,bat,spider,ghost};
