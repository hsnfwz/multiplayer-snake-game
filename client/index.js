const BG_COLOR = 'black';
const SNAKE_COLOR_1 = 'orange';
const SNAKE_COLOR_2 = 'blue';
const FOOD_COLOR = 'red';

let canvas, ctx;
let playerNumber;
let gameActive = false;

// use in  development
// const socket = io('http://localhost:8000');

// use in production
const socket = io('');

socket.on('init', (number) => {
  playerNumber = number;
});

socket.on('gameState', (gameState) => {
  if (!gameActive) {
    return;
  }

  gameState = JSON.parse(gameState);
  requestAnimationFrame(() => paintGame(gameState));
});

socket.on('gameOver', (data) => {
  if (!gameActive) {
    return;
  }

  const _data = JSON.parse(data);

  if (_data.winner === playerNumber) {
    alert('You Win!');
  } else {
    alert('You Lose.');
  }
  gameActive = false;
});

socket.on('gameCode', (gameCode) => {
  gameCodeDisplay.innerText = gameCode;
});

socket.on('unknownGame', (gameCode) => {
  reset();
  alert('Unknown game code');
});

socket.on('tooManyPlayers', (gameCode) => {
  reset();
  alert('Too many players. Game in progress');
});

function reset() {
  playerNumber = null;
  gameCodeInput.value = '';
  gameCodeDisplay.innerText = '';
  initialScreen.style.display = 'block';
  gameScreen.style.display = 'none';
}

const gameScreen = document.querySelector('#game-screen');
const initialScreen = document.querySelector('#initial-screen');
const newGameButton = document.querySelector('#new-game-button');
const joinGameButton = document.querySelector('#join-game-button');
const gameCodeInput = document.querySelector('#game-code-input');
const gameCodeDisplay = document.querySelector('#game-code-display');

newGameButton.addEventListener('click', (e) => {
  e.preventDefault();
  socket.emit('newGame');
  init();
});

joinGameButton.addEventListener('click', (e) => {
  e.preventDefault();
  const gameCode = gameCodeInput.value;
  socket.emit('joinGame', gameCode);
  init();
});

function init() {
  initialScreen.style.display = 'none';
  gameScreen.style.display = 'block';

  canvas = document.querySelector('#canvas');
  ctx = canvas.getContext('2d');

  canvas.width = 600; // in px
  canvas.height = 600; // in px

  ctx.fillStyle = BG_COLOR;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  document.addEventListener('keydown', (e) => {
    console.log(e.code);
    socket.emit('keydown', e.code);
  });
  gameActive = true;
}

function paintGame(gameState) {
  ctx.fillStyle = BG_COLOR;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const food = gameState.food;
  const gridSize = gameState.gridSize;
  const size = canvas.width / gridSize; // how many pixels represent 1 square in game space

  ctx.fillStyle = FOOD_COLOR;
  ctx.fillRect(food.x * size, food.y * size, size, size);

  paintPlayer(gameState.players[0], size, SNAKE_COLOR_1);
  paintPlayer(gameState.players[1], size, SNAKE_COLOR_2);
}

function paintPlayer(playerState, size, color) {
  const snake = playerState.snake;

  ctx.fillStyle = color;

  for (let snakeCell of snake) {
    ctx.fillRect(snakeCell.x * size, snakeCell.y * size, size, size);
  }
}