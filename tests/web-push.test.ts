import test from 'node:test';
import assert from 'node:assert/strict';
import { emptyData, newEvent, dayKey, addDays } from '../src/domain';
import { syncWebPush, testWebPush } from '../src/webPush';

test('offline edits are sent on reconnection; deletion clears the server schedule', async () => {
  const originals = Object.fromEntries(['localStorage','navigator','Notification','fetch','window'].map(k => [k, Object.getOwnPropertyDescriptor(globalThis,k)]));
  Object.defineProperty(globalThis,'window',{configurable:true,value:globalThis});
  const stored = new Map([['sonho.push.v1', JSON.stringify({token:'A'.repeat(43),device:'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',enabled:true})]]);
  let online = true;
  let testStatus = 200;
  const uploads:any[] = [];
  Object.defineProperty(globalThis,'localStorage',{configurable:true,value:{getItem:(k:string)=>stored.get(k)??null,setItem:(k:string,v:string)=>stored.set(k,v)}});
  Object.defineProperty(globalThis,'navigator',{configurable:true,value:{get onLine(){return online},serviceWorker:{ready:Promise.resolve({pushManager:{getSubscription:async()=>({})}})}}});
  Object.defineProperty(globalThis,'Notification',{configurable:true,value:{permission:'granted'}});
  Object.defineProperty(globalThis,'fetch',{configurable:true,value:async(url:string, options:any)=>{
    if(url.endsWith('/sync')) uploads.push(JSON.parse(options.body));
    return new Response(JSON.stringify({ok:true,failed:0}),{status:url.endsWith('/test')?testStatus:200});
  }});
  try {
    const d=emptyData();
    d.events=[{...newEvent(addDays(dayKey(),1)),start:'10:00',reminders:[15]}];
    await syncWebPush(d);
    assert.equal(uploads.length,1);
    const before=uploads[0].items[0].at;
    online=false;
    d.events[0].start='11:00';
    await assert.rejects(syncWebPush(d),/Sem conexão/);
    assert.equal(uploads.length,1);
    online=true;
    await syncWebPush(d);
    assert.equal(uploads[1].items[0].at-before,3600000);
    d.events=[];
    await syncWebPush(d);
    assert.deepEqual(uploads[2].items,[]);
    await syncWebPush(d);
    assert.equal(uploads.length,3);
    testStatus=429;
    await assert.rejects(testWebPush(),/Aguarde um minuto/);
  } finally {
    for(const [key, descriptor] of Object.entries(originals)) {
      if(descriptor) Object.defineProperty(globalThis,key,descriptor);
      else Reflect.deleteProperty(globalThis,key);
    }
  }
});
