const canvas=document.getElementById("game"),ctx=canvas.getContext("2d");
const scoreEl=document.getElementById("score"),outsEl=document.getElementById("outs"),message=document.getElementById("message"),streakEl=document.getElementById("streak"),bestEl=document.getElementById("best"),gamesEl=document.getElementById("games"),xpEl=document.getElementById("xp"),xpbar=document.getElementById("xpbar"),levelEl=document.getElementById("level"),missionEl=document.getElementById("mission"),speedEl=document.getElementById("speed"),inningEl=document.getElementById("inning");
const hitBtn=document.getElementById("hit"),runBtn=document.getElementById("run"),backBtn=document.getElementById("back");

let state="menu",score=0,outs=0,round=1,streak=0,best=0,games=0,xp=0,last=0;
let pitch=0,hitQuality=0,shake=0,flash=0,celebrate=0,camX=0,camY=0,camZoom=1,runnerBase=0,runnerT=0,fieldTarget={x:450,y:250},fieldRun=0;
let ball={x:0,y:0,z:0,v:0,active:false,trail:[]};
let batter={swing:0,follow:0},pitcher={wind:0},particles=[],audio=null;
const W=900,H=560,HOME={x:450,y:485},BASES=[{x:735,y:325},{x:450,y:125},{x:165,y:325}];

function ui(){
 scoreEl.textContent=score; outsEl.textContent=outs+" OUT"; streakEl.textContent=streak; bestEl.textContent=best;
 gamesEl.textContent=games; missionEl.textContent=Math.min(score,5)+"/5"; inningEl.textContent=round+"ª ENTRADA";
 xpEl.textContent=(xp%100)+"/100 XP";xpbar.style.width=(xp%100)+"%";levelEl.textContent=Math.floor(xp/100)+1;
 speedEl.textContent=ball.v?Math.round(ball.v*22)+" km/h":"--";
}
function beep(f,d=.08){
 try{audio=audio||new(window.AudioContext||window.webkitAudioContext)();let o=audio.createOscillator(),g=audio.createGain();
 o.type="square";o.frequency.value=f;g.gain.value=.025;o.connect(g);g.connect(audio.destination);o.start();g.gain.exponentialRampToValueAtTime(.001,audio.currentTime+d);o.stop(audio.currentTime+d)}catch(e){}
}
function burst(x,y,n=24,kind="spark"){
 for(let i=0;i<n;i++){let a=Math.random()*Math.PI*2,s=1+Math.random()*7;
 particles.push({x,y,vx:Math.cos(a)*s,vy:Math.sin(a)*s,life:30+Math.random()*45,size:2+Math.random()*5,kind})}
}
function reset(){
 state="pitching";score=0;outs=0;round=1;streak=0;runnerBase=0;particles=[];games++;startPitch();
 message.textContent="🏟️ ¡PARTIDO! El pitcher prepara el lanzamiento…";beep(520,.08);ui();
}
function startPitch(){
 state="pitching";pitch=0;pitcher.wind=0;batter.swing=0;batter.follow=0;hitQuality=0;
 ball={x:450,y:0,z:1,v:3.4+Math.random()*1.8,active:true,trail:[]};
 message.textContent="⚾ EL PITCHER ESTÁ LANZANDO…";ui();
}
function swing(){
 if(state==="menu"||state==="result"){reset();return}
 if(state!=="pitching")return;
 const timing=Math.abs(pitch-.78);
 const good=timing<.105;
 batter.swing=1;ball.active=false;
 if(good){
   hitQuality=timing<.045?3:timing<.075?2:1;
   const type=hitQuality===3?"HOME RUN":hitQuality===2?"DOBLE":"SENCILLO";
   state="hitFly";pitch=1;shake=8;flash=.8;streak++;best=Math.max(best,streak);
   const pts=hitQuality===3?5:hitQuality===2?3:2;score+=pts;xp+=12;
   message.textContent=hitQuality===3?"🔥 ¡HOME RUN! ¡SE FUE POR ENCIMA!":"💥 ¡"+type+"! LA PELOTA SALE DISPARADA";
   beep(hitQuality===3?980:760,.14);burst(450,350,35,"hit");
 }else{
   outs++;streak=0;xp+=3;state=outs>=3?"result":"out";
   message.textContent=outs>=3?"🏁 ¡TRES OUT! FIN DEL PARTIDO":"❌ ¡OUT! EL PITCH TE ENGAÑÓ";
   beep(180,.13);flash=.35;
   if(state==="out")setTimeout(()=>{if(state==="out")startPitch()},900);
 }
 ui();
}
function run(){
 if(state!=="running")return;
 state="runningBase";runnerT=0;message.textContent="🏃 ¡CORRE! EL CORREDOR VA A 1B…";beep(900,.08);
}
function finishBase(){
 runnerBase=1;score+=1;xp+=8;celebrate=1;state="celebrate";burst(BASES[0].x,BASES[0].y,34,"star");message.textContent="🏃 ¡LLEGASTE A 1B!";ui();
}
function back(){
 if(state!=="returning")return;
 state="celebrate";runnerBase=0;score+=1;xp+=10;celebrate=1;burst(HOME.x,HOME.y,38,"star");
 message.textContent="🏠 ¡CARRERA! ¡REGRESASTE A HOME!";beep(1120,.1);ui();
}
hitBtn.onclick=swing;runBtn.onclick=run;backBtn.onclick=back;
canvas.addEventListener("pointerdown",e=>{if(e.pointerType==="touch")swing()});

