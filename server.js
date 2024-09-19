const express = require('express');
const cors = require('cors')
const { createServer } = require('http');
const { Server } = require('socket.io');

const app = express();
app.use(cors());
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*', // Allow all origins (update this for security in production)
    methods: ['GET', 'POST'],
  },
});

let drawings = []; // Temporary storage for drawings in memory
let users = []; // Temporary storage for users in memory

// When a client connects to the server
io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  // Handle user joining with login details
  socket.on('join', (userData) => {
    users.push(userData); // Add the user to the list
    socket.broadcast.emit('userJoined', userData); // Notify others that a new user joined

    // Send existing drawings to the user who just joined
    socket.emit('drawing', drawings);

    console.log(`${userData.name} joined with socket ID: ${socket.id}`);
  });

  // Handle new drawing events
  socket.on('drawing', (drawingData) => {
    drawings.push(drawingData); // Save drawing to memory
    socket.broadcast.emit('drawing', drawingData); // Broadcast to other users
  });

  // Handle user messages (chat feature)
  socket.on('sendMessage', (msgData) => {
    io.emit('newMessage', msgData); // Broadcast message to all users
  });

  // Handle user disconnect
  socket.on('disconnect', () => {
    users = users.filter((user) => user.socketId !== socket.id); // Remove the user from the list
    socket.broadcast.emit('userLeft', socket.id); // Notify others the user left
    console.log(`User disconnected: ${socket.id}`);
  });
});

// Start the server
server.listen(3000, () => {
  console.log('Listening on http://localhost:3000');
});
