import {newId} from '../utils/id';
export type Player = 1 | 2;
export type Kind = 'rock' | 'paper' | 'scissors';
export type Pos = {row:number; col:number};
export type Piece = {id:string; owner:Player; type:Kind; position:Pos};
export type Move = {gameId:string; matchId:string; moveId:string; playerId:string; pieceId:string; from:Pos; to:Pos; expectedVersion:number};
export type Seat = {id:string; name:string; ready:boolean; rematch:boolean} | null;
export type LastMove = {pieceId:string; player:Player; from:Pos; to:Pos};
export type Game = {gameId:string; matchId:string; match:number; version:number; status:'WAITING'|'PLAYING'|'FINISHED'; seats:[Seat,Seat]; pieces:Piece[]; turn:Player; winner:Player|null; reason:string; history:{moveId:string; text:string}[]; lastMove:LastMove|null};
export const kinds:Kind[]=['rock','paper','scissors'];
export const icons:Record<Kind,string>={rock:'✊',paper:'✋',scissors:'✌️'};
export const inside=(p:Pos)=>p.row>=0&&p.row<9&&p.col>=0&&p.col<9;
export const same=(a:Pos,b:Pos)=>a.row===b.row&&a.col===b.col;
export const label=(p:Pos)=>`${'abcdefghi'[p.col]}${p.row+1}`;
export const at=(pieces:Piece[],p:Pos)=>pieces.find(x=>same(x.position,p));
export const beats=(a:Kind,b:Kind)=>a==='rock'&&b==='scissors'||a==='scissors'&&b==='paper'||a==='paper'&&b==='rock';
export function initialPieces():Piece[]{
 const result:Piece[]=[];
 for(const owner of [1,2] as Player[]) for(let i=0;i<9;i++) result.push({id:`p${owner}-${i}`,owner,type:kinds[i%3],position:owner===1?{row:1+Math.floor(i/3),col:i%3}:{row:7-Math.floor(i/3),col:8-i%3}});
 return result;
}
export const fresh=(gameId:string):Game=>({gameId,matchId:newId(),match:1,version:0,status:'WAITING',seats:[null,null],pieces:[],turn:1,winner:null,reason:'',history:[],lastMove:null});
export function legal(pieces:Piece[],piece:Piece,to:Pos):boolean{
 if(!inside(to)||Math.max(Math.abs(piece.position.row-to.row),Math.abs(piece.position.col-to.col))!==1)return false;
 const target=at(pieces,to);return !target||(target.owner!==piece.owner&&beats(piece.type,target.type));
}
export function legalMoves(pieces:Piece[],piece:Piece):Pos[]{const result:Pos[]=[];for(let dr=-1;dr<=1;dr++)for(let dc=-1;dc<=1;dc++){const to={row:piece.position.row+dr,col:piece.position.col+dc};if(legal(pieces,piece,to))result.push(to)}return result}
export function hasMove(g:Game,owner:Player){return g.pieces.some(p=>p.owner===owner&&legalMoves(g.pieces,p).length>0)}
export function applyMove(g:Game,m:Move):Game{
 if(g.status!=='PLAYING'||g.gameId!==m.gameId||g.matchId!==m.matchId||g.version!==m.expectedVersion||g.history.some(h=>h.moveId===m.moveId))return g;
 const seat=g.seats[g.turn-1],piece=g.pieces.find(p=>p.id===m.pieceId);
 if(!seat||seat.id!==m.playerId||!piece||piece.owner!==g.turn||!same(piece.position,m.from)||!legal(g.pieces,piece,m.to))return g;
 const victim=at(g.pieces,m.to);
 const pieces=g.pieces.filter(p=>p.id!==victim?.id).map(p=>p.id===piece.id?{...p,position:{...m.to}}:p);
 const other=(g.turn===1?2:1) as Player;
 let reason='';let winner:Player|null=null;
 if((g.turn===1&&same(m.to,{row:8,col:8}))||(g.turn===2&&same(m.to,{row:0,col:0}))){winner=g.turn;reason=`Đưa quân vào ${label(m.to)}`}
 else if(kinds.some(k=>!pieces.some(p=>p.owner===other&&p.type===k))){winner=g.turn;reason='Loại hết một loại quân đối phương'}
 const next:{turn:Player;status:Game['status'];winner:Player|null;reason:string}={turn:other,status:winner?'FINISHED':'PLAYING',winner,reason};
 const lastMove:LastMove={pieceId:piece.id,player:g.turn,from:{...m.from},to:{...m.to}};
 const updated:Game={...g,...next,pieces,version:g.version+1,lastMove,history:[...g.history,{moveId:m.moveId,text:`${seat.name}: ${icons[piece.type]} ${label(m.from)} → ${label(m.to)}${victim?' × '+icons[victim.type]:''}`} ]};
 if(!winner&&!hasMove(updated,other))return {...updated,status:'FINISHED',reason:'Hòa do hết nước đi',lastMove};
 return updated;
}
export function start(g:Game):Game{if(g.status!=='WAITING'||!g.seats[0]?.ready||!g.seats[1]?.ready)return g;return {...g,status:'PLAYING',pieces:initialPieces(),turn:g.match%2===1?1:2,version:g.version+1,lastMove:null}}
export function rematch(g:Game):Game{if(g.status!=='FINISHED'||!g.seats[0]?.rematch||!g.seats[1]?.rematch)return g;return {...g,match:g.match+1,matchId:newId(),pieces:initialPieces(),turn:g.match%2===1?2:1,winner:null,reason:'',history:[],status:'PLAYING',version:g.version+1,lastMove:null,seats:g.seats.map(s=>s?{...s,rematch:false}:null) as [Seat,Seat]}}