function rr(x,y,w,h,r){
 ctx.beginPath();ctx.roundRect(x,y,w,h,r);ctx.fill();
}
function plate(x,y,s=1){
 ctx.save();ctx.translate(x,y);ctx.rotate(.785);ctx.fillStyle="#f7faf7";ctx.shadowBlur=7;ctx.shadowColor="#0008";ctx.fillRect(-15*s,-15*s,30*s,30*s);ctx.restore();
}
function shadow(x,y,rx,ry){
 ctx.fillStyle="#0005";ctx.beginPath();ctx.ellipse(x,y,rx,ry,0,0,Math.PI*2);ctx.fill();
}
function player(x,y,body,accent,scale=1,pose=0){
 ctx.save();ctx.translate(x,y);ctx.scale(scale,scale);shadow(0,27,28,8);
 ctx.fillStyle="#d99d6a";ctx.beginPath();ctx.arc(0,-38,16,0,Math.PI*2);ctx.fill();
 ctx.fillStyle=body;rr(-17,-20,34,43,8);ctx.fillStyle=accent;ctx.fillRect(-17,-5,34,7);
 ctx.fillStyle=body;ctx.save();ctx.translate(-11,20);ctx.rotate(-.12-pose*.2);ctx.fillRect(-7,0,12,31);ctx.restore();
 ctx.save();ctx.translate(11,20);ctx.rotate(.12+pose*.2);ctx.fillRect(-5,0,12,31);ctx.restore();
 ctx.strokeStyle="#d99d6a";ctx.lineWidth=8;ctx.lineCap="round";ctx.beginPath();
 ctx.moveTo(-14,2);ctx.lineTo(-25-pose*5,15);ctx.moveTo(14,2);ctx.lineTo(25+pose*5,15);ctx.stroke();
 ctx.fillStyle=accent;ctx.beginPath();ctx.arc(0,-54,17,Math.PI,Math.PI*2);ctx.fill();
 ctx.restore();
}
function crowd(){
 ctx.fillStyle="#15231c";ctx.fillRect(0,0,W,102);
 for(let i=0;i<34;i++){
   const x=14+i*27,y=49+(i%4)*7;
   ctx.fillStyle=i%5===0?"#e2bd69":i%2?"#809087":"#c8d2cc";
   ctx.beginPath();ctx.arc(x,y,5+(i%3),0,Math.PI*2);ctx.fill();
 }
 ctx.fillStyle="#263a31";ctx.fillRect(0,86,W,17);
 ctx.fillStyle="#b38b55";ctx.fillRect(0,96,W,7);
}
function drawField(){
 ctx.fillStyle="#0a6334";ctx.fillRect(0,0,W,H);
 for(let i=0;i<14;i++){ctx.fillStyle=i%2?"#0d6d39":"#0a6334";ctx.fillRect(0,103+i*34,W,34)}
 crowd();
 ctx.save();ctx.translate(camX,camY);ctx.scale(camZoom,camZoom);
 // huge perspective infield
 ctx.fillStyle="#c68e55";ctx.beginPath();ctx.moveTo(450,91);ctx.lineTo(850,326);ctx.lineTo(690,560);ctx.lineTo(210,560);ctx.lineTo(50,326);ctx.closePath();ctx.fill();
 // outfield depth bands
 ctx.strokeStyle="#ffffff22";ctx.lineWidth=18;for(let r=1;r<5;r++){ctx.beginPath();ctx.ellipse(450,125,95+r*55,42+r*35,0,0,Math.PI*2);ctx.stroke()}
 // foul lines
 ctx.strokeStyle="#fff";ctx.globalAlpha=.72;ctx.lineWidth=4;ctx.beginPath();ctx.moveTo(450,92);ctx.lineTo(65,552);ctx.moveTo(450,92);ctx.lineTo(835,552);ctx.stroke();ctx.globalAlpha=1;
 // pitcher's mound
 ctx.fillStyle="#b77f49";ctx.beginPath();ctx.ellipse(450,185,64,29,0,0,Math.PI*2);ctx.fill();
 // bases
 plate(450,490,1.15);plate(740,325,.9);plate(450,125,.82);plate(160,325,.9);
 // fielders
 player(450,171,"#e7c84d","#493b0d",.9,pitcher.wind);
 player(735,300,"#e7c84d","#493b0d",.75,0);
 player(165,300,"#e7c84d","#493b0d",.75,0);
 player(650,238,"#e7c84d","#493b0d",.68,0);
 player(255,238,"#e7c84d","#493b0d",.68,0);
 // batter
 const s=batter.swing;
 player(450,420,"#edf3ef","#173e29",1,s);
 // arms and bat
 ctx.strokeStyle="#d99d6a";ctx.lineWidth=9;ctx.lineCap="round";ctx.beginPath();
 ctx.moveTo(435,399);ctx.lineTo(410-s*12,386-s*18);ctx.moveTo(465,399);ctx.lineTo(487+s*12,386-s*18);ctx.stroke();
 ctx.save();ctx.translate(447,397);ctx.rotate(-1.02+s*1.65);ctx.fillStyle="#87582e";ctx.fillRect(-7,-105,14,113);ctx.fillStyle="#e0b36b";ctx.fillRect(-11,-112,22,12);ctx.restore();
 // runner on base
 if(runnerBase){const b=runnerBase===1?BASES[0]:HOME;player(b.x,b.y-10,"#f0f4f1","#173e29",.45,0)}
 if(state==="running"||state==="runningBase"){
   const t=state==="runningBase"?runnerT:runnerT;
   const x=HOME.x+(BASES[0].x-HOME.x)*Math.min(1,t);
   const y=HOME.y+(BASES[0].y-HOME.y)*Math.min(1,t);
   player(x,y-12,"#f0f4f1","#173e29",.46,Math.sin(performance.now()/90)*.5);
 }
 // contact zone
 if(state==="pitching"){ctx.strokeStyle="#ffffff66";ctx.lineWidth=2;ctx.setLineDash([7,7]);ctx.strokeRect(374,325,152,86);ctx.setLineDash([])}
 ctx.restore();
}
function ballScreen(){
 if(!ball.active&&state!=="hitFly")return;
 let x=ball.x,y=ball.y,r=ball.r||8;
 ctx.save();ctx.shadowBlur=18;ctx.shadowColor="#fff";ctx.fillStyle="#fff";ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);ctx.fill();
 ctx.shadowBlur=0;ctx.strokeStyle="#d95c54";ctx.lineWidth=1.5;ctx.beginPath();ctx.arc(x,y,r*.65,-.8,.8);ctx.stroke();ctx.restore();
 if(ball.trail.length){
   ctx.save();for(let i=0;i<ball.trail.length;i++){let p=ball.trail[i];ctx.globalAlpha=(i/ball.trail.length)*.28;ctx.fillStyle="#fff";ctx.beginPath();ctx.arc(p.x,p.y,Math.max(2,p.r*.55),0,Math.PI*2);ctx.fill()}ctx.restore();
 }
}
function banners(){
 ctx.save();ctx.textAlign="center";
 if(state==="pitching"){ctx.fillStyle="#ffffffcc";ctx.font="900 16px system-ui";ctx.fillText("PITCHER • LANZAMIENTO",450,35)}
 if(state==="hitFly"){
   ctx.fillStyle="#fff";ctx.font="1000 31px system-ui";ctx.fillText(hitQuality===3?"🔥 HOME RUN!":"💥 BATAZO!",450,65);
   ctx.font="800 14px system-ui";ctx.fillStyle="#d9eadf";ctx.fillText("CAMARA SIGUIENDO LA PELOTA",450,88);
 }
 if(state==="running" && hitQuality!==3){
   // ball is fielded while the runner advances; a visible fielder chases the hit.
   fieldRun=Math.min(1,fieldRun+dt/1200);
   fieldTarget={x:hitQuality===2?700:610,y:hitQuality===2?270:240};
   if(fieldRun>=1){state="running";message.textContent="⚾ ¡FILDEADOR ENTRA EN JUGADA! TOCA CORRER";ui();}
 }
 if(state==="celebrate"){ctx.fillStyle="#fff";ctx.font="1000 31px system-ui";ctx.fillText("🏆 ¡CELEBRACIÓN!",450,68)}
 ctx.restore();
}
function overlay(){
 if(state==="menu"||state==="result"){
   ctx.fillStyle="#020805e8";ctx.fillRect(0,0,W,H);ctx.textAlign="center";
   ctx.fillStyle="#fff";ctx.font="1000 58px system-ui";ctx.fillText("PLATE RUSH",450,190);
   ctx.font="900 17px system-ui";ctx.fillStyle="#a8c6b5";ctx.fillText("THE DOMINICAN STREET GAME",450,225);
   ctx.font="1000 24px system-ui";ctx.fillStyle="#fff";
   ctx.fillText(state==="menu"?"TOCA BATEAR PARA JUGAR":"PUNTUACIÓN "+score,450,310);
   ctx.font="700 14px system-ui";ctx.fillStyle="#8ba296";
   ctx.fillText(state==="menu"?"Pitcher • Bateador • Cámara • Bases • Corredores":"Toca BATEAR para jugar otra vez",450,345);
   ctx.textAlign="left";
 }
}
function celebrateFX(){
 if(!celebrate)return;
 ctx.save();ctx.textAlign="center";
 const a=Math.min(1,celebrate);
 ctx.fillStyle="#fff";ctx.font="1000 42px system-ui";ctx.globalAlpha=a;ctx.fillText("¡CARRERA!",450,235);
 ctx.font="800 18px system-ui";ctx.fillText("PLATE RUSH",450,264);ctx.restore();
}
function draw(){
 ctx.clearRect(0,0,W,H);
 ctx.save();
 if(shake>0)ctx.translate((Math.random()-.5)*shake,(Math.random()-.5)*shake);
 drawField();ballScreen();banners();celebrateFX();overlay();ctx.restore();
 for(const p of particles){ctx.globalAlpha=Math.max(0,p.life/60);ctx.fillStyle=p.kind==="star"?"#fff":"#f2d36b";ctx.fillRect(p.x,p.y,p.size,p.size);p.x+=p.vx;p.y+=p.vy;p.vy+=.08;p.life--}
 ctx.globalAlpha=1;
 if(flash>0){ctx.fillStyle="rgba(255,255,255,"+(flash*.12)+")";ctx.fillRect(0,0,W,H)}
}
function update(dt){
 const d=dt/16;
 if(state==="pitching"){
   pitch+=dt/1150;
   pitcher.wind=Math.sin(Math.min(1,pitch)*Math.PI*3)*.7;
   // perspective: ball begins tiny/far and grows toward batter
   const q=Math.min(1,pitch);
   ball.z=q;ball.x=450+Math.sin(q*4.2)*35*(1-q)+Math.sin(q*10)*3;
   ball.y=92+q*330;ball.r=5+q*8;
   ball.trail.unshift({x:ball.x,y:ball.y,r:ball.r});ball.trail=ball.trail.slice(0,7);
   if(pitch>=1){ball.active=false;state="out";outs++;streak=0;message.textContent=outs>=3?"🏁 ¡TRES OUT! FIN DEL PARTIDO":"⚾ ¡STRIKE! NO LLEGASTE A TIEMPO";beep(180,.12);ui();if(outs<3)setTimeout(()=>{if(state==="out")startPitch()},850);else{state="result";ui()}}
 }
 if(state==="hitFly"){
   pitch+=dt/1700;
   const q=Math.min(1,pitch);
   // arc that travels away from home; camera pans after contact
   const dir=hitQuality===3?0:(hitQuality===2?1:-.75);
   ball.x=450+dir*360*q+Math.sin(q*8)*22;
   ball.y=365-260*Math.sin(q*Math.PI)+70*q;
   ball.r=12-5*q;
   ball.trail.unshift({x:ball.x,y:ball.y,r:ball.r});ball.trail=ball.trail.slice(0,12);
   camX=-dir*95*q;camY=20*q;camZoom=1+.10*q;
   if(q>=1){
     state="running";runnerBase=0;runnerT=0;camX=0;camY=0;camZoom=1;
     message.textContent=hitQuality===3?"🏆 ¡HOME RUN! CELEBRACIÓN EN EL BARRIO":"🏃 ¡LA PELOTA ESTÁ EN JUEGO! TOCA CORRER";
     ball.active=false;ui();
   }
 }
 if(state==="running"){
   camX=28*Math.sin(performance.now()/110);fieldRun+=dt/1000;
   if(hitQuality===3){runnerT=Math.min(1,runnerT+dt/1150);if(runnerT>=1){runnerBase=0;state="celebrate";celebrate=1;score+=3;xp+=25;burst(HOME.x,HOME.y,70,"star");message.textContent="🔥 ¡HOME RUN! ¡VUELTA COMPLETA!";ui();}}
 }
 if(state==="runningBase"){
   runnerT=Math.min(1,runnerT+dt/1000);
   camX=40*runnerT;camY=-12*runnerT;camZoom=1+.08*runnerT;
   if(runnerT>=1){camX=0;camY=0;camZoom=1;finishBase();}
 }
 if(state==="celebrate"){
   celebrate-=dt/1000;if(celebrate<=0){celebrate=0;
     if(runnerBase===1){state="returning";message.textContent="🏃 ¡ESTÁS EN 1B! TOCA REGRESAR PARA COMPLETAR LA CARRERA"}
     else{round++;state="pitching";startPitch()}
     ui();
   }
 }
 if(batter.swing>0)batter.swing=Math.max(0,batter.swing-d*.055);
 if(shake>0)shake*=Math.pow(.86,d);if(flash>0)flash*=Math.pow(.82,d);
 for(const p of particles)p.life-=d;
 particles=particles.filter(p=>p.life>0);
}
function loop(t){const dt=Math.min(34,t-(last||t-16));last=t;update(dt);ui();draw();requestAnimationFrame(loop)}
ui();draw();requestAnimationFrame(loop);
