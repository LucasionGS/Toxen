/**
 * A custom context menu class with clickable functions.
 */
class ContextMenu
{
  static ActionsFormat = 
  [
    {
      /**
       * The display name of the action.
       * @type {(ref: HTMLElement) => string}
       */
      "name": "",

      /**
       * The click event that will happen once the user clicks on the action.
       * @type {(ev: MouseEvent, ref: HTMLElement, btnClicked: HTMLDivElement) => void}
       */
      "click": function(ev, ref, btnClicked) {},

      /**
       * Set to a function that will have the specific action button parsed as a parameter and you can run an event on it, like modifiying it, before it gets used.
       * @type {(actionBtn: HTMLDivElement) => void}
       */
      "runOnThis": function(actionBtn) {},

      /**
       * The type of action button this is.
       * @type {"click" | "checkbox"}
       */
      "type": "click",
      
      /**
       * This is only valid if ``type`` is set to``checkbox``.
       * Marks if the checkbox is checked or not by default.
       * @type {boolean}
       */
      "checked": false
    }
  ];

  /**
   * @type {ContextMenu.ActionsFormat}
   */
  actions = [];

  /**
   * Create a new custom context menu.
   * @param {ContextMenu.ActionsFormat} actions The list of available actions. If ``click`` is missing, it will act as a non-clickable label.
   */
  constructor(actions) {
    this.actions = actions;
    const menu = document.createElement("div");
    this.menu = menu;
    menu.i = this;


    if (!ContextMenu.initialized) {
      window.addEventListener("keydown", function(e) {
        if (e.key == "Escape") {
          menu.i.hide();
        }
      }, false);
      window.addEventListener("mousemove", function(e) {
        ContextMenu.cursorPos = {
          x: e.clientX,
          y: e.clientY
        };
      }, false);
    }

    menu.className = "ion_contextMenu";

    menu.addEventListener("mouseover", function(e) {
      menu.toggleAttribute("hovering", true);
    }, false);

    menu.addEventListener("mouseout", function(e) {
      menu.toggleAttribute("hovering", false);
    }, false);

    this.reloadActions(actions);
    menu.style.opacity = 1;

    setInterval(() => {
      if (!menu.hasAttribute("hovering")) {
        if (menu.style.opacity != "0") {
          menu.style.opacity = (+menu.style.opacity - 0.008).toString();
        }
        if (+menu.style.opacity <= "0") {
          menu.style.opacity = "0";
          this.hide();
        }
      }
      else {
        if (menu.style.opacity != "1") {
          menu.style.opacity = (+menu.style.opacity + 0.1).toString();
        }
        if (+menu.style.opacity > "1") {
          menu.style.opacity = "1";
        }
      }
    }, 10);
  }

  /**
   * An object reference if it has been set.
   * @type {HTMLElement}
   */
  reference;

