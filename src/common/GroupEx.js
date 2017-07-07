import * as THREE from 'THREE';

const GroupEx = function (name) {
  THREE.Group.call(this);
  // add the desired properties
  this.name = name;
  this.type = 'GroupEx';
}

GroupEx.prototype = Object.create( THREE.Group.prototype );
GroupEx.prototype.constructor = GroupEx;

export default GroupEx;