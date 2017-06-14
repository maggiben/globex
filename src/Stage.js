class Stage {
  constructor (container) {
    this.scene = new THREE.Scene();
    this.renderer = this.createRenderer(container);
    this.camera = this.createCamera();
  }

  createRenderer (container) {
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      clearAlpha: 1
    });
    renderer.setClearColor(0x000000);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    container.appendChild(renderer.domElement);
    return renderer;
  }

  createCamera () {
    const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 1, 3000);
    camera.position.z = 1400;
    this.scene.add(this.camera);
    return camera;
  }
}