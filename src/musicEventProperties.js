class VisualizerProperties {
  static r = 25;
  static g = 0;
  static b = 250;

  static toR = 25;
  static toG = 0;
  static toB = 250;
  static rgb(r = this.r, g = this.g, b = this.b)
  {
    this.toR = r;
    this.toG = g;
    this.toB = b;
    return {
      r:r,
      g:g,
      b:b
    };
  }
}

setInterval(function () {
  if (VisualizerProperties.r != VisualizerProperties.toR) {
    VisualizerProperties.r -= ((VisualizerProperties.r - VisualizerProperties.toR)/100);
  }
  if (VisualizerProperties.g != VisualizerProperties.toG) {
    VisualizerProperties.g -= ((VisualizerProperties.g - VisualizerProperties.toG)/100);
  }
  if (VisualizerProperties.b != VisualizerProperties.toB) {
    VisualizerProperties.b -= ((VisualizerProperties.b - VisualizerProperties.toB)/100);
  }
}, 1);
