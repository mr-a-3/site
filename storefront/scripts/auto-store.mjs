import {phoneLink} from './phone-access.mjs';
import os from 'node:os';
import net from 'node:net';
import fs from 'node:fs';
import path from 'node:path';
import {spawn} from 'node:child_process';
// Only the manual Start Store command launches the supervisor.
if(!process.argv.includes('--manual-start'))process.exit(0);
process.chdir(new URL('..',import.meta.url).pathname.replace(/^\/(?=[A-Za-z]:)/,''));
fs.mkdirSync('logs',{recursive:true});
const output=fs.openSync('logs/automatic-start.log','a');
const log=m=>fs.appendFileSync('logs/automatic-start.log',new Date().toISOString()+' '+m+'\n');
const stopped=()=>fs.existsSync('.store-stopped');
const lock=net.createServer(socket=>socket.end());
lock.on('error',error=>{if(error.code==='EADDRINUSE')process.exit(0);log(error.message);process.exit(1)});
let dev,phone,phoneHost='',checking=false;
const alive=async url=>{try{return (await fetch(url,{signal:AbortSignal.timeout(3000)})).ok}catch{return false}};
function run(script){const child=spawn(process.execPath,[script],{cwd:process.cwd(),windowsHide:true,stdio:['ignore',output,output],env:{...process.env,STORE_AUTO_START:'1',PATH:path.dirname(process.execPath)+path.delimiter+process.env.PATH}});child.on('error',e=>log(e.message));return child}
function localAddress(){return Object.entries(os.networkInterfaces()).flatMap(([name,list])=>(list||[]).filter(a=>a.family==='IPv4'&&!a.internal&&(/^(192\.168\.|10\.)/.test(a.address)||/^172\.(1[6-9]|2\d|3[01])\./.test(a.address))).map(a=>({address:a.address,score:(/wi-?fi|wireless/i.test(name)?20:0)-(/vpn|virtual|vethernet|wsl|docker|vmware|virtualbox/i.test(name)?100:0)}))).filter(a=>a.score>=0).sort((a,b)=>b.score-a.score)[0]?.address}
async function check(){if(checking||stopped())return;checking=true;try{const running=await alive('http://127.0.0.1:5173/');if(stopped())return;if(!running&&!dev){log('Starting localhost store');dev=run('scripts/build-and-start.mjs');dev.on('exit',()=>{dev=null})}const host=localAddress();if(host!==phoneHost&&phone){phone.kill();phone=null}phoneHost=host||'';if(host){fs.writeFileSync('PHONE-LINK.txt',phoneLink(host)+'\n');const connected=phone||await alive(phoneLink(host));if(stopped())return;if(!connected){const child=spawn(process.execPath,['scripts/phone-preview.mjs',host],{cwd:process.cwd(),windowsHide:true,stdio:['ignore',output,output]});phone=child;child.on('error',e=>log(e.message));child.on('exit',()=>{if(phone===child)phone=null});log('Phone link: http://'+host+':5174')}}}catch(e){log(e.message)}finally{checking=false}}
lock.listen(5175,'127.0.0.1',()=>{log('Store started manually');check();setInterval(check,15000)});
// Resume promptly when Start Store clears a persisted stop preference.
const preferenceWatcher=fs.watch('.',{persistent:false},(_event,file)=>{if(String(file)==='.store-stopped')check()});
preferenceWatcher.on('error',error=>log('Start/stop preference watcher: '+error.message));
process.on('SIGINT',()=>{dev?.kill();phone?.kill();process.exit()});
