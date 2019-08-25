const fs = require("fs");
const ytdl = require("ytdl-core");
var otherWindow;
var settings;
setInterval(() => {
  try {
    settings = JSON.parse(fs.readFileSync("./settings.json", "utf8"));
  } catch (e) {
    settings = {
      //Add default settings if no file.
      "visualizer":true,
      "backgroundDim":50,
      "visualizerIntensity":15,
    }
  }
}, 250);
var allMusicData = [];
var pathDir;

//Loading music and other startup events
window.onload = function(){
  var musicFiles = [];
  otherWindow = document.getElementById("otherWindow");
  if (fs.existsSync("./musicFolder")) {
    pathDir = fs.readFileSync("./musicFolder", "utf8")+"/";
  }
  else {
    fs.writeFile("./musicFolder", "./music/", (err) => {
    });
    pathDir = "./music/";
  }
  pathDir = pathDir.replace("\\","/");

  var _musicFiles;
  try {
    _musicFiles = fs.readdirSync(pathDir);
  }
  catch (e) {
    notification("Invalid Folder", "The directory string in the \"musicFolder\" file doesn't exist.\nPlease change the content of musicFolder to an existing folder! Using current folder to prevent crash.\nThe file is in the same folder as the application folder.");
    _musicFiles = fs.readdirSync("./");
  }

  var musicJson = "[ ";
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
      //musicJson += '\n  {\n    "artist":"' + artist + '",\n    "title":"' + title + '",\n    "file":"' + file + '"\n  },';
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
    var newItemP = document.createElement("p");
    newItemP.innerHTML = "No music was found.<br>Add some to the music folder to display it here!";
    newItem.appendChild(newItemP);
    document.getElementById("music-list").appendChild(newItem);
    console.log("No music found!");
  }
  allMusicData = musicFiles;

  //Create drop area
  let dropArea = document.getElementsByTagName("body")[0];
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
  //console.log(newItem);
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
  //console.log(file);
  if (file.path.toLowerCase().endsWith(".jpg")) {
    var curId = document.getElementById("now-playing").getAttribute("playingid");
    var fileName = songs[curId].split("/")[songs[curId].split("/").length-1];
    fileName = fileName.substring(0,fileName.length-4);
    //console.log(fileName);
    //fs.createReadStream(file.path).pipe(fs.createWriteStream(pathDir+fileName+".jpg"));
    fs.copyFileSync(file.path, pathDir+fileName+".jpg");
    setTimeout(function () {
      setBG(songs[curId]);
    }, 1000);
  }
  else if (file.path.toLowerCase().endsWith(".mp3")) {
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
    notification("Copying music from file",file.name+" is being copied to your music folder. Wait a couple seconds before you click play on it.\n"+
    "Still working on getting it to just update when it's done copying...");
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
