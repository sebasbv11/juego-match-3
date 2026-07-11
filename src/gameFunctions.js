import { GEM_META, LEVELS } from "./gameData.js";

export function seededRandom(seed = 123456789) {
  let value = seed >>> 0;
  return () => {
    value += 0x6d2b79f5;
    let t = value;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function getLevel(levelId) {
  const level = LEVELS.find((item) => item.id === Number(levelId));
  if (!level) {
    throw new Error(`Level ${levelId} does not exist`);
  }
  return level;
}

export function areAdjacent(first, second) {
  return Math.abs(first.row - second.row) + Math.abs(first.col - second.col) === 1;
}

export function isValidPosition(board, position) {
  return (
    Number.isInteger(position?.row) &&
    Number.isInteger(position?.col) &&
    position.row >= 0 &&
    position.col >= 0 &&
    position.row < board.length &&
    position.col < (board[0]?.length ?? 0)
  );
}

export function isObjectiveComplete(game) {
  const { objective } = game.level;

  if (objective.type === "score") {
    return game.score >= objective.target;
  }

  if (objective.type === "collect") {
    return (game.collected[objective.gem] ?? 0) >= objective.target;
  }

  if (objective.type === "blockers") {
    return game.blockersCleared >= objective.target || countBlockers(game.board) === 0;
  }

  return false;
}

export function updateStatus(game) {
  if (isObjectiveComplete(game)) {
    game.status = "won";
    return game.status;
  }

  if (game.movesLeft <= 0) {
    game.status = "lost";
    return game.status;
  }

  game.status = "playing";
  return game.status;
}

export function getObjectiveProgress(game) {
  const { objective } = game.level;
  if (objective.type === "score") {
    return {
      current: Math.min(game.score, objective.target),
      target: objective.target,
      label: `Puntuacion ${Math.min(game.score, objective.target)} / ${objective.target}`
    };
  }

  if (objective.type === "collect") {
    const current = game.collected[objective.gem] ?? 0;
    return {
      current: Math.min(current, objective.target),
      target: objective.target,
      label: `${GEM_META[objective.gem].name} ${Math.min(current, objective.target)} / ${objective.target}`
    };
  }

  const current = game.blockersCleared;
  return {
    current: Math.min(current, objective.target),
    target: objective.target,
    label: `Obstaculos ${Math.min(current, objective.target)} / ${objective.target}`
  };
}

export function describeObjective(level) {
  const { objective } = level;
  if (objective.type === "score") {
    return `Logra ${objective.target} puntos`;
  }
  if (objective.type === "collect") {
    return `Elimina ${objective.target} gemas ${GEM_META[objective.gem].name}`;
  }
  return `Rompe ${objective.target} obstaculos`;
}

export function countBlockers(board) {
  return board.flat().filter((cell) => cell.blocker).length;
}

export function cloneBoard(board) {
  return board.map((row) => row.map((cell) => ({ ...cell })));
}

export function positionKey({ row, col }) {
  return `${row},${col}`;
}

export function parsePositionKey(key) {
  const [row, col] = key.split(",").map(Number);
  return { row, col };
}
