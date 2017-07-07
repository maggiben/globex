const Ellipse = function ( xRadius, yRadius ) {
  THREE.Curve.call( this );
  // add the desired properties
  this.xRadius = xRadius;
  this.yRadius = yRadius;
}

Ellipse.prototype = Object.create( THREE.Curve.prototype );
Ellipse.prototype.constructor = Ellipse;
// define the getPoint function for the subClass
Ellipse.prototype.getPoint = function ( t ) {
  const radians = 2 * Math.PI * t;
  return new THREE.Vector3( this.xRadius * Math.cos( radians ), 0, this.yRadius * Math.sin( radians ) );
};

export default Ellipse;