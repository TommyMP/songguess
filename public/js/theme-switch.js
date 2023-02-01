const themeSwitchBtn = document.getElementById("theme-switch-btn");
const icon = document.getElementById("icon");
const divInfo = document.getElementById("div-info-light");
const divInput = document.getElementById("div-input-light");

themeSwitchBtn.addEventListener("click", function() {
  divInfo.classList.toggle("div-info-dark");
  divInput.classList.toggle("div-input-dark");
  if (document.body.classList.contains("dark-theme")) {
    icon.classList.remove("fa-moon");
    icon.classList.add("fa-sun");
  } else {
    icon.classList.remove("fa-sun");
    icon.classList.add("fa-moon");
  }
});