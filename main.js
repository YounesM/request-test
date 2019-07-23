const {app, BrowserWindow, ipcMain, dialog} = require('electron');
const https = require('https');
const http = require('http');

function createWindow () {
  let win = new BrowserWindow({
    width: 1000,
    height:600,
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

  //Check if method is correct
  if(!['GET', 'POST', 'PUT', 'DELETE'].includes(args.method)) {
    dialog.showErrorBox('Error','The method "'+ args.method + '" is not supported.');
  }
  let req = call.request(args.url, {method: args.method, headers: args.headers}, res => {
    let data = "";
    res.setEncoding('utf8');
    res.on('data', (chunk) => {
      console.log(`BODY: ${chunk}`);
      data += chunk;
      events.sender.send('response', data);
      events.sender.send('details',
        {
          headers: res.headers,
          code: res.statusCode,
          originUrl: args.url,
          method: res.method
        }
      );
    });
    res.on('end', () => {
      console.log('No more data in response.');
    });
  });
  if(['PUT', 'POST'].includes(args.method)) {
    req.write(args.reqData);
  }
  req.on('error', err => console.log(err.message));
  req.end();
});
