const $ = id => document.getElementById(id);
const KEY = 'dayledger-v1';
const CURRENCIES = ['USD','CNY'];
const categories = {expense:[['餐饮','♧'],['购物','▧'],['交通','↗'],['住房','⌂'],['娱乐','♫'],['学习','▤'],['健康','♡'],['其他','⋯']],income:[['工资','▣'],['奖金','✧'],['兼职','◷'],['其他收入','＋']]};
let colors = ['#9cf448','#262626','#747970','#a8b59c','#c6d9b4','#555f4e','#d1d1ca','#92968d'];
const now = new Date();
const dateKey = d => `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
const defaults = () => [['breakfast','早餐','餐饮'],['lunch','午餐','餐饮'],['dinner','晚餐','餐饮'],['commute','通勤','交通']].map(([id,name,category])=>({id:`preset-${id}`,name,category,currency:'USD',defaultCents:0}));
let records=[],presets=defaults(),currency='USD',selected=dateKey(now),month=new Date(now.getFullYear(),now.getMonth(),1),view='calendar',editing=null,draft=[],storageAvailable=true;
try {
  const saved=JSON.parse(localStorage.getItem(KEY)||'null');
  if(saved){records=validateRecords(saved.records);currency=CURRENCIES.includes(saved.currency)?saved.currency:'USD';if(saved.presets!==undefined)presets=validatePresets(saved.presets);}
} catch {storageAvailable=false;}
function validDate(s){if(typeof s!=='string'||!/^\d{4}-\d{2}-\d{2}$/.test(s)||s<'1900-01-01')return false;const d=new Date(`${s}T12:00:00`);return !isNaN(d)&&dateKey(d)===s;}
function validCents(n,zero=false){return Number.isInteger(n)&&n>=(zero?0:1)&&n<=99999999900;}
function validateRecords(data){
  if(!Array.isArray(data)||data.length>100000)throw Error('记录格式无效');
  const ids=new Set();return data.map(r=>{
    if(!r||typeof r.id!=='string'||!r.id||r.id.length>150||ids.has(r.id)||!validDate(r.date)||!['income','expense'].includes(r.type)||!CURRENCIES.includes(r.currency)||!validCents(r.cents,r.type==='expense'&&!!r.presetId)||!categories[r.type].some(c=>c[0]===r.category)||typeof r.note!=='string'||r.note.length>100||(r.presetId!==undefined&&(typeof r.presetId!=='string'||!r.presetId||r.presetId.length>100)))throw Error('记录格式无效');
    ids.add(r.id);return {id:r.id,date:r.date,type:r.type,currency:r.currency,cents:r.cents,category:r.category,note:r.note,...(r.presetId?{presetId:r.presetId}:{})};
  });
}
function validatePresets(data){
  if(!Array.isArray(data)||data.length>30)throw Error('最多保存 30 个预设');
  const ids=new Set();return data.map(p=>{
    if(!p||typeof p.id!=='string'||!p.id||p.id.length>100||ids.has(p.id)||typeof p.name!=='string'||!p.name.trim()||p.name.length>30||!categories.expense.some(c=>c[0]===p.category)||!CURRENCIES.includes(p.currency)||!validCents(p.defaultCents,true))throw Error('请填写有效的预设名称、分类和金额');
    ids.add(p.id);return {id:p.id,name:p.name.trim(),category:p.category,currency:p.currency,defaultCents:p.defaultCents};
  });
}
function toast(message){$('toast').textContent=message;$('toast').classList.add('visible');clearTimeout(toast.timer);toast.timer=setTimeout(()=>$('toast').classList.remove('visible'),3200);}
function persist(next=records,nextPresets=presets,nextCurrency=currency){try{localStorage.setItem(KEY,JSON.stringify({version:1,currency:nextCurrency,records:next,presets:nextPresets}));return true;}catch{toast('无法保存，请检查浏览器存储空间或隐私设置。');return false;}}
function number(cents){return new Intl.NumberFormat('en-US',{minimumFractionDigits:2,maximumFractionDigits:2}).format(cents/100);}
function money(cents,code=currency){return `${code} ${number(cents)}`;}
function escapeHtml(text){return String(text).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
function monthKey(){return dateKey(month).slice(0,7);}
function monthRecords(){return records.filter(r=>r.date.startsWith(monthKey()));}
function sum(list,type,code){return list.filter(r=>r.type===type&&(!code||r.currency===code)).reduce((a,r)=>a+r.cents,0);}
function sorted(list){return [...list].sort((a,b)=>b.date.localeCompare(a.date));}
function render(){
  $('month-title').innerHTML=`<span class="month-year">${month.getFullYear()}年</span><span class="month-number">${month.getMonth()+1}</span><span>月</span>`;
  const list=monthRecords();
  $('monthly-totals').innerHTML=[['income','收入'],['expense','支出'],['balance','结余']].map(([type,label])=>`<div class="summary-metric"><h2>${label}</h2>${CURRENCIES.map(code=>{const income=sum(list,'income',code),expense=sum(list,'expense',code),value=type==='income'?income:type==='expense'?expense:income-expense;return `<div class="metric-value"><span class="metric-currency">${code}</span><strong>${number(value)}</strong></div>`;}).join('')}</div>`).join('');
  $('summary-preview').textContent=CURRENCIES.map(code=>money(sum(list,'income',code)-sum(list,'expense',code),code)).join(' · ');
  renderCalendar();renderDay();renderRecords();renderInsights();
}
function renderCalendar(){
  const start=new Date(month);start.setDate(1-((month.getDay()+6)%7));
  const days=new Date(month.getFullYear(),month.getMonth()+1,0).getDate(),cells=Math.ceil((((month.getDay()+6)%7)+days)/7)*7;
  const grouped=new Map();records.forEach(r=>{if(!grouped.has(r.date))grouped.set(r.date,[]);grouped.get(r.date).push(r);});
  let html='';for(let i=0;i<cells;i++){
    const d=new Date(start);d.setDate(start.getDate()+i);const key=dateKey(d),list=grouped.get(key)||[],today=key===dateKey(now);
    const lines=CURRENCIES.flatMap(code=>['income','expense'].map(type=>{const value=sum(list,type,code);return list.some(r=>r.type===type&&r.currency===code)?{type,code,value}:null;}).filter(Boolean));
    const description=lines.map(x=>`${x.type==='income'?'收入':'支出'} ${money(x.value,x.code)}`).join('，')||'无收支';
    html+=`<button class="day ${d.getMonth()!==month.getMonth()?'outside':''} ${key===selected?'selected':''} ${today?'is-today':''}" data-date="${key}" aria-label="${key}，${description}" aria-pressed="${key===selected}"><span class="day-number">${d.getDate()}</span>${today?'<span class="today-label">今天</span>':''}${lines.map(x=>`<span class="day-money ${x.type}-text" title="${money(x.value,x.code)}">${x.type==='income'?'+':'−'}${x.code==='USD'?'$':'¥'}${number(x.value)}</span>`).join('')}${list.length?`<span class="day-count">${list.length} 笔</span>`:''}</button>`;
  }$('calendar').innerHTML=html;
}
function recordHTML(r){return `<button class="record" data-id="${escapeHtml(r.id)}" aria-label="查看 ${escapeHtml(r.note||r.category)} ${money(r.cents,r.currency)}"><span class="record-info"><b>${escapeHtml(r.note||r.category)}</b><small>${escapeHtml(r.category)}${r.presetId?' · 每日支出':''}</small></span><span class="record-amount ${r.type}-text">${r.type==='income'?'+':'−'}${money(r.cents,r.currency)}</span></button>`;}
function currencyOptions(code){return CURRENCIES.map(c=>`<option value="${c}" ${c===code?'selected':''}>${c}</option>`).join('');}
function presetRecord(p,date=selected){return records.find(r=>r.presetId===p.id&&r.date===date&&r.type==='expense');}
function renderDaily(){
  const rows=Array.from($('daily-presets').querySelectorAll('[data-daily-id]'));
  if(rows.length===presets.length&&rows.every((row,i)=>row.nodeType===1&&row.dataset.dailyId===presets[i].id)){
    rows.forEach((row,i)=>{const p=presets[i],existing=presetRecord(p),cents=existing?.cents??p.defaultCents;
      const raw=row.querySelector('[data-daily-amount]').value,code=row.querySelector('[data-daily-currency]').value;
      if(row.dataset.date===selected&&row.classList.contains('dirty')&&(!existing||Math.round(Number(raw)*100)!==existing.cents||code!==existing.currency))return;row.dataset.date=selected;
      row.classList.toggle('saved',!!existing);row.classList.remove('dirty');
      row.querySelector('.preset-label').textContent=p.name;
      const amount=row.querySelector('[data-daily-amount]');amount.value=existing||cents?(cents/100).toFixed(2):'';amount.setAttribute('aria-label',p.name+'金额');
      const select=row.querySelector('[data-daily-currency]');select.value=existing?.currency||p.currency;select.setAttribute('aria-label',p.name+'币种');
      const trigger=row.querySelector('.choice-trigger');if(trigger){trigger.setAttribute('aria-label',p.name+'币种');trigger.firstElementChild.textContent=select.value;}
    });
  }else{
  $('daily-presets').innerHTML=presets.length?presets.map(p=>{const existing=presetRecord(p),cents=existing?.cents??p.defaultCents;return `<div class="preset-row ${existing?'saved':''}" data-daily-id="${escapeHtml(p.id)}" data-date="${selected}"><label class="preset-label" for="daily-${escapeHtml(p.id)}">${escapeHtml(p.name)}</label><input id="daily-${escapeHtml(p.id)}" data-daily-amount type="number" min="0" max="999999999" step="0.01" inputmode="decimal" placeholder="0.00" aria-label="${escapeHtml(p.name)}金额" value="${existing||cents?(cents/100).toFixed(2):''}"><select data-daily-currency aria-label="${escapeHtml(p.name)}币种">${currencyOptions(existing?.currency||p.currency)}</select></div>`;}).join(''):'<p class="empty">暂无预设，点击“编辑预设”添加。</p>';
  }
  const count=presets.filter(p=>presetRecord(p)).length;
  $('preset-status').textContent=`${count} / ${presets.length}`;
  const progress=$('daily-progress');progress.setAttribute('aria-valuemax',presets.length);progress.setAttribute('aria-valuenow',count);progress.setAttribute('aria-valuetext',`已记录 ${count} 项，共 ${presets.length} 项`);progress.style.setProperty('--progress',`${presets.length?count/presets.length*100:0}%`);
  $('daily-hint').textContent='';
  $('daily-form').querySelector('button[type="submit"]').disabled=!presets.length;
}
function renderDay(){
  const d=new Date(selected+'T12:00:00'),list=records.filter(r=>r.date===selected);
  $('selected-weekday').textContent=d.toLocaleDateString('zh-CN',{weekday:'long'})+(selected===dateKey(now)?' · 今天':'');
  $('selected-title').textContent=`${d.getMonth()+1}月${d.getDate()}日`;
  $('day-count').textContent=`${list.length} 笔`;
  $('day-records').innerHTML=list.length?list.map(recordHTML).join(''):'<div class="empty">暂无记录</div>';
  renderDaily();
}
function renderRecords(){
  const q=$('search').value.trim().toLowerCase(),type=$('type-filter').value,code=$('record-currency-filter').value;
  const list=sorted(monthRecords()).filter(r=>(type==='all'||r.type===type)&&(code==='all'||r.currency===code)&&(r.note+r.category).toLowerCase().includes(q));
  $('all-records').innerHTML=list.length?`<div class="table-scroll"><table class="ledger-table"><thead><tr><th>日期</th><th>分类</th><th class="note-cell">备注</th><th>金额</th></tr></thead><tbody>${list.map(r=>`<tr data-id="${escapeHtml(r.id)}"><td>${r.date.slice(5)}</td><td><button class="table-edit" data-id="${escapeHtml(r.id)}" aria-label="查看 ${r.date} ${escapeHtml(r.note||r.category)}">${escapeHtml(r.category)}</button></td><td class="note-cell">${escapeHtml(r.note||'—')}</td><td class="${r.type}-text">${r.type==='income'?'+':'−'}${money(r.cents,r.currency)}</td></tr>`).join('')}</tbody></table></div>`:'<div class="empty">暂无记录</div>';
}
function renderInsights(){
  $('category-bars').innerHTML=CURRENCIES.map(code=>{
    const list=monthRecords().filter(r=>r.type==='expense'&&r.currency===code),total=sum(list,'expense',code);
    const grouped=categories.expense.map(c=>({name:c[0],value:sum(list.filter(r=>r.category===c[0]),'expense',code)})).filter(c=>c.value).sort((a,b)=>b.value-a.value);
    return `<section class="analysis-section"><h2>${code} 支出 · ${number(total)}</h2>${total?`<table class="analysis-table"><thead><tr><th>分类</th><th>金额</th><th>占比</th></tr></thead><tbody>${grouped.map((c,i)=>`<tr><td>${c.name}</td><td>${number(c.value)}</td><td><div class="share-cell"><div class="bar-track"><div class="bar-fill" style="width:${c.value/total*100}%;background:${colors[i]}"></div></div><span>${(c.value/total*100).toFixed(1)}%</span></div></td></tr>`).join('')}</tbody></table>`:'<div class="empty">暂无支出</div>'}</section>`;
  }).join('');
}
function setView(v){view=v;document.querySelectorAll('[data-view]').forEach(b=>{b.classList.toggle('active',b.dataset.view===v);b.setAttribute('aria-current',b.dataset.view===v?'page':'false');});['calendar','records','insights'].forEach(k=>$(k+'-view').hidden=k!==v);}
function fillCategories(type,value){$('category').innerHTML=categories[type].map(c=>`<option value="${c[0]}">${c[0]}</option>`).join('');if(value)$('category').value=value;}
function openEntry(id=null){
  const r=records.find(r=>r.id===id);editing=r?.id||null;$('entry-form').reset();const type=r?.type||'expense';
  document.querySelector(`input[name="type"][value="${type}"]`).checked=true;fillCategories(type,r?.category);
  $('date').value=r?.date||selected;$('amount').value=r?(r.cents/100).toFixed(2):'';$('note').value=r?.note||'';$('entry-currency').value=r?.currency||currency;
  $('amount').min=r?.presetId?'0':'0.01';$('amount').min=r?.presetId?'0':'0.01';$('dialog-title').textContent=r?'编辑记录':'记一笔';$('delete-btn').hidden=!r;$('entry-dialog').showModal();$('amount').focus();
}
function moveMonth(delta){const next=new Date(month.getFullYear(),month.getMonth()+delta,1);if(next.getFullYear()<1900||next.getFullYear()>9999)return;month=next;selected=dateKey(month);render();}
$('prev').onclick=()=>moveMonth(-1);$('next').onclick=()=>moveMonth(1);$('today-btn').onclick=()=>{month=new Date(now.getFullYear(),now.getMonth(),1);selected=dateKey(now);render();};
$('calendar').onclick=e=>{const b=e.target.closest('[data-date]');if(!b)return;selected=b.dataset.date;const d=new Date(selected+'T12:00:00');month=new Date(d.getFullYear(),d.getMonth(),1);render();};
document.querySelectorAll('[data-view]').forEach(b=>b.onclick=()=>setView(b.dataset.view));
$('add-btn').onclick=()=>openEntry();$('day-add').onclick=()=>openEntry();$('close-dialog').onclick=()=>$('entry-dialog').close();
document.querySelectorAll('input[name="type"]').forEach(r=>r.onchange=()=>fillCategories(r.value));
document.addEventListener('click',e=>{const b=e.target.closest('[data-id]');if(b)showRecordDetails(b.dataset.id,b);});
$('entry-form').onsubmit=e=>{
  e.preventDefault();const cents=Math.round(Number($('amount').value)*100),date=$('date').value,code=$('entry-currency').value,type=document.querySelector('input[name="type"]:checked').value;
  if(!validCents(cents,type==='expense'&&!!records.find(r=>r.id===editing)?.presetId)||!validDate(date)||!CURRENCIES.includes(code)){toast('请输入有效金额、日期和币种。');return;}
  const old=records.find(r=>r.id===editing);
  const r={id:editing||crypto.randomUUID(),date,type,currency:code,cents,category:$('category').value,note:$('note').value.trim(),...(old?.presetId&&type==='expense'?{presetId:old.presetId}:{})};
  if(r.presetId&&records.some(x=>x.id!==r.id&&x.presetId===r.presetId&&x.date===date&&x.type==='expense'))delete r.presetId;
  const next=editing?records.map(x=>x.id===editing?r:x):[...records,r];
  if(!persist(next,presets,code))return;records=next;currency=code;selected=date;const d=new Date(date+'T12:00:00');month=new Date(d.getFullYear(),d.getMonth(),1);$('entry-dialog').close();render();toast(editing?'记录已更新':'已保存');
};
$('delete-btn').onclick=()=>{if(!editing||!confirm('删除这笔记录？此操作无法撤销。'))return;const next=records.filter(r=>r.id!==editing);if(!persist(next))return;records=next;$('entry-dialog').close();render();toast('记录已删除');};
$('daily-form').onsubmit=e=>{
  e.preventDefault();const next=[...records];let changed=0;
  for(const row of $('daily-presets').querySelectorAll('[data-daily-id]')){
    const p=presets.find(p=>p.id===row.dataset.dailyId),raw=row.querySelector('[data-daily-amount]').value;if(!raw.trim())continue;
    const cents=Math.round(Number(raw)*100),code=row.querySelector('[data-daily-currency]').value;
    if(!p||!validCents(cents,true)||!CURRENCIES.includes(code)){toast('请填写不小于 0 的有效金额。');return;}
    const index=next.findIndex(r=>r.presetId===p.id&&r.date===selected&&r.type==='expense'),old=next[index];
    if(old&&old.cents===cents&&old.currency===code)continue;
    const r={id:old?.id||crypto.randomUUID(),date:selected,type:'expense',currency:code,cents,category:old?.category||p.category,note:old?.note||p.name,presetId:p.id};
    if(index<0)next.push(r);else next[index]=r;changed++;
  }
  if(!changed){toast('没有需要保存的金额');return;}
  if(!persist(next))return;records=next;render();toast(`已保存 ${changed} 项支出`);
};
function renderPresetEditor(){
  $('preset-editor').innerHTML=draft.map(p=>`<div class="preset-editor-row" data-editor-id="${escapeHtml(p.id)}"><div class="preset-editor-top"><input data-name aria-label="预设名称" placeholder="项目名称" maxlength="30" required value="${escapeHtml(p.name)}"><button type="button" class="preset-remove" data-remove-preset="${escapeHtml(p.id)}">移除</button></div><div class="preset-editor-options"><select data-category aria-label="预设分类">${categories.expense.map(c=>`<option ${c[0]===p.category?'selected':''}>${c[0]}</option>`).join('')}</select><select data-currency aria-label="预设默认币种">${currencyOptions(p.currency)}</select><input data-default type="number" min="0" max="999999999" step="0.01" inputmode="decimal" placeholder="默认金额" aria-label="预设默认金额" value="${p.defaultCents?(p.defaultCents/100).toFixed(2):''}"></div></div>`).join('')+'<p class="preset-editor-hint">默认金额可留空，填写后仍需每天手动保存。</p>';
}
function readDraft(){return Array.from($('preset-editor').querySelectorAll('[data-editor-id]')).map(row=>({id:row.dataset.editorId,name:row.querySelector('[data-name]').value,category:row.querySelector('[data-category]').value,currency:row.querySelector('[data-currency]').value,defaultCents:Math.round(Number(row.querySelector('[data-default]').value)*100)}));}
$('manage-presets').onclick=()=>{draft=presets.map(p=>({...p}));renderPresetEditor();$('presets-dialog').showModal();};
$('close-presets').onclick=()=>$('presets-dialog').close();
$('new-preset').onclick=()=>{draft=readDraft();if(draft.length>=30){toast('最多保存 30 个预设');return;}draft.push({id:crypto.randomUUID(),name:'',category:'其他',currency,defaultCents:0});renderPresetEditor();const inputs=$('preset-editor').querySelectorAll('[data-name]');inputs[inputs.length-1].focus();};
$('preset-editor').onclick=e=>{const b=e.target.closest('[data-remove-preset]');if(!b)return;draft=readDraft().filter(p=>p.id!==b.dataset.removePreset);renderPresetEditor();};
$('presets-form').onsubmit=e=>{e.preventDefault();try{const next=validatePresets(readDraft());if(!persist(records,next))return;presets=next;$('presets-dialog').close();renderDaily();toast('预设已保存');}catch(error){toast(error.message);}};
$('search').oninput=renderRecords;$('type-filter').onchange=renderRecords;$('record-currency-filter').onchange=renderRecords;
$('export-btn').onclick=()=>{const blob=new Blob([JSON.stringify({version:1,currency,records,presets},null,2)],{type:'application/json'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=`日迹备份-${dateKey(new Date())}.json`;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);toast('备份已导出');};
$('import-btn').onclick=()=>$('import-file').click();
$('import-file').onchange=async e=>{
  const file=e.target.files[0];if(!file)return;
  try{if(file.size>20000000)throw Error();const data=JSON.parse(await file.text());if(data.version!==1)throw Error();const imported=validateRecords(data.records),ids=new Set(records.map(r=>r.id)),links=new Set(records.filter(r=>r.presetId).map(r=>`${r.date}|${r.presetId}`));
    const fresh=imported.filter(r=>{if(ids.has(r.id)||(r.presetId&&links.has(`${r.date}|${r.presetId}`)))return false;ids.add(r.id);if(r.presetId)links.add(`${r.date}|${r.presetId}`);return true;});
    const importedPresets=data.presets===undefined?[]:validatePresets(data.presets),presetIds=new Set(presets.map(p=>p.id)),newPresets=importedPresets.filter(p=>!presetIds.has(p.id));
    if(!fresh.length&&!newPresets.length){toast('备份中没有新记录或预设');return;}
    if(presets.length+newPresets.length>30)throw Error();
    if(!confirm(`导入 ${fresh.length} 条记录和 ${newPresets.length} 个预设？现有数据会保留。`))return;
    const next=[...records,...fresh],nextPresets=[...presets,...newPresets];if(!persist(next,nextPresets))return;records=next;presets=nextPresets;render();toast('备份已导入');
  }catch{toast('导入失败：请选择有效的日迹 JSON 备份。');}finally{e.target.value='';}
};
window.addEventListener('storage',e=>{if(e.key===KEY){try{const data=JSON.parse(e.newValue),nextRecords=data?validateRecords(data.records):[],nextPresets=data?.presets!==undefined?validatePresets(data.presets):defaults();records=nextRecords;presets=nextPresets;currency=data?.currency==='CNY'?'CNY':'USD';render();}catch{toast('另一窗口的数据无效，请检查备份。');}}});
render();if(!storageAvailable)toast('部分本地数据读取失败，请检查备份。');

