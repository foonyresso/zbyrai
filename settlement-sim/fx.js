/* Ефекти: частинки, піксельні бульбашки-емоції над головою, «zZZ» над будинком, снаряди (стріли й чари). */
const EMO={
  talk:['.......','.#.#.#.','.......'],
  excl:['..#..','..#..','..#..','.....','..#..'],
  ques:['.###.','#...#','...#.','..#..','.....','..#..'],
  heart:['.#.#.','#####','#####','.###.','..#..'],
  note:['..###','..#.#','..#..','.##..','.##..'],
  smile:['.....','#...#','.....','#...#','.###.'],
  wave:['#.#.#','#.#.#','#####','.###.','..#..'],
  zzz:['####.','..#..','.#...','####.'],
  food:['.###.','#####','#.#.#','.###.'],
  sword:['....#','...#.','#.#..','.#...','#.#..'],
};
const EMO_COL={talk:'#555',excl:'#d23a2a',ques:'#2e6fb7',heart:'#e0455a',note:'#7a45a8',smile:'#d98a2b',wave:'#d98a2b',zzz:'#2e6fb7',food:'#a8743a',sword:'#d23a2a'};
function emoteOf(c,type){c.emote={type,t:0}}
function drawEmote(ctx,c,x,y){
  const e=c.emote;if(!e)return;const pat=EMO[e.type];if(!pat)return;
  const w=7+2,h=pat.length+4,bx=x-Math.floor(w/2),by=y-h-2-Math.round(Math.min(e.t,.3)*6);
  ctx.globalAlpha=Math.max(0,Math.min(1,(1.8-e.t)*2));
  ctx.fillStyle='#1d1424';ctx.fillRect(bx-1,by-1,w+2,h+2);ctx.fillStyle='#fffdf4';ctx.fillRect(bx,by,w,h);
  ctx.fillStyle='#1d1424';ctx.fillRect(x-1,by+h+1,3,1);ctx.fillRect(x,by+h+2,1,1);ctx.fillStyle='#fffdf4';ctx.fillRect(x-1,by+h,3,1);
  ctx.fillStyle=EMO_COL[e.type];
  const ox=bx+Math.floor((w-pat[0].length)/2),oy=by+2;
  for(let r=0;r<pat.length;r++)for(let q=0;q<pat[r].length;q++)if(pat[r][q]==='#')ctx.fillRect(ox+q,oy+r,1,1);
  ctx.globalAlpha=1}
// «zZZ» над будинком: дві літери «z» різного розміру, що пливуть угору
const ZBIG=[[1,1,1,1],[0,0,1,0],[0,1,0,0],[1,1,1,1]],ZSM=[[1,1,1],[0,1,0],[1,1,1]];
function drawZs(ctx,x,y,t){
  const zp=(px,py,pat,col)=>{ctx.fillStyle=col;for(let r=0;r<pat.length;r++)for(let q=0;q<pat[r].length;q++)if(pat[r][q])ctx.fillRect(px+q,py+r,1,1)};
  for(let i=0;i<3;i++){const k=((t*.5+i/3)%1),a=Math.sin(k*3.14),pat=i===1?ZBIG:ZSM,px=Math.round(x+k*8+i*2),py=Math.round(y-k*14-i*4);
    ctx.globalAlpha=Math.max(0,a);zp(px+1,py+1,pat,'#1e2b4a');zp(px,py,pat,'#fff')}
  ctx.globalAlpha=1}
function ptc(x,y,n,col,spd,life,vy0,kind){for(let i=0;i<n;i++){const a=rnd(0,6.28),v=rnd(.2,1)*spd*30;S.parts.push({x,y,vx:Math.cos(a)*v,vy:Math.sin(a)*v+(vy0||0),life,max:life,col,kind})}}
function updParts(dt){for(let i=S.parts.length-1;i>=0;i--){const p=S.parts[i];p.life-=dt;p.x+=p.vx*dt;p.y+=p.vy*dt;if(p.life<=0)S.parts.splice(i,1)}}
function drawParts(ctx){for(const p of S.parts){ctx.globalAlpha=Math.max(0,p.life/p.max);ctx.fillStyle=p.col;
  if(p.kind==='plus'){ctx.fillRect(Math.round(p.x)-1,Math.round(p.y),3,1);ctx.fillRect(Math.round(p.x),Math.round(p.y)-1,1,3)}else{const s=p.kind==='big'?2:1;ctx.fillRect(Math.round(p.x),Math.round(p.y),s,s)}}ctx.globalAlpha=1}
function updEmotes(dt){for(const c of S.citizens)if(c.emote){c.emote.t+=dt;if(c.emote.t>1.8)c.emote=null}}
