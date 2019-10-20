const fs = require('fs');
var proc = require('child_process');
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
window.onload = function()
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
  //console.log(preset);
}

function applySettings()
{
  const _options = document.getElementsByClassName("setting");
  var jOptions = {};
  console.log(_options);
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
  console.log(strOptions);
  fs.writeFileSync("./settings.json", strOptions);

  var button = document.getElementById("applyButton");
  button.innerHTML = "<p>Applied!</p>";
  document.getElementById("backButton").innerHTML = "<p>Close</p>";
  setTimeout(function () {
    button.innerHTML = "<p>Apply</p>";
  }, 2000);
}

function event_sliderUpdate(value)
{
  //New Setting
  document.getElementById("bgdim").innerHTML = "Background Dim: "+document.getElementById("bgdimslider").value+"%";
  document.getElementById("visualintense").innerHTML = "Visualizer Intensity: "+document.getElementById("visualizerintensity").value;
  if (value == -1) { //Default setting
    document.getElementById("bgdim").innerHTML = "Background Dim: "+preset["backgroundDim"]+"%";
    document.getElementById("visualintense").innerHTML = "Visualizer Intensity: "+preset["visualizerIntensity"];
  }
}

function openMusicFolder(){
  var _url = document.getElementById("musicDir").value.replace(/\\/g,"\\\\");
  if (_url == "") {
    //_url = document.getElementById("musicDir").getAttribute("placeholder").replace("\\","\\\\")
    _url = defaultMusicDir;
  }
  while (_url.startsWith("/") || _url.startsWith("\\")) {
    _url = _url.substring(1);
  }
  proc.exec('start "" "'+_url+'"');
}
