class Map {
  constructor (planet, {width, height, radius}) {
    this.options = Object.assign({}, {
      radius: 500,
      width: 960,
      height: 480,
      color: 0x1B9EBC,
      uri: 'https://unpkg.com/world-atlas@1.1.4/world/50m.json'
    }, {width, height, radius});
    this.buildMap(planet);
  }

  async buildMap(planet) {
    const land = await this.makeLand(this.options);
    const globe = this.makeGlobe(land, this.options);
    planet.add(globe);
  }

  makeProjectionContext ({width, height}) {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext('2d');
    const projection = d3.geoEquirectangular().scale(height / Math.PI).translate([width / 2, height / 2])//.fitSize([width, height], topojson.feature(world, world.objects.land));
    const path = d3.geoPath(projection, context);
    return {context, path};
  }

  makeMapData (context) {
    const { width, height } = context.canvas;
    const data = Array(height).fill(0).map(() => Array(width).fill(0));
    const imageData = context.getImageData(0, 0, width, height);

    for (let row = 0; row < imageData.height; row++) {
      for (let col = 0; col < imageData.width; col++) {
        // Pick red color as mask
        const R = imageData.data[(row * imageData.width + col) * 4 + 0];
        data[row][col] = !R;
      }
    }

    return data;
  }

  async makeLand({width, height}) {
    const {context, path} = this.makeProjectionContext({width, height});
    const world = await axios.get('https://unpkg.com/world-atlas@1.1.4/world/50m.json').then(world => world.data);

    // Draw
    context.beginPath();
    context.fillStyle = '#F00';
    path(topojson.feature(world, world.objects.land));
    context.fill();

    return this.makeMapData(context);
  }

  async makeCountries({width, height}) {
    const {context, path} = this.makeProjectionContext({width, height});
    const world = await axios.get('https://unpkg.com/world-atlas@1.1.4/world/50m.json').then(world => world.data);

    // Draw
    context.beginPath();
    context.strokeStyle = '#F00';
    context.lineWidth = 0.005;
    path(topojson.feature(world, world.objects.countries));
    context.stroke();

    return this.makeMapData(context);
  }

  makeGlobe (map, {width, height, radius, color}) {
    const loader = new THREE.TextureLoader();
    const material = new THREE.PointsMaterial({
      size: 4,
      vertexColors: THREE.VertexColors,
      blending: THREE.NormalBlending,
      side: THREE.DoubleSide
    });

    const geometry = new THREE.Geometry();
    const points = new THREE.Points(geometry, material);
    points.updateMatrix();

    let earthColors = [];
    let colorIndex = 0;
    let xIndex = 0;
    for (let longitude = 2*Math.PI; longitude >= 0; longitude-=2*Math.PI/(width)) {
      let yIndex = 0;
      for (let latitude= 0; latitude <= Math.PI; latitude+=Math.PI/(height)) {

        const x = radius * Math.cos(longitude) * Math.sin(latitude);
        const z = radius * Math.sin(longitude) * Math.sin(latitude);
        const y = radius * Math.cos(latitude);

        if (map[yIndex][xIndex] == 0) {
          geometry.vertices.push(new THREE.Vector3(x, y, z));
          earthColors[ colorIndex ] = new THREE.Color( 0x1b9ebc );
          colorIndex++;
        /*} else if (mapMatrix[yIndex][xIndex] == 0) {
          tgeometry.vertices.push(new THREE.Vector3(x, y, z));
          earthColors[ colorIndex ] = new THREE.Color( 0x1b9ebc );
          colorIndex++;
        */}
        yIndex++;
      }
      xIndex++;
    }

    geometry.colors = earthColors;
    return points;
  }
}