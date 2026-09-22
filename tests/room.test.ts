import {it,expect,vi} from 'vitest';
vi.mock('playhtml',()=>({playhtml:{}}));
import {fresh,start,type Game} from '../src/game/engine';
import {submitMove,type Room} from '../src/multiplayer/room';

it('moves one shared piece without replacing the board array',()=>{
 const state:Game=start({...fresh('MAIN'),seats:[{id:'a',name:'A',ready:true,rematch:false},{id:'b',name:'B',ready:true,rematch:false}]});
 const pieces=state.pieces;
 const other=pieces.find(p=>p.id==='p2-0');
 const room={identity:'a',read:()=>state,change:(fn:(draft:Game)=>void)=>fn(state),online:()=>new Set<string>(),close:()=>{}} satisfies Room;
 submitMove(room,{gameId:state.gameId,matchId:state.matchId,moveId:'test-1',playerId:'a',pieceId:'p1-0',from:{row:1,col:0},to:{row:0,col:0},expectedVersion:state.version});
 expect(state.pieces).toBe(pieces);
 expect(state.pieces.find(p=>p.id==='p2-0')).toBe(other);
 expect(state.pieces.find(p=>p.id==='p1-0')?.position).toEqual({row:0,col:0});
 expect(state.pieces).toHaveLength(18);
});
