const {ipcRenderer,Notification} = require('electron')
const ipc = ipcRenderer
var req_url = "https://synitx.glitch.me/api/wars/status"
const path = require('path')

const close = document.getElementById('close')
const box = document.getElementById('box')
const update = document.getElementById('update')
const moment = require('moment');

var data = []
var war = {"isGoing":false,"messageId":"0","hostedBy":"0","participants":[]}

close.addEventListener('click',()=>{
    ipc.send('appclose')
})

ipcRenderer.on('update_available', ()=>{
    ipcRenderer.removeAllListeners('update_available');
    update.style.display = "block"
    update.innerText = "An update is downloading..."
})

ipcRenderer.on('update_downloaded', () => {
    ipcRenderer.removeAllListeners('update_downloaded');
    update.innerHTML = 'Update is Downloaded. It will be installed on restart. <span class="res" onclick="restart()">Restart now?</span>';
});

function restart() {
  ipcRenderer.send('restart_app');
}

function setUpLogs(){
    const logs = document.getElementById('logs')
    logs.innerHTML = ""
    if (data.length > 0) {
        data.forEach((item) => {
            const ele = document.createElement('p')
            ele.innerText = `War hosted on ${moment(item.Time).format('MMMM MM YYYY h:mm:ss')}`
            logs.append(ele)
        })
    } else {
        logs.innerHTML = "<p>There is no log</p>"
    }
}

async function requestForApi() {
    setUpLogs()
    var res = await fetch(req_url)
    if (!res) return;
    res = await res.json()
    if (war.isGoing == false && res.isGoing == true) {
        ipc.send('notify')
        ipc.send('enable-icon')
        data.push({Time: (+ new Date())})
        war = res
        box.innerHTML=`
        <h2>War is going on!</h2>
        <h4>${war.participants.length} participated</h4>
        `
    } else if (war.isGoing == false){
        ipc.send('disable-icon')
        box.innerHTML=`
        <h2>Checking for wars...</h2>
        `
    } else {
        war = res
    }
}

setInterval(requestForApi,5000)