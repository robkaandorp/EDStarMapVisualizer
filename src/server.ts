import { IJournal } from './IJournal';

import express from 'express';
import bodyParser from 'body-parser';
const app = express();
app.use(bodyParser.json());

import _http = require('http');
_http.globalAgent.maxSockets = 100;
const http = new _http.Server(app);

app.use(express.static('./dist/static'));

import socketio from 'socket.io';
const io = socketio(http);


import zlib from 'zlib';
import zmq from 'zeromq';
const sock = zmq.socket('sub');

sock.connect('tcp://eddn.edcd.io:9500');
console.log('Worker connected to port 9500');

sock.subscribe('');

sock.on('message', topic => {
  const message = JSON.parse(zlib.inflateSync(topic).toString());
  //console.log(message['$schemaRef']);

  if (message['$schemaRef'] !== 'https://eddn.edcd.io/schemas/journal/1') return;

  const h = message.header;
  const m = message.message;
  //console.log(`${m.timestamp} ${m.event} "${m.StarSystem}" ${m.StarPos} ${m.SystemAddress} ${h.uploaderID}`);

  const journal: IJournal = {
    timestamp: m.timestamp,
    event: m.event,
    starSystem: m.StarSystem,
    starPos: m.StarPos,
    systemAddress: m.SystemAddress,
    uploaderId: h.uploaderID
  };

  io.emit('journal', journal);
});

io.on('connection', function (socket) {
  console.log('user connected');

  socket.on('disconnect', function () {
    console.log('user disconnected');
  });
});

http.listen(3000, function(){
  console.log('listening on *:3000');
});