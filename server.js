const path = require('path');
const http = require('http');
const express = require('express');
const socketio = require('socket.io');
const formatMessage = require('./utils/messages');
const {userJoin, getCurrentUser, userLeave, getRoomUsers} = require('./utils/users');

var SpotifyWebApi = require('spotify-web-api-node');

var spotifyApi = new SpotifyWebApi({
  clientId: '0ae08cb5d8c74b8ab77f73cba2dedcbb',
  clientSecret: 'bf163b1880f2493b84d8cfa6feea4b5c'
});

spotifyApi.clientCredentialsGrant().then(
    function(data) {
      console.log('The access token expires in ' + data.body['expires_in']);
      console.log('The access token is ' + data.body['access_token']);
  
      // Save the access token so that it's used in future calls
      spotifyApi.setAccessToken(data.body['access_token']);
    },
    function(err) {
      console.log('Something went wrong when retrieving an access token', err);
    }
  );

const app = express();
const server = http.createServer(app);
const io = socketio(server)

app.use(express.static(path.join(__dirname, 'public')));

const botName = 'GuessTheSong Bot';
let playlistCode;

// Connessione di un client
io.on('connection', socket => {

    // Ingresso nella stanza
    socket.on('joinRoom', ({username, room}) => {
        
        const user = userJoin(socket.id, username, room, 0.0);

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

    // Ascolto comandi
    socket.on('chatCommand', ({command, args}) => {
       const user = getCurrentUser(socket.id);
       if(user.admin)
       {
            executeCommand(user.room, command,args);
       }
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

function executeCommand(room, command, args) {
    switch(command)
    {
        case 'playlist':
            playlistCode = args[0].replace('https://open.spotify.com/playlist/', '').split('?')[0];

            spotifyApi.getPlaylist(playlistCode).then(function(data) {
                io.to(room).emit('playlist', data.body.name);
                io.to(room).emit('songpreview', data.body.tracks.items[Math.floor(Math.random()*data.body.tracks.items.length)].track.preview_url);
            });
            //io.to(user.room).emit('playlist', args)
            break;
    }
}