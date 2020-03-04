const ffmpeg = require('fluent-ffmpeg');
var electron = require('electron');
let nowPlaying = "";
let songs = {};
let songCount = 0;
let data;
let isReady = false;
let randomize = false;
let repeat = false;
/**
 * @type {HTMLAudioElement}
 */
let audio;
let playHistory = [];
let mousePos = {
  "X":0,
  "Y":0
};
var playlistFile = "./playlists.json";

/**
 * Title of the playlist.
 * @type {string}
 */
let curPlaylist = false;
/**
 * @type {{"song": string}}
 */
let playlists = {};
const fs = require("fs");
const ytdl = require("ytdl-core");
const https = require('https');
const {ContextMenu, Path} = require("ionlib");
var Popup = require("ionlib").Popup;
/**
 * @type {{string: string | number}}
 */
var settings;
var preMusicDirectory = null;
/**
 * @type {{
    "folderPath": string;
    "artist": string;
    "title": string;
    "file": string;
    "srt": string;
    "background": string;
    }[]}
 */
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
    "name": "Add to playlist...",
    "click": function(ev, ref) {
      addPlaylist(ref.innerText);
    }
  },
  {
    "name": "Remove from current playlist",
    "click": function(ev, ref) {
      removeFromPlaylist(curPlaylist, ref.innerText);
    }
  },
  {
    "name": "Rename song",
    "click": function(ev, ref) {
      renameSong(ref, ev);
    }
  },
  {
    "name": "Delete song",
    "click": function(ev, ref) {
      let id = +ref.id.substring(6);
      new Popup(
        "No mp3 found.",
        [
          "Do you really want to delete \""+allMusicData[id].artist+" - "+allMusicData[id].title+"\"?",
          "<strong>This cannot be undone?</strong>",
          "<button onclick='deleteSong("+id+"); this.parentNode.parentNode.close();'>Delete song</button>",
          "<button onclick='this.parentNode.parentNode.close();'>Noooo</button>"
        ]
      ).setButtonText(false);
    }
  },
  {
    "name": "Open song folder",
    "click": function(ev, ref) {
      openMusicFolder(+ref.id.substring(6));
    }
  }
]);

musicItemCm.menu.onmouseover = function() {
  onMenuHover();
}

//Get mouse position
window.onmousemove = function(/**@type {MouseEvent}*/e)
{
  mousePos.X = e.clientX;
  mousePos.Y = e.clientY;
}

function onload()
{
  audio = document.getElementById("musicObject");
}

setTimeout(() => {
  document.getElementById("playlistSelector").addEventListener("change", (ev) => {
    switchPlaylist(ev.target.value);
  });
  loadPlaylist();
}, 250);

function playToggle()
{
  const btn = document.getElementById("play");
  var mode = btn.getAttribute("mode");
  if (mode == "stop") {
    play(btn);
  }
  else {
    stop(btn);
  }
}

function play(btn)
{
  const musicObject = document.getElementById("musicObject");
  btn.setAttribute("mode","play");
  musicObject.play();
}

function stop(btn)
{
  const musicObject = document.getElementById("musicObject");
  btn.setAttribute("mode","stop");
  musicObject.pause();
}

function deleteSong(id) {
  if (+document.getElementById("now-playing").getAttribute("playingid") == id) {
    // document.getElementById("musicObject").stop();
    // document.getElementById("musicObject").src = "";
    toggleFunction("next");
  }
  try {
    // Delete files inside
    var files = fs.readdirSync(allMusicData[id].folderPath);
    for (var i = 0; i < files.length; i++) {
      fs.unlinkSync(allMusicData[id].folderPath+"/"+files[i]);
    }
    // Delete Folder
    fs.rmdirSync(allMusicData[id].folderPath);
  } catch (e) { console.log("No files to delete"); }
  const ref = document.getElementById("music-"+id);
  ref.parentNode.removeChild(ref);
}

/**
 * Get the ID of the currently playing song.
 */
function getPlayingId() {
  return +document.getElementById("now-playing").getAttribute("playingid");
}

/**
 * 
 * @param {number} id 
 */
function playSong(id)
{
  const ref = document.getElementById("music-"+id);
  if (ref == null || ref.style.display == "none") {
    musicEnd();
    return null;
  }
  data = {
    "id": id,
    "song": allMusicData[id].artist+" - "+allMusicData[id].title,
    "file": allMusicData[id].file,

  };
  var songTitle = allMusicData[id].artist+" - "+allMusicData[id].title;
  document.querySelector("title").innerText = songTitle;
  if (!fs.existsSync(allMusicData[id].file)) {
    new Popup(
      "No mp3 found.",
      [
        "No mp3 file cound be found inside of the song folder \""+allMusicData[id].folderPath+"\".",
        "Do you want to delete this folder?",
        "<button onclick='deleteSong("+id+"); this.parentNode.parentNode.close();'>Delete song</button>"
      ]
    );
  }
  var musicObject = document.getElementById("musicObject");
  musicObject.src = allMusicData[id].file;
  musicObject.volume = 0.3;

  document.getElementById("song-title").innerHTML = songTitle;
  setBG(allMusicData[id].background);
  play(document.getElementById("play"));
  document.getElementById("now-playing").setAttribute("playingid", id);
  changeVolume();
  if (playHistory[playHistory.length-1] != id) {
    playHistory[playHistory.length] = id;
  }

  var allMusicItems = document.getElementsByClassName("music-item");
  for (var i = 0; i < allMusicItems.length; i++) {
    if (allMusicItems[i].getAttribute("playing") != "new") {
      allMusicItems[i].removeAttribute("playing");
    }
  }
  var curMusicItem = document.getElementById("music-"+playHistory[playHistory.length-1]);
  if (playHistory.length >= 1) {
    curMusicItem.setAttribute("playing", true);
  }
  var musicListObject = document.getElementById("music-list");
  //musicListObject.scrollTop = curMusicItem.offsetTop-Math.min(musicListObject.clientHeight, mousePos.Y);
  curMusicItem.scrollIntoViewIfNeeded();
  clearInterval(subtitleInterval);
  RenderSubtitles(allMusicData[id].srt);
  Visualizer();

  // // Resetting settings after script modification
  // Control.functionEvents = [];
  // event_sliderUpdate();
  // if (fs.existsSync(allMusicData[id].folderPath+"/script.js")) {
  //   var script = require(allMusicData[id].folderPath+"/script.js");
  //   /**
  //    * __dirname is the root directory of toxen.
  //    */
  //   script.script(__dirname+"/src/scriptControl.js");
  // }

  event_sliderUpdate();
  ToxenScriptManager.events = [];
  if (fs.existsSync(allMusicData[id].folderPath+"/storyboard.txn")) {
    ToxenScriptManager.ScriptParser(allMusicData[id].folderPath+"/storyboard.txn");
  }
}

