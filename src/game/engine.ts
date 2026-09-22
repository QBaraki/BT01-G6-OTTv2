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
