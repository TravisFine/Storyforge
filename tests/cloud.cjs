const vm=require('node:vm'),fs=require('node:fs'),assert=require('node:assert/strict'),crypto=require('node:crypto');
const elements=new Map(),storage=new Map();
const element=()=>({innerHTML:'',textContent:'',value:'',open:false,style:{},classList:{add(){},remove(){}},close(){this.open=false},showModal(){this.open=true},addEventListener(){}});
const document={querySelector:s=>{if(!elements.has(s))elements.set(s,element());return elements.get(s)},querySelectorAll:()=>[],addEventListener(){}};
const context=vm.createContext({console,structuredClone,crypto,document,localStorage:{getItem:k=>storage.get(k)||null,setItem:(k,v)=>storage.set(k,v)},navigator:{onLine:true},window:{addEventListener(){},STORYFORGE_CLOUD:{}},setInterval(){},setTimeout(){},clearTimeout(){},URL,URLSearchParams,Date,TextEncoder,atob,confirm:()=>true,location:{origin:'https://example.com'}});
const run=s=>vm.runInContext(s,context);
run(fs.readFileSync('app.js','utf8'));run(fs.readFileSync('cloud.js','utf8').replace(/init\(\)\.then[\s\S]*$/,''));
run("state=seed();persist=async()=>{};render=()=>{};requestDB=async()=>{};cloudSession={user:{id:'test-user',email:'test@example.com'}};remoteReady=true;");
assert.equal(run("isPublicKey('sb_secret_bad')"),false);assert.equal(run("isPublicKey('sb_publishable_example')"),true);
run('addExample()');assert.equal(run('project().story.length'),5);run('tidy()');assert.ok(run('project().story.every(n=>Number.isFinite(n.x))'));
for(const t of ['home','pages','story','cards','characters']){run(`tab='${t}'`);assert.ok(run('renderContent().length')>100)}
(async()=>{
run("meta.dirty=true;meta.baseId='old';readRemote=async()=>({revision:'remote',data:{}});decodeCloud=async()=>{const x=structuredClone(state);x.revision='remote';x.projects[0].name='Remote';return x};");
await run('syncCloud()');assert.ok(run('conflict'));assert.equal(run('state.projects[0].name'),'My first game');
run("conflict=null;meta.dirty=false;readRemote=async()=>{state.revision='edited-while-fetching';return {revision:'remote',data:{}}}");
await run('syncCloud()');assert.equal(run('conflict'),null);assert.equal(run('state.revision'),'edited-while-fetching');
// CAS failures must not clear the dirty flag or advance the base revision.
run("encodeCloud=async x=>x;meta.baseId='base-before';meta.dirty=true;cloudClient={rpc:async()=>({data:false,error:null})};");
await assert.rejects(()=>run('uploadSnapshot()'),/changed on another device/);assert.equal(run('meta.dirty'),true);assert.equal(run('meta.baseId'),'base-before');
run("cloudClient={rpc:async()=>({data:true,error:null})}");await run('uploadSnapshot()');assert.equal(run('meta.dirty'),false);assert.equal(run('meta.baseId'),run('state.revision'));
// Edits made during an upload remain dirty for the following sync.
run("cloudClient={rpc:async()=>{state.revision='next-edit';return {data:true,error:null}}}");await run('uploadSnapshot()');assert.equal(run('meta.dirty'),true);
// Never copy another signed-in account's local projects into a new cloud account.
run("localStorage.setItem('sf-cloud-context','other-project|other-user');");await run("setSession({user:{id:'new-user',email:'new@example.com'}})");assert.equal(run('remoteReady'),false);assert.ok(run("cloudError.includes('another account')"));
console.log('PASS: all tabs render; graph layout; secret-key rejection; cloud conflicts; concurrent fetch/edit preservation; atomic save failures; in-flight edits; account isolation guard.');
})().catch(e=>{console.error(e);process.exitCode=1});
