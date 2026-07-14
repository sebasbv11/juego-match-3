const DEFAULT_TIME_ZONE = "America/Guayaquil";
const DEFAULT_LIMIT = 10;

export function createLeaderboardState(overrides = {}) {
  return {
    status: "idle",
    entries: [],
    error: "",
    scoreDate: getDailyScoreDate(),
    ...overrides
  };
}

export async function loadDailyLeaderboard(levelId, options = {}) {
  const scoreDate = options.scoreDate ?? getDailyScoreDate();
  const params = new URLSearchParams({
    levelId: String(Number(levelId) || 1),
    scoreDate,
    limit: String(options.limit ?? DEFAULT_LIMIT)
  });

  const payload = await fetchLeaderboardJson(`/api/leaderboard?${params}`);
  if (payload.status === "unconfigured") {
    return createLeaderboardState({
      status: "unconfigured",
      scoreDate,
      error: "Configura SUPABASE_URL y SUPABASE_PUBLISHABLE_KEY para activar el ranking."
    });
  }

  const entries = normalizeLeaderboardEntries(payload.entries || []);
  return createLeaderboardState({
    status: entries.length ? "ready" : "empty",
    entries,
    scoreDate: payload.scoreDate || scoreDate
  });
}

export async function submitDailyScore(scoreData) {
  const scoreDate = scoreData.scoreDate ?? getDailyScoreDate();
  const payload = await fetchLeaderboardJson("/api/leaderboard", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      scoreDate,
      levelId: Number(scoreData.levelId),
      playerId: String(scoreData.playerId || "anonymous"),
      playerName: sanitizePlayerName(scoreData.playerName),
      score: Math.max(0, Number(scoreData.score) || 0),
      stars: Math.min(3, Math.max(0, Number(scoreData.stars) || 0)),
      movesLeft: Math.max(0, Number(scoreData.movesLeft) || 0)
    })
  });

  if (payload.status === "unconfigured") {
    return { status: "unconfigured", scoreDate };
  }

  return { status: "submitted", scoreDate: payload.scoreDate || scoreDate };
}

export function getDailyScoreDate(date = new Date(), timeZone = DEFAULT_TIME_ZONE) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  }).formatToParts(date);

  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return `${values.year}-${values.month}-${values.day}`;
}

export function normalizeLeaderboardEntries(rows = []) {
  return rows.map((row, index) => ({
    rank: index + 1,
    playerName: sanitizePlayerName(row.player_name),
    score: Math.max(0, Number(row.score) || 0),
    stars: Math.min(3, Math.max(0, Number(row.stars) || 0)),
    movesLeft: Math.max(0, Number(row.moves_left) || 0),
    createdAt: row.created_at ?? ""
  }));
}

export function getPlayerName(user) {
  return sanitizePlayerName(
    user?.firstName ||
      user?.username ||
      user?.primaryEmailAddress?.emailAddress ||
      "Jugador"
  );
}

export function sanitizePlayerName(value) {
  const normalized = String(value || "").trim().replace(/\s+/g, " ");
  return (normalized || "Jugador").slice(0, 40);
}

async function fetchLeaderboardJson(path, options = {}) {
  const response = await fetch(path, {
    cache: "no-store",
    ...options
  });
  const payload = await response.json().catch(() => ({}));

  if (response.status === 503 && payload.status === "unconfigured") {
    return payload;
  }

  if (!response.ok) {
    throw new Error(payload.error || "No se pudo consultar el ranking diario.");
  }

  return payload;
}
