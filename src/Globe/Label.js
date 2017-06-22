import * as THREE from 'three';

export default class Label {
  constructor (text, latitude, longitude, radius = 400) {
    const options = {
      labelColor: '#FFFFFF',
      font: 'Verdana'
    };

    const label = this.createLabel(text, 12, options.labelColor, options.font);
    const texture = new THREE.Texture(label);
    texture.needsUpdate = true;

    const material = new THREE.SpriteMaterial({
      map: texture,
      opacity: 1,
      depthTest: true,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending,
      transparent : true,
      fog: true
    });

    const point = this.mapPoint(latitude, longitude, radius + 30);
    const sprite = new THREE.Sprite(material);
    //sprite.position.set(point.x * 10 * 1.1, point.y * 10 + (point.y < 0 ? -15 : 30), point.z * 10 * 1.1);
    sprite.position.set(point.x, point.y + 20, point.z);
    sprite.scale.set(label.width, label.height);
    return sprite;
  }

  mapPoint (latitude, longitude, radius = 400) {
    const phi = (90 - latitude) * Math.PI / 180;
    const theta = (180 - longitude) * Math.PI / 180;
    const x = radius * Math.sin(phi) * Math.cos(theta);
    const y = radius * Math.cos(phi);
    const z = radius * Math.sin(phi) * Math.sin(theta);

    return {x, y, z};
  }

  createLabel (text, size, color, font, underlineColor) {
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");
    context.font = size + "pt " + font;

    const textWidth = context.measureText(text).width;

    canvas.width = textWidth;
    canvas.height = size + 10;

    // better if canvases have even heights
    if(canvas.width % 2){
      canvas.width++;
    }
    if(canvas.height % 2){
      canvas.height++;
    }

    if(underlineColor){
        canvas.height += 30;
    }
    context.font = size + "pt " + font;
    context.textAlign = "center";
    context.textBaseline = "middle";
    context.strokeStyle = 'black';
    context.miterLimit = 2;
    context.lineJoin = 'circle';
    context.lineWidth = 6;

    context.strokeText(text, canvas.width / 2, canvas.height / 2);

    context.lineWidth = 2;

    context.fillStyle = color;
    context.fillText(text, canvas.width / 2, canvas.height / 2);

    if(underlineColor){
      context.strokeStyle=underlineColor;
      context.lineWidth=4;
      context.beginPath();
      context.moveTo(0, canvas.height-10);
      context.lineTo(canvas.width-1, canvas.height-10);
      context.stroke();
    }
    return canvas;
  }
}
