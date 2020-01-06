const { app, BrowserWindow, Menu, Tray } = require('electron');
const process = require('child_process');
const fs = require('fs');
const winWidth = 1280;
const winHeight = 768;
// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let win;
let usageWin;

function createWindow () {
  // Create the browser window.
  win = new BrowserWindow({
    title:"Toxen",
    minWidth: 400,
    minHeight: 384,
    width: winWidth,
    height: winHeight,
    webPreferences: {
      nodeIntegration: true
    },
    show:false
  });

  try {
    win.setIcon("./icon.ico");
  } catch (error) {
    console.error("No icon accessible");
  }

  win.once('ready-to-show', () => {
    //This will prevent the white startup screen before the page loads in fully
    win.show();
  });

  var menu = Menu.buildFromTemplate([
    {
      label:"Music Player",
      click(){
        win.loadFile('index.html');
        //console.log("Open Music Player");
      },
      accelerator: "F1"
    },
    {
      label:"Dev",
      click(){
        win.webContents.openDevTools();
      },
      accelerator: "F12"
    },
    {
      label:"Usage",
      click(){
        //Open github page
        process.exec('start "" "https://github.com/LucasionGS/Toxen/blob/alpha/README.md"');
      }
    },
    {
      label:"Exit",
      click(){
        app.quit();
      }
    }
  ]);
  Menu.setApplicationMenu(menu);

  // and load the index.html of the app.
  win.loadFile('index.html');

  // Open the DevTools.
  //win.webContents.openDevTools()

  // Emitted when the window is closed.
  win.on('closed', () => {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    win = null;
  });

  /*win.on('minimize', function(event){
      event.preventDefault();
      win.hide();
    });*/

    var appIcon = null;
    try {
      appIcon = new Tray("./icon.ico");
      var contextMenu = Menu.buildFromTemplate([
        {
          label: "Restore",
          type: "radio",
          click(){
            win.show();
          }
        },
        {
          label: "Quit",
          type: "radio",
          click(){
            app.quit();
          }
        }
      ]);
      appIcon.setToolTip("Toxen♫");
      appIcon.setContextMenu(contextMenu);

      appIcon.on("click", () => {
        win.show();
      });
    } catch (error) {}

}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow);

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (win === null) {
    createWindow();
  }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
