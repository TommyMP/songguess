# Guess The Song 🇬🇧
Song-guessing multiplayer web game built with Socket.IO and the Spotify Web API.

Users can create rooms with a custom name and use that name to invite other players to the room.

The user who creates a room is the admin and he has access to the room settings, where he can load a Spotify Playlist to use in the game with the link provided by Spotify.
The application does not use Spotify User Authentication, therefore it can't access users' private playlists and the playlist used must be public.

After loading a playlist the game will tell the admin how many songs from that playlist can be used in the game (more on that later) and the admin can set the duration of the game (the amount of songs that will be played).

For each song, the application uses the `preview_url` provided by the Spotify Web API, which points to a significant 30 seconds part of the song; unfortunately this url is not available for every song on Spotify, hence sometimes the game won't be able to use all the songs in a playlist.

After the song starts playing, users can type in their guesses for the title and the artists (in case of multiple artists they can be guessed separately or together), getting one point for each correct guess (only the first one to guess each element gets the point), after something is guessed, it's displayed to everyone.
The checking of the guesses is case insensitive, but apart from that the guesses must be written exactly as they are on Spotify, except for parts such as "- Remix", "- Remastered", "Radio Edit", "(feat. X)", etc. which are removed from the titles.


# Guess The Song 🇮🇹
Gioco web multiplayer in cui si deve indovinare che canzone sta venendo riprodotta, costruito con Socket.IO e le Spotify Wen API.

Gli utenti possono creare delle stanze con un nome personalizzato ed usarlo per invitare altri giocatori nella stanza.

L'utente che crea una stanza ne diventa l'admin e ha accesso alle impostazioni della stanza, dove può caricare una Playlist di Spotify, da usare nella partita, con il link fornito da Spotify.
L'applicazione non usa la User Authentication di Spotify, per cui non può accedere alle playlist private degli utenti e le playlist usate devono esse pubbliche.

Dopo aver caricato una playlist, il gioco comunicherà all'admin quante canzoni di quella playlist possono essere usate nella partita (il motivo verrò spiegato a breve) e l'admin può impostare la durata della partita (il numero di canzoni che verranno riprodotte).

Per ogni canzone, l'applicazione usa il `preview_url` fornito dalla Spotify Web API, che manda a 30 secondi significativi della canzone; sfortunatamente questo url non è disponibile per ogni canzone presente su Spotify, per questo motivo molte volte il gioco non potrà usare tutte le canzoni presenti in una playlist.

Appena inizia la riproduzione di una canzone, gli utenti possono inviare i loro tentativi per indovinare il titolo e gli artisti (in caso di più artisti possono essere scritti tutti insime o separatamente), ricevendo un punto per ogni elemento indovinato (solo il primo giocatore ad indovinare ogni elemento riceve il punto), dopo che qualcosa viene indovinato, viene mostrato a tutti.
Il controllo delle risposte non fa differenza tra maiuscole e minuscole, ma per il resto titolo e artisti devono essere scritti esattamente come sono su Spotify, eccetto per le parti dei titoli come "- Remix", "- Remastered", "Radio Edit", "(feat. X)", ecc. che vengono rimosse.
