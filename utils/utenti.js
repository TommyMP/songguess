const utenti = [];

// Ingresso utente nella chat
function ingressoUtente(id, username, stanza, punti) {
    console.log(id + username + stanza + punti);
    let admin = false;
    if(getListaUtenti(stanza).length==0)
    {
        admin = true;
    }

    let utente = {id, username, stanza, punti, admin};
    utenti.push(utente);

    return utente;

}

// Get utente corrente
function utenteCorrente(id) {
    return utenti.find(utente => utente.id === id);
}

// Uscita utente dalla chat
function uscitaUtente(id) {
    const index = utenti.findIndex(utente => utente.id === id);
    
    if(index !== -1) {
        return utenti.splice(index, 1)[0];
    }
}

// Get utenti nella stanza
function getListaUtenti(stanza) {
    return utenti.filter(utente => utente.stanza === stanza).sort(function(a, b) { 
        return b.punti - a.punti;});
}

function resettaPunti(stanza) {
    utenti.forEach((utente) => {if(utente.stanza === stanza) utente.punti = 0;})
}

function getAdmin(stanza) {
    return utenti.filter(utente => utente.admin === true && utente.stanza === stanza);
}


module.exports = {
    ingressoUtente,
    utenteCorrente,
    uscitaUtente,
    getListaUtenti,
    getAdmin,
    resettaPunti
}