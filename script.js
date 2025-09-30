// Variables for element in html
const cardStack = document.getElementById("card-stack");
const summary = document.getElementById("summary");
const spinner = document.getElementById("spinner");
const progressBar = document.getElementById("myProgressBar");
const likeIndicator = document.getElementById("like-indicator");
const dislikeIndicator = document.getElementById("dislike-indicator");

// Initialisation of variables
let likedCats = [];
let historyLikedCats=[];
let totalCats = 10;
let currentIndex = 0;

// Event listeners for buttons
document.getElementById("start-button").addEventListener("click", startButtonClicked);
document.getElementById("restart-button").addEventListener("click", restartButtonClicked);
document.getElementById("return-home-button").addEventListener("click", homeButtonClicked);
document.getElementById("about-button").addEventListener("click", aboutButtonClicked);
document.getElementById("return-home-button-2").addEventListener("click", homeButtonClickedFromAbout);
document.getElementById("history-button").addEventListener("click", historyButtonClicked);


// Load cats
async function loadCats() {
  document.getElementById("home-buttons").style.display = "none";
  document.getElementById("return-home-button").classList.add("hidden");
  cardStack.classList.add("hidden");
  document.getElementById("progressWrapper").classList.add("d-none");
  document.getElementById("spinner-container").style.display = "flex";
  setProgress(0);

  for (let i = 0; i < totalCats; i++) {
    const url = `https://cataas.com/cat?width=300&height=300&${Date.now()}-${i}`;
    await loadImage(url); // ✅ wait until image is fully loaded
    const card = document.createElement("div");
    card.className = "card";
    card.style.backgroundImage = `url(${url})`;
    cardStack.appendChild(card);
    addSwipe(card, url);
  }

  document.getElementById("spinner-container").style.display = "none";
  cardStack.classList.remove("hidden");
  document.getElementById("card-caption").classList.remove("hidden");
  document.getElementById("cat-content").style.display= 'flex';
  document.getElementById("progressWrapper").classList.remove("d-none");
}

function loadImage(url) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = resolve;
    img.onerror = reject;
    img.src = url;
  });
}

// Swiping card and other functionalities
function addSwipe(card, url) {
  let startX = 0;
  let currentX = 0;
  let isDragging = false;

  // --- Touch Events ---
  card.addEventListener("touchstart", e => {
    startX = e.touches[0].clientX;
    isDragging = true;
  });

  card.addEventListener("touchmove", e => {
    if (!isDragging) return;
    currentX = e.touches[0].clientX - startX;
    card.style.transform = `translateX(${currentX}px) rotate(${currentX / 10}deg)`;

    updateIndicators(currentX);
  });

  card.addEventListener("touchend", () => {
    handleSwipe(card, url, currentX);
    resetIndicators();
    isDragging = false;
    currentX = 0;
  });

  // --- Mouse Events ---
  card.addEventListener("mousedown", e => {
    startX = e.clientX;
    isDragging = true;
  });

  document.addEventListener("mousemove", e => {
    if (!isDragging) return;
    currentX = e.clientX - startX;
    card.style.transform = `translateX(${currentX}px) rotate(${currentX / 10}deg)`;

    updateIndicators(currentX);
  });

  document.addEventListener("mouseup", () => {
    if (!isDragging) return;
    handleSwipe(card, url, currentX);
    resetIndicators();
    isDragging = false;
    currentX = 0;
  });
}

function handleSwipe(card, url, currentX) {
  if (currentX > 100) {
    likedCats.push(url);
    card.style.transform = "translateX(100vw)";
    card.style.opacity = 0;
    removeCard(card);
  } else if (currentX < -100) {
    card.style.transform = "translateX(-100vw)";
    card.style.opacity = 0;
    removeCard(card);
  } else {
    card.style.transform = "";
  }
}

function removeCard(card) {
  setTimeout(() => {
    card.remove();
    currentIndex++;
    setProgress((currentIndex/totalCats)*100)
    if (currentIndex === totalCats) {
      showSummary();
    }
  }, 300);
}

function updateIndicators(currentX) {
  if (currentX > 0) {
    likeIndicator.style.opacity = Math.min(currentX / 100, 1);
    dislikeIndicator.style.opacity = 0;
  } else if (currentX < 0) {
    dislikeIndicator.style.opacity = Math.min(-currentX / 100, 1);
    likeIndicator.style.opacity = 0;
  } else {
    resetIndicators();
  }
}

function resetIndicators() {
  likeIndicator.style.opacity = 0;
  dislikeIndicator.style.opacity = 0;
}

function setProgress(value) {
  progressBar.style.width = value + "%";
  progressBar.setAttribute("aria-valuenow", value);
  progressBar.textContent = value + "%";
}

function showSummary() {
  document.getElementById("summary-container").style.display = "flex";
  document.getElementById("progressWrapper").classList.add("d-none");
  document.getElementById("spinner-container").classList.add("hidden");
  document.getElementById("card-caption").classList.add("hidden");
  document.getElementById("cat-content").style.display= 'none';
  cardStack.classList.add("hidden");
  summary.classList.remove("hidden");
  historyLikedCats = [...new Set([...historyLikedCats, ...likedCats])];
  createSummaryContent(likedCats);
  document.getElementById("restart-button").classList.remove("hidden");
  document.getElementById("return-home-button").classList.remove("hidden");
}

function createSummaryContent(catsArray) {
  summary.innerHTML = "";

  const header = document.createElement("h2");
  header.textContent = `You liked ${catsArray.length} cats 🐱`;
  header.classList.add("header-cat"); 
  summary.appendChild(header);

  const imgContainer = document.createElement("div");
  imgContainer.classList.add("flex"); 

  catsArray.forEach(catUrl => {
    const img = document.createElement("img");
    img.src = catUrl;
    img.classList.add("w-75", "h-75", "object-cover", "rounded-lg");
    imgContainer.appendChild(img);
  });

  summary.appendChild(imgContainer);
}


// Buttons functionality

function startButtonClicked() {
  loadCats();
}

function restartButtonClicked() {
  cardStack.innerHTML = "";
  cardStack.classList.remove("hidden");
  document.getElementById("summary-container").style.display = "none";
  likedCats= [];
  currentIndex=0;
  summary.classList.add("hidden");
  document.getElementById("restart-button").classList.add('hidden');
  document.getElementById("return-home-button").classList.add("hidden");
  loadCats();
}

function homeButtonClicked(){
  document.getElementById("return-home-button").classList.add("hidden");
  document.getElementById("summary-container").style.display = "none";
  document.getElementById("restart-button").classList.add('hidden');
  document.getElementById("home-buttons").style.display = "flex";
  cardStack.innerHTML = "";
  likedCats= [];
  currentIndex=0;
  summary.classList.add("hidden");
}

function homeButtonClickedFromAbout (){
  document.getElementById("return-home-button-2").classList.add("hidden");
  document.getElementById("home-buttons").style.display = "flex";
  document.getElementById("about-container").style.display = "none";
}

function aboutButtonClicked() {
  document.getElementById("about-container").style.display = "flex";
  document.getElementById("home-buttons").style.display = "none";
  document.getElementById("return-home-button-2").classList.remove("hidden");
}

function historyButtonClicked() {
  document.getElementById("home-buttons").style.display = "none";
  document.getElementById("summary-container").style.display = "flex";
  summary.classList.remove("hidden");
  createSummaryContent(historyLikedCats);
  document.getElementById("return-home-button").classList.remove("hidden");
}




