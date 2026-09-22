import {playhtml} from 'playhtml';
import {newId} from '../utils/id';
import {fresh,type Game,type Move,applyMove,start,rematch,initialPieces} from '../game/engine';
import {roomKey} from './roomKey';

export type RoomMeta={code:string;gameId:string;createdAt:number;status:Game['status'];player1:string|null;player2:string|null;name1:string;name2:string};
type Registry={rooms:Record<string,RoomMeta>};
type Channel<T>={getData:()=>T;setData:(value:T|((draft:T)=>void))=>void;onUpdate:(callback:(data:T)=>void)=>()=>void;destroy:()=>void};
export type Lobby={identity:string;list:()=>RoomMeta[];online:()=>Set<string>;subscribe:(callback:()=>void)=>()=>void;has:(code:string,gameId:string)=>boolean;add:(meta:RoomMeta)=>void;update:(code:string,game:Game)=>void;remove:(code:string,gameId:string)=>void;channel:(meta:RoomMeta)=>Channel<Game>;setPresence:(code:string|null)=>void;cleanup:()=>void};
export type Room={code:string;identity:string;read:()=>Game;change:(fn:(draft:Game)=>void)=>void;online:()=>Set<string>;close:()=>void;listed:()=>boolean};
const normalize=(code:string)=>code.trim().toUpperCase();
const alphabet='ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
const makeCode=()=>Array.from(crypto.getRandomValues(new Uint8Array(6)),b=>alphabet[b%alphabet.length]).join('');
export function shouldDeleteRoom(meta:RoomMeta,active:Set<string>):boolean{
 const seats=[meta.player1,meta.player2].filter((id):id is string=>!!id);
 return seats.length===0||(meta.status==='FINISHED'&&seats.filter(id=>active.has(id)).length<2);
}

export async function connectLobby(onUpdate:()=>void):Promise<Lobby>{
 await playhtml.init({room:roomKey('LOBBY',__OTT_SESSION_ID__)});
 const registry=playhtml.createPageData<Registry>('rooms',{rooms:{}}) as Channel<Registry>;
 const identity=playhtml.presence.getMyIdentity().publicKey;
 const online=()=>new Set([...playhtml.presence.getPresences().values()].map(p=>p.playerIdentity?.publicKey).filter((id):id is string=>!!id));
 const listeners=new Set<()=>void>();listeners.add(onUpdate);
 let timer:ReturnType<typeof setTimeout>|undefined;
 const emit=()=>listeners.forEach(fn=>fn());
 registry.onUpdate(()=>{emit();scheduleCleanup()});
 playhtml.presence.onPresenceChange('ott',()=>{emit();scheduleCleanup()});
 playhtml.presence.setMyPresence('ott',{roomCode:null});
 const cleanup=()=>{
  const active=online();
  const remove=Object.values(registry.getData().rooms).filter(meta=>shouldDeleteRoom(meta,active)).map(meta=>meta.code);
  if(remove.length)registry.setData(d=>{for(const code of remove)if(d.rooms[code]&&shouldDeleteRoom(d.rooms[code],active))delete d.rooms[code]});
 };
 function scheduleCleanup(){if(timer)clearTimeout(timer);timer=setTimeout(cleanup,1800)}
 scheduleCleanup();
 return {
  identity,list:()=>Object.values(registry.getData().rooms).sort((a,b)=>b.createdAt-a.createdAt),online,
  subscribe:fn=>{listeners.add(fn);return ()=>listeners.delete(fn)},
  has:(code,gameId)=>registry.getData().rooms[code]?.gameId===gameId,
  add:meta=>registry.setData(d=>{d.rooms[meta.code]=meta}),
  update:(code,game)=>registry.setData(d=>{const m=d.rooms[code];if(!m||m.gameId!==game.gameId)return;m.status=game.status;m.player1=game.seats[0]?.id??null;m.player2=game.seats[1]?.id??null;m.name1=game.seats[0]?.name??'';m.name2=game.seats[1]?.name??''}),
  remove:(code,gameId)=>registry.setData(d=>{if(d.rooms[code]?.gameId===gameId)delete d.rooms[code]}),
  channel:meta=>playhtml.createPageData<Game>(`game-${meta.gameId}`,fresh(meta.gameId)) as Channel<Game>,
  setPresence:code=>playhtml.presence.setMyPresence('ott',{roomCode:code}),cleanup,
 };
}

