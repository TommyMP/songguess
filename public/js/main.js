const chatForm = document.getElementById('chat-form');
const roomName = document.getElementById('room-name');
const userList = document.getElementById('users');
const playlistName = document.getElementById('title-playlist');
const roundsN = document.getElementById('rounds-display');
const roundN = document.getElementById('round-display');
const playlistImage = document.getElementById('playlistImage');
const prog = document.getElementById('prog');
const secs = document.getElementById('seconds');
const eimage = document.getElementById('songimage');
const etitle = document.getElementById('songtitle');
const eartists = document.getElementById('songartists');

let artistsNumber;

let a;
let tick = 0;
let tickFunc;

// get username e stanza dall'url
const { username, stanza } = Qs.parse(location.search, {
    ignoreQueryPrefix: true
});


const socket = io();

// ingresso stanza
socket.emit('joinRoom', {username, stanza});

// get stanza e utenti
socket.on('roomUsers', ({stanza, users}) => {
    outputRoomName(stanza);
    outputUsers(users);
});

// Nome playlist
socket.on('playlist', ({name, image}) => {
    outputPlaylist(name,image);
});

// Audio
socket.on('songpreview', url => {
    playSound(url);
});

socket.on('stopSong', ({title,artists,image}) => stopSound(title,artists,image));

// Numero turni
socket.on('turns', turni => {
    outputTurns(turni);
});

// turn
socket.on('turn', turno => {
    outputTurn(turno);
});

//informazioni canzone
socket.on('title', title => {
    outputTitle(title);
});

socket.on('artists', ({guessed,allartists}) => {
    outputArtists(guessed,allartists);
});

socket.on('artistsN', num => {
    outputNumber(num);
})

socket.on('songimage', songimage => {
    outputImage(songimage);
});


// Invio (submit) del messaggio
chatForm.addEventListener('submit', (e)=> {
    e.preventDefault();

    const msg = e.target.elements.msg.value;

    // invio comando
    if(Array.from(msg)[0] === '/')
    {
        splitmsg = msg.split(' ');
        comando = splitmsg[0].replace('/', '');
        args = splitmsg.slice(1);

        socket.emit('chatCommand', {comando, args})
    }
    else {
        // invio del messaggio al server
        socket.emit('chatMessage', msg);
    }

    // pulizia input e focus
    e.target.elements.msg.value = '';
    e.target.elements.msg.focus();
});



// Caricamento nome stanza nel DOM
function outputRoomName(room) {
    roomName.innerText = room;
}

// Caricamento lista utenti nel DOM
function outputUsers(users) {
    console.log(users);
    userList.innerHTML = `
    <tbody>
        ${users.map((user,index) => `
            <tr>
                <th class="col-1" scope="row">${index+1}</th>
                <td class="col-9">${user.username}</td>
                <td>${user.punti}</td>
            </tr>`
            ).join('')}
    </tbody>`
        //${users.map(user => `<li>${user.username}</li>`).join('')}`
}

function outputTurn(turn) {
    roundN.innerText = turn;
}

function outputTurns(turns) {
    roundsN.innerText = turns;
}

function outputPlaylist(name, image) {
    playlistName.innerHTML = name;
    playlistImage.setAttribute('src', image);
}

function outputTitle(title) {
    etitle.innerHTML = title;
}

function outputArtists(guessed,allartists) {
    guessedStr = "";

    for(i = 0; i<allartists.length; i++)
    {
        if(guessed.includes(allartists[i]))
        {
            guessedStr += allartists[i] + ", ";
        }
        else 
            guessedStr += "???, ";
    }

    guessedStr = guessedStr.substring(0,guessedStr.length-2);

    eartists.innerHTML = guessedStr;
}

function outputImage(image) {
    eimage.setAttribute('src', image);
}

function outputNumber(num) {
    artistsNumber = num;
    art = "";
    for(i = 0; i<num-1; i++) {
        art+="???, ";
    }
    art+="???";
    eartists.innerHTML = art;
}

function playSound(url) {
    ResetInfo();
    console.log(url);
    a = new Audio(url);
    a.play();
    tick = 0;
    prog.value = tick;
    seconds.innerHTML='0:00';
    tickFunc = setInterval(tickProgress, 1000);
}

function stopSound(title,artists,image) {
    a.pause();
    a.currentTime = 0;   
    clearInterval(tickFunc);
    tick = 0;
    prog.value=tick;
    seconds.innerHTML='0:00';
    DisplayAll(title,artists,image);
}

function DisplayAll(title,artists,image) {
    outputTitle(title);
    outputArtists(artists,artists);
    outputImage(image);
}

function ResetInfo() {
    outputTitle("???");
    outputImage("images/question-mark.jpg");
}

function tickProgress() {
    tick+=1000;
    prog.value = tick;
    
    seconds.innerHTML = "0:"+ "0".repeat(2 - (tick/1000).toString().length) + (tick/1000).toString();

    if(tick == 30000)
    {
        clearInterval(tickFunc);
    }
}