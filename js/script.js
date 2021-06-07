const menuBar = document.querySelector(".navblock__bars");
const lowerBlock = document.querySelector(".navblock__lower");
const header = document.querySelector("body > header");
const anchorArray = document.querySelectorAll("a");
const sectionButtons = document.querySelectorAll(".sectiongrid__title button");

/* To prevent jankiness from link click events */
function noBubble(e) {
  e.stopPropagation();
}
/* Open dropdown menu and animate bars */
function openMenu() {
  menuBar.classList.toggle("switch");
  if (lowerBlock.classList.contains("navblock__lower--show")) {
    lowerBlock.classList.remove("navblock__lower--show");
    lowerBlock.classList.add("navblock__lower--vanish");
    setTimeout(function () {
      lowerBlock.classList.remove("navblock__lower--vanish");
      lowerBlock.classList.add("navblock__lower--hide");
    }, 250);
  } else {
    lowerBlock.classList.remove("navblock__lower--hide");
    lowerBlock.classList.add("navblock__lower--show");
  }
  header.classList.toggle("sticky");
}
// Hide menu when pressing on the opaque bg
lowerBlock.addEventListener("click", function (e) {
  if (document.querySelector(".navblock__lower--show") && e.offsetY > lowerBlock.offsetHeight) {
    openMenu();
  }
});

menuBar.addEventListener("click", openMenu);
for (let anchor of anchorArray) {
  anchor.addEventListener("click", noBubble);
}

for (let button of sectionButtons) {
  button.addEventListener("click", function () {
    if (this.classList.contains("expanded")) {
      this.setAttribute("aria-expanded", "false");
    } else {
      this.setAttribute("aria-expanded", "true");
    }
    this.classList.toggle("expanded");
  });
}
