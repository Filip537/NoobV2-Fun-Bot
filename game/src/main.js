import { DiscordSDK } from '@discord/embedded-app-sdk';
import './style.css';

const canvas=document.getElementById('game'),ctx=canvas.getContext('2d');
const $=id=>document.getElementById(id);
const W=960,H=540,T=40;
const NAMES=['Beginner Path','Jump Training','Spike Valley','Lava Escape','Ice Platform','Invisible Blocks','Speed Run','Trap Tower','Impossible Jump','NoobV2 Champion'];
const keys={left:false,right:false,jump:false};
let stage=0,level,player,checkpoint,playing=false,completed=false,deaths=0,started=0,elapsed=0,last=performance.now(),camera=0,identity=null,token=null,unlocked=1,overlay=true;
const levels=NAMES.map((name,i)=>{
 const width=55+i*5,platforms=[{x:0,y:480,w:360,h:60}],spikes=[],checks=[];
 let x=330;
 for(let n=0;n<8+i;n++){
   const gap=65+(n%3)*16+Math.min(i,6)*4;
   x+=gap;
   const y=480-((n%4===1)?60:(n%4===2)?110:(n%4===3)?50:0);
   const pw=210-Math.min(i,7)*9;
   platforms.push({x,y,w:pw,h:H-y});
   if(n%3===2)checks.push({x:x+pw/2,y:y-24});
   if(n%3===1)spikes.push({x:x+pw/2-13,y:y-18,w:26,h:18});
   x+=pw;
 }
 const finish={x:x-48,y:platforms.at(-1).y-70};
 return {name,platforms,spikes,checks,finish,width:x+160};
});
function spawn(at){player={x:at?.x??65,y:at?.y??390,w:27,h:36,vx:0,vy:0,ground:false};}
function begin(i){stage=i;level=levels[i];deaths=0;elapsed=0;started=performance.now();checkpoint={x:65,y:390};spawn(checkpoint);playing=true;completed=false;overlay=false;$('overlay').hidden=true;$('panel').hidden=true;$('stage').textContent=`${i+1} / 10`;canvas.focus();}
function die(){deaths++;spawn(checkpoint);$('deaths').textContent=String(deaths);}
function rectHit(a,b){return a.x<b.x+b.w&&a.x+a.w>b.x&&a.y<b.y+b.h&&a.y+a.h>b.y;}
function update(dt){if(!playing)return;elapsed=performance.now()-started;$('time').textContent=(elapsed/1000).toFixed(2)+'s';
 const oldY=player.y,oldBottom=oldY+player.h;
 player.vx=((keys.right?1:0)-(keys.left?1:0))*270;
 if(keys.jump&&player.ground){player.vy=-555;player.ground=false;}
 player.vy=Math.min(player.vy+1500*dt,1000);
 player.x=Math.max(0,Math.min(level.width-player.w,player.x+player.vx*dt));player.y+=player.vy*dt;
 player.ground=false;
 for(const p of level.platforms){if(player.x+player.w>p.x&&player.x<p.x+p.w&&oldBottom<=p.y+12&&player.y+player.h>=p.y&&player.vy>=0){player.y=p.y-player.h;player.vy=0;player.ground=true;}}
 if(player.y>H+160){die();return;}
 for(const s of level.spikes){if(rectHit(player,s)){die();return;}}
 for(const c of level.checks){if(Math.abs(player.x-c.x)<28&&Math.abs(player.y-c.y)<85){checkpoint={x:c.x,y:c.y-75};c.active=true;}}
 if(Math.abs(player.x-level.finish.x)<32&&Math.abs(player.y-level.finish.y)<90){complete();}
}
function complete(){playing=false;completed=true;const seconds=Math.round(elapsed)/1000;unlocked=Math.max(unlocked,Math.min(10,stage+2));localStorage.setItem('pk_unlocked',String(unlocked));const best=JSON.parse(localStorage.getItem('pk_best')||'{}');if(!best[stage]||seconds<best[stage])best[stage]=seconds;localStorage.setItem('pk_best',JSON.stringify(best));$('overlay').hidden=false;$('overlay').querySelector('h1').textContent='STAGE CLEARED!';$('overlay').querySelector('p').textContent=`${level.name} • ${seconds.toFixed(2)}s • ${deaths} deaths`;$('play').textContent=stage===9?'REPLAY TOWER':'NEXT STAGE';if(token){fetch('/api/score',{method:'POST',headers:{'Content-Type':'application/json','Authorization':`Bearer ${token}`},body:JSON.stringify({stage:stage+1,timeMs:Math.round(elapsed),deaths})}).catch(()=>{});}}
function draw(){ctx.fillStyle='#1d365c';ctx.fillRect(0,0,W,H);camera=Math.max(0,Math.min(level.width-W,player.x-280));
 for(let k=0;k<22;k++){let x=(k*217-camera*.25)%(W+240);if(x<0)x+=W+240;ctx.fillStyle='#304e78';ctx.fillRect(x,65+(k%5)*53,85,17);}
 ctx.save();ctx.translate(-camera,0);
 for(const p of level.platforms){ctx.fillStyle='#795b49';ctx.fillRect(p.x,p.y,p.w,p.h);ctx.fillStyle='#59bd78';ctx.fillRect(p.x,p.y,p.w,12);ctx.fillStyle='#367d56';for(let x=p.x+16;x<p.x+p.w;x+=39)ctx.fillRect(x,p.y+13,8,7);}
 for(const s of level.spikes){ctx.fillStyle='#ff6b76';ctx.beginPath();ctx.moveTo(s.x,s.y+s.h);ctx.lineTo(s.x+s.w/2,s.y);ctx.lineTo(s.x+s.w,s.y+s.h);ctx.fill();}
 for(const c of level.checks){ctx.fillStyle=c.active?'#e6ff77':'#e7bd48';ctx.fillRect(c.x,c.y,5,34);ctx.fillRect(c.x+5,c.y,22,16);}
 const f=level.finish;ctx.fillStyle='#e9f1ff';ctx.fillRect(f.x,f.y,5,70);ctx.fillStyle='#ffcf60';ctx.fillRect(f.x+5,f.y,35,25);ctx.fillStyle='#c2832f';ctx.fillRect(f.x+5,f.y+25,16,8);
 ctx.fillStyle='#65b9ff';ctx.fillRect(player.x,player.y,player.w,player.h);ctx.fillStyle='#f2f6ff';ctx.fillRect(player.x+4,player.y+5,19,10);ctx.fillStyle='#1d365c';ctx.fillRect(player.x+9,player.y+9,4,4);ctx.fillRect(player.x+19,player.y+9,4,4);ctx.fillStyle='#2962a6';ctx.fillRect(player.x+2,player.y+player.h-5,10,5);ctx.fillRect(player.x+16,player.y+player.h-5,10,5);
 ctx.restore();ctx.fillStyle='#fff';ctx.font='bold 18px monospace';ctx.fillText(level.name.toUpperCase(),20,32);
}
function frame(now){let dt=Math.min((now-last)/1000,.033);last=now;if(level){update(dt);draw();}requestAnimationFrame(frame);}requestAnimationFrame(frame);
function bindKey(k,down){if(['a','arrowleft'].includes(k))keys.left=down;if(['d','arrowright'].includes(k))keys.right=down;if([' ','w','arrowup'].includes(k))keys.jump=down;}
window.addEventListener('keydown',e=>{if(['ArrowLeft','ArrowRight','ArrowUp',' '].includes(e.key))e.preventDefault();bindKey(e.key.toLowerCase(),true);if(e.key.toLowerCase()==='r'&&playing)begin(stage);});window.addEventListener('keyup',e=>bindKey(e.key.toLowerCase(),false));window.addEventListener('blur',()=>Object.keys(keys).forEach(k=>keys[k]=false));
for(const b of document.querySelectorAll('[data-key]')){const k=b.dataset.key;b.addEventListener('pointerdown',e=>{e.preventDefault();keys[k]=true;b.setPointerCapture(e.pointerId)});for(const event of ['pointerup','pointercancel','lostpointercapture'])b.addEventListener(event,()=>keys[k]=false);}
$('play').onclick=()=>begin(completed?(stage+1)%10:stage);
$('restart').onclick=()=>begin(stage);
$('levels').onclick=()=>{const panel=$('panel');panel.hidden=!panel.hidden;panel.innerHTML='<h2>Choose Stage</h2>';levels.forEach((l,i)=>{const b=document.createElement('button');b.textContent=`${i+1}. ${l.name}`;b.disabled=i>=unlocked;b.onclick=()=>begin(i);panel.appendChild(b)});};
$('leaderboard').onclick=async()=>{const panel=$('panel');panel.hidden=false;panel.innerHTML='<h2>Leaderboard</h2><p>Loading…</p>';try{const res=await fetch('/api/leaderboard');const data=await res.json();panel.innerHTML='<h2>Leaderboard</h2>'+(data.length?data.map((r,i)=>`<p>${i+1}. ${escapeHTML(r.name)} — Stage ${r.stage} • ${(r.timeMs/1000).toFixed(2)}s</p>`).join(''):'<p>No records yet. Play a stage!</p>')+'<small>Community records are provisional and not eligible for NoobV2 XP.</small>';}catch{panel.innerHTML='<p>Leaderboard unavailable. Game still works.</p>';}};
function escapeHTML(s){return String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
unlocked=Math.max(1,Math.min(10,Number(localStorage.getItem('pk_unlocked'))||1));level=levels[0];spawn({x:65,y:390});
async function connectDiscord(){const clientId=import.meta.env.VITE_DISCORD_CLIENT_ID;if(!clientId){$('identity').textContent='Web demo • local progress';return;}try{const sdk=new DiscordSDK(clientId);await Promise.race([sdk.ready(),new Promise((_,reject)=>setTimeout(()=>reject(Error('Not running inside a Discord Activity')),4500))]);const auth=await sdk.commands.authorize({client_id:clientId,response_type:'code',state:'parkour',prompt:'none',scope:['identify']});const response=await fetch('/api/token',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({code:auth.code})});if(!response.ok)throw Error('OAuth failed');const data=await response.json();await sdk.commands.authenticate({access_token:data.access_token});token=data.access_token;identity=data.user;$('identity').textContent=`Playing as ${identity.username}`;}catch(e){console.warn('[Activity]',e);$('identity').textContent='Demo mode • Discord login unavailable';}}
connectDiscord();
