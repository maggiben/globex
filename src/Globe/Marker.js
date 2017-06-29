import * as THREE from 'three';
import * as TWEEN from 'tween';

function filterXXX(geo, names) {
  var features = geo.features.filter(feature => {
    return names.indexOf(feature.properties.name.toLowerCase()) > -1;
  });
  var [x, ...z] = features;
  var union = z.reduce((a, b) => {
    return turf.union(a, b);
  }, x);

  console.log(features.map(f => f.id))
  console.log(union)
}

export default class Marker {

  constructor (latitude, longitude, radius, caption) {
    // axios.get('https://raw.githubusercontent.com/johan/world.geo.json/master/countries.geo.json')
    // .then(result => result.data)
    // .then(json => {
    //   console.log(json)
    //   filter(json, ['argentina', 'uruguay', 'bolivia', 'brazil', 'peru', 'paraguay']);
    // })

    const marker = new THREE.Group();
    const label = new Label(caption, latitude, longitude, radius);

    marker.add(this.rings(latitude, longitude, radius));
    marker.add(this.line(latitude, longitude, radius + 22.5));
    marker.add(this.sphere(latitude, longitude, radius + 20));
    marker.add(label);
    return marker;
  }

  sphere(latitude, longitude, radius, altitude) {
    const sphere = new THREE.SphereGeometry( 3, 16, 16 )
    const material = new THREE.LineBasicMaterial({ 
      color: 0xFFFFFF,
      linewidth: 1, 
      depthTest: false,  
      blending: THREE.AdditiveBlending, 
      transparent: true,
      opacity: 0.2
    });

    const point = this.mapPoint(latitude, longitude, radius + altitude);
    const mesh = new THREE.Mesh( sphere, material );
    mesh.position.set(point.x, point.y, point.z);
    new TWEEN.default.Tween(material)
      .delay(200)
      .to({opacity: 1}, 1000)
      .easing(TWEEN.default.Easing.Quartic.Out)
      .repeat(Infinity)
      .start();  

    return mesh;
  }

  line (latitude, longitude, radius, height) {
    const geometry = new THREE.Geometry();
    const material = new THREE.LineBasicMaterial({ 
      color: 0xFFFFFF,
      linewidth: 1, 
      depthTest: false,  
      blending: THREE.AdditiveBlending, 
      transparent: true,
      opacity: 1
    });

    const points = [radius, (radius + height)].forEach(z => {
      const point = this.mapPoint(latitude, longitude, z);
      return geometry.vertices.push(new THREE.Vector3( point.x, point.y, point.z ));
    })
    /*
    const coordsa = this.mapPoint(latitude, longitude, radius);
    geometry.vertices.push( new THREE.Vector3( coordsa.x, coordsa.y, coordsa.z ) );
    const coordsb = this.mapPoint(latitude, longitude, radius + height);
    geometry.vertices.push( new THREE.Vector3( coordsb.x, coordsb.y, coordsb.z ) );
    */

    return new THREE.Line(geometry, material, THREE.LineStrip);
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

  drawRing (ctx, x, y, radius, border, opacity = 1) {
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, 2 * Math.PI, false);
    ctx.fillStyle = 'rgba(0,0,0,0)';
    ctx.fill();
    ctx.lineWidth = border;
    ctx.strokeStyle = `rgba(255, 255, 255, ${opacity})`;
    ctx.stroke();
  }

  makeTexture (radius, width) {
    const me = this;
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');
    const texture = new THREE.Texture(canvas);

    let attributes = { opacity: 1, radius: 0, border: 8 };
    new TWEEN.default.Tween( attributes )
      .delay( 200 )
      .to( { opacity: 0, radius: 40, border: 1 }, 1000 )
      .easing(TWEEN.default.Easing.Quartic.Out)
      .onUpdate(function(progress) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        me.drawRing (ctx, canvas.width / 2, canvas.height / 2, this.radius, this.border, this.opacity)
        texture.needsUpdate = true;
      })
      .repeat(Infinity)
      .start(); 

    return texture;
  }

  rings (latitude, longitude, radius, altitude) {
    const geometry = new THREE.CircleGeometry( 132, 8 );
    geometry.applyMatrix( new THREE.Matrix4().makeRotationFromEuler(new THREE.Vector3(Math.PI / 2, Math.PI, 0)));
    const material = new THREE.MeshBasicMaterial({
      map: this.makeTexture(),
      // color: 0xFFFFFF,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending, 
      transparent: true,
      opacity: 1,
      depthTest: false,
      // wireframe: true
    });

    const mesh = new THREE.Mesh( geometry, material );
    const coords = this.mapPoint(latitude, longitude, radius + altitude);
    mesh.position.set(coords.x, coords.y, coords.z);

    // Look at the center of the globe
    mesh.lookAt(new THREE.Vector3(0, 0, 0));

    return mesh;
  }
}