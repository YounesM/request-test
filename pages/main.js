const {ipcRenderer} = require('electron');

const sendBtn = document.querySelector('#send_rqst');
const closeBtn = document.querySelector('.small-red');
const minimizeBtn = document.querySelector('.small-yellow');
const maximizeBtn = document.querySelector('.small-green');
const responseArea = document.querySelector('textarea[name=responseBody]');

let maxi = false;

sendBtn.addEventListener('click', () => {
  const data = document.querySelector('textarea:first-child').value;
  let req = {};
  req.method = data.split(' ')[0];
  req.url = data.split(' ')[1];
  req.headers = {};
  data.split('\n').forEach((elm, i) => {
    if(i>0) {
      let header = {};
      req.headers[elm.split(':')[0]] = elm.split(':')[1].replace(' ', '');
    }
  })
  if(data){
    ipcRenderer.send('send', req);
  }
  ipcRenderer.on('response', (events, args) => {
    responseArea.value = args;
  })
});
closeBtn.addEventListener('click', () => {
  ipcRenderer.send('close');
});
minimizeBtn.addEventListener('click', () => {
  ipcRenderer.send('minimize');
});
maximizeBtn.addEventListener('click', () => {
  if(!maxi) {
    ipcRenderer.send('maximize');
    maxi = true;
  }  else {
    ipcRenderer.send('unmaximize');
    maxi = false;
  }
});
