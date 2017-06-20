import * as THREE from 'three';
import * as TWEEN from 'tween';

export default class Follow {
  constructor (scene, path) {
    this.scene = scene;

  }

  initFollowCamera(offsetVar, lookAheadVar, {fullWidth, fullHeight, x, y, width, height) {
    this.scene.add(parent);
    const parent = new THREE.Group();
    const camera = this.camera = new THREE.PerspectiveCamera(50, width / height, 1, 5000);
    camera.setViewOffset(fullWidth, fullHeight, x, y, width, height);
    parent.add(camera);
    // offset = offsetVar || 0;
    // lookAhead = lookAheadVar || false;
    return camera;
  }

  animate () {

  }
}