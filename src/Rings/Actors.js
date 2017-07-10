import * as THREE from 'THREE';
import * as TWEEN from 'tween';

import * as Utils from '../common/Utils';
import * as Materials from './Materials';
import Ellipse from '../common/Ellipse';
import Algebra from '../common/Algebra';


export const donut = function () {
  const geometry = new THREE.TorusGeometry(2, 0.5, 48, 48)
  const mesh = new THREE.Mesh(geometry, Materials.donut);
  mesh.name = 'donut';
  mesh.castShadow = true;
  mesh.receiveShadow = true;

  return mesh;
};

export const floor = function (width, height) {
  const geometry = new THREE.PlaneGeometry(width, height);
  const mesh = new THREE.Mesh(geometry, Materials.gloss);
  mesh.name = 'floor';
  mesh.position.set(0, -2.5, 0);
  mesh.rotation.set(0, 0, 0);
  mesh.rotation.x = Algebra.de2ra(90);
  mesh.receiveShadow = true;
  return mesh;
};

export const tube = function (radius, segments = 25) {
  const path = new Ellipse(radius, radius);
  // params
  const pathSegments = segments;
  const tubeRadius = 0.05;
  const radiusSegments = 16;
  const closed = true;

  const geometry = new THREE.TubeBufferGeometry(path, pathSegments, tubeRadius, radiusSegments, closed);
  const material = new THREE.MeshPhongMaterial({
    color: 0xFFFF00,
  });

  const mesh = new THREE.Mesh(geometry, material);
  mesh.name = 'tube';
  return mesh;
}

export const ball = function (envMap) {
  const geometry = new THREE.SphereBufferGeometry( 1, 32, 32 );
  const mesh = new THREE.Mesh(geometry, Materials.mirror(envMap));
  mesh.name = 'demo';
  return mesh;
}

export const drawTiny = function (width, height, depth, position) {
  const geometry = new THREE.BoxGeometry(width, height, depth);
  const loader = new THREE.TextureLoader();
  const texture = loader.load( '/images/uv.jpg' );
  const material    = new THREE.MeshBasicMaterial({
    color: 0xFFFFFF,
    map: texture
  });
  const mesh = new THREE.Mesh(geometry, material);
  mesh.position.fromArray(position);
  return mesh;
}

export const glowBall = function (path, color = 0xFF00FF) {
  const light = new THREE.PointLight(color, 4, 50);
  light.add(
    new THREE.Mesh(
      new THREE.SphereGeometry(0.5, 32, 32),
      new THREE.MeshBasicMaterial({ color })
    )
  );

  light.castShadow = true;

  new TWEEN.default.Tween({position: 1})
    .to({position: 0}, 10000)
    .onUpdate(function(progress) {
      Utils.moveTo(light, path, [0, 0, 1], this.position);
    })
    .repeat(Infinity)
    .start();

  return light;
}
