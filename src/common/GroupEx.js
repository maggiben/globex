import * as THREE from 'three';

const GroupEx = function (name) {
  THREE.Group.call(this);
  // add the desired properties
  this.name = name;
  this.type = 'GroupEx';
  this.getObjectsByProperty = (property, value) => this.children.filter(child => (child[property] === value));
  this.getObjectByType = (type) => this.children.find(child => (child.type === type));
}

GroupEx.prototype = Object.create( THREE.Group.prototype );
GroupEx.prototype.constructor = GroupEx;

export default GroupEx;
