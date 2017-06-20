import * as THREE from 'three';
import * as TWEEN from 'tween';
import * as OrbitControls from 'three-orbitcontrols';
import Stage from '../common/Stage';
import Maps from './Maps';
import Widgets from './Widgets';
import throttle from 'lodash/throttle';


console.log(TWEEN);

export default class Globe {
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
      world: {
        radius: 500,
        width: 480,
        height: 240,
        atlas: 'https://unpkg.com/world-atlas@1.1.4/world/50m.json'
      },
      rotationSpeed: .005
    }, options);

    this.container = container;
    this.scene = new THREE.Scene();
    this.stage = new Stage(container);
    this.stats = this.stage.showStats();
    this.renderer = this.stage.createRenderer(this.options.view);
    this.camera = this.stage.createCamera(this.options.view);
    this.scene.add(this.camera);

    this.controls = this.stage.setupControls();
    // this.helpers();

    // this.world = new THREE.Group();
    this.planet = new THREE.Group();


    // const land = new Maps(this.planet, this.options.world);
    this.planet.add(this.fakeEarth(this.options.world.radius));
    // const widgets = new Widgets(this.options);
    // this.planet.add(widgets.elements);

    // this.planet.add(this.darkEarth(this.options.world.radius));

    // // australia ‎lat long: -33.856159, 151.215256
    // this.planet.add(new Marker(-34.603722, -58.381592, this.options.world.radius, 'Argentina')) // argentina buenos aires

    // this.world.add(this.planet);

    // this.world.rotation.z = .465;
    // this.world.rotation.x = .3;
    //this.planet.rotation.y = 9

    // this.scene.add(this.world);
    this.scene.add(this.planet);
    container.appendChild(this.renderer.domElement);

    // const route = this.drawFlightPath()
    // this.planet.add(route);

    // setTimeout(() => {
    //   route.remove()
    // }, 10000)

    container.addEventListener('center', event => {
      const { latitude, longitude } = event.detail.place;
      const { offset, trigger, now } = event.detail;

      this.place = event.detail.place;
      console.log('future', this.timerNow, offset, now, trigger, (trigger - now));
      this.future = (this.timerNow + (trigger - now));
      this.future += offset;
      this.toggle = true;
    }, false);

    container.addEventListener('start:animationId', event => {
      // this.animate();
    });

    // document.addEventListener('interact', event => {
    //   const camera = event.detail;
    //   if (this.camera.uuid == camera.uuid) {
    //     return;
    //   }
    //   // https://stackoverflow.com/questions/30731469/three-js-switching-between-cameras-and-controls
    //   this.camera.position.copy(camera.position);
    //   this.camera.rotation.copy(camera.rotation);
    // }, false);

    document.addEventListener('interact', event => {
      const { position, rotation } = event.detail;
      // if (this.camera.uuid == camera.uuid) {
      //   return;
      // }
      // https://stackoverflow.com/questions/30731469/three-js-switching-between-cameras-and-controls
      this.camera.position.copy(position);
      this.camera.rotation.copy(rotation);
    }, false);

    // this.controls.addEventListener('change', ({target}) => {
      // const camera = target.object;
      // const dispatch = _.throttle(() => {
        // const event = new CustomEvent('sendToSocket', { detail: camera });
        // document.dispatchEvent(event);
        // console.log(camera)
      // }, 100, { trailing: false });
      // const event = new CustomEvent('interact', {detail: camera});
      // const event = new CustomEvent('sendToSocket', {detail: camera});
      // document.dispatchEvent(event);
    // }, false);

    this.controls.addEventListener('change', throttle(this.dispatch, 100, { trailing: true }));
  }

  dispatch ({target}) {
    const camera = target.object;
    const event = new CustomEvent('sendToSocket', { detail: camera });
    document.dispatchEvent(event);
  }

  drawFlightPath () {
    let origin = {
      latitude: -34.603722,
      longitude: -58.381592
    };
    let destination = {
      latitude: 25.778135,
      longitude: -80.17910
    };

    const path = new Path(origin, destination, this.options.world.radius);
    origin = path.mapPoint(-34.603722, -58.381592, this.options.world.radius);
    destination = path.mapPoint(25.778135, -80.179100, this.options.world.radius);
    // return path.buildPath(origin, destination);
    setTimeout(() => {
      console.log('path.route.remove()')
      path.remove()
    }, 6000)
    return path.route;
  }

  drawFlightPathXX () {
    const path = new Path();
    const origin = path.mapPoint(-34.603722, -58.381592, this.options.world.radius);
    const destination = path.mapPoint(-33.841049, 151.242188, this.options.world.radius);

    const tube = path.arc(origin, destination);

    const material = new THREE.LineBasicMaterial({
      color: 0x00ff00,
      linewidth: 3,
      transparent: true,
      opacity: 0.8
    })
    const mesh = new THREE.Mesh( tube, material );
    this.planet.add( mesh );
  }

  animate () {
    const { scene, camera, renderer, stats, planet, options, controls } = this;
    function render(time) {
      // planet.rotation.y -= options.rotationSpeed;
      TWEEN.default.update(time);
      renderer.render(scene, camera);
      controls.update();
    }

    const tween = new TWEEN.default.Tween(planet.rotation)
      .to({
        y: Math.PI * 2
      }, 15000)
      .repeat(Infinity)
      // .start();

    function loop(time) {
      stats.update();
      this.timerNow = time;
      if(time >= this.future && this.toggle) {
        const { latitude, longitude } = this.place;
        this.center(latitude, longitude);
        this.toggle = false;
      }
      render(time);
      const animationId = requestAnimationFrame(loop.bind(this));
    }
    loop.apply(this, [performance.now()]);
  }

  setupControls () {
    const { scene, camera, renderer } = this;
    //controls
    const controls = new OrbitControls.default(camera, renderer.domElement);
    controls.target.set(0, 0, 0);
    controls.enableDamping = true;
    controls.dampingFactor = 0.07;
    controls.rotateSpeed = 0.04;
    controls.zoomSpeed = 1;
    controls.panSpeed = 0.008;
    return controls;
  }

  lights () {
    const ambientLight = new THREE.AmbientLight(0xff0000);
    const spotLight = new THREE.DirectionalLight(0xffffff, 1);
    // spotLight.position.set(5,3,5);
    spotLight.position.set(100, 1, 0);
    spotLight.target = this.planet;

    // this.scene.add(ambientLight);
    this.scene.add(spotLight);
    // this.scene.add(spotLightLeft);
    console.info('lights done');
  }



  center (latitude, longitude, delay = 2000) {
    //const verticalOffset = 0.1;
    const { planet } = this;
    const verticalOffset = 0;
    const tween = new TWEEN.default.Tween(planet.rotation)
    .to({
      x: latitude * ( Math.PI / 180 ) - verticalOffset,
      y: ( 90 - longitude ) * ( Math.PI / 180 )
    }, delay)
    .easing(TWEEN.default.Easing.Quartic.InOut)
    .start();
  }

  fakeEarth (radius) {
    const loader = new THREE.TextureLoader();
    const material = new THREE.MeshBasicMaterial( {
      color: 0xFFFFFF,
      blending: THREE.NormalBlending,
      wireframe: true
    });
    const geometry = new THREE.SphereGeometry( radius, 32, 32 );
    const sphere = new THREE.Mesh( geometry, material );
    return sphere;
  }

  darkEarth (radius) {
    const loader = new THREE.TextureLoader();
    // const material = new THREE.MeshBasicMaterial( {
    //   color: 0x000000,
    //   blending: THREE.NormalBlending,
    //   transparent: true,
    //   opacity: 0.8
    // });
    const material = new THREE.MeshPhongMaterial({
      color: 0x000000,
      specular: 0x111111,
      shininess: 100,
      blending: THREE.NormalBlending,
      transparent: true,
      opacity: 0.8
    });
    const geometry = new THREE.SphereGeometry( radius - 2, 64, 64 );
    const sphere = new THREE.Mesh( geometry, material );
    return sphere;
  }
}





