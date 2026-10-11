// Apply the saved palette before the page is painted.
try {
  const theme = localStorage.getItem('dayledger-theme') || 'original';
  document.documentElement.dataset.theme = ['original', 'muelsyse', 'surtr', 'logos'].includes(theme) ? theme : 'original';
} catch {
  document.documentElement.dataset.theme = 'original';
}
