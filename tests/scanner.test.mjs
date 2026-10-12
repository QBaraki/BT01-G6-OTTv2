import test from 'node:test';
import assert from 'node:assert/strict';
import {scanScript} from '../server/scanner.mjs';
test('allows basic bot contract',()=>assert.equal(scanScript('export function getMove(state) { return state.legalMoves[0] ?? null; }').status,'PASSED'));
test('rejects missing entry point',()=>assert.equal(scanScript('const x = 1').status,'REJECTED'));
test('rejects restricted global',()=>assert.equal(scanScript('export function getMove(state) { eval("1"); return null; }').status,'REJECTED'));
test('rejects imports',()=>assert.equal(scanScript('import x from "fs"; export function getMove(s){return null;}').status,'REJECTED'));
test('rejects invalid syntax',()=>assert.equal(scanScript('export function getMove( {').status,'REJECTED'));
