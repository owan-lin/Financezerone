const message = document.querySelector('#message');
let token, selected = 'uw';
try { if (sessionStorage.getItem('owan-selected-app') === 'finance') selected = 'finance'; } catch {}
function selectApp(id, focusTab = false) {
  selected = id;
  try { sessionStorage.setItem('owan-selected-app', id); } catch {}
  document.querySelectorAll('.slide').forEach(slide => {
    const active = slide.id === `slide-${id}`;
    slide.hidden = !active; slide.classList.toggle('active', active);
  });
  document.querySelectorAll('[data-select]').forEach(control => {
    const active = control.dataset.select === id;
    control.classList.toggle('active', active);
    if (control.getAttribute('role') === 'tab') {
      control.setAttribute('aria-selected', String(active));
      control.tabIndex = active ? 0 : -1;
      control.classList.toggle('selected', active);
      if (active && focusTab) control.focus();
    } else if (active) control.setAttribute('aria-current', 'page');
    else control.removeAttribute('aria-current');
  });
  document.querySelector('.page-switch').classList.toggle('on-second', id === 'finance');
  message.textContent = '';
}
document.querySelectorAll('[data-select]').forEach(control => control.addEventListener('click', () => selectApp(control.dataset.select)));
for (const id of ['previous','next']) document.getElementById(id).addEventListener('click', () => selectApp(selected === 'uw' ? 'finance' : 'uw'));
document.querySelector('.app-tabs').addEventListener('keydown', event => {
  if (['ArrowLeft','ArrowRight','Home','End'].includes(event.key)) {
    event.preventDefault();
    selectApp(event.key === 'Home' ? 'uw' : event.key === 'End' ? 'finance' : selected === 'uw' ? 'finance' : 'uw', true);
  }
});

// One deliberate wheel gesture selects a page; touchpad momentum stays on it.
let wheelDistance = 0, lastWheelAt = 0, wheelLocked = false;
document.querySelector('.showcase').addEventListener('wheel', event => {
  if (event.ctrlKey || event.metaKey || Math.abs(event.deltaX) > Math.abs(event.deltaY)) return;
  const needsScroll = document.documentElement.scrollHeight > window.innerHeight + 2;
  if (needsScroll && !event.target.closest('.page-switch, .switcher')) return;
  event.preventDefault();
  const now = performance.now();
  if (now - lastWheelAt > 180) { wheelDistance = 0; wheelLocked = false; }
  lastWheelAt = now;
  if (wheelLocked) return;
  const unit = event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? window.innerHeight : 1;
  wheelDistance += event.deltaY * unit;
  if (Math.abs(wheelDistance) < 55) return;
  wheelLocked = true;
  selectApp(wheelDistance > 0 ? 'finance' : 'uw');
}, {passive:false});

async function refresh() {
  try {
    const response = await fetch('/api/status', {cache:'no-store'});
    if (!response.ok) throw new Error('无法连接工作台，请重新打开启动器。');
    const data = await response.json(); token = data.token;
    for (const [id, app] of Object.entries(data.apps)) {
      const element = document.querySelector(`[data-status="${id}"]`);
      element.dataset.state = app.state;
      element.textContent = {running:'运行中',stopped:'点击即可启动',conflict:'端口被其他应用占用'}[app.state];
    }
  } catch (error) { message.textContent = error.message; }
}

document.querySelectorAll('[data-app]').forEach(button => button.addEventListener('click', async () => {
  button.disabled = true; message.textContent = '';
  const label = button.querySelector('span'), original = label.textContent;
  label.textContent = '正在打开…';
  try {
    if (!token) await refresh();
    const response = await fetch(`/api/launch/${button.dataset.app}`, {method:'POST',headers:{'X-Hub-Token':token || ''}});
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || '启动失败，请重试。');
    window.location.assign(data.url);
  } catch (error) { message.textContent = error.message; }
  finally {button.disabled = false; label.textContent = original; refresh();}
}));
selectApp(selected); refresh(); setInterval(refresh, 15000);
window.addEventListener('pageshow', refresh);
