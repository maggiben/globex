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
import { debug } from 'debug';

const Info = debug('globex:main:info');
const app = express();
// App middleware
app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded
app.use(cookieParser());
app.use(favicon(path.join(__dirname, 'favicon.ico')))
app.use(cors()); // for parsing application/json
// App Rutes
app.use('/api', api);

export const server = app.listen(config.service.port, function () {
  const host = server.address().address
  const port = server.address().port
  // const io = socketio.listen(server);
  // handleSocket(io);
  const screenSocket = new ScreenSocket(server);
  Info(`server listening at ${host}:${port}'`)
});
