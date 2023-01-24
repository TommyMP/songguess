const rooms = [];

function getRoomByName(name) {
    room = rooms.find(room => room.name === name);
    if(room == undefined)
    {
        addRoom(name);
        return rooms[rooms.length-1];
    }
    return room;
}

function removeRoom(name) {
    const index = rooms.findIndex(room => room.name === name);
    
    if(index !== -1) {
        return rooms.splice(index, 1)[0];
    }
}

function addRoom(name) {
    let turns = 0;
    let turn = 1;
    let playlistCode = "";
    let playlistName = "";
    let currentSongTitle = "";
    let currentArtists = [];
    let titleGuessed = 1;
    let artistsToGuess = [];
    let playing = false;
    let playableTracks = [];
    //let hasBeenSkipped = false;
    let room = {name, turns, turn, playlistCode, playlistName, currentSongTitle, currentArtists, titleGuessed, artistsToGuess, playing, playableTracks}
    rooms.push(room);
}

module.exports = {
    getRoomByName,
    removeRoom,
    addRoom
}