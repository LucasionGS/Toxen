const ffmpeg = require('fluent-ffmpeg');
var nowPlaying = "";
var songs = {};
var songCount = 0;
var data;
var isReady = false;
var randomize = false;
var repeat = false;
var audio;
var playHistory = [];
var mousePos = {
  "X":0,
  "Y":0
};

//Get mouse position
window.onmousemove = function(e)
{
  mousePos.X = e.clientX;
  mousePos.Y = e.clientY;
}

function onload()
{
  audio = document.getElementById("musicObject");
}

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

function playSong(id)
{
  const ref = document.getElementById("music-"+id);
  if (ref.style.display == "none") {
    musicEnd();
    return null;
  }
  data = {
    "id": id,
    "song": allMusicData[id].artist+" - "+allMusicData[id].title,
    "file": allMusicData[id].file,

  };
  var songTitle = allMusicData[id].artist+" - "+allMusicData[id].title;
  if (!fs.existsSync(allMusicData[id].file)) {
    new Notif(
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

  // Resetting settings after script modification
  Control.functionEvents = [];
  event_sliderUpdate();
  if (fs.existsSync(allMusicData[id].folderPath+"/script.js")) {
    var script = require(allMusicData[id].folderPath+"/script.js");
    script.script();
  }
}

//Keypresses
function keypress(e)
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
      Notif.closeNewest();
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
    document.querySelector(".music-list").scrollIntoViewIfNeeded();
  }
  else if (e.ctrlKey && e.key == "y") {
    onMenuHover();
    document.querySelector(".addMusic").scrollIntoViewIfNeeded();
  }
  else if (e.ctrlKey && e.key == "u") {
    checkUpdate();
  }
  else if ((e.ctrlKey && e.key == "ArrowLeft" && !isFocusInput) || e.key == "MediaTrackPrevious") {
    toggleFunction("previous");
  }
  else if ((e.ctrlKey && e.key == "ArrowRight" && !isFocusInput) || e.key == "MediaTrackNext") {
    toggleFunction("next");
  }
  else if (e.key == "F5") {
    location.reload();
  }
  else if (e.key == "F11") {
    var electron = require('electron');
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
}

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
    body.style.background = "url(\""+curBG+"?"+queryString+"\") no-repeat center center fixed";
    body.style.backgroundSize = "cover";
  }

}

function onMenuHover()
{
  document.getElementById("sidebar").setAttribute("hover", "true");
}

function offMenuHover()
{
  document.getElementById("sidebar").setAttribute("hover", "false");
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