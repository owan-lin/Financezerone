// Native disclosure keeps keyboard and screen-reader behavior intact.
const disclosure = $('summary-disclosure');
try { disclosure.open = localStorage.getItem('dayledger-summary-open') !== 'false'; } catch {}
$('summary-title').textContent = disclosure.open ? '本月收支' : '本月结余';
disclosure.addEventListener('toggle', () => {
  $('summary-title').textContent = disclosure.open ? '本月收支' : '本月结余';
  try { localStorage.setItem('dayledger-summary-open', String(disclosure.open)); } catch {}
});

// Progress describes saved entries, while pending edits stay visibly distinct.
function trackDailyEdits(event) {
  const row = event.target.closest('[data-daily-id]');
  if (!row) return;
  const preset = presets.find(p => p.id === row.dataset.dailyId);
  if (!preset) return;
  const saved = presetRecord(preset);
  const expectedCents = saved?.cents ?? preset.defaultCents;
  const expectedCurrency = saved?.currency || preset.currency;
  const raw = row.querySelector('[data-daily-amount]').value;
  const cents = raw === '' ? 0 : Math.round(Number(raw) * 100);
  const code = row.querySelector('[data-daily-currency]').value;
  row.classList.toggle('dirty', raw.trim() !== '' && (!saved || cents !== expectedCents || code !== expectedCurrency));
  const dirtyCount = $('daily-presets').querySelectorAll('.dirty').length;
  $('daily-hint').textContent = dirtyCount ? `${dirtyCount} 项待保存` : '';
}
$('daily-form').addEventListener('input', trackDailyEdits);
$('daily-form').addEventListener('change', trackDailyEdits);

// Move only the glyph, keeping the hit target still and easy to click.
for (const button of document.querySelectorAll('.icon-button')) {
  button.addEventListener('pointermove', event => {
    if (event.pointerType !== 'mouse' || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const bounds = button.getBoundingClientRect();
    button.style.setProperty('--icon-x', `${(event.clientX - bounds.left - bounds.width / 2) * .12}px`);
    button.style.setProperty('--icon-y', `${(event.clientY - bounds.top - bounds.height / 2) * .12}px`);
  });
  button.addEventListener('pointerleave', () => {
    button.style.setProperty('--icon-x', '0px');
    button.style.setProperty('--icon-y', '0px');
  });
}
