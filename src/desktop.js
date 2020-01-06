const fs = require("fs");
const ytdl = require("ytdl-core");
const https = require('https');
const {ContextMenu} = require("ionlib");
/**
 * @type {{string: string | number}}
 */
var settings;
var preMusicDirectory = null;
var allMusicData = [];
/**
 * @type {string}
 */
var pathDir;

var musicItemCm = new ContextMenu([
  {
    "name": "Song actions"
  },
  {
    "name": "Play song",
    "click": (ev, ref) => {
      ref.onclick();
    }
  },
  {
    "name": "Rename song",
    "click": function(ev, ref) {
      renameSong(ref, ev);
    }
  }
]);

musicItemCm.menu.onmouseover = function() {
  onMenuHover();
}

/**
 * Reloads the current settings.
 */
function reloadSettings(){
  try {
    settings = JSON.parse(fs.readFileSync("./settings.json", "utf8"));
    if (settings.musicDir == "") {
      settings.musicDir = defaultMusicDir;
    }
    if (settings.musicDir === false) {
      settings.musicDir = defaultMusicDir;
    }
  } catch (e) {
    settings = {
      //Add default settings if no file.
      "musicDir": defaultMusicDir,
      "visualizer": true,
      "backgroundDim": 50,
      "visualizerIntensity": 15,
    }
  }
  if (preMusicDirectory != settings.musicDir) {
    LoadMusic();
    new Notif("Updated Music Folder", "", 2000);
  }
}

//Loading music and other startup events
window.onload = function(){
  Notif.addStyle({theme:"dark"});

  //Create drop area
  var dropHereNotif;
  let dropArea = document.getElementsByTagName("html")[0];
  dropArea.addEventListener('drop', fileDropped, false);

  dropArea.addEventListener('dragenter', function(event){
    //dropHereNotif = new Notif("Drop a file","mp3 files for music\njpg & png for backgrounds");
  }, false);

  dropArea.addEventListener('dragleave', function() {
    //closeNotificationByObject(dropHereNotif);
  }, false);

  dropArea.addEventListener('dragover', function(event){
    event.stopPropagation();
    event.preventDefault();
  }, false);

  var loadingMusicNotif = new Notif("Loading Music...", "", 10000);
  setTimeout(function () {
    LoadMusic();
    loadingMusicNotif.close();
    toggleFunction("shuffle");
    musicEnd();
  }, 1);
}

