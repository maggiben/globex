import socketio from 'socket.io';
import timesyncServer from 'timesync/server';
import { version } from '../package.json';
import { createClient } from 'redis';
import adapter from 'socket.io-redis';
import { EventEmitter } from 'events';
import config from 'config';

const debug = require('debug')('globex:socketio');

const getRedis = function () {
  const pubClient = createClient(config.redis.port, config.redis.hostname);
  const subClient = createClient(config.redis.port, config.redis.hostname);
};

class SocketClient {
  constructor (io, socket) {
    const eventTypes = ['disconnect', 'echo', 'ping', 'join', 'leave', 'timesync'];
    this.io = io;
    this.socket = socket;

    // Socket listeners
    eventTypes.map(event => {
      return this.socket.on(event, this[event]);
    });
  }

  disconnect = reason => {
    debug('disconnect:', this.socket.id)
  }

  echo = message => {
    debug('echo:', message);
    this.socket.emit('echo', message);
  }

  ping = () => {
    debug('ping');
    this.socket.emit('pong', version);
  }

  timesync = data => {
    debug('timesync', this.socket.id);
    this.socket.emit('timesync', {
      id: data && 'id' in data ? data.id : null,
      result: Date.now()
    });
  }

  join = options => {
    /*
    let exists = rooms.some(room => (room.name === options.name))
    if(!exists) {
      debug('room', options.name, 'not found')
      this.socket.emit('fail', 'not found')
    }
    debug('joining room:', options.name)
    this.io.adapter.remoteJoin(this.socket.id, options.name, error => {
      if (error) {
        debug('unknown id')
        return
      }
      debug('joined room:', options.name)
      this.socket.emit('joined', options.name)
    })
    */
  }

  leave = options => {
    /*
    debug('leave')
    let exists = rooms.some(room => (room.name === options.name))
    if(!exists) {
      this.socket.emit('fail', 'not found')
    }

    this.io.adapter.remoteLeave(this.socket.id, options.name, error => {
      if (error) {
        debug('unknown id')
        return
      }
      this.socket.emit('leaved', options.name)
    })
    */
  }
}

export class ScreenSocket {

  constructor (server, namespace = '/') {
    // Setup Adapter
    const io = socketio.listen(server);

    if(config.redis) {
      this.io.adapter(adapter(config.redis));
    }

    debug('socket namespace: ', namespace);
    this.io = io.of(namespace);
    // handshake middleware
    this.io.use(this.handshake);
    // Listeners
    this.io.on('connection', this.addClient);

    const eventos = {
      trigger: Date.now() + 2000
    };
    setInterval(function () {
      debug('next animation');
      eventos.trigger = Date.now() + 2000;
      io.sockets.emit('eventos', eventos);
    }, 5000);
  }

  addClient = socket => {
    debug('client connected', socket.id);
    const client = new SocketClient(this.io, socket);
    return client;
  }

  getClients = () => {
    return new Promise((resolve, reject) => {
      this.adapter.clients(function (error, clients) {
        if(error) {
          return reject(error);
        }
        // an array containing all connected socket ids
        return resolve(clients);
      });
    });
  }

  handshake = (socket, next) => {
    const { id, token } = socket.handshake.query;
    return next();
    if(token) {
      socket.user = { token, id };
      return next();
    } else {
      socket.disconnect('unauthorized');
      return next(new Error('not authorized'));
    }
  }
}
