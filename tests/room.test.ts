import {it,expect,vi} from 'vitest';
vi.mock('playhtml',()=>({playhtml:{}}));
import {fresh,start,type Game} from '../src/game/engine';
import {submitMove,shouldDeleteRoom,type Room,type RoomMeta} from '../src/multiplayer/room';
import {roomKey} from '../src/multiplayer/roomKey';

it('moves one shared piece without replacing the board array',()=>{
 const state:Game=start({...fresh('MAIN'),seats:[{id:'a',name:'A',ready:true,rematch:false},{id:'b',name:'B',ready:true,rematch:false}]});
 const pieces=state.pieces;
 const other=pieces.find(p=>p.id==='p2-0');
 const room={code:'ABC123',identity:'a',read:()=>state,change:(fn:(draft:Game)=>void)=>fn(state),online:()=>new Set<string>(),listed:()=>true,close:()=>{}} satisfies Room;
 submitMove(room,{gameId:state.gameId,matchId:state.matchId,moveId:'test-1',playerId:'a',pieceId:'p1-0',from:{row:1,col:0},to:{row:0,col:0},expectedVersion:state.version});
 expect(state.pieces).toBe(pieces);
 expect(state.pieces.find(p=>p.id==='p2-0')).toBe(other);
 expect(state.pieces.find(p=>p.id==='p1-0')?.position).toEqual({row:0,col:0});
 expect(state.pieces).toHaveLength(18);
});

it('deletes a finished room when fewer than two players are online',()=>{
 const meta:RoomMeta={code:'ABC123',gameId:'g',createdAt:0,status:'FINISHED',player1:'a',player2:'b',name1:'A',name2:'B'};
 expect(shouldDeleteRoom(meta,new Set(['a','b']))).toBe(false);
 expect(shouldDeleteRoom(meta,new Set(['a']))).toBe(true);
 expect(shouldDeleteRoom({...meta,status:'PLAYING'},new Set(['a']))).toBe(false);
 expect(shouldDeleteRoom({...meta,status:'WAITING',player1:null,player2:null},new Set())).toBe(true);
});

it('uses a new lobby for each server session',()=>{
 expect(roomKey('LOBBY','session-a')).not.toBe(roomKey('LOBBY','session-b'));
});

import {createRoom,joinRoom,type Lobby} from '../src/multiplayer/room';
it('creates listed rooms and joins by code without mixing their boards',()=>{
 const metas=new Map<string,RoomMeta>();
 const states=new Map<string,Game>();
 const makeLobby=(identity:string):Lobby=>({
  identity,list:()=>[...metas.values()],online:()=>new Set(['a','b']),subscribe:()=>()=>{},
  has:(code,id)=>metas.get(code)?.gameId===id,
  add:m=>{metas.set(m.code,m)},
  update:(code,g)=>{const m=metas.get(code);if(m){m.status=g.status;m.player1=g.seats[0]?.id??null;m.player2=g.seats[1]?.id??null}},
  remove:code=>{metas.delete(code)},
  channel:m=>{
   if(!states.has(m.gameId))states.set(m.gameId,fresh(m.gameId));
   const state=states.get(m.gameId)!;
   return {getData:()=>state,setData:(value:Game|((draft:Game)=>void))=>{if(typeof value==='function')value(state);else Object.assign(state,value)},onUpdate:()=>()=>{},destroy:()=>{}};
  },
  setPresence:()=>{},cleanup:()=>{},
 });
 const a=makeLobby('a'),b=makeLobby('b');
 const roomA=createRoom(a,'Alice',()=>{});
 const roomB=createRoom(a,'Alice',()=>{});
 expect(roomA.code).not.toBe(roomB.code);
 const joined=joinRoom(b,roomA.code,'Bob',()=>{});
 expect(joined.read().seats.map(s=>s?.name)).toEqual(['Alice','Bob']);
 expect(roomB.read().seats[1]).toBeNull();
 expect(a.list()).toHaveLength(2);
 expect(()=>joinRoom(b,'INVALID','Bob',()=>{})).toThrow('Không tìm thấy phòng');
});
