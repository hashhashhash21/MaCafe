/* ABC Virtual Barista Local Training Recorder
   Sidecar only: does not modify the original compiled application bundle.
   Browser security requires the user to choose a parent folder. This add-on creates
   ABC_Barista_Training/{videos,logs} inside it and stores the directory handle in IndexedDB.
*/
(()=>{
'use strict';
const DB='abc-barista-training', STORE='handles', KEY='root';
const state={root:null,videoDir:null,logsDir:null,events:[],recorders:new WeakMap(),offline:false,manifest:null,overlay:null};
const now=()=>new Date().toISOString();
const safe=s=>String(s||'').replace(/[^a-zA-Z0-9._-]+/g,'_').slice(0,80)||'clip';
function idb(){return new Promise((res,rej)=>{const r=indexedDB.open(DB,1);r.onupgradeneeded=()=>r.result.createObjectStore(STORE);r.onsuccess=()=>res(r.result);r.onerror=()=>rej(r.error)})}
async function putHandle(h){const d=await idb();return new Promise((res,rej)=>{const t=d.transaction(STORE,'readwrite');t.objectStore(STORE).put(h,KEY);t.oncomplete=res;t.onerror=()=>rej(t.error)})}
async function getHandle(){const d=await idb();return new Promise((res,rej)=>{const t=d.transaction(STORE,'readonly'),r=t.objectStore(STORE).get(KEY);r.onsuccess=()=>res(r.result||null);r.onerror=()=>rej(r.error)})}
async function setup(h){state.root=await h.getDirectoryHandle('ABC_Barista_Training',{create:true});state.videoDir=await state.root.getDirectoryHandle('videos',{create:true});state.logsDir=await state.root.getDirectoryHandle('logs',{create:true});await writeManifestIfMissing();status('Folder ready');}
async function writeFile(dir,name,data){const h=await dir.getFileHandle(name,{create:true}),w=await h.createWritable();await w.write(data);await w.close();}
async function writeManifestIfMissing(){try{const h=await state.root.getFileHandle('manifest.json');state.manifest=JSON.parse(await (await h.getFile()).text());}catch{state.manifest={version:1,intents:[{id:'welcome',match:['hello','hi','مرحبا','السلام'],video:'videos/welcome.webm'},{id:'thanks',match:['thank','thanks','شكرا','شكرًا'],video:'videos/thanks.webm'}]};await writeFile(state.root,'manifest.json',JSON.stringify(state.manifest,null,2));}}
async function flush(){if(!state.logsDir||!state.events.length)return;const lines=state.events.splice(0).map(x=>JSON.stringify(x)).join('\n')+'\n';const name=`interactions-${new Date().toISOString().slice(0,10)}-${Date.now()}.jsonl`;await writeFile(state.logsDir,name,lines).catch(()=>{});}
function log(type,data={}){state.events.push({ts:now(),type,url:location.href,...data});if(state.events.length>=20)flush();}
function targetInfo(el){if(!el)return{};return{tag:el.tagName,id:el.id||'',role:el.getAttribute?.('role')||'',aria:el.getAttribute?.('aria-label')||'',text:(el.innerText||el.value||'').trim().slice(0,240)}}
function wireInteractions(){document.addEventListener('click',e=>log('click',targetInfo(e.target)),true);document.addEventListener('change',e=>log('change',targetInfo(e.target)),true);document.addEventListener('submit',e=>log('submit',targetInfo(e.target)),true);document.addEventListener('keydown',e=>{if(e.key==='Enter'){const el=e.target,txt=(el?.value||'').trim();if(txt){log('user_text',{text:txt,...targetInfo(el)});if(state.offline)playIntent(txt);}}},true);window.addEventListener('beforeunload',()=>flush());setInterval(flush,15000);}
function watchVideos(){const attached=new WeakSet();const attach=v=>{if(attached.has(v))return;attached.add(v);v.addEventListener('play',()=>startVideoRecord(v));v.addEventListener('pause',()=>stopVideoRecord(v,'pause'));v.addEventListener('ended',()=>stopVideoRecord(v,'ended'));};document.querySelectorAll('video').forEach(attach);new MutationObserver(ms=>ms.forEach(m=>m.addedNodes.forEach(n=>{if(n.nodeType!==1)return;if(n.tagName==='VIDEO')attach(n);n.querySelectorAll?.('video').forEach(attach)}))).observe(document.documentElement,{childList:true,subtree:true});}
function bestMime(){return ['video/webm;codecs=vp9,opus','video/webm;codecs=vp8,opus','video/webm'].find(x=>MediaRecorder.isTypeSupported(x))||''}
function startVideoRecord(v){if(!state.videoDir||state.recorders.has(v)||typeof v.captureStream!=='function')return;try{const stream=v.captureStream(),chunks=[],mime=bestMime(),r=new MediaRecorder(stream,mime?{mimeType:mime}:undefined),started=Date.now();r.ondataavailable=e=>{if(e.data?.size)chunks.push(e.data)};r.onstop=async()=>{if(!chunks.length)return;const name=`avatar-${started}-${safe(v.getAttribute('aria-label')||v.id||'video')}.webm`;await writeFile(state.videoDir,name,new Blob(chunks,{type:r.mimeType||'video/webm'}));const clip=`videos/${name}`;log('avatar_clip_saved',{file:clip,durationMs:Date.now()-started});if(learning.current){learning.current.clips.push(clip);learning.current.finalized=false;}};r.start(1000);state.recorders.set(v,r);log('avatar_record_start',targetInfo(v));}catch(e){log('avatar_record_error',{message:String(e)})}}
function stopVideoRecord(v,reason){const r=state.recorders.get(v);if(!r)return;state.recorders.delete(v);if(r.state!=='inactive')r.stop();log('avatar_record_stop',{reason,...targetInfo(v)});}
async function fileByPath(path){if(!state.root)return null;const parts=path.split('/').filter(Boolean);let d=state.root;for(let i=0;i<parts.length-1;i++)d=await d.getDirectoryHandle(parts[i]);const h=await d.getFileHandle(parts.at(-1));return h.getFile();}
function normalize(s){return s.toLowerCase().normalize('NFKD').replace(/[\u064B-\u065F]/g,'').trim()}
async function playIntent(text){if(!state.manifest)return;const q=normalize(text);const it=state.manifest.intents.find(i=>(i.match||[]).some(k=>q.includes(normalize(k))));if(!it)return log('offline_no_match',{text});try{const f=await fileByPath(it.video),url=URL.createObjectURL(f);showOverlay(url,it.id);log('offline_match',{text,intent:it.id,video:it.video});}catch(e){log('offline_video_missing',{intent:it.id,video:it.video,message:String(e)})}}
function showOverlay(url,label){if(!state.overlay){const box=document.createElement('div');box.id='abc-offline-video';box.style.cssText='position:fixed;right:18px;bottom:70px;width:min(360px,42vw);z-index:2147483646;background:#111;border-radius:14px;overflow:hidden;box-shadow:0 8px 30px #0007';box.innerHTML='<video autoplay playsinline style="width:100%;display:block"></video><div style="padding:6px 10px;color:white;font:12px system-ui"></div>';document.body.appendChild(box);state.overlay=box;}const v=state.overlay.querySelector('video');v.src=url;state.overlay.querySelector('div').textContent='Offline: '+label;v.onended=()=>{URL.revokeObjectURL(url);state.overlay.style.display='none'};state.overlay.style.display='block';}
function status(t){const e=document.getElementById('abc-rec-status');if(e)e.textContent=t}
function ui(){/* v25: recorder controls intentionally hidden from customer UI */}
async function restore(){try{const h=await getHandle();if(h&&await h.queryPermission({mode:'readwrite'})==='granted')await setup(h);else if(h)status('Click Training folder to re-authorize');}catch{}}

// ---- Enhanced conversation/tool learning layer ----
const learning={turn:0,current:null,lastTranscript:[],toolCalls:[],clipSeq:0};
function emitTrainingEvent(type,data={}){ log(type,data); try{window.dispatchEvent(new CustomEvent('abc-training-event',{detail:{type,ts:now(),...data}}))}catch{} }
function textOf(n){return (n?.innerText||n?.textContent||'').replace(/\s+/g,' ').trim()}
function scanTranscript(){
  const root=[...document.querySelectorAll('*')].find(e=>textOf(e)==='Live Transcript')?.parentElement;
  if(!root)return;
  const msgs=[...root.querySelectorAll('*')].filter(e=>{const t=textOf(e);return t==='You'||/^Sara$/i.test(t)||/^Maram$/i.test(t)||/^مرام$/i.test(t)||/^Barista/i.test(t)}).map(role=>{const box=role.parentElement;const all=textOf(box);const r=textOf(role);return {role:r==='You'?'user':'assistant',content:all.slice(r.length).trim()}}).filter(x=>x.content);
  const sig=JSON.stringify(msgs);
  if(sig===JSON.stringify(learning.lastTranscript))return;
  const prev=learning.lastTranscript; learning.lastTranscript=msgs;
  for(let i=prev.length;i<msgs.length;i++) onTranscriptMessage(msgs[i]);
}
function onTranscriptMessage(m){
  emitTrainingEvent('transcript_message',m);
  if(m.role==='user'){
    learning.turn++;
    learning.current={id:`turn-${Date.now()}-${learning.turn}`,startedAt:now(),user:m.content,assistant:[],tools:[],clips:[]};
  } else {
    if(!learning.current) learning.current={id:`turn-${Date.now()}-${++learning.turn}`,startedAt:now(),user:'',assistant:[],tools:[],clips:[]};
    learning.current.assistant.push(m.content);
    setTimeout(()=>finalizeTurn(),1200);
  }
}
async function appendJsonl(name,obj){if(!state.logsDir)return;try{let old='';try{const h=await state.logsDir.getFileHandle(name);old=await (await h.getFile()).text()}catch{}await writeFile(state.logsDir,name,old+JSON.stringify(obj)+'\n')}catch(e){log('training_write_error',{message:String(e)})}}
async function finalizeTurn(){
  const t=learning.current;if(!t||t.finalized)return;t.finalized=true;t.endedAt=now();t.tools=[...learning.toolCalls.filter(x=>x.time>=Date.parse(t.startedAt)).map(x=>({name:x.name,args:x.args}))];
  await appendJsonl('training-turns.jsonl',t);
  await updateLearnedManifest(t);
  emitTrainingEvent('training_turn_saved',{id:t.id,user:t.user,assistant:t.assistant,tools:t.tools,clips:t.clips});
}
function keywords(q){return normalize(q).split(/[^\p{L}\p{N}]+/u).filter(x=>x.length>1).slice(0,12)}
async function updateLearnedManifest(t){
  if(!state.root||!t.user)return;
  state.manifest ||= {version:2,intents:[]}; state.manifest.version=2; state.manifest.learned=state.manifest.learned||[];
  const entry={id:t.id,match:keywords(t.user),utterance:t.user,response:t.assistant.join(' '),tools:t.tools,video:t.clips.at(-1)||null,updatedAt:now()};
  state.manifest.learned.push(entry); if(state.manifest.learned.length>5000)state.manifest.learned=state.manifest.learned.slice(-5000);
  await writeFile(state.root,'manifest.json',JSON.stringify(state.manifest,null,2));
}
function hookConsole(){
  const orig=console.log.bind(console);console.log=function(...a){try{if(typeof a[0]==='string'&&a[0].includes('[App] Executing Tool Call:')){const name=a[0].split(':').pop().trim(),args=a[1]||{};const x={time:Date.now(),name,args};learning.toolCalls.push(x);emitTrainingEvent('tool_call',x);if(learning.current)learning.current.tools.push({name,args});}}catch{}return orig(...a)};
}
function hookFetch(){const orig=window.fetch;window.fetch=async function(input,init){const u=typeof input==='string'?input:input?.url||'';const st=Date.now();try{const r=await orig.apply(this,arguments);if(/anam\.ai/i.test(u))emitTrainingEvent('anam_network',{url:u.replace(/([?&](?:token|key)=[^&]+)/ig,'[redacted]'),method:init?.method||'GET',status:r.status,durationMs:Date.now()-st});return r}catch(e){if(/anam\.ai/i.test(u))emitTrainingEvent('anam_network_error',{url:u,method:init?.method||'GET',message:String(e)});throw e}}}
function watchTranscript(){new MutationObserver(()=>scanTranscript()).observe(document.documentElement,{subtree:true,childList:true,characterData:true});setInterval(scanTranscript,1000);window.addEventListener('abc-transcript-message',e=>{const d=e.detail||{};if(d.content)onTranscriptMessage({role:d.role==='user'?'user':'assistant',content:String(d.content)})});}
// Attach saved clips to the active conversational turn.
const _writeFile=writeFile;
// Offline matching prefers learned turns, then static intents.
async function playLearned(text){if(!state.manifest)return false;const q=new Set(keywords(text));let best=null,score=0;for(const e of state.manifest.learned||[]){const ks=e.match||[];const s=ks.reduce((n,k)=>n+(q.has(k)?1:0),0);if(s>score){score=s;best=e}}if(!best||score<1)return false;emitTrainingEvent('offline_learned_match',{text,id:best.id,score,response:best.response,tools:best.tools});if(best.video){try{const f=await fileByPath(best.video),url=URL.createObjectURL(f);showOverlay(url,best.id)}catch(e){emitTrainingEvent('offline_video_missing',{id:best.id,video:best.video})}}return true}
const _playIntent=playIntent;playIntent=async function(text){if(await playLearned(text))return;return _playIntent(text)};
function enhancedInit(){hookConsole();hookFetch();watchTranscript();emitTrainingEvent('enhanced_training_ready',{version:2})}

window.addEventListener('DOMContentLoaded',()=>{ui();wireInteractions();watchVideos();restore();enhancedInit();});
window.ABCTrainingRecorder={flush,playIntent,get state(){return state}};
})();