// -----------------------------------------------------------------------------
// Bot-vs-Bot support. This engine accepts bot DECISIONS (data), never script text.
// Untrusted submitted scripts must be scanned and executed in an isolated runtime
// outside this module. Only validated decisions are passed to applyMove().
// -----------------------------------------------------------------------------

export type BotMove = {pieceId:string; to:Pos};
export type BotSnapshot = {
  player:Player;
  turn:Player;
  version:number;
  pieces:Piece[];
  legalMoves:Array<{pieceId:string;from:Pos;to:Pos}>;
};
export type Bot = {name:string;getMove:(snapshot:BotSnapshot)=>BotMove|null};
export type BotMatchEvent = {
  turn:number;
  player:Player;
  bot:string;
  move:BotMove|null;
  accepted:boolean;
  detail:string;
};
export type BotMatchResult = {
  game:Game;
  events:BotMatchEvent[];
  outcome:'WIN'|'DRAW'|'FORFEIT'|'TURN_LIMIT';
};

/** Calculate all valid moves. Returned objects are copies, not mutable engine state. */
export function allLegalMoves(g:Game,owner:Player=g.turn):BotSnapshot['legalMoves']{
  if(g.status!=='PLAYING'||owner!==g.turn)return [];
  return g.pieces.filter(p=>p.owner===owner).flatMap(piece=>
    legalMoves(g.pieces,piece).map(to=>({pieceId:piece.id,from:{...piece.position},to:{...to}}))
  );
}

/** Only share public board data with a bot, never player identities / room secrets. */
export function botSnapshot(g:Game):BotSnapshot{
  return {
    player:g.turn, turn:g.turn, version:g.version,
    pieces:g.pieces.map(p=>({...p,position:{...p.position}})),
    legalMoves:allLegalMoves(g),
  };
}

/** Convert an untrusted bot decision into a canonical Move validated by applyMove. */
export function botDecisionToMove(g:Game,decision:unknown,moveId:string):Move|null{
  if(g.status!=='PLAYING'||typeof moveId!=='string'||moveId.length===0||
     !decision||typeof decision!=='object')return null;
  const candidate=decision as Partial<BotMove>;
  if(typeof candidate.pieceId!=='string'||!candidate.to||
    !Number.isInteger(candidate.to.row)||!Number.isInteger(candidate.to.col))return null;
  const chosen=allLegalMoves(g).find(m=>m.pieceId===candidate.pieceId&&same(m.to,candidate.to!));
  const seat=g.seats[g.turn-1];
  if(!chosen||!seat)return null;
  return {
    gameId:g.gameId,matchId:g.matchId,moveId,playerId:seat.id,
    pieceId:chosen.pieceId,from:chosen.from,to:chosen.to,expectedVersion:g.version,
  };
}

