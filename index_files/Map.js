class Map {
  constructor (planet, {width, height, radius}) {
    this.options = Object.assign({}, {
      radius: 500,
      width: 960,
      height: 480,
      color: 0x1B9EBC,
      uri: 'https://unpkg.com/world-atlas@1.1.4/world/50m.json'
    }, {width, height, radius});

    this.geometries = {
      land: new THREE.Geometry(),
      countries: new THREE.Geometry()
    }

    this.buildMap(planet);
  }

  async buildMap(planet) {
    const land = await this.makeLand(this.options);
    const countries = await this.makeCountries(this.options);
    const { points, geometry } = this.makeGlobe(land, countries, this.options);
    this.geometries.land = geometry;
    this.highlightRegions(['argentina', 'brazil', 'china', 'angola'], this.geometries.land, land, this.options)
    return planet.add(points);
  }

  makeProjectionContext ({width, height}) {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext('2d');
    const projection = d3.geoEquirectangular().scale(height / Math.PI).translate([width / 2, height / 2])//.fitSize([width, height], topojson.feature(world, world.objects.land));
    const path = d3.geoPath(projection, context);
    return { context, path };
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
    const world = await axios.get('https://unpkg.com/world-atlas@1.1.4/world/50m.json').then(result => result.data);
    
    // Draw
    const feature = topojson.feature(world, world.objects.land);
    context.beginPath();
    context.fillStyle = '#F00';
    path(feature);
    context.fill();

    return this.makeMapData(context);
  }

  async makeCountriesXXX({width, height}) {
    const {context, path} = this.makeProjectionContext({width, height});
    const world = await axios.get('https://unpkg.com/world-atlas@1.1.4/world/50m.json').then(result => result.data);

    // Draw
    const feature = topojson.feature(world, world.objects.countries);
    context.beginPath();
    context.strokeStyle = '#F00';
    context.lineWidth = 0.005;
    path(feature);
    context.stroke();

    return this.makeMapData(context);
  }

  async makeCountries({width, height}) {
    const {context, path} = this.makeProjectionContext({width, height});
    const world = await axios.get('https://raw.githubusercontent.com/johan/world.geo.json/master/countries.geo.json').then(result => result.data);

    // Draw
    context.beginPath();
    context.strokeStyle = '#F00';
    context.lineWidth = 0.005;
    path(world);
    context.stroke();

    return this.makeMapData(context);
  }

  XYZtoPoint (x, y, z, radius) {
    const latitude = 90 - (Math.acos(y / radius)) * 180 / Math.PI;
    const longitude = ((270 + (Math.atan2(x , z)) * 180 / Math.PI) % 360) -180;
    return turf.point([longitude, latitude]);
  }


  filter (geo, names) {
    var features = geo.features.filter(feature => {
      return names.indexOf(feature.properties.name.toLowerCase()) > -1;
    });
    var [x, ...z] = features;
    var union = z.reduce((a, b) => {
      return turf.union(a, b);
    }, x);
    return union;
  }

  async highlightRegions (regions, geometry, map, {width, height, radius, color}) {
    window.geometry = geometry;
    const countries = await axios.get('https://raw.githubusercontent.com/johan/world.geo.json/master/countries.geo.json').then(result => result.data);
    const region = this.filter(countries, [].concat(regions));

    let earthColors = [];
    let colorIndex = 0;
    let xIndex = 0;
    let colorPoints = [];
    for (let longitude = 2*Math.PI; longitude >= 0; longitude-=2*Math.PI/(width)) {
      let yIndex = 0;
      for (let latitude = 0; latitude <= Math.PI; latitude+=Math.PI/(height)) {
        if (map[yIndex][xIndex] == 0) {
          
          const x = radius * Math.cos(longitude) * Math.sin(latitude);
          const z = radius * Math.sin(longitude) * Math.sin(latitude);
          const y = radius * Math.cos(latitude);

          const point = this.XYZtoPoint(x, y, z, radius);

          if(turf.inside(point, region)) {
            colorPoints.push(colorIndex);
            //geometry.colors[colorIndex].set(0x63d0e9);
          }
          colorIndex++;
        }
        yIndex++;
      }
      xIndex++;
    }
    // geometry.colorsNeedUpdate = true; 
    new TWEEN.Tween({ r: 0, g: 0, b: 0 })
      .delay(200)
      .to({ r: 1, g: 1, b: 1 }, 500)
      .easing(TWEEN.Easing.Quartic.Out)
      .onUpdate(function(progress) {
        colorPoints.forEach(colorIndex => {
          geometry.colors[colorIndex].setRGB(this.r, this.g, this.b);
        });
        geometry.colorsNeedUpdate = true;
      })
      .repeat(Infinity)
      .yoyo(true)
      .start(); 
  }

  makeGlobe (land, countries, {width, height, radius, color}) {
    const loader = new THREE.TextureLoader();
    const material = new THREE.PointsMaterial({
      size: 4,
      vertexColors: THREE.VertexColors,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide,
    });

    const shaderPoint = THREE.ShaderLib.points
    const uniforms = THREE.UniformsUtils.clone(shaderPoint.uniforms)

    const image = new Image()
    uniforms.map.value = new THREE.Texture(image)
    image.onload = function() {
      uniforms.map.value.needsUpdate = true
    };
    image.src = imageSrc
    //uniforms.size.value = 60
    //uniforms.scale.value = 0//window.innerHeight * .5


    let materialX = new THREE.PointsMaterial({
      size: 20,
      color: 0xffffff,
      map:  uniforms.map.value,
      vertexColors: THREE.VertexColors,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide,
      depthWrite: false,
      transparent: true,
      // sizeAttenuation: false
    })

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

        if (land[yIndex][xIndex] == 0) {
          color = countries[yIndex][xIndex] == 0 ? 0x63d0e9 : 0x0a3843;
          geometry.vertices.push(new THREE.Vector3(x, y, z));
          earthColors[ colorIndex ] = new THREE.Color( color );
          colorIndex++;
        }/* else if (countries[yIndex][xIndex] == 0) {
          geometry.vertices.push(new THREE.Vector3(x, y, z));
          earthColors[ colorIndex ] = new THREE.Color( 0xFFFFFF );
          colorIndex++;
        }*/
        yIndex++;
      }
      xIndex++;
    }
    geometry.colors = earthColors;
    return { points, geometry };
  }
}