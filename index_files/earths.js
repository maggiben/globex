
const imageSrc = `
data:image/png;base64,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
`

const capitals = {
  'argentina': [-34.603722, -58.381592],
  //'australia': [‎-33.841049, ‎151.242188]
};

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
    'core': true, 
    'orbit': false, 
    'ticks': false, 
    'lines': false, 
    'marker': false, 
    'topu': false
  }
  
  const controllers = Object.keys(widgets).reduce(function (map, widget) {
    map[widget] = globeWidgets.add(text, widget, widgets[widget]);
    return map;
  }, {});

  controllers.core.onChange(value => {
    if (value) {
      controllers.core.instance = globe.core();
      globe.planet.add(controllers.core.instance);
    } else if (!value && controllers.core.instance) {
      globe.planet.remove(controllers.core.instance);
    }
  });
  /*controllers.speed.onChange(value => {
    console.log('value', value)
    return
    if (value) {
      controllers.core.instance = globe.core();
      globe.planet.add(controllers.core.instance);
    } else if (!value && controllers.core.instance) {
      globe.planet.remove(controllers.core.instance);
    }
  });
  */
  return controllers;
}

const makeEarth = async function () {
  const container = document.getElementById('container');
  const gui = new dat.GUI();
  try {
    const countries = await axios.get('https://raw.githubusercontent.com/johan/world.geo.json/master/countries.geo.json');
    const globe = new Globe(container, countries.data);
    window.globe = globe;
    listeners(gui, globe);
    globe.animate();
  } catch (error) {
    return error;
  }
}

