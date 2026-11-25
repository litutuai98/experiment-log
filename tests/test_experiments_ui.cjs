// Experiment notebook UI: every Chinese label has English, and the page renders and saves through its handlers.
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const src=fs.readFileSync(path.join(__dirname,'../static/experiments.js'),'utf8');
const dictStart=src.indexOf('const dictionary={'),dictEnd=src.indexOf('\n};',dictStart);
const dictBlock=src.slice(dictStart,dictEnd),code=src.slice(dictEnd);
const dictionary=new Map([...dictBlock.matchAll(/'([^']+)':'([^']*)'/g)].map(m=>[m[1],m[2]]));

test('every Chinese label in the page has an English entry',()=>{
 const literals=new Set([...code.matchAll(/'([^'\n]*[一-鿿][^'\n]*)'/g)].map(m=>m[1]));
 const missing=[...literals].filter(text=>!dictionary.has(text));
 assert.deepEqual(missing,[],'missing English for: '+missing.join(' / '));
 const leaking=[...dictionary].filter(([,en])=>!en||/[一-鿿]/.test(en)).map(([zh])=>zh);
 assert.deepEqual(leaking,[],'English text is empty or contains Chinese: '+leaking.join(' / '));
});

function sandbox(responses){
 const posts=[],toasts=[];
 const root={innerHTML:'',isConnected:true,querySelector:()=>null};
 const sample={experiments:[{id:'e1',title:'HEAT',status:'active',agent:'Codex',directory:'/exp/heat',data:'AMI',model:'Whisper',results:'',conclusion:'',paths:'',notes:'',revision:3,log_count:1,last_day:'2026-11-24',
   variants:[{id:'v1',experiment_id:'e1',name:'lr=1e-4',verdict:'ineffective',change_note:'调小学习率',result:'WER 13.1',takeaway:'收敛太慢',path:''}],
   links:[{id:'l1',other:'e2',kind:'builds_on',direction:'out',note:'沿用前端'}],papers:['p1']},
  {id:'e2',title:'基线',status:'done',agent:'',directory:'',data:'',model:'',results:'',conclusion:'',paths:'',notes:'',revision:1,log_count:0,last_day:'',variants:[],links:[],papers:[]}],
  papers:[{id:'p1',title:'流式识别论文',stage:'writing',done:0,venue:'ICASSP 2027',deadline:'2026-12-15',link:'',summary:'',notes:'',revision:2,experiments:[{experiment_id:'e1',note:'表 2'}]}],
  logs:[{id:'g1',experiment_id:'e1',day:'2026-11-24',content:'跑完 dev',source:'manual'},{id:'g2',experiment_id:'',day:'2026-11-24',content:'开组会',source:'ai'}],
  report:null,days:[{day:'2026-11-24',logs:2,report:false}],day:'2026-11-24',today:'2026-11-24',ai_available:true};
 const ctx={console,setTimeout,clearTimeout,Intl,Date,JSON,Object,Number,String,Error,
  requestAnimationFrame:()=>{},crypto:{randomUUID:()=>'11111111-2222-3333-4444-555555555555'},
  location:{hash:'#lab'},localStorage:{getItem:()=>null,setItem(){}},navigator:{clipboard:{writeText:async()=>{}}},
  document:{title:'',addEventListener(){}},
  fetch:async(url,options)=>{const body=options?.body?JSON.parse(options.body):null;if(body)posts.push({url,body});
   const custom=responses?.(url,body);return {ok:true,status:200,json:async()=>custom||sample}}};
 ctx.window={addEventListener(){},toast:text=>toasts.push(text),UII18N:null};
 vm.createContext(ctx);vm.runInContext(src,ctx);
 const click=dataset=>root.onclick({target:{closest:()=>({dataset})}});
 return {ctx,root,posts,toasts,click,sample};
}
const tick=()=>new Promise(resolve=>setTimeout(resolve,15));

test('the page renders experiments, variants, links, papers and the report panel',async()=>{
 const {ctx,root,click}=sandbox();
 ctx.window.renderExperiments(root);await tick();
 for(const text of ['HEAT','/exp/heat','lr=1e-4','verdict-ineffective','收敛太慢','沿用前端','流式识别论文','开组会','lab-report'])assert.ok(root.innerHTML.includes(text),'missing '+text);
 assert.ok(!root.innerHTML.includes('lab-exp-e2'),'finished experiments are hidden under the default filter');
 await click({lab:'tab',tab:'papers'});
 assert.ok(root.innerHTML.includes('ICASSP 2027')&&root.innerHTML.includes('表 2'));
});

test('saving goes through the API with the right payloads',async()=>{
 const {ctx,root,posts,click}=sandbox((url)=>url.endsWith('/organize')?{entries:[{experiment_id:'e1',new_title:'',log:'试了 lr',directory:'',data:'',model:'',results:'',conclusion:'',paths:'',variant_name:'lr=3e-4',variant_change:'',variant_result:'',variant_takeaway:'',variant_verdict:'effective'},{experiment_id:'',new_title:'新实验',log:'搭基线',directory:'',data:'',model:'',results:'',conclusion:'',paths:'',variant_name:'',variant_change:'',variant_result:'',variant_takeaway:'',variant_verdict:''}]}:null);
 ctx.window.renderExperiments(root);await tick();
 root.oninput({target:{id:'lab-capture',value:'今天试了 lr',dataset:{},closest:()=>null}});
 await click({lab:'organize'});await tick();
 assert.ok(root.innerHTML.includes('lab-drafts')&&root.innerHTML.includes('lr=3e-4'));
 await root.onsubmit({preventDefault(){},target:{id:'lab-drafts'}});await tick();
 const apply=posts.find(p=>p.body.action==='apply').body;
 assert.equal(apply.day,'2026-11-24');
 assert.deepEqual(apply.entries.map(e=>[e.experiment_id,e.new_title,e.variant_verdict]),[['e1','','effective'],['','新实验','']]);
 await click({lab:'toggle',id:'e1'});await tick();
 assert.deepEqual(posts.at(-1).body,{day:'2026-11-24',action:'toggle-done',id:'e1',revision:3});
 await click({lab:'log-delete',id:'g1'});
 assert.notEqual(posts.at(-1).body.action,'log-delete','first click only arms the delete');
 await click({lab:'log-delete',id:'g1'});await tick();
 assert.equal(posts.at(-1).body.action,'log-delete');
 await click({lab:'paper-edit',id:'p1'});
 await root.onsubmit({preventDefault(){},target:{id:'lab-paper-form'}});await tick();
 const paper=posts.at(-1).body;
 assert.equal(paper.action,'paper-save');assert.equal(paper.paper.venue,'ICASSP 2027');
 assert.deepEqual(paper.experiments,[{experiment_id:'e1',note:'表 2'}]);
});