function syncMeta(lobby:Lobby,code:string,g:Game){lobby.update(code,g)}

export function createRoom(lobby:Lobby,name:string,onUpdate:()=>void):Room{
 let code=makeCode();while(lobby.list().some(m=>m.code===code))code=makeCode();
 const gameId=newId();
 const meta:RoomMeta={code,gameId,createdAt:Date.now(),status:'WAITING',player1:lobby.identity,player2:null,name1:name,name2:''};
 const channel=lobby.channel(meta);
 channel.setData(d=>{d.seats.splice(0,1,{id:lobby.identity,name,ready:false,rematch:false})});
 lobby.add(meta);
 return openRoom(lobby,meta,channel,onUpdate);
}
export function joinRoom(lobby:Lobby,rawCode:string,name:string,onUpdate:()=>void):Room{
 const code=normalize(rawCode),meta=lobby.list().find(m=>m.code===code);
 if(!meta)throw new Error('Không tìm thấy phòng với mã này');
 const channel=lobby.channel(meta);
 channel.setData(d=>{if(d.seats.some(s=>s?.id===lobby.identity))return;const i=d.seats.findIndex(s=>s===null);if(i>=0)d.seats.splice(i,1,{id:lobby.identity,name,ready:false,rematch:false})});
 return openRoom(lobby,meta,channel,onUpdate);
}
function openRoom(lobby:Lobby,meta:RoomMeta,channel:Channel<Game>,onUpdate:()=>void):Room{
 const sync=()=>{syncMeta(lobby,meta.code,channel.getData());onUpdate()};
 const unsubscribe=channel.onUpdate(sync);
 lobby.setPresence(meta.code);
 sync();
 return {code:meta.code,identity:lobby.identity,read:()=>channel.getData(),online:lobby.online,
  listed:()=>lobby.has(meta.code,meta.gameId),
  change:fn=>{channel.setData(fn);sync()},
  close:()=>{unsubscribe();channel.destroy();lobby.setPresence(null);lobby.cleanup()}};
}
export function leave(room:Room){room.change(d=>{
 const i=d.seats.findIndex(s=>s?.id===room.identity);if(i<0)return;
 d.seats.splice(i,1,null);
 if(d.status!=='FINISHED'){d.status='WAITING';d.pieces.splice(0,d.pieces.length);d.history.splice(0,d.history.length);d.winner=null;d.reason='';d.lastMove=null;d.seats.forEach(s=>{if(s){s.ready=false;s.rematch=false}});d.matchId=newId();d.version++}
})}
export function submitMove(room:Room,move:Move){room.change(d=>{
 const next=applyMove(d,move);if(next===d)return;
 const victim=d.pieces.findIndex(p=>p.id!==move.pieceId&&p.position.row===move.to.row&&p.position.col===move.to.col);
 if(victim>=0)d.pieces.splice(victim,1);
 const moving=d.pieces.find(p=>p.id===move.pieceId);if(!moving)return;
 moving.position.row=move.to.row;moving.position.col=move.to.col;
 d.history.push(next.history[next.history.length-1]);d.turn=next.turn;d.version=next.version;d.status=next.status;d.winner=next.winner;d.reason=next.reason;d.lastMove=next.lastMove;
})}
export function ready(room:Room){room.change(d=>{const s=d.seats.find(x=>x?.id===room.identity);if(!s||d.status!=='WAITING')return;s.ready=!s.ready;const next=start(d);if(next===d)return;d.pieces.push(...initialPieces());d.turn=next.turn;d.version=next.version;d.status='PLAYING';d.lastMove=null})}
export function agreeRematch(room:Room){room.change(d=>{const s=d.seats.find(x=>x?.id===room.identity);if(!s||d.status!=='FINISHED')return;s.rematch=true;const next=rematch(d);if(next===d)return;d.match=next.match;d.matchId=next.matchId;d.pieces.splice(0,d.pieces.length);d.pieces.push(...initialPieces());d.history.splice(0,d.history.length);d.turn=next.turn;d.winner=null;d.reason='';d.status='PLAYING';d.version=next.version;d.lastMove=null;d.seats.forEach(seat=>{if(seat)seat.rematch=false})})}
export function surrender(room:Room){room.change(d=>{const i=d.seats.findIndex(x=>x?.id===room.identity);if(i>=0&&d.status==='PLAYING'){d.status='FINISHED';d.winner=i===0?2:1;d.reason='Đối phương đầu hàng';d.version++}})}
