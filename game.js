const canvas=document.getElementById("game"),ctx=canvas.getContext("2d");
const scoreEl=document.getElementById("score"),message=document.getElementById("message");
const hitBtn=document.getElementById("hit"),runBtn=document.getElementById("run"),backBtn=document.getElementById("back");
let state="menu",score=0,outs=0,round=1,streak=0,runner=0,swing=0,shake=0,last=0;
let ball={x:450,y:105,vx:0,vy:0,r:8,active:false},particles=[],audio=null;

function ui(){scoreEl.textContent=score+" PTS • "+outs+"/3 OUT";document.body.dataset.state=state}
function beep(freq,dur){try{audio=audio||new(window.AudioContext||window.webkitAudioContext)();const o=audio.createOscillator(),g=audio.createGain();o.frequency.value=freq;o.type="sine";g.gain.value=.025;o.connect(g);g.connect(audio.destination);o.start();g.gain.exponentialRampToValueAtTime(.001,audio.currentTime+dur);o.stop(audio.currentTime+dur)}catch(e){}}
function serve(){ball={x:450,y:105,vx:(Math.random()<.5?-1:1)*(3+Math.random()*2),vy:2.4,r:8,active:true}}
function reset(){state="play";score=0;outs=0;round=1;streak=0;runner=0;particles=[];message.textContent="Batea cuando la pelota entre en la zona.";serve();ui();beep(620,.08)}
function burst(px,py,n){for(let j=0;j<n;j++){const a=Math.random()*Math.PI*2,sp=1+Math.random()*4;particles.push({x:px,y:py,vx:Math.cos(a)*sp,vy:Math.sin(a)*sp,life:35+Math.random()*20})}}
function hit(){
 if(state==="menu"||state==="result")reset();
 if(state!=="play")return;
 const good=Math.abs(ball.x-450)<72;
 swing=1;ball.active=false;
 if(good){score+=2;streak++;burst(450,105,22);message.textContent=streak>1?"🔥 RACHA x"+streak+" • ¡CORRE!":"💥 ¡BATAZO LIMPIO! • ¡CORRE!";beep(740,.11);state="run"}
 else{outs++;streak=0;message.textContent=outs>=3?"🏁 TRES OUT • FIN DEL JUEGO":"❌ ¡FALLASTE! • SIGUIENTE LANZAMIENTO";beep(180,.12);state=outs>=3?"result":"play";setTimeout(()=>{if(state==="play")serve()},650)}
 ui()
}
function run(){if(state==="run"){runner=1;score++;burst(755,300,12);message.textContent="🏃 ¡LLEGASTE! • REGRESA A LA PLACA";beep(880,.08);state="return";ui()}}
function back(){if(state==="return"){runner=0;round++;score++;message.textContent="⚡ ¡CARRERA COMPLETADA! • PRÓXIMO LANZAMIENTO";beep(620,.06);state="play";ui();setTimeout(()=>{if(state==="play")serve()},500)}}
function rr(x,y,w,h,r){ctx.beginPath();ctx.roundRect(x,y,w,h,r);ctx.fill()}
function plate(px,py){ctx.save();ctx.translate(px,py);ctx.rotate(.16);ctx.fillStyle="#fff";ctx.strokeStyle="#bfc9c4";ctx.lineWidth=3;rr(-34,-19,68,38,8);ctx.stroke();ctx.restore()}
function player(px,py,col,active){ctx.save();ctx.translate(px,py);ctx.fillStyle="#0003";ctx.beginPath();ctx.ellipse(0,18,24,7,0,0,Math.PI*2);ctx.fill();ctx.fillStyle=col;ctx.beginPath();ctx.arc(0,-30,15,0,Math.PI*2);ctx.fill();rr(-12,-15,24,39,7);ctx.fillRect(-21,0,9,25);ctx.fillRect(12,0,9,25);if(active){ctx.strokeStyle="#fff";ctx.lineWidth=3;ctx.beginPath();ctx.arc(0,-30,22,0,Math.PI*2);ctx.stroke()}ctx.restore()}
function field(){
ctx.fillStyle="#0d6938";ctx.fillRect(0,0,900,520);
for(let j=0;j<10;j++){ctx.fillStyle=j%2?"#11713c":"#0d6938";ctx.fillRect(0,j*52,900,52)}
ctx.fillStyle="#d3a36a";ctx.beginPath();ctx.moveTo(450,65);ctx.lineTo(820,300);ctx.lineTo(670,520);ctx.lineTo(230,520);ctx.lineTo(80,300);ctx.closePath();ctx.fill();
ctx.fillStyle="#b8834d";ctx.beginPath();ctx.arc(450,310,115,0,Math.PI*2);ctx.fill();
ctx.strokeStyle="#ffffff88";ctx.lineWidth=4;ctx.beginPath();ctx.moveTo(450,70);ctx.lineTo(770,300);ctx.lineTo(645,500);ctx.moveTo(450,70);ctx.lineTo(130,300);ctx.lineTo(255,500);ctx.stroke();
plate(140,300);plate(760,300);player(140,275,"#f5f7fa",runner===0);player(760,275,"#ffd447",runner===1)
}
function overlay(){ctx.fillStyle="#0009";rr(18,18,330,62,16);ctx.fillStyle="#fff";ctx.font="900 21px system-ui";ctx.fillText("PLATE RUSH",34,47);ctx.font="800 11px system-ui";ctx.fillStyle="#d7e5dc";ctx.fillText("RONDA "+round+" • THE DOMINICAN STREET GAME",34,66);if(state==="menu"||state==="result"){ctx.fillStyle="#06110ded";ctx.fillRect(0,0,900,520);ctx.textAlign="center";ctx.fillStyle="#fff";ctx.font="900 58px system-ui";ctx.fillText("PLATE RUSH",450,190);ctx.font="800 18px system-ui";ctx.fillStyle="#b9d8c5";ctx.fillText("THE DOMINICAN STREET GAME",450,224);ctx.font="900 24px system-ui";ctx.fillText(state==="menu"?"TOCA BATEAR PARA JUGAR":"PUNTUACIÓN: "+score,450,310);ctx.font="600 15px system-ui";ctx.fillStyle="#94aa9f";ctx.fillText(state==="menu"?"Batea • Corre • Regresa • Busca tu mejor racha":"Toca BATEAR para una nueva partida",450,345);ctx.textAlign="left"}}
function draw(){
ctx.clearRect(0,0,900,520);ctx.save();if(shake>0){ctx.translate((Math.random()-.5)*shake,(Math.random()-.5)*shake);shake*=.88}
field();
if(ball.active){ctx.fillStyle="#fff";ctx.shadowBlur=12;ctx.shadowColor="#fff";ctx.beginPath();ctx.arc(ball.x,ball.y,ball.r,0,Math.PI*2);ctx.fill();ctx.shadowBlur=0}
ctx.save();ctx.translate(450,382);ctx.rotate(-.72+swing*.9);ctx.fillStyle="#87572e";ctx.fillRect(-8,-78,16,106);ctx.fillStyle="#e3b46a";ctx.fillRect(-10,-84,20,12);ctx.restore();overlay();ctx.restore();
for(const p of particles){ctx.globalAlpha=Math.max(0,p.life/55);ctx.fillStyle="#fff";ctx.fillRect(p.x,p.y,5,5);p.x+=p.vx;p.y+=p.vy;p.vy+=.08;p.life--}ctx.globalAlpha=1
}
function loop(t){const dt=Math.min(32,t-last||16);last=t;if(state==="play"&&ball.active){ball.x+=ball.vx*dt/16;ball.y+=ball.vy*dt/16;ball.vy+=.055*dt/16;if(ball.y>510){ball.active=false;message.textContent="⚾ PELOTA FUERA • TOCA BATEAR"}}if(swing>0)swing=Math.max(0,swing-.09*dt/16);draw();requestAnimationFrame(loop)}
hitBtn.onclick=hit;runBtn.onclick=run;backBtn.onclick=back;canvas.addEventListener("pointerdown",e=>{if(e.pointerType==="touch")hit()});
ui();draw();requestAnimationFrame(loop);