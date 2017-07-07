import * as THREE from 'THREE';
import * as TWEEN from 'tween';
import { View } from '../common/Stage';

/* Lights Builder */

const GroupEx = function ( name ) {
  THREE.Group.call( this );
  // add the desired properties
  this.name = name;
  this.type = 'GroupEx'
}

GroupEx.prototype = Object.create( THREE.Group.prototype );
GroupEx.prototype.constructor = GroupEx;
// define the getPoint function for the subClass

export default class Cameras extends GroupEx {
  constructor (view) {
    super()
    const camera = this.createCamera(...args);
    const helpers = this.createHelpers(lights);
    this.add(camera);
  }

  /*
  // this.stage.helpers(this.scene);
    this.camera = this.stage.createCamera(this.options.view, { position: [0, 38, 8] });
    this.camera.position.set(0, 38, 8);
    this.camera.lookAt(this.scene.position);


    this.cameraHelper = this.stage.createCameraHelper(this.options.view);
    this.cameraHelper.camera.position.set(0, 20, 0);
    this.cameraHelper.camera.lookAt(this.scene.position);   
    
    this.updatees.push(this.cameraHelper.helper);

    this.cubeCamera = new THREE.CubeCamera( 1, 5000, 256); 
    this.cubeCamera.renderTarget.texture.minFilter = THREE.LinearMipMapLinearFilter;

    this.cubeCamera2 = new THREE.CubeCamera( 1, 5000, 256); 
    this.cubeCamera2.renderTarget.texture.minFilter = THREE.LinearMipMapLinearFilter;

    

    this.scene.add(this.cubeCamera);
    this.scene.add(this.cubeCamera2);

    this.groups.cameras.add(this.cameraHelper.helper);
    this.groups.cameras.add(this.cameraHelper.camera);
    this.groups.cameras.add(this.camera);

  */

  /* attach helpers */
  createHelpers (lights) {
    return lights.children.reduce((helpers, light) => {
      const lightType = light.type.concat('Helper');
      if (lightType in THREE) {
        const helper = new THREE[lightType](light);
        helpers.add(helper);
        return helpers;
      } 
    }, new GroupEx('helpers'));
  }

  createCamera (...args) {
    this.camera = View.createCamera(...args);
    return this.camera;
  }
}