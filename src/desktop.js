const fs = require("fs");
const ytdl = require("ytdl-core");
const https = require('https');
var otherWindow;
var settings;
var preMusicDirectory = null;
setInterval(() => {
  try {
    settings = JSON.parse(fs.readFileSync("./settings.json", "utf8"));
    if (settings.musicDir == "") {
      settings.musicDir = "/ToxenMusic/";
    }
  } catch (e) {
    settings = {
      //Add default settings if no file.
      "musicDir":"/ToxenMusic/",
      "visualizer":true,
      "backgroundDim":50,
      "visualizerIntensity":15,
    }
  }
  if (preMusicDirectory != settings.musicDir) {
    LoadMusic();
    notification("Updated Music Folder", "", 2000);
  }
}, 250);
var allMusicData = [];
var pathDir;

//Loading music and other startup events
window.onload = function(){
  LoadMusic();
  //Create drop area
  var dropHereNotif;
  let dropArea = document.getElementsByTagName("html")[0];
  dropArea.addEventListener('drop', fileDropped, false);

  dropArea.addEventListener('dragenter', function(event){
    //dropHereNotif = notification("Drop a file","mp3 files for music\njpg & png for backgrounds");
  }, false);

  dropArea.addEventListener('dragleave', function() {
    closeNotificationByObject(dropHereNotif);
  }, false);

  dropArea.addEventListener('dragover', function(event){
    event.stopPropagation();
    event.preventDefault();
  }, false);
}

//Loads all music in a folder
function LoadMusic(){
  songCount = 0;
  try {
    settings = JSON.parse(fs.readFileSync("./settings.json", "utf8"));
  } catch (e) {
    settings = {
      //Add default settings if no file.
      "musicDir":false,
      "visualizer":true,
      "backgroundDim":50,
      "visualizerIntensity":15,
    };
  }
  //Remove all previous songs (if any)
  var e = document.getElementById("music-list");
  var _preMusic = e.lastElementChild;
  while (_preMusic) {
    e.removeChild(_preMusic);
    _preMusic = e.lastElementChild;
  }

  var musicFiles = [];
  otherWindow = document.getElementById("otherWindow");
  var _musicFiles;
  if (settings.musicDir != undefined && settings.musicDir != "") {
    fs.mkdirSync(settings.musicDir, {recursive: true});
    preMusicDirectory = settings.musicDir;
    pathDir = settings.musicDir.replace("\\", "/")+"/";
  }
  else {
    fs.mkdirSync("/ToxenMusic/", {recursive: true});
    pathDir = "/ToxenMusic/";
    preMusicDirectory = pathDir;
  }
  _musicFiles = fs.readdirSync(pathDir);

  var newMp3Count = 0;
  for (var i = 0; i < _musicFiles.length; i++) {
    if (_musicFiles[i].endsWith(".mp3")) {
      musicFiles[musicFiles.length] = _musicFiles[i].substring(0, _musicFiles[i].length-4);

      //Creating JSON as string
      var _title = _musicFiles[i].substring(0, _musicFiles[i].length-4);
      var artist;
      var title;
      var file;
      var parts = _title.split(" - ", 2);
      if (parts.length > 1) {
        artist = parts[0];
        title = parts[1];
        file = pathDir+"/"+_title+".mp3";
      }
      else {
        artist = "Unknown";
        title = parts[0];
        file = pathDir+"/"+_title+".mp3";
      }
      musicFiles[newMp3Count] = {
        "artist":artist,
        "title":title,
        "file":file
      };
      newMp3Count++;
    }
  }

  //Inserting music

  //musicFiles = JSON.parse(musicJson);
  //console.log(musicFiles);
  if (musicFiles.length > 0) {
    for (var i = 0; i < musicFiles.length; i++) {
      var newItem = document.createElement("div");
      newItem.setAttribute("class", "music-item");
      newItem.setAttribute("id","music-"+ i);
      newItem.setAttribute("onclick", "playSong("+ i +");");
      var newItemP = document.createElement("p");
      newItemP.innerHTML = musicFiles[i].artist + " - " + musicFiles[i].title;
      newItem.appendChild(newItemP);
      document.getElementById("music-list").appendChild(newItem);
      songs[i] = musicFiles[i].file;
      songCount++;
    }
    //console.log(musicFiles);
  }
  else {
    var newItem = document.createElement("div");
    newItem.setAttribute("class", "music-item");
    newItem.setAttribute("id", "deleteOnNewLoad");
    var newItemP = document.createElement("p");
    newItemP.innerHTML = "No music was found.<br>Drag and drop mp3 files in here<br>or change your music folder in settings!";
    newItem.appendChild(newItemP);
    document.getElementById("music-list").appendChild(newItem);
    console.log("No music found!");
  }
  allMusicData = musicFiles;
}

