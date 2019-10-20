const http = require('https');
var proc = require('child_process');
console.log(process.env);
var defaultMusicDir = process.env.HOMEDRIVE+process.env.HOMEPATH+"/Music/";
defaultMusicDir = defaultMusicDir.replace(/(\\+)/g, "/");
/*while (defaultMusicDir.includes("\\")) {
  defaultMusicDir = defaultMusicDir.replace("\\","/");
  console.log("removed \\ from "+ defaultMusicDir);
}*/

//Default check for update on startup
setTimeout(function () {
  //checkUpdate();
}, 0);

//Check for updates
function checkUpdate()
{
  const curVers = JSON.parse(fs.readFileSync("./resources/app/package.json", "utf8")).version;
  fetch("https://api.github.com/repos/LucasionGS/Toxen/releases/latest")
  .then(response => {
    return response.json();
  })
  .then(data => {
    const newVers = data.tag_name;
    const dlUrl = data.assets[0].browser_download_url;
    //console.log(curVers);
    //console.log(newVers);
    //console.log(dlUrl);
    if (curVers != newVers) {
      new Notif("New Update Available", "<a href=\""+dlUrl+"\">Click here to download</a>\nOr <a onclick=\"proc.spawn('cmd.exe start \"\" ToxenInstall.exe', [], {detacted:true, stdio: 'ignore'});\" href=\"#\">Open the installer</a> to update automatically.");
    }
  })
  .catch(err => {
    new Notif("Check Update failed", err);
  });
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

function musicMenuFunc(e) {
  if (e) {
    try { menu.parentNode.removeChild(menu); } catch (e){}
    document.getElementsByTagName("body")[0].appendChild(musicMenu);
    console.log(musicMenu);
    musicMenu.style.left = mousePos.X+"px";
    musicMenu.style.top = mousePos.Y+"px";
    musicMenu.setAttribute("onmouseout", "this.parentNode.removeChild(this);");
  }
  return false;
}

function menuFunction()
{
  //Close menu
  try { menu.parentNode.removeChild(menu); } catch (e){}
  //Do action here
}

function scrollToSong(id)
{
  var musicObject = document.getElementById("music-"+id);
  musicObject.scrollIntoView();
}
