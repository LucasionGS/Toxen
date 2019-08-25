setTimeout(function () {
  notification("Checking for updates...","", 1000);
}, 0);

function Make(tag){
  return document.createElement(tag);
}

function closeNotification()
{
  id = document.getElementsByClassName("_notification").length-1;
  document.getElementsByClassName("_notification")[id].setAttribute("action", "close");
  setTimeout(function () {
    document.getElementsByClassName("_notification")[id]
    .parentNode.removeChild(
      document.getElementsByClassName("_notification")[id]
    );
  }, 300);
}

function closeNotificationById(id)
{
  if (!id) {
    id = document.getElementsByClassName("_notification").length-1;
  }
  document.getElementsByClassName("_notification")[id].setAttribute("action", "close");
  setTimeout(function () {
    document.getElementsByClassName("_notification")[id]
    .parentNode.removeChild(
      document.getElementsByClassName("_notification")[id]
    );
  }, 300);
}

function closeNotificationByObject(object)
{
  object.setAttribute("action", "close");
  setTimeout(function () {
    object.parentNode.removeChild(object);
  }, 300);
}

function notification(title, message, dieAfter)
{
  //Object creation
  var mainDiv = Make("div");
  var h1 = Make("h1");
  var p = Make("p");
  var button = Make("a");
  var button_div = Make("div");
  var button_div_p = Make("p");
  //Settings
  mainDiv.setAttribute("class","_notification");
  h1.innerHTML = title;
  p.innerHTML = message;
  p.setAttribute("class", "notifText");
  button.href = "#back";
  button.setAttribute("onclick", 'closeNotification();');
  button_div.setAttribute("class", "Button");
  button_div.setAttribute("id", "doneButton");
  button_div_p.innerHTML = "Done";

  //Merging
  mainDiv.appendChild(h1);
  mainDiv.appendChild(p);
  if (!dieAfter) {
    button_div.appendChild(button_div_p);
    button.appendChild(button_div);
    mainDiv.appendChild(button);
  }

  //Finalizing
  document.getElementsByTagName("body")[0].appendChild(mainDiv);
  setTimeout(function () {
    mainDiv.setAttribute("action", "open");
  }, 0);
  if (dieAfter > 0) {
    setTimeout(function () {
      closeNotificationByObject(mainDiv);
    }, dieAfter);
  }
}
