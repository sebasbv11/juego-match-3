import {
  GEM_META,
  LEVELS,
  areAdjacent,
  createGame,
  describeObjective,
  getObjectiveProgress
} from "./gameLogic.js";

const STORAGE_KEY = "gemquest-progress-v1";

const app = document.querySelector("#app");
let progress = loadProgress();
let screen = "home";
let currentGame = null;
let selectedCell = null;
let message = "";
let completionSaved = false;
let audioContext = null;

app.addEventListener("click", (event) => {
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
    screen = "home";
    currentGame = null;
    selectedCell = null;
    render();
  }

  if (action === "levels") {
    screen = "levels";
    currentGame = null;
    selectedCell = null;
    render();
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
    saveProgress();
    render();
  }

  if (action === "reset-progress") {
    progress = createDefaultProgress();
    saveProgress();
    screen = "levels";
    currentGame = null;
    selectedCell = null;
    render();
  }
}

function startLevel(levelId) {
  const level = LEVELS.find((item) => item.id === levelId) ?? LEVELS[0];
  if (level.id > progress.unlockedLevel) {
    return;
  }

  currentGame = createGame(level);
  screen = "game";
  selectedCell = null;
  completionSaved = false;
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
    playTone(120, 0.08);
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
    playTone(160, 0.06);
    render();
    return;
  }

  const result = currentGame.swap(selectedCell, nextSelection);
  selectedCell = null;

  if (result.accepted) {
    message = buildMoveMessage(result);
    playTone(result.cascades > 1 ? 560 : 420, 0.09);
    if (currentGame.status !== "playing") {
      completeLevel();
    }
  } else {
    message = moveErrorMessage(result.reason);
    playTone(140, 0.1);
  }

  render();
}

function buildMoveMessage(result) {
  const cascadeText = result.cascades > 1 ? `, ${result.cascades} cascadas` : "";
  const blockerText =
    result.blockersCleared > 0 ? `, ${result.blockersCleared} obstaculo(s)` : "";
  return `+${result.points} puntos${cascadeText}${blockerText}.`;
}

function moveErrorMessage(reason) {
  const messages = {
    "no-match": "Ese intercambio no forma una combinacion.",
    blocked: "No puedes mover un obstaculo.",
    "not-adjacent": "Solo puedes intercambiar gemas adyacentes.",
    "outside-board": "Seleccion fuera del tablero.",
    finished: "La partida ya termino."
  };
  return messages[reason] ?? "Movimiento no valido.";
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
    progress.unlockedLevel = Math.max(progress.unlockedLevel, Math.min(levelId + 1, LEVELS.length));
    message = "Nivel completado.";
    playTone(720, 0.14);
  } else {
    message = "Sin movimientos disponibles.";
    playTone(100, 0.14);
  }

  saveProgress();
}

function render() {
  if (screen === "home") {
    renderHome();
  }
  if (screen === "levels") {
    renderLevels();
  }
  if (screen === "game") {
    renderGame();
  }
}

function renderHome() {
  app.innerHTML = `
    <section class="home-view">
      <div class="home-copy">
        <p class="eyebrow">MVP Match-3</p>
        <h1>GemQuest</h1>
        <div class="home-actions">
          <button class="primary-button" data-action="start-latest">Jugar</button>
          <button class="secondary-button" data-action="levels">Niveles</button>
        </div>
      </div>
      <div class="preview-board" aria-hidden="true">
        ${renderPreviewGems()}
      </div>
    </section>
  `;
}

function renderPreviewGems() {
  const sequence = [0, 1, 2, 3, 4, 5, 2, 0, 3, 1, 4, 5, 1, 2, 0, 3];
  return sequence
    .map((gem) => `<span class="preview-cell"><span class="gem ${GEM_META[gem].cssClass}"></span></span>`)
    .join("");
}

function renderLevels() {
  app.innerHTML = `
    <section class="level-view">
      <header class="screen-header">
        <button class="quiet-button" data-action="home">Inicio</button>
        <div>
          <p class="eyebrow">Seleccion</p>
          <h1>Niveles</h1>
        </div>
      </header>
      <div class="level-list">
        ${LEVELS.map(renderLevelButton).join("")}
      </div>
      <div class="footer-actions">
        <button class="quiet-button" data-action="reset-progress">Reiniciar progreso</button>
      </div>
    </section>
  `;
}

function renderLevelButton(level) {
  const locked = level.id > progress.unlockedLevel;
  const bestScore = progress.bestScores[level.id] ?? 0;
  return `
    <button class="level-card" data-action="start-level" data-level="${level.id}" ${locked ? "disabled" : ""}>
      <span class="level-number">Nivel ${level.id}</span>
      <strong>${level.name}</strong>
      <span>${describeObjective(level)}</span>
      <span>${level.moves} movimientos</span>
      <span>Record ${bestScore}</span>
      ${locked ? `<span class="lock-label">Bloqueado</span>` : ""}
    </button>
  `;
}

