var _context = new AudioContext();
var _src;
var analyser;
var _contextSrcInterval = setInterval(function () {
  if (document.getElementById("musicObject")) {
    _src = _context.createMediaElementSource(document.getElementById("musicObject"));
    analyser = _context.createAnalyser();
    clearInterval(_contextSrcInterval);
  }
}, 0);

var avg = 0;
var avgSec = 0;
var visualizerActive = false;
var dim = 0;
function Visualizer(){
  dim = settings.backgroundDim;
  if (!document.getElementById("musicObject")) {
    return console.error("musicObject doesn't exist");
  }
  if (visualizerActive) {
    return;
  }
  visualizerActive = true;
  audio = document.getElementById("musicObject");
  //audio.load();
  //audio.play();
  //console.log(_context);
  //console.log(HTMLMediaElement);
  var canvas = document.getElementById("canvas");
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  var ctx = canvas.getContext("2d");


  _src.connect(analyser);
  analyser.connect(_context.destination);

  analyser.fftSize = 512;

  var bufferLength = analyser.frequencyBinCount;
  //console.log(bufferLength);

  var dataArray = new Uint8Array(bufferLength);

  var WIDTH = canvas.width;
  var HEIGHT = canvas.height;

  var barWidth = (WIDTH / bufferLength) * 2.5;
  var barHeight;
  var x = 0;

  function renderFrame() {
    requestAnimationFrame(renderFrame);
    ctx.clearRect(0, 0, WIDTH, HEIGHT);
    x = 0;
    dim = +dim;
    if (avg > 65) {
      // console.log("beat!");
      if (dim > +settings.backgroundDim-(+avg - 70)) {
        dim -= 1;
        // console.log(dim);
      }
      if (dim < +settings.backgroundDim-(+avg - 70)) {
        dim += 1;
      }
    }
    else {
      if (dim < +settings.backgroundDim) {
        dim += 2;
      }
      if (dim > +settings.backgroundDim) {
        dim -= 1;
      }
    }

    analyser.getByteFrequencyData(dataArray);

    ctx.fillStyle = "rgba(0, 0, 0, "+(dim/100)+")";
    ctx.fillRect(0, 0, WIDTH, HEIGHT);
    var intensity = settings.visualizerIntensity/10;
    if (settings.visualizer) {
      avg = 0;
      for (var i = 0; i < bufferLength; i++) {
        barHeight = (dataArray[i]*intensity-(10*intensity));
        
        var r = VisualizerProperties.r;
        var g = VisualizerProperties.g;
        var b = VisualizerProperties.b;
        
        ctx.fillStyle = "rgba(" + r + "," + g + "," + b + ", " + 0.3 + ")";
        ctx.fillRect(x, HEIGHT - barHeight, barWidth, barHeight);
        
        x += barWidth + 1;
        avg += dataArray[i];
      }
      avg /= bufferLength;
      // console.log(avg);
      avgSec += avg;
      avg -= settings.volume*0.5;
      // console.log(avg);
    }
    else {
      ctx.fillStyle = "rgba(0, 0, 0, "+(settigs.backgroundDim/100)+")";
      ctx.fillRect(0, 0, WIDTH, HEIGHT);
    }
  }
  setInterval(() => {
    // console.log(avgSec);
    avgSec = 0;
  }, 1000);
  audio.play();
  renderFrame();
}
