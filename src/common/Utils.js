import * as THREE from 'three';
import * as TWEEN from 'tween';

export const translateObjectAlongPath = function (object, path, { x, y, z }, position) {
  const up = new THREE.Vector3(x, y, z);
  const axis = new THREE.Vector3();
  // set the marker position
  const point = path.getPoint(position);
  // get the tangent to the curve
  const tangent = path.getTangent(position).normalize();
  // calculate the axis to rotate around
  axis.crossVectors( up, tangent ).normalize();
  // calcluate the angle between the up vector and the tangent
  const radians = Math.acos(up.dot(tangent));
  // set the marker position
  object.position.copy(point);
  // set the quaternion
  if (object.type === 'PerspectiveCamera')
    object.quaternion.setFromAxisAngle( axis, radians );
}

export const moveTo = function (object, path, direction, position) {
  const up = new THREE.Vector3().fromArray(direction);
  const axis = new THREE.Vector3();
  // set the marker position
  const point = path.getPoint(position);
  // get the tangent to the curve
  const tangent = path.getTangent(position).normalize();
  // calculate the axis to rotate around
  axis.crossVectors( up, tangent ).normalize();
  // calcluate the angle between the up vector and the tangent
  const radians = Math.acos(up.dot(tangent));
  // set the marker position
  object.position.copy(point);
  // set the quaternion
  object.quaternion.setFromAxisAngle( axis, radians );
  return object;
}

export const followPath = function (object, path, advance = 0.00005) {
  const up = new THREE.Vector3(0, 0, 1);
  const axis = new THREE.Vector3();

  /*
  return function (position) {
    const point = path.getPoint(position);
    const tangent = path.getTangent(position + advance).normalize();
    const radians = Math.acos(up.dot(tangent));
    axis.crossVectors(up, tangent).normalize();

    object.position.copy(point);
    if (object.type === 'PerspectiveCamera')
      object.quaternion.setFromAxisAngle(axis, radians);
  }
  */
  return function (position) {
    return translateObjectAlongPath(object, path, {x:0,y:0,z:1}, position)
  }
}

export const repeatObjectsAlongPath = function (object, path, segments = 24) {
  const points = path.getSpacedPoints(segments);
  return points.map(function (point, index) {
    return moveTo(object.clone(), path, [0, 0, 1], (1 / points.length) * index);
  })
  .reduce(function (group, object) {
    return group.add(object);
  }, new THREE.Group());
}