  /**
   * If you've changed the ``actions`` variable, you want to run this.
   */
  reloadActions(actions = this.actions) {
    if (this.menu.children.length > 0) {
      this.menu.innerHTML = "";
    }
    var styling = document.createElement("style");
    styling.innerHTML = `
    div.ion_contextMenu{
      position: absolute;
      max-width: 256px;
      background: #1b1b1b;
      color: white;
      border-style: solid;
      border-width: 2px;
      border-color: white;
      z-index: 10000;
    }

    div.ion_menuEntry{
      padding: 4px;
      user-select: none;
    }

    div.ion_menuEntry[checked]{
      /* background-color: lightgreen; */
    }

    div.ion_menuEntry:hover{
      background: #5b5b5b;
      cursor: pointer;
    }

    div.ion_menuEntry.ion_label{
      text-align: center;
    }
    
    div.ion_menuEntry.ion_label:hover{
      background: #1b1b1b;
      cursor: not-allowed;
    }

    div.ion_menuEntry div.checkboxTick{
      width: 18px;
      height: 18px;
      border-radius: 20px;
      background-color: white;
      opacity: 0.75;
      float: right;
    }

    div.ion_menuEntry[checked] div.checkboxTick{
      background-color: lightgreen;
      opacity: 1;
    }
    `;

    this.menu.appendChild(styling);

    var inst = this;
    for (let i = 0; i < actions.length; i++) {
      const action = actions[i];
      const div = document.createElement("div");
      div.className = "ion_menuEntry";
      div.innerHTML = action.name;
      
      if (action.type && action.type == "checkbox") {
        if (action.checked) {
          div.toggleAttribute("checked", true);
        }
        const cBox = document.createElement("div");
        cBox.className = "checkboxTick";
  
        div.appendChild(cBox);

        div.title = "\""+action.name+"\" is "+div.hasAttribute("checked")+".";
      }

      if (typeof action.click == "function") {
        div.onclick = function(e) {
          action.click(e, inst.reference, e.target);
          if (action.type == "checkbox") {
            div.toggleAttribute("checked");
            div.title = "\""+action.name+"\" is "+div.hasAttribute("checked")+".";
          }
          inst.hide();
        };
      }
      else {
        div.classList.add(["ion_label"]);
        div.style.borderBottomStyle = "solid";
        div.style.borderBottomWidth = "1px";
        div.style.borderBottomColor = "#3b3b3b";

        div.style.borderTopStyle = "solid";
        div.style.borderTopWidth = "1px";
      }

      if (typeof action.runOnThis == "function") {
        action.runOnThis(div);
      }

      this.menu.appendChild(div);
    }
  }

  /**
   * This tells whether or not the first ContextMenu has been initialized or not.  
   * Do not modify this manually.
   */
  static initialized = false;

  /**
   * Current position of the cursor.
   */
  static cursorPos = {
    x: 0,
    y: 0,
  }

  /**
   * Where the Context menu should appear when ``show()`` is executed.
   * @type {"cursor" | "element" | "topleft" | [number, number]}
   */
  displayAt = "cursor";

  /**
   * Show the menu
   * @param {HTMLElement} element
   */
  show(element) {
    this.menu.style.display = "block";
    /**
     * @type {this}
     */
    var inst = element.i;
    if (element) {
      this.reference = element;
    }
    else {
      this.reference = undefined;
    }
    // if (this.displayAt == "cursor") // Enable when other types are supported >_>
    {
      this.menu.style.opacity = 1;
      document.body.appendChild(this.menu);
      this.menu.style.left = (ContextMenu.cursorPos.x-8).toString()+"px";
      this.menu.style.top = (ContextMenu.cursorPos.y-8).toString()+"px";
    }
  }
  
  /**
   * Hide the menu
   */
  hide() {
    try {
      this.menu.parentElement.removeChild(this.menu);
    }
    catch {}
  }

  /**
   * Attach a context menu to an element.  
   * It will add an ``Eventlistener`` for ``contextMenu``
   * @param {HTMLElement} element
   * @param {ContextMenu} contextMenu
   */
  static attachContextMenu(element, contextMenu) {
    element.addEventListener("contextmenu", function(e) {
      e.preventDefault();
      contextMenu.show(element);
    }, false);
    return element;
  }

  /**
   * Attach this context menu to an element.  
   * It will add an ``Eventlistener`` for ``contextMenu``
   * @param {HTMLElement} element
   */
  attachContextMenu(element) {
    return ContextMenu.attachContextMenu(element, this);
  }
}

/**
 * Popup Notification with customizable content.
 */
