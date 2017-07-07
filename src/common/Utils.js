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
