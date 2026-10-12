import {spawn} from 'node:child_process';
import {randomUUID} from 'node:crypto';
import {readFile} from 'node:fs/promises';
import {dirname,join} from 'node:path';
import {fileURLToPath} from 'node:url';

const worker = await readFile(join(dirname(fileURLToPath(import.meta.url)),'sandbox-worker.cjs'),'utf8');
const IMAGE = process.env.BOT_DOCKER_IMAGE || 'node:22-alpine';
const MAX_OUTPUT = 16 * 1024;

export async function runSandboxedMove(source,snapshot,timeoutMs=2500){
  if(!Number.isInteger(timeoutMs)||timeoutMs<100||timeoutMs>10000)throw Error('Invalid timeout');
  const name=`ott-bot-${randomUUID()}`;
  const args=['run','--rm','-i','--name',name,'--network','none','--read-only',
    '--cap-drop','ALL','--security-opt','no-new-privileges','--pids-limit','32',
    '--memory','128m','--memory-swap','128m','--cpus','0.5','--user','65534:65534',
    '--tmpfs','/tmp:rw,noexec,nosuid,size=1m',IMAGE,'node','-e',worker];
  const input=JSON.stringify({source,snapshot});
  return await new Promise((resolve,reject)=>{
    const child=spawn('docker',args,{stdio:['pipe','pipe','pipe'],env:{PATH:process.env.PATH||'/usr/bin:/bin'},windowsHide:true});
    let output='',err='',done=false;
    const cleanup=()=>{clearTimeout(timer);};
    const fail=e=>{if(done)return;done=true;cleanup();reject(e)};
    const timer=setTimeout(()=>{
      child.kill('SIGKILL');
      const remove=spawn('docker',['rm','-f',name],{stdio:'ignore',windowsHide:true});
      remove.on('error',()=>{});
      fail(new Error('Bot timeout: sandbox terminated'));
    },timeoutMs);
    child.on('error',e=>fail(new Error(`Docker unavailable: ${e.message}`)));
    child.stdout.on('data',chunk=>{output+=chunk.toString();if(output.length>MAX_OUTPUT){child.kill('SIGKILL');const remove=spawn('docker',['rm','-f',name],{stdio:'ignore',windowsHide:true});remove.on('error',()=>{});fail(new Error('Bot output exceeds limit'))}});
    child.stderr.on('data',chunk=>{err+=chunk.toString().slice(0,1024);});
    child.on('close',code=>{
      if(done)return;
      try{
        const result=JSON.parse(output.trim());
        if(!result.ok)throw Error(`Bot error: ${result.error}`);
        done=true;cleanup();resolve(result.decision);
      }catch(e){fail(new Error(`Sandbox failed (exit ${code}): ${String(e.message).slice(0,250)} ${err.slice(0,100)}`))}
    });
    child.stdin.on('error',()=>{});
    child.stdin.end(input);
  });
}
