import * as THREE from 'THREE';
import EffectComposer, { RenderPass, ShaderPass, CopyShader } from 'three-effectcomposer-es6';
import 'wagner/';
import 'wagner/base';
import * as TWEEN from 'tween';
import * as OrbitControls from 'three-orbitcontrols';
// import * as Debug from 'debug';
import { noise, perlin, worley } from '../common/Textures';
import Stage from '../common/Stage';
import throttle from 'lodash/throttle';
import Ellipse from '../common/Ellipse';
import Algebra from '../common/Algebra';

import Scenario from './Scenario.json';
import Lights from '../common/Lights';

import * as Utils from '../common/Utils';
import * as Materials from './Materials';
import * as Actors from './Actors';

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
      segments: 24
    }, options);

    this.path = new Ellipse(this.options.radius, this.options.radius);

    this.groups = ['lights', 'fixed', 'actors', 'cameras'].reduce(function (group, item) {
      group[item] = new THREE.Group();
      group[item].name = item;
      return group;
    }, {});

    this.updatees = [];
    this.element = element;
    this.scene = window.scene = new THREE.Scene();
    this.stage = new Stage(element);
    this.stats = this.stage.showStats();
    this.renderer = this.stage.createRenderer(this.options.view);
    // this.stage.helpers(this.scene);
    this.camera = this.stage.createCamera(this.options.view, { position: [0, 38, 8] });
    this.camera.position.set(0, 38, 8);
    this.camera.lookAt(this.scene.position);


    this.cameraHelper = this.stage.createCameraHelper(this.options.view);
    this.cameraHelper.camera.position.set(0, 20, 0);
    this.cameraHelper.camera.lookAt(this.scene.position);   
    
    this.updatees.push(this.cameraHelper.helper);

    this.cubeCamera = new THREE.CubeCamera( 1, 5000, 256); 
    this.cubeCamera.renderTarget.texture.minFilter = THREE.LinearMipMapLinearFilter;

    this.cubeCamera2 = new THREE.CubeCamera( 1, 5000, 256); 
    this.cubeCamera2.renderTarget.texture.minFilter = THREE.LinearMipMapLinearFilter;

    

    this.scene.add(this.cubeCamera);
    this.scene.add(this.cubeCamera2);

    this.groups.cameras.add(this.cameraHelper.helper);
    this.groups.cameras.add(this.cameraHelper.camera);
    this.groups.cameras.add(this.camera);

    this.scene.add(this.groups.cameras);
    // this.addCameraLight(this.groups.cameras);

    /* Controls */
    this.controls = this.stage.setupControls();

    /* Static objects */
    // this.groups.fixed.add(Actors.tube(this.options.radius, this.options.segments));
    this.groups.fixed.add(Actors.floor(this.options.radius * 4, this.options.radius * 4));
    this.scene.add(this.groups.fixed);


    // this.drawSkyBox();
    
    /* Lights */
    const lights = new Lights(Scenario.lights);
    this.scene.add(lights);
    // console.log(lights.showHelpers())
    // this.groups.lights.add(new Lights)

    /* Actors */
    // this.groups.actors.add(this.animateLight(this.options.radius));
    this.groups.actors.add(Utils.repeatObjectsAlongPath(Actors.donut(), this.path, this.options.segments));
    // this.groups.actors.add(this.placeObjects(this.path, this.options.segments));
    
    this.scene.add(this.groups.actors);
    Materials.simplify(this.groups.actors);
    this.groups.actors.add(this.demo());
    // this.groups.actors.add(this.drawTiny(5,5,5, [10,2.5,0]));


    // this.moveCamera(this.cameraHelper.camera, this.options.radius);
    this.moveCamera(this.camera, this.options.radius);
    element.appendChild(this.renderer.domElement);
  }

  addCameraLight (camera) {
    const light = new THREE.SpotLight(0xFFFFFF, 4, 100, Math.PI/6, 0.5, 2);
    light.castShadow = true;
    light.name = 'frontera';
    camera.add(light);
  }

  animateLight (radius) {
    const { moveTo } = this;
    const color = 0x54BE68;
    const path = new Ellipse(radius, radius);
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
        Utils.moveTo(light, path, [0, 0, 1], this.position,);
      })
      .repeat(Infinity)
      .start();

    return light;
  }

  animateObjectsAlongPath (objects, path) {
    const up = new THREE.Vector3( 0, 0, 1 );
    const axis = new THREE.Vector3();
    const moveCamera = Utils.followPath(objects.camera, path);
    const moveCubeCamera_a = Utils.followPath(objects.cube_a, path);
    const moveCubeCamera_b = Utils.followPath(objects.cube_b, path);
    const moveDemo = Utils.followPath(objects.demo, path);

    const tween = new TWEEN.default.Tween({position: 1})
      .to({position: 0}, 30000)
      .onUpdate(function(progress) {
        const { position } = this;
        moveCamera(position);
        moveCubeCamera_a(position - 0.010);
        moveCubeCamera_b(position - 0.010);
        moveDemo(position - 0.010);
      })
      .repeat(Infinity)
      .start();
    return tween;
  }

  moveCamera (camera, radius) {
    const { moveTo, cameraGroup, box, scene, cubeCamera, cubeCamera2 } = this;
    const path = new Ellipse(radius, radius);
    const up = new THREE.Vector3( 0, 0, 1 );
    const axis = new THREE.Vector3();

    const light = scene.getObjectByName('frontera');
    const demo = scene.getObjectByName('demo');

    const followPath = Utils.followPath(camera, path);

    return this.animateObjectsAlongPath({
      camera: camera,
      cube_a: cubeCamera,
      cube_b: cubeCamera2,
      demo: scene.getObjectByName('demo')
    }, path);

    new TWEEN.default.Tween({position: 1})
      .to({position: 0}, 30000)
      .onUpdate(function(progress) {
        const point_z = path.getPoint(this.position + 0.0001);
        const point_n = path.getPoint(this.position - 0.010);
        followPath(this.position);
        
        // light.position.copy(point_z);
        // light.target = camera;

        cubeCamera.position.copy(point_n);
        cubeCamera2.position.copy(point_n);

        demo.position.copy(point_n);
      })
      .repeat(Infinity)
      .start();
  }


  placeObjects(path, segments = 24) {
    const points = path.getSpacedPoints(segments);
    return points.map((point, index) => {
      const donut = Actors.donut();
      Utils.moveTo(donut, path, [0, 0, 1], (1 / points.length) * index);
      return donut;
    })
    .reduce(function (group, object) {
      group.add(object);
      return group;
    }, new THREE.Group());
  }

  drawTiny (width, height, depth, position) {
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

  demo () {
    const geometry = new THREE.SphereBufferGeometry( 1, 32, 32 );
    const material = this.mirrorMaterial = new THREE.MeshBasicMaterial({
      color: 0xFFFFFF,
      envMap: this.cubeCamera2.renderTarget.texture
    });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.name = 'demo';
    // mesh.castShadow = true;
    // mesh.receiveShadow = true;

    // const { cubeCamera } = this;
    // new TWEEN.default.Tween({position: 1})
    //   .to({position: 0}, 30000)
    //   .onUpdate(function(progress) {
    //     mesh.material.envMap = cubeCamera.renderTarget.texture;
    //     mesh.material.needsUpdate = true;
    //   })
    //   .repeat(Infinity)
    //   .start();

    return mesh;
  }

  animate () {
    const {
      scene,
      camera,
      renderer,
      stats,
      controls,
      cameraHelper,
      updatees,
      composer,
      zoomBlurPass,
      bloomPass,
      dotScreenPass,
      cubeCamera,
      cubeCamera2,
      mirrorMaterial
    } = this;

    const demo = scene.getObjectByName('demo');
    let count = 0;

    function updateEnv () {
      demo.visible = false;
      // pingpong
      if ( count % 2 === 0 ) {
        demo.material.envMap = cubeCamera.renderTarget.texture;
        cubeCamera2.updateCubeMap( renderer, scene );
      } else {
        demo.material.envMap = cubeCamera2.renderTarget.texture;
        cubeCamera.updateCubeMap( renderer, scene );
      }
      count ++;
      demo.visible = true;
    }

    function render(time) {
      
      if(demo) {
         updateEnv();
      }

      TWEEN.default.update(time);
      renderer.render(scene, camera);
      controls.update();
      // updatees.forEach(helper => {
      //   return helper.update();
      // });
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



