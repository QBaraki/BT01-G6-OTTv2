'use strict';
// Runs ONLY inside the Docker sandbox. stdout is reserved for a single JSON result.
(async () => {
  let input='';
  for await (const chunk of process.stdin) {
    input += chunk;
    if (Buffer.byteLength(input)>128*1024) throw Error('Input too large');
  }
  const {source,snapshot}=JSON.parse(input);
  if(typeof source!=='string'||!snapshot) throw Error('Invalid input');
  const moduleUrl='data:text/javascript;base64,'+Buffer.from(source,'utf8').toString('base64');
  const mod=await import(moduleUrl);
  if(typeof mod.getMove!=='function') throw Error('Missing getMove function');
  const decision=await mod.getMove(snapshot);
  process.stdout.write(JSON.stringify({ok:true,decision})+'\n');
})().catch(e=>{process.stdout.write(JSON.stringify({ok:false,error:String(e?.message||e).slice(0,300)})+'\n');process.exitCode=1});
