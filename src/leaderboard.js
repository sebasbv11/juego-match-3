const SUPABASE_SCRIPT_SOURCES = [
  "/node_modules/@supabase/supabase-js/dist/umd/supabase.js",
  "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.49.8/dist/umd/supabase.js"
];

const LEADERBOARD_TABLE = "gemquest_daily_scores";
const DEFAULT_TIME_ZONE = "America/Guayaquil";
const DEFAULT_LIMIT = 10;

let supabaseClientPromise = null;

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
  const client = await getSupabaseClient();

  if (!client) {
    return createLeaderboardState({
      status: "unconfigured",
      scoreDate,
      error: "Configura SUPABASE_URL y SUPABASE_PUBLISHABLE_KEY para activar el ranking."
    });
  }

  const { data, error } = await client
    .from(LEADERBOARD_TABLE)
    .select("player_name, score, stars, moves_left, created_at")
    .eq("score_date", scoreDate)
    .eq("level_id", Number(levelId))
    .order("score", { ascending: false })
    .order("stars", { ascending: false })
    .order("moves_left", { ascending: false })
    .order("created_at", { ascending: true })
    .limit(options.limit ?? DEFAULT_LIMIT);

  if (error) {
    throw new Error(error.message);
  }

  const entries = normalizeLeaderboardEntries(data);
  return createLeaderboardState({
    status: entries.length ? "ready" : "empty",
    entries,
    scoreDate
  });
}

export async function submitDailyScore(scoreData) {
  const client = await getSupabaseClient();
  const scoreDate = scoreData.scoreDate ?? getDailyScoreDate();

  if (!client) {
    return { status: "unconfigured", scoreDate };
  }

  const { error } = await client.rpc("submit_gemquest_daily_score", {
    p_score_date: scoreDate,
    p_level_id: Number(scoreData.levelId),
    p_player_id: String(scoreData.playerId || "anonymous"),
    p_player_name: sanitizePlayerName(scoreData.playerName),
    p_score: Math.max(0, Number(scoreData.score) || 0),
    p_stars: Math.min(3, Math.max(0, Number(scoreData.stars) || 0)),
    p_moves_left: Math.max(0, Number(scoreData.movesLeft) || 0)
  });

  if (error) {
    throw new Error(error.message);
  }

  return { status: "submitted", scoreDate };
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

async function getSupabaseClient() {
  if (!supabaseClientPromise) {
    supabaseClientPromise = createSupabaseClient();
  }

  return supabaseClientPromise;
}

async function createSupabaseClient() {
  const config = await loadSupabaseConfig();
  if (!config.url || !config.publishableKey) {
    return null;
  }

  await loadSupabaseScript();
  const factory = globalThis.supabase?.createClient;
  if (typeof factory !== "function") {
    throw new Error("Supabase JS no esta disponible en el navegador.");
  }

  return factory(config.url, config.publishableKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false
    }
  });
}

async function loadSupabaseConfig() {
  const response = await fetch("/supabase-config.json", { cache: "no-store" });
  if (!response.ok) {
    throw new Error("No se pudo leer la configuracion publica de Supabase.");
  }

  return response.json();
}

async function loadSupabaseScript() {
  if (globalThis.supabase?.createClient) {
    return;
  }

  for (const source of SUPABASE_SCRIPT_SOURCES) {
    try {
      await appendScript(source);
      if (globalThis.supabase?.createClient) {
        return;
      }
    } catch {
      // Try the next source.
    }
  }

  throw new Error("No se pudo cargar Supabase JS.");
}

function appendScript(source) {
  return new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.async = true;
    script.crossOrigin = "anonymous";
    script.src = source;
    script.addEventListener("load", resolve, { once: true });
    script.addEventListener("error", reject, { once: true });
    document.head.append(script);
  });
}
