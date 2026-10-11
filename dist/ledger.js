let showRecordDetails;
(() => {
  const bar=document.createElement('div');bar.className='statistics-bar';
  bar.innerHTML='<div class="statistics-options"><select id="statistics-mode" aria-label="统计方式"><option value="converted">按汇率汇总</option><option value="original">按原币分别统计</option></select><select id="statistics-currency" aria-label="汇总币种"><option>USD</option><option>CNY</option></select></div><span id="fx-status" role="status"></span><button id="manage-fx" type="button">汇率</button>';
  document.querySelector('.month-toolbar').after(bar);
  $('statistics-mode').value=fx.settings.mode;$('statistics-currency').value=fx.settings.code;
  $('statistics-mode').onchange=()=>fx.setSettings({mode:$('statistics-mode').value});
  $('statistics-currency').onchange=()=>fx.setSettings({code:$('statistics-currency').value});
  const filters=document.createElement('div');filters.className='record-type-tabs';filters.setAttribute('role','group');filters.setAttribute('aria-label','收支类型');
  filters.innerHTML=[['all','全部'],['income','收入'],['expense','支出']].map(([type,label])=>`<button type="button" data-record-type="${type}" aria-pressed="${type==='all'}">${label}</button>`).join('');
  $('records-view').prepend(filters);$('type-filter').closest('.choice').hidden=true;
  function syncFilters(){filters.querySelectorAll('button').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.recordType===$('type-filter').value)));syncCalendar();if(detailId&&view==='records'&&!Array.from($('all-records').querySelectorAll('[data-id]')).some(el=>el.dataset.id===detailId))closeDetails();}
  filters.onclick=e=>{const b=e.target.closest('[data-record-type]');if(!b)return;$('type-filter').value=b.dataset.recordType;renderRecords();};
  const recordsRender=renderRecords;renderRecords=function(){recordsRender();syncFilters();};
  let calendarType=null;
  function syncCalendar(){document.querySelectorAll('#monthly-totals [data-stat-type]').forEach(b=>b.setAttribute('aria-pressed',String(view==='calendar'?calendarType===b.dataset.statType:view==='records'&&$('type-filter').value===b.dataset.statType)));document.querySelectorAll('#calendar [data-date]').forEach(day=>{const match=calendarType&&records.some(r=>r.date===day.dataset.date&&r.type===calendarType);day.classList.toggle('type-match',!!match);day.classList.toggle('type-muted',!!calendarType&&!match);});}
  const calendarRender=renderCalendar;renderCalendar=function(){calendarRender();syncCalendar();};
  function filterType(type){if(view==='calendar'){calendarType=calendarType===type?null:type;syncCalendar();return;}if(view!=='records')return;$('type-filter').value=type;$('record-currency-filter').value='all';$('search').value='';renderRecords();}
  $('monthly-totals').addEventListener('click',e=>{const tile=e.target.closest('[data-stat-type]');if(tile)filterType(tile.dataset.statType);});
  $('monthly-totals').addEventListener('keydown',e=>{const tile=e.target.closest('[data-stat-type]');if(tile&&['Enter',' '].includes(e.key)){e.preventDefault();filterType(tile.dataset.statType);}});

  const quoteDialog=document.createElement('dialog');quoteDialog.id='fx-dialog';quoteDialog.innerHTML='<form id="fx-form"><div class="dialog-heading"><h2>汇率设置</h2><button type="button" class="icon-button" id="close-fx" aria-label="关闭汇率">×</button></div><label class="field">1 USD = CNY<input id="fx-rate" aria-label="美元兑人民币汇率" type="number" min="0.000001" max="999999" step="any" inputmode="decimal" required placeholder="填写汇率"></label><p id="fx-quote-info" role="status"></p><p class="fx-explanation">用于所有日期的币种折算。修改后同步更新汇总、图表和条目详情。</p><div class="dialog-footer"><button class="primary" type="submit">保存汇率</button></div></form>';document.body.append(quoteDialog);
  function openQuote(){ $('fx-rate').value=fx.defaultRate??'';$('fx-quote-info').textContent=fx.defaultRate?'当前汇率 · 1 USD = '+fx.defaultRate+' CNY':'尚未设置手动汇率';quoteDialog.showModal();}
  $('manage-fx').onclick=openQuote;$('close-fx').onclick=()=>quoteDialog.close();$('fx-rate').oninput=()=>{$('fx-quote-info').textContent='修改尚未保存';};
  $('fx-form').onsubmit=e=>{e.preventDefault();try{fx.setDefault(Number($('fx-rate').value));$('fx-quote-info').textContent='已同步 · 1 USD = '+fx.defaultRate+' CNY';toast('汇率已同步');}catch(error){toast(error.message||'汇率保存失败');}};

  const layout=document.createElement('div');layout.id='records-layout';layout.className='records-layout';$('all-records').before(layout);layout.append($('all-records'));
  const details=document.createElement('aside');details.id='record-details';details.className='record-details';details.setAttribute('aria-label','条目详情');details.hidden=true;layout.append(details);let detailId=null,detailDate=null;
  function closeDetails(){detailId=null;details.hidden=true;layout.classList.remove('detail-open');document.querySelectorAll('[data-id].detail-selected').forEach(el=>el.classList.remove('detail-selected'));}
  function drawDetails(){const r=records.find(r=>r.id===detailId);if(!r){closeDetails();return;}const target=fx.settings.code,conversion=fx.convert(r,target);
    details.innerHTML=`<div class="detail-heading"><span>${r.type==='income'?'收入':'支出'} · ${escapeHtml(r.category)}</span><button type="button" class="icon-button" id="close-detail" aria-label="关闭详情">×</button></div><h2>${r.type==='income'?'+':'−'}<small>${r.currency}</small> ${number(r.cents)}</h2><dl><div><dt>日期</dt><dd>${r.date}</dd></div><div><dt>备注</dt><dd>${escapeHtml(r.note||'—')}</dd></div>${r.presetId?'<div><dt>来源</dt><dd>每日支出</dd></div>':''}<div><dt>折合 ${target}</dt><dd>${conversion?money(conversion.cents,target):'汇率待补全'}</dd></div>${conversion?.rate&&r.currency!==target?`<div><dt>参考汇率</dt><dd>1 USD = ${conversion.rate} CNY<br><small>${conversion.source} · ${conversion.date}${conversion.date!=='全部日期'&&conversion.date!==r.date?' · 沿用此前公布值':''}</small></dd></div>`:''}</dl><div class="detail-footer"><button type="button" id="detail-fx">查看汇率</button><button type="button" class="primary" id="edit-detail">编辑条目</button></div>`;
    $('close-detail').onclick=closeDetails;$('edit-detail').onclick=()=>openEntry(detailId);$('detail-fx').onclick=()=>openQuote(r.date);
    document.querySelectorAll('[data-id]').forEach(el=>el.classList.toggle('detail-selected',el.dataset.id===detailId));
  }
  showRecordDetails=function(id){if(!records.some(r=>r.id===id))return;detailId=id;detailDate=selected;
    if(view==='records'){layout.append(details);layout.classList.add('detail-open');}else{$('day-records').after(details);}
    details.hidden=false;drawDetails();
  };
  const baseSetView=setView;setView=function(next){if(next!==view)closeDetails();baseSetView(next);syncCalendar();};
  document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!document.querySelector('dialog[open]'))closeDetails();});
  // Monetary summaries use converted copies; stored ledger records never change.
  const baseRender=render;render=function(){
    baseRender();const mode=fx.settings.mode,code=fx.settings.code,list=monthRecords(),prepared=fx.prepare(list,code);
    $('monthly-totals').innerHTML=[['income','收入'],['expense','支出'],['balance','结余']].map(([type,label])=>{
      const codes=mode==='converted'?[code]:CURRENCIES;
      return `<div class="summary-metric" ${type!=='balance'?`role="button" tabindex="0" data-stat-type="${type}" aria-label="查看本月${label}"`:''}><h2>${label}<span class="metric-link-arrow" aria-hidden="true">↗</span></h2>${codes.map(c=>{
        const relevant=mode==='converted'?prepared.list:list,missing=mode==='converted'&&prepared.missing.some(r=>type==='balance'||r.type===type),income=sum(relevant,'income',c),expense=sum(relevant,'expense',c),value=type==='income'?income:type==='expense'?expense:income-expense;
        return `<div class="metric-value"><span class="metric-currency">${c}</span><strong>${missing?'—':number(value)}</strong></div>`;}).join('')}</div>`;
    }).join('');
    $('summary-preview').textContent=mode==='converted'?(prepared.missing.length?'汇率待补全':money(sum(prepared.list,'income',code)-sum(prepared.list,'expense',code),code)):CURRENCIES.map(c=>money(sum(list,'income',c)-sum(list,'expense',c),c)).join(' · ');
    $('statistics-mode').value=mode;$('statistics-currency').value=code;$('statistics-currency').disabled=false;fx.updateStatus();
    syncCalendar();if(detailId){if(view==='calendar'&&detailDate!==selected)closeDetails();else drawDetails();}
    
  };
  // Keep only one visible entry point for type filtering.
  $('type-filter').onchange=renderRecords;
  window.addEventListener('storage',e=>{if(['dayledger-statistics','dayledger-fx-v1'].includes(e.key)){fx.reload();render();}});
  render();
})();
