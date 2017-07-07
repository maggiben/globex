import * as THREE from 'THREE';
import { proceduralTexture } from '../common/Textures';

const glossMaterial = function () {
  const texture = new THREE.TextureLoader().load('/images/metal2b.jpg');
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.multiplyScalar( 24 );
  texture.anisotropy = 16;

  const material = new THREE.MeshPhongMaterial({ 
    color: 0xFFFFFF,
    side: THREE.DoubleSide,
    specular: 0x111111, 
    shininess: 200, 
    shading: THREE.FlatShading,
    map: texture,
    specularMap: texture
  });

  material.color.setHSL( 0.1, 0.25, 0.25 );
  material.specular.setHSL( 0, 0, 0.1 );
  return material;
}

const donutMaterial = function () {    
  const bump = proceduralTexture('noise', 512, 512, 75);
  const roughness = proceduralTexture('perlin', 128, 128, 75);

  bump.repeat.set( Math.random() * 124, Math.random() * 124 );
  bump.offset.set( Math.random() * 10, Math.random() * 10);
  
  roughness.offset.set( Math.random() * 10, Math.random() * 10);

  const material = new THREE.MeshStandardMaterial({ 
    color: 0x222222, 
    side: THREE.DoubleSide,
    map: roughness.clone(),
    roughness: 0.6,
    emissive: 0x111111,
    metalness: 0.5,
    bumpMap: bump,
    emissiveMap: roughness,
    roughnessMap: bump,
    metalnessMap: roughness,
    bumpScale: 0.01
  });
  return material;
}

/* Materials */
export const simplify = function (container) {
  if (container.children.length) {
    return container.children.forEach(simplify);
  }
  if (container.type === 'Mesh') {
    container.material.wireframe = true;
    container.material.needsUpdate = true;
  }
}

export const donut = donutMaterial();
export const bump = proceduralTexture('noise', 512, 512, 75);
export const roughness = proceduralTexture('perlin', 128, 128, 75);

/* Materials */
export const gloss = glossMaterial();
export const phong = new THREE.MeshPhongMaterial({ 
  color: 0xFFFFFF,
  side: THREE.DoubleSide,
  specular: 0x009900, 
  shininess: 1, 
  shading: THREE.FlatShading
});
