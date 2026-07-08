import { GEM_META, LEVELS, describeObjective, getObjectiveProgress } from "./gameLogic.js";

export function renderHome() {
  return `
    <section class="home-view">
      <div class="home-copy">
        <p class="eyebrow">MVP Match-3</p>
        <h1>GemQuest</h1>
        <div class="home-actions">
          <button class="primary-button" data-action="start-latest">Jugar</button>
          <button class="secondary-button" data-action="levels">Niveles</button>
        </div>
      </div>
    </section>
  `;
}

export function renderLevels(progress) {
  return `
    <section class="level-view">
      <header class="screen-header">
        <button class="quiet-button" data-action="home">Inicio</button>
        <div>
          <p class="eyebrow">Seleccion</p>
          <h1>Niveles</h1>
        </div>
      </header>
      <div class="level-list">
        ${LEVELS.map((level) => renderLevelButton(level, progress)).join("")}
      </div>
      <div class="footer-actions">
        <button class="quiet-button" data-action="reset-progress">Reiniciar progreso</button>
      </div>
    </section>
  `;
}

export function renderGame({ currentGame, selectedCell, clearingCells, message, progress }) {
  const progressData = getObjectiveProgress(currentGame);
  const progressPercent = Math.round((progressData.current / progressData.target) * 100);
  const bestScore = progress.bestScores[currentGame.level.id] ?? 0;
  const resultBlock = currentGame.status === "playing" ? "" : renderResultBlock(currentGame);

  return `
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
            ${renderBoard(currentGame, selectedCell, clearingCells)}
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

function renderLevelButton(level, progress) {
  const locked = level.id > progress.unlockedLevel;
  const bestScore = progress.bestScores[level.id] ?? 0;
  const objectiveType = level.objective.type;
  const stateClass = locked ? "locked" : "unlocked";
  return `
    <button
      class="level-card ${stateClass} objective-${objectiveType}"
      data-action="start-level"
      data-level="${level.id}"
      style="--level-index: ${level.id - 1};"
      ${locked ? "disabled" : ""}
    >
      <span class="level-card-glow" aria-hidden="true"></span>
      <span class="level-card-gems" aria-hidden="true">
        <span></span><span></span><span></span><span></span><span></span><span></span>
      </span>
      <span class="level-card-top">
        <span class="level-number">Nivel ${level.id}</span>
        <span class="level-emblem" aria-hidden="true"></span>
      </span>
      <strong>${level.name}</strong>
      <span class="level-objective">${describeObjective(level)}</span>
      <span class="level-stats">
        <span>${level.moves} movimientos</span>
        <span>Record ${bestScore}</span>
      </span>
      ${locked ? `<span class="lock-label">Bloqueado</span>` : `<span class="ready-label">Disponible</span>`}
    </button>
  `;
}

function renderBoard(currentGame, selectedCell, clearingCells) {
  return currentGame.board
    .flatMap((row, rowIndex) =>
      row.map((cell, colIndex) => renderCell(currentGame, selectedCell, clearingCells, cell, rowIndex, colIndex))
    )
    .join("");
}

function renderCell(currentGame, selectedCell, clearingCells, cell, rowIndex, colIndex) {
  const selected = selectedCell && selectedCell.row === rowIndex && selectedCell.col === colIndex;
  const clearing = clearingCells.has(positionKey({ row: rowIndex, col: colIndex }));
  const disabled = currentGame.status !== "playing" || cell.blocker;
  const label = cell.blocker
    ? `Obstaculo en fila ${rowIndex + 1}, columna ${colIndex + 1}`
    : `${GEM_META[cell.gem].name} en fila ${rowIndex + 1}, columna ${colIndex + 1}`;

  return `
    <button
      class="cell ${selected ? "selected" : ""} ${clearing ? "clearing" : ""} ${cell.blocker ? "blocker" : ""}"
      data-cell
      data-row="${rowIndex}"
      data-col="${colIndex}"
      aria-label="${label}"
      ${disabled ? "disabled" : ""}
    >
      ${
        cell.blocker
          ? `<span class="blocker-mark">x</span>`
          : `<span class="gem ${GEM_META[cell.gem].cssClass}" aria-hidden="true"></span>${clearing ? `<span class="match-burst" aria-hidden="true"></span>` : ""}`
      }
    </button>
  `;
}

function renderResultBlock(currentGame) {
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

function positionKey({ row, col }) {
  return `${row},${col}`;
}
