// 实验记录 · 图表：渲染表格与图片、上传请求、表格编辑与视觉模型设置。
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const src=fs.readFileSync(path.join(__dirname,'../static/experiments.js'),'utf8');

function sample(vision=true){
 return {experiments:[{id:'e1',title:'HEAT',status:'active',agent:'',directory:'',data:'',model:'',results:'',conclusion:'',paths:'',notes:'',revision:3,log_count:0,last_day:'',variants:[],links:[],papers:[],
  figures:[{id:'f1',experiment_id:'e1',kind:'table',title:'dev WER',caption:'三个变体',table:{columns:['变体','WER'],rows:[['base','13.1'],['lr=3e-4','12.8']]},analysis:{model:'qwen-vl-max',notes:''},url:'/api/experiments/figure?id=f1&v=a',revision:2},
   {id:'f2',experiment_id:'e1',kind:'image',title:'模型结构',caption:'编码器接解码器',table:null,analysis:null,url:'/api/experiments/figure?id=f2&v=b',revision:1}]}],
  loose_figures:[{id:'f9',experiment_id:'',kind:'image',title:'未分的图',caption:'',table:null,analysis:null,url:'/api/experiments/figure?id=f9&v=c',revision:1}],
  papers:[],logs:[],report:null,days:[],day:'2026-11-25',today:'2026-11-25',ai_available:true,
  vision:{ready:vision,model:vision?'qwen-vl-max':'',base_url:'',vision_model:vision?'qwen-vl-max':'',protocol:'auto',key_configured:vision,uses_main_service:true}};
}

function sandbox({vision=true}={}){
 const posts=[];
 const root={innerHTML:'',isConnected:true,querySelector:()=>null,querySelectorAll:()=>[]};
 class FileReader{readAsDataURL(file){this.result='data:'+file.type+';base64,QUJD';setTimeout(()=>this.onload(),0)}}
 const ctx={console,setTimeout,clearTimeout,Intl,Date,JSON,Object,Number,String,Error,Promise,FileReader,
  requestAnimationFrame:()=>{},crypto:{randomUUID:()=>'u'},location:{hash:'#lab'},
  localStorage:{getItem:()=>null,setItem(){}},navigator:{clipboard:{writeText:async()=>{}}},
  document:{title:'',addEventListener(){},removeEventListener(){},querySelector:()=>null,createElement:()=>({setAttribute(){},addEventListener(){},remove(){}}),body:{append(){}},activeElement:null},
  fetch:async(url,options)=>{const body=options?.body?JSON.parse(options.body):null;if(body)posts.push({url,body});
   const v=sample(vision);if(body?.action==='save'&&!body.id)v.saved_id='e1';if(url.endsWith('/figure'))v.figure_result={figure_id:'f3',kind:'table',notice:''};
   if(url.endsWith('/vision'))return {ok:true,status:200,json:async()=>({...v.vision,ready:true,model:'gpt-4o'})};
   return {ok:true,status:200,json:async()=>v}}};
 ctx.window={addEventListener(){},toast(){},UII18N:null};
 vm.createContext(ctx);vm.runInContext(src,ctx);
 const click=dataset=>root.onclick({target:{closest:sel=>sel==='[data-lab]'?{dataset}:null}});
 return {ctx,root,posts,click};
}
const tick=()=>new Promise(r=>setTimeout(r,20));

test('table figures render as tables, other images as thumbnails',async()=>{
 const {ctx,root}=sandbox();ctx.window.renderExperiments(root);await tick();
 const html=root.innerHTML;
 assert.ok(html.includes('class="lab-figures'),'figures section');
 assert.ok(html.includes('<th>变体</th>')&&html.includes('<td>12.8</td>'),'parsed table cells');
 assert.ok(html.includes('src="/api/experiments/figure?id=f2&amp;v=b"'),'image thumbnail');
 assert.ok(html.includes('data-lab="figure-results"'),'table can be added to results');
 assert.ok(html.includes('data-lab="figure-analyze" data-fid="f2"'),'image can be converted when a vision model exists');
 assert.ok(html.includes('id="lab-vision"'),'vision model panel');
});

