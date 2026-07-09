import { GEM_META, LEVELS, describeObjective, getObjectiveProgress } from "./gameLogic.js";

export function renderHome({ infoOpen = false } = {}) {
  return `
    <section class="home-view">
      <div class="home-copy">
        <p class="eyebrow">Match-3</p>
        <h1>GemQuest</h1>
        <div class="home-actions">
          <button class="primary-button" data-action="start-latest">Jugar</button>
          <button class="secondary-button" data-action="levels">Niveles</button>
        </div>
      </div>
    </section>
    ${renderInfoHelp(infoOpen)}
  `;
}

export function renderLevels(progress, { infoOpen = false } = {}) {
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
    ${renderInfoHelp(infoOpen)}
  `;
}

export function renderGame({ currentGame, selectedCell, clearingCells, message, lastCombo, progress, infoOpen = false }) {
  const progressData = getObjectiveProgress(currentGame);
  const progressPercent = Math.round((progressData.current / progressData.target) * 100);
  const bestScore = progress.bestScores[currentGame.level.id] ?? 0;
  const bestStars = progress.starsByLevel[currentGame.level.id] ?? 0;
  const resultBlock =
    currentGame.status === "lost" ? renderResultBlock(currentGame, bestStars) : "";
  const victoryOverlay =
    currentGame.status === "won" ? renderVictoryOverlay(currentGame, bestStars) : "";

  return `
    <section class="game-view game-status-${currentGame.status}">
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
        <div>
          <span>Maestria</span>
          <strong class="hud-stars">${renderStars(bestStars, "Mejor maestria")}</strong>
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
          ${lastCombo > 1 ? `<p class="combo-banner">Combo x${lastCombo}</p>` : ""}
          <p class="message ${lastCombo > 1 ? "combo-message" : ""}">${message}</p>
          ${resultBlock}
        </aside>
      </section>
      ${victoryOverlay}
    </section>
    ${renderInfoHelp(infoOpen)}
  `;
}

function renderLevelButton(level, progress) {
  const locked = level.id > progress.unlockedLevel;
  const bestScore = progress.bestScores[level.id] ?? 0;
  const stars = progress.starsByLevel[level.id] ?? 0;
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
      ${renderStars(stars, `Maestria nivel ${level.id}`)}
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

function renderResultBlock(currentGame, bestStars) {
  const won = currentGame.status === "won";
  const hasNext = currentGame.level.id < LEVELS.length;
  const earnedStars = currentGame.earnedStars ?? 0;
  return `
    <section class="result-panel ${won ? "won" : "lost"}">
      <p class="panel-label">${won ? "Victoria" : "Derrota"}</p>
      <h2>${won ? "Nivel superado" : "Intentalo otra vez"}</h2>
      ${
        won
          ? `<div class="result-stars">
              ${renderStars(earnedStars, "Estrellas ganadas")}
              <span class="result-best-stars">Mejor ${bestStars}</span>
            </div>`
          : ""
      }
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

function renderVictoryOverlay(currentGame, bestStars) {
  const earnedStars = currentGame.earnedStars ?? 0;
  const hasNext = currentGame.level.id < LEVELS.length;
  const nextLevel = currentGame.level.id + 1;
  const previousBest = currentGame.previousBestScore ?? 0;
  const coinsEarned = calculateCoinsEarned(currentGame);
  const worldProgress = Math.round((currentGame.level.id / LEVELS.length) * 100);

  return `
    <section class="victory-overlay" aria-label="Victoria">
      <div class="confetti" aria-hidden="true">
        ${Array.from(
          { length: 26 },
          (_, index) => `<span style="--i: ${index}; --x: ${(index * 37) % 100}%;"></span>`
        ).join("")}
      </div>
      <div class="victory-card">
        <div class="victory-topbar" aria-hidden="true">
          <span class="reward-pill coin-pill"><b></b>${coinsEarned}</span>
          <span class="reward-pill star-pill"><b></b>${earnedStars}</span>
        </div>
        <div class="pirate-host" aria-hidden="true">
          <span class="pirate-hat"></span>
          <span class="pirate-face"></span>
          <span class="pirate-coat"></span>
        </div>
        <div class="victory-content">
          <h2>Nivel completado!</h2>
          <div class="victory-star-stage" aria-hidden="true">
            <span class="big-victory-star"></span>
          </div>
          <div class="victory-stars">
            ${renderStars(earnedStars, "Estrellas ganadas")}
          </div>
          <div class="reward-summary">
            <span>
              <small>Monedas ganadas</small>
              <strong>${coinsEarned}</strong>
            </span>
            <span>
              <small>Puntaje obtenido</small>
              <strong>${currentGame.score}</strong>
            </span>
          </div>
          <div class="episode-progress">
            <div>
              <small>Progreso del episodio</small>
              <strong>${worldProgress}%</strong>
            </div>
            <span><i style="width: ${worldProgress}%"></i></span>
          </div>
          ${
            currentGame.isNewRecord
              ? `<p class="new-record">Nuevo record del nivel</p>`
              : `<p class="result-best-stars">Record anterior: ${previousBest} | Mejor maestria: ${bestStars} de 3</p>`
          }
          <div class="victory-actions">
            <button class="primary-button victory-next" data-action="${hasNext ? "next-level" : "retry"}">
              ${hasNext ? `Siguiente: nivel ${nextLevel}` : "Jugar otra vez"}
            </button>
            <button class="secondary-button" data-action="retry">Repetir nivel</button>
            <button class="quiet-button" data-action="levels">Volver al mapa</button>
          </div>
        </div>
      </div>
    </section>
  `;
}

function calculateCoinsEarned(currentGame) {
  const stars = currentGame.earnedStars ?? 0;
  return Math.max(10, stars * 25 + Math.floor(currentGame.score / 100) + currentGame.movesLeft * 2);
}

function renderStars(amount, label) {
  const stars = Array.from({ length: 3 }, (_, index) => {
    const filled = index < amount;
    return `<span class="star ${filled ? "filled" : "empty"}" aria-hidden="true">${filled ? "&#9733;" : "&#9734;"}</span>`;
  }).join("");

  return `<span class="star-rating" aria-label="${label}: ${amount} de 3">${stars}</span>`;
}

function renderInfoHelp(isOpen) {
  return `
    <button class="info-button" data-action="open-info" aria-label="Como jugar">?</button>
    ${
      isOpen
        ? `<section class="info-overlay" aria-label="Guia rapida">
            <div class="info-panel">
              <button class="info-close" data-action="close-info" aria-label="Cerrar">x</button>
              <p class="panel-label">Guia rapida</p>
              <h2>Como jugar GemQuest</h2>
              <ul>
                <li>Intercambia gemas vecinas para formar lineas de 3 o mas.</li>
                <li>Cada intento adyacente consume 1 movimiento, aunque no haga match.</li>
                <li>Los combos aparecen cuando una jugada causa cascadas automaticas.</li>
                <li>Las combinaciones de 4+ y las cascadas multiplican mejor tu puntaje.</li>
                <li>En el nivel 3, rompe obstaculos haciendo matches junto a ellos.</li>
              </ul>
              <div class="gem-score-list">
                ${GEM_META.map(
                  (gem) => `
                    <span>
                      <i class="gem ${gem.cssClass}" aria-hidden="true"></i>
                      ${gem.name}: ${gem.points} pts
                    </span>
                  `
                ).join("")}
              </div>
            </div>
          </section>`
        : ""
    }
  `;
}

function positionKey({ row, col }) {
  return `${row},${col}`;
}
