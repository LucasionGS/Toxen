//Create subtitle box for spawning and displaying
setTimeout(function () {
  var subBox = document.createElement("div");
  var subBoxText = document.createElement("p");
  subBox.setAttribute("id", "subBox");
  subBox.setAttribute("class", "subBox");
  subBoxText.setAttribute("id", "subBoxText");
  subBoxText.setAttribute("class", "subBoxText");
  subBoxText.innerHTML = "";

  subBox.appendChild(subBoxText);
  document.getElementsByTagName("body")[0].appendChild(subBox);
}, 1);

function ParseSrt(song)
{
  var srtPath = song.file.substring(0, song.file.length - 4)+".srt";
  try {
    var srtText = fs.readFileSync(srtPath, "utf8");
  } catch (e) {
    return false;
  }
  var subData = [];
  //Parsing
  var lines = srtText.split("\n");

  for (var i = 0; i < lines.length; i++) {
    var newSub = {
      "id":-1,
      "startTime":-1,
      "endTime":-1,
      "text":""
    };
    if (lines[i] == "") {
      continue;
    }
    if (!isNaN(lines[i])) {
      //Set ID
      newSub.id = +lines[i];
      i++;

      //Set timestamps
      var timeStamps = lines[i].split("-->");
      //startTime
      var ints = timeStamps[0].split(",", 1)[0].split(":");
      newSub.startTime = ((+ints[0]*60*60)+(+ints[1]*60)+(+ints[2])+(+timeStamps[0].split(",", 2)[1]/1000));

      //endTime
      ints = timeStamps[1].split(",", 1)[0].split(":");
      newSub.endTime = ((+ints[0]*60*60)+(+ints[1]*60)+(+ints[2])+(+timeStamps[1].split(",", 2)[1]/1000));
      i++;
      //Set texts
      while (lines[i] != "") {
        newSub.text += lines[i]+"\n";
        i++;
      }
      subData.push(newSub);
    }
  }

  //Returning
  return subData;
}

var subtitleInterval;
function RenderSubtitles(song) {
  var subData = ParseSrt(song);
  var subText = document.getElementById("subBoxText");
  subText.innerHTML = "";
  if (!subData) {
    return;
  }
  subtitleInterval = setInterval(function () {
    var hasSub = false;
    for (var i = 0; i < subData.length; i++) {
      if (audio.currentTime > subData[i].startTime && audio.currentTime < subData[i].endTime) {
        if (subText.innerHTML != subData[i].text) {
          subText.innerHTML = subData[i].text;
        }
        hasSub = true;
      }
      if (!hasSub) {
        subText.innerHTML = "";
      }
    }
  }, 5);
}
