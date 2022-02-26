// libraries
require('dotenv').config();

const path = require('path');
const http = require('http');
const express = require('express');
const expressSession = require('express-session');
const pgSession = require('connect-pg-simple')(expressSession);
const { Server } = require('socket.io');
const { v4: uuidv4 } = require('uuid');

// config
const pool = require('./config/pg');

// routes
const authenticationRoutes = require('./routes/authentication-routes');
const userRoutes = require('./routes/user-routes');

// constants
const PORT = process.env.PORT || 8000;

// server
const app = express();
const server = http.createServer(app);
const io = new Server(server);

// app - client
app.use(express.static(path.join(__dirname, 'public')));

// app - middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// app - session
app.use(expressSession({
  store: new pgSession({ pool, createTableIfMissing: true }),
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 14 * 24 * 60 * 60 * 1000 },
}));

// app - routes
app.use('/authentication', authenticationRoutes);
app.use('/user', userRoutes);

// app - server
server.listen(PORT, () => console.log(`[SERVER] http://localhost:${PORT}`));

/* GAME STARTS HERE */

io.on('connection', (client) => {
  console.log('[CONNECTED]'); // why does this run twice?

  client.on('keydown', (code) => {
    const roomName = clientRooms[client.id];

    if (!roomName) {
      return;
    }

    const vel = getUpdatedVelocity(code);

    // update specific player movement
    if (vel) {
      gameState[roomName].players[client.number - 1].pos.x += vel.x;
      gameState[roomName].players[client.number - 1].pos.y += vel.y;
    }
  });

  client.on('newGame', () => {
    console.log('[NEW GAME]')
    let roomName = uuidv4();
    clientRooms[client.id] = roomName;
    client.emit('gameCode', roomName);
    
    gameState[roomName] = initGame();

    client.join(roomName);
    client.number = 1; // player one
    client.emit('init', 1);
  });

  client.on('joinGame', async (gameCode) => {
    console.log('[JOIN GAME]')
    const room = io.sockets.adapter.rooms.get(gameCode);
    const roomValue = room.values().next().value;
  
    let numClients;
    if (roomValue) {
      const roomSize = room.size;
      numClients = roomSize;
    }

    if (numClients === 0) { // no players
      client.emit('unknownGame');
      return;
    } else if (numClients > 1) { // 2 players (max for this game) reached
      client.emit('tooManyPlayers');
      return;
    }

    // exactly 1 player is waiting in the room
    clientRooms[client.id] = gameCode;

    client.join(gameCode);
    client.number = 2; // player 2
    client.emit('init', 2);
    
    // start game once max players have joined
    startGameInterval(gameCode);
  });
});

/* GAME STARTS HERE */

// global
const gameState = {};
const clientRooms = {};

// game constants
const FRAME_RATE = 60;
const GRID_SIZE = 20;

// game mechanics
function createGameState() {
  return {
    players: [
      {
        pos: {
          x: -1,
          y: -1,
        },
        vel: {
          x: 0,
          y: 0,
        },
        size: {
          w: 1,
          h: 1,
        }
      },
      {
        pos: {
          x: 1,
          y: 1,
        },
        vel: {
          x: 0,
          y: 0,
        },
        size: {
          w: 1,
          h: 1,
        }
      },
    ],
    food: {},
    // gridSize: GRID_SIZE, // number of squares in the game grid
  };
}

function randomFood(gameState) {
  const food = {
    // x: Math.floor(Math.random() * GRID_SIZE),
    // y: Math.floor(Math.random() * GRID_SIZE),
    x: Math.floor(Math.random() * 5),
    y: Math.floor(Math.random() * 5),
  };

  const playerOne = gameState.players[0];
  const playerTwo = gameState.players[1];

  // check for player and food collision
  if (playerOne.pos.x === food.x && playerOne.pos.y === food.y) {
    return randomFood(gameState);
  }

  if (playerTwo.pos.x === food.x && playerTwo.pos.y === food.y) {
    return randomFood(gameState);
  }

  gameState.food = food;
}

function getUpdatedVelocity(code) {
  switch (code) {
    case 'ArrowUp': {
      return { x: 0, y: 1 };
    }
    case 'ArrowDown': {
      return { x: 0, y: -1 };
    }
    case 'ArrowLeft': {
      return { x: -1, y: 0 };
    }
    case 'ArrowRight': {
      return { x: 1, y: 0 };
    }
    default:
      return { x: 0, y: 0 };
  }
}

function gameLoop(gameState) {
  if (!gameState) {
    return;
  }

  const playerOne = gameState.players[0];
  const playerTwo = gameState.players[1];

  // // check if out of bounds
  // if (playerOne.pos.x < 0 || playerOne.pos.x > GRID_SIZE || playerOne.pos.y < 0 || playerOne.pos.y > GRID_SIZE) {
  //   return 2; // player 2 wins, player 1 loses
  // }

  // // check if out of bounds
  // if (playerTwo.pos.x < 0 || playerTwo.pos.x > GRID_SIZE || playerTwo.pos.y < 0 || playerTwo.pos.y > GRID_SIZE) {
  //   return 1; // player 1 wins, player 2 loses
  // }

  // check for player and food collision
  if (gameState.food.x === playerOne.pos.x && gameState.food.y === playerOne.pos.y) {
    // player grows
    playerOne.size.w += 0.2;
    playerOne.size.h += 0.2;

    // display new food after eating previous food
    randomFood(gameState);
  }

  if (gameState.food.x === playerTwo.pos.x && gameState.food.y === playerTwo.pos.y) {
    // player grows
    playerTwo.size.w += 0.2;
    playerTwo.size.h += 0.2;

    // display new food after eating previous food
    randomFood(gameState);
  }

  console.log('[Player One Size]', playerOne.size);
  console.log('[Player Two Size]', playerTwo.size);

  // check which player wins
  if (playerOne.size.w >= 2) {
    console.log('Player 1 wins!')
    return 1; // player 1 wins
  }

  if (playerTwo.size.w >= 2) {
    console.log('Player 2 wins!')
    return 2; // player 1 wins, player 2 loses
  }

  return false; // no winner
}

function startGameInterval(roomName) {
  const intervalId = setInterval(() => {
    const winner = gameLoop(gameState[roomName]);

    if (!winner) {
      emitGameState(roomName, gameState[roomName]);
    } else {
      emitGameOver(roomName, winner);
      gameState[roomName] = null;
      clearInterval(intervalId);
    }
  }, 1000 / FRAME_RATE); // FPS
}

function emitGameState(roomName, gameState) {
  io.sockets.in(roomName).emit('gameState', JSON.stringify(gameState));
}

function emitGameOver(roomName, winner) {
  io.sockets.in(roomName).emit('gameOver', JSON.stringify({ winner }));
}

function initGame() {
  const _gameState = createGameState();
  randomFood(_gameState);
  return _gameState;
}