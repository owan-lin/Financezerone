// Only public month ranges and currency codes are requested. Amounts stay local.
const fx = (()=>{
  const CACHE='dayledger-fx-v1',PREF='dayledger-statistics';
  let cache={rates:{},months:{},manual:{}},settings={mode:'converted',code:'USD'},pending=new Set(),errors=new Set();
  try{const saved=JSON.parse(localStorage.getItem(CACHE)||'null');if(saved&&typeof saved==='object')cache={rates:saved.rates||{},months:saved.months||{},manual:saved.manual||{},defaultRate:saved.defaultRate};}catch{}
  try{const saved=JSON.parse(localStorage.getItem(PREF)||'null');if(saved)settings={mode:saved.mode==='original'?'original':'converted',code:CURRENCIES.includes(saved.code)?saved.code:'USD'};}catch{}
  const validRate=n=>typeof n==='number'&&Number.isFinite(n)&&n>0&&n<1000000;
  function rate(date){
    if(validRate(cache.defaultRate))return {rate:cache.defaultRate,date:'全部日期',source:'手动汇率'};
    if(validRate(cache.manual[date]))return {rate:cache.manual[date],date,source:'手动汇率'};
    if(date>dateKey(now))return null;
    for(let i=0;i<=10;i++){const d=new Date(date+'T12:00:00');d.setDate(d.getDate()-i);const key=dateKey(d),value=cache.rates[key];if(validRate(value))return {rate:value,date:key,source:'Frankfurter'};}
    return null;
  }
  function convert(record,target){
    if(record.currency===target)return {cents:record.cents,rate:1,date:record.date,source:'原币'};
    const quote=rate(record.date);if(!quote)return record.cents===0?{cents:0,rate:null,date:record.date,source:'零金额'}:null;
    const multiplier=record.currency==='USD'?quote.rate:1/quote.rate;
    return {...quote,cents:Math.round(record.cents*multiplier),multiplier};
  }
  function prepare(list,target=settings.code){
    if(settings.mode==='original')return {list:list.filter(r=>r.currency===target),missing:[]};
    const missing=[],converted=[];for(const r of list){const value=convert(r,target);if(value)converted.push({...r,cents:value.cents,currency:target});else missing.push(r);}
    return {list:converted,missing};
  }
  function saveCache(){localStorage.setItem(CACHE,JSON.stringify(cache));}
  async function ensure(period=monthKey(),force=false){
    if(validRate(cache.defaultRate)||pending.has(period))return;
    const end=dateKey(new Date(Number(period.slice(0,4)),Number(period.slice(5,7)),0)),today=dateKey(now),to=end<today?end:today;
    if(period>today.slice(0,7))return;
    const stamp=cache.months[period];if(!force&&stamp?.to===to&&Date.now()-stamp.time<86400000)return;
    if(!force&&errors.has(period))return;
    pending.add(period);errors.delete(period);updateStatus();
    try{
      const start=new Date(period+'-01T12:00:00');start.setDate(start.getDate()-10);
      const response=await fetch(`https://api.frankfurter.dev/v2/rates?base=USD&quotes=CNY&from=${dateKey(start)}&to=${to}`,{signal:AbortSignal.timeout(12000),credentials:'omit',referrerPolicy:'no-referrer'});
      if(!response.ok)throw Error('汇率服务暂不可用');const data=await response.json();if(!Array.isArray(data)||!data.length)throw Error('未取得历史汇率');
      let count=0;for(const item of data){if(item.base==='USD'&&item.quote==='CNY'&&validDate(item.date)&&item.date>=dateKey(start)&&item.date<=to&&validRate(item.rate)){cache.rates[item.date]=item.rate;count++;}}
      if(!count)throw Error('汇率数据无效');cache.months[period]={to,time:Date.now()};try{saveCache();}catch{}
    }catch{errors.add(period);}finally{pending.delete(period);render();updateStatus();}
  }
  function updateStatus(){
    const el=$('fx-status');if(!el)return;
    const missing=prepare(monthRecords()).missing;
    el.textContent=settings.mode==='original'?'按原币分别统计':pending.has(monthKey())?'正在获取历史汇率…':missing.length?`${missing.length} 笔缺少汇率，汇总待补全`:validRate(cache.defaultRate)?`手动汇率 · 1 USD = ${cache.defaultRate} CNY`:'可设置统一折算汇率';
    el.classList.toggle('fx-warning',settings.mode==='converted'&&missing.length>0);
  }
  function setSettings(next){settings={...settings,...next};try{localStorage.setItem(PREF,JSON.stringify(settings));}catch{}render();}
  return {get settings(){return settings;},get defaultRate(){return validRate(cache.defaultRate)?cache.defaultRate:null;},setDefault(value){if(!validRate(value))throw Error('请输入大于 0 的有效汇率');const next={...cache,defaultRate:value};localStorage.setItem(CACHE,JSON.stringify(next));cache=next;render();},rate,convert,prepare,ensure,updateStatus,setSettings,validRate,
    get pending(){return pending.has(monthKey());},get failed(){return errors.has(monthKey());},
    reload(){try{const saved=JSON.parse(localStorage.getItem(CACHE)||'{}');cache={rates:saved.rates||{},months:saved.months||{},manual:saved.manual||{},defaultRate:saved.defaultRate};const prefs=JSON.parse(localStorage.getItem(PREF)||'{}');settings={mode:prefs.mode==='original'?'original':'converted',code:CURRENCIES.includes(prefs.code)?prefs.code:'USD'};errors.clear();}catch{}},
    setManual(date,value){if(!validDate(date)||!validRate(value))throw Error('请输入有效日期和汇率');const next={...cache,manual:{...cache.manual,[date]:value}};localStorage.setItem(CACHE,JSON.stringify(next));cache=next;render();},
    clearManual(date){const next={...cache,manual:{...cache.manual}};delete next.manual[date];localStorage.setItem(CACHE,JSON.stringify(next));cache=next;render();}
  };
})();
