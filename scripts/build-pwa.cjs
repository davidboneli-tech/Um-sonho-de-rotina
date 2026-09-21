const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const root = path.resolve(__dirname, '../dist');
const manifest = { id: './', name: 'Um sonho de rotina', short_name: 'Minha rotina', lang: 'pt-BR', start_url: './', scope: './', display: 'standalone', orientation: 'portrait', background_color: '#FCF8F2', theme_color: '#FCF8F2', icons: [192,512].map(n => ({src:`icon-${n}.png`,sizes:`${n}x${n}`,type:'image/png',purpose:'any'})) };
fs.writeFileSync(path.join(root, 'manifest.webmanifest'), JSON.stringify(manifest));
let html = fs.readFileSync(path.join(root,'index.html'),'utf8');
html = html.replace('lang="en"','lang="pt-BR"').replace('shrink-to-fit=no','shrink-to-fit=no, viewport-fit=cover');
html = html.replace('</head>', `<meta name="theme-color" content="#FCF8F2"><meta name="apple-mobile-web-app-capable" content="yes"><meta name="apple-mobile-web-app-status-bar-style" content="default"><meta name="apple-mobile-web-app-title" content="Minha rotina"><link rel="manifest" href="./manifest.webmanifest"><link rel="apple-touch-icon" href="./icon-180.png"><style>body{background:#FCF8F2}#root{padding-top:env(safe-area-inset-top);padding-bottom:env(safe-area-inset-bottom);box-sizing:border-box}input,textarea{font-size:16px}</style></head>`);
fs.writeFileSync(path.join(root,'index.html'), html);
const walk = dir => fs.readdirSync(dir,{withFileTypes:true}).flatMap(e => e.isDirectory()?walk(path.join(dir,e.name)):[path.join(dir,e.name)]);
const files = walk(root).filter(f=> !f.endsWith('/sw.js') && !f.endsWith('.map'));
const hash = crypto.createHash('sha256');
hash.update(fs.readFileSync(__filename));
files.forEach(f => hash.update(fs.readFileSync(f)));
const version = hash.digest('hex').slice(0,16);
const urls = files.map(f => path.relative(root,f) === 'index.html' ? './' : './'+path.relative(root,f).split(path.sep).join('/'));
if (urls.some(url => /[@ ]/.test(url))) throw new Error('Caminho de recurso incompatível com a hospedagem.');
fs.writeFileSync(path.join(root,'sw.js'), `const CACHE='sonho-pwa-${version}';
const ASSETS=${JSON.stringify(urls)};
self.addEventListener('install', event => event.waitUntil(caches.open(CACHE).then(async cache => {
 for (const url of ASSETS) {
  const response = await fetch(new Request(url, {cache:'reload', credentials:'same-origin'}));
  if (!response.ok || response.redirected) throw new Error('Falha ao guardar '+url);
  const type = response.headers.get('content-type') || '';
  if (url !== './' && type.includes('text/html')) throw new Error('Conteúdo inesperado em '+url);
  await cache.put(url, response);
 }
})));
self.addEventListener('message', event => { if(event.data==='APPLY_UPDATE') self.skipWaiting(); });
self.addEventListener('activate', event => event.waitUntil((async()=>{
 for (const key of await caches.keys()) if(key.startsWith('sonho-pwa-') && key!==CACHE) await caches.delete(key);
 await self.clients.claim();
})()));
self.addEventListener('fetch', event => {
 const url = new URL(event.request.url);
 if (event.request.method!=='GET' || url.origin!==self.location.origin || !url.href.startsWith(self.registration.scope)) return;
 const appRoot = new URL('./',self.registration.scope);
 if (event.request.mode==='navigate' && (url.pathname===appRoot.pathname || url.pathname===appRoot.pathname+'index.html')) {
  event.respondWith(caches.open(CACHE).then(cache=>cache.match('./')).then(r=>r || fetch(event.request)));
 } else if (ASSETS.some(a=>new URL(a,self.registration.scope).href===url.href)) {
  event.respondWith(caches.open(CACHE).then(cache=>cache.match(event.request)).then(r=>r || fetch(event.request)));
 }
});
self.addEventListener('push', event => event.waitUntil((async()=>{
 let item = {};
 try { item = event.data ? event.data.json() : {}; } catch {}
 const at = Number(item.at);
 const late = Number.isFinite(at) && Date.now()-at > 10*60000;
 await self.registration.showNotification('Um sonho de rotina', {
  body: late ? 'Um aviso chegou com atraso. Abra a agenda para conferir seus registros.' : (typeof item.body==='string' ? item.body.slice(0,220) : 'Abra a agenda para conferir seu lembrete.'),
  icon: new URL('./icon-192.png',self.registration.scope).href,
  badge: new URL('./icon-192.png',self.registration.scope).href,
  tag: typeof item.tag==='string' ? item.tag.slice(0,240) : 'sonho-aviso',
  silent: true,
  renotify: false,
  data: {url:new URL('./',self.registration.scope).href}
 });
})()));
self.addEventListener('notificationclick', event => {
 event.notification.close();
 event.waitUntil((async()=>{
  const root = new URL('./',self.registration.scope).href;
  const windows = await self.clients.matchAll({type:'window',includeUncontrolled:true});
  const existing = windows.find(client => client.url===root || client.url.startsWith(root+'?'));
  if(existing) await existing.focus();
  else await self.clients.openWindow(root);
 })());
});`);
console.log(`PWA: ${files.length} arquivos disponíveis offline. Cache ${version}.`);
