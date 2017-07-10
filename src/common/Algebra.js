
/* Algebraic function */
export const de2ra = function (degree) {
  return degree * ( Math.PI / 180 );
};

export const ra2deg = function (radians) {
  return radians * ( 180 / Math.PI );
};

// https://en.wikipedia.org/wiki/Linear_interpolation
// interpolation factor in the closed interval [0, 1]
export const lerp = function (x, y, t) {
  return x + t * (y - x)
}

export const fade =  function (t) {
  return t * t * t * (t * (t * 6 - 15) + 10)
}

export const grad = function (hash, x, y, z) {
  var h = hash & 15,
    u = h < 8 ? x : y,
    v = h < 4 ? y : h === 12 || h === 14 ? x : z;
  return ((h & 1) === 0 ? u : -u) + ((h & 2) === 0 ? v : -v);
}

export const shuffle = function (array) {
  var currentIndex = array.length, temporaryValue, randomIndex;

  // While there remain elements to shuffle...
  while (0 !== currentIndex) {

    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;

    // And swap it with the current element.
    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }

  return array;
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
