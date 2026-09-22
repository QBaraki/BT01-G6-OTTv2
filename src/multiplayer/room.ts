import {playhtml} from 'playhtml';
import {newId} from '../utils/id';
import {fresh,type Game,type Move,applyMove,start,rematch,initialPieces} from '../game/engine';
export type Room={read:()=>Game;change:(fn:(draft:Game)=>void)=>void;online:()=>Set<string>;close:()=>void;identity:string};
export async function connect(code:string,onChange:()=>void):Promise<Room>{
 await playhtml.init({room:`ottv2-${code}`});
 const channel=playhtml.createPageData<Game>('game',fresh(code));
 const identity=playhtml.presence.getMyIdentity().publicKey;
 const online=()=>new Set([...playhtml.presence.getPresences().values()].map(p=>p.playerIdentity?.publicKey).filter((id):id is string=>!!id));
 const offData=channel.onUpdate(onChange);
 const offPresence=playhtml.presence.onPresenceChange('ott',onChange);
 playhtml.presence.setMyPresence('ott',{room:code});
 return {read:()=>channel.getData(),change:fn=>channel.setData(fn),online,identity,close:()=>{offData();offPresence();channel.destroy()}};
}
export function submitMove(room:Room,move:Move){room.change(d=>{
 const next=applyMove(d,move);
 if(next===d)return;
 // Keep the shared array and existing piece objects. Replacing the entire array
 // can drop pieces in playhtml's CRDT adapter.
 const capturedIndex=d.pieces.findIndex(p=>p.id!==move.pieceId&&p.position.row===move.to.row&&p.position.col===move.to.col);
 if(capturedIndex>=0)d.pieces.splice(capturedIndex,1);
 const moving=d.pieces.find(p=>p.id===move.pieceId);
 if(!moving)return;
 moving.position.row=move.to.row;
 moving.position.col=move.to.col;
 d.history.push(next.history[next.history.length-1]);
 d.turn=next.turn;d.version=next.version;d.status=next.status;d.winner=next.winner;d.reason=next.reason;
})}
export function join(room:Room,name:string){room.change(d=>{if(d.seats.some(s=>s?.id===room.identity))return;const slot=d.seats.findIndex(s=>s===null);if(slot>=0)d.seats.splice(slot,1,{id:room.identity,name,ready:false,rematch:false})})}
export function ready(room:Room){room.change(d=>{const s=d.seats.find(x=>x?.id===room.identity);if(!s||d.status!=='WAITING')return;s.ready=!s.ready;const next=start(d);if(next===d)return;d.pieces.splice(0,d.pieces.length,...initialPieces());d.turn=next.turn;d.version=next.version;d.status='PLAYING'})}
export function agreeRematch(room:Room){room.change(d=>{const s=d.seats.find(x=>x?.id===room.identity);if(!s||d.status!=='FINISHED')return;s.rematch=true;const next=rematch(d);if(next===d)return;d.match=next.match;d.matchId=next.matchId;d.pieces.splice(0,d.pieces.length,...next.pieces);d.history.splice(0,d.history.length);d.turn=next.turn;d.winner=null;d.reason='';d.status='PLAYING';d.version=next.version;d.seats.forEach(seat=>{if(seat)seat.rematch=false})})}
export function surrender(room:Room){room.change(d=>{const i=d.seats.findIndex(x=>x?.id===room.identity);if(i>=0&&d.status==='PLAYING'){d.status='FINISHED';d.winner=(i===0?2:1);d.reason='Đối phương đầu hàng';d.version++}})}

export function repairEmptyBoard(room:Room){room.change(d=>{
 if(d.status!=='PLAYING'||d.pieces.length!==0||!d.seats.some(s=>s?.id===room.identity))return;
 // An old broken match may already contain a move, so restart it cleanly.
 d.match++;d.matchId=newId();d.pieces.push(...initialPieces());
 d.history.splice(0,d.history.length);d.turn=d.match%2===1?1:2;
 d.winner=null;d.reason='';d.version++;
})}
