const http = require('https');
// const fs = require("fs");
const {Download} = require("./lib/ionLibNode");
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
      link.innerHTML = "Click here to update";
      var n = new Notif("New Update Available", [link]);
      link.onclick = function() {
        // fetch("https://api.github.com/repos/LucasionGS/ToxenInstall/releases/latest")
        // .then(response => {
        //   return response.json();
        // })
        // .then(data => {
        //   var installerUrl = data.assets[0].browser_download_url;
        // });
        url = "https://raw.githubusercontent.com/LucasionGS/ToxenInstall/master/ToxenInstall/bin/Debug/ToxenInstall.exe";
        DownloadUpdate(url, n);
      }
    }
  })
  .catch(err => {
    new Notif("Check Update failed", err);
  });
}

async function DownloadUpdate(url, object) {
  var DL = new Download(url, "./ToxenInstall.exe");
  DL.OnClose = function() {
    setTimeout(() => {
      // proc.spawn('cmd.exe start \"\" ToxenInstall.exe', ["/c"], {detacted:true, stdio: 'ignore'});
      // proc.spawn('cmd.exe', [], {detacted:true, stdio: 'ignore'});
      proc.spawn('cmd', ["/C", "start cmd.exe /c ToxenInstall.exe"], {
        // cwd: this.parentNode.instance.path,
        // detached: true,
        // stdio: 'ignore'
      });
    }, 1);
  }
  DL.OnData = function(data) {
    object.descriptionObject.innerHTML = DL.DownloadPercent()+"%";
    // console.log(object);
  }
  DL.Start();
}

function ParseGitRedirect(res) {
  return res.match(/<a href="(.*)">.*<\/a>/)[1];
}

// //Global Context Menu
// var musicMenu = document.createElement("div");
// musicMenu.setAttribute("id", "contextMenu");
// musicMenu.setAttribute("class", "contextMenu");
// //Create Music Menu List
// var musicMenuList = {
//   "Rename": "rename",
//   "Delete": "delete",
// };
// var i = 0;
// for (var key in musicMenuList) {
//   var item = document.createElement("div");
//   item.setAttribute("id", "contextMenuItem-"+i);
//   item.setAttribute("class", "contextMenuItem");
//   item.setAttribute("onclick", "menuFunction(\""+musicMenuList[key]+"\");");
//   var itemP = document.createElement("p");
//   itemP.innerHTML = key;
//   item.appendChild(itemP);
//   musicMenu.appendChild(item);
//   i++;
// }

function scrollToSong(id)
{
  var musicObject = document.getElementById("music-"+id);
  musicObject.scrollIntoViewIfNeeded();
}
