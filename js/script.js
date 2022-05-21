"use strict";

// ===== SETUP =====
const board_border = "black";
const board_background = "white";
const snake_col = "lightgreen";
const snake_border = "darkgreen";

let snake = [
  { x: 200, y: 200 },
  { x: 190, y: 200 },
  { x: 180, y: 200 },
  { x: 170, y: 200 },
  { x: 160, y: 200 },
];

let score = 0;
let topScore = 0;

let changing_direction = false;
let game_ended = false;

// Food location (coordinates)
let food_x;
let food_y;

// Horizontal and vertical velocity
let dx = 10;
let dy = 0;

// Tick Speed (Only applies when the game difficulty is Fast or Progressive)
let tickSpeed = 100;
// Difficulty (0 is Normal, 1 is Hard, and 2 is Progressive)
let difficulty = "Normal";

const snakeboard = document.getElementById("gameCanvas");
const snakeboard_ctx = gameCanvas.getContext("2d");

// Buttons
const reset_button = document.getElementById("reset-button");
const difficulty_button = document.getElementById("difficulty-button");
const background_button = document.getElementById("background-button");
const help_button = document.getElementById("help-button");

// ===== MAIN =====
// Starts the game
main();
gen_food();

const resetGame = function () {
  if (game_ended) {
    snake = [
      { x: 200, y: 200 },
      { x: 190, y: 200 },
      { x: 180, y: 200 },
      { x: 170, y: 200 },
      { x: 160, y: 200 },
    ];
    game_ended = false;
    main();
    gen_food();
    score = 0;

    dx = 10;
    dy = 0;

    document.getElementById("score").innerHTML = "Score: " + score;
    document.getElementById("game-over-message").classList.add("hidden");
  }
};

const adjustDifficulty = function () {
  if (difficulty === "Normal") {
    tickSpeed = 50;
    difficulty_button.innerHTML = "Game Mode: Fast";
    difficulty = "Fast";
  } else if (difficulty === "Fast") {
    tickSpeed = 100;
    difficulty_button.innerHTML = "Game Mode: Progressive";
    difficulty = "Progressive";
  } else if (difficulty === "Progressive") {
    tickSpeed = 100;
    difficulty_button.innerHTML = "Game Mode: Normal";
    difficulty = "Normal";
  }
};

difficulty_button.addEventListener("click", adjustDifficulty);

reset_button.addEventListener("click", resetGame); // Resets the game if the snake "dies"
document.addEventListener("keydown", function (e) {
  // Same with the event listener above
  if (e.key === "Enter") {
    resetGame();
  }
});

document.addEventListener("keydown", change_direction); // Detects the keys being pressed

function main() {
  if (has_game_ended()) {
    if (score > topScore) topScore = score;
    if (difficulty === "Progressive") {
      tickSpeed = 100;
    }
    game_ended = true;
    document.getElementById("top-score").innerHTML = "Top Score: " + topScore;
    document.getElementById("game-over-message").classList.remove("hidden");
    return;
  }

  changing_direction = false;

  setTimeout(function onTick() {
    clearCanvas();
    drawFood();
    move_snake();
    drawSnake();
    // repeat
    main();
  }, tickSpeed);
}

// ===== DISPLAY =====
function clearCanvas() {
  snakeboard_ctx.fillStyle = board_background;
  snakeboard_ctx.strokestyle = board_background;
  snakeboard_ctx.fillRect(0, 0, snakeboard.width, snakeboard.height);
  snakeboard_ctx.strokeRect(0, 0, snakeboard.width, snakeboard.height);
}

function drawSnake() {
  snake.forEach(drawSnakePart);
}

function drawSnakePart(snakePart) {
  snakeboard_ctx.fillStyle = "lightgreen";
  snakeboard_ctx.strokestyle = "darkgreen";
  snakeboard_ctx.fillRect(snakePart.x, snakePart.y, 10, 10);
  snakeboard_ctx.strokeRect(snakePart.x, snakePart.y, 10, 10);
}

// ===== FOOD & GROWTH =====
function drawFood() {
  snakeboard_ctx.fillStyle = "red";
  snakeboard_ctx.strokestyle = "darkred";
  snakeboard_ctx.fillRect(food_x, food_y, 10, 10);
  snakeboard_ctx.strokeRect(food_x, food_y, 10, 10);
}

function random_food(min, max) {
  return Math.round((Math.random() * (max - min) + min) / 10) * 10;
}

function gen_food() {
  food_x = random_food(0, snakeboard.width - 10);
  food_y = random_food(0, snakeboard.height - 10);
  snake.forEach(function has_snake_eaten_food(part) {
    const has_eaten = part.x == food_x && part.y == food_y;
    if (has_eaten) gen_food();
  });
}

// ===== FUNCTIONALITY & CONTROLS =====
function has_game_ended() {
  for (let i = 4; i < snake.length; i++) {
    const has_collided = snake[i].x === snake[0].x && snake[i].y === snake[0].y;
    if (has_collided) return true;
  }
  const hitLeftWall = snake[0].x < 0;
  const hitRightWall = snake[0].x > snakeboard.width - 10;
  const hitToptWall = snake[0].y < 0;
  const hitBottomWall = snake[0].y > snakeboard.height - 10;

  return hitLeftWall || hitRightWall || hitToptWall || hitBottomWall;
}

function change_direction(event) {
  const LEFT_KEY = 37;
  const UP_KEY = 38;
  const RIGHT_KEY = 39;
  const DOWN_KEY = 40;

  // Prevent the snake from reversing
  if (changing_direction) return;
  changing_direction = true;
  const pressedKey = event.keyCode;
  const movingUp = dy === -10;
  const movingDown = dy === 10;
  const movingRight = dx === 10;
  const movingLeft = dx === -10;

  if (pressedKey === LEFT_KEY && !movingRight) {
    dx = -10;
    dy = 0;
  }

  if (pressedKey === UP_KEY && !movingDown) {
    dx = 0;
    dy = -10;
  }

  if (pressedKey === RIGHT_KEY && !movingLeft) {
    dx = 10;
    dy = 0;
  }

  if (pressedKey === DOWN_KEY && !movingUp) {
    dx = 0;
    dy = 10;
  }
}

function move_snake() {
  // Create the new snake's head
  const head = { x: snake[0].x + dx, y: snake[0].y + dy };
  // Add the new head to the beginning of snake body
  snake.unshift(head);
  const has_eaten_food = snake[0].x === food_x && snake[0].y === food_y;
  if (has_eaten_food) {
    if (difficulty === "Progressive") {
      tickSpeed = tickSpeed * 0.95;
    }
    // Increase Score
    score += 1;
    document.getElementById("score").innerHTML = "Score: " + score;
    // Generate new food location
    gen_food();
  } else {
    // Remove the last part of the snake's body
    snake.pop();
  }
}
