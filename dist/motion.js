(() => {
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  const easing='cubic-bezier(.22,1,.36,1)';
  const running=new WeakMap();
  function animate(el,frames,duration=280){
    if(!el||reduced.matches)return null;
    running.get(el)?.cancel();
    const animation=el.animate(frames,{duration,easing,fill:'none'});
    running.set(el,animation);animation.finished.catch(()=>{});return animation;
  }
  function enter(el,x=0,y=10){return animate(el,[{opacity:0,transform:`translate(${x}px,${y}px)`},{opacity:1,transform:'translate(0,0)'}]);}
  function outgoing(el,x=0){
    if(reduced.matches||!el||el.hidden)return;
    const rect=el.getBoundingClientRect();if(!rect.height)return;
    const clone=el.cloneNode(true);clone.removeAttribute('id');clone.querySelectorAll('[id]').forEach(n=>n.removeAttribute('id'));
    clone.inert=true;clone.setAttribute('aria-hidden','true');clone.classList.add('motion-ghost');
    Object.assign(clone.style,{position:'fixed',left:`${rect.left}px`,top:`${rect.top}px`,width:`${rect.width}px`,height:`${rect.height}px`,margin:'0',pointerEvents:'none',zIndex:'4'});
    document.body.append(clone);const a=animate(clone,[{opacity:.7,transform:'translateX(0)'},{opacity:0,transform:`translateX(${x}px)`}],160);
    if(a)a.finished.then(()=>clone.remove(),()=>clone.remove());else clone.remove();
  }
  const baseSetView=setView;
  setView=function(next){
    if(next===view)return baseSetView(next);
    const views=['calendar','records','insights'],direction=views.indexOf(next)>views.indexOf(view)?1:-1;
    document.querySelectorAll('.motion-ghost').forEach(n=>n.remove());
    outgoing($(view+'-view'),-direction*12);baseSetView(next);enter($(next+'-view'),direction*14,0);
    if(next==='insights')animateCharts();
  };
  let previousMonth=monthKey(),previousDate=selected,previousTotals=$('monthly-totals').textContent;
  const baseRender=render;
  render=function(){
    const nextMonth=monthKey(),nextDate=selected,monthChanged=nextMonth!==previousMonth,dateChanged=nextDate!==previousDate;
    const direction=nextMonth>previousMonth?1:-1;
    if(monthChanged&&view==='calendar')outgoing($('calendar'),-direction*12);
    baseRender();
    if(monthChanged){enter($('month-title'),0,0);if(view==='calendar')enter($('calendar'),direction*16,0);}
    // Date changes update values in place; the daily entry panel stays still.
    const totals=$('monthly-totals').textContent;
    if(totals!==previousTotals)document.querySelectorAll('.summary-metric .metric-value').forEach(el=>enter(el,0,4));
    previousMonth=nextMonth;previousDate=nextDate;previousTotals=totals;
  };
  function animateCharts(){
    if(reduced.matches)return;
    document.querySelectorAll('.column-fill').forEach((el,i)=>el.animate([{transform:'scaleY(0)'},{transform:'scaleY(1)'}],{duration:450,delay:i*5,easing,fill:'backwards'}));
    document.querySelectorAll('.segmented-share span').forEach(el=>animate(el,[{opacity:0,transform:'scaleX(.7)'},{opacity:1,transform:'scaleX(1)'}],420));
  }
  const baseInsights=renderInsights;
  renderInsights=function(){baseInsights();if(view==='insights'){enter($('category-bars'),0,5);animateCharts();}};

  // Reversible height transitions start from the current rendered height.
  const tray=$('quick-tray');let trayAnimation;
  new MutationObserver(()=>{
    if(reduced.matches)return;
    if(!tray.hidden){trayAnimation?.cancel();const style=getComputedStyle(tray),height=tray.getBoundingClientRect().height;tray.style.overflow='hidden';trayAnimation=animate(tray,[{height:'0px',opacity:0,paddingTop:'0px',paddingBottom:'0px',marginBottom:'0px'},{height:`${height}px`,opacity:1,paddingTop:style.paddingTop,paddingBottom:style.paddingBottom,marginBottom:style.marginBottom}],280);trayAnimation.finished.then(()=>{tray.style.overflow='';},()=>{});}
  }).observe(tray,{attributes:true,attributeFilter:['hidden']});
  const details=$('summary-disclosure'),summary=details.querySelector('summary'),body=$('monthly-totals');let disclosureAnimation;
  summary.addEventListener('click',event=>{
    if(reduced.matches)return;event.preventDefault();
    const closing=details.open&&!details.dataset.closing,currentHeight=details.open?body.getBoundingClientRect().height:0;
    disclosureAnimation?.cancel();delete details.dataset.closing;
    if(closing){details.dataset.closing='true';body.style.overflow='hidden';const h=currentHeight;
      disclosureAnimation=animate(body,[{height:`${h}px`,opacity:1},{height:'0px',opacity:0}],220);
      disclosureAnimation.finished.then(()=>{details.open=false;body.style.overflow='';delete details.dataset.closing;},()=>{});
    }else{details.open=true;body.style.overflow='hidden';const h=body.scrollHeight;
      disclosureAnimation=animate(body,[{height:`${currentHeight}px`,opacity:currentHeight?1:0},{height:`${h}px`,opacity:1}],280);
      disclosureAnimation.finished.then(()=>{body.style.overflow='';},()=>{});
    }
  });

  document.querySelectorAll('dialog').forEach(dialog=>{
    const show=dialog.showModal.bind(dialog),close=dialog.close.bind(dialog);let closing=null;
    dialog.showModal=function(){closing?.cancel();closing=null;dialog.inert=false;dialog.classList.remove('is-closing');show();enter(dialog,0,16);};
    dialog.close=function(value){
      if(!dialog.open||closing)return;
      if(reduced.matches){close(value);return;}
      dialog.inert=true;dialog.classList.add('is-closing');
      closing=animate(dialog,[{opacity:1,transform:'translateY(0) scale(1)'},{opacity:0,transform:'translateY(9px) scale(.985)'}],170);
      closing.finished.then(()=>{close(value);closing=null;dialog.inert=false;dialog.classList.remove('is-closing');},()=>{});
    };
    dialog.addEventListener('cancel',e=>{e.preventDefault();dialog.close();});
  });
})();