var allFoundFiles = []; // Used for deleting after...
//Loads all music in a folder
function LoadMusic(){
  allFoundFiles = [];
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
  if (settings.musicDir !== false && settings.musicDir != undefined && settings.musicDir != "") {
    fs.mkdirSync(settings.musicDir, {recursive: true});
    preMusicDirectory = settings.musicDir;
    pathDir = settings.musicDir.replace(/\\/g, "/")+"/";
  }
  else {
    fs.mkdirSync(defaultMusicDir, {recursive: true});
    pathDir = defaultMusicDir;
    settings.musicDir = defaultMusicDir;
    preMusicDirectory = pathDir;
  }
  _musicFiles = fs.readdirSync(pathDir, {withFileTypes:true});

  var newMp3Count = 0;
  filesDetected = 0;
  filesCopied = 0;
  for (var i = 0; i < _musicFiles.length; i++) {
    var thisMusicDir = settings.musicDir+"/"+_musicFiles[i].name+"/";
    if (
      _musicFiles[i].name.endsWith(".mp3")
      || _musicFiles[i].name.endsWith(".srt")
      || _musicFiles[i].name.endsWith(".jpeg")
      || _musicFiles[i].name.endsWith(".jpg")
      || _musicFiles[i].name.endsWith(".png")
    ) {
      var fileRegExp = /\.mp3$|\.srt$|\.jpeg|\.jpg|\.png/gm;
      var foundFile = thisMusicDir.replace(/\/$/g, "");
      thisMusicDir = settings.musicDir+"/"+_musicFiles[i].name.replace(fileRegExp, "")+"/";
      fs.mkdirSync(thisMusicDir, {recursive: true});
      filesDetected++;
      allFoundFiles.push(foundFile);
      fs.copyFile(foundFile, thisMusicDir+_musicFiles[i].name, function (err) {
        if (err) {
          console.log(err);
          return false;
        }
        filesCopied++;
        fs.unlink(allFoundFiles[filesCopied-1], function (err) {
          if (err) { console.log(err); }
        });
        isFileCopyFinished(filesDetected, filesCopied, allFoundFiles[filesCopied-1]);
      });
    }
    else {
      //musicFiles[musicFiles.length] = _musicFiles[i].name;

      //Creating JSON as string
      var _title = _musicFiles[i].name;
      var folderPath = pathDir+"/"+_title+"/";
      var artist;
      var title;
      var mp3File = pathDir+"/"+_title+"/"+_title+".mp3";
      var srtFile = "";
      var bgFile = "";
      var parts = _title.split(" - ", 2);
      if (!_musicFiles[i].isDirectory()) {
        continue;
      }
      var _songFolderFiles = fs.readdirSync(pathDir+"/"+_title);
      for (var i2 = 0; i2 < _songFolderFiles.length; i2++) {
        if (_songFolderFiles[i2].endsWith(".mp3")) {
          mp3File = pathDir+"/"+_title+"/"+_songFolderFiles[i2];
        }
        else if (_songFolderFiles[i2].endsWith(".srt")) {
          srtFile = pathDir+"/"+_title+"/"+_songFolderFiles[i2];
        }
        else if (
          _songFolderFiles[i2].endsWith(".png")
          || _songFolderFiles[i2].endsWith(".jpeg")
          || _songFolderFiles[i2].endsWith(".jpg")
        ) {
          bgFile = pathDir+"/"+_title+"/"+_songFolderFiles[i2];
        }
      }
      if (parts.length > 1) {
        artist = parts[0];
        title = parts[1];
      }
      else {
        artist = "Unknown";
        title = parts[0];
      }
      musicFiles[newMp3Count] = {
        "folderPath": folderPath,
        "artist": artist,
        "title": title,
        "file": mp3File,
        "srt": srtFile,
        "background": bgFile,
      };
      newMp3Count++;
    }
  }

  //Inserting music
  if (musicFiles.length > 0) {
    for (var i = 0; i < musicFiles.length; i++) {
      var newItem = document.createElement("div");
      newItem.setAttribute("class", "music-item");
      newItem.setAttribute("id","music-"+ i);
      newItem.setAttribute("onclick", "playSong("+ i +");");
      // newItem.setAttribute("oncontextmenu", "renameSong(this, event);");
      musicItemCm.attachContextMenu(newItem);
      var newItemP = document.createElement("p");
      newItemP.innerText = musicFiles[i].artist + " - " + musicFiles[i].title;
      newItem.appendChild(newItemP);
      newItem.title = newItemP.innerText;
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
  searchChange(document.getElementById("searchField").value, document.getElementById("searchField"));
}

var filesDetected = 0;
var filesCopied = 0;
var fileCopyProcessNotif = undefined;
function isFileCopyFinished(filesDetected, filesCopied, curFile) {
  if (fileCopyProcessNotif != undefined) {
    if (filesDetected != filesCopied) {
      document.querySelector("#TEMP_FILECOPYPROCESS").innerHTML = filesCopied+"/"+filesDetected+" files copied<br>"+curFile;
    }
    else {
      document.querySelector("#TEMP_FILECOPYPROCESS").innerHTML = "All files copied!";
      LoadMusic();
      setTimeout(function () {
        fileCopyProcessNotif.titleObject.innerHTML = "Reloaded Music Folder";
        fileCopyProcessNotif.descriptionObject.innerHTML = "";
      }, 1000);
      setTimeout(function () {
        fileCopyProcessNotif.close();
        fileCopyProcessNotif = undefined;
      }, 1500);
    }
  }
  else {
    fileCopyProcessNotif = new Notif(
      "Found files in Music folder",
      "Copying files from folder to a valid location...<br>"+
      "<div id='TEMP_FILECOPYPROCESS'>"+filesCopied+"/"+filesDetected+" files copied<br>"+curFile+"</div>"+
      "<br>Please wait", 1000000
    );
    isFileCopyFinished(filesDetected, filesCopied);
  }
}

//Test for illegal chars
function isValid(str){
  var orgStr = str;
  let reg = /[\\\/\:\*\?\"\<\>\|]/g;
  if (reg.test(str)) {
    str = str.replace(reg, "");
    new Notif("Invalid Characters Detected", "Changed \""+orgStr+"\"\nto \""+str+"\"");
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
    return new Notif("Invalid URL", "\""+url+"\" is not a valid URL");
  }
  var name = document.getElementById("addName").value;
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
  var songFolderPath = pathDir+name+"/";
  fs.mkdirSync(songFolderPath);
  const mp3 = songFolderPath+name+'.mp3';
  const jpg = songFolderPath+name+".jpg";
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

  new Notif("Downloading... Please wait", name, 2000);
  proc.setFfmpegPath(ffmpegPath);

  try {

  } catch (e) {

  }
  proc.saveToFile(mp3, (stdout, stderr) => {
    if (stderr) {
      return console.log(stderr);
    }
    console.log(stdout);
    //Add file to music browser
    document.getElementById("addUrl").value = "";
    document.getElementById("addName").value = "";
    document.getElementById("addButton").disabled = false;
    document.getElementById("addButton").innerHTML = "Add Music";
    return console.log('Download complete!');
  })
  .on('end', function(err) {
    var _title = name;
    var folderPath = songFolderPath;
    var artist;
    var title;
    var file = mp3;
    var bgFile = jpg;
    var srtFile = "";
    var parts = _title.split(" - ", 2);
    if (parts.length > 1) {
      artist = parts[0];
      title = parts[1];
    }
    else {
      artist = "Unknown";
      title = parts[0];
    }

    var newItem = document.createElement("div");
    newItem.setAttribute("class", "music-item");
    newItem.setAttribute("id","music-"+ songCount);
    newItem.setAttribute("onclick", "playSong("+ songCount +");");
    // newItem.setAttribute("oncontextmenu", "renameSong(this, event);");
    musicItemCm.attachContextMenu(newItem);
    var newItemP = document.createElement("p");
    newItemP.innerHTML = artist + " - " + title;
    newItem.appendChild(newItemP);
    //newItem.addEventListener('contextmenu', musicMenuFunc(event), false);
    document.getElementById("music-list").appendChild(newItem);
    songs[songCount] = file;
    allMusicData.push({
      "artist": artist,
      "title": title,
      "file": file,
      "folderPath": folderPath,
      "background": bgFile,
    });
    scrollToSong(songCount);
    songCount++;

    new Notif("Download Finished", name, 1000);
    new Notification("Download Finished");
    _finished();
    function _finished() {
      document.getElementById("addUrl").value = "";
      document.getElementById("addName").value = "";
      document.getElementById("addButton").disabled = false;
      document.getElementById("addButton").innerHTML = "Add Music";
    }
    if (document.getElementById("deleteOnNewLoad")) {
      document.getElementById("deleteOnNewLoad").parentNode.removeChild(document.getElementById("deleteOnNewLoad"));
    }
  });

  // Get ID:
  // ytdl.getURLVideoID(url)
  // Video Image URL
  // http://i3.ytimg.com/vi/ ID /maxresdefault.jpg
}

//Insert picture drop-in areas
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
  //Background files
  if (isExt(".jpg") || isExt(".png")) {
    var curId = document.getElementById("now-playing").getAttribute("playingid");
    //var fileName = allMusicData[curId].split("/")[songs[curId].split("/").length-1];
    // fileName = fileName.substring(0,fileName.length-4);
    fs.copyFileSync(file.path, allMusicData[curId].folderPath+file.name);
    allMusicData[curId].background = allMusicData[curId].folderPath+file.name;
    setBG(allMusicData[curId].background);
  }
  //Subtitle files
  else if (isExt(".srt")) {
    var curId = document.getElementById("now-playing").getAttribute("playingid");
    //var fileName = allMusicData[curId].split("/")[songs[curId].split("/").length-1];
    // fileName = fileName.substring(0,fileName.length-4);
    fs.copyFileSync(file.path, allMusicData[curId].folderPath+file.name);
    allMusicData[curId].srt = allMusicData[curId].folderPath+file.name;
    new Notif("Added Subtitles", "Successfully added subtitles added for \""+allMusicData[curId].title+"\"", 1000);
    RenderSubtitles(allMusicData[curId].srt);
  }
  //Music Files
  else if (isExt(".mp3")) {
    //console.log(file);
    fs.mkdirSync(pathDir+"/"+file.name.substring(0,file.name.length-4), {recursive:true});
    fs.copyFileSync(file.path, pathDir+"/"+file.name.substring(0,file.name.length-4)+"/"+file.name);
    //Adding the file, i swear make a fucking function >_>
    {
      var _title = file.name.substring(0,file.name.length-4);
      var folderPath = pathDir+"/"+file.name.substring(0,file.name.length-4)+"/";
      var artist;
      var title;
      var filePath = folderPath+file.name;
      var parts = _title.split(" - ", 2);
      if (parts.length > 1) {
        artist = parts[0];
        title = parts[1];
      }
      else {
        artist = "Unknown";
        title = parts[0];
      }

      var newItem = document.createElement("div");
      newItem.setAttribute("class", "music-item");
      newItem.setAttribute("id","music-"+ songCount);
      newItem.setAttribute("onclick", "playSong("+ songCount +");");
      // newItem.setAttribute("oncontextmenu", "renameSong(this, event);");
      musicItemCm.attachContextMenu(newItem);
      var newItemP = document.createElement("p");
      newItemP.innerHTML = artist + " - " + title;
      newItem.appendChild(newItemP);
      //console.log(newItem);
      document.getElementById("music-list").appendChild(newItem);
      songs[songCount] = filePath;
      allMusicData.push({
        "artist": artist,
        "title": title,
        "file": filePath,
        "folderPath": folderPath,
      });
      songCount++;
    }
    new Notif("Your song has been added", "", 1000);
    try {
      document.getElementById("deleteOnNewLoad").parentNode.removeChild(document.getElementById("deleteOnNewLoad"));
    } catch (e) {}
  }
  //If none of the above
  else {
    new Notif("Invalid file",
    "Music files: .mp3,\nBackgrounds: .png, .jpg\nSubtitles: .srt");
  }
}

var lastWindow;
function openSettings()
{
  try {
    lastWindow.close();
  } catch (e) {}
  lastWindow = window.open("settings.html");
}

function searchChange(search, object) {
  var _songs = document.getElementsByClassName("music-item");
  for (var i = 0; i < _songs.length; i++) {
    if (!search.startsWith("/")) {
      object.style.color = "black";
      if (_songs[i].childNodes[0].innerHTML.toLowerCase().includes(search.toLowerCase())) {
        _songs[i].style.display = "block";
      }
      else {
        _songs[i].style.display = "none";
      }
    }
    else {
      try {
        object.style.color = "black";
        if (_songs[i].childNodes[0].innerHTML.match(new RegExp(search.substring(1), "i"))) {
          _songs[i].style.display = "block";
        }
        else {
          _songs[i].style.display = "none";
        }
      }
      catch (e) {
        object.style.color = "red";
      }
    }
  }
}

function renameSong(object, e) {
  e.preventDefault()
  var id = object.getAttribute("id").replace("music-", "");
  var info = allMusicData[id];
  const input = document.createElement("input");
  input.value = info.artist +" - "+info.title;
  input.style.width = "80%";
  input.style.textAlign = "center";
  const btn = document.createElement("Button");
  btn.innerHTML = "Rename";
  var n = new Notif("Rename",
  [
    "Renaming \""+info.artist +" - "+info.title+"\" to\n",
    input,
    // btn
  ]);

  btn.onclick = function () {
    renameAction(object, input.value, {input:input});
  }

  n.buttonObject.setText("Rename");
  n.buttonObject.onclick =  function() {
    renameAction(object, input.value, {input:input});
  };

  input.onkeydown = function (ev) {
    if (ev.key == "Enter") {
      ev.preventDefault();
      renameAction(object, input.value, {input:input});
    }
  }
  input.focus();
  input.setSelectionRange(0, input.value.length);
}

function renameAction(object, newName, other) {
  var id = object.getAttribute("id").replace("music-", "");

  fs.access(pathDir+newName, function(err) {
    if (!err) {
      if (other && other.input) {
        console.log(other.input.parentNode.parentNode);
        other.input.parentNode.parentNode.instance.titleObject.innerHTML = "Song already exists";
        other.input.focus();
        other.input.setSelectionRange(0, other.input.value.length);
      }

      return console.log("Song Exists");
    }
    // If no song is named that
    fs.rename(allMusicData[id].folderPath, pathDir+newName, function (err) {
      if (err) { 
        console.error(err);
        var _button = document.createElement("button");
        _button.innerHTML = "Show Technical Error";
        _button.onclick = function() {
          this.parentNode.parentNode.instance.titleObject.innerHTML = "Technical Details";
          this.parentNode.innerHTML = err;
        };
        new Notif("Couldn't rename song", ["Make sure you are not currently listening to the song you are trying to rename, as this will fail.\n", _button]);

      }
      else{
        other.input.parentNode.parentNode.close();
        new Notif("Renamed", ["Changed \""+allMusicData[id].folderPath+"\"\nto\n"+"\""+pathDir+newName+"\""], 1000);
        onMenuHover();
        LoadMusic();
      }
    });
  });
}
