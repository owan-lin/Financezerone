const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const { spawn } = require('node:child_process');
const { setTimeout: delay } = require('node:timers/promises');

const root = path.resolve(__dirname, '..');
const token = crypto.randomBytes(32).toString('hex');
const port = Number(process.env.HUB_PORT || 4180);
const config = JSON.parse(fs.readFileSync(path.join(__dirname, 'apps.json'), 'utf8'));
const apps = {
  uw: {url:'http://127.0.0.1:8765/', marker:'UWMaster', directory:config.uwDirectory, command:config.python, args:['server.py']},
  finance: {url:'http://localhost:4173/', marker:'日迹', directory:root, command:process.execPath, args:['server.js']}
};
const pending = new Map();
const contentTypes = {'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.ttf':'font/ttf','.otf':'font/otf','.jpg':'image/jpeg','.png':'image/png'};

async function state(app) {
  try {
    const response = await fetch(app.url, {signal:AbortSignal.timeout(1200), redirect:'error'});
    const content = await response.text();
    return response.ok && content.includes(app.marker) ? 'running' : 'conflict';
  } catch (error) {
    return error.cause?.code === 'ECONNREFUSED' ? 'stopped' : 'conflict';
  }
}

async function start(app) {
  const current = await state(app);
  if (current === 'running') return;
  if (current === 'conflict') throw new Error('应用端口被占用或响应异常。请关闭占用端口的程序后重试。');
  if (!fs.existsSync(path.join(app.directory, app.args[0]))) throw new Error('找不到应用文件，请检查 hub/apps.json 中的路径。');
  const logs = path.join(root, 'output', 'hub'); fs.mkdirSync(logs, {recursive:true});
  const output = fs.openSync(path.join(logs, app === apps.uw ? 'uw.log' : 'finance.log'), 'a');
  let child, failure, ended = false;
  try {
    child = spawn(app.command, app.args, {cwd:app.directory, detached:true, windowsHide:true, stdio:['ignore',output,output], env:{...process.env, PORT:app === apps.finance ? '4173' : process.env.PORT}});
  } finally {fs.closeSync(output);}
  child.on('error', error => {failure = error;});
  child.on('exit', () => {ended = true;});
  child.unref();
  for (let i = 0; i < 40; i++) {
    await delay(250);
    if (failure) throw new Error('无法启动应用，请检查 hub/apps.json 的运行程序路径。');
    if (await state(app) === 'running') return;
    if (ended) break;
  }
  throw new Error('应用未能启动，请查看 output/hub 下的日志后重试。');
}

const server = http.createServer(async (req, res) => {
  const json = (status, value) => {res.writeHead(status, {'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'}); res.end(JSON.stringify(value));};
  if (!['localhost','127.0.0.1'].some(host => req.headers.host === `${host}:${port}`)) return json(403, {error:'无效的访问地址。'});
  const url = new URL(req.url, `http://127.0.0.1:${port}`);
  if (url.pathname === '/api/status' && req.method === 'GET') {
    const states = await Promise.all(Object.entries(apps).map(async ([id, app]) => [id, {state:await state(app)}]));
    return json(200, {name:'Owan Workspace', token, apps:Object.fromEntries(states)});
  }
  if (url.pathname.startsWith('/api/launch/')) {
    if (req.method !== 'POST') return json(405, {error:'请通过面板按钮打开应用。'});
    const origin = req.headers.origin;
    if (req.headers['x-hub-token'] !== token || (origin && origin !== `http://${req.headers.host}`)) return json(403, {error:'请刷新面板后重试。'});
    const id = url.pathname.slice('/api/launch/'.length), app = Object.hasOwn(apps, id) && apps[id];
    if (!app) return json(404, {error:'找不到这个应用。'});
    try {
      if (!pending.has(id)) pending.set(id, start(app).finally(() => pending.delete(id)));
      await pending.get(id); return json(200, {url:app.url});
    } catch (error) {return json(503, {error:error.message});}
  }
  if (req.method !== 'GET' && req.method !== 'HEAD') return json(405, {error:'不支持此操作。'});
  // Exact routes keep application data and configuration outside the web root.
  const routes = {'/':'index.html','/hub.css':'hub.css','/hub.js':'hub.js','/campus.jpg':'campus.jpg','/uw-keyvisual.png':'uw-keyvisual.png','/finance-keyvisual.png':'finance-keyvisual.png','/uw-oc-v1.png':'uw-oc-v1.png','/uw-oc-v2.png':'uw-oc-v2.png','/uw-oc-crisp.png':'uw-oc-crisp.png','/uw-oc-smooth.png':'uw-oc-smooth.png','/uw-oc-final.png':'uw-oc-final.png','/finance-oc-final.png':'finance-oc-final.png','/finance-oc-smooth.png':'finance-oc-smooth.png','/finance-oc-crisp.png':'finance-oc-crisp.png','/finance-oc-v1.png':'finance-oc-v1.png','/fonts/HarmonyOS-Bold.otf':'fonts/HarmonyOS-Bold.otf','/fonts/HarmonyOS-Black.ttf':'fonts/HarmonyOS-Black.ttf'};
  const font = /^\/fonts\/(AlbertSans-Variable|NotoSansSC-Variable)\.ttf$/.test(url.pathname);
  const file = font ? path.join(root, 'dist', url.pathname) : Object.hasOwn(routes, url.pathname) ? path.join(__dirname, 'public', routes[url.pathname]) : null;
  if (!file) return json(404, {error:'页面不存在。'});
  fs.readFile(file, (error, data) => {
    if (error) return json(404, {error:'找不到页面文件。'});
    res.writeHead(200, {'Content-Type':contentTypes[path.extname(file)],'Cache-Control':'no-cache','X-Content-Type-Options':'nosniff','Content-Security-Policy':"default-src 'self'; script-src 'self'; style-src 'self'; font-src 'self'; connect-src 'self'; frame-ancestors 'none'"});
    res.end(req.method === 'HEAD' ? undefined : data);
  });
});
server.on('error', error => {console.error(error.code === 'EADDRINUSE' ? '工作台端口被占用，请检查 4180 端口。' : error.message); process.exitCode = 1;});
server.listen(port, '127.0.0.1', () => console.log(`Owan Workspace: http://127.0.0.1:${port}`));
