import { GEM_META, LEVELS, areAdjacent, createGame } from "./gameLogic.js";
import { createAuthController, renderAuthBar, renderAuthGate } from "./auth.js";
import { ensureBackgroundMusic, playTone, updateBackgroundMusic } from "./audio.js";
import {
  createLeaderboardState,
  getPlayerName,
  loadDailyLeaderboard,
  submitDailyScore
} from "./leaderboard.js";
import { calculateStars, mergeBestStars } from "./mastery.js";
import { createDefaultProgress, loadProgress, saveProgress } from "./storage.js";
import { renderGame, renderHome, renderLevels } from "./views.js";

const app = document.querySelector("#app");
const auth = createAuthController({ onChange: render });

let progress = createDefaultProgress();
let progressOwnerId = "";
let screen = "home";
let currentGame = null;
let selectedCell = null;
let message = "";
let completionSaved = false;
let clearingCells = new Set();
let animationTimer = null;
let swapAnimation = null;
let swapAnimationTimer = null;
let lastCombo = 0;
let dragCell = null;
let dragFrame = null;
let pendingDragPoint = null;
let suppressClick = false;
let infoOpen = false;
let leaderboardOpen = false;
let leaderboardLevelId = 1;
let leaderboardState = createLeaderboardState();
let leaderboardRequestId = 0;
let leaderboardLoadingTimer = null;

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
  if (!isDesktopPointer(event) || auth.state.status !== "signed-in") {
    return;
  }

  const cellTarget = getCellTarget(event);
  if (!cellTarget || cellTarget.disabled || currentGame?.status !== "playing") {
    return;
  }

  event.preventDefault();
  ensureBackgroundMusic(progress.sound);
  dragCell = {
    row: Number(cellTarget.dataset.row),
    col: Number(cellTarget.dataset.col),
    startX: event.clientX,
    startY: event.clientY,
    pointerId: event.pointerId,
    moved: false
  };
  cellTarget.setPointerCapture?.(event.pointerId);
  cellTarget.classList.add("dragging");
});

app.addEventListener("pointermove", (event) => {
  if (!isDesktopPointer(event) || auth.state.status !== "signed-in" || !dragCell) {
    return;
  }

  if (event.pointerId !== dragCell.pointerId) {
    return;
  }

  event.preventDefault();
  updateDragVisual(event);
});

app.addEventListener("pointerup", (event) => {
  if (!isDesktopPointer(event) || auth.state.status !== "signed-in" || !dragCell) {
    return;
  }

  if (event.pointerId !== dragCell.pointerId) {
    return;
  }

  const from = dragCell;
  const cellTarget = getCellAt(event.clientX, event.clientY);
  const to = dragCell.moved && (dragCell.target ?? (cellTarget
    ? { row: Number(cellTarget.dataset.row), col: Number(cellTarget.dataset.col) }
    : null));

  event.preventDefault();
  clearDragClasses();
  dragCell = null;
  suppressClick = from.moved;

  if (to && areAdjacent(from, to)) {
    suppressClick = true;
    performSwap(from, to);
  }
});

app.addEventListener("pointercancel", (event) => {
  if (!isDesktopPointer(event)) {
    return;
  }

  dragCell = null;
  clearDragClasses();
});

app.addEventListener("touchstart", (event) => {
  if (auth.state.status !== "signed-in") {
    return;
  }

  const cellTarget = getCellTarget(event);
  if (!cellTarget || cellTarget.disabled || currentGame?.status !== "playing") {
    return;
  }

  const touch = event.changedTouches[0];
  event.preventDefault();
  ensureBackgroundMusic(progress.sound);
  dragCell = {
    row: Number(cellTarget.dataset.row),
    col: Number(cellTarget.dataset.col),
    startX: touch.clientX,
    startY: touch.clientY,
    touchId: touch.identifier,
    moved: false
  };
  cellTarget.classList.add("dragging");
}, { passive: false });

app.addEventListener("touchmove", (event) => {
  if (auth.state.status !== "signed-in" || !dragCell) {
    return;
  }

  const touch = getTrackedTouch(event.touches);
  if (!touch) {
    return;
  }

  event.preventDefault();
  pendingDragPoint = { clientX: touch.clientX, clientY: touch.clientY };
  if (!dragFrame) {
    dragFrame = requestAnimationFrame(() => {
      dragFrame = null;
      if (dragCell && pendingDragPoint) {
        updateDragVisual(pendingDragPoint);
      }
      pendingDragPoint = null;
    });
  }
}, { passive: false });

