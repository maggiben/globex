const makeEarth = function () {
	const container = document.getElementById('container');
	const maker = new Maker(container);
  maker.animate()
}

class Maker {
	constructor (container) {
		this.renderer = this.createRenderer();
    this.universe = this.universe();
    this.dish();
    this.background();
    
    this.planet = new THREE.Group();
    this.planet.add(this.globe());
    this.planet.add(this.core());
    this.planet.add(this.orbit());
    this.planet.add(this.ticks());
    this.planet.add(this.topu({r: 1.03, color: '0x00a2ff'}))

    this.planet.rotation.z = .465;
    this.planet.rotation.x = .3;

    this.scene.add(this.planet);
    container.appendChild(this.renderer.domElement);
    console.log('done')
	}


  animate () {
    const { scene, camera, renderer } = this;
    const globe = this.planet;

    function render(time) {
      // globe.rotation.y -= .05;
      TWEEN.update(time);
      renderer.render(scene, camera);
    }

    function loop(time) {
        const animationId = requestAnimationFrame(loop);
        render(time);
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
    this.camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 1, 3000);
    this.camera.position.z = 1400;
    this.scene.add(this.camera);
	}

  whole () {
    this.whole = new THREE.Group()  
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

  ticks () {
    const ticks = new THREE.Group();
    const lineRadius = 480;

    const tickMaterial = new THREE.LineBasicMaterial( { 
      opacity: .8, 
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
      .to( {opacity: .25}, 2000)
      .delay(1000)        
      .easing(TWEEN.Easing.Quartic.Out)
      .start();

    return ticks;
  }

  topu () {
    const options = {
      r: 2500,
      color: '0xFF0000'
    };
    const group = new THREE.Group();
    const geometry = new THREE.IcosahedronGeometry(options.r, 2);
    const basicMeterial = new THREE.MeshBasicMaterial({
      color: options.color,
      wireframe: true,
      transparent: true,
      opacity: 0.05
    });
    const mesh = new THREE.Mesh(geometry, basicMeterial);
    const pointMaterial = new THREE.PointsMaterial({
      color: options.color,
      size: 5,
      transparent: true,
      opacity: 0.8,
      alphaTest: 0.5
    });
    const points = new THREE.Points(geometry, pointMaterial);
    group.add(mesh, points);
    console.log('topu')
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

  globe () {
    const loader = new THREE.TextureLoader();
    const tmaterial = new THREE.PointsMaterial({
      size: 12, 
      vertexColors: THREE.VertexColors,
      map: loader.load( "textures/sprites/circle.png" ) , 
      depthTest: false,  
      blending: THREE.AdditiveBlending, 
      transparent : true,
      opacity: 1
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
          x = 400 * Math.cos(longitude) * Math.sin(latitude);
          z = 400 * Math.sin(longitude) * Math.sin(latitude);
          y = 400 * Math.cos(latitude);                       
          tgeometry.vertices.push(new THREE.Vector3(x, y, z));
          earthColors[ colorIndex ] = new THREE.Color( 0xffffff );
          earthColors[ colorIndex ].setHSL( .12, 0, .5 ); 
          colorIndex++;
        }
        yIndex++;
      }
      xIndex++;
    }

    tgeometry.colors = earthColors;
    //tgeometry.verticesNeedUpdate = true;
    //tgeometry.computeVertexNormals();

    return pointCloud;
  }
}





