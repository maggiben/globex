import * as THREE from 'THREE';
import * as Materials from './Materials';
import Ellipse from '../common/Ellipse';
import Algebra from '../common/Algebra';

export const donut = function () {
  const geometry = new THREE.TorusGeometry(2, 0.5, 6, 48)
  const mesh = new THREE.Mesh(geometry, Materials.donut);
  mesh.name = 'donut';
  mesh.position.set(0, 0, 0);
  mesh.rotation.set(0, 0, 0);
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