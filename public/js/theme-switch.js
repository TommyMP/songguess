const themeSwitchBtn = document.getElementById("theme-switch-btn");
const icon = document.getElementById("icon");
const iconS = document.getElementById("iconS");
const vol = document.getElementById("volumeIcon");
const info = document.getElementById("info-light");
const modalcontent = document.getElementById("modal-theme");
const xbtn = document.getElementById("xbtn");

const playlist = document.getElementById("idPlaylist");
const card = document.getElementById("idCard");
const divTable = document.getElementById("idTable");
const table = document.getElementById("users");


themeSwitchBtn.addEventListener("click", function() {
    info.classList.toggle("info-dark");
    if (info.classList.contains("info-dark")) {
      icon.classList.remove("fa-moon");
      icon.classList.add("fa-sun");
    } else {
      icon.classList.remove("fa-sun");
      icon.classList.add("fa-moon");
    }
    
    xbtn.classList.toggle("btn-close-white");
    playlist.classList.toggle("dark-theme");
    card.classList.toggle("dark-theme");
    icon.classList.toggle("text-light");
    iconS.classList.toggle("text-light");
    vol.classList.toggle("text-light");
    divTable.classList.toggle("text-light");
    table.classList.toggle("text-light");
    modalcontent.classList.toggle("modal-dark");
});