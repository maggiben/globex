import * as THREE from 'three';
import * as TWEEN from 'tween';

class Topu {
  constructor(options) {
    const defaults = {
      radius: 500,
      color: 0xFFFFFF
    }

    this.options = Object.assign({}, options, defaults);
    const geometry = new THREE.IcosahedronGeometry(this.options.radius, 2);
    const mesh = this.mesh(geometry, this.options.color)
    const points = this.points(geometry, this.options.color)

    this.elements = new THREE.Group();
    this.elements.add(mesh);
    this.elements.add(points);
  }

  mesh (geometry, color) {
    const material = new THREE.MeshBasicMaterial({
      color: color,
      wireframe: true,
      transparent: true,
      blending: THREE.AdditiveBlending, 
      opacity: 0.07
    });
    return new THREE.Mesh(geometry, material);
  }

  points (geometry, color) {
    const material = new THREE.PointsMaterial({
      color: color,
      size: 8,
      transparent: true,
      blending: THREE.AdditiveBlending, 
      opacity: 0.03
    });
    return new THREE.Points(geometry, material);
  }
}

export default class Widgets {
  constructor(options) {
    const defaults = {
      radius: 500
    }
    this.options = Object.assign({}, options, defaults);

    const core = this.core(this.options.radius);
    const ticks = this.ticks(this.options.radius, 15, 60);
    const topu = new Topu(this.options);

    this.elements = new THREE.Group();
    this.elements.add(core);
    this.elements.add(ticks);
    this.elements.add(topu.elements);
  }

  lines (radius, altitude) {
    const lineGeometry = new THREE.Geometry();
    const lineRadius = radius + altitude;
    const loader = new THREE.TextureLoader();

    for (let longitude = 2*Math.PI; longitude >= 0; longitude-=Math.PI/12) {
      for (let latitude= 0; latitude <= Math.PI; latitude+=Math.PI/30) {
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

  core (radius, amount = 1800) {
    const coreGeometry = new THREE.Geometry();
    for (let i = 0; i < amount; i++) {

      let spread = Math.random() * radius;
      let longitude = Math.PI - (Math.random() * (2*Math.PI));
      let latitude =  (Math.random() * Math.PI);

      let x = spread * Math.cos(longitude) * Math.sin(latitude);
      let z = spread * Math.sin(longitude) * Math.sin(latitude);
      let y = spread * Math.cos(latitude);    

      coreGeometry.vertices.push(new THREE.Vector3( x, y, z ));
    }   
      
    const loader = new THREE.TextureLoader();
    const material = new THREE.PointsMaterial( { 
      size: 12,
      map: loader.load( "textures/sprites/circle.png" ) , 
      depthTest: false,  
      blending: THREE.AdditiveBlending, 
      transparent : true,
      opacity: 0
    });
    material.color.setHSL( .65, .0, .5 );

    const points = new THREE.Points(coreGeometry, material);
    points.updateMatrix();
        
    new TWEEN.default.Tween( material)
      .delay(500)
      .to( {opacity: 1}, 4000)
      .easing(TWEEN.default.Easing.Quartic.Out)
      .start();       
    
    points.scale.x = .1;
    points.scale.y = .1;
    new TWEEN.default.Tween( points.scale )
      .delay( 200 )
      .to( { x: 1, y: 1 }, 2000 )
      .easing(TWEEN.default.Easing.Quartic.Out)
      .start();
    
    return points;
  }

  topu (radius, color = 0xFFFFFF) {
    const group = new THREE.Group();
    const geometry = new THREE.IcosahedronGeometry(radius, 2);
    const basicMeterial = new THREE.MeshBasicMaterial({
      color: color,
      wireframe: true,
      transparent: true,
      blending: THREE.AdditiveBlending, 
      opacity: 0.07
    });
    const mesh = new THREE.Mesh(geometry, basicMeterial);
    const pointMaterial = new THREE.PointsMaterial({
      color: color,
      size: 8,
      transparent: true,
      blending: THREE.AdditiveBlending, 
      opacity: 0.03,
      // alphaTest: 0.5
    });
    const points = new THREE.Points(geometry, pointMaterial);
    group.add(mesh, points);
    return group;
  }

  ticks (radius, altitude, height, amount = 30) {
    const ticks = new THREE.Group();
    const lineRadius = radius + altitude;
    const material = new THREE.LineBasicMaterial( { 
      linewidth: 1, 
      depthTest: false,  
      blending: THREE.AdditiveBlending, 
      transparent : true,
      opacity: 0
    });
    material.color.setHSL( .65, .0, 1.0 );

    for (var longitude = 2*Math.PI; longitude >= Math.PI/amount; longitude-=Math.PI/amount) {
      //for (var latitude= 0; latitude <= Math.PI; latitude+=Math.PI/4) {
      const tickGeometry = new THREE.Geometry();
      const latitude = Math.PI /2;          
                          
      const x = lineRadius * Math.cos(longitude) * Math.sin(latitude);
      const z = lineRadius * Math.sin(longitude) * Math.sin(latitude);
      const y = lineRadius * Math.cos(latitude);                        
  
      const xb = (lineRadius + height) * Math.cos(longitude) * Math.sin(latitude);
      const zb = (lineRadius + height) * Math.sin(longitude) * Math.sin(latitude);
      const yb = (lineRadius + height) * Math.cos(latitude); 
  
      const vectora = new THREE.Vector3( x, y, z );
      const vectorb = new THREE.Vector3( xb, yb, zb );
      
      tickGeometry.vertices.push( vectora );
      tickGeometry.vertices.push( vectorb );
      
      const tick = new THREE.Line( tickGeometry, material, THREE.LineStrip );
      ticks.add( tick );
    }

    new TWEEN.default.Tween(material)
      .to({
        opacity: .5
      }, 2000)
      .delay(1000)        
      .easing(TWEEN.default.Easing.Quartic.Out)
      .start();

    return ticks;
  }

  orbit (radius, amount = 600) {
    let orbitGeometry = new THREE.Geometry();
    
    for (let i = 0; i < amount; i++) {
    
      let spread = radius + (Math.random() * 800);
      let longitude = Math.PI - (Math.random() * (2*Math.PI));
      let latitude =  (Math.random() * Math.PI);

      let x = spread * Math.cos(longitude) * Math.sin(latitude);
      let z = spread * Math.sin(longitude) * Math.sin(latitude);
      let y = spread * Math.cos(latitude);    

      orbitGeometry.vertices.push( new THREE.Vector3( x, y, z ) );           
    
    }
    const loader = new THREE.TextureLoader();
    const material = new THREE.PointsMaterial( { 
      size: 12,
      map: loader.load( "textures/sprites/circle.png" ) , 
      depthTest: false,  
      blending: THREE.AdditiveBlending, 
      transparent: true,
      opacity: 0
    });
    material.color.setHSL( .65, .0, .5 );

    const points = new THREE.Points( orbitGeometry, material );
    points.updateMatrix();
        
    new TWEEN.default.default.Tween(material)
      .delay(500)
      .to( {opacity: 1}, 4000)
      .easing(TWEEN.default.Easing.Quartic.Out)
      .start();                   
        
    points.scale.x = .1;
    points.scale.y = .1;
    new TWEEN.default.Tween(points.scale)
      .delay( 200 )
      .to( { x: 1, y: 1 }, 2000 )
      .easing(TWEEN.default.Easing.Quartic.Out)
      .start();     

    return points;
  }
}