class Globe {
  constructor (container, countries) {
    this.options = {
      radius: 600,
      map: {
        size: {
          width: 960,
          height: 480
        },
        uri: 'https://unpkg.com/world-atlas@1.1.4/world/50m.json'
      },
      rotationSpeed: .005
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
    // this.planet.add(this.orbit(this.options.radius, 600));
    // this.planet.add(this.ticks());
    // this.planet.add(this.lines());
    // this.lights();
    this.planet.add(this.darkEarth(this.options.radius));

    const path = new Path();
    const origin = path.latLonToVector3(-34.603722, -58.381592);
    const destination = path.latLonToVector3(22.286394, 114.149139);
    const linePoints = path.bezierCurveBetween(origin, destination);
    const geometry = path.getGeom(linePoints);

    const material = new THREE.LineBasicMaterial({
      linewidth: 20,
      color: 0xFF0000
    });

    const line = new THREE.Line(geometry, material);

    this.scene.add(line);

    // // australia ‎lat long: -33.856159, 151.215256  
    // this.planet.add(new Marker(-34.603722, -58.381592, this.options.radius, 'Argentina')) // argentina buenos aires
    // this.planet.add(new Marker(9.0831986,-79.5924029, 400))
    // this.planet.add(this.topu({r: 1.03, color: '0x00a2ff'}))

    this.world = new THREE.Group();
    this.world.add(this.planet);

    this.world.rotation.z = .465;
    this.world.rotation.x = .3;
    //this.planet.rotation.y = 9

    this.scene.add(this.world);
    container.appendChild(this.renderer.domElement);
    // this.makeBW()
    // this.loadImage()
    this.makeMaps(this.countries, 960, 480) 

    return;

    // postprocessing
    console.log('cool', this.scene, this.camera)
    const renderModel = new THREE.RenderPass( this.scene, this.camera );
    console.log('renderModel')
    var effectBloom = new THREE.BloomPass( 0.75 );
    var effectFilm = new THREE.FilmPass( 0.5, 0.5, 1448, false );
    effectFocus = new THREE.ShaderPass( THREE.FocusShader );
    effectFocus.uniforms[ "screenWidth" ].value = window.innerWidth;
    effectFocus.uniforms[ "screenHeight" ].value = window.innerHeight;
    effectFocus.renderToScreen = true;
    const composer = new THREE.EffectComposer( this.renderer );
    composer.addPass( renderModel );
    composer.addPass( effectBloom );
    composer.addPass( effectFilm );
    composer.addPass( effectFocus );

  }

  async makeMaps (countries, width, height) {
    let mapData = Array(height).fill(0).map(() => Array(width).fill(0));
    const world = await axios.get('https://unpkg.com/world-atlas@1.1.4/world/50m.json').then(world => world.data);

    const canvas = document.createElement('canvas');
    // const canvas = document.querySelector('#canvas');
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext('2d');
    countries = topojson.feature(world, world.objects.countries).features;
    const projection = d3.geoEquirectangular().scale(height / Math.PI).translate([width / 2, height / 2])//.fitSize([width, height], topojson.feature(world, world.objects.land));
    const path = d3.geoPath(projection, context);
    
    const neighbors = topojson.neighbors(world.objects.countries.geometries);

    //const features = topojson.feature(world, world.objects.counties)
    //const features = topojson.feature(countries, countries);

    context.beginPath();
    context.fillStyle = '#F00';
    context.strokeStyle = '#F00';
    context.lineWidth = 0.005;
    //path(topojson.feature(world, world.objects.countries));
    path(topojson.feature(world, world.objects.land));
    //context.stroke();
    context.fill();


    const imageData = context.getImageData(0, 0, width, height);

    for (let row = 0; row < imageData.height; row++) {
      for (let col = 0; col < imageData.width; col++) {
        const R = imageData.data[(row * imageData.width + col) * 4 + 0];
        mapData[row][col] = !R;
      }
    }

    console.log('sale', imageData)
    this.planet.add(this.globe(mapData));
  }

  loadImageuuu () {
    const img = new Image();
    let mapData = Array(240).fill(0).map(() => Array(480).fill(0));
    const imageLoaded = event => {
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      const width = canvas.width = 480;
      const height = canvas.height = 240;

      context.drawImage(img, 0, 0);

      const imageData = context.getImageData(0, 0, width, height);
      for(var i = 0; i < imageData.data.length; i+=4) {
        const x = (i / 4) % width;
        const y = Math.floor((i / 4) / width);
        /*
        imageData.data[i + 0] = 0;
        imageData.data[i + 1] = 0;
        imageData.data[i + 2] = 255;
        imageData.data[i + 3] = 64;
        */
        
      }
      for (let row = 0; row < imageData.height; row++) {
        for (let col = 0; col < imageData.width; col++) {
          const R = imageData.data[(row * imageData.width + col) * 4 + 0];
          mapData[row][col] = !R;
        }
      }
      this.planet.add(this.globe(mapData));
      // this.planet.add(this.darkEarth());
    }
    img.src = 'images/edges.png';
    img.onload = imageLoaded;
  }

  loadImagex (src) {
    return new Promise((resolve, reject) => {
      const image = new Image();
      const imageLoaded = event => {
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        const width = canvas.width = 480;
        const height = canvas.height = 240;
        context.drawImage(img, 0, 0);
        const imageData = context.getImageData(0, 0, width, height);
        return resolve(imageData)
      }
      img.src = src;
      img.onload = imageLoaded;
    });
  }

  showStats () {
    const stats = new Stats();
    stats.showPanel(0); // 0: fps, 1: ms, 2: mb, 3+: custom
    document.getElementById('stats').append( stats.domElement );
    return stats;
  }

  animate () {
    const { scene, camera, renderer } = this;
    const globe = this.planet;
    const me = this;

    function render(time) {
      globe.rotation.y -= me.options.rotationSpeed;
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
      // antialias: true,
      // clearAlpha: 1
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
  
  makeBW () {
    const canvas = document.getElementById('map');
    const width = canvas.width = 480;
    const height = canvas.height = 240;
    const context = canvas.getContext('2d');
    const imageData = context.createImageData(width, height);

    context.fillStyle="red";
    context.fillRect(10,10,50,50);

    for(var i=0; i < imageData.data.length; i+=4) {
      imageData.data[i]=0;
      imageData.data[i+1]=0;
      imageData.data[i+2]=255;
      imageData.data[i+3]=64;
    }


    console.log('width: %s, height: %s', imageData.width, imageData.height)

    for (let row = 0; row < imageData.height; row++) {
      for (let col = 0; col < imageData.width; col++) {
        // imageData.data[(row + col) + 0] = 255
        // imageData.data[(row + col) + 1] = 0
        // imageData.data[(row + col) + 2] = 255
        // imageData.data[(row + col) + 3] = 64
        imageData.data[(row * imageData.width + col) * 4 + 0] = mapMatrix[row][col] * 255;
        imageData.data[(row * imageData.width + col) * 4 + 1] = mapMatrix[row][col] * 255;
        imageData.data[(row * imageData.width + col) * 4 + 2] = mapMatrix[row][col] * 255;
        imageData.data[(row * imageData.width + col) * 4 + 3] = 255;
      }
    }

    context.putImageData(imageData, 0, 0);
    /*

    const data = imageData.data;
    console.log(data)
    for (let i = 0; i < data.length; i += 4) {
      data[i]     = 255;     // red
      data[i + 1] = 255;
      data[i + 2] = 0;
    }
    console.log(data)
    context.putImageData(imageData, 0, 0);

    var imagedata = context.getImageData(0, 0, 100, 100);
    // use the putImageData function that illustrates how putImageData works
    putImageData(context, imagedata, 150, 0, 50, 50, 25, 25);

    */
  }
  // 
  core (radius, amount = 1800) {
    const coreGeometry = new THREE.Geometry();
        
    for (var i = 0; i < 1800; i++) {

      let spread = Math.random() * radius;
      let longitude = Math.PI - (Math.random() * (2*Math.PI));
      let latitude =  (Math.random() * Math.PI);

      let x = spread * Math.cos(longitude) * Math.sin(latitude);
      let z = spread * Math.sin(longitude) * Math.sin(latitude);
      let y = spread * Math.cos(latitude);    

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

  orbit (radius, amount = 600) {
    let orbitGeometry = new THREE.Geometry();
    
    for (var i = 0; i < amount; i++) {
    
      let spread = radius + (Math.random() * 800);
      let longitude = Math.PI - (Math.random() * (2*Math.PI));
      let latitude =  (Math.random() * Math.PI);

      let x = spread * Math.cos(longitude) * Math.sin(latitude);
      let z = spread * Math.sin(longitude) * Math.sin(latitude);
      let y = spread * Math.cos(latitude);    

      orbitGeometry.vertices.push( new THREE.Vector3( x, y, z ) );           
    
    }
    const loader = new THREE.TextureLoader();
    let orbitMaterial = new THREE.PointsMaterial( { 
      size: 12,
      map: loader.load( "textures/sprites/circle.png" ) , 
      depthTest: false,  
      blending: THREE.AdditiveBlending, 
      transparent: true,
      opacity: 0
    });
    orbitMaterial.color.setHSL( .65, .0, .5 );

    let orbitParticles = new THREE.Points( orbitGeometry, orbitMaterial );
    orbitParticles.updateMatrix();
        
    new TWEEN.Tween(orbitMaterial)
      .delay(500)
      .to( {opacity: 1}, 4000)
      .easing(TWEEN.Easing.Quartic.Out)
      .start();                   
        
    orbitParticles.scale.x = .1;
    orbitParticles.scale.y = .1;
    new TWEEN.Tween(orbitParticles.scale)
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
    const tween = new TWEEN.Tween(this.planet.rotation)
    .to({ 
      x: latitude * ( Math.PI / 180 ) - verticalOffset, 
      y: ( 90 - longitude ) * ( Math.PI / 180 ) 
    }, delay)
    .easing(TWEEN.Easing.Quartic.InOut)
    .start();
  }

  highlightRegions (mapData, regions, color = 0xff0000) {
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
            this.tgeometry.colors[colorIndex].set(color)
          }
          colorIndex++;
        }
        yIndex++;
      }
      xIndex++;
    }
    this.tgeometry.colorsNeedUpdate = true;
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

  // "NoBlending", "NormalBlending", "AdditiveBlending", "SubtractiveBlending", "MultiplyBlending"
  globe (mapData) {
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

    const shaderPoint = THREE.ShaderLib.points
    const uniforms = THREE.UniformsUtils.clone(shaderPoint.uniforms)

    const image = new Image()
    uniforms.map.value = new THREE.Texture(image)
    image.onload = function() {
      uniforms.map.value.needsUpdate = true
    };
    image.src = imageSrc
    //uniforms.size.value = 60
    //uniforms.scale.value = 0//window.innerHeight * .5


    let material = new THREE.PointsMaterial({
      size: 40,
      color: 0xffffff,
      map:  uniforms.map.value,
      vertexColors: THREE.VertexColors,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide,
      depthWrite: false,
      transparent: true
    })

    const tgeometry = new THREE.Geometry();
    const pointCloud = new THREE.Points(tgeometry, tmaterial);
    pointCloud.updateMatrix();

    let earthColors = [];
    let colorIndex = 0;
    var xIndex = 0;
    for (let longitude = 2*Math.PI; longitude >= 0; longitude-=2*Math.PI/(960)) {
      var yIndex = 0;
      for (let latitude= 0; latitude <= Math.PI; latitude+=Math.PI/(480)) {

        const x = this.options.radius * Math.cos(longitude) * Math.sin(latitude);
        const z = this.options.radius * Math.sin(longitude) * Math.sin(latitude);
        const y = this.options.radius * Math.cos(latitude);

        if (mapData[yIndex][xIndex] == 0) {
          tgeometry.vertices.push(new THREE.Vector3(x, y, z));
          earthColors[ colorIndex ] = new THREE.Color( 0xFFFFFF );
          colorIndex++;
        /*} else if (mapMatrix[yIndex][xIndex] == 0) {
          tgeometry.vertices.push(new THREE.Vector3(x, y, z));
          earthColors[ colorIndex ] = new THREE.Color( 0x1b9ebc );
          colorIndex++;
        */}
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





