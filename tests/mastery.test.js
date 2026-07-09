import assert from "node:assert/strict";
import test from "node:test";
import { LEVELS } from "../src/gameLogic.js";
import { calculateStars, mergeBestStars } from "../src/mastery.js";

test("star calculation gives no stars when the level is lost", () => {
  const stars = calculateStars({
    level: LEVELS[0],
    score: 9999,
    movesLeft: LEVELS[0].moves,
    won: false
  });

  assert.equal(stars, 0);
});

test("star calculation awards one, two and three stars by mastery score", () => {
  const level = LEVELS[0];

  assert.equal(calculateStars({ level, score: 780, movesLeft: 0, won: true }), 1);
  assert.equal(calculateStars({ level, score: 975, movesLeft: 0, won: true }), 2);
  assert.equal(calculateStars({ level, score: 1170, movesLeft: 0, won: true }), 3);
});

test("star calculation awards three stars for strong score with good moves left", () => {
  const level = LEVELS[0];

  const stars = calculateStars({
    level,
    score: 975,
    movesLeft: Math.ceil(level.moves * 0.25),
    won: true
  });

  assert.equal(stars, 3);
});

test("best stars never go down", () => {
  assert.equal(mergeBestStars(3, 1), 3);
  assert.equal(mergeBestStars(1, 3), 3);
  assert.equal(mergeBestStars(undefined, 2), 2);
});