app.addEventListener("touchend", (event) => {
  if (auth.state.status !== "signed-in") {
    return;
  }

  if (!dragCell) {
    return;
  }

  const touch = getTrackedTouch(event.changedTouches);
  const from = dragCell;
  const cellTarget = touch ? getCellAt(touch.clientX, touch.clientY) : null;
  const to = dragCell.moved && (dragCell.target ?? (cellTarget
    ? { row: Number(cellTarget.dataset.row), col: Number(cellTarget.dataset.col) }
    : null));

  event.preventDefault();
  clearDragClasses();
  dragCell = null;
  pendingDragPoint = null;
  if (dragFrame) {
    cancelAnimationFrame(dragFrame);
    dragFrame = null;
  }
  suppressClick = true;

  if (to && areAdjacent(from, to)) {
    performSwap(from, to);
    return;
  }

  handleCellClick(from.row, from.col);
}, { passive: false });

app.addEventListener("touchcancel", () => {
  dragCell = null;
  pendingDragPoint = null;
  if (dragFrame) {
    cancelAnimationFrame(dragFrame);
    dragFrame = null;
  }
  clearDragClasses();
});

render();
auth.init();
lockLandscapeOrientation();

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
  switch (action) {
    case "home":
      showHome();
      break;
    case "levels":
      showLevels();
      break;
    case "start-latest":
      startLevel(progress.unlockedLevel);
      break;
    case "start-level":
      startLevel(Number(data.level));
      break;
    case "retry":
      startLevel(currentGame.level.id);
      break;
    case "next-level":
      startLevel(Math.min(currentGame.level.id + 1, LEVELS.length));
      break;
    case "toggle-sound":
      progress.sound = !progress.sound;
      saveCurrentProgress();
      updateBackgroundMusic(progress.sound);
      render();
      break;
    case "reset-progress":
      progress = createDefaultProgress();
      saveCurrentProgress();
      showLevels();
      break;
    case "open-info":
      infoOpen = true;
      render();
      break;
    case "close-info":
      infoOpen = false;
      render();
      break;
    case "open-ranking":
      openLeaderboard(Number(data.level) || currentGame?.level.id || progress.unlockedLevel);
      break;
    case "close-ranking":
      closeLeaderboard();
      break;
    case "leaderboard-level":
      openLeaderboard(Number(data.level) || leaderboardLevelId);
      break;
    case "refresh-ranking":
      refreshLeaderboard(leaderboardLevelId);
      break;
    default:
      break;
  }
}

function closeLeaderboard() {
  leaderboardOpen = false;
  leaderboardRequestId += 1;
  if (leaderboardLoadingTimer) {
    clearTimeout(leaderboardLoadingTimer);
    leaderboardLoadingTimer = null;
  }
  render();
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
  swapAnimation = null;
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
  swapAnimation = null;
  completionSaved = false;
  lastCombo = 0;
  message = "Selecciona una gema y luego una adyacente.";
  render();
}

function handleCellClick(row, col) {
  if (currentGame?.status !== "playing") {
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
  if (currentGame?.status !== "playing") {
    return;
  }

  const result = currentGame.swap(from, to);
  selectedCell = null;
  swapAnimation = to && areAdjacent(from, to)
    ? { type: result.accepted ? "valid" : "invalid", from, to }
    : null;
  applyMoveResult(result);
  render();
}

function applyMoveResult(result) {
  if (result.accepted) {
    clearingCells = new Set((result.clearedCells ?? []).map(positionKey));
    lastCombo = result.cascades > 1 ? result.cascades : 0;
    message = buildMoveMessage(result);
    playTone(progress.sound, getMatchTone(result.cascades), 0.09);
    finishIfNeeded();
    scheduleClearAnimation();
    return;
  }

  clearingCells = new Set();
  lastCombo = 0;
  message = moveErrorMessage(result.reason);
  playTone(progress.sound, 140, 0.1);
  finishIfNeeded();
  scheduleSwapAnimationClear();
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
  if (swapAnimationTimer) {
    clearTimeout(swapAnimationTimer);
  }

  animationTimer = setTimeout(() => {
    clearingCells = new Set();
    swapAnimation = null;
    animationTimer = null;
    if (screen === "game") {
      render();
    }
  }, 520);
}

function scheduleSwapAnimationClear() {
  if (swapAnimationTimer) {
    clearTimeout(swapAnimationTimer);
  }

  swapAnimationTimer = setTimeout(() => {
    swapAnimation = null;
    swapAnimationTimer = null;
    if (screen === "game") {
      render();
    }
  }, 280);
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
    publishScoreToLeaderboard({
      levelId,
      score: currentGame.score,
      stars: earnedStars,
      movesLeft: currentGame.movesLeft
    });
  } else {
    currentGame.earnedStars = 0;
    message = "Sin movimientos disponibles.";
    playTone(progress.sound, 100, 0.14);
  }

  saveCurrentProgress();
}

