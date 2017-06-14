class Stage {
  constructor (container) {
    /*
    this.scene = new THREE.Scene();
    this.renderer = this.createRenderer(container);
    this.camera = this.createCamera();

    this.setupControls();
    */
  }

  createRenderer () {
    const renderer = new THREE.WebGLRenderer({
      // antialias: true,
      // clearAlpha: 1
    });
    renderer.setClearColor(0x000000);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    return renderer;
  }

  showStats () {
    const stats = new Stats();
    // Options = 0: fps, 1: ms, 2: mb, 3+: custom
    stats.showPanel(0); 
    document.getElementById('stats').append(stats.domElement);
    return stats;
  }

  createCamera () {
    const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 1, 3000);
    camera.position.z = 1400;
    this.scene.add(this.camera);
    return camera;
  }

  helpers () {
    const axes = new THREE.AxisHelper(50);
    const helper = new THREE.GridHelper(10000, 10, 0x0000ff, 0x808080);
    this.scene.add(axes);
    this.scene.add(helper);
  }

  setupControls () {
    const { scene, camera, renderer } = this;
    //controls
    const controls = new THREE.OrbitControls(camera, this.renderer.domElement);
    controls.target.set(0, 0, 0);
    controls.enableDamping = true;
    controls.dampingFactor = 0.07;
    controls.rotateSpeed = 0.04;
    controls.zoomSpeed = 1;
    controls.panSpeed = 0.008;
    return controls;
  }
}