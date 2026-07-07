export const GEM_META = [
  { id: 0, name: "Rubi", cssClass: "gem-red" },
  { id: 1, name: "Esmeralda", cssClass: "gem-green" },
  { id: 2, name: "Zafiro", cssClass: "gem-blue" },
  { id: 3, name: "Ambar", cssClass: "gem-amber" },
  { id: 4, name: "Amatista", cssClass: "gem-violet" },
  { id: 5, name: "Jade", cssClass: "gem-jade" }
];

export const LEVELS = [
  {
    id: 1,
    name: "Brillo inicial",
    summary: "Alcanza la puntuacion meta.",
    rows: 8,
    cols: 8,
    gemTypes: 5,
    moves: 22,
    objective: { type: "score", target: 700 }
  },
  {
    id: 2,
    name: "Cosecha azul",
    summary: "Elimina zafiros suficientes.",
    rows: 8,
    cols: 8,
    gemTypes: 6,
    moves: 24,
    objective: { type: "collect", gem: 2, target: 18 }
  },
  {
    id: 3,
    name: "Ruinas bloqueadas",
    summary: "Rompe todos los obstaculos.",
    rows: 8,
    cols: 8,
    gemTypes: 6,
    moves: 28,
    objective: { type: "blockers", target: 8 },
    blockers: [
      { row: 2, col: 3 },
      { row: 2, col: 4 },
      { row: 3, col: 2 },
      { row: 3, col: 5 },
      { row: 4, col: 2 },
      { row: 4, col: 5 },
      { row: 5, col: 3 },
      { row: 5, col: 4 }
    ]
  }
];

const DIRECTIONS = [
  { row: -1, col: 0 },
  { row: 1, col: 0 },
  { row: 0, col: -1 },
  { row: 0, col: 1 }
];

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

export function createBoard(level, rng = Math.random) {
  const blockerKeys = new Set((level.blockers ?? []).map(positionKey));
  const board = Array.from({ length: level.rows }, (_, row) =>
    Array.from({ length: level.cols }, (_, col) => ({
      gem: null,
      blocker: blockerKeys.has(positionKey({ row, col }))
    }))
  );

  for (let row = 0; row < level.rows; row += 1) {
    for (let col = 0; col < level.cols; col += 1) {
      if (!board[row][col].blocker) {
        board[row][col].gem = randomGemWithoutOpeningMatch(board, level, row, col, rng);
      }
    }
  }

  return board;
}

function randomGemWithoutOpeningMatch(board, level, row, col, rng) {
  let fallback = 0;
  for (let attempt = 0; attempt < 80; attempt += 1) {
    const gem = randomGem(level, rng);
    fallback = gem;
    if (!wouldCreateOpeningMatch(board, row, col, gem)) {
      return gem;
    }
  }

  for (let gem = 0; gem < level.gemTypes; gem += 1) {
    if (!wouldCreateOpeningMatch(board, row, col, gem)) {
      return gem;
    }
  }

  return fallback;
}

function wouldCreateOpeningMatch(board, row, col, gem) {
  const leftOne = board[row]?.[col - 1];
  const leftTwo = board[row]?.[col - 2];
  const upOne = board[row - 1]?.[col];
  const upTwo = board[row - 2]?.[col];

  const horizontal =
    leftOne &&
    leftTwo &&
    !leftOne.blocker &&
    !leftTwo.blocker &&
    leftOne.gem === gem &&
    leftTwo.gem === gem;

  const vertical =
    upOne &&
    upTwo &&
    !upOne.blocker &&
    !upTwo.blocker &&
    upOne.gem === gem &&
    upTwo.gem === gem;

  return horizontal || vertical;
}

function randomGem(level, rng) {
  return Math.floor(rng() * level.gemTypes);
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

  if (matches.cells.length === 0) {
    swapGems(game.board, from, to);
    return rejectMove(game, "no-match");
  }

  game.movesLeft -= 1;
  const resolution = resolveBoard(game, rng, matches);
  updateStatus(game);

  const result = {
    accepted: true,
    from,
    to,
    status: game.status,
    movesLeft: game.movesLeft,
    ...resolution
  };
  game.lastResult = result;
  return result;
}

function rejectMove(game, reason) {
  const result = { accepted: false, reason, status: game.status };
  game.lastResult = result;
  return result;
}

function swapGems(board, from, to) {
  const temp = board[from.row][from.col].gem;
  board[from.row][from.col].gem = board[to.row][to.col].gem;
  board[to.row][to.col].gem = temp;
}

