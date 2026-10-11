const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const { EventEmitter } = require('node:events');
const source = fs.readFileSync(`${__dirname}/server.cjs`, 'utf8');

async function run() {
  let mode = 'stopped', launches = 0, handler, launchOptions;
  const context = {
    __dirname, console, URL, AbortSignal, Buffer, process,
    fetch: async () => {
      if (mode === 'stopped') throw Object.assign(new Error('Connection refused'), {cause:{code:'ECONNREFUSED'}});
      return {ok:true, text:async () => mode === 'running' ? 'UWMaster 日迹' : 'Different application'};
    },
    require(name) {
      if (name === 'node:http') return {createServer(fn) {handler = fn; return {on(){},listen(){}};}};
      if (name === 'node:fs') return {...fs, existsSync:() => true, mkdirSync(){},openSync:() => 1,closeSync(){}};
      if (name === 'node:timers/promises') return {setTimeout:async () => {}};
      if (name === 'node:child_process') return {spawn(command, args, options) {
        launches++; launchOptions = {command,args,options}; mode = 'running';
        return Object.assign(new EventEmitter(), {unref(){}});
      }};
      return require(name);
    }
  };
  const api = vm.runInNewContext(`${source}\n({state,start,apps,token});`, context);
  assert.equal(await api.state(api.apps.uw), 'stopped');
  await api.start(api.apps.uw);
  assert.equal(launches, 1);
  assert.equal(launchOptions.command, api.apps.uw.command);
  assert.equal(launchOptions.options.cwd, api.apps.uw.directory);
  assert.equal(launchOptions.options.windowsHide, true);
  await api.start(api.apps.uw);
  assert.equal(launches, 1, 'Running applications must be reused');
  mode = 'conflict';
  await assert.rejects(() => api.start(api.apps.uw), /端口/);
  assert.equal(launches, 1, 'Conflicting applications must not be replaced');

  async function request(url, method='POST', extra={}) {
    let status, body;
    await handler({url,method,headers:{host:'127.0.0.1:4180','x-hub-token':api.token,origin:'http://127.0.0.1:4180',...extra}}, {
      writeHead(value){status=value;}, end(value){body=value;}
    });
    return {status,body:JSON.parse(body)};
  }
  assert.equal((await request('/api/launch/uw','GET')).status,405);
  assert.equal((await request('/api/launch/uw','POST',{'x-hub-token':'wrong'})).status,403);
  assert.equal((await request('/api/launch/uw','POST',{origin:'https://other.example'})).status,403);
  assert.equal((await request('/api/status','GET',{host:'other.example:4180'})).status,403);
  assert.equal((await request('/api/launch/unknown')).status,404);
  assert.equal((await request('/apps.json','GET')).status,404);
  mode = 'stopped';
  const results = await Promise.all([request('/api/launch/finance'),request('/api/launch/finance')]);
  assert.ok(results.every(result => result.status === 200 && result.body.url === 'http://localhost:4173/'));
  assert.equal(launches,2,'Concurrent clicks must launch only one process');
  console.log('Hub checks passed: startup, reuse, concurrent clicks, conflicts, access restrictions.');
}
run().catch(error => {console.error(error); process.exitCode=1;});
