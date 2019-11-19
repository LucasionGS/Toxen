

class Control{
  static startEventCheckingInterval = undefined;
  static startEventChecking(){
    if (Control.startEventCheckingInterval == undefined) {
      Control.startEventCheckingInterval = setInterval(() => {
        for (let i = 0; i < Control.functionEvents.length; i++) {
          const event = Control.functionEvents[i];
          if (Control.musicObject.currentTime > event.startPoint && Control.musicObject.currentTime < event.endPoint) {
            event.active = true;
          }

          if (Control.musicObject.currentTime < event.startPoint || Control.musicObject.currentTime > event.endPoint) {
            event.active = false;
            event.hasRun = false;
          }
          
          if (event.active && !event.hasRun) {
            event.hasRun = true;
            event.fn();
          }
        }
      }, 1);
    }
  }

  /**
   * @type {FunctionEvent[]}
   */
  static functionEvents = [];
  
  static VisualizerProperties = VisualizerProperties;

  /**
   * The music HTML element
   */
  static musicObject = document.querySelector("#musicObject");
  /**
   * Change the background
   */
  static setBackground = setBG;
  /**
   * Run a function after a specified amount of time into the song.  
   * Timestamp format is "hh:mm:ss.decimal"
   * @param {number|string} startPoint The point in number of seconds(or string timestamp, both can include decimal) into the song this event should be activated.
   * @param {number|string} endPoint The point in number of seconds(or string timestamp, both can include decimal) into the song this event should stop being activated.
   * @param {Function} fn The function to execute.
   */
  static runOnceDuring(startPoint, endPoint, fn)
  {
    if (typeof startPoint == "string") {
      startPoint = timeStampToSeconds(startPoint);
      console.log(startPoint);
    }
    if (typeof endPoint == "string") {
      endPoint = timeStampToSeconds(endPoint);
      console.log(endPoint);
    }
    if (typeof fn != "function") {
      return console.error("Parameter fn must be a function");
    }
    Control.functionEvents.push(new FunctionEvent(startPoint, endPoint, fn))

    /**
     * Convert a timestamp into seconds.
     * @param {string} timestamp Time in format "hh:mm:ss".
     */
    function timeStampToSeconds(timestamp)
    {
      var seconds = 0;
      var parts = timestamp.split(":");
      for (let i = 0; i < parts.length; i++) {
        const time = +parts[i];
        let x = parts.length-i-1;
        if (x == 0) {
          seconds += time;
        }
        if (x == 1) {
          seconds += time*60;
        }
        if (x == 2) {
          seconds += time*60*60;
        }
        if (x == 3) {
          seconds += time*60*60*24;
        }
      }

      return seconds;
    }
  }

}

class FunctionEvent{
  constructor(startPoint, endPoint, fn)
  {
    this.startPoint = startPoint;
    this.endPoint = endPoint;
    this.fn = fn;
    this.active = false;
    this.hasRun = false;
  }
}

try {
  // Exports
  exports.Control = Control;
} catch (error) {
  if (error.toString() != "ReferenceError: exports is not defined") {
    console.error(error);
  }
}
