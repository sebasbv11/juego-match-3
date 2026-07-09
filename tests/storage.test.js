import assert from "node:assert/strict";
import test from "node:test";
import { LEVELS } from "../src/gameLogic.js";
import { createDefaultProgress, normalizeProgress } from "../src/storage.js";

test("default progress includes stars by level", () => {
  assert.deepEqual(createDefaultProgress(), {
    unlockedLevel: 1,
    bestScores: {},
    starsByLevel: {},
    sound: true
  });
});

test("old saved progress without stars remains compatible", () => {
  const progress = normalizeProgress({
    unlockedLevel: 2,
    bestScores: { 1: 900 },
    sound: true
  });

  assert.deepEqual(progress, {
    unlockedLevel: 2,
    bestScores: { 1: 900 },
    starsByLevel: {},
    sound: true
  });
});

test("saved progress is clamped to available levels", () => {
  const progress = normalizeProgress({
    unlockedLevel: 999,
    bestScores: {},
    starsByLevel: {},
    sound: false
  });

  assert.equal(progress.unlockedLevel, LEVELS.length);
  assert.equal(progress.sound, false);
});
