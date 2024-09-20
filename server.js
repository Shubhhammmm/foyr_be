const express = require('express')
const cors = require('cors')
const { createServer } = require('http')
const { Server } = require('socket.io')

const app = express()
app.use(cors())
const server = createServer(app)
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
})

let drawings = []
let users = []

io.on('connection', (socket) => {
  // console.log('A user connected:', socket.id);

  socket.on('join', (userData) => {
    users.push(userData)
    socket.broadcast.emit('userJoined', userData)

    socket.emit('drawing', drawings)

    console.log(`${userData.name} joined with socket ID: ${socket.id}`)
  })

  socket.on('drawing', (drawingData) => {
    drawings.push(drawingData)
    socket.broadcast.emit('drawing', drawingData)
  })

  socket.on('sendMessage', (msgData) => {
    io.emit('newMessage', msgData)
  })

  socket.on('disconnect', () => {
    users = users.filter((user) => user.socketId !== socket.id)
    socket.broadcast.emit('userLeft', socket.id)
    console.log(`User disconnected: ${socket.id}`)
  })
})

server.listen(3000, () => {
  console.log('Listening on http://localhost:3000')
})
