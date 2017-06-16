import timesync from 'timesync';
import $ from 'jquery';
import axios from 'axios';
import './main.css!'
import Caca from 'caca';

const caca = new Caca()

let done = false;
let animationStarted = false;
async function pepe() {
  const atlas = await axios.post('http://localhost:8080/timesync').then(result => result.data);
  console.log(atlas)
}

// create a timesync instance
const ts = timesync.create({
  server: 'http://localhost:8080/timesync',
  interval: 10000,
  delay: 1000
});

const centerGlobe = function () {
  const places = {
    arg: {
      latitude: 25.778135,
      longitude: -80.17910
    },
    syd: {
      latitude: -34.603722,
      longitude: -58.381592
    }
  }
  let place = null;
  if (done) {
    place = places.arg;
  } else {
    place = places.syd;
  }
  const params = (new URL(location)).searchParams;
  const globeId = params.get('globeId');
  const event = new CustomEvent('center', {
    detail: {
      place,
      offset: ts.offset,
      now: ts.now()
    }
  });
  document.getElementById(globeId).dispatchEvent(event);
  done = !done;
}

const animateId = function () {
  if(animationStarted) {
    return;
  }
  const params = (new URL(location)).searchParams;
  const globeId = params.get('globeId');
  const event = new CustomEvent('start:animationId', {
    detail: {}
  });
  document.getElementById(globeId).dispatchEvent(event);
  animationStarted = !done;
}

ts.on('sync', function (state) {
  let delay = 0;
  if (state === 'end') {
    console.log(ts.offset);
    delay += ts.offset;
    centerGlobe();
    // setTimeout(centerGlobe, delay);
    // animateId();
  }
});
// get notified on changes in the offset
ts.on('change', function (offset) {
  // console.log('changed offset: ', offset);
});

  // console.log(document)