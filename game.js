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

// ---- board rendering ----
const boardEl = document.getElementById("board");
const cells = {}; // square number -> cell element

function buildBoard() {
  boardEl.innerHTML = "";

  // label the ladder/snake squares the same way GameConsoleUI.printBoard does
  const labels = {};
  let i = 1;
  for (const bottom in ladders) {
    const top = ladders[bottom];
    labels[bottom] = { text: "L" + i, cls: "ladder-bottom" };
    labels[top] = { text: "H" + i, cls: "ladder-top" };
    i++;
  }
  let j = 1;
  for (const head in snakes) {
    const tail = snakes[head];
    labels[head] = { text: "S" + j, cls: "snake-head" };
    labels[tail] = { text: "T" + j, cls: "snake-tail" };
    j++;
  }

  for (let row = 0; row < 10; row++) {
    for (let col = 0; col < 10; col++) {
      const square = (9 - row) * 10 + col + 1;
      const cell = document.createElement("div");
      cell.className = "cell";

      const num = document.createElement("span");
      num.className = "num";
      num.textContent = square;
      cell.appendChild(num);

      if (labels[square]) {
        cell.classList.add(labels[square].cls);
        const label = document.createElement("span");
        label.className = "label";
        label.textContent = labels[square].text;
        cell.appendChild(label);
      }

      boardEl.appendChild(cell);
      cells[square] = cell;
    }
  }
}

function renderPlayers() {
  document.querySelectorAll(".token").forEach((t) => t.remove());

  if (p1Position >= 1) {
    const t = document.createElement("div");
    t.className = "token p1";
    cells[p1Position].appendChild(t);
  }
  if (p2Position >= 1) {
    const t = document.createElement("div");
    t.className = "token p2";
    cells[p2Position].appendChild(t);
  }
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

  buildBoard();
  renderPlayers();
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
  renderPlayers();

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
