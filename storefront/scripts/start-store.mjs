import fs from 'node:fs';
import {spawn} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {setTimeout} from 'node:timers/promises';
const root=fileURLToPath(new URL('..',import.meta.url));process.chdir(root);
try{fs.unlinkSync(new URL('../.store-stopped',import.meta.url))}catch(error){if(error.code!=='ENOENT')throw error}
const supervisor=spawn(process.execPath,[fileURLToPath(new URL('./auto-store.mjs',import.meta.url)),'--manual-start'],{cwd:root,windowsHide:true,detached:true,stdio:'ignore'});
supervisor.on('error',error=>{console.error('Unable to start the store: '+error.message);process.exitCode=1});supervisor.unref();
console.log('Starting the store…');let ready=false;
for(let attempt=0;attempt<120;attempt++){try{if((await fetch('http://127.0.0.1:5173/',{signal:AbortSignal.timeout(1500)})).ok){ready=true;break}}catch{}await setTimeout(500)}
if(!ready){console.error('The store did not start. Check storefront/logs/automatic-start.log.');process.exitCode=1}
else{console.log('Store: http://127.0.0.1:5173/');if(fs.existsSync('PHONE-LINK.txt'))console.log('Phone: '+fs.readFileSync('PHONE-LINK.txt','utf8').trim()+' (same Wi-Fi)');console.log('The store runs in the background. Use Stop Store to turn it off.')}
