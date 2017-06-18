import timesync from 'timesync';
import axios from 'axios';
import './Main.css!'
import Socket from 'Socket';

async function pepe() {
  const atlas = await axios.post('http://localhost:8080/timesync').then(result => result.data);
  console.log(atlas)
}
