import * as THREE from 'three';
import * as TWEEN from 'tween';
import GroupEx from './GroupEx';

const VALID_LIGHT_PROPERTIES = ['intensity', 'distance', 'angle', 'penumbra', 'decay', 'name'];

export default class Lights extends GroupEx {
  constructor (template) {
    super('lights')
    const lights = this.createLights(template);
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
        if (light.name) {
          helper.name = light.name.concat('-helper');
        }
        return helpers.add(helper);
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
  createLights (template) {
    return template.reduce(function (lights, properties) {
      const { color, position, type, castShadow = false } = properties;
      if (type in THREE) {
        const light = new THREE[type](color);
        light.position.fromArray(position);
        Object.keys(properties).filter(key => VALID_LIGHT_PROPERTIES.includes(key)).forEach(function (key) {
          // console.info('properties', properties.name, key);
          light[key] = properties[key];
        });
        light.castShadow = castShadow;
        lights.add(light);
      }
      return lights;
    }, new GroupEx('lamps'));
  }

  attachCameraSpotLight (...args) {
    const light = new THREE.SpotLight(...args);
    light.castShadow = true;
    return this.add(light);
  }
}
