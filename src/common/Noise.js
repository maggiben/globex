// Hash lookup table as defined by Ken Perlin.  This is a randomly
// arranged array of all numbers from 0-255 inclusive.
const permutation = Array.from({length: 0xFF}, (v, i) => i).reduce((acc, el) => {
  acc.push(el);
  let i = Math.floor(Math.random() * (acc.length));
  [acc[i], acc[acc.length - 1]] = [acc[acc.length - 1], acc[i]];
  return acc;
}, []);

function xorshift (seed) {
  var x = seed ^ (seed >> 12);
  x = x ^ (x << 25);
  x = x ^ (x >> 27);
  return x * 2;
}

// https://en.wikipedia.org/wiki/Linear_interpolation
function lerp (t, a, b) {
  return a + t * (b - a)
}

function fade (t) {
  return t * t * t * (t * (t * 6 - 15) + 10)
}

function grad (hash, x, y, z) {
  const h = hash & 15,
    u = h < 8 ? x : y,
    v = h < 4 ? y : h === 12 || h === 14 ? x : z;
  return ((h & 1) === 0 ? u : -u) + ((h & 2) === 0 ? v : -v);
}

export class Perlin {
  constructor (seed) {
    // Doubled permutation to avoid overflow
    this.perm = permutation.concat(permutation);
    this.seed = seed ? xorshift(seed) : 0;
  }

  noise (x, y, z) {
    const { seed, perm } = this;
    var X = Math.floor(x) & 255,
        Y = Math.floor(y) & 255,
        Z = Math.floor(z) & 255;
    x -= Math.floor(x);
    y -= Math.floor(y);
    z -= Math.floor(z);
    var u = fade(x),
        v = fade(y),
        w = fade(z);
    var A = perm[X  ]+Y, AA = perm[A]+Z, AB = perm[A+1]+Z,
        B = perm[X+1]+Y, BA = perm[B]+Z, BB = perm[B+1]+Z;

    return lerp(w,
        lerp(v,
            lerp(u, grad(perm[AA], x, y, z), grad(perm[BA], x-1, y, z)),
            lerp(u, grad(perm[AB], x, y-1, z), grad(perm[BB], x-1, y-1, z))
        ),
        lerp(v,
            lerp(u, grad(perm[AA+1], x, y, z-1), grad(perm[BA+1], x-1, y, z-1)),
            lerp(u, grad(perm[AB+1], x, y-1, z-1), grad(perm[BB+1], x-1, y-1, z-1))
        )
    )
  }
  // // 3D float Perlin noise
  // noise3 (x, y, z) {
  //   const { seed, perm } = this;
  //   x += seed;
  //   y += seed;
  //   z += seed;
  //   let iX = Math.floor(x) & 255; // Integer part of x
  //   let iY = Math.floor(y) & 255; // Integer part of y
  //   let iZ = Math.floor(z) & 255; // Integer part of z

  //   let fX = x - iX;      // Fractional part of x
  //   let fY = y - iY;      // Fractional part of y
  //   let fZ = z - iZ;      // Fractional part of z

  //   const u = fade(fX);
  //   const v = fade(fY);
  //   const w = fade(fZ);

  //   const A = perm[iX]+iY, AA = perm[A]+iZ, AB = perm[A+1]+iZ, B = perm[iX+1]+iY, BA = perm[B]+iZ, BB = perm[B+1]+iZ;

  //   return lerp(w,
  //     lerp(v,
  //       lerp(u, grad(perm[AA], fX, fY, fZ), grad(perm[BA], fX - 1, fY, fZ)),
  //       lerp(u, grad(perm[AB], fX, fY - 1, fZ), grad(perm[BB], fX - 1, fY - 1, fZ))
  //     ),
  //     lerp(v,
  //       lerp(u, grad(perm[AA + 1], fX, fY, fZ - 1), grad(perm[BA + 1], fX - 1, fY, fZ - 1)),
  //       lerp(u, grad(perm[AB + 1], fX, fY - 1, fZ - 1), grad(perm[BB + 1], fX - 1, fY - 1, fZ - 1))
  //     )
  //   )
  // }
}