test('without a vision model images are kept and the page says how to set one up',async()=>{
 const {ctx,root}=sandbox({vision:false});ctx.window.renderExperiments(root);await tick();
 assert.ok(!root.innerHTML.includes('data-lab="figure-analyze"'));
 assert.ok(root.innerHTML.includes('data-lab="vision-open"'));
});

test('choosing files uploads each image with the selected mode',async()=>{
 const {ctx,root,posts}=sandbox();ctx.window.renderExperiments(root);await tick();
 root.onchange({target:{dataset:{figureMode:'e1'},value:'image',closest:()=>null}});
 const files=[{name:'arch.png',type:'image/png',size:1000},{name:'logs.zip',type:'application/zip',size:10}];
 root.onchange({target:{dataset:{figureFile:'e1'},files,value:'x',closest:()=>null}});
 await tick();await tick();
 const uploads=posts.filter(p=>p.url==='/api/experiments/figure');
 assert.equal(uploads.length,1,'non-images are skipped');
 assert.deepEqual({...uploads[0].body,data:undefined},{day:'2026-11-25',action:'upload',experiment_id:'e1',mode:'image',filename:'arch.png',data:undefined});
 assert.equal(uploads[0].body.data,'QUJD');
});

test('oversized images are refused before upload',async()=>{
 const {ctx,root,posts}=sandbox();ctx.window.renderExperiments(root);await tick();
 root.onchange({target:{dataset:{figureFile:'e1'},files:[{name:'big.png',type:'image/png',size:11*1024*1024}],value:'x',closest:()=>null}});
 await tick();
 assert.equal(posts.filter(p=>p.url==='/api/experiments/figure').length,0);
});

test('editing a table sends the edited cells',async()=>{
 const {ctx,root,posts,click}=sandbox();ctx.window.renderExperiments(root);await tick();
 await click({lab:'figure-edit',fid:'f1'});
 assert.ok(root.innerHTML.includes('id="lab-figure-form"'));
 root.oninput({target:{dataset:{fcell:'1,1'},value:'12.5',closest:()=>null}});
 root.oninput({target:{dataset:{fcell:'-1,1'},value:'WER (%)',closest:()=>null}});
 await click({lab:'figure-row-add'});
 await root.onsubmit({preventDefault(){},target:{id:'lab-figure-form'}});await tick();
 const body=posts.at(-1).body;
 assert.equal(body.action,'update');assert.equal(body.revision,2);
 assert.deepEqual(body.table.columns,['变体','WER (%)']);
 assert.deepEqual(body.table.rows,[['base','13.1'],['lr=3e-4','12.5'],['','']]);
});

test('delete needs a second click; results and conversion post the right actions',async()=>{
 const {ctx,root,posts,click}=sandbox();ctx.window.renderExperiments(root);await tick();
 await click({lab:'figure-delete',fid:'f2'});
 assert.equal(posts.length,0,'first click only arms');
 await click({lab:'figure-delete',fid:'f2'});await tick();
 assert.equal(posts.at(-1).body.action,'delete');
 await click({lab:'figure-results',fid:'f1'});await tick();
 assert.equal(posts.at(-1).body.action,'to-results');
 await click({lab:'figure-analyze',fid:'f2'});await tick();
 assert.equal(posts.at(-1).body.action,'analyze');
});

test('vision settings never send an empty key',async()=>{
 const {ctx,root,posts}=sandbox();ctx.window.renderExperiments(root);await tick();
 root.oninput({target:{dataset:{m:'vision'},name:'vision_model',value:'gpt-4o',type:'text',closest:()=>null}});
 await root.onsubmit({preventDefault(){},target:{id:'lab-vision-form'}});await tick();
 const body=posts.find(p=>p.url==='/api/experiments/vision').body;
 assert.equal(body.vision_model,'gpt-4o');
 assert.ok(!('vision_api_key' in body),'blank key is not sent, the saved one stays');
});

