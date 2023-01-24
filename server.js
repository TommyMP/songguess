const path = require('path');
const http = require('http');
const express = require('express');
const socketio = require('socket.io');
const formatMessage = require('./utils/messages');
const { userJoin, getCurrentUser, userLeave, getRoomUsers, resetPoints } = require('./utils/users');
const { getRoomByName, removeRoom, addRoom } = require('./utils/rooms')

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
    socket.on('joinRoom', ({ username, room }) => {

        if (getRoomUsers(room).length == 0)
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
        if (msg.toLowerCase().includes(roomInfo.currentSongTitle.toLowerCase()) && roomInfo.titleGuessed == 0) {
            roomInfo.titleGuessed = 1;
            io.to(user.room).emit('messageX', formatMessage(botName, `Title guessed by ${user.username}.`));
            user.points += 1;

            if (roomInfo.artistsToGuess.length == 0) {
                //roomInfo.hasBeenSkipped = true;
                nextSong(roomInfo.name, roomInfo.turn);
            }
        }
        if (roomInfo.artistsToGuess.some(a => msg.toLowerCase().includes(a))) {
            lengthBefore = roomInfo.artistsToGuess.length;

            console.log(roomInfo.artistsToGuess);
            console.log(lengthBefore);

            roomInfo.artistsToGuess = roomInfo.artistsToGuess.filter(g => !msg.toLowerCase().includes(g));
            lengthAfter = roomInfo.artistsToGuess.length;

            artistsGuessed = lengthBefore - lengthAfter;
            io.to(user.room).emit('messageX', formatMessage(botName, `${artistsGuessed} Artist(s) guessed by ${user.username}. ${lengthAfter} artist(s) remaining.`));
            user.points += artistsGuessed;

            if (roomInfo.artistsToGuess.length == 0 && roomInfo.titleGuessed == 1) {
                nextSong(roomInfo.name, roomInfo.turn);
                //roomInfo.hasBeenSkipped = true;
            }

        }

    });

    // Ascolto comandi
    socket.on('chatCommand', ({ command, args }) => {
        const user = getCurrentUser(socket.id);
        if (user.admin) {
            executeCommand(user.room, command, args);
        }
    });

    // Disconnessione di un client
    socket.on('disconnect', () => {
        const user = userLeave(socket.id);


        if (user) {
            if (getRoomUsers(user.room).length == 0) {
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

server.listen(PORT, () => console.log("Server running on port " + PORT));

async function executeCommand(room, command, args) {
    switch (command) {
        case 'playlist':
            getRoomByName(room).playlistCode = args[0].replace('https://open.spotify.com/playlist/', '').split('?')[0];

            spotifyApi.getPlaylist(getRoomByName(room).playlistCode).then(async function (data) {
                getRoomByName(room).playlistName = data.body.name;
                let total = data.body.tracks.total;

                songs = await getAllSongs('3Aue23uuMfhzHKqEnSQpcx', total);

                getRoomByName(room).playableTracks = songs.filter(t => t.track.preview_url != null);
                io.to(room).emit('message', formatMessage(botName, `Playlist "${data.body.name}" has been loaded, the playlist contains ${songs.length} tracks, but only ${getRoomByName(room).playableTracks.length} of those can be used in the game, make sure you don't set a number of rounds higher than that.`));

                io.to(room).emit('playlist', data.body.name);
                //io.to(room).emit('songpreview', data.body.tracks.items[Math.floor(Math.random()*data.body.tracks.items.length)].track.preview_url);
            }, function (err) { console.log(err) });
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
            setTimeout(() => { playSong(room) }, 5000);
            break;
    }
}

function refreshToken() {
    spotifyApi.clientCredentialsGrant().then(
        function (data) {
            console.log('The access token expires in ' + data.body['expires_in']);
            console.log('The access token is ' + data.body['access_token']);

            // Save the access token so that it's used in future calls
            spotifyApi.setAccessToken(data.body['access_token']);
            test();
        },
        function (err) {
            console.log('Something went wrong when retrieving an access token', err);
        }
    );

    setTimeout(refreshToken, 3000000);
}

function playSong(roomName) {
    let room = getRoomByName(roomName);

    let trackIndex = Math.floor(Math.random() * room.playableTracks.length);
    let track;
    track = room.playableTracks.splice(trackIndex,1)[0].track;

    artists = [];
    track.artists.forEach(a => artists.push(a.name));
    artistsToGuess = [];
    artists.forEach(a => artistsToGuess.push(a.toLowerCase()));

    room.currentSongTitle = filterTitle(track.name);

    //room.currentSongTitle = track.name.replace(/\s*\(.*?\)\s*/g, '');
    room.currentSongArtists = artists;
    room.titleGuessed = 0;
    room.artistsToGuess = artistsToGuess;
    room.hasBeenSkipped = false;
    const waitingTurn = room.turn;
    io.to(roomName).emit('songpreview', track.preview_url);
    setTimeout(() => { nextSong(roomName, waitingTurn) }, 30000);
}

function nextSong(roomName, callersTurn) {
    let roomInfo = getRoomByName(roomName);
    console.log(roomInfo.turn);
    console.log(callersTurn);
    if (roomInfo.turn == callersTurn && roomInfo.playing) {
        io.to(roomName).emit('stopSong');
        roomInfo.turn += 1;

        io.to(roomName).emit('roomUsers', {
            room: roomName,
            users: getRoomUsers(roomName)
        });

        io.to(roomName).emit('message', formatMessage(botName, `Turn ended. Title: ${roomInfo.currentSongTitle}, Artists: ${roomInfo.currentSongArtists.map(art => `${art}, `).join('')}`));

        if (roomInfo.turn - 1 == roomInfo.turns) {
            playing = false;
            io.to(roomName).emit('message', formatMessage(botName, `The game is over and the winner is: ${getRoomUsers(roomName)[0].username}.`))
        }
        else {
            io.to(roomName).emit('turn', roomInfo.turn);
            io.to(roomName).emit('message', formatMessage(botName, `Playing a new song in 5 seconds...`));
            setTimeout(() => { playSong(roomName) }, 5000);
        }
    }

}

async function test() {
    // spotifyApi.getPlaylistTracks('3Aue23uuMfhzHKqEnSQpcx').then(function(data) {
    //     console.log(data);
    // });

    // spotifyApi.getPlaylistTracks('3Aue23uuMfhzHKqEnSQpcx',{market:'IT', offset:0, limit:100}).then(function(data) {
    //     console.log(data);
    // });

    //arr = await getAllSongs('3Aue23uuMfhzHKqEnSQpcx');
    //arr.forEach(el => console.log(el.track.name));
    //console.log('Trovate ' + arr.length + ' canzoni.');
    //let count = 0;
    //arr.forEach(el => {if(el.track.preview_url!=null)count++;});
    //console.log('Trovate ' + count + ' preview.');

}

// async function getAllItems(id, offset, remaining, arr) {
//     let lim = (remaining>100) ? 100 : remaining;
//     await spotifyApi.getPlaylistTracks(id, {market:'IT',offset:offset,limit:lim}).then(function(data) {
//         remaining = remaining-lim;
//         newArr = arr.concat(data.body.items);

//         if(remaining == 0)
//         {
//             return newArr;
//         }
//         else {
//             return getAllItems(id, offset+100, remaining, newArr);
//         }

//     });
// }

async function getAllSongs(id, total) {
    var numBatches = Math.floor(total / 100) + 1;
    var promises = [];
    for (let batchNum = 0; batchNum < numBatches; batchNum++) {
        var promise = getSongs(id, batchNum * 100);
        promises.push(promise);
    }
    var rawSongData = await Promise.all(promises);
    var songs = [];
    for (let i = 0; i < rawSongData.length; i++) {
        songs = songs.concat(rawSongData[i].body.items);
    }
    return songs;
}

async function getSongs(id, offset) {
    var songs = await spotifyApi.getPlaylistTracks(id, { market: 'IT', offset: offset });
    return songs;
}

function filterTitle(title) {

    title = title.replace(/\([^\)].+?\)/g, '').replace(/\[[^\]].+?\]/g, '').replace(/-.*((with)|(feat)).*/gi).replace(/-.*((remix)|(rmx)).*/gi).replace(/-.*((radio)|(edit)).*/gi,'').replace(/-.*(remaster).*/gi, '').replace(/[ \t]+$/g, '');

    return title;
}