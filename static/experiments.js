/* Experiment notebook: experiments, variants, relations, papers, daily logs and reports.
   Typing state lives in module variables so background repaints never lose input. */
(()=>{
const dictionary={
'实验记录':'Experiment log','正在加载实验记录…':'Loading experiments…','重试':'Retry',
'每个实验在哪做、用什么数据和模型、试过哪些变体、得到什么结论，都记在一处。':'Where each experiment lives, what data and model it uses, which variants you tried and what you concluded, all in one place.',
'前一天':'Previous day','后一天':'Next day','日期':'Date','回到今天':'Back to today',
'进行中的实验':'Active experiments','记录的变体':'Variants logged','当天记录':'Entries this day','在写的论文':'Papers in progress',
'实验':'Experiments','论文':'Papers',
'今天做了什么':'What did you do today?',
'用自己的话写就行，可以一次说多个实验。例如：HEAT 把学习率改成 3e-4，dev WER 从 12.3 降到 11.9；说话人归属那边去掉对齐损失没用，掉了 0.4。':'Write it in your own words, several experiments at once if you like. For example: “HEAT: changed the learning rate to 3e-4, dev WER went from 12.3 to 11.9. Speaker attribution: dropping the alignment loss did not help, down 0.4.”',
'写下今天做的实验、结果和想法…':'Experiments, results and thoughts from today…',
'正在分配…':'Sorting…','AI 分到各个实验':'Sort into experiments with AI','或':'or','记到哪个实验':'Experiment to log under','直接记一条':'Log it as is',
'AI 只收到这段文字和实验名称、目录等概要，使用“AI 设置”里的模型；分配结果先给你确认，可以改完再保存。':'AI receives only this text plus experiment names and directories, using the model from AI settings. You review and edit the result before anything is saved.',
'还没有配置 AI 模型，可以先用“直接记一条”手动记录。':'No AI model is configured yet. Use “Log it as is” to record entries by hand.',
'未归类':'Unassigned','＋ 新建实验':'+ New experiment','请选择':'Choose one',
'确认这些记录':'Review these entries',
'检查每条归到哪个实验。提到的目录、数据、结果会补进实验信息：空的直接填上，已有内容则追加在后面。':'Check where each entry goes. Any directory, data or result you mentioned is added to the experiment: empty fields are filled in, existing ones are appended to.',
'归到':'File under','新实验名称':'New experiment name','记录':'Entry','同时更新实验信息':'Also update the experiment',
'变体名称':'Variant name','例如 lr=1e-4、去掉对齐损失；没有就留空':'e.g. lr=1e-4, no alignment loss; leave blank if none','这次尝试':'Outcome',
'改了什么':'What changed','变体结果':'Variant result','得到的反馈':'What it told you','移除此项':'Remove entry',
'保存这些记录':'Save entries','取消':'Cancel',
'实验目录':'Directory','实验在哪个目录下做，本机或服务器路径':'Where the experiment lives: a local or server path',
'数据':'Data','用到哪些数据集、哪个划分、放在哪里':'Which datasets and splits, and where they are stored',
'模型':'Model','结构、基座、规模和关键设置':'Architecture, base model, size and key settings',
'结果':'Results','主要指标和数字，写明测试条件':'Key metrics and numbers, with the test conditions',
'结论':'Conclusion','这个实验说明了什么，下一步怎么做':'What this experiment shows and what to do next',
'相关路径':'Paths','checkpoint、日志、配置、输出的位置，一行一个':'Checkpoints, logs, configs and outputs, one per line',
'进行中':'Active','已暂停':'Paused','已完成':'Done','全部':'All',
'待定':'Undecided','有效':'Worked','无效':'Did not work','部分有效':'Mixed',
'基于':'Builds on','对照':'Compared with','共用数据或模型':'Shares data or model','相关':'Related','被延续于':'Extended by',
'构思中':'Idea','写作中':'Writing','已投稿':'Submitted','已录用':'Accepted','已发表':'Published',
'未填写':'Not filled in','复制':'Copy','备注':'Notes','已复制路径':'Path copied',
'例如 lr=1e-4、去掉对齐损失':'e.g. lr=1e-4, no alignment loss','相对基线改动了哪一点':'What differs from the baseline','指标和数字':'Metrics and numbers',
'有效或无效都写下来：说明了什么，下次怎么做':'Write it down either way: what it showed and what to try next',
'路径':'Path','这个变体的输出或配置路径':'Output or config path for this variant','保存变体':'Save variant',
'变体':'Variants','记录一个变体':'Log a variant','编辑':'Edit','删除':'Delete','确认删除':'Confirm delete',
'同一个实验下试过的不同设置记在这里。没效果的尝试也值得留下。':'Log the different settings you tried within this experiment. Attempts that did not work are worth keeping too.',
'关联':'Links','关联另一个实验':'Link another experiment','移除关联':'Remove link','还没有关联的实验或论文。':'No linked experiments or papers yet.',
'关系':'Relation','另一个实验':'Other experiment','说明':'Note','例如：沿用它的前端；与它对照同一测试集':'e.g. reuses its front end; compared on the same test set','保存关联':'Save link',
'AI 整理':'Sorted by AI','这个实验今天做了什么…':'What happened in this experiment today…','记一条':'Add entry','保存记录':'Save entry','的记录':'entries',
'条记录':'entries','最近':'last','恢复进行中':'Reopen','标记完成':'Mark done',
'编辑实验':'Edit experiment','新建实验':'New experiment','实验名称':'Experiment name','任务 + 方法，例如：流式多说话人 ASR · HEAT 条件':'Task + method, e.g. Streaming multi-talker ASR · HEAT conditioning',
'状态':'Status','负责的 Agent 或人':'Agent or person in charge','例如 Codex、Claude、我自己':'e.g. Codex, Claude, me','其他想记下的事':'Anything else worth noting',
'保存实验':'Save experiment','确认删除：变体和关联会一并删除，记录保留':'Confirm: variants and links are removed, entries are kept','删除实验':'Delete experiment',
'没有符合条件的实验':'No matching experiments','还没有实验':'No experiments yet','换一个筛选条件，或清空搜索。':'Try another filter or clear the search.',
'新建一个实验，或者直接在上面写下今天做了什么，让 AI 帮你建好。':'Create one, or just describe your day above and let AI set them up.',
'搜索实验名称、目录、模型…':'Search name, directory, model…','搜索实验':'Search experiments',
'发表于':'Published at','预计投':'Target:','截止':'Due','恢复未完成':'Reopen','核心论点':'Main claim','链接':'Link',
'用到的实验':'Experiments used','还没有关联实验。编辑论文，勾选它依据的实验。':'No experiments linked. Edit the paper and tick the experiments it relies on.',
'编辑论文':'Edit paper','新建论文':'New paper','论文题目':'Paper title','暂定题目也可以':'A working title is fine','阶段':'Stage',
'发表在哪里 / 预计投哪里':'Venue (published or planned)','例如 ICASSP 2027、TASLP、arXiv':'e.g. ICASSP 2027, TASLP, arXiv','截止日期':'Deadline',
'Overleaf、arXiv 或仓库地址':'Overleaf, arXiv or repository URL','这篇论文想说明什么，依据哪些结果':'What the paper argues and which results support it',
'审稿意见、待补实验、合作者…':'Reviews, missing experiments, co-authors…','依据哪些实验':'Experiments it relies on',
'用到它的哪些结果，例如：表 2 主结果、消融':'Which results you use, e.g. main results in Table 2, ablations','用到哪些结果':'Results used',
'还没有实验可以关联。':'No experiments to link yet.','保存论文':'Save paper','确认删除这篇论文':'Confirm: delete this paper','删除论文':'Delete paper',
'没有符合条件的论文':'No matching papers','还没有论文':'No papers yet','把准备写的论文记在这里，关联它依据的实验，写上预计投到哪里。':'Keep the papers you plan to write here, link the experiments behind them and note the target venue.',
'日报':'Daily report','自己写，或者根据当天的记录生成一份草稿再改。':'Write it yourself, or generate a draft from the day’s entries and edit it.',
'按记录生成草稿':'Draft from entries','正在总结…':'Summarizing…','AI 总结今天':'Summarize with AI','保存日报':'Save report',
'有未保存的修改':'Unsaved changes','已保存':'Saved','这一天还没有日报':'No report for this day yet',
'未归类的记录':'Unassigned entries','最近几天':'Recent days','有日报':'report','记录会按天出现在这里。':'Days with entries will appear here.',
'连接不到本地服务，内容还在页面上，稍后重试。':'Cannot reach the local service. Your text is still on the page; try again shortly.',
'实验记录还没生效：请重启本地服务（双击 restart.command），再刷新本页。':'The experiment log is not active yet. Restart the local service (double-click restart.command), then refresh.',
'已恢复这一天未保存的日报草稿':'Restored an unsaved draft for this day','请先写下今天做了什么。':'Write what you did first.',
'已记录':'Logged','新建的实验需要一个名称。':'A new experiment needs a name.','已记录到各个实验':'Entries saved to their experiments',
'实验已保存':'Experiment saved','变体已保存':'Variant saved','关联已保存':'Link saved','论文已保存':'Paper saved','实验已删除，记录保留在“未归类”':'Experiment deleted; its entries are now unassigned',
'AI 草稿已填入，确认后点“保存日报”。':'AI draft added. Review it, then save the report.','草稿已填入，确认后点“保存日报”。':'Draft added. Review it, then save the report.','日报已保存':'Report saved',
'记录日期':'Date',
'切换日期会同时切换：每张实验卡片下的当天记录、“未归类”记录、以及右侧的日报。':'Changing the date switches the day’s entries under each experiment, the unassigned entries, and the report on the right.'
};
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const tr=s=>window.UII18N?.locale()==='en-US'?(dictionary[s]||s):s;
const INFO=[['directory','实验目录','实验在哪个目录下做，本机或服务器路径'],['data','数据','用到哪些数据集、哪个划分、放在哪里'],['model','模型','结构、基座、规模和关键设置'],['results','结果','主要指标和数字，写明测试条件'],['conclusion','结论','这个实验说明了什么，下一步怎么做'],['paths','相关路径','checkpoint、日志、配置、输出的位置，一行一个']];
const STATUS={active:'进行中',paused:'已暂停',done:'已完成'};
const VERDICT={pending:'待定',effective:'有效',ineffective:'无效',mixed:'部分有效'};
const KINDS={builds_on:'基于',compares:'对照',shares:'共用数据或模型',related:'相关'};
const KIND_IN={builds_on:'被延续于'};
const STAGE={idea:'构思中',writing:'写作中',submitted:'已投稿',accepted:'已录用',published:'已发表'};
const VARIANT_KEYS=['variant_name','variant_change','variant_result','variant_takeaway','variant_verdict'];
const stashKey='knowledge-lab-report-drafts';
const fmt=d=>new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Shanghai',year:'numeric',month:'2-digit',day:'2-digit'}).format(d);
const today=()=>fmt(new Date());
const shift=(d,n)=>fmt(new Date(Date.parse(d+'T12:00:00+08:00')+n*86400000));

let root=null,data=null,loading=false,error='',day=today(),tab='experiments',filter='active',paperFilter='open',query='',busy='',notice='',noticeError=false;
let capture='',target='',drafts=null,batch='';
let editing=null,variantEdit=null,linkDraft=null,paperEdit=null,logFor=null,logText='',armed=null,armTimer=0;
let reportText='',reportRevision=null,reportDirty=false,reportNote='';

const active=()=>root?.isConnected&&location.hash==='#lab';
const exps=()=>data?.experiments||[];
const expById=id=>exps().find(e=>e.id===id);
const uid=()=>crypto.randomUUID();
function stashed(){try{return JSON.parse(localStorage.getItem(stashKey)||'{}')||{}}catch{return {}}}
function stash(){try{const all=stashed();if(reportDirty)all[day]=reportText;else delete all[day];localStorage.setItem(stashKey,JSON.stringify(all))}catch{}}

async function request(path,body){
 let r;try{r=await fetch(path,body===undefined?{}:{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)})}catch{throw Error(tr('连接不到本地服务，内容还在页面上，稍后重试。'))}
 let v=null;try{v=await r.json()}catch{}
 if(r.status===404||(!v&&r.ok))throw Error(tr('实验记录还没生效：请重启本地服务（双击 restart.command），再刷新本页。'));
 if(!r.ok)throw Error(v?.error||r.statusText);
 return v;
}
function accept(v){
 data=v;day=v.day;reportRevision=v.report?.revision??null;
 if(reportDirty)return;
 reportText=v.report?.content||'';
 const saved=stashed()[day];
 if(typeof saved==='string'&&saved!==reportText){reportText=saved;reportDirty=true;reportNote=tr('已恢复这一天未保存的日报草稿')}
}
async function load(){if(loading)return;loading=true;try{accept(await request('/api/experiments?day='+encodeURIComponent(day)));error=''}catch(e){error=e.message}finally{loading=false;paint()}}
function flash(text,isError=false){notice=text;noticeError=isError;window.toast?.(text)}
function arm(key){if(armed===key){armed=null;clearTimeout(armTimer);return true}armed=key;clearTimeout(armTimer);armTimer=setTimeout(()=>{armed=null;paint()},6000);paint();return false}
async function post(body,label='save'){busy=label;notice='';paint();try{accept(await request('/api/experiments',{day,...body}));return true}catch(e){flash(e.message,true);return false}finally{busy='';paint()}}
function gotoDay(next){if(!next||next===day)return;stash();reportDirty=false;reportNote='';armed=null;logFor=null;day=next;load()}

function options(map,value){return Object.entries(map).map(([k,l])=>`<option value="${k}" ${k===value?'selected':''}>${esc(tr(l))}</option>`).join('')}
function expOptions(value,{blank='未归类',fresh=false,skip=''}={}){return `<option value="">${esc(tr(blank))}</option>${fresh?`<option value="__new" ${value==='__new'?'selected':''}>${esc(tr('＋ 新建实验'))}</option>`:''}${exps().filter(e=>e.id!==skip).map(e=>`<option value="${esc(e.id)}" ${e.id===value?'selected':''}>${esc(e.title)}</option>`).join('')}`}
function field(label,name,value,model,{type='text',rows=0,hint='',required=false,max=''}={}){
 const attrs=`name="${name}" data-m="${model}" ${required?'required':''} ${max?`maxlength="${max}"`:''} placeholder="${esc(tr(hint))}"`;
 return `<label class="lab-field">${esc(tr(label))}${rows?`<textarea ${attrs} rows="${rows}">${esc(value)}</textarea>`:`<input type="${type}" ${attrs} value="${esc(value)}">`}</label>`;
}

function draftsHTML(){
 return `<form id="lab-drafts"><h3>${esc(tr('确认这些记录'))}</h3><p class="lab-hint">${esc(tr('检查每条归到哪个实验。提到的目录、数据、结果会补进实验信息：空的直接填上，已有内容则追加在后面。'))}</p>
 ${drafts.map((d,i)=>{const extra=INFO.filter(([k])=>d[k]).length+(d.variant_name?1:0);return `<fieldset class="lab-draft" data-draft="${i}"><legend>${i+1}</legend>
  <div class="lab-pair"><label class="lab-field">${esc(tr('归到'))}<select name="target">${expOptions(d.target,{fresh:true})}</select></label>${d.target==='__new'?`<label class="lab-field">${esc(tr('新实验名称'))}<input name="new_title" maxlength="200" value="${esc(d.new_title)}" required></label>`:''}</div>
  <label class="lab-field">${esc(tr('记录'))}<textarea name="log" rows="3" maxlength="10000">${esc(d.log)}</textarea></label>
  <details ${extra?'open':''}><summary>${esc(tr('同时更新实验信息'))}${extra?` · ${extra}`:''}</summary>
   <div class="lab-pair"><label class="lab-field">${esc(tr('变体名称'))}<input name="variant_name" maxlength="200" value="${esc(d.variant_name)}" placeholder="${esc(tr('例如 lr=1e-4、去掉对齐损失；没有就留空'))}"></label><label class="lab-field">${esc(tr('这次尝试'))}<select name="variant_verdict">${options(VERDICT,d.variant_verdict||'pending')}</select></label></div>
   ${[['variant_change','改了什么'],['variant_result','变体结果'],['variant_takeaway','得到的反馈']].map(([k,l])=>`<label class="lab-field">${esc(tr(l))}<textarea name="${k}" rows="2">${esc(d[k])}</textarea></label>`).join('')}
   ${INFO.map(([k,l])=>`<label class="lab-field">${esc(tr(l))}<textarea name="${k}" rows="2">${esc(d[k])}</textarea></label>`).join('')}
  </details>
  <button type="button" class="lab-link" data-lab="draft-remove" data-index="${i}">${esc(tr('移除此项'))}</button></fieldset>`}).join('')}
 <div class="lab-buttons"><button class="primary" ${busy?'disabled':''}>${esc(tr('保存这些记录'))}</button><button type="button" class="secondary" data-lab="draft-cancel">${esc(tr('取消'))}</button></div></form>`;
}
function captureHTML(){
 return `<section class="lab-capture"><h2>${esc(tr('今天做了什么'))}</h2><p class="muted">${esc(tr('用自己的话写就行，可以一次说多个实验。例如：HEAT 把学习率改成 3e-4，dev WER 从 12.3 降到 11.9；说话人归属那边去掉对齐损失没用，掉了 0.4。'))}</p>
 <textarea id="lab-capture" rows="4" maxlength="8000" placeholder="${esc(tr('写下今天做的实验、结果和想法…'))}" aria-label="${esc(tr('今天做了什么'))}">${esc(capture)}</textarea>
 <div class="lab-buttons"><button type="button" class="primary" data-lab="organize" ${busy?'disabled':''}>${esc(tr(busy==='organize'?'正在分配…':'AI 分到各个实验'))}</button><span class="lab-or">${esc(tr('或'))}</span><select id="lab-target" aria-label="${esc(tr('记到哪个实验'))}">${expOptions(target)}</select><button type="button" class="secondary" data-lab="quick" ${busy?'disabled':''}>${esc(tr('直接记一条'))}</button></div>
 <p class="lab-hint">${esc(tr(data.ai_available?'AI 只收到这段文字和实验名称、目录等概要，使用“AI 设置”里的模型；分配结果先给你确认，可以改完再保存。':'还没有配置 AI 模型，可以先用“直接记一条”手动记录。'))}</p>
 ${notice?`<p class="lab-notice ${noticeError?'is-error':''}" role="status">${esc(notice)}</p>`:''}${drafts?draftsHTML():''}</section>`;
}

function factsHTML(e){
 return `<dl class="lab-facts">${INFO.map(([k,l])=>`<div class="lab-fact ${e[k]?'':'is-empty'}"><dt>${esc(tr(l))}</dt><dd class="${['directory','paths'].includes(k)?'mono':''}">${e[k]?esc(e[k]):esc(tr('未填写'))}${k==='directory'&&e[k]?` <button type="button" class="lab-link" data-lab="copy" data-text="${esc(e[k])}">${esc(tr('复制'))}</button>`:''}</dd></div>`).join('')}${e.notes?`<div class="lab-fact"><dt>${esc(tr('备注'))}</dt><dd>${esc(e.notes)}</dd></div>`:''}</dl>`;
}
function variantFormHTML(){const v=variantEdit;
 return `<form id="lab-variant-form" class="lab-inline-form"><div class="lab-pair">${field('变体名称','name',v.name,'variant',{required:true,max:200,hint:'例如 lr=1e-4、去掉对齐损失'})}<label class="lab-field">${esc(tr('这次尝试'))}<select name="verdict" data-m="variant">${options(VERDICT,v.verdict)}</select></label></div>
 ${field('改了什么','change_note',v.change_note,'variant',{rows:2,hint:'相对基线改动了哪一点'})}${field('变体结果','result',v.result,'variant',{rows:2,hint:'指标和数字'})}${field('得到的反馈','takeaway',v.takeaway,'variant',{rows:2,hint:'有效或无效都写下来：说明了什么，下次怎么做'})}${field('路径','path',v.path,'variant',{hint:'这个变体的输出或配置路径'})}
 <div class="lab-buttons"><button class="primary" ${busy?'disabled':''}>${esc(tr('保存变体'))}</button><button type="button" class="secondary" data-lab="variant-cancel">${esc(tr('取消'))}</button></div></form>`;
}
function variantsHTML(e){const vs=e.variants||[],count=k=>vs.filter(v=>v.verdict===k).length,adding=variantEdit&&!variantEdit.id&&variantEdit.experiment_id===e.id;
 return `<section class="lab-block"><div class="lab-block-head"><h4>${esc(tr('变体'))} · ${vs.length}</h4>${vs.length?`<span class="lab-counts"><span class="verdict-effective">${esc(tr('有效'))} ${count('effective')}</span><span class="verdict-ineffective">${esc(tr('无效'))} ${count('ineffective')}</span></span>`:''}<button type="button" class="lab-link" data-lab="variant-new" data-id="${esc(e.id)}">＋ ${esc(tr('记录一个变体'))}</button></div>
 ${vs.map(v=>variantEdit?.id===v.id?variantFormHTML():`<div class="lab-variant verdict-${esc(v.verdict)}"><div class="lab-variant-head"><strong>${esc(v.name)}</strong><span class="lab-verdict">${esc(tr(VERDICT[v.verdict]||'待定'))}</span><span class="lab-row-actions"><button type="button" class="lab-link" data-lab="variant-edit" data-id="${esc(e.id)}" data-vid="${esc(v.id)}">${esc(tr('编辑'))}</button><button type="button" class="lab-link ${armed==='variant:'+v.id?'is-armed':''}" data-lab="variant-delete" data-vid="${esc(v.id)}">${esc(tr(armed==='variant:'+v.id?'确认删除':'删除'))}</button></span></div>
  ${[['change_note','改了什么'],['result','变体结果'],['takeaway','得到的反馈'],['path','路径']].filter(([k])=>v[k]).map(([k,l])=>`<p><span>${esc(tr(l))}</span>${esc(v[k])}</p>`).join('')}</div>`).join('')}
 ${adding?variantFormHTML():''}${!vs.length&&!adding?`<p class="lab-empty-line">${esc(tr('同一个实验下试过的不同设置记在这里。没效果的尝试也值得留下。'))}</p>`:''}</section>`;
}
function linkLabel(l){return tr(l.direction==='in'&&KIND_IN[l.kind]?KIND_IN[l.kind]:KINDS[l.kind]||'相关')}
function linksHTML(e){const ls=e.links||[],papers=(data.papers||[]).filter(p=>(e.papers||[]).includes(p.id));
 return `<section class="lab-block"><div class="lab-block-head"><h4>${esc(tr('关联'))}</h4><button type="button" class="lab-link" data-lab="link-new" data-id="${esc(e.id)}">＋ ${esc(tr('关联另一个实验'))}</button></div>
 <div class="lab-chips">${ls.map(l=>`<span class="lab-chip"><em>${esc(linkLabel(l))}</em><button type="button" data-lab="jump" data-id="${esc(l.other)}">${esc(expById(l.other)?.title||'')}</button>${l.note?`<small>${esc(l.note)}</small>`:''}<button type="button" class="lab-chip-x" data-lab="link-delete" data-id="${esc(l.id)}" aria-label="${esc(tr('移除关联'))}">×</button></span>`).join('')}${papers.map(p=>`<span class="lab-chip is-paper"><em>${esc(tr('论文'))}</em><button type="button" data-lab="open-paper" data-id="${esc(p.id)}">${esc(p.title)}</button></span>`).join('')}${!ls.length&&!papers.length?`<span class="lab-empty-line">${esc(tr('还没有关联的实验或论文。'))}</span>`:''}</div>
 ${linkDraft?.src===e.id?`<form id="lab-link-form" class="lab-inline-form"><div class="lab-pair"><label class="lab-field">${esc(tr('关系'))}<select name="kind" data-m="link">${options(KINDS,linkDraft.kind)}</select></label><label class="lab-field">${esc(tr('另一个实验'))}<select name="dst" data-m="link" required>${expOptions(linkDraft.dst,{blank:'请选择',skip:e.id})}</select></label></div>${field('说明','note',linkDraft.note,'link',{hint:'例如：沿用它的前端；与它对照同一测试集',max:2000})}<div class="lab-buttons"><button class="primary" ${busy?'disabled':''}>${esc(tr('保存关联'))}</button><button type="button" class="secondary" data-lab="link-cancel">${esc(tr('取消'))}</button></div></form>`:''}</section>`;
}
function logItem(l,withMove){
 return `<li><p>${esc(l.content)}</p><span class="lab-row-actions">${l.source==='ai'?`<small>${esc(tr('AI 整理'))}</small>`:''}${withMove?`<select data-move="${esc(l.id)}" aria-label="${esc(tr('归到'))}">${expOptions(l.experiment_id)}</select>`:''}<button type="button" class="lab-link ${armed==='log:'+l.id?'is-armed':''}" data-lab="log-delete" data-id="${esc(l.id)}">${esc(tr(armed==='log:'+l.id?'确认删除':'删除'))}</button></span></li>`;
}
function logsHTML(e){const logs=data.logs.filter(l=>l.experiment_id===e.id);
 return `${logFor===e.id?`<form id="lab-log-form" class="lab-inline-form"><textarea id="lab-quicklog" rows="3" maxlength="10000" placeholder="${esc(tr('这个实验今天做了什么…'))}" aria-label="${esc(tr('记一条'))}">${esc(logText)}</textarea><div class="lab-buttons"><button class="primary" ${busy?'disabled':''}>${esc(tr('保存记录'))}</button><button type="button" class="secondary" data-lab="log-cancel">${esc(tr('取消'))}</button></div></form>`:''}${logs.length?`<section class="lab-block"><div class="lab-block-head"><h4>${esc(day)} ${esc(tr('的记录'))} · ${logs.length}</h4></div><ul class="lab-logs">${logs.map(l=>logItem(l,false)).join('')}</ul></section>`:''}`;
}
function editorHTML(){const e=editing,key='exp:'+e.id;
 return `<form id="lab-editor" class="lab-card lab-editor"><h3>${esc(tr(e.id?'编辑实验':'新建实验'))}</h3>
 <div class="lab-triple">${field('实验名称','title',e.title,'exp',{required:true,max:200,hint:'任务 + 方法，例如：流式多说话人 ASR · HEAT 条件'})}<label class="lab-field">${esc(tr('状态'))}<select name="status" data-m="exp">${options(STATUS,e.status)}</select></label>${field('负责的 Agent 或人','agent',e.agent,'exp',{max:100,hint:'例如 Codex、Claude、我自己'})}</div>
 ${INFO.map(([k,l,h])=>field(l,k,e[k],'exp',{rows:k==='directory'?0:3,hint:h})).join('')}${field('备注','notes',e.notes,'exp',{rows:2,hint:'其他想记下的事'})}
 <div class="lab-buttons"><button class="primary" ${busy?'disabled':''}>${esc(tr('保存实验'))}</button><button type="button" class="secondary" data-lab="edit-cancel">${esc(tr('取消'))}</button>${e.id?`<button type="button" class="lab-link lab-danger ${armed===key?'is-armed':''}" data-lab="delete" data-id="${esc(e.id)}">${esc(tr(armed===key?'确认删除：变体和关联会一并删除，记录保留':'删除实验'))}</button>`:''}</div></form>`;
}
function cardHTML(e){if(editing?.id===e.id)return editorHTML();
 return `<article class="lab-card status-${esc(e.status)}" id="lab-exp-${esc(e.id)}"><header class="lab-card-head"><div><h3>${esc(e.title)}</h3><div class="lab-meta"><span class="lab-status">${esc(tr(STATUS[e.status]||'进行中'))}</span>${e.agent?`<span class="lab-agent">${esc(e.agent)}</span>`:''}<span>${e.log_count} ${esc(tr('条记录'))}${e.last_day?` · ${esc(tr('最近'))} ${esc(e.last_day)}`:''}</span></div></div>
 <div class="lab-card-actions"><button type="button" class="secondary" data-lab="log-open" data-id="${esc(e.id)}">${esc(tr('记一条'))}</button><button type="button" class="secondary" data-lab="toggle" data-id="${esc(e.id)}">${esc(tr(e.status==='done'?'恢复进行中':'标记完成'))}</button><button type="button" class="secondary" data-lab="edit" data-id="${esc(e.id)}">${esc(tr('编辑'))}</button></div></header>
 ${factsHTML(e)}${variantsHTML(e)}${linksHTML(e)}${logsHTML(e)}</article>`;
}
function visible(){const q=query.trim().toLowerCase();return exps().filter(e=>(filter==='all'||e.status===filter)&&(!q||[e.title,e.agent,e.directory,e.model,e.data].join(' ').toLowerCase().includes(q)))}
function listHTML(){const list=visible(),any=exps().length;
 return `${editing&&!editing.id?editorHTML():''}${list.map(cardHTML).join('')||(editing?'':`<div class="lab-empty"><h3>${esc(tr(any?'没有符合条件的实验':'还没有实验'))}</h3><p>${esc(tr(any?'换一个筛选条件，或清空搜索。':'新建一个实验，或者直接在上面写下今天做了什么，让 AI 帮你建好。'))}</p></div>`)}`;
}
function experimentsHTML(){const count=k=>exps().filter(e=>e.status===k).length;
 return `<div class="lab-toolbar"><div class="lab-filters" role="group">${[['active','进行中'],['paused','已暂停'],['done','已完成'],['all','全部']].map(([k,l])=>`<button type="button" data-lab="filter" data-value="${k}" class="${filter===k?'selected':''}" aria-pressed="${filter===k}">${esc(tr(l))} <small>${k==='all'?exps().length:count(k)}</small></button>`).join('')}</div><input id="lab-search" type="search" placeholder="${esc(tr('搜索实验名称、目录、模型…'))}" aria-label="${esc(tr('搜索实验'))}" value="${esc(query)}"><button type="button" class="primary" data-lab="new">${esc(tr('＋ 新建实验'))}</button></div><div id="lab-list">${listHTML()}</div>`;
}

function paperEditorHTML(){const p=paperEdit,key='paper:'+p.id;
 return `<form id="lab-paper-form" class="lab-card lab-editor"><h3>${esc(tr(p.id?'编辑论文':'新建论文'))}</h3>
 ${field('论文题目','title',p.title,'paper',{required:true,max:300,hint:'暂定题目也可以'})}
 <div class="lab-triple"><label class="lab-field">${esc(tr('阶段'))}<select name="stage" data-m="paper">${options(STAGE,p.stage)}</select></label>${field('发表在哪里 / 预计投哪里','venue',p.venue,'paper',{max:300,hint:'例如 ICASSP 2027、TASLP、arXiv'})}${field('截止日期','deadline',p.deadline,'paper',{type:'date'})}</div>
 ${field('链接','link',p.link,'paper',{hint:'Overleaf、arXiv 或仓库地址',max:1000})}${field('核心论点','summary',p.summary,'paper',{rows:3,hint:'这篇论文想说明什么，依据哪些结果'})}${field('备注','notes',p.notes,'paper',{rows:2,hint:'审稿意见、待补实验、合作者…'})}
 <label class="lab-check"><input type="checkbox" name="done" data-m="paper" ${p.done?'checked':''}>${esc(tr('已完成'))}</label>
 <fieldset class="lab-paper-links"><legend>${esc(tr('依据哪些实验'))}</legend>${exps().length?exps().map(e=>{const l=p.links[e.id]||{on:false,note:''};return `<div class="lab-paper-link"><label class="lab-check"><input type="checkbox" data-pexp="${esc(e.id)}" ${l.on?'checked':''}>${esc(e.title)}</label><input data-pnote="${esc(e.id)}" value="${esc(l.note)}" maxlength="4000" placeholder="${esc(tr('用到它的哪些结果，例如：表 2 主结果、消融'))}" aria-label="${esc(tr('用到哪些结果'))}"></div>`}).join(''):`<p class="lab-empty-line">${esc(tr('还没有实验可以关联。'))}</p>`}</fieldset>
 <div class="lab-buttons"><button class="primary" ${busy?'disabled':''}>${esc(tr('保存论文'))}</button><button type="button" class="secondary" data-lab="paper-cancel">${esc(tr('取消'))}</button>${p.id?`<button type="button" class="lab-link lab-danger ${armed===key?'is-armed':''}" data-lab="paper-delete" data-id="${esc(p.id)}">${esc(tr(armed===key?'确认删除这篇论文':'删除论文'))}</button>`:''}</div></form>`;
}
function paperCardHTML(p){if(paperEdit?.id===p.id)return paperEditorHTML();
 return `<article class="lab-card lab-paper ${p.done?'status-done':''}" id="lab-paper-${esc(p.id)}"><header class="lab-card-head"><div><h3>${esc(p.title)}</h3><div class="lab-meta"><span class="lab-status">${esc(tr(STAGE[p.stage]||'构思中'))}</span>${p.done?`<span class="lab-status is-done">${esc(tr('已完成'))}</span>`:''}${p.venue?`<span class="lab-agent">${esc(tr(['accepted','published'].includes(p.stage)?'发表于':'预计投'))} ${esc(p.venue)}</span>`:''}${p.deadline?`<span>${esc(tr('截止'))} ${esc(p.deadline)}</span>`:''}</div></div>
 <div class="lab-card-actions"><button type="button" class="secondary" data-lab="paper-toggle" data-id="${esc(p.id)}">${esc(tr(p.done?'恢复未完成':'标记完成'))}</button><button type="button" class="secondary" data-lab="paper-edit" data-id="${esc(p.id)}">${esc(tr('编辑'))}</button></div></header>
 ${p.summary||p.link||p.notes?`<dl class="lab-facts">${p.summary?`<div class="lab-fact"><dt>${esc(tr('核心论点'))}</dt><dd>${esc(p.summary)}</dd></div>`:''}${p.link?`<div class="lab-fact"><dt>${esc(tr('链接'))}</dt><dd class="mono"><a href="${esc(p.link)}" target="_blank" rel="noopener">${esc(p.link)}</a></dd></div>`:''}${p.notes?`<div class="lab-fact"><dt>${esc(tr('备注'))}</dt><dd>${esc(p.notes)}</dd></div>`:''}</dl>`:''}
 <section class="lab-block"><div class="lab-block-head"><h4>${esc(tr('用到的实验'))} · ${p.experiments.length}</h4></div>${p.experiments.length?`<ul class="lab-logs">${p.experiments.map(x=>`<li><p><button type="button" class="lab-link" data-lab="jump" data-id="${esc(x.experiment_id)}">${esc(expById(x.experiment_id)?.title||'')}</button>${x.note?` — ${esc(x.note)}`:''}</p></li>`).join('')}</ul>`:`<p class="lab-empty-line">${esc(tr('还没有关联实验。编辑论文，勾选它依据的实验。'))}</p>`}</section></article>`;
}
function papersHTML(){const all=data.papers||[],match=(p,k)=>k==='all'||(k==='done')===!!p.done,list=all.filter(p=>match(p,paperFilter));
 return `<div class="lab-toolbar"><div class="lab-filters" role="group">${[['open','进行中'],['done','已完成'],['all','全部']].map(([k,l])=>`<button type="button" data-lab="paper-filter" data-value="${k}" class="${paperFilter===k?'selected':''}" aria-pressed="${paperFilter===k}">${esc(tr(l))} <small>${all.filter(p=>match(p,k)).length}</small></button>`).join('')}</div><span class="lab-space"></span><button type="button" class="primary" data-lab="paper-new">＋ ${esc(tr('新建论文'))}</button></div>
 ${paperEdit&&!paperEdit.id?paperEditorHTML():''}${list.map(paperCardHTML).join('')||(paperEdit?'':`<div class="lab-empty"><h3>${esc(tr(all.length?'没有符合条件的论文':'还没有论文'))}</h3><p>${esc(tr('把准备写的论文记在这里，关联它依据的实验，写上预计投到哪里。'))}</p></div>`)}`;
}
function reportHTML(){const loose=data.logs.filter(l=>!l.experiment_id);
 return `<aside class="lab-side"><section class="lab-panel"><h2>${esc(tr('日报'))} · ${esc(day)}</h2><textarea id="lab-report" rows="12" maxlength="50000" placeholder="${esc(tr('自己写，或者根据当天的记录生成一份草稿再改。'))}" aria-label="${esc(tr('日报'))}">${esc(reportText)}</textarea>
 <div class="lab-buttons"><button type="button" class="secondary" data-lab="report-draft" data-mode="plain" ${busy?'disabled':''}>${esc(tr('按记录生成草稿'))}</button><button type="button" class="secondary" data-lab="report-draft" data-mode="ai" ${busy?'disabled':''}>${esc(tr(busy==='report'?'正在总结…':'AI 总结今天'))}</button><button type="button" class="primary" data-lab="report-save" ${busy?'disabled':''}>${esc(tr('保存日报'))}</button></div>
 <p class="lab-hint" id="lab-report-state" role="status">${esc(reportNote||tr(reportDirty?'有未保存的修改':data.report?'已保存':'这一天还没有日报'))}</p></section>
 ${loose.length?`<section class="lab-panel"><h3>${esc(tr('未归类的记录'))} · ${loose.length}</h3><ul class="lab-logs">${loose.map(l=>logItem(l,true)).join('')}</ul></section>`:''}
 <section class="lab-panel"><h3>${esc(tr('最近几天'))}</h3>${data.days.length?`<ul class="lab-days">${data.days.map(d=>`<li><button type="button" data-lab="open-day" data-day="${esc(d.day)}" class="${d.day===day?'selected':''}"><span>${esc(d.day)}</span><small>${d.logs} ${esc(tr('条记录'))}${d.report?` · ${esc(tr('有日报'))}`:''}</small></button></li>`).join('')}</ul>`:`<p class="lab-empty-line">${esc(tr('记录会按天出现在这里。'))}</p>`}</section></aside>`;
}
function bind(){root.onclick=handle;root.oninput=input;root.onchange=change;root.onsubmit=submit}
function paint(){
 if(!active())return;
 window.UII18N?.add(dictionary);document.title=tr('实验记录');
 if(!data){root.innerHTML=`<div class="lab-page"><p class="notice ${error?'error':''}" role="status">${esc(error||tr('正在加载实验记录…'))}</p>${error?`<button type="button" class="secondary" data-lab="reload">${esc(tr('重试'))}</button>`:''}</div>`;bind();return}
 const running=exps().filter(e=>e.status==='active').length,variants=exps().reduce((n,e)=>n+(e.variants||[]).length,0),papers=data.papers||[];
 root.innerHTML=`<div class="lab-page"><div class="lab-title"><div><h1>${esc(tr('实验记录'))}</h1><p class="muted">${esc(tr('每个实验在哪做、用什么数据和模型、试过哪些变体、得到什么结论，都记在一处。'))}</p></div>
 </div>
 <div class="lab-stats"><div><b>${running}</b><span>${esc(tr('进行中的实验'))}</span></div><div><b>${variants}</b><span>${esc(tr('记录的变体'))}</span></div><div><b>${data.logs.length}</b><span>${esc(tr('当天记录'))}</span></div><div><b>${papers.filter(p=>!p.done).length}</b><span>${esc(tr('在写的论文'))}</span></div></div>
 <div class="lab-daybar"><div class="lab-day"><span class="lab-day-label">${esc(tr('记录日期'))}</span><button type="button" class="secondary" data-lab="day" data-step="-1" aria-label="${esc(tr('前一天'))}">‹</button><input type="date" id="lab-day" value="${esc(day)}" aria-label="${esc(tr('日期'))}"><button type="button" class="secondary" data-lab="day" data-step="1" aria-label="${esc(tr('后一天'))}">›</button>${day!==data.today?`<button type="button" class="secondary" data-lab="today">${esc(tr('回到今天'))}</button>`:''}</div><p class="lab-day-note">${esc(tr('切换日期会同时切换：每张实验卡片下的当天记录、“未归类”记录、以及右侧的日报。'))}</p></div>
 <div class="lab-layout"><div class="lab-main">${captureHTML()}<div class="lab-tabs" role="tablist">${[['experiments','实验'],['papers','论文']].map(([k,l])=>`<button type="button" role="tab" data-lab="tab" data-tab="${k}" aria-selected="${tab===k}" class="${tab===k?'selected':''}">${esc(tr(l))} <small>${k==='papers'?papers.length:exps().length}</small></button>`).join('')}</div>${tab==='papers'?papersHTML():experimentsHTML()}</div>${reportHTML()}</div></div>`;
 bind();
}

const models={exp:()=>editing,variant:()=>variantEdit,link:()=>linkDraft,paper:()=>paperEdit};
function input(e){
 if(!active())return;const el=e.target;
 if(el.id==='lab-capture'){capture=el.value;return}
 if(el.id==='lab-report'){reportText=el.value;reportDirty=true;reportNote='';stash();const state=root.querySelector('#lab-report-state');if(state)state.textContent=tr('有未保存的修改');return}
 if(el.id==='lab-search'){query=el.value;const list=root.querySelector('#lab-list');if(list)list.innerHTML=listHTML();return}
 if(el.id==='lab-quicklog'){logText=el.value;return}
 if(el.id==='lab-target'){target=el.value;return}
 if(el.dataset.pexp&&paperEdit){(paperEdit.links[el.dataset.pexp]||={on:false,note:''}).on=el.checked;return}
 if(el.dataset.pnote&&paperEdit){const link=(paperEdit.links[el.dataset.pnote]||={on:false,note:''});link.note=el.value;if(el.value&&!link.on){link.on=true;const box=root.querySelector('[data-pexp="'+el.dataset.pnote+'"]');if(box)box.checked=true}return}
 const draft=el.closest('[data-draft]');
 if(draft&&drafts&&el.name){const d=drafts[Number(draft.dataset.draft)];if(d)d[el.name]=el.value;return}
 const model=models[el.dataset.m]?.();
 if(model&&el.name)model[el.name]=el.type==='checkbox'?el.checked:el.value;
}
function change(e){
 if(!active())return;const el=e.target;
 if(el.id==='lab-day'){gotoDay(el.value);return}
 if(el.dataset.move){post({action:'log-move',id:el.dataset.move,experiment_id:el.value});return}
 const draft=el.closest('[data-draft]');
 if(draft&&drafts&&el.name==='target'){const d=drafts[Number(draft.dataset.draft)];if(d){d.target=el.value;paint()}}
}
async function submit(e){
 e.preventDefault();if(!active()||busy)return;const id=e.target.id;
 if(id==='lab-drafts'){
  if(drafts.some(d=>d.target==='__new'&&!d.new_title.trim())){flash(tr('新建的实验需要一个名称。'),true);paint();return}
  const entries=drafts.map(({target:to,...d})=>({...d,experiment_id:to==='__new'?'':to,new_title:to==='__new'?d.new_title:''}));
  if(await post({action:'apply',entries,batch})){drafts=null;capture='';flash(tr('已记录到各个实验'));paint()}
 }else if(id==='lab-editor'){
  const {id:experimentId,revision,...experiment}=editing;
  if(await post({action:'save',id:experimentId,revision,experiment})){editing=null;flash(tr('实验已保存'));paint()}
 }else if(id==='lab-variant-form'){
  const {id:variantId,experiment_id,...variant}=variantEdit;
  if(await post({action:'variant-save',experiment_id,id:variantId,variant})){variantEdit=null;flash(tr('变体已保存'));paint()}
 }else if(id==='lab-link-form'){
  if(await post({action:'link-add',...linkDraft})){linkDraft=null;flash(tr('关联已保存'));paint()}
 }else if(id==='lab-paper-form'){
  const {id:paperId,revision,links,experiments,...paper}=paperEdit;
  const linked=Object.entries(links).filter(([,l])=>l.on).map(([experiment_id,l])=>({experiment_id,note:l.note}));
  if(await post({action:'paper-save',id:paperId,revision,paper,experiments:linked})){paperEdit=null;flash(tr('论文已保存'));paint()}
 }else if(id==='lab-log-form'){
  if(!logText.trim()){flash(tr('请先写下今天做了什么。'),true);paint();return}
  if(await post({action:'log',experiment_id:logFor,content:logText,batch:uid()})){logFor=null;logText='';flash(tr('已记录'));paint()}
 }
}
function reveal(selector){requestAnimationFrame(()=>root.querySelector(selector)?.scrollIntoView({behavior:'smooth',block:'start'}))}
async function handle(e){
 if(!active())return;const b=e.target.closest('[data-lab]');if(!b)return;
 const action=b.dataset.lab,id=b.dataset.id,experiment=expById(id);
 if(busy&&!['tab','filter','paper-filter'].includes(action))return;
 switch(action){
  case 'reload':load();break;
  case 'tab':tab=b.dataset.tab;paint();break;
  case 'day':gotoDay(shift(day,Number(b.dataset.step)));break;
  case 'today':gotoDay(today());break;
  case 'open-day':gotoDay(b.dataset.day);break;
  case 'filter':filter=b.dataset.value;paint();break;
  case 'paper-filter':paperFilter=b.dataset.value;paint();break;
  case 'organize':
   if(!capture.trim()){flash(tr('请先写下今天做了什么。'),true);paint();break}
   busy='organize';notice='';paint();
   try{const v=await request('/api/experiments/organize',{text:capture,day});drafts=v.entries.map(entry=>({...entry,target:entry.experiment_id||(entry.new_title?'__new':'')}));batch=uid()}
   catch(err){flash(err.message,true)}finally{busy='';paint()}
   break;
  case 'quick':
   if(!capture.trim()){flash(tr('请先写下今天做了什么。'),true);paint();break}
   if(await post({action:'log',experiment_id:target,content:capture,batch:uid()})){capture='';flash(tr('已记录'));paint()}
   break;
  case 'draft-remove':drafts.splice(Number(b.dataset.index),1);if(!drafts.length)drafts=null;paint();break;
  case 'draft-cancel':drafts=null;paint();break;
  case 'new':tab='experiments';editing={title:'',status:'active',agent:'',directory:'',data:'',model:'',results:'',conclusion:'',paths:'',notes:''};paint();reveal('#lab-editor');break;
  case 'edit':if(experiment){editing={...experiment};paint()}break;
  case 'edit-cancel':editing=null;paint();break;
  case 'delete':if(experiment&&arm('exp:'+id)&&await post({action:'delete',id,revision:experiment.revision})){editing=null;flash(tr('实验已删除，记录保留在“未归类”'));paint()}break;
  case 'toggle':if(experiment)await post({action:'toggle-done',id,revision:experiment.revision});break;
  case 'log-open':logFor=id;logText='';paint();root.querySelector('#lab-quicklog')?.focus();break;
  case 'log-cancel':logFor=null;logText='';paint();break;
  case 'log-delete':if(arm('log:'+id))await post({action:'log-delete',id});break;
  case 'copy':try{await navigator.clipboard.writeText(b.dataset.text);window.toast?.(tr('已复制路径'))}catch{}break;
  case 'variant-new':variantEdit={experiment_id:id,name:'',verdict:'pending',change_note:'',result:'',takeaway:'',path:''};paint();reveal('#lab-variant-form');break;
  case 'variant-edit':{const v=experiment?.variants.find(x=>x.id===b.dataset.vid);if(v){variantEdit={...v};paint()}break}
  case 'variant-cancel':variantEdit=null;paint();break;
  case 'variant-delete':if(arm('variant:'+b.dataset.vid))await post({action:'variant-delete',id:b.dataset.vid});break;
  case 'link-new':linkDraft={src:id,dst:'',kind:'related',note:''};paint();break;
  case 'link-cancel':linkDraft=null;paint();break;
  case 'link-delete':await post({action:'link-delete',id});break;
  case 'jump':tab='experiments';filter='all';query='';editing=null;paint();reveal('#lab-exp-'+id);break;
  case 'open-paper':tab='papers';paperFilter='all';paint();reveal('#lab-paper-'+id);break;
  case 'paper-new':tab='papers';paperEdit={title:'',stage:'idea',done:false,venue:'',deadline:'',link:'',summary:'',notes:'',links:{}};paint();reveal('#lab-paper-form');break;
  case 'paper-edit':{const p=data.papers.find(x=>x.id===id);if(p){paperEdit={...p,done:!!p.done,links:Object.fromEntries(p.experiments.map(x=>[x.experiment_id,{on:true,note:x.note}]))};paint()}break}
  case 'paper-cancel':paperEdit=null;paint();break;
  case 'paper-toggle':{const p=data.papers.find(x=>x.id===id);if(p)await post({action:'paper-toggle',id,revision:p.revision});break}
  case 'paper-delete':{const p=data.papers.find(x=>x.id===id);if(p&&arm('paper:'+id)&&await post({action:'paper-delete',id,revision:p.revision})){paperEdit=null;paint()}break}
  case 'report-draft':{
   const mode=b.dataset.mode;busy=mode==='ai'?'report':'draft';reportNote='';paint();
   try{const v=await request('/api/experiments/report',{day,mode});reportText=reportText.trim()?reportText.replace(/\s+$/,'')+'\n\n'+v.content:v.content;reportDirty=true;stash();reportNote=tr(mode==='ai'?'AI 草稿已填入，确认后点“保存日报”。':'草稿已填入，确认后点“保存日报”。')}
   catch(err){reportNote=err.message}finally{busy='';paint()}
   break}
  case 'report-save':
   if(await post({action:'report',content:reportText,revision:reportRevision})){reportDirty=false;stash();reportNote=tr('日报已保存')}else reportNote=notice;
   paint();break;
 }
}
window.renderExperiments=element=>{root=element;paint();if(!data&&!loading)load()};
document.addEventListener('ui-language-change',()=>paint());
window.addEventListener('beforeunload',e=>{if(capture.trim()||drafts||editing||variantEdit||paperEdit||logText.trim()){e.preventDefault();e.returnValue=''}});
document.addEventListener('DOMContentLoaded',()=>window.UII18N?.add(dictionary));
})();
