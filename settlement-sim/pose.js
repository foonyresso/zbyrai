/* Пози людини за анімацією та кадром (ходьба, удар, постріл, чари, жести). */
function poseOf(a,fi){
  const n=ANIM[a][0],u=fi/n,s=Math.sin(u*6.2832),P={bob:0,jy:0,lL:0,lR:0,aa:.2,wa:2.9,hdx:0,hdy:0,lunge:0,lying:false,pull:-1,glow:0,armL:0};
  switch(a){
    case'idle':P.bob=fi?1:0;break;
    case'walk':P.lL=Math.max(0,s);P.lR=Math.max(0,-s);P.bob=-(fi%2);P.armL=s>0?1:s<0?-1:0;break;
    case'run':P.lL=Math.max(0,s)*2;P.lR=Math.max(0,-s)*2;P.bob=-(fi%2)*1;P.aa=.9;P.wa=2.2;P.armL=s>0?1:s<0?-1:0;break;
    case'attack':{const T=[[3.0,3.1,0],[2.3,2.4,0],[1.3,1.2,2],[.8,.6,1]][fi];P.aa=T[0];P.wa=T[1];P.lunge=T[2];break}
    case'shoot':P.aa=1.5;P.pull=[1,2,3,0][fi];P.lunge=fi===3?-1:0;break;
    case'cast':P.aa=[2.4,2.8,2.8,2.4][fi];P.glow=fi>0&&fi<3?1:0;P.bob=fi%2;break;
    case'wave':P.aa=fi?2.2:2.9;break;
    case'jump':P.jy=[-1,-6,-4,0][fi];P.aa=(fi===0||fi===3)?.3:2.6;P.armL=(fi===0||fi===3)?0:-2;break;
    case'dance':P.aa=fi?2.7:.3;P.armL=fi?0:-2;P.lL=fi?1:0;P.lR=fi?0:1;P.jy=fi?-1:0;P.hdx=fi?1:-1;break;
    case'look':P.hdx=fi?1:0;break;
    case'work':P.aa=fi?2.6:1.2;P.wa=fi?2.2:3.0;P.bob=fi?1:0;P.lunge=fi?1:0;break;
    case'dead':P.lying=true;break;
  }
  return P}