class Popup {
  // Transition time
  deltaMoveTime = 300;
  /**
   * Create a new Popup.
   * @param {string} title The header of the popup.
   * @param {string | any[]} message A longer message inside of the popup. This can be plain text or an array of mixed strings and HTML objects.
   * @param {number} dieAfter Automatically closes the popup after ``dieAfter`` milliseconds.
   */
  constructor(title, message, dieAfter)
  {
    if (document.querySelector("#PopupStylingObject") == null) {
      // console.log("Styling not made, adding default.");
      Popup.addStyle();
    }
    // Variable check
    if (!message) {
      message = "";
    }

    // Object creation
    /**
     * Object of the notification.
     */
    var mainDiv = document.createElement("div");
    /**
     * Title object
     */
    var h1 = document.createElement("h1");
    /**
     * Description object
     */
    var p = document.createElement("p");
    var button = document.createElement("a");
    /**
     * Button object
     */
    var button_div = document.createElement("div");
    var button_div_p = document.createElement("p");
    var button_divExit = document.createElement("div");
    var button_divExit_p = document.createElement("p");
    // Settings
    mainDiv.setAttribute("class","_notification");
    h1.innerHTML = title;

    // Use of text or object[]?
    if (typeof message == "string" || typeof message == "number") {
      p.innerHTML = message;
    }
    else if (typeof message == "object") {
      p.innerHTML = "";
      for (var i = 0; i < message.length; i++) {
        if (typeof message[i] == "string" || typeof message[i] == "number") {
          if (message.length > 1 && (typeof message[i-1] == "string" || typeof message[i-1] == "number")) {
            p.innerHTML += "<br>"+message[i];
          }
          else {
            p.innerHTML += message[i];
          }
        }
        else if (typeof message[i] == "object") {
          p.appendChild(message[i]);
        }
      }
    }

    p.setAttribute("class", "notifText");
    button_div.onclick = function () {
      mainDiv.close();
    }
    button_divExit.onclick = function () {
      mainDiv.close();
    }
    button_div.setAttribute("class", "_notificationButton");
    button_div.setAttribute("id", "_doneNotificationButton");
    button_div_p.innerHTML = "Done";

    button_divExit.setAttribute("class", "_notificationExitButton");
    button_divExit.setAttribute("id", "_notificationExitButton");
    button_divExit_p.innerHTML = "X";

    button_div.setText = function (text) {
      button_div_p.innerHTML = text;
    }

    // Merging
    mainDiv.appendChild(h1);
    mainDiv.appendChild(p);
    button_divExit.appendChild(button_divExit_p);
    mainDiv.appendChild(button_divExit);
    // Add a button if dieAfter time hasn't been set. Button will close the notification
    if (!dieAfter) {
      button_div.appendChild(button_div_p);
      button.appendChild(button_div);
      mainDiv.appendChild(button);
    }

    // Finalizing
    document.getElementsByTagName("body")[0].appendChild(mainDiv);
    setTimeout(function () {
      mainDiv.setAttribute("action", "open");
    }, 0);
    if (dieAfter > 0) {
      setTimeout(function () {
        mainDiv.close();
      }, dieAfter);
    }

    mainDiv.instance = this;
    mainDiv.close = function () {
      Popup.closeByObject(this);
    }

    // Return the object
    this.object = mainDiv;
    this.titleObject = h1;
    this.descriptionObject = p;
    this.buttonObject = button_div;
    this.exitObject = button_divExit;
  }

