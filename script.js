const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const scoreEl = document.getElementById("score");
const highScoreEl = document.getElementById("highScore");
const statusEl = document.getElementById("status");
const restartBtn = document.getElementById("restart");

const grid = 20;
const tile = canvas.width / grid;

// Lower interval = faster snake.
// The game starts slowly and gets faster as the snake grows.
const START_SPEED = 220;
const MIN_SPEED = 75;
const SPEED_INCREASE_PER_SCORE = 6;

let snake, food, direction, nextDirection, score, gameOver, timer;
let highScore = Number(localStorage.getItem("snakeHighScore") || 0);
highScoreEl.textContent = highScore;

function getSpeed() {
  // Speed increases with both score and snake size.
  const speed = START_SPEED - (score * SPEED_INCREASE_PER_SCORE);
  return Math.max(MIN_SPEED, speed);
}

function restartTimer() {
  clearInterval(timer);
  timer = setInterval(update, getSpeed());
}

function randomFood() {
  let position;
  do {
    position = {
      x: Math.floor(Math.random() * grid),
      y: Math.floor(Math.random() * grid)
    };
  } while (snake.some(part => part.x === position.x && part.y === position.y));

  return position;
}

function startGame() {
  clearInterval(timer);

  snake = [
    { x: 10, y: 10 },
    { x: 9, y: 10 },
    { x: 8, y: 10 }
  ];

  direction = { x: 1, y: 0 };
  nextDirection = { x: 1, y: 0 };
  score = 0;
  gameOver = false;

  scoreEl.textContent = score;
  statusEl.textContent = "Use Arrow Keys or WASD to move";

  food = randomFood();
  draw();

  // Start slowly.
  restartTimer();
}

function update() {
  direction = nextDirection;

  const head = {
    x: snake[0].x + direction.x,
    y: snake[0].y + direction.y
  };

  const hitsWall =
    head.x < 0 ||
    head.x >= grid ||
    head.y < 0 ||
    head.y >= grid;

  const hitsSelf = snake.some(
    part => part.x === head.x && part.y === head.y
  );

  if (hitsWall || hitsSelf) {
    endGame();
    return;
  }

  snake.unshift(head);

  if (head.x === food.x && head.y === food.y) {
    score++;
    scoreEl.textContent = score;

    if (score > highScore) {
      highScore = score;
      highScoreEl.textContent = highScore;
      localStorage.setItem("snakeHighScore", highScore);
    }

    food = randomFood();

    // Restart the timer with the new speed.
    restartTimer();
  } else {
    snake.pop();
  }

  draw();
}

function draw() {
  ctx.fillStyle = "#0b1220";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.strokeStyle = "rgba(255,255,255,.035)";

  for (let i = 0; i <= grid; i++) {
    ctx.beginPath();
    ctx.moveTo(i * tile, 0);
    ctx.lineTo(i * tile, canvas.height);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(0, i * tile);
    ctx.lineTo(canvas.width, i * tile);
    ctx.stroke();
  }

  ctx.fillStyle = "#ef4444";
  ctx.beginPath();
  ctx.arc(
    food.x * tile + tile / 2,
    food.y * tile + tile / 2,
    tile * 0.36,
    0,
    Math.PI * 2
  );
  ctx.fill();

  snake.forEach((part, index) => {
    ctx.fillStyle = index === 0 ? "#86efac" : "#22c55e";
    ctx.fillRect(
      part.x * tile + 1,
      part.y * tile + 1,
      tile - 2,
      tile - 2
    );
  });
}

function endGame() {
  gameOver = true;
  clearInterval(timer);
  statusEl.textContent =
    "Game Over! Press Restart or Space to play again.";
}

function changeDirection(x, y) {
  if (gameOver) return;

  if (x === -direction.x && y === -direction.y) {
    return;
  }

  nextDirection = { x, y };
}

document.addEventListener("keydown", event => {
  const key = event.key.toLowerCase();

  const controls = {
    arrowup: [0, -1],
    w: [0, -1],
    arrowdown: [0, 1],
    s: [0, 1],
    arrowleft: [-1, 0],
    a: [-1, 0],
    arrowright: [1, 0],
    d: [1, 0]
  };

  if (controls[key]) {
    event.preventDefault();
    changeDirection(...controls[key]);
  }

  if (key === " " && gameOver) {
    startGame();
  }
});

restartBtn.addEventListener("click", startGame);

startGame();
