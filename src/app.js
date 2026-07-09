import { GEM_META, LEVELS, areAdjacent, createGame } from "./gameLogic.js";
import { ensureBackgroundMusic, playTone, updateBackgroundMusic } from "./audio.js";
import { calculateStars, mergeBestStars } from "./mastery.js";
import { createDefaultProgress, loadProgress, saveProgress } from "./storage.js";
import { renderGame, renderHome, renderLevels } from "./views.js";

const app = document.querySelector("#app");

let progress = loadProgress();
let screen = "home";
let currentGame = null;
let selectedCell = null;
let message = "";
let completionSaved = false;
let clearingCells = new Set();
let animationTimer = null;
let lastCombo = 0;

app.addEventListener("click", (event) => {
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

render();

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

  const result = currentGame.swap(selectedCell, nextSelection);
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
  if (screen === "home") {
    app.innerHTML = renderHome();
  }
  if (screen === "levels") {
    app.innerHTML = renderLevels(progress);
  }
  if (screen === "game") {
    renderGameScreen();
  }
}

function renderGameScreen() {
  if (!currentGame) {
    screen = "levels";
    app.innerHTML = renderLevels(progress);
    return;
  }

  app.innerHTML = renderGame({
    currentGame,
    selectedCell,
    clearingCells,
    message,
    lastCombo,
    progress
  });
}

function positionKey({ row, col }) {
  return `${row},${col}`;
}
