import * as THREE from 'THREE';
import * as TWEEN from 'tween';
import GroupEx from './GroupEx';

export default class Lights extends GroupEx {
  constructor (templates) {
    super()
    const lights = this.createLights(templates);
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

  /* create lights */
  createLights (templates) {
    return templates.reduce(function (lights, properties) {
      const { color, intensity, position, name, type, castShadow = false } = properties;
      if (type in THREE) {
        const light = new THREE[type](color);
        light.position.fromArray(position);
        light.intensity = intensity;
        light.castShadow = castShadow;
        light.name = name;
        lights.add(light);
      }
      return lights;
    }, new GroupEx('lights'));
  }
}