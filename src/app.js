import { GEM_META, LEVELS, areAdjacent, createGame } from "./gameLogic.js";
import { createAuthController, renderAuthBar, renderAuthGate } from "./auth.js";
import { ensureBackgroundMusic, playTone, updateBackgroundMusic } from "./audio.js";
import { calculateStars, mergeBestStars } from "./mastery.js";
import { createDefaultProgress, loadProgress, saveProgress } from "./storage.js";
import { renderGame, renderHome, renderLevels } from "./views.js";

const app = document.querySelector("#app");
const auth = createAuthController({ onChange: render });

let progress = loadProgress();
let screen = "home";
let currentGame = null;
let selectedCell = null;
let message = "";
let completionSaved = false;
let clearingCells = new Set();
let animationTimer = null;
let lastCombo = 0;
let dragCell = null;
let suppressClick = false;
let infoOpen = false;

app.addEventListener("click", (event) => {
  const authTarget = event.target.closest("[data-auth-action]");
  if (authTarget) {
    handleAuthAction(authTarget.dataset.authAction);
    return;
  }

  if (auth.state.status !== "signed-in") {
    return;
  }

  if (suppressClick) {
    suppressClick = false;
    return;
  }

  ensureBackgroundMusic(progress.sound);

  const actionTarget = event.target.closest("[data-action]");
  if (actionTarget) {
    handleAction(actionTarget.dataset.action, actionTarget.dataset);
    return;
  }

  const cellTarget = event.target.closest("[data-cell]");
  if (cellTarget) {
    handleCellClick(Number(cellTarget.dataset.row), Number(cellTarget.dataset.col));
  }
});

app.addEventListener("pointerdown", (event) => {
  if (auth.state.status !== "signed-in") {
    return;
  }

  const cellTarget = getCellTarget(event);
  if (!cellTarget || cellTarget.disabled || !currentGame || currentGame.status !== "playing") {
    return;
  }

  dragCell = {
    row: Number(cellTarget.dataset.row),
    col: Number(cellTarget.dataset.col)
  };
  cellTarget.classList.add("dragging");
});

app.addEventListener("pointerover", (event) => {
  if (auth.state.status !== "signed-in") {
    return;
  }

  if (!dragCell) {
    return;
  }

  app.querySelectorAll(".drop-target").forEach((item) => item.classList.remove("drop-target"));
  const cellTarget = getCellTarget(event);
  if (!cellTarget || cellTarget.disabled) {
    return;
  }

  const hoverCell = {
    row: Number(cellTarget.dataset.row),
    col: Number(cellTarget.dataset.col)
  };
  if (areAdjacent(dragCell, hoverCell)) {
    cellTarget.classList.add("drop-target");
  }
});

app.addEventListener("pointerup", (event) => {
  if (auth.state.status !== "signed-in") {
    return;
  }

  if (!dragCell) {
    return;
  }

  const from = dragCell;
  const cellTarget = getCellTarget(event);
  const to = cellTarget
    ? { row: Number(cellTarget.dataset.row), col: Number(cellTarget.dataset.col) }
    : null;

  clearDragClasses();
  dragCell = null;

  if (to && areAdjacent(from, to)) {
    suppressClick = true;
    performSwap(from, to);
  }
});

app.addEventListener("pointercancel", () => {
  dragCell = null;
  clearDragClasses();
});

render();
auth.init();

function handleAuthAction(action) {
  if (action === "sign-in") {
    auth.signIn();
  }

  if (action === "sign-up") {
    auth.signUp();
  }

  if (action === "sign-out") {
    auth.signOut();
  }
}

function handleAction(action, data) {
  if (action === "home") {
    showHome();
  }

  if (action === "levels") {
    showLevels();
  }

  if (action === "start-latest") {
    startLevel(progress.unlockedLevel);
  }

  if (action === "start-level") {
    startLevel(Number(data.level));
  }

  if (action === "retry") {
    startLevel(currentGame.level.id);
  }

  if (action === "next-level") {
    const nextLevel = Math.min(currentGame.level.id + 1, LEVELS.length);
    startLevel(nextLevel);
  }

  if (action === "toggle-sound") {
    progress.sound = !progress.sound;
    saveProgress(progress);
    updateBackgroundMusic(progress.sound);
    render();
  }

  if (action === "reset-progress") {
    progress = createDefaultProgress();
    saveProgress(progress);
    showLevels();
  }

  if (action === "open-info") {
    infoOpen = true;
    render();
  }

  if (action === "close-info") {
    infoOpen = false;
    render();
  }
}

function showHome() {
  screen = "home";
  clearActiveGame();
  render();
}

function showLevels() {
  screen = "levels";
  clearActiveGame();
  render();
}

function clearActiveGame() {
  currentGame = null;
  selectedCell = null;
  clearingCells = new Set();
  lastCombo = 0;
}

function startLevel(levelId) {
  const level = LEVELS.find((item) => item.id === levelId) ?? LEVELS[0];
  if (level.id > progress.unlockedLevel) {
    return;
  }

  currentGame = createGame(level);
  screen = "game";
  selectedCell = null;
  clearingCells = new Set();
  completionSaved = false;
  lastCombo = 0;
  message = "Selecciona una gema y luego una adyacente.";
  render();
}

