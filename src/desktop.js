const fs = require("fs");
const ytdl = require("ytdl-core");
const pathDir = fs.readFileSync("./musicFolder", "utf8")+"/";
console.log(pathDir);


var musicFiles;

fetch("../../musicList.json")
.then(response => {
return response.json();
})
.then(data => {
  musicFiles = data;
  if (musicFiles.length > 0) {
    for (var i = 0; i < data.length; i++) {
      var newItem = document.createElement("div");
      newItem.setAttribute("class", "music-item");
      newItem.setAttribute("id","music-"+ i);
      newItem.setAttribute("onclick", "playSong("+ i +");");
      var newItemP = document.createElement("p");
      newItemP.innerHTML = data[i].artist + " - " + data[i].title;
      newItem.appendChild(newItemP);
      console.log(newItem);
      document.getElementById("music-list").appendChild(newItem);
      songs[i] = data[i].file;
      songCount++;
    }
    console.log(musicFiles);
  }
  else {
    var newItem = document.createElement("div");
    newItem.setAttribute("class", "music-item");
    var newItemP = document.createElement("p");
    newItemP.innerHTML = "No music was found.<br>Add some to the music folder to display it here!";
    newItem.appendChild(newItemP);
    console.log(newItem);
    document.getElementById("music-list").appendChild(newItem);
    console.log("No music found!");
  }
})
.catch(err => {
  console.log(err);
  var newItem = document.createElement("div");
  newItem.setAttribute("class", "music-item");
  var newItemP = document.createElement("p");
  newItemP.innerHTML = "An Error happened. Probably couldn't read music folder.";
  newItem.appendChild(newItemP);
  console.log(newItem);
  document.getElementById("music-list").appendChild(newItem);
  console.log("No music found!");
});


async function addMusic()
{
  var audioInfo;

  var url = document.getElementById("addUrl").value;
  var name = document.getElementById("addName").value.replace("&", "and");
  var button = document.getElementById("addButton");
  button.innerHTML = "Downloading and adding...";

  var stream = ytdl(url);

  //var mp4 = './'+name+'.mp4';
  var mp3 = pathDir+name+'.mp3';


  var proc = new ffmpeg({source:stream});
  proc.setFfmpegPath('./resources/app/src/ffmpeg.exe');
  proc.saveToFile(mp3, (stdout, stderr) => {
    if (stderr) {
      return console.log(stderr);
    }
    //Add file to music browser
    return console.log('Download complete!');
  });



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
  console.log(newItem);
  document.getElementById("music-list").appendChild(newItem);
  songs[songCount] = file;
  songCount++;

  // Get ID:
  // ytdl.getURLVideoID(url)
  // Video Image URL
  // http://i3.ytimg.com/vi/ ID /maxresdefault.jpg
}
