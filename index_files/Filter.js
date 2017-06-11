class Filter {
  constructor (canvas, width, height) {
    this.canvas = canvas;
  }

  function(filter, image, ...args) {
    var args = [this.getPixels(image)];
    for (var i=2; i<arguments.length; i++) {
      args.push(arguments[i]);
    }
    return filter.apply(null, args);
  }
}