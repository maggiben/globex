import * as THREE from 'three';
import * as TWEEN from 'tween';
import * as tooloud from 'tooloud';

export const noise = function (width, height, amount = 100) {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext('2d');
  for(let x = 0; x < width; x++ ){
    for(let y = 0; y < height; y++ ){
      context.fillStyle = 'hsl(0, 0%, ' + ( amount - ( Math.random() * 15 ) ) + '%)';
      context.fillRect(x, y, 1, 1);
    }
  }
  return canvas;
}

export const perlin = function (width, height) {
  var canvas = document.createElement('canvas'),
  ctx = canvas.getContext('2d'),
  imageData = ctx.getImageData(0, 0, width, height),
  data = imageData.data,
  canvasWidth = width,
  canvasHeight = height;

  canvas.width = canvasWidth;
  canvas.height = canvasHeight;

  // seed your noise
  // this is optional
  tooloud.default.Perlin.setSeed(Math.floor(Math.random() * 10000));

  for (var i = 0; i < canvasWidth; i++) {
  for (var j = 0; j < canvasHeight; j++) {
  var index = (i + j * canvasWidth) * 4;

  /*
  var x, y, z;

  Normalize:
  x = i / canvasWidth;
  y = j / canvasHeight;
  z = 0;
  // fixing one of the coordinates turns 3D noise into 2D noise
  // fixing two of the coordinates turns 3D noise into 1D noise
  // fixed coordinate will serve as a seed, i.e. you'll get different results for different values

  // Scale:
  var scale = 10;
  x = scale * x;
  y = scale * y;
  */

  // In one go:
  var x = 15 * (i / canvasWidth), 
      y = 5 * (j / canvasHeight),         // You can use different scale values for each coordinate
      z = 0;

  var n = tooloud.default.Perlin.noise(x, y, z),  // calculate noise value at x, y, z
      r = Math.floor(255 * n),
      g = Math.floor(255 * n),
      b = Math.floor(255 * n);

  data[index + 0] = r;            // R
  data[index + 1] = g;            // G
  data[index + 2] = b;            // B
  data[index + 3] = 255;          // A
  }
  }

  ctx.putImageData(imageData, 0, 0);
  return canvas;
}

export const worley = function (width, height, amount = 100) {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext('2d');
  var imageData = context.getImageData(0, 0, width, height);
  tooloud.default.Worley.setSeed(Math.floor(Math.random() * 10000));
  for(let x = 0; x < width; x++ ){
    for(let y = 0; y < height; y++ ){
      var index = (x + y * width) * 4;
      // In one go:
      var x = 15 * (x / width), 
          y = 5 * (y / height),         // You can use different scale values for each coordinate
          z = 0;

      var n = tooloud.default.Worley.Euclidean(x, y, z);
        imageData.data[index + 0] = Math.floor(255 * n[0]);
        imageData.data[index + 1] = Math.floor(255 * n[0]);
        imageData.data[index + 2] = Math.floor(255 * n[0]);
        imageData.data[index + 3] = 255;
    }
  }
  context.putImageData(imageData, 0, 0);
  return canvas;
}

