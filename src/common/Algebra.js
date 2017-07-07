
/* Algebraic function */
export const de2ra = function (degree) { 
  return degree * ( Math.PI / 180 );
};

export const ra2deg = function (radians) { 
  return radians * ( 180 / Math.PI );
};

/* Build Algebra as an extension from Math */

const Algebra = Object.create(Math);
Object.defineProperties(Algebra, {
  de2ra: {
    value: de2ra
  },
  ra2deg: {
    value: ra2deg
  }
});

export default Algebra;