/* Піксельні примітиви: малювання блоків із 3 тонами (ramp), автоматичний темний контур, швидкі випадкові. Загальні глобали для спрайтів. */
const rnd=(a,b)=>a+Math.random()*(b-a),ri=(a,b)=>Math.floor(rnd(a,b+1)),pick=a=>a[Math.floor(Math.random()*a.length)];
function wpick(o){let s=0;for(const k in o)s+=o[k];let r=Math.random()*s;for(const k in o){r-=o[k];if(r<=0)return k}}
const hx2=h=>[parseInt(h.slice(1,3),16),parseInt(h.slice(3,5),16),parseInt(h.slice(5,7),16)];
const cl=v=>Math.max(0,Math.min(255,Math.round(v)));
const rgb=(r,g,b)=>'#'+[r,g,b].map(v=>cl(v).toString(16).padStart(2,'0')).join('');
function lt(h,k){const[r,g,b]=hx2(h);return rgb(r+(255-r)*k,g+(255-g)*k*.98,b+(255-b)*k*.9)}
function sh(h,f){const[r,g,b]=hx2(h);return rgb(r*f*.92,g*f*.9,b*f*1.03)}
function ramp(h){const d=sh(h,.68);return[lt(h,.3),h,d,d]}
const OUT='#1d1424';
let G;
function fr(x,y,w,h,c){G.fillStyle=c;G.fillRect(Math.round(x),Math.round(y),w,h)}
function box(x,y,w,h,rp){x=Math.round(x);y=Math.round(y);fr(x,y,w,h,rp[1]);
  if(w>=3&&h>=3){fr(x,y,w,1,rp[0]);fr(x,y,1,h,rp[0]);fr(x+w-1,y+1,1,h-1,rp[2]);fr(x+1,y+h-1,w-1,1,rp[2]);fr(x+w-1,y+h-1,1,1,rp[3])}
  else if(w>=2&&h>=2)fr(x+w-1,y,1,h,rp[2])}
function rbox(x,y,w,h,rp){x=Math.round(x);y=Math.round(y);
  fr(x+1,y,w-2,h,rp[1]);fr(x,y+1,w,h-2,rp[1]);
  fr(x+1,y,w-2,1,rp[0]);fr(x,y+1,1,h-2,rp[0]);fr(x+w-1,y+1,1,h-2,rp[2]);fr(x+1,y+h-1,w-2,1,rp[2]);fr(x+w-2,y+h-1,1,1,rp[3]);fr(x+w-1,y+h-2,1,1,rp[3])}
function ell(cx,cy,rx,ry,rp){cx=Math.round(cx);cy=Math.round(cy);
  for(let y=-ry;y<=ry;y++)for(let x=-rx;x<=rx;x++){const nx=x/(rx+.4),ny=y/(ry+.4);if(nx*nx+ny*ny>1)continue;
    const l=-(nx*.55+ny*.85);fr(cx+x,cy+y,1,1,l>.55?rp[0]:l>-.12?rp[1]:l>-.62?rp[2]:rp[3])}}
function seg(x0,y0,x1,y1,w,c){const n=Math.max(Math.abs(x1-x0),Math.abs(y1-y0),1);for(let i=0;i<=n;i++)fr(x0+(x1-x0)*i/n-(w-1)/2,y0+(y1-y0)*i/n-(w-1)/2,w,w,c)}
function lmb(x,y,dx,dy,len,w,rp){const ex=x+dx*len,ey=y+dy*len;seg(x,y,ex,ey,w,rp[1]);
  seg(x+w-1,y,ex+w-1,ey,1,rp[2]);seg(x,y,ex,ey,1,rp[0]);return{x:ex,y:ey}}
function outline(src){
  const w=src.width,h=src.height,sd=src.getContext('2d').getImageData(0,0,w,h).data;
  const out=document.createElement('canvas');out.width=w;out.height=h;const o=out.getContext('2d');
  const id=o.createImageData(w,h),d=id.data,[r,g,b]=hx2(OUT);
  const op=(x,y)=>x>=0&&y>=0&&x<w&&y<h&&sd[(y*w+x)*4+3]>100;
  for(let y=0;y<h;y++)for(let x=0;x<w;x++){const i=(y*w+x)*4;
    if(!op(x,y)&&(op(x-1,y)||op(x+1,y)||op(x,y-1)||op(x,y+1))){d[i]=r;d[i+1]=g;d[i+2]=b;d[i+3]=255}}
  o.putImageData(id,0,0);o.drawImage(src,0,0);return out}
function newCv(w,h){const c=document.createElement('canvas');c.width=w;c.height=h;const g=c.getContext('2d');g.imageSmoothingEnabled=false;return c}
