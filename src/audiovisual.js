function VisualizerChangeSrc()
{

}

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


function Visualizer(){
  if (!document.getElementById("musicObject")) {
    return console.error("musicObject doesn't exist");
  }
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

    analyser.getByteFrequencyData(dataArray);

    ctx.fillStyle = "rgba(0, 0, 0, "+(settings.backgroundDim/100)+")";
    ctx.fillRect(0, 0, WIDTH, HEIGHT);
    var intensity = settings.visualizerIntensity/10;
    if (settings.visualizer) {
      for (var i = 0; i < bufferLength; i++) {
        barHeight = (dataArray[i]*intensity-(10*intensity));

        var r = VisualizerProperties.r;
        var g = VisualizerProperties.g;
        var b = VisualizerProperties.b;

        ctx.fillStyle = "rgba(" + r + "," + g + "," + b + ", " + 0.3 + ")";
        ctx.fillRect(x, HEIGHT - barHeight, barWidth, barHeight);

        x += barWidth + 1;
      }
    }
  }
  audio.play();
  renderFrame();
}
