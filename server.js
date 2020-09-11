'use strict';
const path = require('path');
const http = require('http');
const express = require('express');

// константы
const PORT = 8080;
const host = '0.0.0.0';

console.log(`running on http://${host}:${PORT}`);
const socketio = require('socket.io');
const formatMessage = require('./utils/messages');
const { userJoin, getCurrentUser, userLeave, getRoomUsers} = require('./utils/users');
const { start } = require('repl');
const botName = "Admin";
const app = express();


const server = http.createServer(app);
const io = socketio(server);

// Static folder
app.use(express.static(path.join(__dirname, 'public')));

// Run when client connects
io.on('connection', socket => {
    socket.on('joinRoom', ({username,room}) =>{
    const user = userJoin(socket.id,username,room);

    socket.join(user.room);
    //Welcome to the user
    socket.emit('message', formatMessage(botName,'Welcome to WebChat'));

    // Broadcast user connects
    socket.broadcast.to(user.room).emit('message',formatMessage(botName,`A ${user.username} has joined the chat`));
    io.to(user.room).emit('roomUsers', {
        room:user.room,
        users:getRoomUsers(user.room)
    });
    });

    // Listen for chatMessage
    socket.on('chatMessage', msg => {
        const user = getCurrentUser(socket.id);
        io.to(user.room).emit('message', formatMessage(`${user.username}`,msg));
    });
    // Client disconnect
    socket.on('disconnect', () => {
        const user = userLeave(socket.id);
        if (user){
        io.to(user.room).emit('message',formatMessage(botName,`A ${user.username} has left the chat`));
        io.to(user.room).emit('roomUsers', {
            room:user.room,
            users:getRoomUsers(user.room)
        });
        }
    });
});


server.listen(PORT, host)