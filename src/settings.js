//const fs = require('fs');
var __proc = require('child_process');
var preset;
setTimeout(function () {
  document.getElementById("musicDir").setAttribute('placeholder', defaultMusicDir);
}, 1);
try {
  preset = JSON.parse(fs.readFileSync("./settings.json", "utf8"));
}
catch (e) {
  new Notif("No settings found", "It doesn't seem like you have set up your settings yet.\n"+
  "For this app to work, it's important you select a music folder (A folder that already exists)\n"+
  "");
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
  } catch (error) {
    //new Notif("Error", error);
  }
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
