import assert from "node:assert/strict";
import test from "node:test";
import {
  LEVELS,
  applyMove,
  cloneBoard,
  countBlockers,
  createGame,
  findMatches,
  resolveBoard,
  seededRandom
} from "../src/gameLogic.js";

test("initial boards are complete and do not start with matches", () => {
  for (const level of LEVELS) {
    const game = createGame(level, seededRandom(level.id * 100));
    const matches = findMatches(game.board);

    assert.equal(matches.cells.length, 0);
    assert.equal(game.board.length, level.rows);
    assert.equal(game.board[0].length, level.cols);
    assert.equal(countBlockers(game.board), level.blockers?.length ?? 0);

    for (const row of game.board) {
      for (const cell of row) {
        assert.ok(cell.blocker || Number.isInteger(cell.gem));
      }
    }
  }
});

test("match detection preserves horizontal and vertical groups at intersections", () => {
  const board = boardFromGems([
    [1, 0, 2],
    [0, 0, 0],
    [3, 0, 1]
  ]);

  const matches = findMatches(board);

  assert.equal(matches.groups.length, 2);
  assert.equal(matches.cells.length, 5);
  assert.deepEqual(
    new Set(matches.cells.map(({ row, col }) => `${row},${col}`)),
    new Set(["0,1", "1,0", "1,1", "1,2", "2,1"])
  );
});

test("adjacent swaps without matches are reverted but consume one move", () => {
  const level = {
    ...LEVELS[0],
    rows: 3,
    cols: 3,
    moves: 1,
    gemTypes: 4,
    objective: { type: "score", target: 200 }
  };
  const game = createGame(level, seededRandom(7));
  game.board = boardFromGems([
    [0, 1, 2],
    [1, 2, 3],
    [2, 3, 0]
  ]);
  const initialBoard = cloneBoard(game.board);

  const result = game.swap({ row: 0, col: 0 }, { row: 0, col: 1 });

  assert.equal(result.accepted, false);
  assert.equal(result.consumesMove, true);
  assert.equal(result.reason, "no-match");
  assert.equal(game.movesLeft, 0);
  assert.equal(game.status, "lost");
  assert.deepEqual(game.board, initialBoard);
});

test("non-adjacent selections do not consume moves", () => {
  const game = createGame(1, seededRandom(13));
  const initialMoves = game.movesLeft;

  const result = game.swap({ row: 0, col: 0 }, { row: 2, col: 2 });

  assert.equal(result.accepted, false);
  assert.equal(result.reason, "not-adjacent");
  assert.equal(game.movesLeft, initialMoves);
  assert.equal(game.status, "playing");
});

test("a valid swap scores points, consumes one move and can win a score objective", () => {
  const level = {
    ...LEVELS[0],
    rows: 3,
    cols: 3,
    moves: 5,
    gemTypes: 4,
    objective: { type: "score", target: 18 }
  };
  const game = createGame(level, seededRandom(3));
  game.board = boardFromGems([
    [0, 1, 0],
    [1, 0, 1],
    [2, 3, 2]
  ]);

  const result = applyMove(game, { row: 0, col: 1 }, { row: 1, col: 1 }, seededRandom(9));

  assert.equal(result.accepted, true);
  assert.equal(game.movesLeft, 4);
  assert.ok(game.score >= 18);
  assert.equal(game.status, "won");
});

test("matches next to blockers clear obstacle cells", () => {
  const level = {
    ...LEVELS[2],
    rows: 3,
    cols: 4,
    moves: 5,
    gemTypes: 4,
    objective: { type: "blockers", target: 1 },
    blockers: [{ row: 1, col: 1 }]
  };
  const game = createGame(level, seededRandom(11));
  game.board = [
    [
      { gem: 0, blocker: false },
      { gem: 0, blocker: false },
      { gem: 0, blocker: false },
      { gem: 2, blocker: false }
    ],
    [
      { gem: 1, blocker: false },
      { gem: null, blocker: true },
      { gem: 2, blocker: false },
      { gem: 3, blocker: false }
    ],
    [
      { gem: 2, blocker: false },
      { gem: 3, blocker: false },
      { gem: 1, blocker: false },
      { gem: 0, blocker: false }
    ]
  ];

  const result = resolveBoard(game, seededRandom(5), findMatches(game.board));

  assert.equal(result.blockersCleared, 1);
  assert.equal(countBlockers(game.board), 0);
});

function boardFromGems(rows) {
  return rows.map((row) => row.map((gem) => ({ gem, blocker: false })));
}
