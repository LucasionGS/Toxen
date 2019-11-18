

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
   * @param {number} startPoint The point in seconds(can include decimal) into the song this event should be activated.
   * @param {number} endPoint The point in seconds(can include decimal) into the song this event should stop being activated.
   * @param {Function} fn The function to execute.
   */
  static runOnceDuring(startPoint, endPoint, fn)
  {
    if (typeof fn != "function") {
      return console.error("Parameter fn must be a function");
    }
    Control.functionEvents.push(new FunctionEvent(startPoint, endPoint, fn))
  };
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