//Keypresses
function keypress(/**@type {KeyboardEvent} */e)
{
  var curFocus = document.activeElement;
  var curFocusTag = curFocus.tagName.toLowerCase();
  var isFocusInput = curFocusTag == "input";
  if (e.keyCode == 13 && curFocus.getAttribute("class") == "addMusicItem") {
    if (!document.getElementById("addButton").disabled) {
      addMusic();
    }
  }
  else if (e.key == "Escape") {
    try {
      Popup.closeNewest();
    }
    catch {}
  }
  else if(e.keyCode == 32 && !isFocusInput)
  {
    playToggle();
  }
  else if (e.ctrlKey && e.key == "r") {
    toggleFunction("repeat");
  }
  else if (e.ctrlKey && e.altKey && e.key == "s") {
    ToxenScriptManager.reloadCurrentScript();
  }
  else if (e.ctrlKey && e.key == "s") {
    toggleFunction("shuffle");
  }
  else if (e.ctrlKey && e.key == "f") {
    onMenuHover();
    document.querySelector("[playing=true]").scrollIntoViewIfNeeded();
  }
  else if (e.ctrlKey && e.key == "o") {
    onMenuHover();
    document.querySelector(".settingsList").scrollIntoViewIfNeeded();
  }
  else if (e.ctrlKey && e.key == "m") {
    onMenuHover();
    document.querySelector("#searchField").scrollIntoViewIfNeeded();
    document.querySelector("#searchField").focus();
  }
  else if (e.ctrlKey && e.key == "y") {
    onMenuHover();
    document.querySelector(".addMusic").scrollIntoViewIfNeeded();
  }
  else if (e.ctrlKey && e.key == "u") {
    checkUpdate();
  }
  else if ((e.ctrlKey && e.key == "ArrowLeft" && !isFocusInput) || e.key == "MediaTrackPrevious") {
    e.preventDefault();
    toggleFunction("previous");
  }
  else if ((e.ctrlKey && e.key == "ArrowRight" && !isFocusInput) || e.key == "MediaTrackNext") {
    e.preventDefault();
    toggleFunction("next");
  }
  else if (e.key == "MediaPlayPause") {
    e.preventDefault();
    playToggle();
  }
  else if (e.key == "F5") {
    location.reload();
  }
  else if (e.key == "F11") {
    var window = electron.remote.getCurrentWindow();
    window.setFullScreen(!window.isFullScreen());
    window.setMenuBarVisibility(!window.isFullScreen());
    if (window.isFullScreen()) {
      document.getElementById("music-list").after(document.getElementById("player"));
      document.getElementById("canvas").style.height = "100vh";
    }
    else {
      document.getElementById("player");
      document.getElementById("content").after(document.getElementById("player"))
      document.getElementById("canvas").style.height = "92vh";
    }
  }
  else if (e.ctrlKey && e.key == "0") {
    var mo = document.getElementById("musicObject");
    var mSpd = document.getElementById("musicspeedslider");
    mSpd.value = 100;
    event_sliderUpdate();
  }
  else if (e.ctrlKey && e.key == "+") {
    var mo = document.getElementById("musicObject");
    var mSpd = document.getElementById("musicspeedslider");
    mSpd.value = ((Math.round(mo.playbackRate*10)/10)+0.1)*100;
    event_sliderUpdate();
  }
  else if (e.ctrlKey && e.key == "-") {
    var mo = document.getElementById("musicObject");
    var mSpd = document.getElementById("musicspeedslider");
    mSpd.value = ((Math.round(mo.playbackRate*10)/10)-0.1)*100;
    event_sliderUpdate();
  }
}

/**
 * 
 * @param {string} func 
 * @param {boolean} force 
 */
function toggleFunction(func, force)
{
  var object;
  if (func == "shuffle") {
    object = document.getElementById("btnShuffleToggle");
    randomize = !randomize;
    object.setAttribute('activated', randomize);
  }
  if (func == "repeat") {
    object = document.getElementById("btnRepeatToggle");
    repeat = !repeat;
    object.setAttribute('activated', repeat);
  }
  if (func == "previous" && playHistory.length > 1) {
    playHistory.length = playHistory.length-1;
    playSong(playHistory[playHistory.length-1]);
  }
  if (func == "next") {
    musicEnd();
  }
}

function musicEnd()
{
  var _id;
  if (data == undefined || data.id == undefined) {
    _id = 0;
  }
  else {
    _id = data.id;
  }
  if (repeat) {
    playSong(_id);
  }
  else if (!randomize) {
    if (songCount > _id+1) {
      var musicObject = document.getElementById("music-"+(_id+1));
      while(musicObject.style.display == "none") {
        _id++;
        if (songCount > _id+1) {
          musicObject = document.getElementById("music-"+(_id+1));
        }
        else {
          _id = 0;
          musicObject = document.getElementById("music-"+(_id));
          while(musicObject.style.display == "none") {
            _id++;
            if (songCount > _id+1) {
              musicObject = document.getElementById("music-"+(_id));
            }
          }
          playSong(_id);
          return undefined;
        }
      }
      playSong(_id+1);
    }
    else {
      _id = 0;
      musicObject = document.getElementById("music-"+(_id));
      while(musicObject.style.display == "none") {
        _id++;
        if (songCount > _id+1) {
          musicObject = document.getElementById("music-"+(_id));
        }
      }
      playSong(_id);
      return undefined;
    }
  }
  else {
    var _availableSongs = [];
    for (var i = 0; i < songCount; i++) {
      var musicObject = document.getElementById("music-"+i);
      if (musicObject.style.display != "none") {
        _availableSongs.push(i);
      }
    }
    var songIdToPlay = _id;
    while (songIdToPlay == _id && _availableSongs.length > 1) {
      songIdToPlay = _availableSongs[Math.floor((Math.random() * _availableSongs.length))];
    }
    if (_availableSongs.length == 1) {
      songIdToPlay = _availableSongs[0];
    }
    playSong(songIdToPlay);
  }
}

function update()
{
  if (audio && audio.duration && audio.duration > 0 && document.getElementById("curTime").max != audio.duration) {
    document.getElementById("curTime").max = audio.duration;
  }
  if (audio && audio.currentTime && audio.duration) {
    document.getElementById("curTime").value = audio.currentTime;
    document.getElementById("song-digital-progress").innerHTML = ConvertSecondsToDigitalClock(audio.currentTime, true)+"/"+ConvertSecondsToDigitalClock(audio.duration, true);
  }
}

//Execute update()
setInterval(() => {
  if (audio != undefined && audio.currentTime != undefined && audio.duration != undefined) {
    update();
  }
},10);

function changeProgress(e)
{
  if (e.buttons == 1) {
    e.preventDefault();
    var procent = e.offsetX / e.target.clientWidth;
    audio.currentTime = audio.duration * procent;
  }
}

