import * as THREE from 'THREE';
import * as TWEEN from 'tween';
import * as OrbitControls from 'three-orbitcontrols';
import { View } from '../common/Stage';
import GroupEx from '../common/GroupEx';

const VALID_LIGHT_PROPERTIES = ['fov', 'aspect', 'near', 'far'];

export const createPerspectiveCamera = function ({fullWidth, fullHeight, x, y, width, height}) {
  const camera = new THREE.PerspectiveCamera(80, width / height, 1, 10000);
  camera.setViewOffset(fullWidth, fullHeight, x, y, width, height);
  camera.position.z = 1400;
  camera.lookAt(new THREE.Vector3(0, 0, 0));
  return camera;
}

export const createCameraHelper = function ({fullWidth, fullHeight, x, y, width, height}) {
  const camera = new THREE.PerspectiveCamera(50, width / height, 1, 5000);
  camera.setViewOffset(fullWidth, fullHeight, x, y, width, height);
  const helper = new THREE.CameraHelper(camera);
  return { camera, helper };
}

export const createCubeCameras = function () {
  const group = new GroupEx('cubeCameras');

  const cubeCamera_a = new THREE.CubeCamera(1, 2000, 512);
  cubeCamera_a.renderTarget.texture.minFilter = THREE.LinearMipMapLinearFilter;
  cubeCamera_a.name = 'cubeCamera_a';

  const cubeCamera_b = new THREE.CubeCamera(1, 2000, 512);
  cubeCamera_b.renderTarget.texture.minFilter = THREE.LinearMipMapLinearFilter;
  cubeCamera_b.name = 'cubeCamera_b';

  group.add(cubeCamera_a);
  group.add(cubeCamera_b);

  return group;
}

export const setupControls = function (camera, renderer) {
  const controls = new OrbitControls.default(camera, renderer.domElement);
  controls.target.set(0, 0, 0);
  controls.enableDamping = true;
  controls.dampingFactor = 0.07;
  controls.rotateSpeed = 0.04;
  controls.zoomSpeed = 1;
  controls.panSpeed = 0.008;
  return controls;
}

export default class CameraEx extends GroupEx {
  constructor (template) {
    super('cameras');
    const lights = this.createCameras(template);
    this.add(lights);
    // const helpers = this.createHelpers(lights);
    // this.add(helpers);
  }

  /* attach helpers */
  createHelpers (lights) {
    return lights.children.reduce((helpers, light) => {
      const type = light.type.concat('Helper');
      if (type in THREE) {
        const helper = new THREE[type](light);
        helpers.add(helper);
        return helpers;
      }
    }, new GroupEx('helpers'));
  }

  createHelper (light) {
    const helpers = this.getObjectByName('helpers') || new GroupEx('helpers');
    const type = light.type.concat('Helper');
    if (type in THREE) {
      const helper = new THREE[type](light);
      return helpers.add(helper);
    }
  }

  /* create lights */
  createCameras (template) {
    return template.reduce(function (cameras, properties) {
      const { position, type } = properties;
      if (type in THREE) {
        const camera = new THREE[type]();
        camera.position.fromArray(position);
        Object.keys(properties).filter(key => VALID_LIGHT_PROPERTIES.includes(key)).forEach(function (key) {
          console.info('createCameras', properties.name, key);
          camera[key] = properties[key];
        });
        camera.castShadow = castShadow;
        cameras.add(camera);
      }
      return cameras;
    }, new GroupEx('fixtures'));
  }

  attachCameraSpotLight (...args) {
    const light = new THREE.SpotLight(...args);
    light.castShadow = true;
    return this.add(light);
  }

}
