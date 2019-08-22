var nowPlaying = "";
var songs = {};
var songCount = 0;
var data;
var isReady = false;
var randomize = false;

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
}

function onload() {
  audio = document.getElementById("musicObject");
}

function musicEnd()
{
  if (!randomize) {
    console.log(songCount);
    console.log(data.id);
    if (songCount > data.id) {
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

function setBG(song)
{
  var body = document.getElementsByTagName('body')[0];
  var curBG = song.file.substring(0,song.file.length-4)+".jpg";
  body.style.background = "url(\""+curBG+"\") no-repeat center center fixed";
  body.style.backgroundSize = "cover";
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

function addMusic()
{
  var url = document.getElementById("addUrl").value;
  var name = document.getElementById("addName").value.replace("&", "and");
  var button = document.getElementById("addButton");
  button.innerHTML = "Downloading and adding...";
  fetch("./music/dl.php?url="+url+"&name="+name)
  .then(response => {
    return response.json();
  })
  .then(data => {
    console.log(data);
    console.log("./music/dl.php?url="+url+"&name="+name);

    //Add music
    var newItem = document.createElement("div");
    newItem.setAttribute("class", "music-item");
    newItem.setAttribute("id","music-"+songCount);
    newItem.setAttribute("onclick", "playSong("+songCount +");");
    var newItemP = document.createElement("p");
    newItemP.innerHTML = data.artist + " - " + data.title;
    newItem.appendChild(newItemP);
    console.log(newItem);
    document.getElementById("music-list").appendChild(newItem);
    songs.push(data.file);
    console.log(songs);

    /*
    echo "<div class=\"music-item\" id=\"music-".$id."\" onclick=\"playSong(".$id.");\"><p>";
    echo $data["artist"]." - ".$data["title"];
    echo "</p></div>";
    */

    button.innerHTML = "Add Music...";
  })
  .catch(err => {
    console.log(err);
    button.innerHTML = "Error... check console."
  });
}
