// Hash lookup table as defined by Ken Perlin.  This is a randomly
// arranged array of all numbers from 0-255 inclusive.
const permutation = Array.from({length: 0xFF}, (v, i) => i).reduce((acc, el) => {
  acc.push(el);
  let i = Math.floor(Math.random() * (acc.length));
  [acc[i], acc[acc.length - 1]] = [acc[acc.length - 1], acc[i]];
  return acc;
}, []);

const createCanvas = function (id, width, height) {
  // const canvas = document.createElement('canvas');
  const canvas = document.getElementById(id);
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext('2d');
  const imageData = context.getImageData(0, 0, width, height);
  return { canvas, context, imageData };
}

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

    const iX = Math.floor(x) & 255;  // Integer part of x
    const iY = Math.floor(y) & 255;  // Integer part of y
    const iZ = Math.floor(z) & 255;  // Integer part of z
    const fX = x % 1; // Fractional part of x
    const fY = y % 1; // Fractional part of y
    const fZ = z % 1; // Fractional part of z
    
    const u = fade(fX);
    const v = fade(fY);
    const w = fade(fZ);

    const A = perm[iX  ]+iY, AA = perm[A]+iZ, AB = perm[A+1]+iZ;
    const B = perm[iX+1]+iY, BA = perm[B]+iZ, BB = perm[B+1]+iZ;

    return lerp(w,
      lerp(v,
        // lerp(u, grad(perm[AA], fX, fY, fZ), grad(perm[BA], fX-1, fY, fZ)),
        lerp(u, 
          // grad(perm[AA], fX, fY, fZ),
          grad(perm[ perm[ perm[iX] + iY] + iZ], fX, fY, fZ),
          grad(perm[BA], fX-1, fY, fZ)
        ),
        lerp(u, grad(perm[AB], fX, fY-1, fZ), grad(perm[BB], fX-1, fY-1, fZ))
      ),
      lerp(v,
        lerp(u, grad(perm[AA+1], fX, fY, fZ-1), grad(perm[BA+1], fX-1, fY, fZ-1)),
        lerp(u, grad(perm[AB+1], fX, fY-1, fZ-1), grad(perm[BB+1], fX-1, fY-1, fZ-1))
      )
    )
  }

  pnoise3 (x, y, z, px, py, pz) {
    const { seed, perm } = this;

    const iX = (Math.floor(x) % px) & 255;  // Integer part of x
    const iY = (Math.floor(y) % py) & 255;  // Integer part of y
    const iZ = (Math.floor(z) % pz) & 255;  // Integer part of z

    const fX = x % 1; // Fractional part of x
    const fY = y % 1; // Fractional part of y
    const fZ = z % 1; // Fractional part of z
    
    const u = fade(fX);
    const v = fade(fY);
    const w = fade(fZ);

    const A = perm[iX  ]+iY, AA = perm[A]+iZ, AB = perm[A+1]+iZ;
    const B = perm[iX+1]+iY, BA = perm[B]+iZ, BB = perm[B+1]+iZ;

    return lerp(w,
      lerp(v,
        lerp(u, 
          grad(perm[AA], fX, fY, fZ),
          grad(perm[BA], fX-1, fY, fZ)
        ),
        lerp(u, 
          grad(perm[AB], fX, fY-1, fZ), 
          grad(perm[BB], fX-1, fY-1, fZ)
        )
      ),
      lerp(v,
        lerp(u, 
          grad(perm[AA+1], fX, fY, fZ-1), 
          grad(perm[BA+1], fX-1, fY, fZ-1)
        ),
        lerp(u, 
          grad(perm[AB+1], fX, fY-1, fZ-1), 
          grad(perm[BB+1], fX-1, fY-1, fZ-1)
        )
      )
    )
  }
}

