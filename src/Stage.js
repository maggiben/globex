class Stage {
  constructor (container) {
    /*
    window.innerWidth, window.innerHeight
    this.scene = new THREE.Scene();
    this.renderer = this.createRenderer(container);
    this.camera = this.createCamera();

    this.setupControls();
    */
  }

  createRenderer ({width, height}) {
    const renderer = new THREE.WebGLRenderer({
      precision: 'lowp',
      // antialias: true,
      // clearAlpha: 1
    });
    renderer.setClearColor(0x000000);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(width, height);
    return renderer;
  }

  showStats (option = 0) {
    const stats = new Stats();
    stats.showPanel(option); 
    document.getElementById('stats').append(stats.domElement);
    return stats;
  }

  createCamera ({fullWidth, fullHeight, x, y, width, height}) {
    const camera = new THREE.PerspectiveCamera(50, width / height, 1, 5000);
    console.log(fullWidth, fullHeight, x, y, width, height)
    camera.setViewOffset(fullWidth, fullHeight, x, y, width, height);
    camera.position.z = 1400;
    camera.lookAt(new THREE.Vector3(0, 0, 0));
    return camera;
  }

  helpers (scene) {
    const axes = new THREE.AxisHelper(50);
    const helper = new THREE.GridHelper(10000, 10, 0x0000ff, 0x808080);
    scene.add(axes);
    scene.add(helper);
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

  background () {
    const loader = new THREE.TextureLoader();
    let plateMaterial = new THREE.MeshBasicMaterial({
      map: loader.load( 'images/background.jpg' ),
      //map: this.makeTexture(),
      transparent: true,
      blending: THREE.AdditiveBlending,
      opacity: 0
    });

    let plate = new THREE.Mesh( new THREE.PlaneGeometry( 1920, 1200, 1, 1 ),  plateMaterial);
    plate.scale.x = plate.scale.y = 2;
    plate.position.z -= 1175;  

    const tween = new TWEEN.Tween(plateMaterial)
    .to({ 
      opacity: 1
    }, 2000)
    .easing( TWEEN.Easing.Quartic.InOut )
    .start();

    this.scene.add(plate);
  }
}