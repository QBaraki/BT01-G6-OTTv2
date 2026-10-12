import ts from 'typescript';
import {readFile} from 'node:fs/promises';
import {join,dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
import {randomUUID} from 'node:crypto';
import {runSandboxedMove} from './sandbox.mjs';

const base=dirname(fileURLToPath(import.meta.url));
const raw=await readFile(join(base,'engine.source.ts'),'utf8');
// Exact copy of step-1 engine, with its relative utility import replaced for Node loading.
const prepared=raw.replace(/^import\s+\{newId\}\s+from\s+['"]\.\.\/utils\/id['"];?/m,'const newId=()=>globalThis.crypto.randomUUID();');
const compiled=ts.transpileModule(prepared,{compilerOptions:{module:ts.ModuleKind.ESNext,target:ts.ScriptTarget.ES2022}}).outputText;
const engine=await import('data:text/javascript;base64,'+Buffer.from(compiled).toString('base64'));

export async function fightScripts(botA,botB,{maxTurns=100,timeoutMs=2500}={}){
  if(!Number.isInteger(maxTurns)||maxTurns<1||maxTurns>500)throw Error('maxTurns must be 1..500');
  const bots=[botA,botB];
  let game=engine.createBotGame([botA.name,botB.name]);
  const events=[];
  let outcome='DRAW';
  for(let turn=1;turn<=maxTurns&&game.status==='PLAYING';turn++){
    const player=game.turn,bot=bots[player-1];
    let decision;
    try{
      decision=await runSandboxedMove(bot.source,engine.botSnapshot(game),timeoutMs);
      const canonical=engine.botDecisionToMove(game,decision,randomUUID());
      if(!canonical)throw Error('Invalid or illegal move');
      const next=engine.applyMove(game,canonical);
      if(next===game)throw Error('Engine rejected move');
      game=next;
      events.push({turn,player,bot:bot.name,accepted:true,move:{pieceId:canonical.pieceId,to:canonical.to}});
    }catch(error){
      const detail=String(error?.message||error).slice(0,300);
      events.push({turn,player,bot:bot.name,accepted:false,detail});
      game={...game,status:'FINISHED',winner:player===1?2:1,reason:`${bot.name} forfeited: ${detail}`,version:game.version+1};
      outcome='FORFEIT';break;
    }
  }
  if(game.status==='PLAYING'){
    game={...game,status:'FINISHED',winner:null,reason:'Turn limit reached',version:game.version+1};
    outcome='TURN_LIMIT';
  }else if(outcome!=='FORFEIT')outcome=game.winner?'WIN':'DRAW';
  return {outcome,winner:game.winner,reason:game.reason,events,game};
}
