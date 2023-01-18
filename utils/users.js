const users = [];

// Ingresso utente nella chat
function userJoin(id, username, room, points) {
    let admin = false;
    if(users.length==0)
        admin = true;
    const user = {id, username, room, points, admin};
    users.push(user);

    return user;

}

// Get utente corrente
function getCurrentUser(id) {
    return users.find(user => user.id === id);
}

// Uscita utente dalla chat
function userLeave(id) {
    const index = users.findIndex(user => user.id === id);
    
    if(index !== -1) {
        return users.splice(index, 1)[0];
    }
}

// Get utenti nella stanza
function getRoomUsers(room) {
    return users.filter(user => user.room === room);
}

module.exports = {
    userJoin,
    getCurrentUser,
    userLeave,
    getRoomUsers
}