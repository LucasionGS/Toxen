/*window.onload = function() {
  document.getElementById("musicObject");
}*/

function Visualizer(){
  audio = document.getElementById("musicObject")
  //audio.load();
  audio.play();
  var context = new AudioContext();
  var src = context.createMediaElementSource(audio);
  var analyser = context.createAnalyser();
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

    ctx.fillStyle = "rgba(9, 9, 9, 0.5)";
    ctx.fillRect(0, 0, WIDTH, HEIGHT);

    for (var i = 0; i < bufferLength; i++) {
      barHeight = (dataArray[i]*1.5)-50;

      var r = barHeight + (25 * (i/bufferLength));
      var g = 0 * (i/bufferLength);
      var b = 250 - (barHeight/5);

      ctx.fillStyle = "rgba(" + r + "," + g + "," + b + ", 0.5)";
      ctx.fillRect(x, HEIGHT - barHeight, barWidth, barHeight);

      x += barWidth + 1;
    }
  }

  audio.play();
  renderFrame();
}
