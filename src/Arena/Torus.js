import * as THREE from 'three';
import * as TWEEN from 'tween';
import * as OrbitControls from 'three-orbitcontrols';
import { noiseTexture } from '../common/Textures';

export default class Torus {

  constructor (element, options) {
    this.options = Object.assign({}, {
      view: {
        fullWidth: window.innerWidth,
        fullHeight: window.innerHeight,
        x: 0,
        y: 0,
        width: window.innerWidth,
        height: window.innerHeight
      },
      radius: 42,
      segments: 24
    }, options);

    // create a scene, that will hold all our elements such as objects, cameras and lights.
    const scene = this.scene = window.scene = new THREE.Scene();
    // create a camera, which defines where we're looking at.
    this.camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
    // position and point the camera to the center of the scene
    this.camera.position.x = -30;
    this.camera.position.y = 40;
    this.camera.position.z = 50;
    this.camera.lookAt(new THREE.Vector3(10, 0, 0));
    // create a render and set the size
    this.renderer = new THREE.WebGLRenderer();
    this.renderer.setClearColor(0x000000);
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.shadowMap.enabled = true;

    this.controls = this.setupControls(this.camera, this.renderer);


    // instantiate a loader
    const loader = new THREE.JSONLoader();

    // load a resource
    // loader.load('/src/Models/SpaceShip.json', ( geometry, materials ) => {
    //   var material = materials[ 0 ];
    //   var object = new THREE.Mesh( geometry, material );
    //   this.scene.add( object );
    // });

    this.scene.add(this.camera);
    this.scene.add(this.helpers());
    this.scene.add(this.demoGeometry());
    this.scene.add(this.demoLights());

    element.appendChild(this.renderer.domElement);
  }

  helpers (scene) {
    const helpers = new THREE.Group();
    const axis = new THREE.AxisHelper(50);
    const grid = new THREE.GridHelper(1000, 1000, 0x0000ff, 0x808080);
    helpers.add(axis);
    helpers.add(grid);
    helpers.name = 'helpers';
    return helpers;
  }

  setupControls (camera, renderer) {
    const controls = new OrbitControls.default(camera, renderer.domElement);
    controls.target.set(0, 0, 0);
    controls.enableDamping = true;
    controls.dampingFactor = 0.07;
    controls.rotateSpeed = 0.04;
    controls.zoomSpeed = 1;
    controls.panSpeed = 0.008;
    return controls;
  }

  materialShip () {
    const loader = new THREE.TextureLoader();
    const texture = loader.load('/images/SpaceShip/texture.png');
    const specular = loader.load('/images/SpaceShip/specular.png');
    texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set( 8, 8); // or whatever you like
    const material = new THREE.MeshBasicMaterial({
      color: 0xFFFFFF, 
      map: texture
    });
    material.name = 'materialStripes';
    return material;
  }

  materialUV () {
    const loader = new THREE.TextureLoader();
    const texture = loader.load('/images/uv.jpg');
    texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
    const material = new THREE.MeshPhongMaterial({
      color: 0xFFFFFF,
      map: texture
    });
    material.name = 'materialUV';
    return material;
  }

  materialStripes () {
    const loader = new THREE.TextureLoader();
    const texture = loader.load('/images/tilenoise.png');
    texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set( 4, 4); // or whatever you like
    const material = new THREE.MeshPhongMaterial({
      color: 0xFFFFFF, 
      map: texture,
      normalMap: texture,
      specularMap: texture,
      specular: 0x111111
    });
    material.name = 'materialStripes';
    return material;
  }

  demoMaterial () {
    // const bump = proceduralTexture('noise', 512, 512, 75);
    const texture = noiseTexture('perlinPeriodic', 512, 512);
    // texture.anisotropy = 2;
    texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set( 2, 1 ); // or whatever you like
    const material = new THREE.MeshPhongMaterial({
      color: 0xFFFFFF, 
      specular: 0x111111,
      shininess: 50,
      map: texture
    });
    material.name = 'demoMaterial';
    return material;
  }

  demoGeometry () {
    const geometry = new THREE.TorusGeometry(10, 2.5, 64, 64, Math.PI * 2);
    const mesh = new THREE.Mesh(geometry, this.demoMaterial());
    mesh.name = 'demoGeometry'
    return mesh;
  }

  demoLights () {
    const light = new THREE.AmbientLight( 0xFFFFFF, 2 );
    light.name = 'demoLights';
    return light;
  }

  updateTexture (texture, material) {
    material.map = texture;
    material.needsUpdate = true;
  }

  animate () {
    const {
      scene,
      camera,
      renderer,
      controls
    } = this;

    function render(time) {
      TWEEN.default.update(time);
      renderer.render(scene, camera);
      controls.update();
    }

    function loop(time) {
      render(time);
      const animationId = requestAnimationFrame(loop.bind(this));
    }
    loop.apply(this, [performance.now()]);
  }
}

window.Rings = Rings



