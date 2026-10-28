const gameContainer = document.getElementById("game-container");
const scoreDisplay = document.getElementById("score");
const timeDisplay = document.getElementById("time");
const livesDisplay = document.getElementById("lives");
const difficultySelect = document.getElementById("difficulty");
const scoreTargetDisplay = document.getElementById("score-target");
const startButton = document.getElementById("start-btn");
const resetButton = document.getElementById("reset-btn");
const gameMessage = document.getElementById("game-message");
const gameResult = document.getElementById("game-result");

const gameLength = 30;
const startingLives = 3;
const difficulties = {
  easy: { winningScore: 10, dropSpeed: 0.75 },
  normal: { winningScore: 20, dropSpeed: 1 },
  hard: { winningScore: 30, dropSpeed: 1.3 }
};
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
const confettiColors = ["#ffc907", "#2e9df7", "#7a4eab", "#f16061", "#8bd1cb"];

let score = 0;
let timeLeft = gameLength;
let lives = startingLives;
let gameRunning = false;
let activeDifficulty = difficultySelect.value;
let dropMaker;
let countdown;

startButton.addEventListener("click", startGame);
resetButton.addEventListener("click", resetGame);
difficultySelect.addEventListener("change", updateInstructions);

updateInstructions();

// Reset the round, then start spawning drops and counting down.
function startGame() {
  if (gameRunning) return;

  clearConfetti();
  activeDifficulty = difficultySelect.value;
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
  resetButton.hidden = false;
  difficultySelect.disabled = true;

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
  const fallDuration = Math.max(2.5, containerHeight / 150);
  drop.style.animationDuration = `${fallDuration / difficulties[activeDifficulty].dropSpeed}s`;

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
  resetButton.hidden = true;
  gameContainer.querySelectorAll(".water-drop").forEach((drop) => drop.remove());
  gameContainer.classList.remove("is-running");
  gameMessage.textContent = "Round over!";

  const won = score >= difficulties[activeDifficulty].winningScore;
  const messages = won ? winningMessages : losingMessages;
  const outcome = won ? "You win!" : "Try again!";
  gameResult.textContent = `${outcome} ${pickRandom(messages)} Final score: ${score}.`;
  startButton.disabled = false;
  startButton.textContent = "Play Again";
  difficultySelect.disabled = false;

  if (won) {
    celebrateWin();
  }
}

function resetGame() {
  if (!gameRunning) return;

  gameRunning = false;
  clearInterval(dropMaker);
  clearInterval(countdown);
  clearConfetti();
  gameContainer.querySelectorAll(".water-drop").forEach((drop) => drop.remove());
  gameContainer.classList.remove("is-running");
  score = 0;
  timeLeft = gameLength;
  lives = startingLives;

  scoreDisplay.textContent = score;
  timeDisplay.textContent = timeLeft;
  updateLives();
  gameResult.textContent = "";
  gameMessage.textContent = "Press “Start Game” when you're ready!";
  startButton.disabled = false;
  startButton.textContent = "Start Game";
  resetButton.hidden = true;
  difficultySelect.disabled = false;
}

function celebrateWin() {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  const confettiLayer = document.createElement("div");
  const pieceCount = 60;
  let finishedPieces = 0;

  confettiLayer.className = "confetti-layer";
  confettiLayer.setAttribute("aria-hidden", "true");

  for (let index = 0; index < pieceCount; index += 1) {
    const piece = document.createElement("span");
    piece.className = "confetti-piece";
    piece.style.left = `${Math.random() * 100}%`;
    piece.style.setProperty("--confetti-color", pickRandom(confettiColors));
    piece.style.setProperty("--confetti-duration", `${2.5 + Math.random() * 1.5}s`);
    piece.style.setProperty("--confetti-delay", `${Math.random() * 0.4}s`);
    piece.style.setProperty("--confetti-drift", `${Math.random() * 160 - 80}px`);
    piece.style.setProperty("--confetti-spin", `${Math.random() * 1080 - 540}deg`);
    piece.addEventListener("animationend", () => {
      finishedPieces += 1;
      if (finishedPieces === pieceCount) {
        confettiLayer.remove();
      }
    });
    confettiLayer.appendChild(piece);
  }

  document.body.appendChild(confettiLayer);
}

function clearConfetti() {
  document.querySelector(".confetti-layer")?.remove();
}

function announce(message) {
  gameResult.textContent = message;
}

function updateInstructions() {
  const { winningScore } = difficulties[difficultySelect.value];
  scoreTargetDisplay.textContent = `${winningScore} points`;
}

function pickRandom(messages) {
  return messages[Math.floor(Math.random() * messages.length)];
}
