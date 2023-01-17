const path = require('path');
const http = require('http');
const express = require('express');
const socketio = require('socket.io');
const formatMessage = require('./utils/messages');
const {userJoin, getCurrentUser, userLeave, getRoomUsers} = require('./utils/users');

const app = express();
const server = http.createServer(app);
const io = socketio(server)

app.use(express.static(path.join(__dirname, 'public')));

const botName = 'GuessTheSong Bot';

// Connessione di un client
io.on('connection', socket => {

    // Ingresso nella stanza
    socket.on('joinRoom', ({username, room}) => {
        const user = userJoin(socket.id, username, room, 0);

        socket.join(user.room);

        // Invia il benvenuto all'utente che si è connesso
        socket.emit('message', formatMessage(botName, 'Welcome to GuessTheSong!')); 

        // Comunica a tutti tranne che all'utente che si è connesso
        socket.broadcast
            .to(user.room)
            .emit(
                'message', 
                formatMessage(botName, `${user.username} has joined the chat`)
            ); 
        
        // Info stanza
        io.to(user.room).emit('roomUsers', {
            room: user.room,
            users: getRoomUsers(user.room)
        });
    });

    // Ascolto di messaggi
    socket.on('chatMessage', (msg) => {
        const user = getCurrentUser(socket.id);

        io.to(user.room).emit('message', formatMessage(user.username, msg));
    });

    // Disconnessione di un client
    socket.on('disconnect', () => {
        const user = userLeave(socket.id);

        if(user) {
            io.to(user.room).emit('message', formatMessage(botName, `${user.username} has left the chat`)); // Invia a tutti

            // Info stanza
            io.to(user.room).emit('roomUsers', {
            room: user.room,
            users: getRoomUsers(user.room)
            });
        }
    });
});

const PORT = process.env.PORT || 3000;

server.listen(PORT, ()=>console.log("Server running on port " +  PORT));