function changeVolume()
{
  document.getElementById("musicObject").volume = document.getElementById("volume").value/100;
  document.getElementById("volumeLabel").innerHTML = "- Volume + " + document.getElementById("volume").value;
}

/**
 * Change the current background image.
 * @param {string} image The path to the image
 * @param {string} queryString An extra query string for updating cache.
 * @param {boolean} reset If true, removes background.
 */
function setBG(image, queryString, reset)
{
  if (queryString == undefined) {
    try {
      queryString = fs.statSync(image).ctimeMs;
    } catch (e) {
      queryString = "";
    }
  }
  if (reset == true) {
    var body = document.getElementsByTagName('body')[0];
    body.style.background = ""; //Resets
  }
  else {
    var body = document.getElementsByTagName('body')[0];
    var curBG = image;
    if (curBG != "") {
      body.style.background = "url(\""+curBG+"?"+queryString+"\") no-repeat center center fixed black";
      body.style.backgroundSize = "cover";
    }
    else {
      var defImg = "";
      if (fs.existsSync(settings.musicDir+"/default.jpg")) defImg = settings.musicDir+"/default.jpg";
      if (fs.existsSync(settings.musicDir+"/default.png")) defImg = settings.musicDir+"/default.png";
      body.style.background = "url(\""+defImg+"?"+queryString+"\") no-repeat center center fixed black";
    }
  }

}

function onMenuHover()
{
  document.getElementById("sidebar").setAttribute("hover", "true");
  document.getElementById("canvas").setAttribute("hover", "true");
  
}

function offMenuHover()
{
  document.getElementById("sidebar").setAttribute("hover", "false");
  document.getElementById("canvas").setAttribute("hover", "false");
}

function ConvertSecondsToDigitalClock(seconds = 0, trim = false) {
  milliseconds = seconds * 1000;
  time = "";
  curNumber = 0;

  // Convert into hours
  while (milliseconds >= 3600000) {
    curNumber++;
    milliseconds -= 3600000;
  }
  if (curNumber < 10) {
    time += "0" + (curNumber) + ":";
  }
  else {
    time += curNumber + ":";
  }
  curNumber = 0;

  // Convert into minutes
  while (milliseconds >= 60000) {
    curNumber++;
    milliseconds -= 60000;
  }
  if (curNumber < 10) {
    time += "0" + (curNumber) + ":";
  }
  else {
    time += curNumber + ":";
  }
  curNumber = 0;

  // Convert into seconds
  while (milliseconds >= 1000) {
    curNumber++;
    milliseconds -= 1000;
  }
  if (curNumber < 10) {
    time += "0" + (curNumber) + ",";
  }
  else {
    time += curNumber + ",";
  }
  curNumber = 0;

  // Use rest as decimal
  milliseconds = Math.round(milliseconds);
  if (milliseconds >= 100) {
    time += ""+milliseconds;
  }
  else if (milliseconds >= 10) {
    time += "0"+milliseconds;
  }
  else if (milliseconds < 10) {
    time += "00"+milliseconds;
  }

  if (trim == true) {
    while (time.startsWith("00:")) {
      time = time.substring(3);
      if (time.startsWith("0") && !time.startsWith("0:")) {
        time = time.substring(1);
      }
    }
  }
  return time;
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
    new Popup("Updated Music Folder", "", 2000);
  }
}

//Loading music and other startup events
window.onload = function(){
  Popup.addStyle({
    "theme": "dark",
    "top": "fullTop",
    "opacity": 0.9
  });

  //Create drop area
  let dropArea = document.getElementsByTagName("html")[0];
  dropArea.addEventListener('drop', fileDropped, false);

  dropArea.addEventListener('dragenter', function(event){}, false);

  dropArea.addEventListener('dragleave', function() {}, false);

  dropArea.addEventListener('dragover', function(event){
    event.stopPropagation();
    event.preventDefault();
  }, false);

  var loadingMusicNotif = new Popup("Loading Music...", "", 10000);
  setTimeout(function () {
    LoadMusic();
    loadingMusicNotif.close();
    toggleFunction("shuffle");
    musicEnd();
  }, 1);
}

var allFoundFiles = []; // Used for deleting after...
/**
 * Loads and reloads all music in a folder.
 */
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

  if (settings.musicDir) {
    playlistFile = (settings.musicDir+"/playlists.json").replace(/\\+|\/\/+/g, "/");
  }

  // Add playlist file if it doesn't exist
  if (!fs.existsSync(playlistFile)) {
    fs.writeFileSync(playlistFile, "{}");
  }
  else {
    try {
      // Read file.
      playlists = JSON.parse(fs.readFileSync(playlistFile));
    } catch (error) {
      new Popup("Failed loading playlists", "", 2000);
    }
  }

  _musicFiles = fs.readdirSync(pathDir, {withFileTypes:true});

  var newMp3Count = 0;
  filesDetected = 0;
  filesCopied = 0;
  for (var i = 0; i < _musicFiles.length; i++) {
    var thisMusicDir = settings.musicDir+"/"+_musicFiles[i].name+"/";
    if ( _musicFiles[i].name != "default.jpg" && _musicFiles[i].name != "default.png" &&
      (
        _musicFiles[i].name.endsWith(".mp3")
      || _musicFiles[i].name.endsWith(".srt")
      || _musicFiles[i].name.endsWith(".jpeg")
      || _musicFiles[i].name.endsWith(".jpg")
      || _musicFiles[i].name.endsWith(".png")
      )
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
      
      if (typeof curPlaylist != "string") {
        // 
      }
      else {
        for (let titleIndex = 0; titleIndex < playlists[curPlaylist].length; titleIndex++) {
          /**
           * @type {string}
           */
          const songTitle = playlists[curPlaylist][titleIndex];
          
          if (songTitle == newItem.innerText) {
            // Add music
          }
        }
      }

      document.getElementById("music-list").appendChild(newItem);
      songs[i] = musicFiles[i].file;
      songCount++;
    }
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

  // fs.watch(pathDir).on("change", (eventType, filename) => {
  //   var d;
  //   if ((d = document.getElementById("musicFolderChangedContent"))) {
  //     /**
  //      * @type {Popup}
  //      */
  //     var oldn = d.instance;

  //     oldn.descriptionObject.innerHTML += `<br>Change on "${filename}"`
  //     return;
  //   }
  //   var n = new Popup("Reload Music Folder?", [
  //     "Change in music folder detected. Reload it to see the changes.",
  //     `<br>Change on "${filename}"`
  //   ]);
  //   n.object.id = "musicFolderChangedContent";

  //   n.buttonObject.addEventListener("click", () => {
  //     LoadMusic();
  //   });

  //   n.setButtonText("Reload Music Folder");
  // });
}

