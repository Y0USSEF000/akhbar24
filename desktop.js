// Opens Akhbar 24 as a desktop app window on Windows.
// Starts the local server (proxy.js), then opens Edge (or Chrome) in "app mode":
// its own window with no address bar or tabs. Closing the window stops the server.

const fs = require('fs');
const http = require('http');
const path = require('path');
const { spawn } = require('child_process');

const APP_URL = 'http://localhost:8092/';
const PROFILE = path.join(__dirname, '.desktop-profile'); // keeps the saved news between launches

const BROWSERS = [
  'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
  'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  path.join(process.env.LOCALAPPDATA || '', 'Google\\Chrome\\Application\\chrome.exe'),
];

function serverIsRunning() {
  return new Promise((resolve) => {
    http.get(APP_URL, (res) => { res.resume(); resolve(true); }).on('error', () => resolve(false));
  });
}

(async () => {
  if (!(await serverIsRunning())) require('./proxy.js');

  const browser = BROWSERS.find((b) => fs.existsSync(b));
  if (!browser) {
    spawn('cmd', ['/c', 'start', '', APP_URL], { detached: true, stdio: 'ignore' });
    return;
  }

  const win = spawn(browser, [
    `--app=${APP_URL}`,
    `--user-data-dir=${PROFILE}`,
    '--window-size=480,900',
    '--no-first-run',
    '--no-default-browser-check',
  ], { stdio: 'ignore' });

  win.on('exit', () => process.exit(0));
})();
