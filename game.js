const canvas=document.getElementById('game');
const ctx=canvas.getContext('2d');
const scoreEl=document.getElementById('score');
const msg=document.getElementById('message');
const hitBtn=document.getElementById('hit');
const runBtn=document.getElementById('run');
const backBtn=document.getElementById('back');

let state='ready',score=0,outs=0,streak=0,round=1,runner=0,shake=0,flash=0;
let ball={x:450,y:120,vx:0,vy:0,r:9,active:false};
let swing=0,particles=[],last=performance.now(),audioCtx=null;

function resetGame(){state='play';score=0;outs=0;streak=0;round=1;runner=0;particles=[];msg.textContent='¡Prepárate! Batea cuando llegue la pelota.';updateUI();}
function updateUI(){scoreEl.textContent=score+' PTS  •  '+outs+'/3 OUT';}
function beep(freq=440,dur=.07){try{audioCtx??=new(window.AudioContext||window.webkitAudioContext)();const o=audioCtx.createOscillator(),g=audioCtx.createGain();o.frequency.value=freq;o.type='square';g.gain.value=.035;o.connect(g);g.connect(audioCtx.destination);o.start();g.gain.exponentialRampToValueAtTime(.001,audioCtx.currentTime+dur);o.stop(audioCtx.currentTime+dur)}catch{}}
function burst(px,py,n=12){for(let i=0;i<n;i++){const a=Math.random()*Math.PI*2,s=1+Math.random()*4;particles.push({x:px,y:py,vx:Math.cos(a)*s,vy:Math.sin(a)*s,life:35+Math.random()*20});}}
function hit(){
 if(state==='ready'||state==='result') resetGame();
 if(state!=='play') return;
 const timing=Math.abs(ball.x-450);
 const good=timing<75;
 swing=1; beep(good?720:300,.1);
 if(good){score+=2;streak++;burst(ball.x,ball.y,18);flash=1;shake=7;msg.textContent=streak>1?'🔥 ¡Racha de '+streak+'! ¡Corre!':'💥 ¡Buen batazo! ¡Corre a la otra placa!';}
 else {outs++;streak=0;shake=5;msg.textContent='❌ ¡Fallaste! Otro lanzamiento.';beep(180,.12);}
 updateUI();
 if(outs>=3){state='result';msg.textContent='🏁 Fin de ronda. Toca BATEAR para jugar otra vez.';return;}
 ball={x:450,y:120,vx:(Math.random()>.5?1:-1)*(4+Math.random()*2),vy:2.2,r:9,active:true};
 state=good?'run':'play';
}
function run(){
 if(state==='run'){runner=1;score+=1;streak++;burst(750,300,10);beep(880,.08);msg.textContent='🏃 ¡Llegaste! Toca REGRESAR para volver a la base.';state='return';updateUI();}
}
function back(){
 if(state==='return'){runner=0;round++;ball.active=false;state='play';beep(620,.06);msg.textContent='⚾ ¡Punto! Próximo lanzamiento.';setTimeout(()=>{if(state==='play')serve();},450);}
}
function serve(){ball={x:450,y:120,vx:(Math.random()>.5?1:-1)*(3.5+Math.random()*2),vy:2.4,r:9,active:true};}
function plate(px,py){ctx.save();ctx.translate(px,py);ctx.rotate(Math.PI/8);ctx.fillStyle='#fff';ctx.strokeStyle='#c9d0d6';ctx.lineWidth=3;ctx.beginPath();ctx.roundRect(-34,-20,68,40,8);ctx.fill();ctx.stroke();ctx.restore();}
function player(px,py,col,active=false){ctx.save();ctx.translate(px,py);ctx.fillStyle=col;ctx.beginPath();ctx.arc(0,-28,16,0,Math.PI*2);ctx.fill();ctx.fillRect(-13,-13,26,42);ctx.fillRect(-22,0,9,26);ctx.fillRect(13,0,9,26);if(active){ctx.strokeStyle='#fff';ctx.lineWidth=3;ctx.beginPath();ctx.arc(0,-28,21,0,Math.PI*2);ctx.stroke();}ctx.restore();}
function drawField(){
 ctx.fillStyle='#14733e';ctx.fillRect(0,0,900,520);
 for(let i=0;i<10;i++){ctx.fillStyle=i%2?'#167b42':'#13733d';ctx.fillRect(0,i*52,900,52);}
 ctx.fillStyle='#d7aa72';ctx.beginPath();ctx.moveTo(450,75);ctx.lineTo(815,300);ctx.lineTo(665,515);ctx.lineTo(235,515);ctx.lineTo(85,300);ctx.closePath();ctx.fill();
 ctx.fillStyle='#b88755';ctx.beginPath();ctx.arc(450,305,112,0,Math.PI*2);ctx.fill();
 ctx.strokeStyle='rgba(255,255,255,.55)';ctx.lineWidth=4;ctx.beginPath();ctx.moveTo(450,85);ctx.lineTo(760,300);ctx.lineTo(640,500);ctx.moveTo(450,85);ctx.lineTo(140,300);ctx.lineTo(260,500);ctx.stroke();
 plate(145,300);plate(755,300);
 player(145,275,'#f4f7fb',runner===0);player(755,275,'#ffd447',runner===1);
 ctx.fillStyle='rgba(0,0,0,.18)';ctx.beginPath();ctx.ellipse(450,365,38,9,0,0,Math.PI*2);ctx.fill();
}
function draw(){
 ctx.clearRect(0,0,900,520);ctx.save();if(shake>0){ctx.translate((Math.random()-.5)*shake,(Math.random()-.5)*shake);shake*=.86;}
 drawField();
 if(ball.active){ctx.fillStyle='#fff';ctx.beginPath();ctx.arc(ball.x,ball.y,ball.r,0,Math.PI*2);ctx.fill();ctx.strokeStyle='#cdd4d8';ctx.stroke();}
 ctx.save();ctx.translate(450,380);ctx.rotate(-.8+swing*.95);ctx.fillStyle='#9a632f';ctx.fillRect(-8,-76,16,105);ctx.fillStyle='#e5b56c';ctx.fillRect(-10,-82,20,13);ctx.restore();
 ctx.fillStyle='rgba(0,0,0,.48)';ctx.roundRect(18,18,250,62,18);ctx.fill();ctx.fillStyle='#fff';ctx.font='800 22px system-ui';ctx.fillText('PLATE RUSH',34,48);ctx.font='600 13px system-ui';ctx.fillStyle='#d7e5dc';ctx.fillText('RONDA '+round+'  •  LA CALLE DOMINICANA',34,68);
 if(flash>0){ctx.fillStyle='rgba(255,255,255,'+(flash*.22)+')';ctx.fillRect(0,0,900,520);flash*=.86;}
 ctx.restore();
 for(const p of particles){ctx.fillStyle='rgba(255,255,255,'+Math.max(0,p.life/55)+')';ctx.fillRect(p.x,p.y,5,5);}
}
function loop(t){const dt=Math.min(32,t-last);last=t;if(state==='run'&&ball.active){ball.x+=ball.vx*dt/16;ball.y+=ball.vy*dt/16;ball.vy+=.06*dt/16;if(ball.y>500){ball.active=false;state='play';msg.textContent='⚾ Pelota fuera. Toca BATEAR.';}}
 if(swing>0)swing=Math.max(0,swing-.08*dt/16);for(const p of particles){p.x+=p.vx;p.y+=p.vy;p.vy+=.08;p.life-=1;}particles=particles.filter(p=>p.life>0);draw();requestAnimationFrame(loop);}
hitBtn.onclick=hit;runBtn.onclick=run;backBtn.onclick=back;
canvas.addEventListener('pointerdown',e=>{if(e.pointerType==='touch')hit();});
updateUI();draw();requestAnimationFrame(loop);