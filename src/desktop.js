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
