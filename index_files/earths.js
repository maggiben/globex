const filter = function (geo, names) {
  var features = geo.features.filter(feature => {
    return names.indexOf(feature.properties.name.toLowerCase()) > -1;
  });
  var [x, ...z] = features;
  var union = z.reduce((a, b) => {
    return turf.union(a, b);
  }, x);
  return union;
}

const XYZtoPoint = function (x, y, z, radius) {
  const latitude = 90 - (Math.acos(y / radius)) * 180 / Math.PI;
  const longitude = ((270 + (Math.atan2(x , z)) * 180 / Math.PI) % 360) -180;
  return turf.point([longitude, latitude])
}


const FizzyText = function() {
  this.message = 'dat.gui';
  this.speed = 0.8;
  this.displayOutline = false;
  this.explode = function() {

  };
  this.core = false;
  this.orbit = false;
  this.ticks = false;
  this.lines = false;
  this.marker = false;
  this.topu = false;
  // Define render logic ...
};

const listeners = function (gui, globe) {
  const text = new FizzyText();
  const globeWidgets = gui.addFolder('widgets')
  const widgets = {
    'core': {
      enabled: false,
      instance: null,
      tween: null
    }, 
    'orbit': {
      enabled: false,
      instance: null,
      tween: null
    }, 
    'ticks': {
      enabled: false,
      instance: null,
      tween: null
    }, 
    'lines': {
      enabled: false,
      instance: null,
      tween: null
    }, 
    'marker': {
      enabled: false,
      instance: null,
      tween: null
    }, 
    'topu': {
      enabled: false,
      instance: null,
      tween: null
    }
  }
  
  const controllers = Object.keys(widgets).reduce(function (map, widget) {
    map[widget] = globeWidgets.add(text, widget, widgets[widget]);
    return map;
  }, {});

  controllers.core.onChange(value => {
    if (value) {
      widgets.core.instance = globe.core();
      globe.planet.add(core);
    } else if (!value && widgets.core.instance) {
      globe.planet.remove(widgets.core.instance);
    }
  });

  return controllers;
}

const makeEarth = async function () {
  const container = document.getElementById('container');

  const text = new FizzyText();
  const gui = new dat.GUI();
  gui.add(text, 'message');
  gui.add(text, 'speed', -5, 5);
  // const objects = gui.addFolder('objects')
  try {
    const countries = await axios.get('https://raw.githubusercontent.com/johan/world.geo.json/master/countries.geo.json');
    const globe = new Globe(container, countries.data);
    listeners(gui, globe);
    globe.animate();
  } catch (error) {
    return error;
  }
}

class Globe {
  constructor (container, countries) {
    this.options = {
      radius: 400
    }
    
    this.stats = this.showStats();
    this.countries = countries;
    this.renderer = this.createRenderer();
    this.universe = this.universe();
    // this.dish();
    // this.background();

    this.setupControls()
    
    this.planet = new THREE.Group();
    
    // this.planet.add(this.core());
    // this.planet.add(this.orbit());
    // this.planet.add(this.ticks());
    // this.planet.add(this.lines());
    this.lights();
    this.planet.add(this.darkEarth())
    this.planet.add(this.globe());

    // australia ‎lat long: -33.856159, 151.215256  
    // this.planet.add(new Marker(-34.603722, -58.381592, 400)) // argentina buenos aires
    // this.planet.add(new Marker(9.0831986,-79.5924029, 400))
    // this.planet.add(this.topu({r: 1.03, color: '0x00a2ff'}))

    this.world = new THREE.Group();
    this.world.add(this.planet);

    

    // this.world.rotation.z = .465;
    // this.world.rotation.x = .3;
    //this.planet.rotation.y = 9

    this.scene.add(this.world);
    container.appendChild(this.renderer.domElement);
    console.log('done')
  }

  showStats () {
    const stats = new Stats();
    stats.showPanel( 0 ); // 0: fps, 1: ms, 2: mb, 3+: custom
    document.getElementById('stats').append( stats.domElement );
    return stats;
  }

  animate () {
    const { scene, camera, renderer } = this;
    const globe = this.planet;
    const me = this;

    function render(time) {
      globe.rotation.y -= .005;
      TWEEN.update(time);
      renderer.render(scene, camera);
    }

    function loop(time) {
      me.stats.update();
      // me.stats.begin();
      render(time);
      // me.stats.end();
      const animationId = requestAnimationFrame(loop);
      //me.controls.update();
    }
    loop()
  }

