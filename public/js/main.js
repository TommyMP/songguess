const chatForm = document.getElementById('chat-form');
const chatMessages = document.querySelector('.chat-messages');
const roomName = document.getElementById('room-name');
const userList = document.getElementById('users');
const playlistName = document.getElementById('playlist-name');

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
})

// Messaggio dal server
socket.on('message', message => {
    console.log(message);
    outputMessage(message);

    // scroll down
    //chatMessages.scrollTop = chatMessages.scrollHeight;
    //chatMessages.lastElementChild.scrollIntoView();
    chatMessages.scrollTo(0, chatMessages.scrollHeight*1000);
})

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
function outputMessage(message) {
    const div = document.createElement('div');
    div.classList.add('message');
    // div.innerHTML = `<p class="meta">${message.username} <span>${message.time}</span></p>
    // <p class="text">
    //     ${message.text}
    // </p>`;

    div.innerHTML = `<div class="card border-dark mb-3">
    <div class="card-header">
        <h5 class="card-title ">${message.username}</h5>
        <h6 class="card-subtitle text-muted ">${message.time}</h6>
    </div>
    <div class="card-body text-dark">
        <p class="card-text">${message.text}</p>
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

function outputPlaylist(name) {
    playlistName.innerHTML = name;
}

function playSound(url) {
    var a = new Audio(url);
    a.play();
}