import * as THREE from 'three';
import * as TWEEN from 'tween';
import * as OrbitControls from 'three-orbitcontrols';
import Stage from '../common/Stage';
import throttle from 'lodash/throttle';

const de2ra = function(degree) { 
  return degree*(Math.PI/180);
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
      }
    }, options);

    this.container = container;
    this.scene = new THREE.Scene();
    this.stage = new Stage(container);
    this.stats = this.stage.showStats();
    this.renderer = this.stage.createRenderer(this.options.view);
    this.renderer.setClearColor(0x333F47, 1);
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMapSoft = true;
    this.camera = this.stage.createCamera(this.options.view);

    // position and point the camera to the center of the scene
    this.camera.position.set(0, 8, 8);
    this.camera.lookAt(this.scene.position);
    this.scene.add(this.camera);
    this.controls = this.stage.setupControls();
    // this.drawSkyBox();
    this.drawFloor();
    this.g = new THREE.Group();
    this.drawCurve(this.g);
    this.drawCurve3(this.g);
    this.scene.add(this.g);
    // this.drawSimple();
    // this.drawReflectingObjects();
    // this.drawBox();
    // this.scene.add(this.drawTiny());
    // this.drawReflectingObjects();
    this.scene.add(this.lights());
    // this.g.rotation.x = de2ra(90);
    container.appendChild(this.renderer.domElement);
  }

  drawCurve (group) {
    const curve = new THREE.EllipseCurve(
      0,  0,            // ax, aY
      2, 2,             // xRadius, yRadius
      0,  2 * Math.PI,  // aStartAngle, aEndAngle
      false,            // aClockwise
      0                 // aRotation
    );

    this.path = new THREE.Path( curve.getPoints( 120 ) );
    
    var torus = this.drawTiny();
    group.add(torus);
    const me = this;

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
    return -( Math.atan( tangent.x / tangent.y));
  }

  move (mesh, path, position) {
    var up = new THREE.Vector3(0, 0, 1);
    // get the point at position
    var point = path.getPointAt(position);
    mesh.position.x = point.x;
    mesh.position.y = point.y;
    var angle = this.getAngle(path, position);
    // set the quaternion
    mesh.quaternion.setFromAxisAngle( up, angle );
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

  drawCurve3 (group) {
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
    const geometry = new THREE.TorusGeometry(0.5, 0.25, 16, 32)
    const material    = new THREE.MeshPhongMaterial({
      color: 'green'
    })
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(0, 0, 0);
    mesh.rotation.set(0, 0, 0);
    return mesh;
  }

  drawTiny (vertex) {
    const geometry = new THREE.BoxGeometry( 0.5, 0.5, 0.5 );
    const material    = new THREE.MeshPhongMaterial({
      color: 'red'
    })
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(0, 0, 0);
    mesh.rotation.set(0, 0, 0);
    return mesh;
  }

  drawBox (vertex) {
    const geometry = new THREE.BoxGeometry( 2, 2, 2 );
    // var material = new THREE.MeshLambertMaterial({
    //   color: 0x9C529C,
    //   transparent: true
    // });
    const material    = new THREE.MeshPhongMaterial({
      color: 'gold'
    })
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(0, 0, 0);
    mesh.rotation.set(0, 0, 0);
    mesh.scale.set(1, 1, 1);
    // mesh.doubleSided = true;
    // mesh.castShadow = true;
    this.scene.add(mesh);
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

  drawFloor() {
    const loader = new THREE.TextureLoader();
    const texture = loader.load( '/images/uv.jpg' )
    const geometry = new THREE.PlaneGeometry( 10, 10, 32 );
    const material = new THREE.MeshBasicMaterial({ 
      map: texture, 
      side: THREE.DoubleSide
    });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(0, -3, 0);
    mesh.rotation.set(0, 0, 0);
    mesh.rotation.x = de2ra(90);
    mesh.receiveShadow = true;
    this.scene.add(mesh);
  }

  drawSimple () {
    const geometry = new THREE.BoxGeometry( 2, 2, 2 );
    const material    = new THREE.MeshPhongMaterial({
      color: 'gold',
      envMap: this.reflectionCube
    })
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(0, 0, 0);
    mesh.rotation.set(0, 0, 0);
    mesh.scale.set(1, 1, 1);
    // mesh.doubleSided = true;
    // mesh.castShadow = true;
    this.scene.add(mesh);
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
      color: 'white',
      intensity: 0.15,
      position: {x: 6, y: 3, z: 9},
      name: 'Back light'
    }, {
      color: 'white',
      intensity: 0.35,
      position: {x: -6, y: -3, z: 0},
      name: 'Key light'
    }, {
      color: 'white',
      intensity: 0.55,
      position: {x: 9, y: 9, z: 6},
      name: 'Fill light'
    }];

    const lights = options.map(option => {
      const { color, intensity, position, name } = option;
      const light  = new THREE.DirectionalLight(color, intensity);
      light.position.set(position.x, position.y, position.z);
      light.name = name;
      return light;
    })
    .reduce((a, light) => {
      a.add(light);
      return a;
    }, new THREE.Group());

    var spotLight = new THREE.SpotLight( 0xffffff );
    spotLight.position.set( 3, 30, 3 );
    spotLight.castShadow = true;
    spotLight.shadow.mapSize.width = 2048;
    spotLight.shadow.mapSize.height = 2048;
    spotLight.shadow.camera.near = 1;
    spotLight.shadow.camera.far = 4000;
    spotLight.shadow.camera.fov = 45;
    lights.add( spotLight );

    return lights;
  }

  makeRings (radius) {

    const geometry = new THREE.BoxGeometry(1600, 1600, 0.1, 40, 40);
    const material = new THREE.MeshBasicMaterial( {color: 0xffff00, side: THREE.DoubleSide} );
    const plane = new THREE.Mesh( geometry, material );
    return plane;

    /*
    const geometry = new THREE.PlaneGeometry( 500, 500, 32 );
    const material = new THREE.MeshBasicMaterial( {color: 0xffff00, side: THREE.DoubleSide} );
    const plane = new THREE.Mesh( geometry, material );
    return plane;
    */
    /*
    const loader = new THREE.TextureLoader();
    const material = new THREE.MeshBasicMaterial( {
      color: 0xFFFFFF,
      blending: THREE.NormalBlending,
      wireframe: true
    });
    const geometry = new THREE.SphereGeometry( radius, 32, 32 );
    const sphere = new THREE.Mesh( geometry, material );
    return sphere;
    */
  }
  animate () {
    const { scene, camera, renderer, stats, options, controls } = this;
    function render(time) {
      // planet.rotation.y -= options.rotationSpeed;
      TWEEN.default.update(time);
      renderer.render(scene, camera);
      controls.update();
    }

    function loop(time) {
      stats.update();
      // this.timerNow = time;
      // if(time >= this.future && this.toggle) {
      //   const { latitude, longitude } = this.place;
      //   this.center(latitude, longitude);
      //   this.toggle = false;
      // }
      render(time);
      const animationId = requestAnimationFrame(loop.bind(this));
    }
    loop.apply(this, [performance.now()]);
  }
}





