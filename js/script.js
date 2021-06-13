//! Dropdown Menu vars
const menuBar = document.querySelector(".navblock__bars");
const lowerBlock = document.querySelector(".navblock__lower");
const navHeader = document.querySelector(".navblock");
const navLinks = document.querySelectorAll(".navblock__item, .header__button");

//! Section vars
const sectionButtons = document.querySelectorAll(".sectiongrid__title button");
let sectionIsRunning = false;
let navIsRunning = false;

//* Projects vars
const projectButtons = document.querySelectorAll(".projects__button");
const imageButtons = document.querySelectorAll(".projects__imagewrap");
const modal = document.querySelector(".modal");
const modalCaption = document.querySelector(".modal__caption");
const modalClose = document.querySelector(".modal__close");
const modalImage = document.querySelector(".modal__image");
const linkButtons = document.querySelectorAll(".projects__link");
let modalOpen = false;
let lastFocusedElement = "";

//! Fetch vars
const out = document.querySelector(".content--blog");
const url = "../blogposts/wp-json/wp/v2/posts?per_page=3&orderby=date&_embed";
let apiFetched = false;

//! Functions

//* Mobile Menu
function closeMenu() {
  lowerBlock.classList.remove("navblock__lower--show");
  lowerBlock.classList.add("navblock__lower--vanish");
  setTimeout(function () {
    menuBar.setAttribute("aria-expanded", "false");
    lowerBlock.classList.remove("navblock__lower--vanish");
    lowerBlock.classList.add("navblock__lower--hide");
    navHeader.classList.remove("fill-screen");
    document.body.classList.remove("fixed");
  }, 400);
}
function openMenu() {
  menuBar.setAttribute("aria-expanded", "true");
  lowerBlock.classList.remove("navblock__lower--hide");
  lowerBlock.classList.add("navblock__lower--show");
  navHeader.classList.add("fill-screen");
  document.body.classList.add("fixed");
}

function toggleMenu() {
  if (sectionIsRunning) return;
  navIsRunning = true;
  menuBar.classList.toggle("switch");
  if (lowerBlock.classList.contains("navblock__lower--show")) {
    closeMenu();
  } else {
    openMenu();
  }
  setTimeout(function () {
    navIsRunning = false;
  }, 400);
}

