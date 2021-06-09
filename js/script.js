const menuBar = document.querySelector(".navblock__bars");
const lowerBlock = document.querySelector(".navblock__lower");
const navHeader = document.querySelector(".page-container > header");
const anchorArray = document.querySelectorAll("a");
const sectionButtons = document.querySelectorAll(".sectiongrid__title button");
const navLinks = document.querySelectorAll(".navblock__item, .header__button");
const sectionContent = document.querySelectorAll(".content__wrap");
let isRunning = false;
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
  navHeader.classList.toggle("sticky");
}

// Collapsing animation for element of auto-adjusted height
// This is the only way I found to do this without using absolute values for height: https://css-tricks.com/using-css-transitions-auto-dimensions/
// I don't know how to solve this any other way so the code used here is more or less similar, rather than bloating it for no reason
// My way of handling this with multiple sections is my own idea however, and I've made a few small changes to suit my needs and fix some bugs.
function collapseElement(element, button) {
  let trueHeight = element.scrollHeight;
  element.style.transition = "none";
  element.tabIndex = "-1";

  requestAnimationFrame(function () {
    element.style.height = trueHeight + "px";
    element.style.transition = "height 0.5s ease-out";

    requestAnimationFrame(function () {
      element.style.height = 0 + "px";
    });
  });
  setTimeout(function () {
    element.style.display = "none";
    element.style.transition = null;
  }, 500);
  button.classList.remove("expanded");
  button.setAttribute("aria-expanded", "false");
}

function expandElement(element, button) {
  element.style.display = "block";
  let trueHeight = element.scrollHeight;
  const scrollY = button.getBoundingClientRect().top + window.pageYOffset;
  element.tabIndex = "0";
  element.style.height = trueHeight + "px";

  element.addEventListener("transitionend", function (e) {
    // so it only triggers once
    element.removeEventListener("transitionend", arguments.callee);
    element.style.height = null;
    window.scrollTo({ top: scrollY, behavior: "smooth" });
  });
  button.classList.add("expanded");
  button.setAttribute("aria-expanded", "true");
}

// Remove no-js class. Just so site is usable even without JS.
document.body.classList.remove("no-js");
for (section of sectionContent) {
  section.style.height = "0px";
}

// It seems Webkit browsers renders smallcaps slightly smaller than Gecko, which renders it as it should be. This is to remedy that.
if (navigator.userAgent.includes("Chrome") || navigator.userAgent.includes("Safari")) {
  const smallcaps = document.querySelectorAll(".smallcaps, .smallcaps--all");
  for (let element of smallcaps) {
    let text = element.innerHTML;
    let weight = Number(window.getComputedStyle(element).getPropertyValue("font-weight"));
    if (weight === 700) element.style.fontWeight = `${weight + 100}`;
    element.innerHTML = `<span class="webkit-fix">${text}</span>`;
  }
}

// Hide menu when pressing on the opaque bg
lowerBlock.addEventListener("click", function (e) {
  if (document.querySelector(".navblock__lower--show") && e.offsetY > lowerBlock.offsetHeight) {
    openMenu();
  }
});

menuBar.addEventListener("click", openMenu);
// for (let anchor of anchorArray) {
//   anchor.addEventListener("click", noBubble);
// }

for (let button of sectionButtons) {
  button.addEventListener("click", function () {
    // Don't run if already running
    if (isRunning) return;
    isRunning = true;
    let section = this.id.replace("-header", "");
    const sectionElement = document.querySelector(`#${section}-content`);
    if (this.classList.contains("expanded")) {
      collapseElement(sectionElement, this);
    } else {
      expandElement(sectionElement, this);
    }
    setTimeout(function () {
      isRunning = false;
    }, 600);
  });
  button.addEventListener("mousedown", function (e) {
    e.preventDefault();
  });
}
for (let navLink of navLinks) {
  navLink.addEventListener("click", function (e) {
    e.preventDefault();
    if (this !== document.querySelector(".header__button") && document.querySelector(".navblock__lower--show")) {
      openMenu();
    }
    let target = this.getAttribute("href");
    let button = document.querySelector(`${target}`);
    const scrollY = button.getBoundingClientRect().top + window.pageYOffset;
    if (button.classList.contains("expanded")) window.scrollTo({ top: scrollY, behavior: "smooth" });
    else {
      let click = new Event("click");
      button.dispatchEvent(click);
    }
  });
}
