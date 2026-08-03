// ---- game state, ported from GameLogic.java ----
const ladders = { 3: 24, 27: 58, 23: 82, 20: 60, 54: 86 };
const snakes = { 97: 79, 76: 35, 91: 61, 73: 15, 42: 17 };

let p1Position = 0;
let p2Position = 0;
let currentPlayer = 1;
let computerGame = false;
let gameOver = false;

function roll() {
  return Math.floor(Math.random() * 6) + 1;
}

function checkSnakesLadders(position) {
  if (ladders[position] !== undefined) return ladders[position];
  if (snakes[position] !== undefined) return snakes[position];
  return position;
}

function movePlayer(r) {
  if (currentPlayer === 1) {
    let pos = p1Position + r;
    pos = checkSnakesLadders(pos);
    if (pos > 100) pos = pos - r;
    p1Position = pos;
  } else {
    let pos = p2Position + r;
    pos = checkSnakesLadders(pos);
    if (pos > 100) pos = pos - r;
    p2Position = pos;
  }
}

function getPlayerLocation(player) {
  return player === 1 ? p1Position : p2Position;
}

function win() {
  return p1Position === 100 || p2Position === 100;
}

function switchPlayer() {
  currentPlayer = currentPlayer === 1 ? 2 : 1;
}

// ---- board rendering, ported straight from GameConsoleUI.printBoard ----
const boardEl = document.getElementById("board");

function renderBoard() {
  // label the ladder/snake squares the same way GameConsoleUI.printBoard does
  const labels = {};
  let i = 1;
  for (const bottom in ladders) {
    const top = ladders[bottom];
    labels[bottom] = "L" + i;
    labels[top] = "H" + i;
    i++;
  }
  let j = 1;
  for (const head in snakes) {
    const tail = snakes[head];
    labels[head] = "S" + j;
    labels[tail] = "T" + j;
    j++;
  }

  let out = "";
  for (let row = 0; row < 10; row++) {
    let line = "";
    for (let col = 0; col < 10; col++) {
      const square = (9 - row) * 10 + col + 1;
      let text;
      if (square === p1Position && square === p2Position) {
        text = "p1p2";
      } else if (square === p1Position) {
        text = "p1";
      } else if (square === p2Position) {
        text = "p2";
      } else if (labels[square]) {
        text = labels[square];
      } else {
        text = String(square);
      }
      line += "|" + text.padStart(4); // keep everything lined up, same as String.format("%4s", text)
    }
    out += line + "|\n";
  }
  boardEl.textContent = out;
}

// ---- screens ----
const modeScreen = document.getElementById("modeScreen");
const gameScreen = document.getElementById("gameScreen");
const statusEl = document.getElementById("status");
const rollBtn = document.getElementById("rollBtn");
const restartBtn = document.getElementById("restartBtn");

document.getElementById("pvpBtn").addEventListener("click", () => startGame(false));
document.getElementById("pvbBtn").addEventListener("click", () => startGame(true));
restartBtn.addEventListener("click", () => {
  gameScreen.classList.add("hidden");
  modeScreen.classList.remove("hidden");
});

function startGame(vsBot) {
  computerGame = vsBot;
  p1Position = 0;
  p2Position = 0;
  currentPlayer = 1;
  gameOver = false;

  modeScreen.classList.add("hidden");
  gameScreen.classList.remove("hidden");
  restartBtn.classList.add("hidden");
  rollBtn.disabled = false;

  renderBoard();
  updateStatus();
}

function updateStatus() {
  if (computerGame && currentPlayer === 2) {
    statusEl.textContent = "computer's turn...";
  } else {
    statusEl.textContent = `player ${currentPlayer}'s turn — press roll`;
  }
}

rollBtn.addEventListener("click", takeTurn);

function takeTurn() {
  if (gameOver) return;
  rollBtn.disabled = true;

  const r = roll();
  movePlayer(r);
  renderBoard();

  const player = currentPlayer;
  statusEl.textContent = `player ${player} rolled a ${r} — now on square ${getPlayerLocation(player)}`;

  if (win()) {
    gameOver = true;
    statusEl.textContent = `player ${currentPlayer} wins!! (rolled a ${r}, landed on ${getPlayerLocation(currentPlayer)})`;
    restartBtn.classList.remove("hidden");
    return;
  }

  switchPlayer();

  // let the bot take its turn automatically after a short pause so its move is readable
  if (computerGame && currentPlayer === 2) {
    updateStatus();
    setTimeout(takeTurn, 900);
  } else {
    updateStatus();
    rollBtn.disabled = false;
  }
}
