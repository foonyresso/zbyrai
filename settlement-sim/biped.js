/* Малювання людини/гуманоїда (біпед): тіло, одяг, голова, зброя. */
function biped(c,a,fi){
  const v=c.v,P=poseOf(a,fi),sk=v.skinR,bd=ramp(v.outfit),pn=ramp(v.pants),bt=ramp(v.boots);
  const BW=v.bodyW,BH=v.bodyH,HW=v.headW,HH=v.headH,LG=3;
  G.save();
  if(P.lying){G.translate(-8,-4);G.rotate(Math.PI/2)}else G.translate(P.lunge,P.jy);
  const hip=-LG+P.bob,shy=hip-BH,hy0=shy-HH+1+P.hdy,hx0=-HW/2+P.hdx,hcx=hx0+HW/2;
  if(v.cape)box(-BW/2-1,shy+1,BW+2,BH+LG-1,ramp(v.cape));
  if(v.quiver){box(-BW/2-2,shy-2,2,6,ramp('#6b4a2a'));fr(-BW/2-2,shy-3,1,1,'#f2ead0');fr(-BW/2-1,shy-3,1,1,'#c0392b')}
  if(v.hairStyle==='long')box(hx0-1,hy0+3,HW+2,HH+1,ramp(v.hair));
  // ліва рука
  box(-BW/2-1,shy+1+(P.armL<0?-1:0),2,3,v.bare?sk:bd);
  // ноги
  [[-3,P.lL],[1,P.lR]].forEach(([lx,lift])=>{const h=Math.max(1,LG-Math.round(lift));box(lx,hip,2,h,v.skelLeg?sk:pn);box(lx,hip+h-1,2,1,bt)});
  if(v.robe){box(-BW/2-1,shy,BW+2,BH+LG-1,bd);fr(-BW/2-1,hip+LG-2,BW+2,1,ramp(v.trim||'#e9c24a')[1]);if(v.sash)fr(-BW/2-1,hip-1,BW+2,1,ramp(v.sash)[1])}
  else{box(-BW/2,shy,BW,BH,v.bare?sk:bd);
    if(v.skeleton){fr(-BW/2+1,shy+1,BW-2,1,sk[2]);fr(-BW/2+1,shy+3,BW-2,1,sk[2])}
    if(v.tabard)fr(-1,shy+1,2,BH-1,ramp(v.tabard)[1]);
    if(v.straps)fr(-BW/2,shy,2,BH,'#5a3a22');
    if(v.leather)fr(-BW/2,hip-1,BW,1,'#5a3a22')}
  // голова
  if(v.ears==='gob'){box(hx0-3,hy0+2,3,2,sk);fr(hx0-4,hy0+1,1,2,sk[1]);box(hx0+HW,hy0+2,3,2,sk);fr(hx0+HW+3,hy0+1,1,2,sk[1])}
  if(v.ears==='orc'){fr(hx0-1,hy0+3,1,2,sk[2]);fr(hx0+HW,hy0+3,1,2,sk[2])}
  box(hx0,hy0,HW,HH,sk);
  const ey=hy0+Math.floor(HH/2)-1,eL=hcx-3+1,eR=hcx+1+1,dk=OUT;
  if(v.skeleton){fr(eL-1,ey,2,2,dk);fr(eR,ey,2,2,dk);fr(hx0+2,hy0+HH-2,HW-4,1,sk[2]);if(v.glowEye){fr(eL-1,ey,1,1,'#ff5a3a');fr(eR,ey,1,1,'#ff5a3a')}}
  else if(v.type==='goblin'){fr(eL,ey,2,2,'#f2e46a');fr(eR,ey,2,2,'#f2e46a');fr(eL+1,ey,1,2,dk);fr(eR+1,ey,1,2,dk);fr(hcx-1,hy0+HH-2,3,1,dk)}
  else if(v.type==='orc'){fr(eL,ey,2,1,'#f2e46a');fr(eR,ey,2,1,'#f2e46a');fr(hx0+2,hy0+HH-2,1,1,'#f1ece0');fr(hx0+HW-3,hy0+HH-2,1,1,'#f1ece0');fr(hx0+3,hy0+HH-1,HW-6,1,dk)}
  else{fr(eL,ey,1,2,dk);fr(eR,ey,1,2,dk)}
  if(v.hair&&v.type==='human'){const hr=ramp(v.hair);if(v.hairStyle!=='bald'){box(hx0,hy0,HW,2,hr);fr(hx0,hy0+2,1,2,hr[2]);fr(hx0+HW-1,hy0+2,1,1,hr[2])}
    if(v.hairStyle==='spiky'){fr(hx0+1,hy0-2,2,2,hr[1]);fr(hcx-1,hy0-2,2,2,hr[1]);fr(hx0+HW-3,hy0-2,2,2,hr[1])}
    if(v.beard)box(hx0+2,hy0+HH-2,HW-3,2,hr);
    if(v.warpaint)fr(eL-1,ey+2,HW-4,1,'#c0302a')}
  hatDraw(v,hx0,hy0,HW);
  // права рука зі зброєю
  const sx=BW/2-1,sy=shy+1,rh=lmb(sx,sy,Math.sin(P.aa),Math.cos(P.aa),3,2,v.bare?sk:bd);
  if(v.off==='shield'){const hx=-BW/2-2;ell(hx,shy+3,3,3,ramp(v.shieldC));fr(hx,shy+2,1,1,'#fff')}
  if(v.off==='dagger'){const sv=v.weapon;v.weapon='dagger';weaponDraw(v,Object.assign({},P,{wa:P.wa-.5}),-BW/2-1,shy+4);v.weapon=sv}
  fr(rh.x-.5,rh.y-.5,2,2,sk[1]);
  weaponDraw(v,P,Math.round(rh.x),Math.round(rh.y));
  G.restore()}
