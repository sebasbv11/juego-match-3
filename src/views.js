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
  const campaignComplete = LEVELS.every((level) => isLevelComplete(level, progress));

  return `
    <section class="level-view">
      <header class="screen-header">
        <button class="secondary-button" data-action="home">Inicio</button>
        <div>
          <p class="eyebrow">Seleccion</p>
          <h1>Niveles</h1>
        </div>
      </header>
      <div class="pirate-level-map" aria-label="Mapa pirata de niveles">
        <span class="map-cloud cloud-one" aria-hidden="true"></span>
        <span class="map-cloud cloud-two" aria-hidden="true"></span>
        <span class="map-cloud cloud-three" aria-hidden="true"></span>
        <svg class="map-path" viewBox="0 0 900 1600" aria-hidden="true" focusable="false">
          <path class="sand-path" d="M510 0 C210 180 700 325 375 510 C105 665 715 800 455 965 C190 1130 690 1290 340 1600" />
          <path class="path-rim" d="M510 0 C210 180 700 325 375 510 C105 665 715 800 455 965 C190 1130 690 1290 340 1600" />
        </svg>
        <span class="map-decor palm palm-left" aria-hidden="true"></span>
        <span class="map-decor palm palm-right" aria-hidden="true"></span>
        <span class="map-decor barrel barrel-left" aria-hidden="true"></span>
        <span class="map-decor barrel barrel-right" aria-hidden="true"></span>
        <span class="map-decor skull-rock rock-left" aria-hidden="true"></span>
        <span class="map-decor skull-rock rock-right" aria-hidden="true"></span>
        <span class="map-decor rope rope-left" aria-hidden="true"></span>
        <span class="map-decor rope rope-right" aria-hidden="true"></span>
        <span class="treasure-chest ${campaignComplete ? "open" : "locked"}" aria-hidden="true">
          <span class="closed-chest"><i></i></span>
          <img class="open-chest" src="./assets/tesoro_transparente.png" alt="" />
          <span class="chest-stars">
            <i></i><i></i><i></i>
          </span>
        </span>
        ${LEVELS.map((level) => renderLevelButton(level, progress)).join("")}
      </div>
      ${
        campaignComplete
          ? `<div class="final-reward">
              <img src="./assets/estrella_transparente.png" alt="" aria-hidden="true" />
              <span>
                <small>Tesoro del mapa abierto</small>
                <strong>Recompensa: 150 monedas, gemas y estrellas</strong>
              </span>
            </div>`
          : ""
      }
      <div class="footer-actions">
        <button class="secondary-button" data-action="reset-progress">Reiniciar progreso</button>
      </div>
    </section>
    ${renderInfoHelp(infoOpen)}
  `;
}

