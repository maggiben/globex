import config from 'config';
import express from 'express';
import bodyParser from 'body-parser';
import timesyncServer from 'timesync/server';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import favicon from 'serve-favicon';
import path from 'path';
import socketio from 'socket.io';
import { api } from './routes';
import { ScreenSocket } from './services';

const debug = require('debug')('globex:main');
const app = express();
// App middleware
app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded
app.use(cookieParser());
app.use(favicon(path.join(__dirname, 'favicon.ico')))
app.use(cors()); // for parsing application/json
// App Rutes
app.use('/api', api);

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

export const server = app.listen(config.service.port, function () {
  const host = server.address().address
  const port = server.address().port
  // const io = socketio.listen(server);
  // handleSocket(io);
  const screenSocket = new ScreenSocket(server);
  debug(`server listening at ${host}:${port}'`)
});

// export const socket = new ScreenSocket(server);