export function resolveBoard(game, rng = Math.random, initialMatches = findMatches(game.board)) {
  let matches = initialMatches;
  let chain = 0;
  let removed = 0;
  let points = 0;
  let blockersCleared = 0;
  const collected = {};

  while (matches.cells.length > 0 && chain < 50) {
    chain += 1;

    for (const cellPosition of matches.cells) {
      const cell = game.board[cellPosition.row][cellPosition.col];
      if (!cell.blocker && cell.gem !== null) {
        collected[cell.gem] = (collected[cell.gem] ?? 0) + 1;
        cell.gem = null;
      }
    }

    const removedThisChain = matches.cells.length;
    const longMatchBonus = matches.groups.reduce(
      (total, group) => total + Math.max(0, group.length - 3) * 15,
      0
    );
    const pointsThisChain = removedThisChain * 10 * chain + longMatchBonus;
    removed += removedThisChain;
    points += pointsThisChain;
    game.score += pointsThisChain;

    blockersCleared += clearAdjacentBlockers(game.board, matches.cells);
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
    collected
  };
}

function clearAdjacentBlockers(board, matchedCells) {
  const cleared = new Set();

  for (const cell of matchedCells) {
    for (const direction of DIRECTIONS) {
      const neighbor = { row: cell.row + direction.row, col: cell.col + direction.col };
      if (isValidPosition(board, neighbor) && board[neighbor.row][neighbor.col].blocker) {
        cleared.add(positionKey(neighbor));
      }
    }
  }

  for (const key of cleared) {
    const { row, col } = parsePositionKey(key);
    board[row][col].blocker = false;
    board[row][col].gem = null;
  }

  return cleared.size;
}

export function applyGravityAndRefill(board, level, rng = Math.random) {
  for (let col = 0; col < level.cols; col += 1) {
    let segmentEnd = level.rows - 1;

    for (let row = level.rows - 1; row >= -1; row -= 1) {
      const reachedTop = row < 0;
      const reachedBlocker = !reachedTop && board[row][col].blocker;

      if (reachedTop || reachedBlocker) {
        const segmentStart = row + 1;
        refillSegment(board, level, segmentStart, segmentEnd, col, rng);
        segmentEnd = row - 1;
      }
    }
  }
}

function refillSegment(board, level, startRow, endRow, col, rng) {
  if (startRow > endRow) {
    return;
  }

  const gems = [];
  for (let row = endRow; row >= startRow; row -= 1) {
    if (!board[row][col].blocker && board[row][col].gem !== null) {
      gems.push(board[row][col].gem);
    }
  }

  for (let row = endRow; row >= startRow; row -= 1) {
    if (board[row][col].blocker) {
      continue;
    }
    board[row][col].gem = gems.length > 0 ? gems.shift() : randomGem(level, rng);
  }
}

export function findMatches(board) {
  const rows = board.length;
  const cols = board[0]?.length ?? 0;
  const keys = new Set();
  const groups = [];

  for (let row = 0; row < rows; row += 1) {
    let col = 0;
    while (col < cols) {
      const cell = board[row][col];
      if (cell.blocker || cell.gem === null) {
        col += 1;
        continue;
      }

      const group = [{ row, col }];
      let nextCol = col + 1;
      while (
        nextCol < cols &&
        !board[row][nextCol].blocker &&
        board[row][nextCol].gem === cell.gem
      ) {
        group.push({ row, col: nextCol });
        nextCol += 1;
      }

      if (group.length >= 3) {
        addGroup(group, keys, groups);
      }
      col = nextCol;
    }
  }

  for (let col = 0; col < cols; col += 1) {
    let row = 0;
    while (row < rows) {
      const cell = board[row][col];
      if (cell.blocker || cell.gem === null) {
        row += 1;
        continue;
      }

      const group = [{ row, col }];
      let nextRow = row + 1;
      while (
        nextRow < rows &&
        !board[nextRow][col].blocker &&
        board[nextRow][col].gem === cell.gem
      ) {
        group.push({ row: nextRow, col });
        nextRow += 1;
      }

      if (group.length >= 3) {
        addGroup(group, keys, groups);
      }
      row = nextRow;
    }
  }

  return {
    keys,
    cells: Array.from(keys, parsePositionKey),
    groups
  };
}

function addGroup(group, keys, groups) {
  groups.push(group);
  for (const cell of group) {
    keys.add(positionKey(cell));
  }
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

function positionKey({ row, col }) {
  return `${row},${col}`;
}

function parsePositionKey(key) {
  const [row, col] = key.split(",").map(Number);
  return { row, col };
}
