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

const loginpage = document.getElementById("loginpage");

const currenttheme = document.getElementById("tema");
themeSwitchBtn.addEventListener("click", function() {
    info.classList.toggle("info-dark");
    try {
    currenttheme.value=Number(currenttheme.value)*-1;
    } catch(err) {}
    if (info.classList.contains("info-dark")) {
      icon.classList.remove("fa-moon");
      icon.classList.add("fa-sun");

    } else {
      icon.classList.remove("fa-sun");
      icon.classList.add("fa-moon");

    }
    
    try {
      xbtn.classList.toggle("btn-close-white");
      card.classList.toggle("dark-theme");
      playlist.classList.toggle("dark-theme");
      iconS.classList.toggle("text-light");
      vol.classList.toggle("text-light");
      divTable.classList.toggle("text-light");
      table.classList.toggle("text-light");
      modalcontent.classList.toggle("modal-dark");
    } catch(err) {}

    try {
      loginpage.classList.toggle("dark-theme");
    }  catch(err) {}

    icon.classList.toggle("text-light");
});

