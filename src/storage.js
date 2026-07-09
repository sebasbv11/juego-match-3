import { LEVELS } from "./gameLogic.js";

const STORAGE_KEY = "gemquest-progress-v1";

export function loadProgress() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return createDefaultProgress();
    }
    const parsed = JSON.parse(raw);
    return normalizeProgress(parsed);
  } catch {
    return createDefaultProgress();
  }
}

export function normalizeProgress(progress) {
  return {
    unlockedLevel: Math.min(Math.max(Number(progress?.unlockedLevel) || 1, 1), LEVELS.length),
    bestScores: progress?.bestScores ?? {},
    starsByLevel: progress?.starsByLevel ?? {},
    sound: progress?.sound !== false
  };
}

export function createDefaultProgress() {
  return {
    unlockedLevel: 1,
    bestScores: {},
    starsByLevel: {},
    sound: true
  };
}

export function saveProgress(progress) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
}
