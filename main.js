const {app, BrowserWindow, ipcMain, dialog} = require('electron');
const https = require('https');
const http = require('http');
const fs = require('fs');

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

if (!fs.existsSync('logs')){
    fs.mkdirSync('logs');
}

ipcMain.on('close', () => {app.quit()});
ipcMain.on('send', (events, args) => {
  let call = new RegExp('^https:\/\/').test(args.url) ? https : http;
  let savedData = '[' + new Date().toLocaleDateString() + ' ' + new Date().toLocaleTimeString() + '] REQUEST SENT:\n\r';
  savedData += args.rawRequest + '\n\r';
  //Check if method is correct
  if(!['GET', 'POST', 'PUT', 'DELETE'].includes(args.method)) {
    dialog.showErrorBox('Error','The method "'+ args.method + '" is not supported.');
  } else {
    let req = call.request(args.url, {method: args.method, headers: args.headers}, res => {
      let data = "";
      res.setEncoding('utf8');
      savedData += '[' + new Date().toLocaleDateString() + ' ' + new Date().toLocaleTimeString() + '] SERVER RESPONSE:\n\r';
      res.on('data', (chunk) => {
        console.log(`BODY: ${chunk}`);
        data += chunk;
        res.url = args.url;
        res.method = args.method;
        savedData += data;
        events.sender.send('response', data);
        events.sender.send('details', res);
      });
      res.on('end', () => {
        console.log('No more data in response.');
        savedData += '\n';
        fs.writeFile('logs/requests_' + new Date().toLocaleDateString().replace(/\//gmi,'') +'.log', savedData,{flag: 'a'}, err => {
          if (err) throw err;
          console.log("Request saved");
        });
      });
    });
    if(['PUT', 'POST'].includes(args.method)) {
      req.write(args.reqData);
    }
    req.on('error', err => console.log(err.message));
    req.end();
  }
});
