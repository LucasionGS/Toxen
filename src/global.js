const http = require('https');
// const fs = require("fs");
const Download = require("../lib/ionLibNode.js");
var proc = require('child_process');
var defaultMusicDir = process.env.HOMEDRIVE+process.env.HOMEPATH+"/Music/";
defaultMusicDir = defaultMusicDir.replace(/(\\+)/g, "/");

//Default check for update on startup
setTimeout(function () {
  checkUpdate();
}, 0);

//Check for updates
function checkUpdate()
{
  var packageFile = "./resources/app/package.json";
  if (!fs.existsSync(packageFile)) {
    // new Notif("Updating disabled for developer");
    return;
  }
  const curVers = JSON.parse(fs.readFileSync(packageFile, "utf8")).version;
  fetch("https://api.github.com/repos/LucasionGS/Toxen/releases/latest")
  .then(response => {
    return response.json();
  })
  .then(data => {
    const newVers = data.tag_name;
    const dlUrl = data.assets[0].browser_download_url;



    if (curVers != newVers) {
      var link = document.createElement("a");
      link.innerHTML = "Click here to download update";
      link.onclick = function() {
        fetch("https://api.github.com/repos/LucasionGS/ToxenInstall/releases/latest")
        .then(response => {
          return response.json();
        })
        .then(data => {
          const installerUrl = data.assets[0].browser_download_url;
          DownloadUpdate(installerUrl);
        });
      }
      new Notif("New Update Available", "<a href=\"DownloadUpdate('"+dlUrl+"')\">Click here to download</a>");
    }
  })
  .catch(err => {
    new Notif("Check Update failed", err);
  });
}

function DownloadUpdate(url) {
  var DL = new Download(installerUrl, "./ToxenInstall.exe");
  DL.OnEnd = function() {
    proc.spawn('cmd.exe start "" ToxenInstall.exe', [], {detacted:true, stdio: 'ignore'});
  }
}

//Global Context Menu
var musicMenu = document.createElement("div");
musicMenu.setAttribute("id", "contextMenu");
musicMenu.setAttribute("class", "contextMenu");
//Create Music Menu List
var musicMenuList = {
  "Rename": "rename",
  "Delete": "delete",
};
var i = 0;
for (var key in musicMenuList) {
  var item = document.createElement("div");
  item.setAttribute("id", "contextMenuItem-"+i);
  item.setAttribute("class", "contextMenuItem");
  item.setAttribute("onclick", "menuFunction(\""+musicMenuList[key]+"\");");
  var itemP = document.createElement("p");
  itemP.innerHTML = key;
  item.appendChild(itemP);
  musicMenu.appendChild(item);
  i++;
}

function scrollToSong(id)
{
  var musicObject = document.getElementById("music-"+id);
  musicObject.scrollIntoViewIfNeeded();
}
