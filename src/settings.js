const fs = require('fs');
const preset = JSON.parse(fs.readFileSync("./settings.json", "utf8"));
const options = document.getElementsByClassName("setting");
window.onload = function()
{
  event_bgdim(-1);
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
  console.log(preset);
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
      jOptions[_options[i].name] = _options[i].value;
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

function event_bgdim(value)
{
  document.getElementById("bgdim").innerHTML = "Background Dim: "+document.getElementById("bgdimslider").value+"%";
  if (value == -1) {
    document.getElementById("bgdim").innerHTML = "Background Dim: "+preset["backgroundDim"]+"%";
  }
}