test('the capture box takes images even before any experiment exists',async()=>{
 const {ctx,root,posts}=sandbox();ctx.window.renderExperiments(root);await tick();
 assert.ok(root.innerHTML.includes('data-figure-file="__capture"'),'upload control in the capture box');
 root.onchange({target:{dataset:{figureFile:'__capture'},files:[{name:'wer.png',type:'image/png',size:10}],value:'x',closest:()=>null}});
 await tick();await tick();
 assert.equal(posts.at(-1).body.experiment_id,'','unassigned by default');
 root.oninput({target:{id:'lab-target',value:'e1',dataset:{},closest:()=>null}});
 root.onchange({target:{dataset:{figureFile:'__capture'},files:[{name:'wer.png',type:'image/png',size:10}],value:'x',closest:()=>null}});
 await tick();await tick();
 assert.equal(posts.at(-1).body.experiment_id,'e1','goes to the experiment chosen next to the box');
});

test('unassigned figures are listed with a move control',async()=>{
 const {ctx,root,posts}=sandbox();ctx.window.renderExperiments(root);await tick();
 assert.ok(root.innerHTML.includes('lab-loose-figures')&&root.innerHTML.includes('data-figure-move="f9"'));
 root.onchange({target:{dataset:{figureMove:'f9'},value:'e1',closest:()=>null}});await tick();
 assert.deepEqual({action:posts.at(-1).body.action,id:posts.at(-1).body.id,experiment_id:posts.at(-1).body.experiment_id},{action:'move',id:'f9',experiment_id:'e1'});
});

test('PDF attachments can be chosen and are shown as openable files',async()=>{
 const {ctx,root,posts}=sandbox();ctx.window.renderExperiments(root);await tick();
 assert.ok(root.innerHTML.includes('application/pdf'),'file picker accepts PDF');
 root.onchange({target:{dataset:{figureFile:'e1'},files:[{name:'ablation.pdf',type:'application/pdf',size:2*1024*1024}],value:'x',closest:()=>null}});
 await tick();await tick();
 assert.equal(posts.at(-1).body.filename,'ablation.pdf');
 root.onchange({target:{dataset:{figureFile:'e1'},files:[{name:'huge.pdf',type:'application/pdf',size:16*1024*1024}],value:'x',closest:()=>null}});
 await tick();
 assert.equal(posts.at(-1).body.filename,'ablation.pdf','oversized PDF is refused before upload');
});

test('a new experiment can carry attachments that upload after it is saved',async()=>{
 const {ctx,root,posts,click}=sandbox();ctx.window.renderExperiments(root);await tick();
 await click({lab:'new'});
 assert.ok(root.innerHTML.includes('data-figure-file="__new"'),'attachment picker in the new-experiment form');
 assert.ok(root.innerHTML.includes('data-drop="__new"'),'the whole form accepts paste and drop');
 root.onchange({target:{dataset:{figureFile:'__new'},files:[{name:'arch.png',type:'image/png',size:10},{name:'report.pdf',type:'application/pdf',size:10}],value:'x',closest:()=>null}});
 await tick();
 assert.equal(posts.filter(p=>p.url.endsWith('/figure')).length,0,'nothing uploads before the experiment exists');
 assert.ok(root.innerHTML.includes('report.pdf')&&root.innerHTML.includes('data-lab="pending-remove"'));
 root.oninput({target:{dataset:{m:'exp'},name:'title',value:'新实验',type:'text',closest:()=>null}});
 await root.onsubmit({preventDefault(){},target:{id:'lab-editor'}});
 for(let i=0;i<6;i++)await tick();
 const uploads=posts.filter(p=>p.url.endsWith('/figure'));
 assert.deepEqual(uploads.map(p=>[p.body.experiment_id,p.body.filename]),[['e1','arch.png'],['e1','report.pdf']]);
});