function handleCellClick(row, col) {
  if (!currentGame || currentGame.status !== "playing") {
    return;
  }

  const cell = currentGame.board[row][col];
  if (cell.blocker) {
    selectedCell = null;
    message = "Ese obstaculo se rompe con combinaciones cercanas.";
    playTone(progress.sound, 120, 0.08);
    render();
    return;
  }

  const nextSelection = { row, col };
  if (!selectedCell) {
    selectedCell = nextSelection;
    message = `Gema ${GEM_META[cell.gem].name} seleccionada.`;
    render();
    return;
  }

  if (selectedCell.row === row && selectedCell.col === col) {
    selectedCell = null;
    message = "Seleccion cancelada.";
    render();
    return;
  }

  if (!areAdjacent(selectedCell, nextSelection)) {
    selectedCell = nextSelection;
    message = "Elige una gema vecina para intercambiar.";
    playTone(progress.sound, 160, 0.06);
    render();
    return;
  }

  performSwap(selectedCell, nextSelection);
}

function performSwap(from, to) {
  if (!currentGame || currentGame.status !== "playing") {
    return;
  }

  const result = currentGame.swap(from, to);
  selectedCell = null;
  applyMoveResult(result);
  render();
}

function applyMoveResult(result) {
  if (result.accepted) {
    clearingCells = new Set((result.clearedCells ?? []).map(positionKey));
    lastCombo = result.cascades > 1 ? result.cascades : 0;
    message = buildMoveMessage(result);
    playTone(progress.sound, result.cascades > 2 ? 680 : result.cascades > 1 ? 560 : 420, 0.09);
    finishIfNeeded();
    scheduleClearAnimation();
    return;
  }

  clearingCells = new Set();
  lastCombo = 0;
  message = moveErrorMessage(result.reason);
  playTone(progress.sound, 140, 0.1);
  finishIfNeeded();
}

function finishIfNeeded() {
  if (currentGame.status !== "playing") {
    completeLevel();
  }
}

function buildMoveMessage(result) {
  const cascadeText = result.cascades > 1 ? `, Combo x${result.cascades}` : "";
  const blockerText =
    result.blockersCleared > 0 ? `, ${result.blockersCleared} obstaculo(s)` : "";
  return `+${result.points} puntos${cascadeText}${blockerText}.`;
}

function moveErrorMessage(reason) {
  const messages = {
    "no-match": "Ese intercambio no forma una combinacion. Se descuenta 1 movimiento.",
    blocked: "No puedes mover un obstaculo.",
    "not-adjacent": "Solo puedes intercambiar gemas adyacentes.",
    "outside-board": "Seleccion fuera del tablero.",
    finished: "La partida ya termino."
  };
  return messages[reason] ?? "Movimiento no valido.";
}

function scheduleClearAnimation() {
  if (animationTimer) {
    clearTimeout(animationTimer);
  }

  animationTimer = setTimeout(() => {
    clearingCells = new Set();
    animationTimer = null;
    if (screen === "game") {
      render();
    }
  }, 520);
}

function completeLevel() {
  if (completionSaved) {
    return;
  }

  completionSaved = true;
  const levelId = currentGame.level.id;
  const previousBest = progress.bestScores[levelId] ?? 0;
  currentGame.previousBestScore = previousBest;
  currentGame.isNewRecord = currentGame.score > previousBest;
  progress.bestScores[levelId] = Math.max(previousBest, currentGame.score);

  if (currentGame.status === "won") {
    const earnedStars = calculateStars({
      level: currentGame.level,
      score: currentGame.score,
      movesLeft: currentGame.movesLeft,
      won: true
    });

    currentGame.earnedStars = earnedStars;
    progress.starsByLevel[levelId] = mergeBestStars(progress.starsByLevel[levelId], earnedStars);
    progress.unlockedLevel = Math.max(progress.unlockedLevel, Math.min(levelId + 1, LEVELS.length));
    message = `Nivel completado. ${earnedStars} estrella(s).`;
    playTone(progress.sound, 720, 0.14);
  } else {
    currentGame.earnedStars = 0;
    message = "Sin movimientos disponibles.";
    playTone(progress.sound, 100, 0.14);
  }

  saveProgress(progress);
}

function render() {
  if (auth.state.status !== "signed-in") {
    app.innerHTML = renderAuthGate(auth.state);
    return;
  }

  let html = renderAuthBar(auth.state.user);

  if (screen === "home") {
    html += renderHome({ infoOpen });
  }
  if (screen === "levels") {
    html += renderLevels(progress, { infoOpen });
  }
  if (screen === "game") {
    html += renderGameScreen();
  }

  app.innerHTML = html;
  auth.mountUserButton(document.querySelector("#clerk-user-button"));
  auth.mountActiveForm(document.querySelector("#clerk-auth-mount"));
}

function renderGameScreen() {
  if (!currentGame) {
    screen = "levels";
    return renderLevels(progress, { infoOpen });
  }

  return renderGame({
    currentGame,
    selectedCell,
    clearingCells,
    message,
    lastCombo,
    progress,
    infoOpen
  });
}

function positionKey({ row, col }) {
  return `${row},${col}`;
}

function getCellTarget(event) {
  return event.target.closest("[data-cell]");
}

function clearDragClasses() {
  app.querySelectorAll(".dragging, .drop-target").forEach((item) => {
    item.classList.remove("dragging", "drop-target");
  });
}