  // Random method to return a random integer from min to max
  static randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1) ) + min;
  }

  // Extra Initialize function for those who expect it instead of addStyle
  static Initialize = Popup.addStyle;

  static StyleOptions = {
    /**
     * The color theme the popups will have.
     * @type { "light" | "dark" }
     */
    "theme": "light",
    /**
     * Distance from the top of the screen.
     * Can be CSS style string or an integer for pixels.
     * @type { number | string }
     */
    "top": "",
    /**
     * Milliseconds for the popups to transition. (Appear and disappear)
     * @type { number }
     */
    "transitionTime": 300
  };

  /**
   * Adds styling to the document so the notification can be used.  
   * If it is not initialized before use, it will use default settings.
   * @param {Popup.StyleOptions} options 
   */
  static addStyle(options = {}) {
    // Default style settings
    const dVars = {
      top:"5%",
      minWidth: "512px",
      maxWidth: "768px",
      minHeight: "128px",
      textColor: "black",
      backgroundColor: "white",
      transition: "ease-out",
    };
    this.deltaMoveTime = 300;
    // Filter options
    if (typeof options == "object") {
      // Themes
      if (options.theme) {
        if (options.theme == "dark") {
          dVars.backgroundColor = "rgb(45, 45, 45)";
          dVars.textColor = "white";
        }
      }

      // Height the notification box goes down
      if (options.top) {
        if (options.top.match(/(\d+)%/g)) {
          dVars.top = options.top.match(/(\d+)%/g)[0];
        }
        else if (options.top.match(/(\d+)/g)) {
          dVars.top = options.top.match(/(\d+)/g)[0]+"px";
        }
      }

      // Transition animation
      if (options.transition) {
        if (options.transition.replace(/([\-\s]+)/g, "") == "easeinout") {
        dVars.transition = "ease-in-out";
        }
        else if (options.transition.replace(/([\-\s]+)/g, "") == "easein") {
          dVars.transition = "ease-in";
        }
        else if (options.transition.replace(/([\-\s]+)/g, "") == "easeout") {
          dVars.transition = "ease-out";
        }
      }

      // Transition time
      if (options.transitionTime) {
        if (typeof options.transitionTime == "number") {
          this.deltaMoveTime = options.transitionTime;
        }
      }
    }

    // Create style object
    const style = document.createElement("style");
    style.setAttribute("id", "PopupStylingObject");
    style.innerHTML = `
      div._notification{
        position: fixed;
        left: 50%;
        top: 0;
        transform:translate(-50%, -100%);
        min-width: ${dVars.minWidth};
        max-width: ${dVars.maxWidth};
        min-height: ${dVars.minHeight};
        margin: auto;
        background: ${dVars.backgroundColor};
        border-radius: 10px;
        box-shadow: 3px 3px 5px black;
        transition: all ${this.deltaMoveTime/1000}s ${dVars.transition};

      }
      div._notification h1, div._notification p{
        color: ${dVars.textColor};
        text-align: center;

      }
      div._notification p.notifText{
        padding: 5px;
        padding-bottom: 36px;
        white-space: pre-wrap;

      }
      div._notification[action="open"]{
        left: 50%;
        top: ${dVars.top};
        transform:translateX(-50%);

      }
      div._notification[action="close"]{
        left: 50%;
        top: -32px;
        transform: translate(-50%,-100%);

      }
      div._notificationButton{
        position: absolute;
        right: 0;
        width: 128px;
        height: 40px;
        transform: translateY(-100%);
        background: #259f00;
        border-radius: 10px;
        overflow: hidden;
        transition: all 0.1s ease-in-out;
      }

      div._notificationExitButton{
        position: absolute;
        font-size: 28px;
        top: 0;
        right: 0;
        width: 32px;
        height: 32px;
        background: red;
        border-radius: 10px;
        overflow: hidden;
        transition: all 0.1s ease-in-out;
      }

      div._notificationExitButton p{
        margin: 0;
        padding: 0;
      }
      div._notificationButton:hover, div._notificationExitButton:hover{
        cursor: pointer;
      }
      div._notificationButton p{
        user-select: none;
        margin: 0;
        text-align: center;
        color: white;
        width: 100%;
        transform: translateY(50%);

      }
    `;
    document.getElementsByTagName("html")[0].firstChild.appendChild(style);
  }

  makeUntouchable()
  {
    this.object.style.pointerEvents = "none";
  }

  /**
   * Assign the button new text.  
   * @param {string | false} text
   */
  setButtonText(text) {
    if (text == false) {
      this.buttonObject.querySelector("p").innerText = "";
      this.buttonObject.style.display = "none";
    }
    else {
      this.buttonObject.querySelector("p").innerText = text;
      this.buttonObject.style.display = "default";
    }
  }

  /**
   * Set to true if you want the button to show, and false if you want it to disappear.
   * @param {boolean} force 
   */
  toggleExitButton(force = undefined) {
    if (force != undefined && typeof force == "boolean") {
      this.exitObject.hidden = !force;
    }
    else {
      this.exitObject.hidden = !this.exitObject.hidden;
    }
  }

  /**
   * Close current object
   */
  close()
  {
    this.makeUntouchable();
    Popup.closeByObject(this.object);
  }

  /**
   * Close the top-most open notification.
   */
  static closeNewest()
  {
    var id = document.querySelectorAll("._notification[action='open']").length-1;
    document.getElementsByClassName("_notification")[id].instance.makeUntouchable();
    document.getElementsByClassName("_notification")[id].setAttribute("action", "close");
    setTimeout(function () {
      document.getElementsByClassName("_notification")[id]
      .parentNode.removeChild(
        document.getElementsByClassName("_notification")[id]
        );
      }, this.deltaMoveTime);
  }

  /**
   * Close a notification by ID.
   * @param {number} id The ID of the visible notification objects.
   */
  static closeById(id)
  {
    if (typeof id != "number") {
      throw "No valid id was provided.";
      // id = document.getElementsByClassName("_notification").length-1;
    }
    document.getElementsByClassName("_notification")[id].instance.makeUntouchable();;
    document.getElementsByClassName("_notification")[id].setAttribute("action", "close");
    setTimeout(function () {
      document.getElementsByClassName("_notification")[id]
      .parentNode.removeChild(
        document.getElementsByClassName("_notification")[id]
      );
    }, this.deltaMoveTime);
  }

  /**
   * Close a notification by it's specific object.
   * @param {HTMLElement} element The HTML element to close.
   */
  static closeByObject(element)
  {
    element.setAttribute("action", "close");
    setTimeout(function () {
      try {
        element.parentNode.removeChild(element);
      }
      catch (e) {}
    }, this.deltaMoveTime);
    element.instance.makeUntouchable();
  }
}

