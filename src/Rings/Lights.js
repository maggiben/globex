import * as THREE from 'THREE';
import * as TWEEN from 'tween';

/* Lights Builder */

const Group = function ( name ) {
  THREE.Group.call( this );
  // add the desired properties
  this.name = name;
}

Group.prototype = Object.create( THREE.Group.prototype );
Group.prototype.constructor = Group;
// define the getPoint function for the subClass

export default class Lights extends Group {
  constructor (templates) {
    super()
    const lights = this.createLights(templates);
    const helpers = this.createHelpers(lights);
    this.add(lights);
    this.add(helpers);
  }

  /*
  showHelpers (lights = this.lights, show = true) {
    // this.lights.children.forEach(light => {
    //   const helper = new THREE[`${light.type}Helper`](light);
    //   this.updatees.push(helper);
    //   lights.add(helper);
    // });
    if (show && ! this.helpers) {
      const group = new THREE.Group();
      group.name = 'lightHelpers';

      this.helpers = this.lights.children.map(light => {
        const lightType = light.type.concat('Helper');
        if (lightType in THREE) {
          // const helper = new THREE[`${light.type}Helper`](light);
          const helper = Reflect.construct(THREE[lightType], [light])
          lights.add(helper);
        }
      });
    } else if (!show && this.helpers) {
      this.
    }
  }
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
    }, new Group('helpers'));
  }

  createLights (templates) {
    const lights = templates.map(function (option, index) {
      const { color, intensity, position, name, type, castShadow = false } = option;
      let light = new THREE[type](color);
      light.position.fromArray(position);
      light.intensity = intensity;
      light.castShadow = castShadow;
      light.name = name;
      if (light.helper) {
        const helper = new THREE[`${light.type}Helper`](light);
        light.add(helper);
      }
      return light;
    })
    .reduce((group, light) => {
      group.add(light);
      return group;
    }, new Group('lights'));


    // var l = lights.children[2];
    // new TWEEN.default.Tween({altitude: 40})
    //   .delay(5000)
    //   .to({altitude: 0}, 10000)
    //   .onUpdate(function(progress) {
    //     // moveTo(box, path, this.position, {x:0,y:0,z:1});
    //     const {x, y, z} = l.position.clone()
    //     l.position.set(x, this.altitude, z)
    //   })
    //   .start();

    // lights.name = 'lights';
    return lights;
  }
}