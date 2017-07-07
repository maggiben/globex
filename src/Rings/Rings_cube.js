import * as THREE from 'THREE';
import EffectComposer, { RenderPass, ShaderPass, CopyShader } from 'three-effectcomposer-es6';
import 'wagner/';
import 'wagner/base';
import * as TWEEN from 'tween';
import * as OrbitControls from 'three-orbitcontrols';
import { noise, perlin, worley } from '../common/Textures';
import Stage from '../common/Stage';
import throttle from 'lodash/throttle';

const de2ra = window.de2ra = function(degree) { 
  return degree * (Math.PI/180);
};
const ra2deg = window.ra2deg = function(radians) { 
  return radians * (180 / Math.PI);
};

function Ellipse ( xRadius, yRadius ) {
  THREE.Curve.call( this );
  // add the desired properties
  this.xRadius = xRadius;
  this.yRadius = yRadius;
}
Ellipse.prototype = Object.create( THREE.Curve.prototype );
Ellipse.prototype.constructor = Ellipse;
// define the getPoint function for the subClass
Ellipse.prototype.getPoint = function ( t ) {
  const radians = 2 * Math.PI * t;
  return new THREE.Vector3( this.xRadius * Math.cos( radians ), 0, this.yRadius * Math.sin( radians ) );
};

const wireframe = window.wireframe = function(container) {
  if (container.children.length) {
    return container.children.forEach(wireframe);
  }
  if (container.type === 'Mesh') {
    container.material.wireframe = true;
    container.material.needsUpdate = true;
  }
}

export default class Rings {
  static textures = {
    bump: null,
    roughness: null
  };

