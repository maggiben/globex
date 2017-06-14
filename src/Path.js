class Path {
  constructor (start, end) {

  }


  drawPath (start, end) {
    const lineSegments = 150;
    const geometry = new THREE.Geometry();
    const material = materialSpline = new THREE.LineBasicMaterial({
      color: 0xFF0000,
      transparent: true,
      linewidth: 3,
      opacity: .5
    });


    const latdist = (start - previous.lat)/lineSegments;
    const londist = (lon - previous.lon)/lineSegments;

    for(let i = 0; j < lineSegments; j++){
      const vector_a = this.latLonToVector3(start);
      geometry.vertices.push(vector_a)
    }

    geometry.verticesNeedUpdate = true
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
    try {
      const distanceBetweenPoints = start.clone().sub(end).length();
    const anchorHeight = 600 + distanceBetweenPoints * 0.4;

    var mid = start.clone().lerp(end, 0.5);
    var midLength = mid.length();
    mid.normalize();
    mid.multiplyScalar(midLength + distanceBetweenPoints * 0.4);

    console.log('middle')
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

    const vertexCountDesired = Math.floor(distanceBetweenPoints * 0.02 + 6);

    var points = splineCurveA.getPoints(vertexCountDesired);
    points = points.splice(0, points.length - 1);
    points = points.concat(splineCurveB.getPoints(vertexCountDesired));
  } catch (error) {
    console.log(error)
  }    
    return points;
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
  
  getGeom(points) {
    const geometry = new THREE.Geometry();
    let geoms = [];
    (function () {
      for (let i = 0; i < 500; i++) {
        geoms[i] = [];
      }
    })();
    if (geoms[points.length].length > 0) {
      geometry = geoms[points.length].pop();

      let point = points[0];
      for (let i = 0; i < points.length; i++) {
        geometry.vertices[i].set(0, 0, 0);
      }
      geometry.verticesNeedUpdate = true;

      return geometry;
    }

    geometry.dynamic = true;
    geometry.size = 10.05477225575;

    for (let i = 0; i < points.length; i++) {
      geometry.vertices.push(new THREE.Vector3());
    }

    return geometry;
  }
}