/** Create a standalone match without the multiplayer transport. */
export function createBotGame(names:[string,string],gameId:string=newId()):Game{
  if(names.some(name=>!name.trim()))throw new Error('Each bot must have a name');
  const waiting:Game={
    ...fresh(gameId),
    seats:[
      {id:`${gameId}-bot-1`,name:names[0],ready:true,rematch:false},
      {id:`${gameId}-bot-2`,name:names[1],ready:true,rematch:false},
    ],
  };
  return start(waiting);
}

/** Pure sample bot: always chooses the first available move. */
export const firstMoveBot:Bot={
  name:'First Move Bot',
  getMove:state=>state.legalMoves.length
    ? {pieceId:state.legalMoves[0].pieceId,to:{...state.legalMoves[0].to}}
    : null,
};

/** Produce a sample bot with an injectable RNG for repeatable tests. */
export function randomBot(random:()=>number=Math.random):Bot{
  return {name:'Random Bot',getMove:state=>{
    const moves=state.legalMoves;
    if(!moves.length)return null;
    const sample=random();
    const index=Number.isFinite(sample)
      ? Math.min(moves.length-1,Math.max(0,Math.floor(sample*moves.length))) : 0;
    return {pieceId:moves[index].pieceId,to:{...moves[index].to}};
  }};
}

/**
 * Run two trusted in-process bot functions. For user-uploaded code, DO NOT call
 * this directly with evaluated functions: run code in a sandbox and pass its
 * resulting decisions through botDecisionToMove()/applyMove() instead.
 *
 * Bots returning malformed or illegal decisions forfeit. Exceptions also forfeit.
 * maxTurns prevents endless games but is not a CPU/time execution limit.
 */
export function playBotMatch(
  bots:[Bot,Bot],
  options:{maxTurns?:number;gameId?:string}={},
):BotMatchResult{
  const maxTurns=options.maxTurns??500;
  if(!Number.isSafeInteger(maxTurns)||maxTurns<1||maxTurns>100000)
    throw new Error('maxTurns must be an integer between 1 and 100000');
  let game=createBotGame([bots[0].name,bots[1].name],options.gameId);
  const events:BotMatchEvent[]=[];
  for(let turn=1;turn<=maxTurns&&game.status==='PLAYING';turn++){
    const player=game.turn;
    const bot=bots[player-1];
    const state=botSnapshot(game);
    let decision:BotMove|null=null;
    let error='';
    try{decision=bot.getMove(state)}catch(e){error=e instanceof Error?e.message:'Bot threw an error'}
    const move=error?'':botDecisionToMove(game,decision,`bot-turn-${turn}`);
    if(!move){
      events.push({turn,player,bot:bot.name,move:decision,accepted:false,detail:error||'Invalid or missing move'});
      game={...game,status:'FINISHED',winner:player===1?2:1,reason:`Bot ${bot.name} forfeited: ${error||'invalid move'}`,version:game.version+1};
      return {game,events,outcome:'FORFEIT'};
    }
    const next=applyMove(game,move);
    if(next===game){
      events.push({turn,player,bot:bot.name,move:decision,accepted:false,detail:'Engine rejected move'});
      game={...game,status:'FINISHED',winner:player===1?2:1,reason:`Bot ${bot.name} forfeited: move rejected`,version:game.version+1};
      return {game,events,outcome:'FORFEIT'};
    }
    events.push({turn,player,bot:bot.name,move:decision,accepted:true,detail:next.history[next.history.length-1]?.text??'Move accepted'});
    game=next;
  }
  if(game.status==='PLAYING'){
    game={...game,status:'FINISHED',winner:null,reason:`Draw: ${maxTurns}-turn limit reached`,version:game.version+1};
    return {game,events,outcome:'TURN_LIMIT'};
  }
  return {game,events,outcome:game.winner?'WIN':'DRAW'};
}
