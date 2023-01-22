const chatForm = document.getElementById('chat-form');
const chatMessages = document.querySelector('.chat-messages');
const roomName = document.getElementById('room-name');
const userList = document.getElementById('users');
const playlistName = document.getElementById('playlist-name');
const roundsN = document.getElementById('rounds-display');
const roundN = document.getElementById('round-display');

let a;

// get username e stanza dall'url
const { username, room } = Qs.parse(location.search, {
    ignoreQueryPrefix: true
});


const socket = io();

// ingresso stanza
socket.emit('joinRoom', {username, room});

// get stanza e utenti
socket.on('roomUsers', ({room, users}) => {
    outputRoomName(room);
    outputUsers(users);
});

// Nome playlist
socket.on('playlist', message => {
    outputPlaylist(message);
});

// Audio
socket.on('songpreview', url => {
    playSound(url);
});

socket.on('stopSong', () => stopSound());

// Numero turni
socket.on('turns', turni => {
    outputTurns(turni);
});

// turn
socket.on('turn', turno => {
    outputTurn(turno);
});


// Messaggio dal server
socket.on('message', message => {
    console.log(message);
    outputMessage(message, false);

    // scroll down
    //chatMessages.scrollTop = chatMessages.scrollHeight;
    //chatMessages.lastElementChild.scrollIntoView();
    chatMessages.scrollTo(0, chatMessages.scrollHeight*1000);
});

socket.on('messageX', message => {
    console.log(message);
    outputMessage(message, true);

    // scroll down
    //chatMessages.scrollTop = chatMessages.scrollHeight;
    //chatMessages.lastElementChild.scrollIntoView();
    chatMessages.scrollTo(0, chatMessages.scrollHeight*1000);
});

// Invio (submit) del messaggio
chatForm.addEventListener('submit', (e)=> {
    e.preventDefault();

    const msg = e.target.elements.msg.value;

    // invio comando
    if(Array.from(msg)[0] === '/')
    {
        splitmsg = msg.split(' ');
        command = splitmsg[0].replace('/', '');
        args = splitmsg.slice(1);

        socket.emit('chatCommand', {command, args})
    }
    else {
        // invio del messaggio al server
        socket.emit('chatMessage', msg);
    }

    // pulizia input e focus
    e.target.elements.msg.value = '';
    e.target.elements.msg.focus();
});

// Output del messaggio nel DOM
function outputMessage(message, success) {
    const div = document.createElement('div');
    div.classList.add('message');
    // div.innerHTML = `<p class="meta">${message.username} <span>${message.time}</span></p>
    // <p class="text">
    //     ${message.text}
    // </p>`;

    let color;
    let background = "";
    if(success) {
        color='success';
        background = ' style="background-color:#bad8c1;"';
    }
    else
        color='dark';

    div.innerHTML = `<div class="card border-${color} mb-3">
    <div class="card-header"${background}>
        <h5 class="card-title text-${color}">${message.username}</h5>
        <h6 class="card-subtitle text-muted">${message.time}</h6>
    </div>
    <div class="card-body text-dark">
        <p class="card-text text-${color}">${message.text}</p>
    </div>
</div>`;

    chatMessages.appendChild(div);
}

// Caricamento nome stanza nel DOM
function outputRoomName(room) {
    roomName.innerText = room;
}

// Caricamento lista utenti nel DOM
function outputUsers(users) {
    userList.innerHTML = `
    <tbody>
        ${users.map((user,index) => `
            <tr>
                <th scope="row">${index+1}</th>
                <td colspan="3">${user.username}</td>
                <td>${user.points}</td>
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

function outputPlaylist(name) {
    playlistName.innerHTML = name;
}

function playSound(url) {
    console.log(url);
    a = new Audio(url);
    a.play();
}

function stopSound() {
    a.pause();
    a.currentTime = 0;
}