//* Section
// Collapsing animation for element of auto-adjusted height
// The method I found to do this without using absolute values for height: https://css-tricks.com/using-css-transitions-auto-dimensions/
function collapseElement(element, button) {
  let trueHeight = element.scrollHeight;
  element.style.transition = "none";

  requestAnimationFrame(function () {
    element.style.height = trueHeight + "px";
    element.style.transition = "height 0.5s ease-out";

    requestAnimationFrame(function () {
      element.style.height = 0 + "px";
    });
  });
  element.addEventListener("transitionend", function (e) {
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
  element.style.height = trueHeight + "px";

  element.addEventListener("transitionend", function (e) {
    element.removeEventListener("transitionend", arguments.callee);
    element.style.height = "";
    window.scrollTo({ top: scrollY, behavior: "smooth" });
  });
  button.classList.add("expanded");
  button.setAttribute("aria-expanded", "true");
}

function toggleSections() {
  if (sectionIsRunning) return;
  sectionIsRunning = true;
  let section = this.id.replace("-title", "");
  const sectionElement = document.querySelector(`#${section}-content`);
  if (this.classList.contains("expanded")) {
    collapseElement(sectionElement, this);
  } else {
    if (this.id === "blog-title" && !apiFetched) fetchBlogs(url);
    expandElement(sectionElement, this);
  }
  setTimeout(function () {
    sectionIsRunning = false;
  }, 600);
}

function toggleProjects() {
  if (sectionIsRunning) return;
  sectionIsRunning = true;
  let project = document.querySelector(`#${this.id}-details`);
  if (this.classList.contains("expanded")) {
    this.innerHTML = this.innerHTML.replace("Read less&nbsp;", "Read more");
    collapseElement(project, this);
  } else {
    this.innerHTML = this.innerHTML.replace("Read more", "Read less&nbsp;");
    this.classList.toggle("flipped");
    expandElement(project, this);
  }
  setTimeout(function () {
    sectionIsRunning = false;
  }, 600);
}
function openModal() {
  let image = this.firstElementChild;
  lastFocusedElement = this;
  modalOpen = true;
  modal.style.display = "block";
  modalImage.width = image.dataset.width;
  modalImage.height = image.dataset.height;
  modalImage.src = image.dataset.modal;
  modalCaption.innerHTML = image.alt;
  modal.focus();
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

//* API Functions
function checkCategories(categoriesList) {
  if (categoriesList.length > 1) {
    for (let categories of categoriesList) {
      if (categories.name === "Featured") continue;
      return categories.id;
    }
  } else return categoriesList[0].id;
}
function dateOrdinal(date) {
  date = parseInt(date);
  switch (date) {
    case 1:
    case 21:
    case 31:
      return date + "st";
    case 2:
    case 22:
      return date + "nd";
    case 3:
    case 23:
      return date + "rd";
    default:
      return date + "th";
  }
}
function dateHandler(rawDate) {
  let postDate = new Date(rawDate);
  let options = { month: "long" };
  const dateObject = {
    day: dateOrdinal(postDate.getDate()) || "Unknown",
    month: new Intl.DateTimeFormat("en-US", options).format(postDate) || "Unknown",
    year: postDate.getFullYear() || "Unknown",
    time: rawDate || "Unknown",
  };
  return dateObject;
}

//! Fetch API
function wrapNumber(match) {
  let newString = `${match[0]}<span class="ampersand-fix">${match[1]}</span>`;
  return newString;
}

function postBlog(postList) {
  let newHtml = "";
  for (let post of postList) {
    let category = checkCategories(post._embedded["wp:term"][0]);
    let date = dateHandler(post.date);
    let link = "https://dreamy-shaw-314388.netlify.app/post.html?id=" + post.id + "&category=" + category;
    let img = {
      path: post._embedded["wp:featuredmedia"][0],
      get url() {
        return this.path["media_details"].sizes.medium_large.source_url;
      },
      get alt() {
        return this.path.alt_text;
      },
    };
    // I really regret small caps now. I have to adjust numbers and symbols of unknown values.
    let title = post.title.rendered;
    title = title.replace(/[a-z][0-9]/i, wrapNumber);
    title = title.replace("&#038;", `<span class="ampersand-fix">&#038;</span>`);
    newHtml += `
    <li>
      <article class="blog">
        <a href="${link}" class="blog__linkwrap" rel="noreferrer noopener" target="_blank">
          <div class="blog__imagewrap">
            <img loading="lazy" src="${img.url}" width="768" height="320" alt="${img.alt}" />
          </div>
          <div class="blog__textblock">
            <h3 class="blog__header smallcaps--all">${title}</h3>
            <p>${post.excerpt.rendered}</p>
            <time datetime="${date.time}">${date.month} ${date.day}, ${date.year}</time>
          </div>
        </a>
      </article>
    </li>`;
  }
  return newHtml;
}
async function fetchBlogs(url = "") {
  fetch(url, {
    method: "GET",
    mode: "same-origin",
  })
    .then((response) => response.json())
    .then((data) => {
      out.innerHTML = postBlog(data);
      apiFetched = true;
    })
    .catch((error) => {
      out.innerHTML = `<h3 style="color: red">Something went wrong, refresh and try again</h3>`;
      console.error(error);
    });
}

//! Expressions & Event Listeners
// Remove no-js class. Just so site is usable even without JS.
document.body.classList.remove("no-js");

// Hide menu when pressing on the opaque bg
lowerBlock.addEventListener("click", function (e) {
  if (document.querySelector(".navblock__lower--show") && e.offsetY > lowerBlock.offsetHeight) {
    toggleMenu();
  }
});

menuBar.addEventListener("click", toggleMenu);

for (let button of sectionButtons) {
  let section = button.id.replace("-title", "");
  let sectionWrap = document.querySelector(`#${section}-content`);
  sectionWrap.style.height = "0px";
  blurOnClick(button);
  button.addEventListener("click", toggleSections);
}
for (let navLink of navLinks) {
  blurOnClick(navLink);
  navLink.addEventListener("click", function (e) {
    e.preventDefault();
    let target = this.getAttribute("href");
    let timer = 200;
    if (this !== document.querySelector(".header__button") && document.querySelector(".navblock__lower--show")) {
      // close mobile menu when link is pressed
      toggleMenu();
    } else {
      timer = 0;
    }
    // As my mobile menu applies position fixed to the body, I have to wait before navigating.
    // Otherwise use a time of 0ms, making it wait until other event handlers finish
    setTimeout(function () {
      let button = document.querySelector(`${target}`);
      if (button.classList.contains("expanded")) {
        setTimeout(function () {
          const scrollY = button.getBoundingClientRect().top + window.pageYOffset;
          window.scrollTo({ top: scrollY, behavior: "smooth" });
        }, timer);
      } else {
        let click = new Event("click");
        button.dispatchEvent(click);
      }
    }, timer);
  });
}

for (let button of projectButtons) {
  let projectWrap = document.querySelector(`#${button.id}-details`);
  projectWrap.style.height = "0px";
  blurOnClick(button);
  button.addEventListener("click", toggleProjects);
}
for (let button of linkButtons) {
  blurOnClick(button);
}
modal.addEventListener("click", closeModal);
modalClose.addEventListener("click", closeModal);
modalImage.addEventListener("click", function (e) {
  e.stopPropagation();
  modalImage.classList.toggle("zoomed");
});

for (let button of imageButtons) {
  button.addEventListener("click", openModal);
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
