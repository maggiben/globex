/* Texture Builder Library */

import * as THREE from 'three';
import * as TWEEN from 'tween';
import * as tooloud from 'tooloud';
import { Perlin } from './Noise';

const createCanvas = function (width, height) {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext('2d');
  const imageData = context.getImageData(0, 0, width, height);
  return { canvas, context, imageData };
}

/* Noise fx */
const noise = function (width, height, amount = 100) {
  const { canvas, context, imageData } = createCanvas(width, height);
  for(let x = 0; x < width; x++ ){
    for(let y = 0; y < height; y++ ){
      context.fillStyle = 'hsl(0, 0%, ' + ( amount - ( Math.random() * 15 ) ) + '%)';
      context.fillRect(x, y, 1, 1);
    }
  }
  return canvas;
}


const perlin = function (width, height) {
  const { canvas, context, imageData } = createCanvas(width, height);
  //tooloud.default.Perlin.setSeed(Math.floor(Math.random() * 10000));
  const perlin = new Perlin(Math.random() * 10000);

  for (let i = 0; i < width; i++) {
    for (let j = 0; j < height; j++) {
      let index = (i + j * width) * 4;

      // In one go:
      let x = 15 * (i / width),
          y = 5 * (j / height),         // You can use different scale values for each coordinate
          z = 0;

      let n = perlin.noise(x, y, z),  // calculate noise value at x, y, z
          r = Math.floor(255 * n),
          g = Math.floor(255 * n),
          b = Math.floor(255 * n);

      imageData.data[index + 0] = r;            // R
      imageData.data[index + 1] = g;            // G
      imageData.data[index + 2] = b;            // B
      imageData.data[index + 3] = 255;          // A
    }
  }

  context.putImageData(imageData, 0, 0);
  return canvas;
}

const worley = function (width, height, amount = 100) {
  const { canvas, context, imageData } = createCanvas(width, height);
  tooloud.default.Worley.setSeed(Math.floor(Math.random() * 10000));

  for(let x = 0; x < width; x++ ){
    for(let y = 0; y < height; y++ ){
      let index = (x + y * width) * 4;
      // In one go:
      let x = 15 * (x / width),
          y = 5 * (y / height),         // You can use different scale values for each coordinate
          z = 0;

      let n = tooloud.default.Worley.Euclidean(x, y, z);
      imageData.data[index + 0] = Math.floor(255 * n[0]);
      imageData.data[index + 1] = Math.floor(255 * n[0]);
      imageData.data[index + 2] = Math.floor(255 * n[0]);
      imageData.data[index + 3] = 255;
    }
  }

  context.putImageData(imageData, 0, 0);
  return canvas;
}

export const generators = {
  noise,
  perlin,
  worley
};

export const proceduralTexture = function (generator, ...options) {
  const texture = new THREE.CanvasTexture(generators[generator](...options));
  texture.anisotropy = 2;
  // texture.repeat.set(3, 3);
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
  texture.format = THREE.RGBFormat;
  return texture;
}


