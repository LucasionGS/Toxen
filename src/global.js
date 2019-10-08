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
      notification("New Update Available", "<a href=\""+dlUrl+"\">Click here to download</a>\nOr <a onclick=\"proc.spawn('cmd.exe start \"\" ToxenInstall.exe', [], {detacted:true, stdio: 'ignore'});\" href=\"#\">Open the installer</a> to update automatically.");
    }
  })
  .catch(err => {
    notification("Check Update failed", err);
  });
}

function Make(tag){
  return document.createElement(tag);
}

//Global close top notification function
function closeNotification()
{
  id = document.getElementsByClassName("_notification").length-1;
  document.getElementsByClassName("_notification")[id].setAttribute("action", "close");
  setTimeout(function () {
    document.getElementsByClassName("_notification")[id]
    .parentNode.removeChild(
      document.getElementsByClassName("_notification")[id]
    );
  }, 300);
}

//Global close notification by ID function
function closeNotificationById(id)
{
  if (!id) {
    id = document.getElementsByClassName("_notification").length-1;
  }
  document.getElementsByClassName("_notification")[id].setAttribute("action", "close");
  setTimeout(function () {
    document.getElementsByClassName("_notification")[id]
    .parentNode.removeChild(
      document.getElementsByClassName("_notification")[id]
    );
  }, 300);
}

//Global close notification by specific Object function
function closeNotificationByObject(object)
{
  object.setAttribute("action", "close");
  setTimeout(function () {
    object.parentNode.removeChild(object);
  }, 300);
}

//Global Notification function
function notification(title, message, dieAfter)
{
  //Variable check
  if (!message) {
    message = "";
  }

  //Object creation
  var mainDiv = Make("div");
  var h1 = Make("h1");
  var p = Make("p");
  var button = Make("a");
  var button_div = Make("div");
  var button_div_p = Make("p");
  //Settings
  mainDiv.setAttribute("class","_notification");
  h1.innerHTML = title;
  p.innerHTML = message;
  p.setAttribute("class", "notifText");
  button.href = "#back";
  button.setAttribute("onclick", 'closeNotification();');
  button_div.setAttribute("class", "Button");
  button_div.setAttribute("id", "doneButton");
  button_div_p.innerHTML = "Done";

  //Merging
  mainDiv.appendChild(h1);
  mainDiv.appendChild(p);
  if (!dieAfter) {
    button_div.appendChild(button_div_p);
    button.appendChild(button_div);
    mainDiv.appendChild(button);
  }

  //Finalizing
  document.getElementsByTagName("body")[0].appendChild(mainDiv);
  setTimeout(function () {
    mainDiv.setAttribute("action", "open");
  }, 0);
  if (dieAfter > 0) {
    setTimeout(function () {
      closeNotificationByObject(mainDiv);
    }, dieAfter);
  }
  return mainDiv;
}

//Global Context Menu
var musicMenu = Make("div");
musicMenu.setAttribute("id", "contextMenu");
musicMenu.setAttribute("class", "contextMenu");
//Create Music Menu List
var musicMenuList = {
  "Rename": "rename",
  "Delete": "delete",
};
var i = 0;
for (var key in musicMenuList) {
  var item = Make("div");
  item.setAttribute("id", "contextMenuItem-"+i);
  item.setAttribute("class", "contextMenuItem");
  item.setAttribute("onclick", "menuFunction(\""+musicMenuList[key]+"\");");
  var itemP = Make("p");
  itemP.innerHTML = key;
  item.appendChild(itemP);
  musicMenu.appendChild(item);
  i++;
}

function musicMenuFunc(e) {
  e.preventDefault();
  try { menu.parentNode.removeChild(menu); } catch (e){}
  document.getElementsByTagName("body")[0].appendChild(musicMenu);
  console.log(musicMenu);
  musicMenu.style.left = mousePos.X+"px";
  musicMenu.style.top = mousePos.Y+"px";
  musicMenu.setAttribute("onmouseout", "this.parentNode.removeChild(this);");
  return false;
}

function menuFunction()
{
  //Close menu
  try { menu.parentNode.removeChild(menu); } catch (e){}
  //Do action here
}
