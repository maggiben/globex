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

export default class Rings {
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
      segments: 128
    }, options);

    this.updatees = [];
    this.container = container;
    this.scene = new THREE.Scene();
    // this.scene.fog = new THREE.FogExp2( 0x000000, 0.015 );
    this.stage = new Stage(container);
    this.stats = this.stage.showStats();
    this.renderer = this.stage.createRenderer(this.options.view);
    // this.renderer.setClearColor(0x333F47, 1);
    // this.stage.helpers(this.scene);
    this.camera = this.stage.createCamera(this.options.view);
    

    this.cameraGroup = new THREE.Group();
    this.cameraHelper = this.stage.createCameraHelper(this.options.view);
    this.cameraHelper.camera.position.set(0, 20, 0);
    this.cameraHelper.camera.lookAt(this.scene.position);   
    
    this.updatees.push(this.cameraHelper.helper);

    this.cameraGroup.add(this.cameraHelper.helper);
    this.cameraGroup.add(this.cameraHelper.camera);
    this.scene.add(this.cameraGroup);

    // this.moveCamera(this.cameraHelper.camera, 4);

    // position and point the camera to the center of the scene

    // this.camera.position.set(0, 0, -12);
    this.camera.position.set(0, 38, 8);
    this.camera.lookAt(this.scene.position);
    // this.scene.add(this.camera);
    this.cameraGroup.add(this.camera);

    this.controls = this.stage.setupControls();

    this.drawSkyBox();
    this.mainGroup = new THREE.Group();
    // this.camContainer.add(this.camera);
    this.drawFloor(this.mainGroup, this.options.radius * 4, this.options.radius * 4);
    // this.drawTube(this.mainGroup, this.options.radius);
    // this.animatePath(this.mainGroup, this.options.radius);
    this.animateLight(this.mainGroup, this.options.radius);
    this.placeObjects(this.mainGroup, this.options.radius);
    // this.moveCamera(this.camera, 4);

    // this.mainGroup.add(this.camera);
    // this.drawCurve(this.mainGroup);
    // this.drawCurve3(this.mainGroup);
    


    WAGNER.fragmentShadersPath = 'https://rawgit.com/spite/Wagner/master/fragment-shaders/';
    WAGNER.vertexShadersPath = 'https://rawgit.com/spite/Wagner/master/vertex-shaders/';
    /*
    WAGNER.ZoomBlurPass = function() {
      WAGNER.Pass.call( this );
      WAGNER.log( 'ZoomBlurPass Pass constructor' );
      this.loadShader( 'zoom-blur-fs.glsl' );
      this.params.center = new THREE.Vector2( 0.5, 0.5 );
      this.params.strength = 2;
    };
    WAGNER.ZoomBlurPass.prototype = Object.create( WAGNER.Pass.prototype );
    WAGNER.ZoomBlurPass.prototype.run = function( c ) {
      this.shader.uniforms.center.value.copy ( this.params.center );
      this.shader.uniforms.strength.value = this.params.strength;
      c.pass( this.shader );
    };
  */
    this.composer = new WAGNER.Composer( this.renderer, { useRGBA: false } );
    this.composer.setSize(this.options.view.width, this.options.view.height);
    this.zoomBlurPass = new WAGNER.ZoomBlurPass();
    this.zoomBlurPass.params.strength = .05;
    this.bloomPass = new WAGNER.MultiPassBloomPass();
    this.bloomPass.params.strength = .5;
    this.dotScreenPass = new WAGNER.DotScreenPass();
    this.dldVideoPass = new WAGNER.OldVideoPass();


    // this.drawSimple();
    // this.drawReflectingObjects();
    // this.drawBox();
    // this.scene.add(this.drawTiny());
    // this.drawReflectingObjects();


    // this.cameraGroup.rotation.z = THREE.Math.degToRad(45);

    // this.addCameraLight(this.camera);
    // this.moveCamera(this.camera, this.options.radius);

    this.addCameraLight(this.cameraGroup);
    // this.moveCamera(this.cameraHelper.camera, this.options.radius);
    this.moveCamera(this.camera, this.options.radius);
    
    this.scene.add(this.mainGroup);
    this.scene.add(this.lights());
    // this.mainGroup.rotation.x = THREE.Math.degToRad(90);
    container.appendChild(this.renderer.domElement);
  }

  addCameraLight (camera) {
    //                      SpotLight(color, intensity, distance, angle, penumbra, decay)
    const light = new THREE.SpotLight(0xFFFFFF, 4, 100, Math.PI/6, 0.5, 2);
    // light.position.copy(camera.children[0].position);
    // light.target = camera.children[0].position;
    light.castShadow = true;
    light.name = 'frontera';
    // const helper = new THREE.SpotLightHelper(light);
    // this.updatees.push(helper);
    // camera.add(helper);
    camera.add(light);
  }

  animateLight (group, radius) {
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

    group.add(light);
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

  drawCurve (group) {
    const curve = new THREE.EllipseCurve(
      0, 0,            // ax, aY
      2, 2,            // xRadius, yRadius
      0, 2 * Math.PI,  // aStartAngle, aEndAngle
      false,           // aClockwise
      0                // aRotation
    );

    const points = curve.getPoints(this.options.segments);
    this.path = new THREE.Path(points);
    
    var torus = this.drawTiny();
    group.add(torus);
    const me = this;

    me.move(torus, me.path, 0);
    // me.move(torus, me.path, 0.5)
    // me.move(torus, me.path, 1)

    new TWEEN.default.Tween({position: 0})
      .to({position: 1}, 10000 )
      .onUpdate(function(progress) {
        me.move(torus, me.path, this.position)
      })
      .repeat(Infinity)
      .start();
  }

  getAngle (path, position) {
    // get the 2Dtangent to the curve
    const tangent = path.getTangent(position).normalize();
    // change tangent to 3D
    return -(Math.atan( tangent.x / tangent.y));
  }

  move (mesh, path, position) {
    const getAngle = function (path, position) {
      // get the 2Dtangent to the curve
      const tangent = path.getTangent(position).normalize();
      // change tangent to 3D
      return -( Math.atan( tangent.x / tangent.y));
    }
    var up = new THREE.Vector3( 0, 0, 1);
    // get the point at position
    var point = path.getPointAt(position);
    mesh.position.x = point.x;
    mesh.position.y = point.y;

    const angle = getAngle(path, position);
    // console.log('angle: ', angle)
    // set the quaternion
    mesh.quaternion.setFromAxisAngle( up, angle );
  }

  moveOK (mesh, path, position) {
    var up = new THREE.Vector3(0, 0, 1);
    // get the point at position
    var point = path.getPointAt(position);
    mesh.position.x = point.x;
    mesh.position.y = point.y;
    var angle = this.getAngle(path, position);
    // set the quaternion
    mesh.quaternion.setFromAxisAngle( up, angle );
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

  placeObjects(group, radius) {
    const path = new Ellipse(radius, radius);
    // const torus = this.drawTorus();
    // this.moveTo(torus, path, 0.5);
    
    const points = path.getSpacedPoints(24);
    // const shapes = points.map(point => {
    //   const geometry = new THREE.SphereGeometry(0.2, 16, 16);
    //   const material = new THREE.MeshBasicMaterial({ color: Math.random() * 0xffffff })
    //   const mesh = new THREE.Mesh(geometry, material);
    //   mesh.position.set(point.x, point.y, point.z);
    //   return mesh;
    // });

    const shapes = points.map((point, index) => {
      const torus = this.drawTorus();
      this.moveTo(torus, path, (1 / points.length) * index, {x:0,y:0,z:1});
      return torus;
    });

    for(let i = 0; i < shapes.length; i++) {
      group.add(shapes[i]);
    }

    // group.add(torus);
  }

  makeElipis (group, radius) {
    const matrix = new THREE.Matrix4();
    const up = new THREE.Vector3( 0, 0, 1 );
    const axis = new THREE.Vector3( );
    const path = new Ellipse(radius, radius);
    // const torus = this.drawTorus();
    const torus = this.drawTorus();

    function move (t) {
      // set the marker position
      const pt = path.getPoint( t );
      // set the marker position
      torus.position.set( pt.x, pt.y, pt.z );
      // get the tangent to the curve
      const tangent = path.getTangent( t ).normalize();
      // calculate the axis to rotate around
      axis.crossVectors( up, tangent ).normalize();
      // calcluate the angle between the up vector and the tangent
      const radians = Math.acos( up.dot( tangent ) );
      // set the quaternion
      torus.quaternion.setFromAxisAngle( axis, radians );
    };

    new TWEEN.default.Tween({position: 0})
      .to({position: 1}, 10000)
      .onUpdate(function(progress) {
        move(this.position);
      })
      .repeat(Infinity)
      .start();

    group.add(torus);
  }

  drawCurve2 () {
    var curve = new THREE.EllipseCurve(
      0,  0,            // ax, aY
      2, 2,           // xRadius, yRadius
      0,  2 * Math.PI,  // aStartAngle, aEndAngle
      false,            // aClockwise
      0                 // aRotation
    );

    var path = new THREE.Path( curve.getPoints( 50 ) );
    var geometry = path.createPointsGeometry( 50 );
    const material = new THREE.LineBasicMaterial({ 
      linewidth: 40,
      color: 0xFF0000,
      blending: THREE.AdditiveBlending, 
      transparent: true,
      opacity: 1
    });

    // Create the final object to add to the scene
    var ellipse = new THREE.Line( geometry, material );
    ellipse.rotation.x = de2ra(90);
    this.scene.add(ellipse);
  }

  drawTube (group, radius) {
    const path = new Ellipse(radius, radius);
    // params
    const pathSegments = this.options.segments;
    const tubeRadius = 0.05;
    const radiusSegments = 16;
    const closed = true;

    const geometry = new THREE.TubeBufferGeometry( path, pathSegments, tubeRadius, radiusSegments, closed );
    // material
    const material = new THREE.MeshPhongMaterial({
      color: 0xFFFF00, 
    });    
    // mesh
    const mesh = new THREE.Mesh( geometry, material );
    group.add(mesh);
  }

  drawCurve3 (group) {
    const curve = new THREE.EllipseCurve(
      0,  0,            // ax, aY
      2, 2,             // xRadius, yRadius
      0,  2 * Math.PI,  // aStartAngle, aEndAngle
      false,            // aClockwise
      0                 // aRotation
    );
    // Ellipse class, which extends the virtual base class Curve
    function Ellipse( xRadius, yRadius ) {
      THREE.Curve.call( this );
      // add the desired properties
      this.xRadius = xRadius;
      this.yRadius = yRadius;
    }
    Ellipse.prototype = Object.create( THREE.Curve.prototype );
    Ellipse.prototype.constructor = Ellipse;
    // define the getPoint function for the subClass
    Ellipse.prototype.getPoint = function ( t ) {
      var radians = 2 * Math.PI * t;
      return new THREE.Vector3( this.xRadius * Math.cos( radians ),
        this.yRadius * Math.sin( radians ),
        0 );

    };
    const path = new Ellipse( 2.025, 2.025 );

    // params
    const pathSegments = this.options.segments;
    const tubeRadius = 0.05;
    const radiusSegments = 16;
    const closed = true;

    const geometry = new THREE.TubeBufferGeometry( path, pathSegments, tubeRadius, radiusSegments, closed );
    // material
    const material = new THREE.MeshPhongMaterial({
      color: 0xFFFF00, 
    });
    
    // mesh
    const mesh = new THREE.Mesh( geometry, material );
    group.add(mesh);
    /*
    const path = new THREE.Path( curve.getPoints( 120 ) );
    const geometry = new THREE.TubeBufferGeometry(path, 20, 0.2, 8, true);
    const material = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );
    const mesh = new THREE.Mesh( geometry, material );
    group.add( mesh );
    */
  }

  drawCurve4 (group) {
    const curve = new THREE.EllipseCurve(
      0,  0,            // ax, aY
      2, 2,             // xRadius, yRadius
      0,  2 * Math.PI,  // aStartAngle, aEndAngle
      false,            // aClockwise
      0                 // aRotation
    );

    const points = curve.getPoints( 120 )
    const geometry = new THREE.Geometry();
    
    for (let i = 0; i < points.length; i++) {
      const vector = new THREE.Vector3( points[i].x, points[i].y, points[i].z || 0 );
      geometry.vertices.push(vector);
    }

    const loader = new THREE.TextureLoader();
    const material = new THREE.LineBasicMaterial({ 
      linewidth: 40,
      color: 0xFFFFFF,
      blending: THREE.AdditiveBlending, 
      transparent: true,
      opacity: 1
    });

    const line = new THREE.Line(geometry, material);
    line.geometry.dynamic = true;
    // line.rotation.x = de2ra(90);
    group.add(line);
  }

  drawTorus () {
    // const geometry = new THREE.BoxGeometry( 0.5, 0.5, 0.5 );
    const geometry = new THREE.TorusGeometry(2, 0.5, 6, 48)
    // const material = new THREE.MeshPhongMaterial({
    //   // color: Math.random() * 0xffffff
    //   color: 0xffffff,
    //   shading: THREE.FlatShading,
    //   side: THREE.DoubleSide
    // });
    // const material = new THREE.MeshPhongMaterial({ color: 0x11111f, side: THREE.DoubleSide, opacity: .95, transparent: true })
    
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

    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(0, 0, 0);
    mesh.rotation.set(0, 0, 0);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    return mesh;
  }

  drawTiny (width, height, depth) {
    const geometry = new THREE.BoxGeometry(width, height, depth);
    const loader = new THREE.TextureLoader();
    const texture = loader.load( '/images/uv.jpg' );
    const material    = new THREE.MeshPhongMaterial({
      color: 0xFFFFFF,
      map: texture
    });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.castShadow = true;
    mesh.receiveShadow = true;    
    return mesh;
  }

  drawReflectingObjects () {
    // Object 1: rectangle

    // create additional camera
    this.mCubeCamera = new THREE.CubeCamera(0.1, 1000, 1000); // near, far, cubeResolution
    this.scene.add(this.mCubeCamera);

    // create mirror material and mesh
    const geometry = new THREE.SphereGeometry( 2, 32, 32 );
    const material  = new THREE.MeshBasicMaterial({
      color: 'gold',
      envMap: this.mCubeCamera.renderTarget,
      side: THREE.DoubleSide
    });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(0, 0, 0);
    mesh.rotation.set(0, 0, 0);
    mesh.scale.set(1, 1, 1);
    // mesh.doubleSided = true;
    // mesh.castShadow = true;
    this.scene.add(mesh);
    /*
    var mirrorCubeMaterial = new THREE.MeshBasicMaterial({
      envMap: this.mCubeCamera.renderTarget,
      side: THREE.DoubleSide
    });
    this.mCube = new THREE.Mesh(new THREE.CubeGeometry(100, 100, 5, 1, 1, 1), mirrorCubeMaterial);
    this.mCube.position.set(1, 0, 1);
    this.mCubeCamera.position.copy(this.mCube.position);
    this.mCubeCamera.lookAt(new THREE.Vector3(0, 0, 0));
    this.scene.add(this.mCube);
    */
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

  drawFloor(parent, width, height) {
    const geometry = new THREE.PlaneGeometry(width, height);
    // const material = new THREE.MeshPhongMaterial({ 
    //   color: 0xFFFFFF,
    //   side: THREE.DoubleSide,
    //   specular: 0x009900, 
    //   shininess: 1, 
    //   shading: THREE.FlatShading,
    //   bumpMap: this.makeBump(),
    //   bumpScale: 1,
    // });

    const material = new THREE.MeshStandardMaterial({ 
      color: 0x11111f, 
      side: THREE.DoubleSide,
      // map: this.makeRoughnessMap(),
      roughness: 0.65,
      metalness: 0.35,
      bumpMap: this.makeBump(),
      bumpScale: 0.1,
      shading: THREE.FlatShading,
      roughnessMap: this.makeRoughnessMap(),
      metalnessMap: this.makeBump(),
    });

    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(0, -2.5, 0);
    mesh.rotation.set(0, 0, 0);
    mesh.rotation.x = de2ra(90);
    // mesh.castShadow = true;
    mesh.receiveShadow = true;
    parent.add(mesh);
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

  lights () {
    const options = [{
      color: 0xFF0000,
      intensity: 1,
      position: {x: 60, y: 30, z: 90},
      name: 'Back light'
    }, {
      color: 'blue',
      intensity: 1,
      position: {x: -120, y: 30, z: 0},
      name: 'Key light'
    }];

    // const lights = options.map(option => {
    //   const { color, intensity, position, name } = option;
    //   const light  = new THREE.DirectionalLight(color, intensity);
    //   light.position.set(position.x, position.y, position.z);
    //   light.name = name;
    //   return light;
    // })
    // .reduce((a, light) => {
    //   a.add(light);
    //   return a;
    // }, new THREE.Group());

    const lights = new THREE.Group();

    options.forEach(option => {
      const { color, intensity, position, name } = option;
      const light  = new THREE.DirectionalLight(color, intensity);
      light.position.set(position.x, position.y, position.z);
      light.castShadow = true;
      light.name = name;
      lights.add(light);
    });

    const spotLight = new THREE.SpotLight( 0xffffff );
    spotLight.position.set( 3, 40, 3 );
    spotLight.castShadow = true;
    spotLight.intensity = 0.5;
    lights.add(spotLight);

    lights.children.forEach(light => {
      const helper = new THREE[`${light.type}Helper`](light);
      this.updatees.push(helper);
      lights.add(helper);
    });

    return lights;
  }

  animate () {
    const { scene, camera, renderer, stats, controls, cameraHelper, updatees, composer, zoomBlurPass, bloomPass, dotScreenPass } = this;
    function render(time) {
      TWEEN.default.update(time);
      // renderer.render(scene, camera);
      composer.reset();
      composer.render( scene, camera );
      // composer.pass(zoomBlurPass);
      composer.pass(bloomPass);
      composer.pass(dotScreenPass);
      composer.toScreen();

      controls.update();
      updatees.forEach(helper => {
        // return helper.update();
      });
    }

    function loop(time) {
      stats.update();
      render(time);
      const animationId = requestAnimationFrame(loop.bind(this));
    }
    loop.apply(this, [performance.now()]);
  }
}





