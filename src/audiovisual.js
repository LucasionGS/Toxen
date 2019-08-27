function VisualizerChangeSrc()
{

}

function Visualizer(){
  audio = document.getElementById("musicObject");
  //audio.load();
  audio.play();
  var context = new AudioContext();
  var src = context.createMediaElementSource(audio);
  var analyser = context.createAnalyser();
  console.log(context);
  console.log(HTMLMediaElement);
  var canvas = document.getElementById("canvas");
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  var ctx = canvas.getContext("2d");


  src.connect(analyser);
  analyser.connect(context.destination);

  analyser.fftSize = 256;

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

        var r = barHeight + (25 * (i/bufferLength));
        var g = 0 * (i/bufferLength);
        var b = 250 - (barHeight/5);

        ctx.fillStyle = "rgba(" + r + "," + g + "," + b + ", 0.5)";
        ctx.fillRect(x, HEIGHT - barHeight, barWidth, barHeight);

        x += barWidth + 1;
      }
    }
  }
  audio.play();
  renderFrame();
}
