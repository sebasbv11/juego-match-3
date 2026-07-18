import assert from "node:assert/strict";
import test from "node:test";
import { createGame } from "../src/gameLogic.js";
import { renderAuthBar, renderAuthGate } from "../src/auth.js";
import { renderGame, renderLevels } from "../src/views.js";

test("levels render the pirate map with path, treasure and locked future nodes", () => {
  const html = renderLevels({
    unlockedLevel: 1,
    bestScores: { 1: 900 },
    starsByLevel: {},
    sound: true
  });

  assert.match(html, /pirate-level-map/);
  assert.match(html, /map-cloud/);
  assert.match(html, /sand-path/);
  assert.match(html, /treasure-chest/);
  assert.match(html, /node-1 current/);
  assert.match(html, /node-2 locked/);
  assert.match(html, /node-3 locked/);
  assert.match(html, /disabled/);
});

test("completed progress unlocks later map nodes", () => {
  const html = renderLevels({
    unlockedLevel: 3,
    bestScores: {},
    starsByLevel: {},
    sound: true
  });

  assert.match(html, /node-1 complete/);
  assert.match(html, /node-2 complete/);
  assert.match(html, /node-3 current/);
  assert.doesNotMatch(html, /disabled/);
});

test("completed progress opens the map treasure", () => {
  const html = renderLevels({
    unlockedLevel: 3,
    bestScores: {},
    starsByLevel: { 1: 1, 2: 2, 3: 1 },
    sound: true
  });

  assert.match(html, /treasure-chest open/);
  assert.match(html, /tesoro_transparente\.png/);
  assert.match(html, /Tesoro del mapa abierto/);
  assert.match(html, /estrella_transparente\.png/);
  assert.match(html, /node-3 complete/);
});

test("old unlocked progress counts previous levels toward the map treasure", () => {
  const html = renderLevels({
    unlockedLevel: 3,
    bestScores: {},
    starsByLevel: { 3: 1 },
    sound: true
  });

  assert.match(html, /treasure-chest open/);
});

test("missing level completion keeps the map treasure locked", () => {
  const html = renderLevels({
    unlockedLevel: 3,
    bestScores: {},
    starsByLevel: { 1: 3, 2: 2 },
    sound: true
  });

  assert.match(html, /treasure-chest locked/);
  assert.doesNotMatch(html, /Tesoro del mapa abierto/);
});

test("won games render the animated victory overlay", () => {
  const currentGame = createGame(1);
  currentGame.status = "won";
  currentGame.score = 900;
  currentGame.earnedStars = 2;
  currentGame.movesLeft = 4;
  currentGame.previousBestScore = 700;
  currentGame.isNewRecord = true;

  const html = renderGame({
    currentGame,
    selectedCell: null,
    clearingCells: new Set(),
    message: "Nivel completado.",
    lastCombo: 0,
    progress: {
      bestScores: { 1: 900 },
      starsByLevel: { 1: 2 },
      sound: true
    }
  });

  assert.match(html, /victory-overlay/);
  assert.match(html, /confetti/);
  assert.match(html, /Nivel completado/);
  assert.match(html, /Monedas ganadas/);
  assert.match(html, /Puntaje obtenido/);
  assert.match(html, /Progreso del episodio/);
  assert.match(html, /Nuevo record/);
  assert.match(html, /Siguiente: nivel 2/);
  assert.match(html, /Repetir nivel/);
  assert.match(html, /Volver al mapa/);
});

test("game screens can render the quick info guide", () => {
  const currentGame = createGame(1);

  const html = renderGame({
    currentGame,
    selectedCell: null,
    clearingCells: new Set(),
    message: "Selecciona una gema.",
    lastCombo: 0,
    progress: {
      bestScores: {},
      starsByLevel: {},
      sound: true
    },
    infoOpen: true
  });

  assert.match(html, /Guia rapida/);
  assert.match(html, /Valor de gemas/);
  assert.match(html, /Jade/);
  assert.match(html, /12 pts/);
});

