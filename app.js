const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);

const { Server } = require("socket.io");
const io = new Server(server);

const port = process.env.PORT || 4000;

// tell express where to find static web files
app.use(express.static('public'));

// app.get is a route handler
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html');
});

server.listen(port, () => {
  console.log(`listening on ${port}`);
});

// socket.io stuff goes here
io.on('connection', (socket) => {
  console.log(socket.id + ' connected now.');
  socket.emit('connected', {sID: socket.id, message: 'new connection'});

  // listen for incoming message from ANYone connected to the chat service
  // and then see what that message is 
  socket.on('chat_message', function(msg) { // step one - receive the message
    console.log(msg);

    // step 2 - show everyone what was just sent through (send the message to everyone conncected to the service)
    io.emit('new_message', { message: msg });
  })

  // listen for a typing event and broadcast to all
  socket.on('user_typing', function(user) {
    console.log(user);

    io.emit('typing', { currentlytyping: user });
  })

  // when disconnected
  socket.on('disconnect', function(discon) {
    console.log(socket.id + " disconnected now.")
    clearInterval(socket.interval);

    io.emit('disconnected', { noconnection: discon });

  //   console.log(socket.id + " disconnected now.")
  //   socket.broadcast.emit('broadcast', { 
  //     type: 'disconnected', 
  //     name: 'Server', 
  //     statusdis: socket.id + " just came out the chat room." });
  });

});