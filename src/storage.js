import { LEVELS } from "./gameLogic.js";

const STORAGE_KEY = "gemquest-progress-v1";

export function loadProgress(ownerId = "") {
  try {
    const raw = localStorage.getItem(getProgressStorageKey(ownerId));
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

export function saveProgress(progress, ownerId = "") {
  localStorage.setItem(getProgressStorageKey(ownerId), JSON.stringify(progress));
}

export function getProgressStorageKey(ownerId = "") {
  return ownerId ? `${STORAGE_KEY}:${ownerId}` : STORAGE_KEY;
}