var filesDetected = 0;
var filesCopied = 0;
/**
 * @type {Popup}
 */
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
    fileCopyProcessNotif = new Popup(
      "Found files in Music folder",
      "Copying files from folder to a valid location...<br>"+
      "<div id='TEMP_FILECOPYPROCESS'>"+filesCopied+"/"+filesDetected+" files copied<br>"+curFile+"</div>"+
      "<br>Please wait", 1000000
    );
    isFileCopyFinished(filesDetected, filesCopied);
  }
}

//Test for illegal chars
function isValid(str) {
  var orgStr = str;
  let reg = /[\\\/\:\*\?\"\<\>\|]/g;
  if (reg.test(str)) {
    str = str.replace(reg, "");
    new Popup("Invalid Characters Detected", "Changed \""+orgStr+"\"\nto \""+str+"\"");
  }
  return str;
}

function downloadFFMPEG(dlAfter = false) {
  fs.mkdirSync("./resources/app/src/", {
    "recursive": true
  });
  var d = new Download("http://files.lucasion.xyz/software/ffmpeg/ffmpeg.exe", "./resources/app/src/ffmpeg.exe");  
  const div = document.createElement("div");
  div.innerText = "Starting Download";
  var n = new Popup("Downloading FFMPEG", [div]);

  d.onData = function(data) {
    div.innerText = Math.round(d.downloadPercent())+"% Downloaded";
  };

  d.onError = function(err) {
    n.close();
    console.error(err);
    new Popup("Error", err);
  }

  d.onClose = function () {
    n.close();
    if (dlAfter) {
      addMusic();
    }
  }
  // d.onEnd = d.onClose;

  d.start();
}

/**
 * Adding music via YouTube URL
 */
async function addMusic()
{
  var url = document.getElementById("addUrl").value;
  if (ytdl.validateURL(url)) {}
  else {
    return new Popup("Invalid URL", "\""+url+"\" is not a valid URL");
  }

  var name = document.getElementById("addName").value;
  var button = document.getElementById("addButton");
  var dlImg = document.getElementById("dlImg").checked;

  button.innerHTML = "Checking FFMPEG...";
  button.disabled = true;

  var ffmpegPath;
  if (fs.existsSync('./resources/app/src/ffmpeg.exe')) {
    ffmpegPath = './resources/app/src/ffmpeg.exe';
  }
  else if (fs.existsSync('./src/ffmpeg.exe')){
    ffmpegPath = './src/ffmpeg.exe';
  }
  else {
    var n = new Popup("FFMPEG not installed for Toxen", [
      "FFMPEG was not found in the src folder.",
      "Do you want to install it?",
      "<button id=\"_ffmpegdownloadbutton\">Install FFMPEG (63 MB)</button>",
      "<button id=\"_ffmpegresetbuttons\">Another time...</button>",
    ]);

    n.object.querySelector("button#_ffmpegdownloadbutton").onclick = function() {
      downloadFFMPEG(true);
      n.close();
    };

    n.object.querySelector("button#_ffmpegresetbuttons").onclick = function() {
      document.getElementById("addButton").disabled = false;
      document.getElementById("addButton").innerHTML = "Add Music";
      n.close();
    };
    return;
  }

  button.innerHTML = "Downloading... Please wait";

  var ytInfo;

  if (name == "") {
    ytInfo = await ytdl.getBasicInfo(url);
    name = ytInfo.title;
    if (ytInfo.media && ytInfo.media.artist && ytInfo.media.song) {
      name = ytInfo.media.artist.replace(/ +\- +/g, "-") + " - " + ytInfo.media.song.replace(/ +\- +/g, "-");
    }
  }

  name = isValid(name);
  var stream;
  try {
    // stream = ytdl(url);
    // Changed to audio only download
    new Popup("Downloading... Please wait", name, 2000);
    stream = ytdl(url, {
      "filter": "audioonly"
    });
  }
  catch (err) {
    console.error(err);
    console.log(url);
    new Popup("Error", "An error happened while trying to download this stream.");
    document.getElementById("addButton").disabled = false;
    document.getElementById("addButton").innerHTML = "Add Music";
    return;
  };
  //const mp4 = pathDir+name+'.mp4'; //Add this IF i add video
  var songFolderPath = pathDir+name+"/";
  const mp3 = songFolderPath+name+'.mp3';
  const jpg = songFolderPath+name+".jpg";
  if (dlImg) {
    https.get("https://i.ytimg.com/vi/"+ytdl.getURLVideoID(url)+"/maxresdefault.jpg", function(response) {
      if (!fs.existsSync(songFolderPath)) {
        fs.mkdirSync(songFolderPath, {recursive: true});
      }
      response.pipe(fs.createWriteStream(jpg));
    });
  }
  // https://i.ytimg.com/vi/WROcJK3ZHGc/maxresdefault.jpg
  // var proc = new ffmpeg({source:stream});

  // Make sure folder exists
  if (!fs.existsSync(songFolderPath)) {
    try {
      fs.mkdirSync(songFolderPath, {recursive: true});
    } catch (error) {
      new Popup("Error", "Unable to access the song folder.").setButtonText("Damn it");
      return console.error("Unable to access the song folder.");
    }
  }
  stream.pipe(fs.createWriteStream(mp3))
  .on("close", () => {
    addSongToList({
      "fullName": name,
      "folderPath": songFolderPath,
      "file": mp3,
      "bgFile": jpg,
      "srtFile": "",
    });
    new Popup("Download Finished", name, 1000);
    // new Notification("Download Finished");
    
    // Finished
    document.getElementById("addUrl").value = "";
    document.getElementById("addName").value = "";
    document.getElementById("addButton").disabled = false;
    document.getElementById("addButton").innerHTML = "Add Music";
  });
  // proc.setFfmpegPath(ffmpegPath);
  // proc.saveToFile(mp3, (stdout, stderr) => {
  //   if (stderr) {
  //     return console.error(stderr);
  //   }
  //   if (!fs.existsSync(songFolderPath)) {
  //     try {
  //       fs.mkdirSync(songFolderPath, {recursive: true});
  //     } catch (error) {
  //       new Popup("Error", "Unable to access the song folder.").setButtonText("Damn it");
  //       return console.error("Unable to access the song folder.");
  //     }
  //   }
  //   //Add file to music browser
  //   document.getElementById("addUrl").value = "";
  //   document.getElementById("addName").value = "";
  //   document.getElementById("addButton").disabled = false;
  //   document.getElementById("addButton").innerHTML = "Add Music";
  //   return console.log('Download complete!');
  // })
  // .on('end', function(err) {
  //   addSongToList({
  //     "fullName": name,
  //     "folderPath": songFolderPath,
  //     "file": mp3,
  //     "bgFile": jpg,
  //     "srtFile": "",
  //   });
  //   new Popup("Download Finished", name, 1000);
  //   // new Notification("Download Finished");
    
  //   // Finished
  //   document.getElementById("addUrl").value = "";
  //   document.getElementById("addName").value = "";
  //   document.getElementById("addButton").disabled = false;
  //   document.getElementById("addButton").innerHTML = "Add Music";
  // }).
  // on("error", (err) => {
  //   new Popup("Couldn't download file.", [
  //     "Failed to download the audio file.",
  //     "Make sure the video is not private, or try a different URL."
  //   ]);
  //   console.error(err);
  //   // document.getElementById("addUrl").value = "";
  //   // document.getElementById("addName").value = "";
  //   document.getElementById("addButton").disabled = false;
  //   document.getElementById("addButton").innerHTML = "Add Music";
  // });

  // Get ID:
  // ytdl.getURLVideoID(url)
  // Video Image URL
  // http://i3.ytimg.com/vi/ ID /maxresdefault.jpg
}

const songItemParams = {
  /**
   * The full name of the song, formatted as `Artist - Title`-
   */
  fullName: "",
  /**
   * Song folder path.
   */
  folderPath: "",
  /**
   * mp3 file path.
   */
  file: "",
  /**
   * Background image path
   */
  bgFile: "",
  /**
   * SRT path.
   */
  srtFile: ""
}

/**
 * @param {songItemParams} data 
 */
function addSongToList(data) {
  var _title = data.fullName;
  var folderPath = data.folderPath;
  var artist;
  var title;
  var file = data.file;
  var bgFile = data.bgFile;
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

  if (document.getElementById("deleteOnNewLoad")) {
    document.getElementById("deleteOnNewLoad").parentNode.removeChild(document.getElementById("deleteOnNewLoad"));
  }
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
    new Popup("Added Subtitles", "Successfully added subtitles added for \""+allMusicData[curId].title+"\"", 1000);
    RenderSubtitles(allMusicData[curId].srt);
  }
  //Music Files
  else if (isExt(".mp3")) {
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
    new Popup("Your song has been added", "", 1000);
    try {
      document.getElementById("deleteOnNewLoad").parentNode.removeChild(document.getElementById("deleteOnNewLoad"));
    } catch (e) {}
  }
  //If none of the above
  else {
    new Popup("Invalid file",
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
function searchChange(search = document.getElementById("searchField").value, object = document.getElementById("searchField")) {
  var _songs = document.getElementsByClassName("music-item");
  for (var i = 0; i < _songs.length; i++) {

    // Remove if not in playlist
    if (typeof curPlaylist == "string") {
      var inPlaylist = false;
      for (let titleIndex = 0; titleIndex < playlists[curPlaylist].length; titleIndex++) {
        /**
         * @type {string}
         */
        const songTitle = playlists[curPlaylist][titleIndex];
        
        if (songTitle == _songs[i].childNodes[0].innerText) {
          inPlaylist = true;
          break;
        }
      }
      if (!inPlaylist) {
        _songs[i].style.display = "none";
        continue;
      }
    }
    if (!search.startsWith("/")) {
      object.style.color = "black";
      if (_songs[i].childNodes[0].innerText.toLowerCase().includes(search.toLowerCase())) {
        _songs[i].style.display = "block";
      }
      else {
        _songs[i].style.display = "none";
      }
    }
    else {
      try {
        object.style.color = "black";
        if (_songs[i].childNodes[0].innerText.match(new RegExp(search.substring(1), "i"))) {
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
  var n = new Popup("Rename",
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
        new Popup("Couldn't rename song", ["Make sure you are not currently listening to the song you are trying to rename, as this will fail.\n", _button]);

      }
      else{
        other.input.parentNode.parentNode.close();

        for (const key in playlists) {
          if (playlists.hasOwnProperty(key)) {
            const playlist = playlists[key];
            for (let i = 0; i < playlist.length; i++) {
              const song = playlist[i];
              var songName = allMusicData[id].folderPath;
              while (songName.endsWith("/")) {
                songName = songName.substring(0, songName.length-1);
              }
              songName = Path.basename(songName);
              
              if (song == songName) {
                playlists[key][i] = newName;
                console.log("Updated \""+key+"\" playlist");
              }
            }
          }
        }
        savePlaylists();

        new Popup("Renamed", ["Changed \""+allMusicData[id].folderPath+"\"\nto\n"+"\""+pathDir+newName+"\""], 1000);
        onMenuHover();
        LoadMusic();
      }
    });
  });
}

//const fs = require('fs');
var __proc = require('child_process');
var preset = {
  backgroundDim: 50,
  visualizerIntensity: 10
}
setTimeout(function () {
  document.getElementById("musicDir").setAttribute('placeholder', defaultMusicDir);
}, 1);
try {
  preset = JSON.parse(fs.readFileSync("./settings.json", "utf8"));
}
catch (e) {
  // setTimeout(() => {
  //   new Popup("No settings found", "It doesn't seem like you have set up your settings yet.\n"+
  // "For this app to work, it's important you select a music folder (A folder that already exists)\n"+
  // "");
  // }, 500);
}


const options = document.getElementsByClassName("setting");
window.addEventListener("load", function()
{
  event_sliderUpdate(-1);
  for (var i = 0; i < options.length; i++) {
    var typeOfSetting = options[i].getAttribute("settype");
    for (var key in preset) {
      if (options[i].getAttribute("name") == key) {
        //What type of setting?
        if (typeOfSetting == "checkbox") {
          if (preset[key] == true) {
            options[i].setAttribute("checked", true);
          }
          else {
            options[i].removeAttribute("checked");
          }
        }
        else if (typeOfSetting == "value") {
          options[i].value = preset[key];
        }
      }
    }
  }
}, false);

function applySettings()
{
  if (document.querySelector("#subtitleFont").value == "") {
    document.querySelector("#subBox").style.fontFamily = "Arial";
  }
  else{
    document.querySelector("#subBox").style.fontFamily = document.querySelector("#subtitleFont").value;
  }
  const _options = document.getElementsByClassName("setting");
  var jOptions = {};
  for (var i = 0; i < _options.length; i++) {
    var typeOfSetting = _options[i].getAttribute("settype");
    if (typeOfSetting == "checkbox") {
      jOptions[_options[i].name] = _options[i].checked;
    }
    else if (typeOfSetting == "value") {
      if (_options[i].getAttribute("id") == "musicDir") {
        jOptions[_options[i].name] = _options[i].value.replace(/\\+|\/\/+/g, "/");
        _options[i].value = jOptions[_options[i].name];
      }
      else {
        jOptions[_options[i].name] = _options[i].value;
      }
    }
  }
  var strOptions = JSON.stringify(jOptions);
  fs.writeFileSync("./settings.json", strOptions);

  var button = document.getElementById("applyButton");
  button.innerHTML = "<p>Saved!</p>";
  setTimeout(function () {
    button.innerHTML = "<p>Save</p>";
  }, 2000);
}

function event_sliderUpdate(value)
{
  //New Setting
  setTimeout(function(){
    document.getElementById("bgdim").innerHTML = "Background Dim: "+document.getElementById("bgdimslider").value+"%";
    
    document.getElementById("musicspeed").innerHTML = "Playback Rate: "+(document.getElementById("musicspeedslider").value/100)+"x";
    document.getElementById("musicObject").playbackRate = (document.getElementById("musicspeedslider").value/100);

    document.getElementById("visualintense").innerHTML = "Visualizer Intensity: "+document.getElementById("visualizerintensity").value;
    document.getElementById("visualcolor").innerHTML = "Visualizer Color: "+
    document.getElementById("visualizerRed").value+"/"+
    document.getElementById("visualizerGreen").value+"/"+
    document.getElementById("visualizerBlue").value;
    VisualizerProperties.rgb(
      document.getElementById("visualizerRed").value,
      document.getElementById("visualizerGreen").value,
      document.getElementById("visualizerBlue").value
    );


    if (value == -1) { //Default setting
      document.getElementById("bgdim").innerHTML = "Background Dim: "+preset["backgroundDim"]+"%";
      document.getElementById("visualintense").innerHTML = "Visualizer Intensity: "+preset["visualizerIntensity"];
    }
  }, 1);
  try {
    settings.backgroundDim = document.getElementById("bgdimslider").value;
    settings.visualizerIntensity = document.getElementById("visualizerintensity").value;
  } catch (error) {}
  document.querySelector("#applyButton").querySelector("p").innerHTML = "Save*";
}

function openMusicFolder(songId = -1) {
  if (songId < 0) {
    var _url = document.getElementById("musicDir").value.replace(/\\/g,"\\\\");
    if (_url == "") {
      //_url = document.getElementById("musicDir").getAttribute("placeholder").replace("\\","\\\\")
      _url = defaultMusicDir;
    }
    while (_url.startsWith("/") || _url.startsWith("\\")) {
      _url = _url.substring(1);
    }
    __proc.exec('start "" "'+_url+'"');
  }
  else {
    __proc.exec('start "" "'+allMusicData[songId].folderPath+'"');
  }
}

class VisualizerProperties {
  static r = 25;
  static g = 0;
  static b = 250;

  static toR = 25;
  static toG = 0;
  static toB = 250;
  static rgb(r = this.r, g = this.g, b = this.b)
  {
    this.toR = r;
    this.toG = g;
    this.toB = b;
    return {
      r:r,
      g:g,
      b:b
    };
  }

  static setIntensity(value){
    settings.visualizerIntensity = value;
  }
}

setInterval(function () {
  if (VisualizerProperties.r != VisualizerProperties.toR) {
    VisualizerProperties.r -= ((VisualizerProperties.r - VisualizerProperties.toR)/50);
  }
  if (VisualizerProperties.g != VisualizerProperties.toG) {
    VisualizerProperties.g -= ((VisualizerProperties.g - VisualizerProperties.toG)/50);
  }
  if (VisualizerProperties.b != VisualizerProperties.toB) {
    VisualizerProperties.b -= ((VisualizerProperties.b - VisualizerProperties.toB)/50);
  }
}, 1);

const http = require('https');
// const fs = require("fs");
const {Download} = require("ionodelib");
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
      var n = new Popup("New Update Available", [link]);
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
    new Popup("Check Update failed", err);
  });
}

