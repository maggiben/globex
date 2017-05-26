const makeEarth = function () {
	const container = document.getElementById('container');
	const maker = new Maker(container);
  maker.animate()
}

class Maker {
	constructor (container) {
    this.options = {
      radius: 400
    }
		this.renderer = this.createRenderer();
    this.universe = this.universe();
    // this.dish();
    // this.background();
    
    this.planet = new THREE.Group();
    this.planet.add(this.globe());
    this.planet.add(this.core());
    this.planet.add(this.orbit());
    this.planet.add(this.ticks());
    // this.planet.add(this.lines());
    this.planet.add(this.rings());
    this.planet.add(this.marker());
    this.planet.add(this.topu({r: 1.03, color: '0x00a2ff'}))

    this.world = new THREE.Group();
    this.world.add(this.planet);

    this.world.rotation.z = .465;
    this.world.rotation.x = .3;

    this.scene.add(this.world);
    container.appendChild(this.renderer.domElement);
    console.log('done')
	}


  animate () {
    const { scene, camera, renderer } = this;
    const globe = this.planet;

    function render(time) {
      globe.rotation.y -= .005;
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

  mapPoint (latitude, longitude, scale) {
    if(!scale){
      scale = 400;
    }
    const radius = 320;
    let x = radius * Math.cos(longitude) * Math.sin(latitude);
    let y = radius * Math.cos(latitude);    
    let z = radius * Math.sin(longitude) * Math.sin(latitude);
    return {x: x, y: y, z:z};
  }
  

  makeTexture (radius, width) {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');
    const texture = new THREE.Texture(canvas);


    ctx.clearRect(0, 0, canvas.width, canvas.height);

    /* circle */
    var centerX = canvas.width / 2;
    var centerY = canvas.height / 2;
    radius = radius || 70;
    width = width || 50;

    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI, false);
    ctx.fillStyle = 'rgba(0,0,0,0)';
    ctx.fill();
    ctx.lineWidth = width;
    ctx.strokeStyle = 'rgba(255,0,0,0.5)';
    ctx.stroke();

    /* Text */
    // ctx.font = '120pt Arial';
    // ctx.textAlign = "center";
    // ctx.textBaseline = "middle";
    // ctx.fillStyle = 'rgba(255,0,0,0.5)';  
    // ctx.fillText(new Date().getTime(), canvas.width / 2, canvas.height / 2);
    
    var init = 24;
    radius = 0;

    this.interval = setInterval(() => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      this.doRing (texture, canvas, ctx, canvas.width / 2, canvas.height / 2, radius, 8, 0.5, 1)
      // move the texture to give the illusion of moving thru the tunnel
      texture.needsUpdate = true;
      radius += 5;
      if(radius > 60) {
        clearInterval(this.interval);
      }
    }, 100)

    return texture;
  }

  doRing (texture, canvas, ctx, x, y, radius, w, opacity = 1) {
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, 2 * Math.PI, false);
    ctx.fillStyle = 'rgba(0,0,0,0)';
    ctx.fill();
    ctx.lineWidth = w;
    ctx.strokeStyle = `rgba(255, 255, 0, ${opacity})`;
    ctx.stroke();
  }

  makeTextureX (radius, width) {
    const me = this;
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');
    const texture = new THREE.Texture(canvas);

    // ctx.clearRect(0, 0, canvas.width, canvas.height);

    let attributes = { opacity: 1, radius: 0, border: 8 };
    new TWEEN.Tween( attributes )
      .delay( 200 )
      .to( { opacity: 0, radius: 40, border: 1 }, 1000 )
      .easing(TWEEN.Easing.Quartic.Out)
      .onUpdate(function(progress) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        me.doRing (texture, canvas, ctx, canvas.width / 2, canvas.height / 2, this.radius, this.border, this.opacity)
        texture.needsUpdate = true;
      })
      .repeat(Infinity)
      .start(); 

    return texture;
  }

  coordsMove (latitude, longitude, radius) {
    let curLat = 90 - latitude;
    let curLong = 180 - longitude;
    
    curLong *= Math.PI/180;
    curLat *= Math.PI/180;
         
    const x = radius * Math.cos(curLong) * Math.sin(curLat);
    const z = radius * Math.sin(curLong) * Math.sin(curLat);
    const y = radius * Math.cos(curLat); 

    return {x, y, z};
  }

  marker () {
    const marker = new THREE.Group();
    const radius = 400;

    const tickMaterial = new THREE.LineBasicMaterial( { 
      color: 0xFFFFFF,
      linewidth: 1, 
      depthTest: false,  
      blending: THREE.AdditiveBlending, 
      transparent : true,
      opacity: 1
    });
    const geometry = new THREE.Geometry();
    
    const coordsa = this.coordsMove(-34.603722, -58.381592, radius);
    geometry.vertices.push( new THREE.Vector3( coordsa.x, coordsa.y, coordsa.z ) );
    const coordsb = this.coordsMove(-34.603722, -58.381592, radius + 20);
    geometry.vertices.push( new THREE.Vector3( coordsb.x, coordsb.y, coordsb.z ) );
    const line = new THREE.Line( geometry, tickMaterial, THREE.LineStrip );
    marker.add(line);


    const sphere = new THREE.SphereGeometry( 3, 32, 32 )
    const material = new THREE.LineBasicMaterial( { 
      color: 0xFFFFFF,
      linewidth: 1, 
      depthTest: false,  
      blending: THREE.AdditiveBlending, 
      transparent : true,
      opacity: 1
    });

    const mesh = new THREE.Mesh( sphere, material );
    mesh.position.set(coordsb.x, coordsb.y, coordsb.z);
    marker.add(mesh);

    return marker;
  }

  rings () {
    const geometry = new THREE.CircleGeometry( 132, 32 );
    geometry.applyMatrix( new THREE.Matrix4().makeRotationFromEuler(new THREE.Vector3(Math.PI / 2, Math.PI, 0)));
    const material = new THREE.MeshBasicMaterial({
      map: this.makeTextureX(),
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending, 
      transparent : true,
      opacity: 1,
      // wireframe: true
    });

    const mesh = new THREE.Mesh( geometry, material );

    const radius = 422.5;
    
    const coords = this.coordsMove(-34.603722, -58.381592, radius);
    mesh.position.set(coords.x, coords.y, coords.z);
    mesh.lookAt(new THREE.Vector3(0,0,0));

    return mesh;
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
      .to( {opacity: .5}, 2000)
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
          
          const x = 400 * Math.cos(longitude) * Math.sin(latitude);
          const z = 400 * Math.sin(longitude) * Math.sin(latitude);
          const y = 400 * Math.cos(latitude);

          tgeometry.vertices.push(new THREE.Vector3(x, y, z));
          earthColors[ colorIndex ] = new THREE.Color( 0x1b9ebc );
          //earthColors[ colorIndex ].setHSL( .12, 0, .5 ); 
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





