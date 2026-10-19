// Small local server for the computer (web and desktop versions only).
// 1) Browsers do not let a web page read other websites (CORS), so the web version
//    asks this server to download the RSS feeds:  /?url=<feed link>
// 2) It also serves the built app from the dist folder (desktop version).
// On the phone none of this is needed: the app reads the feeds directly.
//
//   node proxy.js              -> server only
//   node proxy.js --with-expo  -> server + Expo web (npm run web)

const http = require('http');
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const PORT = 8092;
const DIST = path.join(__dirname, 'dist');

// Only the sites listed in src/config.js are allowed.
const config = fs.readFileSync(path.join(__dirname, 'src', 'config.js'), 'utf8');
const allowedHosts = new Set([...config.matchAll(/url:\s*'([^']+)'/g)].map((m) => new URL(m[1]).host));

const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.ico': 'image/x-icon',
  '.ttf': 'font/ttf',
  '.svg': 'image/svg+xml',
};

async function proxyFeed(target, res) {
  if (!allowedHosts.has(new URL(target).host)) {
    res.writeHead(403);
    return res.end('Not an allowed feed');
  }
  const r = await fetch(target, { headers: { 'User-Agent': 'Mozilla/5.0 (Akhbar24 RSS reader)' } });
  res.writeHead(r.status, { 'Content-Type': r.headers.get('content-type') || 'application/xml' });
  res.end(Buffer.from(await r.arrayBuffer()));
}

function serveApp(pathname, res) {
  let file = path.normalize(path.join(DIST, decodeURIComponent(pathname)));
  if (!file.startsWith(DIST)) {
    res.writeHead(403);
    return res.end();
  }
  if (!fs.existsSync(file) || fs.statSync(file).isDirectory()) file = path.join(DIST, 'index.html');
  if (!fs.existsSync(file)) {
    res.writeHead(404);
    return res.end('App not built yet. Run: npm.cmd run desktop:build');
  }
  res.writeHead(200, { 'Content-Type': TYPES[path.extname(file)] || 'application/octet-stream' });
  fs.createReadStream(file).pipe(res);
}

const server = http.createServer(async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  try {
    const url = new URL(req.url, 'http://localhost');
    const target = url.searchParams.get('url');
    if (target) return await proxyFeed(target, res);
    serveApp(url.pathname, res);
  } catch (e) {
    res.writeHead(502);
    res.end(String(e.message || e));
  }
});

server.listen(PORT, '127.0.0.1', () => console.log(`Akhbar 24 server ready on http://localhost:${PORT}`));
module.exports = server;

if (process.argv.includes('--with-expo')) {
  const portArg = process.argv.indexOf('--port');
  const args = ['expo', 'start', '--web'];
  if (portArg > -1) args.push('--port', process.argv[portArg + 1]);
  spawn(process.platform === 'win32' ? 'npx.cmd' : 'npx', args, { stdio: 'inherit', shell: true });
}
