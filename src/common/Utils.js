import * as THREE from 'three';
import * as TWEEN from 'tween';
import throttle from 'lodash/throttle';
import debounce from 'lodash/debounce';

const debug = throttle(console.log, 1000)

export const moveTo = function (object, path, direction, position, advance = 0.00005, useQuaternion = true) {
  const up = new THREE.Vector3().fromArray(direction);
  const axis = new THREE.Vector3();
  // set the marker position
  const point = path.getPointAt(position + advance);
  // get the tangent to the curve
  const tangent = path.getTangentAt(position).normalize();
  // calculate the axis to rotate around
  axis.crossVectors( up, tangent ).normalize();
  // calcluate the angle between the up vector and the tangent
  const radians = Math.acos(up.dot(tangent));
  // set the marker position
  object.position.copy(point);
  // set the quaternion
  if (useQuaternion && object.type !== 'PerspectiveCamera') {
    object.quaternion.setFromAxisAngle( axis, radians );
  } else if (object.type == 'PerspectiveCamera') {
    const p2 = path.getPointAt((position + 0.01)%1);
    //Rotate the camera into the orientation of the second point
    object.lookAt(p2);
  }
  return object;
}

export const translateFromPath = function (object, path, useQuaternion) {
  return function (position) {
    return moveTo(object, path, [0, 0, 1], position, 0.00005, useQuaternion)
  }
}

/* Good For Curves only */
export const repeatObjectsAlongPath = function (object, path, segments = 24) {
  const points = path.getSpacedPoints(segments);
  return points.map(function (point, index) {
    return moveTo(object.clone(), path, [0, 0, 1], (1 / points.length) * index);
  })
  .reduce(function (group, object) {
    return group.add(object);
  }, new THREE.Group());
}

export const onWindowResized = function(renderer, camera) {
  const onResize = debounce(event => {
    renderer.setSize( window.innerWidth, window.innerHeight );
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
  });
  window.addEventListener( 'resize', onResize, false );
}

export const repeatInSpline = function (object, path, divisions = 24) {
  const points = path.getPoints(divisions);
  return points.map(function (point, index) {
    return moveTo(object.clone(), path, [0, 0, 1], (1 / points.length) * index);
  })
  .reduce(function (group, object) {
    return group.add(object);
  }, new THREE.Group());
}