//Test for illegal chars
function isValid(str){
  var orgStr = str;
  let reg = /[\\\/\:\*\?\"\<\>\|]/g;
  if (reg.test(str)) {
    str = str.replace(reg, "");
    notification("Invalid Characters Detected", "Changed \""+orgStr+"\"\nto \""+str+"\"");
  }
  return str;
}

//Adding music via YouTube Video
async function addMusic()
{
  var audioInfo;

  var url = document.getElementById("addUrl").value;
  if (ytdl.validateURL(url)) {}
  else {
    return notification("Invalid URL", "\""+url+"\" is not a valid URL");
  }
  var name = document.getElementById("addName").value/*.replace("&", "and")*/;
  var button = document.getElementById("addButton");
  var dlImg = document.getElementById("dlImg").checked;
  button.innerHTML = "Downloading... Please wait";
  button.disabled = true;
  var ytInfo

  if (name == "") {
    ytInfo = ytdl.getBasicInfo(url);
    ytInfo = await ytInfo;
    name = ytInfo.title;
  }

  name = isValid(name);
  var stream = ytdl(url);
  //const mp4 = pathDir+name+'.mp4'; //Add this IF i add video
  const mp3 = pathDir+name+'.mp3';
  const jpg = pathDir+name+".jpg";
  if (dlImg) {
    const request = https.get("https://i.ytimg.com/vi/"+ytdl.getURLVideoID(url)+"/maxresdefault.jpg", function(response) {
    response.pipe(fs.createWriteStream(jpg));
    });
  }
  // https://i.ytimg.com/vi/WROcJK3ZHGc/maxresdefault.jpg
  var proc = new ffmpeg({source:stream});
  var ffmpegPath;
  if (fs.existsSync('./resources/app/src/ffmpeg.exe')) {
    ffmpegPath = './resources/app/src/ffmpeg.exe';
  }
  else {
    ffmpegPath = './src/ffmpeg.exe';
  }

  notification("Downloading... Please wait", name, 1000);
  proc.setFfmpegPath(ffmpegPath);
  /*var savedFile = proc.saveToFile(mp3);

  savedFile = await savedFile;
  console.log(savedFile);*/
  try {

  } catch (e) {

  }
  proc.saveToFile(mp3, (stdout, stderr) => {
    if (stderr) {
      return console.log(stderr);
      document.getElementById("addUrl").value = "";
      document.getElementById("addName").value = "";
      document.getElementById("addButton").disabled = false;
      document.getElementById("addButton").innerHTML = "Add Music";
    }
    console.log(stdout);
    //Add file to music browser
    return console.log('Download complete!');
  })
  .on('end', function(err) {
    var _title = name;
    var artist;
    var title;
    var file;
    var parts = _title.split(" - ", 2);
    if (parts.length > 1) {
      artist = parts[0];
      title = parts[1];
      file = pathDir+_title+".mp3";
    }
    else {
      artist = "Unknown";
      title = parts[0];
      file = pathDir+_title+".mp3";
    }

    var newItem = document.createElement("div");
    newItem.setAttribute("class", "music-item");
    newItem.setAttribute("id","music-"+ songCount);
    newItem.setAttribute("onclick", "playSong("+ songCount +");");
    var newItemP = document.createElement("p");
    newItemP.innerHTML = artist + " - " + title;
    newItem.appendChild(newItemP);
    //console.log(newItem);
    document.getElementById("music-list").appendChild(newItem);
    songs[songCount] = file;
    songCount++;

    notification("Download Finished", name, 1000);
    _finished();
    function _finished() {
      document.getElementById("addUrl").value = "";
      document.getElementById("addName").value = "";
      document.getElementById("addButton").disabled = false;
      document.getElementById("addButton").innerHTML = "Add Music";
    }
    document.getElementById("deleteOnNewLoad").parentNode.removeChild(document.getElementById("deleteOnNewLoad"));
  });

  // Get ID:
  // ytdl.getURLVideoID(url)
  // Video Image URL
  // http://i3.ytimg.com/vi/ ID /maxresdefault.jpg
}

//Insert picture drop-in areas
var bgChanged = {};
function fileDropped(e)
{
  e.stopPropagation();
  e.preventDefault();
  let dt = e.dataTransfer;
  let files = dt.files;
  //alert("You dropped in a file!");
  var file = files[0];
  function isExt(ext) {
    return file.path.toLowerCase().endsWith(ext);
  }
  //console.log(file);
  if (isExt(".jpg") || isExt(".png")) {
    var curId = document.getElementById("now-playing").getAttribute("playingid");
    var fileName = songs[curId].split("/")[songs[curId].split("/").length-1];
    fileName = fileName.substring(0,fileName.length-4);
    fs.copyFileSync(file.path, pathDir+fileName+".jpg");
    setBG({"file":songs[curId]});
  }
  else if (isExt(".mp3")) {
    //console.log(file);
    fs.copyFileSync(file.path, pathDir+file.name);
    //Adding the file, i swear make a fucking function >_>
    {
      var _title = file.name.substring(0,file.name.length-4);
      var artist;
      var title;
      var filePath;
      var parts = _title.split(" - ", 2);
      if (parts.length > 1) {
        artist = parts[0];
        title = parts[1];
        filePath = pathDir+_title+".mp3";
      }
      else {
        artist = "Unknown";
        title = parts[0];
        filePath = pathDir+_title+".mp3";
      }

      var newItem = document.createElement("div");
      newItem.setAttribute("class", "music-item");
      newItem.setAttribute("id","music-"+ songCount);
      newItem.setAttribute("onclick", "playSong("+ songCount +");");
      var newItemP = document.createElement("p");
      newItemP.innerHTML = artist + " - " + title;
      newItem.appendChild(newItemP);
      //console.log(newItem);
      document.getElementById("music-list").appendChild(newItem);
      songs[songCount] = filePath;
      songCount++;
    }
    notification("Your song has been added", "", 1000);
    try {
      document.getElementById("deleteOnNewLoad").parentNode.removeChild(document.getElementById("deleteOnNewLoad"));
    } catch (e) {}
  }
  else {
    notification("Invalid file", "You can only drop in .mp3 and .jpg files!");
  }
}

var lastWindow;
function openSettings()
{
  try {
    lastWindow.close();
  } catch (e) {

  }
  lastWindow = window.open("settings.html");
}
