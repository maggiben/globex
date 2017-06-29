import timesync from 'timesync';
import axios from 'axios';
import './Main.css!'
// import Socket from 'Socket';
import Globe from './Globe/Globe';
import Rings from './Rings/Rings';

const params = (new URL(window.location)).searchParams;
const container = document.getElementById('stage');
const scene = params.get('scene');
const options = {
  view: {
    fullWidth: parseInt(params.get('fullWidth')) || window.innerWidth,
    fullHeight: parseInt(params.get('fullHeight')) || window.innerHeight,
    x: parseInt(params.get('x')) || 0,
    y: parseInt(params.get('y')) || 0,
    width: window.innerWidth,
    height: window.innerHeight,
  }
};

const rings = window.rings = new Rings(container, options);
rings.animate();

// const globe = new Globe(container, options);
// globe.animate();
