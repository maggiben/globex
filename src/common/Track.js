import * as THREE from 'three';

const CatmullRomCurve3Ex = function ( points ) {
  THREE.CatmullRomCurve3.apply(this, [points]);
}
CatmullRomCurve3Ex.prototype = Object.create( THREE.CatmullRomCurve3.prototype );
CatmullRomCurve3Ex.prototype.constructor = CatmullRomCurve3Ex;

function Point(x, y) {
  this.x = x;
  this.y = y;
}

export class Region {
  constructor (points) {
    this.points = points;
    this.length = points.length;
  }

  area () {
    var area = 0;
    var i, j;
    for (i = 0, j = this.length - 1; i < this.length; j = i, i++) {
      const point1 = this.points[i];
      const point2 = this.points[j];
      area += point1[0] * point2[1];
      area -= point1[1] * point2[0];
    }
    return area /= 2;
  }

  centroid () {
    var i, j, f, x, y;
    for (i = 0, j = this.length - 1; i < this.length; j = i, i++) {
      const point1 = this.points[i];
      const point2 = this.points[j];
      f = point1[0] * point2[1] - point2[0] * point1[1];
      x += (point1[0] + point2[0]) * f;
      y += (point1[1] + point2[1]) * f;
    }
    f = this.area() * 6;
    return [(x / f), (y / f)];
  }
}

export default class Track extends CatmullRomCurve3Ex {
  constructor (polygon, name) {
    const points = polygon.map(function (points) {
      return new THREE.Vector3().fromArray(points);
    });
    super(points);
  }

  createHelper () {
    const geometry = new THREE.Geometry();
    geometry.vertices = this.getPoints( 120 );
    const material = new THREE.LineBasicMaterial({
      color : 0xFF00FF,
      linewidth: 10
    });
    const line = new THREE.Line(geometry, material);
    return line;
  }

  place (object, divisions = 24) {
    return this.getPoints(divisions).map((point, index, points) => {
      return this.moveTo(object.clone(), [0, 0, 1], (1 / points.length) * index);
    })
    .reduce(function (group, object) {
      return group.add(object);
    }, new THREE.Group());
  }

  moveTo (object, direction, position) {
    const up = new THREE.Vector3().fromArray(direction);
    const axis = new THREE.Vector3();
    // set the marker position
    const point = this.getPointAt(position);
    // get the tangent to the curve
    const tangent = this.getTangentAt(position).normalize();
    // calculate the axis to rotate around
    axis.crossVectors( up, tangent ).normalize();
    // calcluate the angle between the up vector and the tangent
    const radians = Math.acos(up.dot(tangent));
    // set the marker position
    object.position.copy(point);
    // set the quaternion
    object.quaternion.setFromAxisAngle(axis, radians);

    return object;
  }
}