function renderGame() {
  if (!currentGame) {
    screen = "levels";
    renderLevels();
    return;
  }

  const progressData = getObjectiveProgress(currentGame);
  const progressPercent = Math.round((progressData.current / progressData.target) * 100);
  const bestScore = progress.bestScores[currentGame.level.id] ?? 0;
  const resultBlock = currentGame.status === "playing" ? "" : renderResultBlock();

  app.innerHTML = `
    <section class="game-view">
      <header class="game-header">
        <button class="quiet-button" data-action="levels">Niveles</button>
        <div class="level-title">
          <p class="eyebrow">Nivel ${currentGame.level.id}</p>
          <h1>${currentGame.level.name}</h1>
        </div>
        <button class="quiet-button" data-action="toggle-sound" aria-pressed="${progress.sound}">
          Sonido ${progress.sound ? "on" : "off"}
        </button>
      </header>

      <section class="hud" aria-label="Estado de la partida">
        <div>
          <span>Puntuacion</span>
          <strong>${currentGame.score}</strong>
        </div>
        <div>
          <span>Movimientos</span>
          <strong>${currentGame.movesLeft}</strong>
        </div>
        <div>
          <span>Record</span>
          <strong>${bestScore}</strong>
        </div>
      </section>

      <section class="play-layout">
        <div class="board-panel">
          <div
            class="board"
            style="--rows: ${currentGame.level.rows}; --cols: ${currentGame.level.cols};"
            aria-label="Tablero de gemas"
          >
            ${renderBoard()}
          </div>
        </div>

        <aside class="status-panel">
          <section>
            <p class="panel-label">Objetivo</p>
            <h2>${describeObjective(currentGame.level)}</h2>
            <div class="progress-bar" aria-label="${progressData.label}">
              <span style="width: ${progressPercent}%"></span>
            </div>
            <p class="progress-copy">${progressData.label}</p>
          </section>
          <p class="message">${message}</p>
          ${resultBlock}
        </aside>
      </section>
    </section>
  `;
}

function renderBoard() {
  return currentGame.board
    .flatMap((row, rowIndex) =>
      row.map((cell, colIndex) => {
        const selected =
          selectedCell && selectedCell.row === rowIndex && selectedCell.col === colIndex;
        const disabled = currentGame.status !== "playing" || cell.blocker;
        const label = cell.blocker
          ? `Obstaculo en fila ${rowIndex + 1}, columna ${colIndex + 1}`
          : `${GEM_META[cell.gem].name} en fila ${rowIndex + 1}, columna ${colIndex + 1}`;

        return `
          <button
            class="cell ${selected ? "selected" : ""} ${cell.blocker ? "blocker" : ""}"
            data-cell
            data-row="${rowIndex}"
            data-col="${colIndex}"
            aria-label="${label}"
            ${disabled ? "disabled" : ""}
          >
            ${
              cell.blocker
                ? `<span class="blocker-mark">x</span>`
                : `<span class="gem ${GEM_META[cell.gem].cssClass}" aria-hidden="true"></span>`
            }
          </button>
        `;
      })
    )
    .join("");
}

function renderResultBlock() {
  const won = currentGame.status === "won";
  const hasNext = currentGame.level.id < LEVELS.length;
  return `
    <section class="result-panel ${won ? "won" : "lost"}">
      <p class="panel-label">${won ? "Victoria" : "Derrota"}</p>
      <h2>${won ? "Nivel superado" : "Intentalo otra vez"}</h2>
      <p>Puntuacion final: ${currentGame.score}</p>
      <div class="result-actions">
        <button class="primary-button" data-action="${won && hasNext ? "next-level" : "retry"}">
          ${won && hasNext ? "Siguiente" : "Reintentar"}
        </button>
        <button class="secondary-button" data-action="levels">Niveles</button>
      </div>
    </section>
  `;
}

function loadProgress() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return createDefaultProgress();
    }
    const parsed = JSON.parse(raw);
    return {
      unlockedLevel: Math.min(Math.max(Number(parsed.unlockedLevel) || 1, 1), LEVELS.length),
      bestScores: parsed.bestScores ?? {},
      sound: parsed.sound !== false
    };
  } catch {
    return createDefaultProgress();
  }
}

function createDefaultProgress() {
  return {
    unlockedLevel: 1,
    bestScores: {},
    sound: true
  };
}

function saveProgress() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
}

function playTone(frequency, duration) {
  if (!progress.sound) {
    return;
  }

  try {
    audioContext = audioContext ?? new AudioContext();
    const oscillator = audioContext.createOscillator();
    const gain = audioContext.createGain();
    oscillator.type = "sine";
    oscillator.frequency.value = frequency;
    gain.gain.value = 0.035;
    oscillator.connect(gain);
    gain.connect(audioContext.destination);
    oscillator.start();
    oscillator.stop(audioContext.currentTime + duration);
  } catch {
    // Audio is optional for the MVP and can be blocked by browser settings.
  }
}
