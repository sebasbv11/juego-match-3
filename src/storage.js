import { LEVELS } from "./gameLogic.js";

const STORAGE_KEY = "gemquest-progress-v1";

export function loadProgress() {
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

export function createDefaultProgress() {
  return {
    unlockedLevel: 1,
    bestScores: {},
    sound: true
  };
}

export function saveProgress(progress) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
}
