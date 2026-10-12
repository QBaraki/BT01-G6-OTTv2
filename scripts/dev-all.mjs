import {spawn} from 'node:child_process';
const n=process.platform==='win32'?'npm.cmd':'npm';
const processes=[];
const run=(cmd,args,name)=>{const child=spawn(cmd,args,{stdio:'inherit',shell:process.platform==='win32',env:process.env});processes.push(child);child.on('exit',code=>{if(code&&!stopping){console.error(`${name} stopped: ${code}`);shutdown();}});};
let stopping=false;
function shutdown(){if(stopping)return;stopping=true;for(const p of processes)if(p.pid){if(process.platform==='win32'){spawn('taskkill',['/pid',String(p.pid),'/T','/F'],{stdio:'ignore'});}else p.kill('SIGTERM');}}
process.on('SIGINT',()=>{shutdown();process.exit(0)});process.on('SIGTERM',()=>{shutdown();process.exit(0)});
run(process.execPath,['server/index.mjs'],'backend');run(n,['run','dev'],'Vite');
