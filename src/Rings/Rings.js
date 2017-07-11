import * as THREE from 'three';
import * as TWEEN from 'tween';
import * as OrbitControls from 'three-orbitcontrols';
// import * as Debug from 'debug';

import Stage from '../common/Stage';
import Ellipse from '../common/Ellipse';
import Lights from '../common/Lights';
import { Camera, createCubeCameras, createPerspectiveCamera, setupControls } from '../common/Camera';
import GroupEx from '../common/GroupEx';
import * as Utils from '../common/Utils';
import Track from '../common/Track';
import * as Materials from './Materials';
import * as Actors from './Actors';
import Scenario from './Scenario.json';
import Sky from '../Shaders/SkyShader.js';

export default class Rings {

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
      segments: 34
    }, options);

    this.path = new Track(Scenario.track);

    this.groups = ['fixed', 'actors', 'cameras'].reduce(function (group, name) {
      group[name] = new GroupEx(name);
      return group;
    }, {});

    this.scene = window.scene = new THREE.Scene();
    const sky = new Sky();
    // this.scene.add( sky.mesh );
    sky.update();
    this.scene.background = Materials.skyBox();

    this.stage = new Stage(element);
    this.stats = this.stage.showStats();
    this.renderer = this.stage.createRenderer(this.options.view);

    // this.stage.helpers(this.scene);

    /* Cameras */
    this.camera = createPerspectiveCamera(this.options.view);
    Utils.onWindowResized(this.renderer, this.camera);
    this.camera.position.set(0, 38, 8);
    this.camera.lookAt(this.scene.position);
    this.groups.cameras.add(this.camera);
    this.cubeCameras = createCubeCameras();
    this.groups.cameras.add(this.cubeCameras);

    this.scene.add(this.groups.cameras);

    /* Controls */
    // this.controls = this.stage.setupControls();
    this.controls = setupControls(this.camera, this.renderer);

    /* Static objects */
    // this.groups.fixed.add(Actors.tube(this.options.radius, this.options.segments));
    // this.groups.fixed.add(Actors.floor(500, 500));
    this.scene.add(this.groups.fixed);


    /* Lights */
    this.groups.lights = new Lights(Scenario.lights);
    // this.addCameraLight(this.groups.lights);
    this.scene.add(this.groups.lights);

    /* Actors */
    // this.groups.actors.add(Actors.glowBall(this.path));

    this.groups.actors.add(this.path.createHelper());
    this.groups.actors.add(this.path.place(Actors.donut(), this.options.segments))

    this.scene.add(this.groups.actors);
    this.groups.actors.add(this.demo());

    const sun = this.groups.lights.getObjectByName('sun');
    sun.shadow.mapSize.width = 512;
    sun.shadow.mapSize.height = 512;

    sun.shadow.camera.near = 1;
    sun.shadow.camera.far = 500;
    sun.shadow.camera.fov = 50;

    sun.position.copy(sky.getSunPosition());
    sun.target = this.groups.actors.getObjectByName('demo');

    Materials.simplify(this.groups.actors);


    /* Animation */
    // this.animateActors(this.path);
    this.animateCamera(this.camera, this.path)

    element.appendChild(this.renderer.domElement);
  }

  animateCamera (camera, path) {
    var pt = this.scene.position;
    const trac2k = new Track(Scenario.trac2k);
    // const up = new THREE.Vector3(0, 0, 1);
    // const axis = new THREE.Vector3();
    const moveCamera = Utils.translateFromPath(camera, path, true);

    const tween = new TWEEN.default.Tween({ position: 0 })
      .to({ position: 1 }, 30000)
      .onUpdate(function(progress) {
        // path.moveTo(camera, [0, 0, 1], position);
        var p1 = path.getPointAt(progress%1);
        var p2 = trac2k.getPointAt((progress + 0.01)%1);
        camera.position.copy(p1);
        var px1 = new THREE.Vector3(p2.x, pt.y, pt.z)
        camera.lookAt(p2);
      })
      .repeat(Infinity)
      .start();
    return tween;
  }

  animateObjectsAlongPath (objects, path, offset) {
    const up = new THREE.Vector3(0, 0, 1);
    const axis = new THREE.Vector3();

    const moveCamera = Utils.translateFromPath(objects.camera, path, true);
    const moveCubeCamera_a = Utils.translateFromPath(objects.cube_a, path, false);
    const moveCubeCamera_b = Utils.translateFromPath(objects.cube_b, path, false);
    const moveDemo = Utils.translateFromPath(objects.demo, path, true);
    const moveLight = Utils.translateFromPath(objects.light, path, true);

    const tween = new TWEEN.default.Tween({ position: 0 })
      .to({ position: 1 }, 30000)
      .onUpdate(function(progress) {
        const { position } = this;
        // const point_z = path.getPoint(this.position + 0.0001);

        moveCamera(position);
        moveCubeCamera_a(position);
        moveCubeCamera_b(position);
        moveDemo(position - 0.010);

        /* anda */
        // objects.light.position.copy(point_z);
        // objects.light.target = objects.camera;

      })
      .repeat(Infinity)
      .start();
    return tween;
  }

  animateActors (path) {
    return this.animateObjectsAlongPath({
      camera: this.camera,
      cube_a: this.cubeCameras.getObjectByName('cubeCamera_a'),
      cube_b: this.cubeCameras.getObjectByName('cubeCamera_b'),
      demo: this.scene.getObjectByName('demo'),
      light: this.scene.getObjectByName('frontera')
    }, path);
  }

  demo () {
    const cubeCamera = this.cubeCameras.getObjectByType('CubeCamera');
    const geometry = new THREE.SphereBufferGeometry( 1, 64, 64 );
    const mesh = new THREE.Mesh(geometry, Materials.mirror(cubeCamera.renderTarget.texture));
    mesh.name = 'demo';
    return mesh;
  }

  animate () {
    const {
      scene,
      camera,
      renderer,
      stats,
      controls,
      cubeCameras
    } = this;

    let count = 0;
    const demo = scene.getObjectByName('demo');
    const cubeCamera_a = cubeCameras.getObjectByName('cubeCamera_a');
    const cubeCamera_b = cubeCameras.getObjectByName('cubeCamera_b');

    function updateEnv () {
      demo.visible = false;
      // pingpong
      if ( count % 2 === 0 ) {
        demo.material.envMap = cubeCamera_a.renderTarget.texture;
        cubeCamera_b.updateCubeMap( renderer, scene );
      } else {
        demo.material.envMap = cubeCamera_b.renderTarget.texture;
        cubeCamera_a.updateCubeMap( renderer, scene );
      }
      count ++;
      demo.visible = true;
    }

    function render(time) {
      if(demo) {
         // updateEnv();
      }
      TWEEN.default.update(time);
      renderer.render(scene, camera);
      controls.update();
    }

    function loop(time) {
      stats.update();
      render(time);
      const animationId = requestAnimationFrame(loop.bind(this));
    }
    loop.apply(this, [performance.now()]);
  }
}

window.Rings = Rings



