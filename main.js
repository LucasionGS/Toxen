const { app, BrowserWindow } = require('electron')
const fs = require('fs');
var musicDir;
var musicFiles = [];

if (fs.existsSync("./musicFolder")) {
  musicDir = fs.readFileSync("./musicFolder", "utf8");
  console.log(musicDir);
}
else {
  fs.writeFile("./musicFolder", "./music/", (err) => {
    //console.log("Created new file: musicFolder");
  });
  musicDir = "./music/";
}
console.log(musicDir);
musicDir = musicDir.replace("\\","/");

var _musicFiles;
try {
  _musicFiles = fs.readdirSync(musicDir);
}
catch (e) {
  console.log("The directory in the \""+musicDir+"\" file doesn't exist.\nPlease change the content of musicFolder to an existing folder! Using current folder to prevent crash.");
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
      file = musicDir+"/"+_title+".mp3";
    }
    else {
      artist = "Unknown";
      title = parts[0];
      file = musicDir+"/"+_title+".mp3";
    }
    musicJson += '\n  {\n    "artist":"' + artist + '",\n    "title":"' + title + '",\n    "file":"' + file + '"\n  },';
  }
}
musicJson = musicJson.substring(0, musicJson.length-1);
musicJson += "\n]";
console.log(musicFiles);
fs.writeFileSync("./musicList.json", musicJson);

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let win

function createWindow () {
  // Create the browser window.
  win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true
    }
  })

  // and load the index.html of the app.
  win.loadFile('index.html')

  // Open the DevTools.
  //win.webContents.openDevTools()

  // Emitted when the window is closed.
  win.on('closed', () => {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    win = null
  })
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow)

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (win === null) {
    createWindow()
  }
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
