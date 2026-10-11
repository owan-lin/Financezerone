const THEME_KEY = 'dayledger-theme';
const palettes = {
  original: ['#9cf448','#262626','#747970','#a8b59c','#c6d9b4','#555f4e','#d1d1ca','#92968d'],
  muelsyse: ['#87946E','#C6B44A','#B8C2AE','#151D20','#E8EADF','#707C6A','#3E5648','#A08E52'],
  surtr: ['#B9393C','#E4ACA6','#A66C66','#3C2020','#F9E3CF','#F9E3CF','#601B1C','#E56D79'],
  logos: ['#477DC0','#6ACEE6','#253665','#14151B','#F2E9E8','#F2E9E8','#6A6D78','#AEACB5']
};
function applyTheme(theme, save = false) {
  const selectedTheme = Object.hasOwn(palettes, theme) ? theme : 'original';
  document.documentElement.dataset.theme = selectedTheme;
  $('theme').value = selectedTheme;
  colors = palettes[selectedTheme];
  renderInsights();
  if (save) {
    try { localStorage.setItem(THEME_KEY, selectedTheme); }
    catch { toast('配色已切换，但无法保存偏好。'); }
  }
}
$('theme').onchange = () => applyTheme($('theme').value, true);
window.addEventListener('storage', event => {
  if (event.key === THEME_KEY) applyTheme(event.newValue);
});
applyTheme(document.documentElement.dataset.theme);
