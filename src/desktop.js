const fs = require("fs");
const ytdl = require("ytdl-core");
var allMusicData = [];
var pathDir;
console.log(pathDir);

//Loading music and other startup events
window.onload = function(){
  var musicFiles = [];

  if (fs.existsSync("./musicFolder")) {
    pathDir = fs.readFileSync("./musicFolder", "utf8")+"/";
    console.log(pathDir);
  }
  else {
    fs.writeFile("./musicFolder", "./music/", (err) => {
      //console.log("Created new file: musicFolder");
    });
    pathDir = "./music/";
  }
  console.log(pathDir);
  pathDir = pathDir.replace("\\","/");

  var _musicFiles;
  try {
    _musicFiles = fs.readdirSync(pathDir);
  }
  catch (e) {
    alert("The directory string in the \"musicFolder\" file doesn't exist.\nPlease change the content of musicFolder to an existing folder! Using current folder to prevent crash.\nThe file is in the same folder as the application folder.");
    _musicFiles = fs.readdirSync("./");
  }

  var musicJson = "[ ";
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
      musicJson += '\n  {\n    "artist":"' + artist + '",\n    "title":"' + title + '",\n    "file":"' + file + '"\n  },';
    }
  }
  musicJson = musicJson.substring(0, musicJson.length-1);
  musicJson += "\n]";
  //console.log(musicFiles);
  //console.log(musicJson);

  //Inserting music

  musicFiles = JSON.parse(musicJson);
  console.log(musicFiles);
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
    var newItemP = document.createElement("p");
    newItemP.innerHTML = "No music was found.<br>Add some to the music folder to display it here!";
    newItem.appendChild(newItemP);
    document.getElementById("music-list").appendChild(newItem);
    console.log("No music found!");
  }
  allMusicData = musicFiles;

  //Create drop area
  let dropArea = document.getElementsByTagName("body")[0];
  console.log(dropArea);
  dropArea.addEventListener('drop', fileDropped, false);
  //dropArea.addEventListener('dragenter', handlerFunction, false);
  //dropArea.addEventListener('dragleave', handlerFunction, false);
  dropArea.addEventListener('dragover', function(event){
    event.stopPropagation();
    event.preventDefault();
  }, false);
}

function addMusic()
{
  var audioInfo;

  var url = document.getElementById("addUrl").value;
  var name = document.getElementById("addName").value/*.replace("&", "and")*/;
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

//Insert picture drop-in areas

function fileDropped(e)
{
  e.stopPropagation();
  e.preventDefault();
  let dt = e.dataTransfer;
  let files = dt.files;
  //alert("You dropped in a file!");
  var file = files[0];
  console.log(file);
  if (file.path.endsWith(".jpg")) {
    var curId = document.getElementById("now-playing").getAttribute("playingid");
    var fileName = songs[curId].split("/")[songs[curId].split("/").length-1];
    fileName = fileName.substring(0,fileName.length-4);
    console.log(fileName);
    //fs.createReadStream(file.path).pipe(fs.createWriteStream(pathDir+fileName+".jpg"));
    fs.copyFileSync(file.path, pathDir+fileName+".jpg");
    setTimeout(function () {
      setBG(songs[curId]);
    }, 1000);
  }
  else {
    alert("You can only drop in a .jpg file!");
  }
}