test("level screens can render the daily leaderboard window", () => {
  const html = renderLevels(
    {
      unlockedLevel: 3,
      bestScores: {},
      starsByLevel: {},
      sound: true
    },
    {
      leaderboardOpen: true,
      leaderboardLevelId: 2,
      leaderboardState: {
        status: "ready",
        scoreDate: "2026-07-12",
        entries: [
          {
            rank: 1,
            playerName: "Adriel",
            score: 1320,
            stars: 3,
            movesLeft: 5
          }
        ]
      }
    }
  );

  assert.match(html, /Ranking diario/);
  assert.match(html, /Mejores puntajes por nivel/);
  assert.match(html, /aria-selected="true"/);
  assert.match(html, /Adriel/);
  assert.match(html, /1320/);
});

test("leaderboard refresh keeps the table visible while loading", () => {
  const html = renderLevels(
    {
      unlockedLevel: 3,
      bestScores: {},
      starsByLevel: {},
      sound: true
    },
    {
      leaderboardOpen: true,
      leaderboardLevelId: 2,
      leaderboardState: {
        status: "loading",
        scoreDate: "2026-07-12",
        entries: [
          {
            rank: 1,
            playerName: "Adriel",
            score: 1320,
            stars: 3,
            movesLeft: 5
          }
        ]
      }
    }
  );

  assert.match(html, /Actualizando ranking/);
  assert.match(html, /ranking-table/);
  assert.match(html, /Adriel/);
});

test("game screens render swap animation classes", () => {
  const currentGame = createGame(1);

  const invalidHtml = renderGame({
    currentGame,
    selectedCell: null,
    clearingCells: new Set(),
    swapAnimation: {
      type: "invalid",
      from: { row: 0, col: 0 },
      to: { row: 0, col: 1 }
    },
    message: "Movimiento no valido.",
    lastCombo: 0,
    progress: {
      bestScores: {},
      starsByLevel: {},
      sound: true
    }
  });

  assert.match(invalidHtml, /swap-invalid/);
  assert.match(invalidHtml, /--swap-x: 72%/);

  const validHtml = renderGame({
    currentGame,
    selectedCell: null,
    clearingCells: new Set(["0,0"]),
    swapAnimation: {
      type: "valid",
      from: { row: 0, col: 0 },
      to: { row: 0, col: 1 }
    },
    message: "Match.",
    lastCombo: 0,
    progress: {
      bestScores: {},
      starsByLevel: {},
      sound: true
    }
  });

  assert.match(validHtml, /board board-resolving/);
  assert.match(validHtml, /match-burst/);
});

test("lost games render the defeat overlay", () => {
  const currentGame = createGame(1);
  currentGame.status = "lost";
  currentGame.score = 420;
  currentGame.movesLeft = 0;

  const html = renderGame({
    currentGame,
    selectedCell: null,
    clearingCells: new Set(),
    message: "Sin movimientos disponibles.",
    lastCombo: 0,
    progress: {
      bestScores: {},
      starsByLevel: {},
      sound: true
    }
  });

  assert.match(html, /defeat-overlay/);
  assert.match(html, /pirata_sprite\.png/);
  assert.match(html, /Nivel fallido/);
  assert.match(html, /Reintentar nivel/);
  assert.match(html, /Volver al mapa/);
});

test("auth gate prompts for Clerk setup when no publishable key is configured", () => {
  const html = renderAuthGate({ status: "setup-required" });

  assert.match(html, /Configura tu llave publica/);
  assert.match(html, /CLERK_PUBLISHABLE_KEY/);
});

test("signed-in users render account controls", () => {
  const html = renderAuthBar({ firstName: "Adriel" });

  assert.match(html, /Adriel/);
  assert.match(html, /data-auth-action="sign-out"/);
});