async function DownloadUpdate(url, object) {
  var DL = new Download(url, "./ToxenInstall.exe");
  DL.onClose = function() {
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
  DL.onData = function(data) {
    object.descriptionObject.innerHTML = DL.downloadPercent()+"%";
  }
  DL.start();
}

function ParseGitRedirect(res) {
  return res.match(/<a href="(.*)">.*<\/a>/)[1];
}

function scrollToSong(id)
{
  var musicObject = document.getElementById("music-"+id);
  musicObject.scrollIntoViewIfNeeded();
}

//Create subtitle box for spawning and displaying
var createSubBoxInterval = setInterval(function () {
  if (document.getElementsByTagName("body")[0]) {
    var subBox = document.createElement("div");
    var subBoxText = document.createElement("p");
    subBox.setAttribute("id", "subBox");
    subBox.setAttribute("class", "subBox");
    subBoxText.setAttribute("id", "subBoxText");
    subBoxText.setAttribute("class", "subBoxText");
    subBoxText.innerHTML = "";

    subBox.appendChild(subBoxText);
    document.getElementsByTagName("body")[0].appendChild(subBox);
    clearInterval(createSubBoxInterval);
  }
}, 1);

function ParseSrt(srtFile)
{
  var srtPath = srtFile;
  try {
    var srtText = fs.readFileSync(srtPath, "utf8");
  } catch (e) {
    return false;
  }
  var subData = [];
  //Parsing
  var lines = srtText.split("\n");

  for (var i = 0; i < lines.length; i++) {
    var newSub = {
      "id":-1,
      "startTime":-1,
      "endTime":-1,
      "text":""
    };
    if (lines[i].trim() == "") {
      continue;
    }
    if (!isNaN(lines[i])) {
      //Set ID
      newSub.id = +lines[i];
      i++;

      //Set timestamps
      var timeStamps = lines[i].split("-->");
      //startTime
      var ints = timeStamps[0].split(",", 1)[0].split(":");
      newSub.startTime = ((+ints[0]*60*60)+(+ints[1]*60)+(+ints[2])+(+timeStamps[0].split(",", 2)[1]/1000));

      //endTime
      ints = timeStamps[1].split(",", 1)[0].split(":");
      newSub.endTime = ((+ints[0]*60*60)+(+ints[1]*60)+(+ints[2])+(+timeStamps[1].split(",", 2)[1]/1000));
      i++;
      //Set texts
      while (lines[i].trim() != "") {
        newSub.text += Imd.MarkDownToHTML(lines[i])+"\n";
        i++;
      }
      subData.push(newSub);
    }
  }

  //Returning
  return subData;
}

var subtitleInterval;
/**
 * 
 * @param {string} srtFile 
 */
function RenderSubtitles(srtFile) {
  clearInterval(subtitleInterval);
  var subData = ParseSrt(srtFile);
  var subText = document.getElementById("subBoxText");
  if (subText && subText.innerHTML) {
    subText.innerHTML = "";
  }
  if (!subData) {
    return;
  }
  subtitleInterval = setInterval(function () {
    var hasSub = false;
    for (var i = 0; i < subData.length; i++) {
      if (audio.currentTime > subData[i].startTime && audio.currentTime < subData[i].endTime) {
        if (subText.innerHTML.replace(/\"/g, "\'") != subData[i].text.replace(/\"/g, "\'")) {
          subText.innerHTML = subData[i].text;
        }
        hasSub = true;
      }
    }
    if (!hasSub) {
      subText.innerHTML = "";
    }
  }, 5);
}

function addPlaylist(title) {
  if (!fs.existsSync(playlistFile)) {
    fs.writeFileSync(playlistFile, "{}");
  }
  
  var select = document.createElement("select");
  const alreadyIn = document.createElement("p");
  alreadyIn.innerHTML = "";
  for (const key in playlists) {
    if (playlists.hasOwnProperty(key)) {
      /**
       * @type {curPlaylist[]}
       */
      const playlist = playlists[key];
      var exists = false;
      for (let i = 0; i < playlist.length; i++) {
        const item = playlist[i];
        if (title == item) {
          exists = true;
          break;
        }
      }
      if (!exists) {
        const option = document.createElement("option");
        option.text = key;
        option.value = key;
        select.appendChild(option);
      }
      else {
        alreadyIn.innerHTML += key+"<br>";
      }
    }
  }

  if (alreadyIn.innerHTML == "") {
    alreadyIn.innerHTML = "Already in:<br>None";
  }
  else {
    alreadyIn.innerHTML = "Already in:<br>"+alreadyIn.innerHTML;
  }

  const optionNew = document.createElement("option");
  optionNew.text = "New playlist...";
  optionNew.value = "$_newPlaylist";
  select.appendChild(optionNew);

  var customPlaylist = document.createElement("input");
  customPlaylist.placeholder = "New Playlist name...";
  customPlaylist.id = "customPlaylist";
  select.id = "selectPlaylist";
  var n = new Popup("Add Playlist", [
    `Add "${title}" to...`,
    select.outerHTML,
    customPlaylist.outerHTML,
    alreadyIn.outerHTML,
  ]);
  n.setButtonText("Add to playlist");

  select = document.getElementById("selectPlaylist");
  customPlaylist = document.getElementById("customPlaylist");
  customPlaylist.addEventListener("keydown", (ev) => {
    select.value = "$_newPlaylist";
  });
  n.buttonObject.onclick = function() {
    if (select.value == "$_newPlaylist") {
      if (customPlaylist.value.trim() == "") {
        error("You need to fill out a name for a new playlist!");
        return;
      }
      else if (customPlaylist.value.trim().startsWith("$_")) {
        error("You cannot call a playlist anything starting with \"$_\"");
        return;
      }

      function error(msg) {
        n.descriptionObject.children[n.descriptionObject.children.length-1].innerText = msg;
      }
      customPlaylist.value = customPlaylist.value.trim();
      if (playlists[customPlaylist.value]) {
        playlists[customPlaylist.value].push(title);
      }
      else {
        playlists[customPlaylist.value] = [title];
      }
      // playlists["New Playlist"].push(title);
    }
    else {
      playlists[select.value].push(title);
    }
    savePlaylists();
    n.close();
  }
}

function savePlaylists() {
  loadPlaylist();
  fs.writeFileSync(playlistFile, JSON.stringify(playlists));
}

function switchPlaylist(playlistName) {
  if (playlistName == "$_none") {
    playlistName = false;
  }
  curPlaylist = playlistName;
  // LoadMusic();
  searchChange();
}

/**
 * Load the playlist into the settings tab.
 * @param {string} value Optional value to select as default
 */
function loadPlaylist(value) {
  var playlistSelector = document.getElementById("playlistSelector");
  playlistSelector.innerHTML = "";

  const optionNone = document.createElement("option");
  optionNone.value = "$_none";
  optionNone.text = "None";
  playlistSelector.appendChild(optionNone);
  for (const playlist in playlists) {
    if (playlists.hasOwnProperty(playlist)) {
      const option = document.createElement("option");
      option.value = playlist;
      option.text = playlist;
      playlistSelector.appendChild(option);
      if (playlist == curPlaylist) {
        playlistSelector.value = playlist;
      }
    }
  }
}

function removeFromPlaylist(playlistName, songName) {
  if (playlistName == false) {
    new Popup("No playlist", "You haven't selected any playlist yet.", 2000);
    return;
  }
  for (let i = 0; i < playlists[playlistName].length; i++) {
    const _songName = playlists[playlistName][i];
    if (songName == _songName) {
      new Popup("Removed from playlist", `"${songName}" was removed from "${playlistName}"`, 2000);
      playlists[playlistName].splice(i, 1);
      savePlaylists();
      searchChange();
      break;
    }
  }
}

setInterval(() => {
  if (!audio) {
    audio = document.getElementById("musicObject");
    return;
  }
  if (ToxenScriptManager.events.length > 0 && settings.visualizer && settings.storyboard) {
    for (let i = 0; i < ToxenScriptManager.events.length; i++) {
      /**
       * @type {ToxenEvent}
       */
      const e = ToxenScriptManager.events[i];
      if (audio.currentTime >= e.startPoint && audio.currentTime <= e.endPoint) {
        e.fn();
      }
    }
  }
}, 1);

class ToxenScriptManager{

  static currentScriptFile = "";

  /**
   * Reloads the script for the currently playing song.
   */
  static reloadCurrentScript() {
    event_sliderUpdate();
    ToxenScriptManager.events = [];

    var id = getPlayingId();
    if (fs.existsSync(allMusicData[id].folderPath+"/storyboard.txn")) {
      ToxenScriptManager.ScriptParser(allMusicData[id].folderPath+"/storyboard.txn");
      new Popup("Reloaded Script File", [], 1000);
    }
  }

  /**
   * Parses Toxen script files for background effects.
   * @param {string} scriptFile Path to script file.
   */
  static ScriptParser(scriptFile) {
    fs.unwatchFile(ToxenScriptManager.currentScriptFile);
    fs.watchFile(scriptFile, (curr, prev) => {
      ToxenScriptManager.reloadCurrentScript();
    });
    ToxenScriptManager.currentScriptFile = scriptFile;
    var data = fs.readFileSync(scriptFile, "utf8").split("\n");
    for (let i = 0; i < data.length; i++) {
      const line = data[i].trim();
      if (typeof line == "string" && !line.startsWith("#") && !line.startsWith("//") && line != "") {

        var fb = lineParser(line);
        if (fb == undefined) continue;
        // Failures
        if (typeof fb == "string") {
          setTimeout(() => {
            new Popup("Parsing error", ["Failed parsing script:", "\""+scriptFile+"\"", "Error at line "+(i+1), fb]);
          }, 100);
          throw "Failed parsing script. Error at line "+(i+1)+"\n"+fb;
        }
        if (fb.success == false) {
          setTimeout(() => {
            new Popup("Parsing error", ["Failed parsing script:", "\""+scriptFile+"\"", "Error at line "+(i+1)]);
          }, 100);
          throw "Failed parsing script. Error at line "+(i+1)+"\n"+fb.error;
        }
      }
    }

    if (ToxenScriptManager.events[ToxenScriptManager.events.length-1] && ToxenScriptManager.events[ToxenScriptManager.events.length-1].endPoint == "$") {
      ToxenScriptManager.events[ToxenScriptManager.events.length-1].endPoint = ToxenScriptManager.timeStampToSeconds("2:00:00");
    }

    /**
     * Checks a line and parses it.
     * @param {string} line Current line of the script.
     */
    function lineParser(line) {
      try { // Massive trycatch for any error.

        // Check if no only start
        const checkTime = /(?<=\[)[^-]*(?=\])/g;
        if (checkTime.test(line)) {
          line = line.replace(checkTime, "$& - $");
        }
        // Regexes
        const timeReg = /(?<=\[).+\s*-\s*\S+(?=\])/g;
        const typeReg = /(?<=\[.+\s*-\s*\S+\]\s*)\S*(?=\s*=>)/g;
        const argReg = /(?<=\[.+\s*-\s*\S+\]\s*\S*\s*=>\s*).*/g;

        // Variables
        var startPoint = 0;
        var endPoint = 0;
        var args = [];
        var fn = (args) => {};

        // Parsing...
        var timeRegResult = line.match(timeReg)[0];
        timeRegResult = timeRegResult.replace(/\s/g, "");
        var tP = timeRegResult.split("-");
        startPoint = tP[0];
        endPoint = tP[1];

        // if (!startPoint.startsWith("$")) { // Maybe add this as a features just like endPoint...
          startPoint = ToxenScriptManager.timeStampToSeconds(tP[0]);
        // }
        if (endPoint != "$") {
          endPoint = ToxenScriptManager.timeStampToSeconds(tP[1]);
        }
        else {
          endPoint = "$";
        }

        if (ToxenScriptManager.events[ToxenScriptManager.events.length-1] && ToxenScriptManager.events[ToxenScriptManager.events.length-1].endPoint == "$"){
          ToxenScriptManager.events[ToxenScriptManager.events.length-1].endPoint = startPoint;
        }

        if (startPoint >= endPoint) { // Catch error if sP is higher than eP
          return "startPoint cannot be higher than endPoint";
        }
        
        var type = line.match(typeReg)[0].toLowerCase();
        if (typeof type != "string") {
          return "Invalid type format.";
        }

        var argString = line.match(argReg)[0].trim();

        if (typeof argString != "string") {
          return `Arguments are not in a valid format.`;
        }

        /**
         * @param {string} as 
         */
        function parseArgumentsFromString(as) {
          var argList = [];
          var curArg = "";
          var waitForQuote = true;
          for (let i = 0; i < as.length; i++) {
            const l = as[i];
            if (l == "\"" && i == 0) {
              waitForQuote = false;
              continue;
            }
            else if (l == "\"" && curArg == "" && waitForQuote == true) {
              waitForQuote = false;
              continue;
            }
            else if (l == "\\\\" && curArg != "" && as[i+1] == "\"") {
              i++;
              curArg += "\"";
              continue;
            }
            else if (l == "\"" && curArg != "") {
              argList.push(curArg);
              curArg = "";
              waitForQuote = true;
              continue;
            }
            else {
              if (!waitForQuote) {
                curArg += l;
              }
              continue;
            }
          }

          return argList;
        }

        args = parseArgumentsFromString(argString);        
        fn = function() {
          ToxenScriptManager.eventFunctions[type](args);
        };

        if (typeof ToxenScriptManager.eventFunctions[type] == undefined) {
          return `Type "${type.toLowerCase()}" is not valid.`;
        }

        ToxenScriptManager.events.push(new ToxenEvent(startPoint, endPoint, fn));

      } catch (error) { // Catch any error
        return {
          "success": false,
          "error": error
        };
      }
    }
  }

  /**
   * Function Types
   */
  static eventFunctions = {
    /**
     * Change the image of the background.
     * @param {[string]} args Arguments.
     */
    background: function(args) {
      var id = +document.getElementById("now-playing").getAttribute("playingid");
      setBG(allMusicData[id].folderPath+"/"+args[0]);
    },
    /**
     * Change the color of the visualizer
     * @param {[string | number, string | number, string | number]} args Arguments
     */
    visualizercolor: function(args) {
      VisualizerProperties.rgb(args[0], args[1], args[2]);
    },
    visualizerintensity: function(args) {
      if (args[1] && args[1].toLowerCase() == "smooth") {
        if (+args[0] < settings.visualizerIntensity) {
          settings.visualizerIntensity -= 0.1;
        }
        else if (+args[0] > settings.visualizerIntensity) {
          settings.visualizerIntensity += 0.1;
        }

        if (Math.round(+args[0] - settings.visualizerIntensity) == 0) {
          settings.visualizerIntensity = +args[0];
        }
      }
      else {
        VisualizerProperties.setIntensity(+args[0]);
      }
    }
  }
  
  /**
   * Convert a timestamp into seconds.
   * @param {string} timestamp Time in format "hh:mm:ss".
   */
  static timeStampToSeconds(timestamp)
  {
    try {
      var seconds = 0;
      var parts = timestamp.split(":");
      for (let i = 0; i < parts.length; i++) {
        const time = +parts[i];
        let x = parts.length-i-1;
        if (x == 0) {
          seconds += time;
        }
        if (x == 1) {
          seconds += time*60;
        }
        if (x == 2) {
          seconds += time*60*60;
        }
        if (x == 3) {
          seconds += time*60*60*24;
        }
      }
      return seconds;
    }
    catch (error) {
      var n = new Popup("Music Script Error", "Unable to convert timestamp \""+timestamp+"\" to a valid timing point.");
      n.setButtonText("welp, fuck");
    }
  }

  // static ToxenEvent = class ToxenEvent{
  //   /**
  //    * Create a new Event
  //    * @param {number} startPoint Starting point in seconds.
  //    * @param {number} endPoint Ending point in seconds.
  //    * @param {(args: any[]) => void} fn Function to run at this interval.
  //    */
  //   constructor(startPoint, endPoint, fn)
  //   {
  //     this.startPoint = startPoint;
  //     this.endPoint = endPoint;
  //     this.fn = fn;
  //   }
  // }

  /**
   * List of events in order for the current song.
   * @type {ToxenEvent[]}
   */
  static events = [];
}

class ToxenEvent{
  /**
   * Create a new Event
   * @param {number} startPoint Starting point in seconds.
   * @param {number} endPoint Ending point in seconds.
   * @param {(args: any[]) => void} fn Function to run at this interval.
   */
  constructor(startPoint, endPoint, fn)
  {
    this.startPoint = startPoint;
    this.endPoint = endPoint;
    this.fn = fn;
  }
}