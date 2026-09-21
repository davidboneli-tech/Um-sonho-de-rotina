import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import vm from 'node:vm';
import { emptyData } from '../src/domain';
import { backupText, parseBackup } from '../src/backup';
test('backup round trip and invalid input preserves validation boundary', () => {
 const data=emptyData(); assert.deepEqual(parseBackup(backupText(data)),data);
 assert.throws(()=>parseBackup('{"format":"sonho-backup-v1","data":{"version":1}}'));
 const broken=emptyData(); broken.settings.availableStart='99:99'; assert.throws(()=>parseBackup(backupText(broken)));
});
test('PWA caches whole app and serves app and pictures without network', {skip:!existsSync('dist/sw.js')}, async()=>{
 const handlers:Record<string,Function>={}, stores=new Map<string,Map<string,any>>();
 const origin='https://example.test/'; let online=true, calls=0, applied=false;
 const key=(r:any)=>new URL(typeof r==='string'?r:r.url,origin).href;
 const caches={open:async(name:string)=>{if(!stores.has(name))stores.set(name,new Map());const s=stores.get(name)!;return {put:async(r:any,v:any)=>s.set(key(r),v),match:async(r:any)=>s.get(key(r))};},keys:async()=>[...stores.keys()],delete:async(n:string)=>stores.delete(n)};
 const context={URL,Request:class{url:string;constructor(url:string){this.url=key(url);}}, caches,
 self:{location:{origin:new URL(origin).origin},registration:{scope:origin},addEventListener:(n:string,f:Function)=>handlers[n]=f,clients:{claim:async()=>{}},skipWaiting:()=>{applied=true;}},
 fetch:async(r:any)=>{calls++;if(!online)throw Error('offline');return {ok:true,redirected:false,body:readFileSync('dist/'+new URL(key(r)).pathname.slice(1))};}};
 vm.runInNewContext(readFileSync('dist/sw.js','utf8'),context);
 let pending:Promise<any>=Promise.resolve();handlers.install({waitUntil:(p:Promise<any>)=>pending=p});await pending;
 handlers.activate({waitUntil:(p:Promise<any>)=>pending=p});await pending;
 assert.ok([...stores.values()][0].size>20); const priorCalls=calls;online=false;
 for(const url of [origin,origin+'icon-180.png']) {
  let answer:any;handlers.fetch({request:{url,method:'GET',mode:url===origin?'navigate':'cors'},respondWith:(p:any)=>answer=p});
  assert.ok((await answer).body.length>0);
 }
 assert.equal(calls,priorCalls);
 let intercepted=false;handlers.fetch({request:{url:origin+'auth/login',method:'GET',mode:'navigate'},respondWith:()=>intercepted=true});assert.equal(intercepted,false);
 handlers.message({data:'APPLY_UPDATE'});assert.equal(applied,true);
});
