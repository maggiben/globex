import * as THREE from 'three';

export default class Path {
  constructor (origin, destination, radius) {
    this.origin = this.mapPoint(origin.latitude, origin.longitude, radius);
    this.destination = this.mapPoint(destination.latitude, destination.longitude, radius);
    this.route = this.buildPath(this.origin, this.destination);
  }

  arc(beg, end){
    const distance = beg.distanceTo(end);
    const mid = beg.clone().lerp(end, 0.5);
    const midLength = mid.length();

    mid.normalize();
    mid.multiplyScalar(midLength + distance * 0.5);

    const normal = (new THREE.Vector3()).subVectors(beg, end);
    normal.normalize();

    const distanceHalf = distance * 0.5;

    const begAnchor    = beg;
    const midbegAnchor = mid.clone().add(normal.clone().multiplyScalar( distanceHalf));
    const midEndAnchor = mid.clone().add(normal.clone().multiplyScalar(-distanceHalf));
    const endAnchor    = end;

    const splineCurveA = new THREE.CubicBezierCurve3(beg, begAnchor, midbegAnchor, mid);
    const splineCurveB = new THREE.CubicBezierCurve3(mid, midEndAnchor, endAnchor, end);

    const curve = new THREE.CurvePath();
    curve.add(splineCurveA);
    curve.add(splineCurveB);

    return new THREE.TubeBufferGeometry(curve, 100, 2, 8, false );
  }

  // Takes two points on the globe and turns them into a bezier curve point array
  bezierCurveBetween(start, end) {
    const distanceBetweenPoints = start.clone().sub(end).length();
    const anchorHeight = 600 + distanceBetweenPoints * 0.4;

    var mid = start.clone().lerp(end, 0.5);
    var midLength = mid.length();
    mid.normalize();
    mid.multiplyScalar(midLength + distanceBetweenPoints * 0.4);

    var normal = (new THREE.Vector3()).subVectors(start, end);
    normal.normalize();

    const anchorScalar = distanceBetweenPoints * 0.4;

    var startAnchor = start;
    var midStartAnchor = mid.clone().add(normal.clone().multiplyScalar(anchorScalar));
    var midEndAnchor = mid.clone().add(normal.clone().multiplyScalar(-anchorScalar));
    var endAnchor = end;

    // Now make a bezier curve
    const splineCurveA = new THREE.CubicBezierCurve3(start, startAnchor, midStartAnchor, mid);
    const splineCurveB = new THREE.CubicBezierCurve3(mid, midEndAnchor, endAnchor, end);

    const vertexCountDesired = Math.floor(distanceBetweenPoints * 0.02 + 60);

    var points = splineCurveA.getPoints(vertexCountDesired);
    points = points.splice(0, points.length - 1);
    points = points.concat(splineCurveB.getPoints(vertexCountDesired));
    return points;
  }

  buildPath2 (origin, destination) {
    const points = this.bezierCurveBetween(origin, destination);
    const geometry = new THREE.Geometry();

    for (let i = 0; i < points.length; i++) {
      const vector = new THREE.Vector3( points[i].x, points[i].y, points[i].z );
      geometry.vertices.push(vector);
    }

    const loader = new THREE.TextureLoader();
    const material = new THREE.PointsMaterial({
      size: 12,
      map: loader.load( "textures/sprites/circle.png" ) ,
      depthTest: false,
      blending: THREE.AdditiveBlending,
      transparent : true
    });

    material.color.setHSL( .55, .45, 1.4 );

    const lineParticles = new THREE.Points( geometry, material );
    //lineParticles.sortParticles = true;
    lineParticles.updateMatrix();

    return lineParticles;
  }

  buildPath (origin, destination) {
    const points = this.points = this.bezierCurveBetween(origin, destination);
    const geometry = this.geometry = new THREE.Geometry();

    for (let i = 0; i < points.length; i++) {
      // const vector = new THREE.Vector3( points[i].x, points[i].y, points[i].z );
      const vector = new THREE.Vector3( 0, 0, 0 );
      geometry.vertices.push(vector);
    }

    const loader = new THREE.TextureLoader();
    const material = new THREE.LineBasicMaterial({
      linewidth: 4,
      color: 0xFF0000,
      blending: THREE.AdditiveBlending,
      transparent: true,
      opacity: 1
    });

    const fillTo = function(start, end, point) {
      for(let i = start; i < end; i++) {
        geometry.vertices[i].x = point.x;
        geometry.vertices[i].y = point.y;
        geometry.vertices[i].z = point.z;
      }
    }

    const line = new THREE.Line( geometry, material );
    line.geometry.dynamic = true;

    window.ttween = new TWEEN.Tween({amount: 0})
    .to({amount: points.length}, 5000)
    .onUpdate(function (progress) {
      const amount = Math.floor(this.amount);
      for (let i = 0; i < amount; i++) {
        geometry.vertices[i].x = points[i].x;
        geometry.vertices[i].y = points[i].y;
        geometry.vertices[i].z = points[i].z;
        fillTo(i, points.length, points[i])
      }
      line.geometry.verticesNeedUpdate = true;
    })
    .easing(TWEEN.Easing.Quartic.Out)
    .delay(2000)
    .start();

    return line;
  }

  remove () {
    // const geometry = this.geometry;
    // const line = this.route;

    // console.log('route', this.route)
    // new TWEEN.Tween({amount: 0})
    // .to({amount: points.length}, 5000)
    // .onUpdate(function (progress) {
    //   const amount = Math.floor(this.amount);
    //   for (let i = 0; i < amount; i++) {
    //     geometry.vertices[i].x = points[i].x;
    //     geometry.vertices[i].y = points[i].y;
    //     geometry.vertices[i].z = points[i].z;
    //     fillTo(i, points.length, points[i])
    //   }
    //   line.geometry.verticesNeedUpdate = true;
    // })
    // .easing(TWEEN.Easing.Quartic.Out)
    // .delay(2000)
    // .start();

    this.route.parent.remove(this.route);
    this.route.geometry.dispose();
    this.route.material.dispose();
  }

  // Calculate a Vector3 from given lat/long
  latLonToVector3(latitude, longitude, radius) {
    //longitude = longitude + 10;
    // latitude = latitude - 2;
    const phi = (Math.PI / 2) - latitude * Math.PI / 180 - Math.PI * 0.01;
    const theta = 2 * Math.PI - longitude * Math.PI / 180 + Math.PI * 0.06;

    const x = Math.sin(phi) * Math.cos(theta) * radius;
    const y = Math.cos(phi) * radius;
    const z = Math.sin(phi) * Math.sin(theta) * radius;

    return new THREE.Vector3(x, y, z);
  }

  mapPoint (latitude, longitude, radius) {
    let curLat = 90 - latitude;
    let curLong = 180 - longitude;

    curLong *= Math.PI/180;
    curLat *= Math.PI/180;

    const x = radius * Math.cos(curLong) * Math.sin(curLat);
    const z = radius * Math.sin(curLong) * Math.sin(curLat);
    const y = radius * Math.cos(curLat);

    return new THREE.Vector3(x, y, z);
  }

}
