import assert from "node:assert/strict";
import test from "node:test";
import { createGame } from "../src/gameLogic.js";
import { renderGame } from "../src/views.js";

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
