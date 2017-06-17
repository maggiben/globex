import config from 'config';
import express from 'express';
import bodyParser from 'body-parser';
import timesyncServer from 'timesync/server';
import cookieParser from 'cookie-parser'
import cors from 'cors';
import socketio from 'socket.io';
import { EventEmitter } from 'events';

const debug = require('debug')('globex:main');
const PORT = 8080;
const app = express();
// App middleware
app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded
app.use(cookieParser());
app.use(cors()); // for parsing application/json

app.get('/', function (req, res) {
  res.json({
    env: process.env
  })
})

// handle timesync requests
app.post('/timesync', function (req, res) {
  // console.log(timesyncServer.requestHandler)
  return timesyncServer.requestHandler(req, res);
  res.json({
    env: process.env
  })
})

//app.use('/', express.static(__dirname));
//app.use('/timesync/', express.static(__dirname + '/../../../dist'));
app.post('/timesync', function (req, res) {
  const data = {
    id: (req.body && 'id' in req.body) ? req.body.id : null,
    result: Date.now()
  };
  res.json(data);
});

const eventos = {
  trigger: Date.now() + 2000
};

const handleSocket = function (io) {
  setInterval(function () {
    debug('next animation');
    eventos.trigger = Date.now() + 2000;
    io.sockets.emit('eventos', eventos);
  }, 5000);

  io.on('connection', function (socket) {
    debug('client connected', socket.id);

    socket.on('move', function ({ position, rotation }) {
      debug(position, rotation);
      io.sockets.emit('move:camera', { position, rotation });
    });

    socket.on('timesync', function (data) {
      socket.emit('timesync', {
        id: data && 'id' in data ? data.id : null,
        result: Date.now(),
        trigger: eventos.trigger
      });
    });
  });
}

export const server = app.listen(PORT, function () {
  const host = server.address().address
  const port = server.address().port
  const io = socketio.listen(server);
  handleSocket(io);
  debug(`Runner app listening at ${host}:${port}'`)
});


