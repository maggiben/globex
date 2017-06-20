//import { Scene, PerspectiveCamera, WebGLRenderer, BoxGeometry, MeshBasicMaterial, Mesh } from 'three';
import * as TWEEN from 'tween';
import * as THREE from 'three';
import * as OrbitControls from 'three-orbitcontrols';

export default class Stage {
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
    this.renderer = renderer;
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
    camera.setViewOffset(fullWidth, fullHeight, x, y, width, height);
    camera.position.z = 1400;
    camera.lookAt(new THREE.Vector3(0, 0, 0));
    this.camera = camera;
    return camera;
  }

  createCameraHelper ({fullWidth, fullHeight, x, y, width, height}) {
    const camera = new THREE.PerspectiveCamera(50, width / height, 1, 5000);
    camera.setViewOffset(fullWidth, fullHeight, x, y, width, height);
    const helper = new THREE.CameraHelper(camera);
    return { camera, helper };
  }

  helpers (scene) {
    const helpers = new THREE.Group();
    const axisHelper = new THREE.AxisHelper(50);
    const gridHelper = new THREE.GridHelper(1000, 1000, 0x0000ff, 0x808080);
    helpers.add(axisHelper);
    // helpers.append(gridHelper);
    scene.add(helpers);
  }

  setupControls () {
    const { camera, renderer } = this;
    //controls
    const controls = new OrbitControls.default(camera, this.renderer.domElement);
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