export function renderGame({
  currentGame,
  selectedCell,
  clearingCells,
  swapAnimation = null,
  message,
  lastCombo,
  progress,
  infoOpen = false
}) {
  const progressData = getObjectiveProgress(currentGame);
  const progressPercent = Math.round((progressData.current / progressData.target) * 100);
  const bestScore = progress.bestScores[currentGame.level.id] ?? 0;
  const bestStars = progress.starsByLevel[currentGame.level.id] ?? 0;
  const victoryOverlay =
    currentGame.status === "won" ? renderVictoryOverlay(currentGame, bestStars) : "";
  const defeatOverlay =
    currentGame.status === "lost" ? renderDefeatOverlay(currentGame, progressData) : "";

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
            class="board ${swapAnimation?.type === "valid" ? "board-resolving" : ""}"
            style="--rows: ${currentGame.level.rows}; --cols: ${currentGame.level.cols};"
            aria-label="Tablero de gemas"
          >
            ${renderBoard(currentGame, selectedCell, clearingCells, swapAnimation)}
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
        </aside>
      </section>
      ${victoryOverlay}
      ${defeatOverlay}
    </section>
    ${renderInfoHelp(infoOpen)}
  `;
}

function renderLevelButton(level, progress) {
  const locked = level.id > progress.unlockedLevel;
  const bestScore = progress.bestScores[level.id] ?? 0;
  const stars = progress.starsByLevel[level.id] ?? 0;
  const mapState = locked ? "locked" : isLevelComplete(level, progress) ? "complete" : "current";
  const icon = locked ? "" : mapState === "current" && level.id === 2 ? "" : level.id === 3 ? "2" : "";
  const stateCopy = locked ? "Bloqueado" : mapState === "complete" ? "Completado" : "Jugar";
  return `
    <button
      class="map-node node-${level.id} ${mapState}"
      data-action="start-level"
      data-level="${level.id}"
      ${locked ? "disabled" : ""}
      aria-label="Nivel ${level.id}: ${level.name}. ${stateCopy}. Record ${bestScore}. Maestria ${stars} de 3"
    >
      <span class="node-ring" aria-hidden="true"></span>
      <span class="node-icon" aria-hidden="true">${icon}</span>
      <span class="node-caption">${level.name}</span>
    </button>
  `;
}

function isLevelComplete(level, progress) {
  return (progress.starsByLevel[level.id] ?? 0) > 0 || level.id < progress.unlockedLevel;
}

function renderBoard(currentGame, selectedCell, clearingCells, swapAnimation) {
  return currentGame.board
    .flatMap((row, rowIndex) =>
      row.map((cell, colIndex) =>
        renderCell(currentGame, selectedCell, clearingCells, swapAnimation, cell, rowIndex, colIndex)
      )
    )
    .join("");
}

function renderCell(currentGame, selectedCell, clearingCells, swapAnimation, cell, rowIndex, colIndex) {
  const selected = selectedCell && selectedCell.row === rowIndex && selectedCell.col === colIndex;
  const clearing = clearingCells.has(positionKey({ row: rowIndex, col: colIndex }));
  const swapState = getSwapState(swapAnimation, rowIndex, colIndex);
  const disabled = currentGame.status !== "playing" || cell.blocker;
  const label = cell.blocker
    ? `Obstaculo en fila ${rowIndex + 1}, columna ${colIndex + 1}`
    : `${GEM_META[cell.gem].name} en fila ${rowIndex + 1}, columna ${colIndex + 1}`;

  return `
    <button
      class="cell ${selected ? "selected" : ""} ${clearing ? "clearing" : ""} ${swapState.className} ${cell.blocker ? "blocker" : ""}"
      data-cell
      data-row="${rowIndex}"
      data-col="${colIndex}"
      aria-label="${label}"
      ${swapState.style}
      ${disabled ? "disabled" : ""}
    >
      ${
        cell.blocker
          ? `<span class="blocker-mark" aria-hidden="true"></span>`
          : `<span class="gem ${GEM_META[cell.gem].cssClass}" aria-hidden="true"></span>${clearing ? `<span class="match-burst" aria-hidden="true"></span>` : ""}`
      }
    </button>
  `;
}

function getSwapState(swapAnimation, row, col) {
  if (swapAnimation?.type !== "invalid") {
    return { className: "", style: "" };
  }

  const current = { row, col };
  const isFrom = samePosition(current, swapAnimation.from);
  const isTo = samePosition(current, swapAnimation.to);
  if (!isFrom && !isTo) {
    return { className: "", style: "" };
  }

  const direction = isFrom
    ? {
        row: swapAnimation.to.row - swapAnimation.from.row,
        col: swapAnimation.to.col - swapAnimation.from.col
      }
    : {
        row: swapAnimation.from.row - swapAnimation.to.row,
        col: swapAnimation.from.col - swapAnimation.to.col
      };

  return {
    className: "swap-invalid",
    style: `style="--swap-x: ${direction.col * 72}%; --swap-y: ${direction.row * 72}%"`
  };
}

function samePosition(first, second) {
  return first.row === second.row && first.col === second.col;
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
        <img class="pirate-host" src="./assets/pirata.png" alt="" aria-hidden="true" />
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

function renderDefeatOverlay(currentGame, progressData) {
  const progressPercent = Math.round((progressData.current / progressData.target) * 100);

  return `
    <section class="defeat-overlay" aria-label="Derrota">
      <div class="defeat-card">
        <img class="defeat-pirate" src="./assets/pirata_sprite.png" alt="" aria-hidden="true" />
        <div class="defeat-content">
          <p class="defeat-badge">Sin movimientos</p>
          <h2>Nivel fallido</h2>
          <p class="defeat-copy">Te quedaste cerca. Ajusta tu estrategia y vuelve por el tesoro.</p>
          <div class="defeat-stats">
            <span>
              <small>Puntaje obtenido</small>
              <strong>${currentGame.score}</strong>
            </span>
            <span>
              <small>Objetivo</small>
              <strong>${progressData.label}</strong>
            </span>
          </div>
          <div class="defeat-progress">
            <div>
              <small>Progreso del objetivo</small>
              <strong>${progressPercent}%</strong>
            </div>
            <span><i style="width: ${progressPercent}%"></i></span>
          </div>
          <div class="defeat-actions">
            <button class="primary-button defeat-retry" data-action="retry">Reintentar nivel</button>
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
              <ul class="guide-steps">
                <li>Intercambia gemas vecinas para formar lineas de 3 o mas.</li>
                <li>Cada intento adyacente consume 1 movimiento, aunque no haga match.</li>
                <li>Los combos aparecen cuando una jugada causa cascadas automaticas.</li>
                <li>Las combinaciones de 4+ y las cascadas multiplican mejor tu puntaje.</li>
                <li>En el nivel 3, rompe obstaculos haciendo matches junto a ellos.</li>
              </ul>
              <p class="gem-score-title">Valor de gemas</p>
              <div class="gem-score-list">
                ${GEM_META.map(
                  (gem) => `
                    <span>
                      <i class="gem ${gem.cssClass}" aria-hidden="true"></i>
                      <strong>${gem.name}</strong>
                      <small>${gem.points} pts</small>
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
