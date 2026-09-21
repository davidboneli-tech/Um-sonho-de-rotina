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
test('push allows notification sound and click opens only this agenda', {skip:!existsSync('dist/sw.js')}, async()=>{
 const handlers:Record<string,Function>={}; let notification:any, opened='', closed=false;
 const scope='https://planner.example/';
 vm.runInNewContext(readFileSync('dist/sw.js','utf8'), {
  URL, Date,
  self:{location:{origin:'https://planner.example'}, registration:{scope,showNotification:async(title:string,options:any)=>{notification={title,...options};}},
   addEventListener:(name:string,fn:Function)=>handlers[name]=fn,
   clients:{matchAll:async()=>[],openWindow:async(url:string)=>{opened=url;}}}
 });
 let promise:Promise<any>=Promise.resolve();
 handlers.push({data:{json:()=>({body:'Lembrete de teste',tag:'test:1',at:Date.now(),url:'https://attacker.example'})},waitUntil:(p:Promise<any>)=>promise=p});
 await promise; assert.equal(notification.silent,false); assert.equal(notification.renotify,false);
 assert.equal(notification.body,'Lembrete de teste'); assert.equal(notification.data.url,scope);
 handlers.notificationclick({notification:{...notification,close:()=>{closed=true;}},waitUntil:(p:Promise<any>)=>promise=p});
 await promise; assert.ok(closed); assert.equal(opened,scope);
 handlers.push({data:{json:()=>{throw Error('invalid');}},waitUntil:(p:Promise<any>)=>promise=p});
 await promise; assert.match(notification.body,/Abra a agenda/);
});
test('PWA caches whole app and serves app and pictures without network', {skip:!existsSync('dist/sw.js')}, async()=>{
 const handlers:Record<string,Function>={}, stores=new Map<string,Map<string,any>>();
 const origin='https://example.test/'; let online=true, calls=0, applied=false;
 const key=(r:any)=>new URL(typeof r==='string'?r:r.url,origin).href;
 const caches={open:async(name:string)=>{if(!stores.has(name))stores.set(name,new Map());const s=stores.get(name)!;return {put:async(r:any,v:any)=>s.set(key(r),v),match:async(r:any)=>s.get(key(r))};},keys:async()=>[...stores.keys()],delete:async(n:string)=>stores.delete(n)};
 const context={URL,Request:class{url:string;constructor(url:string){this.url=key(url);}}, caches,
 self:{location:{origin:new URL(origin).origin},registration:{scope:origin},addEventListener:(n:string,f:Function)=>handlers[n]=f,clients:{claim:async()=>{}},skipWaiting:()=>{applied=true;}},
 fetch:async(r:any)=>{calls++;if(!online)throw Error('offline');const pathname=new URL(key(r)).pathname; if(pathname==='/index.html') return {ok:true,redirected:true};
 return {ok:true,redirected:false,headers:{get:()=>pathname==='/'?'text/html':'application/octet-stream'},body:readFileSync('dist/'+(pathname==='/'?'index.html':pathname.slice(1)))};}};
 const source=readFileSync('dist/sw.js','utf8');
 const assets=JSON.parse(source.match(/const ASSETS=(\[.*?\]);/)![1]);
 assert.ok(assets.includes('./')); assert.ok(!assets.includes('./index.html'));
 assert.ok(assets.every((a:string)=>!a.includes('@') && !a.endsWith('.ttf')));
 vm.runInNewContext(source,context);
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
