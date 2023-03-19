const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const scale = 10;
const canvasSize = 320;

class Snake {
  constructor(x, y, color) {
    this.color = color;
    this.body = [{ x: x, y: y }];
    this.vx = scale;
    this.vy = 0;
    this.grow = 0;
    this.score = 0;
    this.speed = 190;
  }

  

  update() {
    let head = { x: this.body[0].x + this.vx, y: this.body[0].y + this.vy };
  
    // Wrap around the canvas if the snake hits the border
    if (head.x < 0) {
      head.x = canvasSize - scale;
    } else if (head.x >= canvasSize) {
      head.x = 0;
    }
    if (head.y < 0) {
      head.y = canvasSize - scale;
    } else if (head.y >= canvasSize) {
      head.y = 0;
    }
  
    if (this.grow > 0) {
      this.grow--;
    } else {
      this.body.pop();
    }
    this.body.unshift(head);
  }

  draw() {
    ctx.fillStyle = this.color;
    for (let block of this.body) {
      ctx.fillRect(block.x, block.y, scale, scale);
      ctx.strokeStyle = "black";
      ctx.strokeRect(block.x, block.y, scale, scale);
    }
  }

  changeDirection(vx, vy) {
    this.vx = vx;
    this.vy = vy;
  }
}

class PowerUp {
    constructor() {
      this.x = (Math.floor(Math.random() * (canvasSize / scale)) * scale);
      this.y = (Math.floor(Math.random() * (canvasSize / scale)) * scale);
      this.active = false;
    }
  
    draw() {
      if (this.active) {
        ctx.fillStyle = "blue";
        ctx.fillRect(this.x, this.y, scale, scale);
      }
    }
  }

class Food {
  constructor() {
    this.x = (Math.floor(Math.random() * (canvasSize / scale)) * scale);
    this.y = (Math.floor(Math.random() * (canvasSize / scale)) * scale);
  }

  draw() {
    ctx.fillStyle = "yellow";
    ctx.fillRect(this.x, this.y, scale, scale);
  }
}

let snake1, snake2, food, gameOver, gameState, powerUp;

function initGame() {
    snake1 = new Snake(60, 20, "lime");
    snake2 = new Snake(260, 20, "red");
    food = new Food();
    powerUp = new PowerUp();
    gameOver = false;
    gameState = "title";
    
  }
function drawScore() {
    ctx.fillStyle = "white";
    ctx.font = "16px Arial";
    ctx.fillText("Player 1 Score: " + snake1.score, 10, 20);
    ctx.fillText("Player 2 Score: " + snake2.score, canvasSize - 150, 20);
  }

  function cpuAI() {
    if (snake2.body[0].x < food.x && snake2.vx === 0 && snake2.body[0].y === food.y) {
      snake2.changeDirection(scale, 0);
    } else if (snake2.body[0].x > food.x && snake2.vx === 0 && snake2.body[0].y === food.y) {
      snake2.changeDirection(-scale, 0);
    } else if (snake2.body[0].y < food.y && snake2.vy === 0 && snake2.body[0].x === food.x) {
      snake2.changeDirection(0, scale);
    } else if (snake2.body[0].y > food.y && snake2.vy === 0 && snake2.body[0].x === food.x) {
      snake2.changeDirection(0, -scale);
    }
  }
  let powerUpTimeout, effectTimeout;

function updateGame() {
  snake1.update();
  snake2.update();
  if (gameState === "vsCPU") {
    cpuAI();
  }

  if (snake1.body[0].x === food.x && snake1.body[0].y === food.y) {
    snake1.grow += 3;
    snake1.score += 10;
    snake1.speed *= 0.95;
    food = new Food();
  }
  if (snake2.body[0].x === food.x && snake2.body[0].y === food.y) {
    snake2.grow += 3;
    snake2.score += 10;
    snake2.speed *= 0.95;
    food = new Food();
  }

  if (snake1.score >= 250 || snake2.score >= 250) {
    gameOver = true;
    return;
  }

  for (let i = 1; i < snake1.body.length; i++) {
    if (snake1.body[0].x === snake1.body[i].x && snake1.body[0].y === snake1.body[i].y) {
      gameOver = true;
      return;
    }
  }
  for (let i = 1; i < snake2.body.length; i++) {
    if (snake2.body[0].x === snake2.body[i].x && snake2.body[0].y === snake2.body[i].y) {
      gameOver = true;
      return;
    }
  }
  
// Spawn power-up randomly
if (!powerUp.active && Math.random() < 0.005) {
    powerUp.active = true;
    powerUpTimeout = setTimeout(() => {
      powerUp.active = false;
    }, 9000);
  }

  // Check if any snake picks up the power-up
  if (powerUp.active && (snake1.body[0].x === powerUp.x && snake1.body[0].y === powerUp.y)) {
    powerUp.active = false;
    snake2.speed /= 0.75;
    clearTimeout(effectTimeout);
    effectTimeout = setTimeout(() => {
      snake2.speed *= 0.75;
    }, 0000);
  } else if (powerUp.active && (snake2.body[0].x === powerUp.x && snake2.body[0].y === powerUp.y)) {
    powerUp.active = false;
    snake1.speed /= 0.75;
    clearTimeout(effectTimeout);
    effectTimeout = setTimeout(() => {
      snake1.speed *= 0.75;
    }, 9000);
  }
  
}
function drawTitleScreen() {
    ctx.fillStyle = "white";
    ctx.font = "30px Arial";
    ctx.fillText("Snake Game", 95, 120);
    ctx.font = "20px Arial";
    ctx.fillText("1. Multiplayer", 110, 160);
    ctx.fillText("2. VS CPU", 110, 190);
    ctx.fillText("Press 1 or 2 to start", 80, 240);
  }
