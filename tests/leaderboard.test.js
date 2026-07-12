import assert from "node:assert/strict";
import test from "node:test";
import {
  getDailyScoreDate,
  normalizeLeaderboardEntries,
  sanitizePlayerName
} from "../src/leaderboard.js";

test("daily leaderboard date uses the Ecuador day key", () => {
  const date = new Date("2026-07-12T03:30:00.000Z");

  assert.equal(getDailyScoreDate(date), "2026-07-11");
});

test("player names are trimmed and clamped for ranking display", () => {
  const longName = `  ${"Jugador ".repeat(10)}  `;

  assert.equal(sanitizePlayerName(""), "Jugador");
  assert.equal(sanitizePlayerName(longName).length, 40);
  assert.equal(sanitizePlayerName("Ana   Maria"), "Ana Maria");
});

test("leaderboard rows are normalized with rank and safe numeric fields", () => {
  const entries = normalizeLeaderboardEntries([
    {
      player_name: "Sebastian",
      score: "1200",
      stars: "3",
      moves_left: "4",
      created_at: "2026-07-12T10:00:00Z"
    },
    {
      player_name: "",
      score: "-5",
      stars: "9",
      moves_left: "-1"
    }
  ]);

  assert.deepEqual(entries[0], {
    rank: 1,
    playerName: "Sebastian",
    score: 1200,
    stars: 3,
    movesLeft: 4,
    createdAt: "2026-07-12T10:00:00Z"
  });
  assert.equal(entries[1].rank, 2);
  assert.equal(entries[1].playerName, "Jugador");
  assert.equal(entries[1].score, 0);
  assert.equal(entries[1].stars, 3);
  assert.equal(entries[1].movesLeft, 0);
});
