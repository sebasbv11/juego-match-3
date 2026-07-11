import { GEM_META } from "./gameData.js";
import {
  applyGravityAndRefill,
  clearAdjacentBlockers,
  createBoard,
  findMatches,
  swapGems
} from "./board.js";
import { areAdjacent, getLevel, isValidPosition, parsePositionKey, positionKey, updateStatus } from "./gameFunctions.js";

const DIRECTIONS = [
  { row: -1, col: 0 },
  { row: 1, col: 0 },
  { row: 0, col: -1 },
  { row: 0, col: 1 }
];

export function createGame(levelInput = 1, rng = Math.random) {
  const level = typeof levelInput === "number" ? getLevel(levelInput) : levelInput;
  return {
    level,
    board: createBoard(level, rng),
    score: 0,
    movesLeft: level.moves,
    status: "playing",
    collected: {},
    blockersCleared: 0,
    lastResult: null,
    swap(from, to) {
      return applyMove(this, from, to, rng);
    }
  };
}

export function applyMove(game, from, to, rng = Math.random) {
  if (game.status !== "playing") {
    return rejectMove(game, "finished");
  }

  if (!isValidPosition(game.board, from) || !isValidPosition(game.board, to)) {
    return rejectMove(game, "outside-board");
  }

  if (!areAdjacent(from, to)) {
    return rejectMove(game, "not-adjacent");
  }

  const first = game.board[from.row][from.col];
  const second = game.board[to.row][to.col];
  if (first.blocker || second.blocker || first.gem === null || second.gem === null) {
    return rejectMove(game, "blocked");
  }

  swapGems(game.board, from, to);
  const matches = findMatches(game.board);
  game.movesLeft -= 1;

  if (matches.cells.length === 0) {
    swapGems(game.board, from, to);
    updateStatus(game);
    const result = {
      accepted: false,
      consumesMove: true,
      reason: "no-match",
      status: game.status,
      movesLeft: game.movesLeft
    };
    game.lastResult = result;
    return result;
  }

  const resolution = resolveBoard(game, rng, matches);
  updateStatus(game);

  const result = {
    accepted: true,
    from,
    to,
    status: game.status,
    movesLeft: game.movesLeft,
    matchedCells: resolution.clearedCells,
    ...resolution
  };
  game.lastResult = result;
  return result;
}

export function resolveBoard(game, rng = Math.random, initialMatches = findMatches(game.board)) {
  let matches = initialMatches;
  let chain = 0;
  let removed = 0;
  let points = 0;
  let blockersCleared = 0;
  const collected = {};
  const clearedCellKeys = new Set();

  while (matches.cells.length > 0 && chain < 50) {
    chain += 1;

    const gemPoints = matches.cells.reduce(
      (total, cellPosition) => total + (GEM_META[game.board[cellPosition.row][cellPosition.col].gem]?.points ?? 0),
      0
    );

    for (const cellPosition of matches.cells) {
      const cell = game.board[cellPosition.row][cellPosition.col];
      if (!cell.blocker && cell.gem !== null) {
        collected[cell.gem] = (collected[cell.gem] ?? 0) + 1;
        clearedCellKeys.add(positionKey(cellPosition));
        cell.gem = null;
      }
    }

    const removedThisChain = matches.cells.length;
    const longMatchBonus = matches.groups.reduce(
      (total, group) => total + Math.max(0, group.length - 3) * 8,
      0
    );
    const pointsThisChain = gemPoints * chain + longMatchBonus;
    removed += removedThisChain;
    points += pointsThisChain;
    game.score += pointsThisChain;

    blockersCleared += clearAdjacentBlockers(game.board, matches.cells, DIRECTIONS);
    applyGravityAndRefill(game.board, game.level, rng);
    matches = findMatches(game.board);
  }

  for (const [gem, amount] of Object.entries(collected)) {
    game.collected[gem] = (game.collected[gem] ?? 0) + amount;
  }

  game.blockersCleared += blockersCleared;

  return {
    removed,
    points,
    cascades: chain,
    blockersCleared,
    collected,
    clearedCells: Array.from(clearedCellKeys, parsePositionKey)
  };
}

function rejectMove(game, reason) {
  const result = { accepted: false, reason, status: game.status };
  game.lastResult = result;
  return result;
}
