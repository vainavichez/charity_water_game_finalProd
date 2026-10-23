const gameContainer = document.getElementById("game-container");
const scoreDisplay = document.getElementById("score");
const timeDisplay = document.getElementById("time");
const livesDisplay = document.getElementById("lives");
const startButton = document.getElementById("start-btn");
const gameMessage = document.getElementById("game-message");
const gameResult = document.getElementById("game-result");

const gameLength = 30;
const winningScore = 20;
const startingLives = 3;
const goodDropMessages = [
  "Nice catch! Keep it up!",
  "Clean water saved!",
  "Great catch!"
];
const badDropMessages = [
  "Oops! That was a pollutant. You lost a life.",
  "Pollutants don't belong in clean water. You lost a life."
];
const missedDropMessages = [
  "A clean drop hit the ground. You lost a life.",
  "Don't let clean water go to waste! You lost a life."
];
const winningMessages = [
  "Amazing! You helped keep clean water flowing!",
  "You're a clean-water champion!",
  "Nice work! Every drop counts!"
];
const losingMessages = [
  "Good effort! Give it another try.",
  "Keep practicing—you can catch more drops next time!",
  "Every drop counts. Try again!"
];

let score = 0;
let timeLeft = gameLength;
let lives = startingLives;
let gameRunning = false;
let dropMaker;
let countdown;

startButton.addEventListener("click", startGame);

// Reset the round, then start spawning drops and counting down.
function startGame() {
  if (gameRunning) return;

  score = 0;
  timeLeft = gameLength;
  lives = startingLives;
  gameRunning = true;

  scoreDisplay.textContent = score;
  timeDisplay.textContent = timeLeft;
  updateLives();
  gameResult.textContent = "";
  gameMessage.textContent = "";
  gameContainer.classList.add("is-running");
  startButton.disabled = true;
  startButton.textContent = "Game in progress";

  createDrop();
  dropMaker = setInterval(createDrop, 1050);
  countdown = setInterval(updateTimer, 1000);
}

function createDrop() {
  if (!gameRunning) return;

  const drop = document.createElement("button");
  const size = Math.round(Math.random() * 24 + 44);
  const isPollutant = Math.random() < 0.25;
  const containerWidth = gameContainer.clientWidth;
  const containerHeight = gameContainer.clientHeight;

  drop.type = "button";
  drop.className = isPollutant ? "water-drop bad-drop" : "water-drop";
  drop.setAttribute(
    "aria-label",
    isPollutant ? "Pollutant drop. Click to lose a life." : "Clean water drop. Click to catch it."
  );
  drop.style.width = `${size}px`;
  drop.style.height = `${size}px`;
  drop.style.setProperty("--drop-size", `${size}px`);
  drop.style.left = `${Math.random() * Math.max(0, containerWidth - size)}px`;
  drop.style.setProperty("--fall-distance", `${containerHeight + size}px`);
  drop.style.animationDuration = `${Math.max(2.5, containerHeight / 150)}s`;

  // The drop's click and animation events both settle it only once.
  drop.addEventListener("click", () => {
    if (!gameRunning) return;

    if (isPollutant) {
      loseLife(pickRandom(badDropMessages));
    } else {
      score += 1;
      scoreDisplay.textContent = score;
      announce(pickRandom(goodDropMessages));
    }

    drop.remove();
  });

  drop.addEventListener("animationend", () => {
    if (!gameRunning || !drop.isConnected) return;

    if (!isPollutant) {
      loseLife(pickRandom(missedDropMessages));
    }

    drop.remove();
  });

  gameContainer.appendChild(drop);
}

function updateTimer() {
  timeLeft -= 1;
  timeDisplay.textContent = timeLeft;

  if (timeLeft <= 0) {
    endGame();
  }
}

function loseLife(message) {
  lives -= 1;
  updateLives();
  announce(message);

  if (lives <= 0) {
    endGame();
  }
}

function updateLives() {
  livesDisplay.textContent = `${"♥ ".repeat(lives)}${"♡ ".repeat(startingLives - lives)}`.trim();
  livesDisplay.setAttribute("aria-label", `${lives} ${lives === 1 ? "life" : "lives"} remaining`);
}

function endGame() {
  if (!gameRunning) return;

  gameRunning = false;
  clearInterval(dropMaker);
  clearInterval(countdown);
  gameContainer.querySelectorAll(".water-drop").forEach((drop) => drop.remove());
  gameContainer.classList.remove("is-running");
  gameMessage.textContent = "Round over!";

  const won = score >= winningScore;
  const messages = won ? winningMessages : losingMessages;
  const outcome = won ? "You win!" : "Try again!";
  gameResult.textContent = `${outcome} ${pickRandom(messages)} Final score: ${score}.`;
  startButton.disabled = false;
  startButton.textContent = "Play Again";
}

function announce(message) {
  gameResult.textContent = message;
}

function pickRandom(messages) {
  return messages[Math.floor(Math.random() * messages.length)];
}