  constructor (container, options) {
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

    this.groups = ['lights', 'fixed', 'actors', 'cameras'].reduce(function (group, item) {
      group[item] = new THREE.Group();
      group[item].name = name;
      return group;
    }, {});

    this.updatees = [];
    this.container = container;
    this.scene = window.scene = new THREE.Scene();
    // this.scene.fog = new THREE.FogExp2( 0x000000, 0.015 );
    this.stage = new Stage(container);
    this.stats = this.stage.showStats();
    this.renderer = this.stage.createRenderer(this.options.view);
    // this.renderer.setClearColor(0x333F47, 1);
    // this.stage.helpers(this.scene);
    this.camera = this.stage.createCamera(this.options.view, { position: [0, 38, 8] });
    this.camera.position.set(0, 38, 8);
    this.camera.lookAt(this.scene.position);


    this.cameraGroup = new THREE.Group();
    this.cameraHelper = this.stage.createCameraHelper(this.options.view);
    this.cameraHelper.camera.position.set(0, 20, 0);
    this.cameraHelper.camera.lookAt(this.scene.position);   
    
    this.updatees.push(this.cameraHelper.helper);

    this.groups.cameras.add(this.cameraHelper.helper);
    this.groups.cameras.add(this.cameraHelper.camera);
    this.groups.cameras.add(this.camera);
    // this.cubeCamera = new THREE.CubeCamera( 1, 5000, 256); 
    // this.cubeCamera.renderTarget.texture.minFilter = THREE.LinearMipMapLinearFilter;
    // this.groups.cameras.add(this.cubeCamera);

    this.scene.add(this.groups.cameras);
    this.addCameraLight(this.groups.cameras);
    // this.moveCamera(this.cameraHelper.camera, this.options.radius);
    this.moveCamera(this.camera, this.options.radius);

    /* Controls */
    this.controls = this.stage.setupControls();

    /* Static objects */
    // this.groups.fixed.add(this.drawTube(this.options.radius));
    this.groups.fixed.add(this.drawFloor(this.options.radius * 4, this.options.radius * 4));
    this.scene.add(this.groups.fixed);


    // this.drawSkyBox();
    
    /* Lights */
    this.groups.lights.add(this.placeLights());
    this.scene.add(this.groups.lights);


    /* Actors */
    this.groups.actors.add(this.animateLight(this.options.radius));
    this.groups.actors.add(this.placeObjects(this.options.radius, this.options.segments));
    // this.groups.actors.add(this.demo());
    this.scene.add(this.groups.actors);
    wireframe(this.groups.actors);

    container.appendChild(this.renderer.domElement);
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
        moveTo(light, path, this.position, {x:0,y:0,z:1});
      })
      .repeat(Infinity)
      .start();

    return light;
  }

  animatePath(group, radius) {
    const path = new Ellipse(radius, radius);
    const box = this.box = this.drawTiny(2, 2, 2);
    const { moveTo } = this;

    new TWEEN.default.Tween({position: 1})
      .to({position: 0}, 10000)
      .onUpdate(function(progress) {
        moveTo(box, path, this.position, {x:0,y:0,z:1});
      })
      .repeat(Infinity)
      .start();

    group.add(box);
  }

  moveTo (shape, path, position, {x, y, z}) {
    const up = new THREE.Vector3( x, y, z );
    const axis = new THREE.Vector3( );
    // set the marker position
    const point = path.getPoint(position);
    // set the marker position
    shape.position.set( point.x, point.y, point.z );
    // get the tangent to the curve
    const tangent = path.getTangent(position).normalize();
    // calculate the axis to rotate around
    axis.crossVectors( up, tangent ).normalize();
    // calcluate the angle between the up vector and the tangent
    const radians = Math.acos(up.dot(tangent));
    // set the quaternion
    shape.quaternion.setFromAxisAngle( axis, radians );
  }

  moveCamera (camera, radius) {
    const { moveTo, cameraGroup, box, scene } = this;
    const path = new Ellipse(radius, radius);
    const up = new THREE.Vector3( 0, 0, 1 );
    const axis = new THREE.Vector3();

    const light = scene.getObjectByName('frontera');

    // const point = path.getPoint(0.5);
    // camera.position.set(point.x, point.y, point.z);
    // const point2 = path.getPoint(0.55);
    // camera.lookAt(point2);


    // camera.position.set(points[0].x, points[0].y, points[0].z);
    // const vector = new THREE.Vector3(points[1].x, points[1].y, points[1].z);
    // this.cameraGroup.rotation.x = THREE.Math.degToRad(45);
    // camera.lookAt(vector);
    // camera.useQuaternion = true;

    new TWEEN.default.Tween({position: 1})
      .to({position: 0}, 30000)
      .onUpdate(function(progress) {
        const point_a = path.getPoint(this.position);
        const point_z = path.getPoint(this.position + 0.0001);
        // camera.position.set(point_a.x, point_a.y, point_a.z);
        camera.position.copy(point_a);
        const tangent = path.getTangent(this.position + 0.00005).normalize();
        axis.crossVectors(up, tangent).normalize();
        // const radians = Math.atan2(tangent.y, tangent.x); //Math.acos(up.dot(tangent));
        const radians = Math.acos(up.dot(tangent));
        camera.quaternion.setFromAxisAngle(axis, radians);
        // camera.lookAt(point_b);
        light.position.copy(point_z);
        light.target = camera;
      })
      .repeat(Infinity)
      .start();
  }


  makeBump () {
    if(!this.mapHeight) {
      const mapHeight = this.mapHeight = new THREE.CanvasTexture(noise(512, 512, 75));
      mapHeight.anisotropy = 2;
      mapHeight.repeat.set( 24, 24 );
      // mapHeight.offset.set( 0.001, 0.001 );
      mapHeight.wrapS = mapHeight.wrapT = THREE.RepeatWrapping;
      mapHeight.format = THREE.RGBFormat;
      return this.mapHeight;
    } else {
      return this.mapHeight;
    }
  }

  placeObjects(radius, segments = 24) {
    const group = new THREE.Group();
    group.name = 'rings';
    const path = new Ellipse(radius, radius);
    const points = path.getSpacedPoints(segments);
    const shapes = points.map((point, index) => {
      const ring = this.ring();
      this.moveTo(ring, path, (1 / points.length) * index, {x:0,y:0,z:1});
      return ring;
    });

    for(let i = 0; i < shapes.length; i++) {
      group.add(shapes[i]);
    }
    return group;
  }

  drawTube (radius) {
    const path = new Ellipse(radius, radius);
    // params
    const pathSegments = this.options.segments;
    const tubeRadius = 0.05;
    const radiusSegments = 16;
    const closed = true;

    const geometry = new THREE.TubeBufferGeometry( path, pathSegments, tubeRadius, radiusSegments, closed );
    const material = new THREE.MeshPhongMaterial({
      color: 0xFFFF00, 
    });

    const mesh = new THREE.Mesh( geometry, material );
    mesh.name = 'tube';
    return mesh;
  }

  getDonutMaterial () {    
    const newBump = this.makeBump().clone();
    newBump.repeat.set( Math.random() * 124, Math.random() * 124 );
    newBump.offset.set( Math.random() * 10, Math.random() * 10);

    const newRough = this.makeRoughnessMap().clone();
    // newBump.repeat.set( Math.random() * 4, Math.random() * 4 );
    newRough.offset.set( Math.random() * 10, Math.random() * 10);

    const material = new THREE.MeshStandardMaterial({ 
      color: 0x222222, 
      side: THREE.DoubleSide,
      map: this.makeRoughnessMap(),
      roughness: 0.6,
      emissive: 0x111111,
      metalness: 0.5,
      bumpMap: newBump,
      emissiveMap: newRough,
      roughnessMap: newBump,
      metalnessMap: newRough,
      bumpScale: 0.01
    });

    return material;
  }

  ring () {
    // const geometry = new THREE.BoxGeometry( 0.5, 0.5, 0.5 );
    const geometry = new THREE.TorusGeometry(2, 0.5, 6, 48)
    
    const mesh = new THREE.Mesh(geometry, this.getDonutMaterial());
    mesh.name = 'donut';
    mesh.position.set(0, 0, 0);
    mesh.rotation.set(0, 0, 0);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    return mesh;
  }

  makeRoughnessMap () {
    if(!this.roughnessMap) {
      const roughnessMap = this.roughnessMap = new THREE.CanvasTexture(perlin(128, 128, 75));
      roughnessMap.anisotropy = 2;
      roughnessMap.repeat.set( 3, 3 );
      // roughnessMap.offset.set( 0.001, 0.001 );
      roughnessMap.wrapS = roughnessMap.wrapT = THREE.RepeatWrapping;
      roughnessMap.format = THREE.RGBFormat;
      return this.roughnessMap;
    } else {
      return this.roughnessMap;
    }
  }

  makeWorleyMap () {
    if(!this.worleyMap) {
      const worleyMap = this.worleyMap = new THREE.CanvasTexture(worley(128, 128, 75));
      worleyMap.anisotropy = 2;
      worleyMap.repeat.set( 3, 3 );
      // worleyMap.offset.set( 0.001, 0.001 );
      worleyMap.wrapS = worleyMap.wrapT = THREE.RepeatWrapping;
      worleyMap.format = THREE.RGBFormat;
      return this.worleyMap;
    } else {
      return this.worleyMap;
    }
  }

  gloss () {
    
    const texture = new THREE.TextureLoader().load('/images/metal2b.jpg');
    texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.multiplyScalar( 24 );
    texture.anisotropy = 16;

    const material = new THREE.MeshPhongMaterial({ 
      color: 0xFFFFFF,
      side: THREE.DoubleSide,
      specular: 0x111111, 
      shininess: 200, 
      shading: THREE.FlatShading,
      map: texture,
      specularMap: texture,
      // envMap: this.cubeCamera.renderTarget.texture
    });
    material.color.setHSL( 0.1, 0.25, 0.25 );
    material.specular.setHSL( 0, 0, 0.1 );
    return material;
  }
  
  demo () {
    const geometry = new THREE.BoxGeometry( 5, 5, 5 );
    const material = new THREE.MeshBasicMaterial({
      color: 0xFFFFFF,
      // envMap: this.cubeCamera.renderTarget.texture
    });
    const cube = new THREE.Mesh(geometry, material);
    // cube.castShadow = true;
    // cube.receiveShadow = true;
    cube.position.set(0, 2, 0);
    return cube;
  }

  drawFloor(width, height) {
    const geometry = new THREE.PlaneGeometry(width, height);
    const mesh = new THREE.Mesh(geometry, this.gloss());
    mesh.name = 'floor';
    mesh.position.set(0, -2.5, 0);
    mesh.rotation.set(0, 0, 0);
    mesh.rotation.x = de2ra(90);
    mesh.receiveShadow = true;
    
    return mesh;
  }
 
  drawSkyBox() {
    // define path and box sides images
    this.reflectionCube = new THREE.CubeTextureLoader()
    .setPath('/images/skybox/')
    .load([
      'sbox_px.jpg', 
      'sbox_nx.jpg', 
      'sbox_py.jpg', 
      'sbox_ny.jpg', 
      'sbox_pz.jpg', 
      'sbox_nz.jpg'
    ]);
    this.reflectionCube.format = THREE.RGBFormat;
    this.scene.background = this.reflectionCube;
  }

  addHelpers () {

  }

  placeLights (container) {
    const options = [{
      type: 'DirectionalLight',
      color: 0xFF0000,
      intensity: 1,
      position: [60, 30, 90],
      castShadow: true
    }, {
      type: 'DirectionalLight',
      color: 0x0000FF,
      intensity: 1,
      position: [-120, 30, 0],
      castShadow: true
    }, {
      type: 'SpotLight',
      color: 0xFFFFFF,
      intensity: 1,
      position: [3, 40, 3],
      castShadow: true,
    }];

    const lights = options.map(function (option, index) {
      const { color, intensity, position, name, type, castShadow } = option;
      let light = new THREE[type](color);
      light.position.fromArray(position);
      light.intensity = intensity;
      light.castShadow = castShadow;
      light.name = name;
      return light;
    })
    .reduce((group, light) => {
      group.add(light);
      return group;
    }, new THREE.Group());

    /* attach helpers */
    lights.children.forEach(light => {
      const helper = new THREE[`${light.type}Helper`](light);
      this.updatees.push(helper);
      lights.add(helper);
    });

    return lights;
  }

  animate () {
    const { scene, camera, renderer, stats, controls, cameraHelper, updatees, cubeCamera} = this;
    function render(time) {
      TWEEN.default.update(time);
      controls.update();
      // cubeCamera.updateCubeMap(renderer, scene);
      // const floor = scene.getObjectByName('floor');
      // floor.material.envMap = cubeCamera.renderTarget.texture;

      renderer.render(scene, camera);
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




