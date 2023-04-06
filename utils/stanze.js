const stanze = [];

function getStanza(nome) {
    stanza = stanze.find(stanza => stanza.nome === nome);
    if(stanza == undefined)
    {
        creaStanza(nome);
        return stanze[stanze.length-1];
    }
    return stanza;
}

function eliminaStanza(nome) {
    const index = stanze.findIndex(stanza => stanza.nome === nome);
    
    if(index !== -1) {
        return stanze.splice(index, 1)[0];
    }
}

function creaStanza(nome) {
    let totaleTurni = 0;
    let turno = 1;
    let idPlaylist = "";
    let nomePlaylist = "";
    let titoloTracciaCorrente = "";
    let listaArtistiCorrenti = [];
    let titoloIndovinato = 1;
    let artistiDaIndovinare = [];
    let riproduzioneInCorso = false;
    let tracceRiproducibili = [];
    let imgPlaylist;
    let imgTraccia;
    //let hasBeenSkipped = false;
    let room = { nome, totaleTurni, turno, idPlaylist, nomePlaylist, titoloTracciaCorrente, 
        listaArtistiCorrenti, titoloIndovinato, artistiDaIndovinare, riproduzioneInCorso,
        tracceRiproducibili, imgPlaylist, imgTraccia }
    stanze.push(room);
}

module.exports = {
    getStanza,
    eliminaStanza,
    creaStanza
}