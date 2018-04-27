var express = require('express');
var socket = require('socket.io');

var app = express();
var server = app.listen(4000, function () {
  console.log('Messenger started');
});

app.use(express.static('public'));

var io = socket(server);

io.on('connection', function (socket) {
  console.log('make socket connection', socket.id);

  socket.on('chat', function (data) {
    io.sockets.emit('chat', data)
  });

  socket.on('typing_text', function (data) {
    socket.broadcast.emit('typing_text', data);
  })
});
