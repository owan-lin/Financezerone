// Custom controls keep the native values as the single source of truth.
(() => {
  let activeMenu = null, serial = 0;
  const chevron = '<svg viewBox="0 0 20 20" aria-hidden="true"><path d="m6 8 4 4 4-4"/></svg>';
  function closeMenu(focus = false) {
    if (!activeMenu) return;
    const {panel, trigger} = activeMenu;
    if(!matchMedia('(prefers-reduced-motion: reduce)').matches){panel.inert=true;panel.setAttribute('aria-hidden','true');panel.style.pointerEvents='none';panel.querySelector('[role=listbox]')?.removeAttribute('id');const exit=panel.animate([{opacity:1,transform:'translateY(0) scale(1)'},{opacity:0,transform:'translateY(-3px) scale(.985)'}],{duration:120,easing:'ease-out'});exit.finished.then(()=>panel.remove(),()=>panel.remove());}else panel.remove();trigger.setAttribute('aria-expanded','false');
    activeMenu = null; if (focus && trigger.isConnected) trigger.focus();
  }
  function enhance(select) {
    if (select.dataset.enhanced) return;
    select.dataset.enhanced = 'true';
    const wrap = document.createElement('span'); wrap.className = 'choice';
    select.before(wrap); wrap.append(select);
    select.classList.add('choice-source'); select.tabIndex = -1; select.setAttribute('aria-hidden','true');
    const trigger = document.createElement('button'); trigger.type='button'; trigger.className='choice-trigger';
    trigger.setAttribute('role','combobox'); trigger.setAttribute('aria-haspopup','listbox'); trigger.setAttribute('aria-expanded','false');
    const label=select.getAttribute('aria-label') || '选择'; trigger.setAttribute('aria-label',label);
    wrap.append(trigger);
    trigger.innerHTML=`<span></span>${chevron}`;
    const sync = () => {const text=select.selectedOptions[0]?.textContent||'请选择';if(trigger.firstElementChild.textContent!==text)trigger.firstElementChild.textContent=text;trigger.disabled=select.disabled;};
    sync(); select.addEventListener('change',sync);
    new MutationObserver(sync).observe(select,{childList:true,subtree:true,attributes:true});
    trigger.addEventListener('focus',sync);
    trigger.addEventListener('click',()=>{
      if(activeMenu?.trigger===trigger){closeMenu();return;}closeMenu();sync();
      const panel=document.createElement('div');panel.className='choice-menu';
      const id=`choices-${++serial}`;trigger.setAttribute('aria-controls',id);trigger.setAttribute('aria-expanded','true');
      const list=document.createElement('div');list.id=id;list.setAttribute('role','listbox');list.setAttribute('aria-label',label);panel.append(list);
      const options=Array.from(select.options);let search;
      if(options.length>5){search=document.createElement('input');search.type='search';search.placeholder='搜索分类';search.setAttribute('aria-label','搜索分类');panel.prepend(search);search.addEventListener('input',draw);}
      function draw(){list.replaceChildren();for(const option of options.filter(o=>!search||o.textContent.includes(search.value.trim()))){
        const b=document.createElement('button');b.type='button';b.setAttribute('role','option');b.setAttribute('aria-selected',String(option.value===select.value));b.disabled=option.disabled;
        b.innerHTML=`<span>${escapeHtml(option.textContent)}</span><span class="choice-check">${option.value===select.value?'✓':''}</span>`;
        b.onclick=()=>{select.value=option.value;select.dispatchEvent(new Event('change',{bubbles:true}));sync();closeMenu(true);};list.append(b);
      }if(!list.children.length)list.innerHTML='<p class="menu-empty">没有匹配的分类</p>';}
      draw();(select.closest('dialog')||document.body).append(panel);activeMenu={panel,trigger};
      activeMenu.position=()=>{const rect=trigger.getBoundingClientRect(),width=Math.max(rect.width,190);
      panel.style.width=`${Math.min(width,innerWidth-24)}px`;panel.style.left=`${Math.max(12,Math.min(rect.left,innerWidth-width-12))}px`;
      const height=Math.min(panel.scrollHeight,300);panel.style.top=`${rect.bottom+height+8>innerHeight?Math.max(12,rect.top-height-6):rect.bottom+6}px`;};activeMenu.position();
      (search||list.querySelector('[aria-selected="true"]')||list.querySelector('button'))?.focus();
      panel.addEventListener('keydown',e=>{const items=Array.from(list.querySelectorAll('button:not(:disabled)')),i=items.indexOf(document.activeElement);if(e.key==='Escape'){e.preventDefault();e.stopPropagation();closeMenu(true);}else if(['ArrowDown','ArrowUp','Home','End'].includes(e.key)){e.preventDefault();const next=e.key==='Home'?0:e.key==='End'?items.length-1:e.key==='ArrowDown'?Math.min(i+1,items.length-1):Math.max(i-1,0);items[next]?.focus();}else if(e.key==='Tab')closeMenu();});
    });
    trigger.addEventListener('keydown',e=>{if(['ArrowDown','ArrowUp'].includes(e.key)){e.preventDefault();trigger.click();}});
  }
  function scan(){document.querySelectorAll('select:not([data-enhanced])').forEach(enhance);document.querySelectorAll('select[data-enhanced]').forEach(s=>{const b=s.parentElement.querySelector('.choice-trigger');if(b){const text=s.selectedOptions[0]?.textContent||'请选择';if(b.querySelector('span').textContent!==text)b.querySelector('span').textContent=text;}});if(activeMenu&&!activeMenu.trigger.isConnected)closeMenu();}
  scan();new MutationObserver(scan).observe(document.body,{childList:true,subtree:true});
  document.addEventListener('pointerdown',e=>{if(activeMenu&&!activeMenu.panel.contains(e.target)&&!activeMenu.trigger.contains(e.target))closeMenu();});
  window.addEventListener('resize',()=>closeMenu());document.addEventListener('scroll',e=>{if(activeMenu&&!activeMenu.panel.contains(e.target))activeMenu.position();},true);
  document.querySelectorAll('dialog').forEach(d=>d.addEventListener('close',()=>closeMenu()));

  // A compact accordion tray supports one-handed, repeated entry.
  const quickButton=document.createElement('button');quickButton.id='quick-toggle';quickButton.className='quick-toggle';quickButton.textContent='支出';quickButton.setAttribute('aria-label','快捷记支出');quickButton.setAttribute('aria-expanded','false');
  const incomeButton=document.createElement('button');incomeButton.id='quick-income';incomeButton.className='quick-toggle';incomeButton.textContent='收入';incomeButton.setAttribute('aria-label','快捷记收入');incomeButton.setAttribute('aria-expanded','false');$('add-btn').before(quickButton,incomeButton);$('add-btn').hidden=true;
  const tray=document.createElement('section');tray.id='quick-tray';tray.className='quick-tray';tray.hidden=true;
  const shortcutIcons={'餐饮':'M4 3v7m3-7v7m-3-3h3m-1.5 3v11M15 3v18m0-18c5 3 5 9 0 9','交通':'M5 5h14v11H5zM8 3h8M7 16l-2 4m12-4 2 4M8 9h8','购物':'M5 7h14l1 14H4L5 7zm3 0V5a4 4 0 0 1 8 0v2','工资':'M3 6h18v14H3zM3 10h18m-7 4h4'};
  const shortcuts=Object.entries(categories).flatMap(([type,items])=>items.map(([name])=>[name,type,shortcutIcons[name]||'M5 5h14v14H5zM9 9h6m-6 5h6']));
  tray.innerHTML=`<div class="quick-tabs" role="tablist" aria-label="快捷分类">${shortcuts.map(([name,type,path],i)=>`<button role="tab" aria-selected="${i===0}" aria-label="${name}" title="${name}" data-quick-category="${name}" data-quick-type="${type}" type="button"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="${path}"/></svg><span>${name}</span></button>`).join('')}</div><form id="quick-form"><span id="quick-date"></span><select id="quick-currency" aria-label="快捷记账币种"><option>USD</option><option>CNY</option></select><input id="quick-amount" aria-label="快捷金额" type="number" min="0.01" max="999999999" step="0.01" inputmode="decimal" placeholder="0.00" required><input id="quick-note" aria-label="快捷备注" placeholder="备注，选填" maxlength="100"><button class="primary" type="submit">记入当天</button></form>`;
  document.querySelector('.month-toolbar').after(tray);let quickCategory='餐饮',quickType='expense';
  let closeAnimation;
  function toggleQuick(type=quickType,forceClose=false){
    const wasClosing=!!tray.dataset.closing;closeAnimation?.cancel();delete tray.dataset.closing;
    if(!tray.hidden&&(forceClose||(!wasClosing&&type===quickType))){
      quickButton.setAttribute('aria-expanded','false');incomeButton.setAttribute('aria-expanded','false');
      if(matchMedia('(prefers-reduced-motion: reduce)').matches){tray.hidden=true;return;}
      tray.dataset.closing='true';closeAnimation=tray.animate([{height:tray.getBoundingClientRect().height+'px',opacity:1},{height:'0px',opacity:0,paddingTop:'0px',paddingBottom:'0px',marginBottom:'0px'}],{duration:220,easing:'cubic-bezier(.22,1,.36,1)'});
      closeAnimation.finished.then(()=>{tray.hidden=true;delete tray.dataset.closing;},()=>{});return;
    }
    quickType=type;quickCategory=type==='income'?'工资':'餐饮';
    tray.querySelectorAll('[role=tab]').forEach(b=>{b.hidden=b.dataset.quickType!==type;b.setAttribute('aria-selected',String(b.dataset.quickCategory===quickCategory));});
    quickButton.setAttribute('aria-expanded',String(type==='expense'));incomeButton.setAttribute('aria-expanded',String(type==='income'));
    $('quick-date').textContent=selected.slice(5).replace('-',' / ');$('quick-currency').value=currency;
    tray.hidden=false;$('quick-amount').focus({preventScroll:true});
  }
  quickButton.onclick=()=>toggleQuick('expense');incomeButton.onclick=()=>toggleQuick('income');
  tray.querySelectorAll('[role=tab]').forEach((b,i,buttons)=>{b.onclick=()=>{quickCategory=b.dataset.quickCategory;quickType=b.dataset.quickType;buttons.forEach(x=>x.setAttribute('aria-selected',String(x===b)));$('quick-amount').focus();};b.onkeydown=e=>{if(['ArrowLeft','ArrowRight'].includes(e.key)){e.preventDefault();const visible=Array.from(buttons).filter(x=>!x.hidden),index=visible.indexOf(b),next=visible[(index+(e.key==='ArrowRight'?1:visible.length-1))%visible.length];next.click();next.focus();}};});
  $('quick-form').onsubmit=e=>{e.preventDefault();const cents=Math.round(Number($('quick-amount').value)*100),code=$('quick-currency').value;if(!validCents(cents)||!CURRENCIES.includes(code))return;
    const record={id:crypto.randomUUID(),date:selected,type:quickType,category:quickCategory,currency:code,cents,note:$('quick-note').value.trim()};const next=[...records,record];if(!persist(next,presets,code))return;records=next;currency=code;render();$('quick-amount').value='';$('quick-note').value='';$('quick-amount').focus();toast('已记入当天');};
  document.addEventListener('keydown',e=>{if(e.target.closest('input,textarea,select,[role=combobox]')||document.querySelector('dialog[open]')||e.ctrlKey||e.metaKey||e.altKey)return;if(e.key.toLowerCase()==='q'){e.preventDefault();quickButton.click();}if(e.key.toLowerCase()==='n'){e.preventDefault();quickButton.click();}});
  const dayNav=document.createElement('div');dayNav.className='day-navigation';dayNav.innerHTML='<button type="button" aria-label="前一天">‹</button><button type="button" aria-label="后一天">›</button>';$('day-add').before(dayNav);
  dayNav.querySelectorAll('button').forEach((b,i)=>b.onclick=()=>{const d=new Date(selected+'T12:00:00');d.setDate(d.getDate()+(i?1:-1));if(d.getFullYear()<1900||d.getFullYear()>9999)return;selected=dateKey(d);month=new Date(d.getFullYear(),d.getMonth(),1);render();});

  // Undo is valid only until a subsequent write, including another window.
  const originalPersist=persist,originalToast=toast;let undo=null;
  persist=function(next=records,nextPresets=presets,nextCurrency=currency){const before={records:structuredClone(records),presets:structuredClone(presets),currency};const ok=originalPersist(next,nextPresets,nextCurrency);if(ok)undo={...before,expected:localStorage.getItem(KEY)};return ok;};
  toast=function(message){originalToast(message);if(!undo)return;const snapshot=undo;undo=null;const b=document.createElement('button');b.type='button';b.textContent='撤销';b.onclick=()=>{if(localStorage.getItem(KEY)!==snapshot.expected){undo=null;originalToast('账本已有新修改，无法撤销');return;}if(!originalPersist(snapshot.records,snapshot.presets,snapshot.currency))return;records=snapshot.records;presets=snapshot.presets;currency=snapshot.currency;undo=null;render();originalToast('已撤销');};$('toast').append(b);clearTimeout(toast.timer);toast.timer=setTimeout(()=>{$('toast').classList.remove('visible');undo=null;},6500);};
  const originalRender=render;render=function(){originalRender();$('quick-date').textContent=selected.slice(5).replace('-',' / ');};
  const originalSetView=setView;setView=function(v){originalSetView(v);$('summary-disclosure').hidden=v==='insights';if(v!=='calendar'&&!tray.hidden)toggleQuick(quickType,true);};
})();
