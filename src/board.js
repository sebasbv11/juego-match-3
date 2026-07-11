import { isValidPosition, parsePositionKey, positionKey } from "./gameFunctions.js";

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

export function swapGems(board, from, to) {
  const temp = board[from.row][from.col].gem;
  board[from.row][from.col].gem = board[to.row][to.col].gem;
  board[to.row][to.col].gem = temp;
}

export function clearAdjacentBlockers(board, matchedCells, directions) {
  const cleared = new Set();

  for (const cell of matchedCells) {
    for (const direction of directions) {
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

function addGroup(group, keys, groups) {
  groups.push(group);
  for (const cell of group) {
    keys.add(positionKey(cell));
  }
}
