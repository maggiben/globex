import io from 'socket.io-client';
import timesync from 'timesync';
import {Scene, PerspectiveCamera, WebGLRenderer, BoxGeometry, MeshBasicMaterial, Mesh} from 'three';

export const socket = io('http://localhost:8080', {
  reconnectionDelay: 5000,
  reconnectionDelayMax: 10000
});

export const ts = timesync.create({
  server: socket,
  interval: 5000,
  delay: 5000
});

var done = false;
var serverTime = null;
var eventos = null;

const centerGlobe = function (eventos) {
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
  const event = new CustomEvent('center', {
    detail: {
      place,
      now: ts.now(),
      offset: ts.offset,
      trigger: eventos.trigger
    }
  });
  document.getElementById('globe').dispatchEvent(event);
  done = !done;
}

socket.on('eventos', function (data) {
  eventos = data;
  centerGlobe(eventos);
});

ts.on('change', function (offset) {
  // console.log('changed offset: ' + offset + ' ms');
});

ts.send = function (socket, data) {
  socket.emit('timesync', data);
};

socket.on('timesync', function (data) {
  ts.receive(null, data);
});


socket.on('disconnect', function () {
  console.log('you have been disconnected');
});

socket.on('reconnect', function () {
  console.log('you have been reconnected');
});

socket.on('connect', function (data) {
  console.log(socket.id);
});


document.addEventListener('sendToSocket', event => {
  const camera = event.detail;
  const { position, rotation, uuid } = camera;
  // console.log(event)
  socket.emit('move', { position, rotation });

  // if (this.camera.uuid == camera.uuid) {
  //   return;
  // }
  // https://stackoverflow.com/questions/30731469/three-js-switching-between-cameras-and-controls
  // this.camera.position.copy(camera.position);
  // this.camera.rotation.copy(camera.rotation);
});


class SocketClient {
  constructor(domElement) {
    const socket = io('http://localhost:8080', {
      reconnectionDelay: 5000,
      reconnectionDelayMax: 10000
    });
    domElement.addEventListener('change')
  }
}


socket.on('move:camera', function ({ position, rotation }) {
  // console.log(position, rotation)
  const event = new CustomEvent('interact', {detail: { position, rotation }});
  document.dispatchEvent(event);
});

export default socket;
