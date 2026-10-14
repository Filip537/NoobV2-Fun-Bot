import 'dotenv/config';
import express from 'express';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const root=path.dirname(fileURLToPath(import.meta.url));
const app=express();app.disable('x-powered-by');app.use(express.json({limit:'8kb'}));
const file=path.join(root,'data','scores.json');
function read(){try{return JSON.parse(fs.readFileSync(file,'utf8'))}catch{return {scores:{}}}}
function write(db){fs.mkdirSync(path.dirname(file),{recursive:true});fs.writeFileSync(file+'.tmp',JSON.stringify(db,null,2));fs.renameSync(file+'.tmp',file)}
async function getUser(token){if(!token)return null;const r=await fetch('https://discord.com/api/v10/users/@me',{headers:{Authorization:'Bearer '+token},signal:AbortSignal.timeout(5000)});if(!r.ok)return null;return r.json()}
app.post('/api/token',async(req,res)=>{try{if(!process.env.DISCORD_CLIENT_ID||!process.env.DISCORD_CLIENT_SECRET||typeof req.body?.code!=='string')return res.status(400).json({error:'Missing configuration or code'});const form=new URLSearchParams({client_id:process.env.DISCORD_CLIENT_ID,client_secret:process.env.DISCORD_CLIENT_SECRET,grant_type:'authorization_code',code:req.body.code});const r=await fetch('https://discord.com/api/v10/oauth2/token',{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded'},body:form,signal:AbortSignal.timeout(8000)});if(!r.ok)return res.status(401).json({error:'Discord authorization failed'});const data=await r.json();const user=await getUser(data.access_token);if(!user)return res.status(401).json({error:'Could not verify Discord user'});res.json({access_token:data.access_token,user:{id:user.id,username:user.global_name||user.username}})}catch(e){console.error(e);res.status(502).json({error:'Discord authentication unavailable'})}});
app.post('/api/score',async(req,res)=>{try{const token=(req.headers.authorization||'').match(/^Bearer (.+)$/)?.[1];const user=await getUser(token);if(!user)return res.status(401).json({error:'Discord login required'});const {stage,timeMs,deaths}=req.body||{};if(!Number.isInteger(stage)||stage<1||stage>10||!Number.isInteger(timeMs)||timeMs<1500||timeMs>1800000||!Number.isInteger(deaths)||deaths<0||deaths>10000)return res.status(400).json({error:'Invalid result'});const db=read();const key=user.id+':'+stage;const prev=db.scores[key];if(!prev||timeMs<prev.timeMs){db.scores[key]={userId:user.id,name:(user.global_name||user.username).slice(0,50),stage,timeMs,deaths,updatedAt:Date.now()};write(db)}res.json({ok:true,provisional:true})}catch(e){console.error(e);res.status(500).json({error:'Could not save score'})}});
app.get('/api/leaderboard',(req,res)=>{const db=read();const scores=Object.values(db.scores).sort((a,b)=>b.stage-a.stage||a.timeMs-b.timeMs).slice(0,20).map(({name,stage,timeMs})=>({name,stage,timeMs}));res.json(scores)});
app.use(express.static(path.join(root,'dist')));app.get('*',(req,res)=>res.sendFile(path.join(root,'dist','index.html')));
const port=Number(process.env.PORT||3000);app.listen(port,'0.0.0.0',()=>console.log('NoobV2 Activity listening on '+port));
