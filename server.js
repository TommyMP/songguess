const path = require('path');
const http = require('http');
const express = require('express');
const socketio = require('socket.io');
const formatMessage = require('./utils/messages');
const {userJoin, getCurrentUser, userLeave, getRoomUsers, resetPoints} = require('./utils/users');
const {getRoomByName, removeRoom, addRoom} = require('./utils/rooms')

var SpotifyWebApi = require('spotify-web-api-node');

var spotifyApi = new SpotifyWebApi({
  clientId: '0ae08cb5d8c74b8ab77f73cba2dedcbb',
  clientSecret: 'bf163b1880f2493b84d8cfa6feea4b5c'
});

// spotifyApi.clientCredentialsGrant().then(
//     function(data) {
//       console.log('The access token expires in ' + data.body['expires_in']);
//       console.log('The access token is ' + data.body['access_token']);
  
//       // Save the access token so that it's used in future calls
//       spotifyApi.setAccessToken(data.body['access_token']);
//     },
//     function(err) {
//       console.log('Something went wrong when retrieving an access token', err);
//     }
//   );


refreshToken();

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
        
        if(getRoomUsers(room).length==0)
            removeRoom(room);
        
        const user = userJoin(socket.id, username, room, 0.0);
        socket.join(user.room);

        // Invia il benvenuto all'utente che si è connesso
        socket.emit('message', formatMessage(botName, 'Welcome to GuessTheSong!')); 

        // Comunica a tutti tranne che all'utente che si è connesso
        socket.broadcast
            .to(user.room)
            .emit(
                'message', 
                formatMessage(botName, `${user.username} has joined the chat.`)
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
        roomInfo = getRoomByName(user.room);

        io.to(user.room).emit('message', formatMessage(user.username, msg));
        
        // controlli sul tentativo di indovinare
        if(msg.toLowerCase().includes(roomInfo.currentSongTitle.toLowerCase()) && roomInfo.titleGuessed == 0)
        {
            roomInfo.titleGuessed = 1;
            io.to(user.room).emit('messageX', formatMessage(botName, `Title guessed by ${user.username}.`));
            user.points += 1;

            if(roomInfo.artistsToGuess.length == 0) {
                //roomInfo.hasBeenSkipped = true;
                nextSong(roomInfo.name, roomInfo.turn);
            }
        }
        if(roomInfo.artistsToGuess.some(a => msg.toLowerCase().includes(a)))
        {
            lengthBefore = roomInfo.artistsToGuess.length;

            console.log(roomInfo.artistsToGuess);
            console.log(lengthBefore);

            roomInfo.artistsToGuess = roomInfo.artistsToGuess.filter(g => !msg.toLowerCase().includes(g));
            lengthAfter = roomInfo.artistsToGuess.length;
            
            artistsGuessed = lengthBefore-lengthAfter;
            io.to(user.room).emit('messageX', formatMessage(botName, `${artistsGuessed} Artist(s) guessed by ${user.username}. ${lengthAfter} artist(s) remaining.`));
            user.points+=artistsGuessed;

            if(roomInfo.artistsToGuess.length == 0 && roomInfo.titleGuessed == 1) {
                nextSong(roomInfo.name,roomInfo.turn);
                //roomInfo.hasBeenSkipped = true;
            }

        }

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
            if(getRoomUsers(user.room).length==0)
            {
                removeRoom(user.room);
            }
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
            getRoomByName(room).playlistCode = args[0].replace('https://open.spotify.com/playlist/', '').split('?')[0];

            spotifyApi.getPlaylist(getRoomByName(room).playlistCode).then(function(data) {
                getRoomByName(room).playlistName = data.body.name;
                io.to(room).emit('playlist', data.body.name);
                //io.to(room).emit('songpreview', data.body.tracks.items[Math.floor(Math.random()*data.body.tracks.items.length)].track.preview_url);
            }, function(err) {console.log(err)});
            //io.to(user.room).emit('playlist', args)
            break;
        case 'turns':
            getRoomByName(room).turns = Number(args);
            io.to(room).emit('turns', Number(args));
            break;
        case 'startGame':
            getRoomByName(room).playing = true;
            getRoomByName(room).turn = 1;
            resetPoints(room);
            io.to(room).emit('roomUsers', {
                room: room,
                users: getRoomUsers(room)
            });
            io.to(room).emit('turn', getRoomByName(room).turn);
            io.to(room).emit('message', formatMessage(botName, `Game starting in 5 seconds...`));
            setTimeout(() => {playSong(room)}, 5000);
            break;
    }
}

function refreshToken() {
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
    
      setTimeout(refreshToken, 3000000);
}

function playSong(roomName)
{
    let room = getRoomByName(roomName);
    spotifyApi.getPlaylist(room.playlistCode).then(function(data) {
        room.playlistName = data.body.name;
        let track;
        do {
            track = data.body.tracks.items[Math.floor(Math.random()*data.body.tracks.items.length)].track;
        }while(track.preview_url == null);
        artists = [];
        track.artists.forEach(a => artists.push(a.name));
        artistsToGuess = [];
        artists.forEach(a => artistsToGuess.push(a.toLowerCase()));
        room.currentSongTitle = track.name.replace(/\s*\(.*?\)\s*/g, '');
        room.currentSongArtists = artists;
        room.titleGuessed = 0;
        room.artistsToGuess = artistsToGuess;
        room.hasBeenSkipped = false;
        const waitingTurn = room.turn;
        io.to(roomName).emit('songpreview', track.preview_url);
        setTimeout(() => {nextSong(roomName, waitingTurn)},30000);
    }, function(err) {console.log(err)});
}

function nextSong(roomName, callersTurn) {
    let roomInfo = getRoomByName(roomName);
    console.log(roomInfo.turn);
    console.log(callersTurn);
    if(roomInfo.turn == callersTurn && roomInfo.playing) {
        io.to(roomName).emit('stopSong');
        roomInfo.turn+=1;

        io.to(roomName).emit('roomUsers', {
            room: roomName,
            users: getRoomUsers(roomName)
        });

        io.to(roomName).emit('message', formatMessage(botName, `Turn ended. Title: ${roomInfo.currentSongTitle}, Artists: ${roomInfo.currentSongArtists.map(art => `${art}, `).join('')}`));

        if(roomInfo.turn-1 == roomInfo.turns)
        {
            playing = false;
            io.to(roomName).emit('message', formatMessage(botName, `The game is over and the winner is: ${getRoomUsers(roomName)[0].username}.`))
        }
        else {
            io.to(roomName).emit('turn', roomInfo.turn);
            io.to(roomName).emit('message', formatMessage(botName, `Playing a new song in 5 seconds...`));
            setTimeout(() => {playSong(roomName)}, 5000);
        }
    }

}