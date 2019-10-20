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
  data = {
    "id": id,
    "song": allMusicData[id].artist+" - "+allMusicData[id].title,
    "file": allMusicData[id].file,
    //"duration":""
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
  if (songTitle.length <= 60) {
    document.getElementById("song-title").innerHTML = songTitle;
  }
  else {
    document.getElementById("song-title").innerHTML = songTitle.substring(0, 60)+"...";
  }
  setBG(allMusicData[id].background);
  play(document.getElementById("play"));
  document.getElementById("now-playing").setAttribute("playingid", id);
  changeVolume();
  if (playHistory[playHistory.length-1] != id) {
    playHistory[playHistory.length] = id;
  }
  //console.log(playHistory);
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
  musicListObject.scrollTop = curMusicItem.offsetTop-Math.min(musicListObject.clientHeight, mousePos.Y);
  clearInterval(subtitleInterval);
  RenderSubtitles(allMusicData[id].srt);
  Visualizer();
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
  else if (e.ctrlKey && e.key == "o") {
    openSettings();
  }
  else if (e.ctrlKey && e.key == "u") {
    checkUpdate();
  }
  else if ((e.ctrlKey && e.key == "ArrowLeft") || e.key == "MediaTrackPrevious") {
    toggleFunction("previous");
  }
  else if ((e.ctrlKey && e.key == "ArrowRight") || e.key == "MediaTrackNext") {
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
  if (!randomize) {
    if (songCount > _id+1) {
      playSong(_id+1);
    }
    else {
      playSong(0);
    }
  }
  else {
    playSong(Math.floor((Math.random() * songCount)));
  }
}

function update()
{
  if (audio.duration > 0 && document.getElementById("curTime").max != audio.duration) {
    document.getElementById("curTime").max = audio.duration;
  }
  document.getElementById("curTime").value = audio.currentTime;
}

//Execute update()
setInterval(() => {
  if (audio != undefined && audio.currentTime != undefined && audio.duration != undefined) {
    update();
  }
},10);

function changeProgress(e)
{
  var procent = e.offsetX / e.target.clientWidth;
  audio.currentTime = audio.duration * procent;
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
  //console.log(body.style.backgroundImage);
}

function onMenuHover()
{
  document.getElementById("sidebar").setAttribute("hover", "true");
}

function offMenuHover()
{
  document.getElementById("sidebar").setAttribute("hover", "false");
}