function drawGame() {
    ctx.clearRect(0, 0, canvasSize, canvasSize);
  
    if (gameState === "title") {
      drawTitleScreen();
    } else {
      snake1.draw();
      snake2.draw();
      food.draw();
      powerUp.draw();

      drawScore();

  
      if (gameOver) {
        drawWinner();
      }
    }
    
  }
  function isTouchInArea(touch, x, y, width, height) {
  return touch.x >= x && touch.x <= x + width && touch.y >= y && touch.y <= y + height;
}
  function getTouchDirection(touchStart, touchEnd) {
    const diffX = touchEnd.x - touchStart.x;
    const diffY = touchEnd.y - touchStart.y;
  
    if (Math.abs(diffX) > Math.abs(diffY)) {
      return diffX > 0 ? "right" : "left";
    } else {
      return diffY > 0 ? "down" : "up";
    }
  }
  let touchStart = { x: 0, y: 0 };
  function getRelativeTouchCoords(e) {
    const rect = canvas.getBoundingClientRect();
    return {
      x: e.changedTouches[0].clientX - rect.left,
      y: e.changedTouches[0].clientY - rect.top,
    };
  }
  canvas.addEventListener("touchstart", (e) => {
    e.preventDefault();
    const coords = getRelativeTouchCoords(e);
    touchStart.x = coords.x;
    touchStart.y = coords.y;
  });
  
  canvas.addEventListener("touchend", (e) => {
    e.preventDefault();
    const coords = getRelativeTouchCoords(e);
    const touchEnd = { x: coords.x, y: coords.y };
    if (gameState === "title") {
      if (isTouchInArea(touchEnd, 110, 140, 100, 30)) {
        gameState = "multiplayer";
        gameLoop();
      } else if (isTouchInArea(touchEnd, 110, 170, 100, 30)) {
        gameState = "vsCPU";
        gameLoop();
      }
    } else {
      const direction = getTouchDirection(touchStart, touchEnd);
      if (direction === "up" && snake1.vy === 0) snake1.changeDirection(0, -scale);
      if (direction === "down" && snake1.vy === 0) snake1.changeDirection(0, scale);
      if (direction === "left" && snake1.vx === 0) snake1.changeDirection(-scale, 0);
      if (direction === "right" && snake1.vx === 0) snake1.changeDirection(scale, 0);
    }
  });
function gameLoop() {
  if (!gameOver) {
    updateGame();
    drawGame();
    setTimeout(gameLoop, Math.max(snake1.speed, snake2.speed));
  }
}
function drawWinner() {
    ctx.fillStyle = "white";
    ctx.font = "30px Arial";
    ctx.fillText("Game Over", 100, 160);
  
    let winner;
    if (snake1.score > snake2.score) {
      winner = "Player 1";
    } else if (snake1.score < snake2.score) {
      winner = "Player 2";
    } else {
      winner = "No one"; // It's a tie
    }
    
    ctx.fillText(winner + " wins!", 110, 200);
    ctx.font = "20px Arial";
    ctx.fillText("Press ENTER to restart", 75, 240);
  }
  function getTouchDirection(touchStart, touchEnd) {
    const diffX = touchEnd.x - touchStart.x;
    const diffY = touchEnd.y - touchStart.y;
  
    if (Math.abs(diffX) > Math.abs(diffY)) {
      return diffX > 0 ? "right" : "left";
    } else {
      return diffY > 0 ? "down" : "up";
    }
  }

document.addEventListener("keydown", (e) => {
  if (e.key === "ArrowUp" && snake1.vy === 0) snake1.changeDirection(0, -scale);
  if (e.key === "ArrowDown" && snake1.vy === 0) snake1.changeDirection(0, scale);
  if (e.key === "ArrowLeft" && snake1.vx === 0) snake1.changeDirection(-scale, 0);
  if (e.key === "ArrowRight" && snake1.vx === 0) snake1.changeDirection(scale, 0);

  if (e.key === "w" && snake2.vy === 0) snake2.changeDirection(0, -scale);
  if (e.key === "s" && snake2.vy === 0) snake2.changeDirection(0, scale);
  if (e.key === "a" && snake2.vx === 0) snake2.changeDirection(-scale, 0);
  if (e.key === "d" && snake2.vx === 0) snake2.changeDirection(scale, 0);
  if (gameState === "title") {
    if (e.key === "1") {
      gameState = "multiplayer";
      gameLoop();
    } else if (e.key === "2") {
      gameState = "vsCPU";
      gameLoop();
    }
  }
  if (gameOver && e.key === "Enter") {
    initGame();
    gameLoop();
  }
});

initGame();
gameLoop();