  createRenderer () {
    let renderer = new THREE.WebGLRenderer({
      antialias: true,
      clearAlpha: 1
    });
    renderer.setClearColor(0x000000);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    return renderer;
  }

  universe () {
    this.scene = new THREE.Scene();
    // this.scene.fog = new THREE.FogExp2( 0x000000, 0.0005 );
    this.camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 1, 3000);
    this.camera.position.z = 1400;
    this.scene.add(this.camera);
  }

  setupControls () {
    const { scene, camera, renderer } = this;
    const controls = new THREE.TrackballControls( camera );

    controls.rotateSpeed = 1.0;
    controls.zoomSpeed = 1.2;
    controls.panSpeed = 0.8;

    controls.noZoom = false;
    controls.noPan = false;

    controls.staticMoving = true;
    controls.dynamicDampingFactor = 0.3;

    controls.keys = [ 65, 83, 68 ];

    // controls.addEventListener( 'change', render );
    this.controls = controls;
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
    console.info('lights done')
  }
  
  dish () {
    const loader = new THREE.TextureLoader();
    const dishMaterial = new THREE.MeshBasicMaterial( { 
      opacity: 1,  
      map: loader.load( 'images/lights.jpg' ), 
      blending: THREE.AdditiveBlending, 
      transparent:true,
      opacity: 0.5
    });
    const dish = new THREE.Mesh( new THREE.PlaneGeometry( 1920, 1200, 1, 1 ), dishMaterial );
    dish.scale.x = dish.scale.y = .15;
    dish.position.z += 1200;

    this.scene.add(dish);
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
  
  core () {
    const coreGeometry = new THREE.Geometry();
        
    for (var i = 0; i < 1800; i++) {

      let radius = Math.random() * 380;
      let longitude = Math.PI - (Math.random() * (2*Math.PI));
      let latitude =  (Math.random() * Math.PI);

      let x = radius * Math.cos(longitude) * Math.sin(latitude);
      let z = radius * Math.sin(longitude) * Math.sin(latitude);
      let y = radius * Math.cos(latitude);    

      coreGeometry.vertices.push( new THREE.Vector3( x, y, z ) );               

    }   
      
    const loader = new THREE.TextureLoader();
    const coreMaterial = new THREE.PointsMaterial( { 
      size: 12,
      map: loader.load( "textures/sprites/circle.png" ) , 
      depthTest: false,  
      blending: THREE.AdditiveBlending, 
      transparent : true,
      opacity: 0
    });
    coreMaterial.color.setHSL( .65, .0, .5 );

    const coreParticles = new THREE.Points( coreGeometry, coreMaterial );
    coreParticles.updateMatrix();
        
    new TWEEN.Tween( coreMaterial)
      .delay(500)
      .to( {opacity: 1}, 4000)
      .easing(TWEEN.Easing.Quartic.Out)
      .start();       
    
    coreParticles.scale.x = .1;
    coreParticles.scale.y = .1;
    new TWEEN.Tween( coreParticles.scale )
      .delay( 200 )
      .to( { x: 1, y: 1 }, 2000 )
      .easing(TWEEN.Easing.Quartic.Out)
      .start();
    
    return coreParticles;
  }

  lines () {
    const lineGeometry = new THREE.Geometry();
    const lineRadius = 480;
    const loader = new THREE.TextureLoader();

    for (var longitude = 2*Math.PI; longitude >= 0; longitude-=Math.PI/12) {
      for (var latitude= 0; latitude <= Math.PI; latitude+=Math.PI/30) {
        const x = lineRadius * Math.cos(longitude) * Math.sin(latitude);
        const z = lineRadius * Math.sin(longitude) * Math.sin(latitude);
        const y = lineRadius * Math.cos(latitude);                        

        const vector = new THREE.Vector3( x, y, z );
        lineGeometry.vertices.push(vector);                        
      }   
    }           

    const lineMaterial = new THREE.PointsMaterial( { 
      size: 12,
      map: loader.load( "textures/sprites/circle.png" ) , 
      depthTest: false,  
      blending: THREE.AdditiveBlending, 
      transparent : true 
    });

    lineMaterial.color.setHSL( .55, .45, 1.4 );

    const lineParticles = new THREE.Points( lineGeometry, lineMaterial );
    //lineParticles.sortParticles = true;
    lineParticles.updateMatrix();  

    return lineParticles;
  }

  ticks () {
    const ticks = new THREE.Group();
    const lineRadius = 480;

    const tickMaterial = new THREE.LineBasicMaterial( { 
      linewidth: 1, 
      depthTest: false,  
      blending: THREE.AdditiveBlending, 
      transparent : true,
      opacity: 0
    });
    //tickMaterial.color.setRGB( .8, .2, .2 );
    tickMaterial.color.setHSL( .65, .0, 1.0 );

    for (var longitude = 2*Math.PI; longitude >= Math.PI/30; longitude-=Math.PI/30) {
      //for (var latitude= 0; latitude <= Math.PI; latitude+=Math.PI/4) {
      const tickGeometry = new THREE.Geometry();
      const latitude = Math.PI /2;          
                          
      const x = lineRadius * Math.cos(longitude) * Math.sin(latitude);
      const z = lineRadius * Math.sin(longitude) * Math.sin(latitude);
      const y = lineRadius * Math.cos(latitude);                        
  
      const xb = (lineRadius + 15) * Math.cos(longitude) * Math.sin(latitude);
      const zb = (lineRadius + 15) * Math.sin(longitude) * Math.sin(latitude);
      const yb = (lineRadius + 15) * Math.cos(latitude); 
  
      const vectora = new THREE.Vector3( x, y, z );
      const vectorb = new THREE.Vector3( xb, yb, zb );
      
      tickGeometry.vertices.push( vectora );
      tickGeometry.vertices.push( vectorb );
      
      const tick = new THREE.Line( tickGeometry, tickMaterial, THREE.LineStrip );
      ticks.add( tick );
    }

    new TWEEN.Tween( tickMaterial)
      .to({
        opacity: .5
      }, 2000)
      .delay(1000)        
      .easing(TWEEN.Easing.Quartic.Out)
      .start();

    return ticks;
  }

  topu () {
    const options = {
      r: 440,
      color: 0xFFFFFF
    };
    const group = new THREE.Group();
    const geometry = new THREE.IcosahedronGeometry(options.r, 2);
    const basicMeterial = new THREE.MeshBasicMaterial({
      color: options.color,
      wireframe: true,
      transparent: true,
      blending: THREE.AdditiveBlending, 
      opacity: 0.07
    });
    const mesh = new THREE.Mesh(geometry, basicMeterial);
    const pointMaterial = new THREE.PointsMaterial({
      color: options.color,
      size: 8,
      transparent: true,
      blending: THREE.AdditiveBlending, 
      opacity: 0.03,
      // alphaTest: 0.5
    });
    const points = new THREE.Points(geometry, pointMaterial);
    group.add(mesh, points);
    console.log('topu2')
    return group;
  }

  orbit () {
    let orbitGeometry = new THREE.Geometry();
    
    for (var i = 0; i < 600; i++) {
    
      let radius = 400 + (Math.random() * 800);
      let longitude = Math.PI - (Math.random() * (2*Math.PI));
      let latitude =  (Math.random() * Math.PI);

      let x = radius * Math.cos(longitude) * Math.sin(latitude);
      let z = radius * Math.sin(longitude) * Math.sin(latitude);
      let y = radius * Math.cos(latitude);    

      orbitGeometry.vertices.push( new THREE.Vector3( x, y, z ) );           
    
    }
    const loader = new THREE.TextureLoader();
    let orbitMaterial = new THREE.PointsMaterial( { 
      size: 12,
      map: loader.load( "textures/sprites/circle.png" ) , 
      depthTest: false,  
      blending: THREE.AdditiveBlending, 
      transparent : true,
      opacity: 0
    });
    orbitMaterial.color.setHSL( .65, .0, .5 );

    let orbitParticles = new THREE.Points( orbitGeometry, orbitMaterial );
    orbitParticles.updateMatrix();
        
    new TWEEN.Tween( orbitMaterial)
      .delay(500)
      .to( {opacity: 1}, 4000)
      .easing(TWEEN.Easing.Quartic.Out)
      .start();                   
        
    orbitParticles.scale.x = .1;
    orbitParticles.scale.y = .1;
    new TWEEN.Tween( orbitParticles.scale )
      .delay( 200 )
      .to( { x: 1, y: 1 }, 2000 )
      .easing(TWEEN.Easing.Quartic.Out)
      .start();     

    return orbitParticles;
  }

  mapPoint (latitude, longitude, radius) {
    let curLat = 90 - latitude;
    let curLong = 180 - longitude;
    
    curLong *= Math.PI/180;
    curLat *= Math.PI/180;
         
    const x = radius * Math.cos(curLong) * Math.sin(curLat);
    const z = radius * Math.sin(curLong) * Math.sin(curLat);
    const y = radius * Math.cos(curLat); 

    return {x, y, z};
  }

  center (latitude, longitude, delay = 2000) {
    //const verticalOffset = 0.1;
    const verticalOffset = 0;
    let tween = new TWEEN.Tween(this.planet.rotation)
    .to({ 
      x: latitude * ( Math.PI / 180 ) - verticalOffset, 
      y: ( 90 - longitude ) * ( Math.PI / 180 ) 
    }, delay)
    .easing(TWEEN.Easing.Quartic.InOut)
    .start();
  }

  highlightRegions (regions) {
    const region = filter(this.countries, [].concat(regions)); //'argentina', 'australia'

    let earthColors = [];
    let colorIndex = 0;
    var xIndex = 0;
    for (let longitude = 2*Math.PI; longitude >= 0; longitude-=2*Math.PI/(480)) {
      var yIndex = 0;
      for (let latitude= 0; latitude <= Math.PI; latitude+=Math.PI/(240)) {
        if (mapData[yIndex][xIndex] == 0) {
          
          const x = this.options.radius * Math.cos(longitude) * Math.sin(latitude);
          const z = this.options.radius * Math.sin(longitude) * Math.sin(latitude);
          const y = this.options.radius * Math.cos(latitude);

          const point = XYZtoPoint(x, y, z, this.options.radius);

          if(turf.inside(point, region)) {
            this.tgeometry.colors[colorIndex].set(0xff0000)
          }
          colorIndex++;
        }
        yIndex++;
      }
      xIndex++;
    }

    //this.tgeometry.colors = earthColors;
    this.tgeometry.colorsNeedUpdate = true;
  }

  darkEarth () {
    const loader = new THREE.TextureLoader();
    const material = new THREE.MeshBasicMaterial( { 
      // map: loader.load( '../images/basic.jpg' ),
      color: 0x000000,
      blending: THREE.NormalBlending,
      transparent: true,
      opacity: 0.8
    });
    const phongMaterial = new THREE.MeshPhongMaterial({
      // map: loader.load( '../images/basic.jpg' ),
      color: 0x000000,
      blending: THREE.NormalBlending,
      transparent: true,
      opacity: 0.8
    })

    const geometry = new THREE.SphereGeometry( 398, 32, 32 );
    // const material = new THREE.MeshBasicMaterial({
    //   color: 0xCCCCCC,
    //   opacity: 0.5,
    //   transparent : true,
    //   blending: THREE.NormalBlending,
    //   // wireframe: true
    // });
    const sphere = new THREE.Mesh( geometry, material );
    return sphere;
  }

  // "NoBlending", "NormalBlending", "AdditiveBlending", "SubtractiveBlending", "MultiplyBlending"
  globe (country) {
    const loader = new THREE.TextureLoader();
    const tmaterial = new THREE.PointsMaterial({
      size: 4,
      vertexColors: THREE.VertexColors,
      // map: loader.load( "textures/sprites/circle.png" ),
      // depthTest: false,
      blending: THREE.NormalBlending,
      side: THREE.DoubleSide,
      // transparent: true,
      // opacity: 1,
      // lights: true
    });

    const tgeometry = new THREE.Geometry();
    const pointCloud = new THREE.Points(tgeometry, tmaterial);
    pointCloud.updateMatrix();

    let earthColors = [];
    let colorIndex = 0;
    var xIndex = 0;
    for (let longitude = 2*Math.PI; longitude >= 0; longitude-=2*Math.PI/(480)) {
      var yIndex = 0;
      for (let latitude= 0; latitude <= Math.PI; latitude+=Math.PI/(240)) {
        if (mapData[yIndex][xIndex] == 0) {
          
          const x = this.options.radius * Math.cos(longitude) * Math.sin(latitude);
          const z = this.options.radius * Math.sin(longitude) * Math.sin(latitude);
          const y = this.options.radius * Math.cos(latitude);

          tgeometry.vertices.push(new THREE.Vector3(x, y, z));
          earthColors[ colorIndex ] = new THREE.Color( 0x1b9ebc );

          colorIndex++;
        }
        yIndex++;
      }
      xIndex++;
    }

    tgeometry.colors = earthColors;
    this.tgeometry = tgeometry;
    //tgeometry.verticesNeedUpdate = true;
    //tgeometry.computeVertexNormals();

    return pointCloud;
  }
}





