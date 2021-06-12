const menuBar = document.querySelector(".navblock__bars");
const lowerBlock = document.querySelector(".navblock__lower");
const navHeader = document.querySelector(".page-container > header");
const navLinks = document.querySelectorAll(".navblock__item, .header__button");

const sectionButtons = document.querySelectorAll(".sectiongrid__title button");
let isRunning = false;

const projectButtons = document.querySelectorAll(".projects__button");
const imageButtons = document.querySelectorAll(".projects__imagewrap");
const modal = document.querySelector(".modal");
const modalCaption = document.querySelector(".modal__caption");
const modalClose = document.querySelector(".modal__close");
const modalImage = document.querySelector(".modal__image");
let modalOpen = false;
let lastFocusedElement = "";

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
// The method I found to do this without using absolute values for height: https://css-tricks.com/using-css-transitions-auto-dimensions/
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
  element.addEventListener("transitionend", function (e) {
    // so it only triggers once
    element.removeEventListener("transitionend", arguments.callee);
    element.style.display = null;
    element.style.transition = null;
    button.classList.remove("expanded");
  });
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

function closeModal(e) {
  if (e.target !== modalImage) {
    modalOpen = false;
    modal.style.display = null;
    modalImage.width = null;
    modalImage.height = null;
    modalImage.src = "";
    modalCaption.innerHTML = "";
    lastFocusedElement.focus();
  }
}
// Remove focus from buttons when clicked and not tabbed, just feels janky.
function blurOnClick(button) {
  button.addEventListener("mousedown", function (e) {
    e.preventDefault();
  });
}
// Remove no-js class. Just so site is usable even without JS.
document.body.classList.remove("no-js");

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
  let section = button.id.replace("-title", "");
  let sectionWrap = document.querySelector(`#${section}-content`);
  sectionWrap.style.height = "0px";
  blurOnClick(button);
  button.addEventListener("click", function () {
    // Don't run if already running
    if (isRunning) return;
    isRunning = true;
    const sectionElement = sectionWrap;
    if (this.classList.contains("expanded")) {
      collapseElement(sectionElement, this);
    } else {
      expandElement(sectionElement, this);
    }
    setTimeout(function () {
      isRunning = false;
    }, 600);
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

for (let button of projectButtons) {
  let projectWrap = document.querySelector(`#${button.id}-details`);
  projectWrap.style.height = "0px";
  blurOnClick(button);
  button.addEventListener("click", function () {
    if (isRunning) return;
    isRunning = true;
    const project = projectWrap;
    if (this.classList.contains("expanded")) {
      this.innerHTML = this.innerHTML.replace("Read less&nbsp;", "Read more");
      collapseElement(project, this);
    } else {
      this.innerHTML = this.innerHTML.replace("Read more", "Read less&nbsp;");
      this.classList.toggle("flipped");
      expandElement(project, this);
    }
    setTimeout(function () {
      isRunning = false;
    }, 600);
  });
}

modal.addEventListener("click", closeModal);
modalClose.addEventListener("click", closeModal);
modalImage.addEventListener("click", function (e) {
  e.stopPropagation();
  modalImage.classList.toggle("zoomed");
});

for (let button of imageButtons) {
  let image = button.firstElementChild;
  button.addEventListener("click", function () {
    lastFocusedElement = button;
    modalOpen = true;
    modal.style.display = "block";
    modalImage.width = image.dataset.width;
    modalImage.height = image.dataset.height;
    modalImage.src = image.dataset.modal;
    modalCaption.innerHTML = image.alt;
    modal.focus();
  });
}

// To trap focus in modal and return to last location after
document.addEventListener("keydown", function (e) {
  if (modalOpen) {
    if (e.key === "Tab" || e.code === "Tab") {
      modalClose.focus();
      e.preventDefault();
    }
  }
});

// let cls = 0;
// new PerformanceObserver((entryList) => {
//   for (const entry of entryList.getEntries()) {
//     if (!entry.hadRecentInput) {
//       cls += entry.value;
//       console.log("Current CLS value:", cls, entry);
//     }
//   }
// }).observe({ type: "layout-shift", buffered: true });
