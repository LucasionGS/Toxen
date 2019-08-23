const fs = require('fs');
const preset = JSON.parse(fs.readFileSync("./settings.json", "utf8"));
const options = document.getElementsByClassName("setBox");
window.onload = function()
{
  for (var i = 0; i < options.length; i++) {
    for (var key in preset) {
      if (options[i].getAttribute("name") == key) {
        if (preset[key] == true) {
          options[i].setAttribute("checked", true);
        }
        else {
          options[i].removeAttribute("checked");
        }
      }
    }
  }
  console.log(preset);
}

function applySettings()
{
  const _options = document.getElementsByClassName("setBox");
  var jOptions = {};
  console.log(_options);
  for (var i = 0; i < _options.length; i++) {
    console.log(_options[i].name);
    console.log(_options[i].checked);
    jOptions[_options[i].name] = _options[i].checked;
  }
  var strOptions = JSON.stringify(jOptions);
  console.log(strOptions);
  fs.writeFileSync("./settings.json", strOptions);

  var button = document.getElementById("applyButton");
  button.innerHTML = "<p>Applied!</p>";
  document.getElementById("backButton").innerHTML = "<p>Back</p>";
  setTimeout(function () {
    button.innerHTML = "<p>Apply</p>";
  }, 2000);
}
