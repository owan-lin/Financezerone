(() => {
  let chartMode='expense',code=fx.settings.code,budgets={};try{budgets=JSON.parse(localStorage.getItem('dayledger-budgets')||'{}')||{};}catch{}
  const budgetKey=()=>`${monthKey()}-${code}`;
  renderInsights=function(){
    code=fx.settings.code;const source=monthRecords(),prepared=fx.prepare(source,code),list=fx.settings.mode==='converted'?prepared.list:source,expenses=list.filter(r=>r.type==='expense'&&r.currency===code),total=sum(expenses,'expense',code),days=new Date(month.getFullYear(),month.getMonth()+1,0).getDate();
    const budget=validCents(budgets[budgetKey()])?budgets[budgetKey()]:0;
    const daily=Array.from({length:days},(_,i)=>{const date=`${monthKey()}-${String(i+1).padStart(2,'0')}`;return {date,value:sum(expenses.filter(r=>r.date===date),'expense',code),income:sum(list.filter(r=>r.date===date),'income',code),entries:source.filter(r=>r.date===date).length};});
    const active=daily.filter(d=>d.entries).length,elapsed=monthKey()===dateKey(now).slice(0,7)?now.getDate():month>now?0:days;
    const grouped=categories.expense.map((c,i)=>({name:c[0],value:sum(expenses.filter(r=>r.category===c[0]),'expense',code),color:colors[i]})).filter(c=>c.value).sort((a,b)=>b.value-a.value);
    const saved=presets.filter(p=>records.some(r=>r.date===selected&&r.presetId===p.id&&r.type==='expense')).length;
    let offset=0;const segments=grouped.map(g=>{const start=offset;offset+=g.value/total*100;return `${g.color} ${start}% ${offset}%`;}).join(',');
    $('category-bars').innerHTML=`<div class="insight-toolbar"><form id="budget-form"><label for="month-budget">月预算 · ${code}</label><input id="month-budget" aria-label="月预算" type="number" min="0" step="0.01" max="999999999" inputmode="decimal" placeholder="未设置" value="${budget?(budget/100).toFixed(2):''}"><button type="submit">保存</button></form></div>
    <div class="insight-overview"><section class="budget-overview"><div class="budget-ring" role="img" aria-label="${budget?`预算已使用 ${(total/budget*100).toFixed(1)}%`:'尚未设置月预算'}" style="--ring:${budget?Math.min(total/budget*100,100):0}%"><div><strong>${budget?Math.round(total/budget*100)+'%':'—'}</strong><span>预算使用</span></div></div><div class="budget-values"><span>本月支出 <small>${code}</small></span><strong>${number(total)}</strong><p>${budget?`${total>budget?'超出预算':'剩余预算'} <b>${number(Math.abs(budget-total))}</b>`:'设置预算后显示余量和目标线'}</p></div></section>
    <section class="activity-overview"><div class="mini-ring" style="--ring:${presets.length?saved/presets.length*100:0}%" role="img" aria-label="当天预设已记录 ${saved} / ${presets.length}"><span>${saved}<small> / ${presets.length}</small></span></div><div><h3>每日支出</h3><p>${selected.slice(5).replace('-',' / ')} · 已记录预设</p></div><div class="activity-number"><strong>${active}<small> / ${Math.max(active,elapsed)}</small></strong><span>本月记账天数</span></div></section></div>
    <section class="trend-section"><div class="chart-heading"><select id="chart-mode" aria-label="每日统计视图"><option value="expense" ${chartMode==='expense'?'selected':''}>每日支出</option><option value="income" ${chartMode==='income'?'selected':''}>每日收入</option><option value="both" ${chartMode==='both'?'selected':''}>每日收支</option></select><span id="trend-caption"></span></div><div class="daily-chart" role="group" aria-label="每日收支柱状图"><div class="chart-range income-range" aria-hidden="true"></div><div class="chart-range expense-range" aria-hidden="true"></div><div class="zero-line" aria-hidden="true"><span>0</span></div><div class="target-line"><span></span></div>${daily.map((d,i)=>`<button type="button" class="chart-column" data-insight-date="${d.date}"><span class="column-pair"><span class="column-fill expense-fill"></span><span class="column-fill income-fill"></span></span><span class="chart-tooltip"></span></button>`).join('')}</div><div class="chart-axis"><span>1 日</span><span>${Math.ceil(days/2)} 日</span><span>${days} 日</span></div></section>
    <div class="insight-bottom"><section class="category-composition"><div class="chart-heading"><h3>支出构成</h3><span>${grouped.length} 个分类</span></div><div class="composition-layout"><div class="composition-ring" role="img" aria-label="${grouped.map(g=>`${g.name} ${(g.value/total*100).toFixed(1)}%`).join('，')||'暂无支出'}" style="background:${total?`conic-gradient(${segments})`:'var(--panel-tint)'}"><span>${code}<strong>${grouped.length}</strong><small>分类</small></span></div><div class="composition-legend">${grouped.length?grouped.map(g=>`<button type="button" data-insight-category="${g.name}" aria-label="查看${g.name}明细"><i style="background:${g.color}"></i><span>${g.name}</span><b>${number(g.value)}</b><small>${(g.value/total*100).toFixed(1)}%</small></button>`).join(''):'<p class="empty">记入支出后显示分类占比</p>'}</div></div><div class="segmented-share" role="img" aria-label="支出分类占比">${grouped.map(g=>`<span style="flex:${g.value};background:${g.color}" title="${g.name} ${(g.value/total*100).toFixed(1)}%"></span>`).join('')}</div></section>
    <section class="habit-section"><div class="chart-heading"><h3>记账频率</h3><span>${active} 天有记录</span></div><div class="heatmap">${Array.from({length:(new Date(month.getFullYear(),month.getMonth(),1).getDay()+6)%7},()=>'<span></span>').join('')}${daily.map((d,i)=>`<button type="button" data-insight-date="${d.date}" style="--heat:${d.entries?Math.min(20+d.entries*18,95):0}%;--heat-ink:${d.entries>=3?'white':'var(--deep)'}" aria-label="${d.date}，${d.entries} 笔记录" title="${d.date} · ${d.entries} 笔"><span>${i+1}</span></button>`).join('')}</div><div class="heatmap-key"><span>少</span>${[0,25,50,75,95].map(n=>`<i style="--heat:${n}%"></i>`).join('')}<span>多</span></div></section></div>`;
    if(fx.settings.mode==='converted'&&prepared.missing.length){
      const root=$('category-bars');root.querySelector('.budget-values>strong').textContent='—';root.querySelector('.budget-values p').textContent='缺少汇率，暂不显示汇总';
      const ring=root.querySelector('.budget-ring');ring.style.setProperty('--ring','0%');ring.setAttribute('aria-label','汇率待补全');ring.querySelector('strong').textContent='—';
      root.querySelector('.daily-chart').innerHTML='<p class="fx-chart-empty">补全汇率后显示每日支出</p>';root.querySelector('.composition-layout').innerHTML='<p class="empty">补全汇率后显示分类构成</p>';root.querySelector('.segmented-share').innerHTML='';
    }
    function updateTrend(){
      const chart=document.querySelector('.daily-chart');if(!chart)return;
      const both=chartMode==='both',scale=both?50:100;
      function range(max){const power=10**Math.floor(Math.log10(Math.max(100,max)));return [1,2,2.5,5,10].find(step=>step*power>=max)*power;}
      const incomeLimit=range(Math.max(100,...daily.map(d=>d.income))),expenseLimit=range(Math.max(100,...daily.map(d=>d.value),budget/days));
      const upper=chart.querySelector('.income-range'),lower=chart.querySelector('.expense-range');
      if(upper)upper.textContent='+'+number(incomeLimit);if(lower)lower.textContent='−'+number(expenseLimit);
      chart.setAttribute('aria-label',both?'每日收支柱状图，上下使用独立比例尺':'每日'+(chartMode==='income'?'收入':'支出')+'柱状图');
      chart.dataset.mode=chartMode;chart.style.setProperty('--zero',both?'50%':'100%');
      $('trend-caption').textContent=code+(both?' · 收入↑ / 支出↓ · 独立比例尺':'')+(budget&&chartMode!=='income'?' · 虚线为日均预算':'');
      const target=chart.querySelector('.target-line');
      if(target){target.style.top=(both?50+budget/days/expenseLimit*50:100-budget/days/expenseLimit*100)+'%';target.style.bottom='auto';target.style.opacity=budget&&chartMode!=='income'?'1':'0';target.querySelector('span').textContent=(both?'−':'')+number(Math.round(budget/days));}
      chart.querySelectorAll('.chart-column').forEach((button,i)=>{
        const d=daily[i],income=chartMode==='expense'?0:d.income/incomeLimit*scale,expense=chartMode==='income'?0:d.value/expenseLimit*scale;
        const up=button.querySelector('.income-fill'),down=button.querySelector('.expense-fill');
        up.style.height=income+'%';up.style.top=((both?50:100)-income)+'%';down.style.height=expense+'%';down.style.top=(both?50:100-expense)+'%';
        button.setAttribute('aria-label',d.date+(chartMode!=='expense'?' 收入 '+money(d.income,code):'')+(chartMode!=='income'?' 支出 '+money(d.value,code):''));
        button.querySelector('.chart-tooltip').innerHTML=(i+1)+'日'+(chartMode!=='expense'?'<b>收入 '+money(d.income,code)+'</b>':'')+(chartMode!=='income'?'<b>支出 '+money(d.value,code)+'</b>':'');
      });
    }
    updateTrend();
    // A mode change updates only existing bars: controls, panels and scroll stay put.
    $('chart-mode').onchange=()=>{chartMode=$('chart-mode').value;updateTrend();};
    document.querySelectorAll('[data-analysis-currency]').forEach(b=>b.onclick=()=>{fx.setSettings({code:b.dataset.analysisCurrency});});
    document.querySelectorAll('[data-insight-date]').forEach(b=>b.onclick=()=>{selected=b.dataset.insightDate;setView('calendar');render();});
    document.querySelectorAll('[data-insight-category]').forEach(b=>b.onclick=()=>{$('search').value=b.dataset.insightCategory;$('record-currency-filter').value=fx.settings.mode==='converted'?'all':code;$('type-filter').value='expense';setView('records');renderRecords();});
    $('budget-form').onsubmit=e=>{e.preventDefault();const raw=$('month-budget').value,value=Math.round(Number(raw)*100);if(raw&&!validCents(value,true)){toast('请输入有效预算');return;}const next={...budgets,[budgetKey()]:value};try{localStorage.setItem('dayledger-budgets',JSON.stringify(next));budgets=next;renderInsights();toast('月预算已保存');}catch{toast('预算保存失败，请检查本地存储空间');}};
  };
  window.addEventListener('storage',e=>{if(e.key==='dayledger-budgets'){try{budgets=JSON.parse(e.newValue||'{}')||{};renderInsights();}catch{}}});
  renderInsights();
})();