/**
 * WORK IN PROGRESS  
 * Extra JSON functions to modify and use JSON objects.
 */
class EJSON{
  /**
   * Sort a JSON Object alphabetically.
   * @param {[{}]} json The JSON Object to sort.
   * @param {string} sortValue The variable inside the JSON Object to sort by.
   */
  static sort(json, sortValue) {
    json.sort((a, b) => {
      a = a[sortValue].toLowerCase();
      b = b[sortValue].toLowerCase();
    
      return (a < b) ? -1 : (a > b) ? 1 : 0;
    });
    return json;
  }
}

class HTMLObjects
{
  static swapPlacement(element1, element2) {
    var elm1Sib = element1.nextSibling;
    element1.parentNode.insertBefore(element1, element2);
    element2.parentNode.insertBefore(element2, elm1Sib);
  }
}

/**
 * WORK IN PROGRESS  
 * Item List
 */
class ItemList
{
  /**
   * 
   * @param {ItemList.ListFormat} items 
   */
  constructor(items) {
  }

  /**
   * @type {[{"text": string}]}
   */
  static ListFormat = [
    {
      "text": ""
    }
  ];
}

class Path
{
  /**
   * Returns the basename of a path.
   * @param {string} path Path to a file/folder.
   */
  static basename(path){
    path = path.replace(/\\/g, "/");
    return path.split("/").pop();
  }

  /**
   * Returns the basename of a path.
   * @param {string} path Path to a file/folder.
   */
  static getPath(path) {
    path = path.replace(/\\/g, "/");
    var pathParts = path.split("/");
    pathParts.pop();
    return pathParts.join("/");
  }
}

class Web
{
  /**
   * Get a parameter's value from a GET request.
   * @param {string} param The parameter's name to get.
   */
  static getGETParameter(param) {
    var result = null,
        tmp = [];
    location.search
    .substr(1)
    .split("&")
    .forEach(function (item) {
      tmp = item.split("=");
      if (tmp[0] === param) {
        result = decodeURIComponent(tmp[1]);
      }
    });
    return result;
  }
}

// Exports
try {
  exports.ContextMenu = ContextMenu;
  exports.Popup = Popup;
  exports.EJSON = EJSON;
  exports.HTMLObjects = HTMLObjects;
  exports.Path = Path;
  exports.Web = Web;
} catch {}