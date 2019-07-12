const {app, BrowserWindow, ipcMain} = require('electron');
const https = require('https');
const http = require('http');

function createWindow () {
  let win = new BrowserWindow({
    width: 1000,
    frame: false,
    backgroundColor: "#4a4a4a",
    webPreferences: {
      nodeIntegration: true
    }
  });
  win.loadFile('pages/main.html');
  ipcMain.on('minimize', () => {win.minimize()});
  ipcMain.on('maximize', () => {win.maximize()});
  ipcMain.on('unmaximize', () => {win.unmaximize()});
}

app.on('ready', createWindow);

ipcMain.on('close', () => {app.quit()});
ipcMain.on('send', (events, args) => {
  let call = new RegExp('^https:\/\/').test(args.url) ? https : http;
  call.get(args.url, {headers: args.headers}, res => {
    console.log('pk')
    res.setEncoding('utf8');
    res.on('data', (chunk) => {
      console.log(`BODY: ${chunk}`);
      events.sender.send('response', chunk);
    });
    res.on('end', () => {
      console.log('No more data in response.');
    });
  }).on('error', err => console.log(err.message));
});
