const ffmpeg = require('fluent-ffmpeg');
var nowPlaying = "";
var songs = {};
var songCount = 0;
var data;
var isReady = false;
var randomize = false;
var audio;

function playToggle() {
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

function playSong(id)
{
  const ref = document.getElementById("music-"+id);
  data = {
    "id":id,
    "song":ref.childNodes[0].innerHTML,
    "file":songs[id],
    //"duration":""
  };
  var musicObject = document.getElementById("musicObject");
  musicObject.src = data.file;
  musicObject.volume = 0.3;
  //console.log(data);
  if (data["song"].length <= 40) {
    document.getElementById("song-title").innerHTML = data["song"];
  }
  else {
    document.getElementById("song-title").innerHTML = data["song"].substring(0, 37)+"...";
  }
  setBG(data);
  play(document.getElementById("play"));
  document.getElementById("now-playing").setAttribute("playingid", id);
  Visualizer();
  //alert(data["song"]);
}

function keypress(e)
{
  if(e.keyCode == 32)
  {
    playToggle();
  }
  else if (e.altKey && e.key == "r") {
    if (randomize) {
      alert("Randomizer turned off");
    }
    else {
      alert("Randomizer turned on");
    }
    randomize = !randomize;
  }
  else if (e.altKey && e.key == "s") {
    openSettings();
  }
}

function onload() {
  audio = document.getElementById("musicObject");
}

function musicEnd()
{
  if (!randomize) {
    console.log(songCount);
    console.log(data.id);
    if (songCount > data.id+1) {
      playSong(data.id+1);
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

function setBG(song, reset)
{
  if (reset == true) {
    var body = document.getElementsByTagName('body')[0];
    body.style.background = ""; //Resets
  }
  else {
    var body = document.getElementsByTagName('body')[0];
    var curBG = song.file.substring(0,song.file.length-4)+".jpg";
    body.style.background = "url(\""+curBG+"\") no-repeat center center fixed";
    body.style.backgroundSize = "cover";
  }
  console.log(body.style.backgroundImage);
}

var whileMenuHover;

function onMenuHover()
{
  document.getElementById("sidebar").setAttribute("hover", "true");
}

function offMenuHover()
{
  document.getElementById("sidebar").setAttribute("hover", "false");
}
