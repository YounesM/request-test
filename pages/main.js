const {ipcRenderer} = require('electron');

const sendBtn = document.querySelector('#send-rqst');
const addBody = document.querySelector('#add-body');
const closeBtn = document.querySelector('.small-red');
const minimizeBtn = document.querySelector('.small-yellow');
const maximizeBtn = document.querySelector('.small-green');
const responseArea = document.querySelector('textarea[name=responseBody]');
const detailsArea = document.querySelector('textarea[name=responseDetails]');

let maxi = false;

sendBtn.addEventListener('click', () => {
  const data = document.querySelector('textarea[name=rawRequest]').value;
  const post = document.querySelector('textarea[name=rawBody]').value;
  let req = {};
  req.method = data.split(' ')[0];
  req.url = data.split(' ')[1];
  req.headers = {};
  if(post) {
    req.reqData = post;
  }
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
  });
  ipcRenderer.on('details', (events, args) => {
    detailsArea.value = JSON.stringify(args);
  });
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