function render() {
  if (auth.state.status !== "signed-in") {
    setOverlayLock(false);
    app.innerHTML = renderAuthGate(auth.state);
    return;
  }

  syncProgressForUser();

  let html = renderAuthBar(auth.state.user);

  if (screen === "home") {
    html += renderHome(getOverlayState());
  }
  if (screen === "levels") {
    html += renderLevels(progress, getOverlayState());
  }
  if (screen === "game") {
    html += renderGameScreen();
  }

  app.innerHTML = html;
  setOverlayLock(screen === "game" && currentGame && currentGame.status !== "playing");
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
    swapAnimation,
    message,
    lastCombo,
    progress,
    ...getOverlayState()
  });
}

function getMatchTone(cascades) {
  if (cascades > 2) {
    return 680;
  }

  return cascades > 1 ? 560 : 420;
}

function getOverlayState() {
  return {
    infoOpen,
    leaderboardOpen,
    leaderboardLevelId,
    leaderboardState
  };
}

function positionKey({ row, col }) {
  return `${row},${col}`;
}

function syncProgressForUser() {
  const nextOwnerId = getProgressOwnerId(auth.state.user);
  if (nextOwnerId === progressOwnerId) {
    return;
  }

  progressOwnerId = nextOwnerId;
  progress = loadProgress(progressOwnerId);
  clearActiveGame();
  screen = "home";
}

function saveCurrentProgress() {
  saveProgress(progress, progressOwnerId);
}

async function openLeaderboard(levelId) {
  leaderboardOpen = true;
  await refreshLeaderboard(levelId);
}

async function refreshLeaderboard(levelId) {
  const requestId = ++leaderboardRequestId;
  leaderboardLevelId = Math.min(Math.max(Number(levelId) || 1, 1), LEVELS.length);
  if (leaderboardLoadingTimer) {
    clearTimeout(leaderboardLoadingTimer);
    leaderboardLoadingTimer = null;
  }

  const loadingState = createLeaderboardState({
    status: "loading",
    entries: leaderboardState.entries,
    scoreDate: leaderboardState.scoreDate
  });
  leaderboardLoadingTimer = setTimeout(() => {
    if (requestId !== leaderboardRequestId) {
      return;
    }

    leaderboardState = loadingState;
    render();
  }, 120);

  try {
    const nextState = await loadDailyLeaderboard(leaderboardLevelId);
    if (requestId === leaderboardRequestId) {
      if (leaderboardLoadingTimer) {
        clearTimeout(leaderboardLoadingTimer);
        leaderboardLoadingTimer = null;
      }
      leaderboardState = nextState;
      render();
    }
  } catch (error) {
    if (requestId === leaderboardRequestId) {
      if (leaderboardLoadingTimer) {
        clearTimeout(leaderboardLoadingTimer);
        leaderboardLoadingTimer = null;
      }
      leaderboardState = createLeaderboardState({
        status: "error",
        entries: [],
        error: error instanceof Error ? error.message : "No se pudo cargar el ranking."
      });
      render();
    }
  }
}

async function publishScoreToLeaderboard({ levelId, score, stars, movesLeft }) {
  try {
    await submitDailyScore({
      levelId,
      playerId: progressOwnerId || getProgressOwnerId(auth.state.user),
      playerName: getPlayerName(auth.state.user),
      score,
      stars,
      movesLeft
    });

    if (leaderboardOpen && leaderboardLevelId === levelId) {
      await refreshLeaderboard(levelId);
    }
  } catch (error) {
    if (leaderboardOpen && leaderboardLevelId === levelId) {
      leaderboardState = createLeaderboardState({
        status: "error",
        entries: [],
        error: error instanceof Error ? error.message : "No se pudo guardar el puntaje."
      });
      render();
    }
  }
}

function getProgressOwnerId(user) {
  return user?.id || user?.primaryEmailAddress?.emailAddress || user?.username || "";
}

function setOverlayLock(isLocked) {
  document.documentElement.classList.toggle("overlay-locked", isLocked);
  document.body.classList.toggle("overlay-locked", isLocked);
}

function isDesktopPointer(event) {
  return (event.pointerType === "mouse" || event.pointerType === "pen") && event.button !== 2;
}

function getCellTarget(event) {
  return event.target.closest("[data-cell]");
}

function getCellAt(x, y) {
  return document.elementFromPoint(x, y)?.closest("[data-cell]");
}

function getTrackedTouch(touches) {
  return Array.from(touches).find((touch) => touch.identifier === dragCell?.touchId);
}

function clearDragClasses() {
  app.querySelectorAll(".dragging, .drop-target, .push-line").forEach((item) => {
    item.classList.remove("dragging", "drop-target", "push-line");
    item.style.removeProperty("--drag-x");
    item.style.removeProperty("--drag-y");
    item.style.removeProperty("--push-x");
    item.style.removeProperty("--push-y");
    item.style.removeProperty("--nudge-x");
    item.style.removeProperty("--nudge-y");
  });
}

function updateDragVisual(event) {
  const origin = app.querySelector(`[data-row="${dragCell.row}"][data-col="${dragCell.col}"]`);
  if (!origin) {
    return;
  }

  const rect = origin.getBoundingClientRect();
  const rawX = event.clientX - dragCell.startX;
  const rawY = event.clientY - dragCell.startY;
  dragCell.moved = Math.hypot(rawX, rawY) > 14;
  const horizontal = Math.abs(rawX) >= Math.abs(rawY);
  const limit = horizontal ? rect.width : rect.height;
  const dragX = horizontal ? clamp(rawX, -limit, limit) * 0.78 : 0;
  const dragY = horizontal ? 0 : clamp(rawY, -limit, limit) * 0.78;
  const direction = getDragDirection(dragCell.moved, horizontal, dragX, dragY);
  const target = direction.row || direction.col
    ? app.querySelector(`[data-row="${dragCell.row + direction.row}"][data-col="${dragCell.col + direction.col}"]`)
    : null;

  clearDragClasses();
  origin.classList.add("dragging");
  origin.style.setProperty("--drag-x", `${dragX}px`);
  origin.style.setProperty("--drag-y", `${dragY}px`);

  if (!target || target.disabled) {
    dragCell.target = null;
    return;
  }

  dragCell.target = {
    row: Number(target.dataset.row),
    col: Number(target.dataset.col)
  };
  target.classList.add("drop-target");
  target.style.setProperty("--push-x", `${-dragX * 0.68}px`);
  target.style.setProperty("--push-y", `${-dragY * 0.68}px`);

  app.querySelectorAll("[data-cell]").forEach((cell) => {
    const sameLine = horizontal
      ? Number(cell.dataset.row) === dragCell.row
      : Number(cell.dataset.col) === dragCell.col;
    if (!sameLine || cell === origin || cell === target || cell.disabled) {
      return;
    }

    cell.classList.add("push-line");
    cell.style.setProperty("--nudge-x", `${dragX * 0.1}px`);
    cell.style.setProperty("--nudge-y", `${dragY * 0.1}px`);
  });
}

function getDragDirection(moved, horizontal, dragX, dragY) {
  if (!moved) {
    return { row: 0, col: 0 };
  }

  if (horizontal) {
    return { row: 0, col: Math.sign(dragX) };
  }

  return { row: Math.sign(dragY), col: 0 };
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function lockLandscapeOrientation() {
  window.screen.orientation?.lock?.("landscape").catch(() => {
    // Manifest handles installed PWAs; unsupported browsers can ignore this.
  });
}
