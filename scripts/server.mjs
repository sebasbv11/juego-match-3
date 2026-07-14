import http from "node:http";
import { createReadStream } from "node:fs";
import { readFile, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const port = Number(process.env.PORT || process.argv[2] || 4173);
const host = process.env.HOST || "0.0.0.0";

const contentTypes = new Map([
  [".html", "text/html; charset=utf-8"],
  [".css", "text/css; charset=utf-8"],
  [".js", "text/javascript; charset=utf-8"],
  [".mjs", "text/javascript; charset=utf-8"],
  [".json", "application/json; charset=utf-8"],
  [".webmanifest", "application/manifest+json; charset=utf-8"],
  [".md", "text/markdown; charset=utf-8"],
  [".png", "image/png"],
  [".wav", "audio/wav"]
]);

await loadEnvFile(path.join(root, ".env"));

function getClerkPublishableKey() {
  return (
    process.env.CLERK_PUBLISHABLE_KEY ||
    process.env.VITE_CLERK_PUBLISHABLE_KEY ||
    process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY ||
    ""
  );
}

function getSupabaseConfig() {
  return {
    url:
      process.env.SUPABASE_URL ||
      process.env.VITE_SUPABASE_URL ||
      process.env.NEXT_PUBLIC_SUPABASE_URL ||
      "",
    publishableKey:
      process.env.SUPABASE_PUBLISHABLE_KEY ||
      process.env.SUPABASE_ANON_KEY ||
      process.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
      process.env.VITE_SUPABASE_ANON_KEY ||
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
      ""
  };
}

function hasSupabaseConfig() {
  const config = getSupabaseConfig();
  return Boolean(config.url && config.publishableKey);
}

function sendJson(response, statusCode, payload) {
  response.writeHead(statusCode, {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store"
  });
  response.end(JSON.stringify(payload));
}

function getDailyScoreDate(date = new Date(), timeZone = "America/Guayaquil") {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  }).formatToParts(date);

  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return `${values.year}-${values.month}-${values.day}`;
}

function normalizeLevelId(value) {
  const levelId = Number(value);
  return Number.isInteger(levelId) && levelId >= 1 && levelId <= 3 ? levelId : 1;
}

function normalizeLimit(value) {
  const limit = Number(value);
  if (!Number.isInteger(limit)) {
    return 10;
  }

  return Math.min(Math.max(limit, 1), 25);
}

function normalizeScoreDate(value) {
  return /^\d{4}-\d{2}-\d{2}$/.test(String(value || "")) ? String(value) : getDailyScoreDate();
}

function sanitizePlayerName(value) {
  const normalized = String(value || "").trim().replace(/\s+/g, " ");
  return (normalized || "Jugador").slice(0, 40);
}

async function readJsonBody(request) {
  const chunks = [];
  let size = 0;

  for await (const chunk of request) {
    size += chunk.length;
    if (size > 64 * 1024) {
      throw new Error("Request body too large");
    }
    chunks.push(chunk);
  }

  if (!chunks.length) {
    return {};
  }

  return JSON.parse(Buffer.concat(chunks).toString("utf8"));
}

async function requestSupabase(pathname, options = {}) {
  const config = getSupabaseConfig();
  if (!config.url || !config.publishableKey) {
    return { unconfigured: true, data: null };
  }

  const supabaseUrl = `${config.url.replace(/\/$/, "")}${pathname}`;
  const response = await fetch(supabaseUrl, {
    ...options,
    headers: {
      apikey: config.publishableKey,
      Authorization: `Bearer ${config.publishableKey}`,
      Accept: "application/json",
      "Content-Type": "application/json",
      ...(options.headers || {})
    }
  });

  const text = await response.text();
  const data = text ? JSON.parse(text) : null;

  if (!response.ok) {
    const message = data?.message || data?.error || response.statusText;
    throw new Error(message);
  }

  return { unconfigured: false, data };
}

async function handleLeaderboardRequest(request, requestUrl, response) {
  if (!hasSupabaseConfig()) {
    sendJson(response, 503, {
      status: "unconfigured",
      error: "Configura SUPABASE_URL y SUPABASE_PUBLISHABLE_KEY para activar el ranking."
    });
    return;
  }

  if (request.method === "GET") {
    const levelId = normalizeLevelId(requestUrl.searchParams.get("levelId"));
    const scoreDate = normalizeScoreDate(requestUrl.searchParams.get("scoreDate"));
    const limit = normalizeLimit(requestUrl.searchParams.get("limit"));
    const query = new URLSearchParams({
      select: "player_name,score,stars,moves_left,created_at",
      score_date: `eq.${scoreDate}`,
      level_id: `eq.${levelId}`,
      order: "score.desc,stars.desc,moves_left.desc,created_at.asc",
      limit: String(limit)
    });

    const { data } = await requestSupabase(`/rest/v1/gemquest_daily_scores?${query}`);
    sendJson(response, 200, { status: "ready", scoreDate, entries: data || [] });
    return;
  }

  if (request.method === "POST") {
    const body = await readJsonBody(request);
    const scoreDate = normalizeScoreDate(body.scoreDate);
    await requestSupabase("/rest/v1/rpc/submit_gemquest_daily_score", {
      method: "POST",
      body: JSON.stringify({
        p_score_date: scoreDate,
        p_level_id: normalizeLevelId(body.levelId),
        p_player_id: String(body.playerId || "anonymous").slice(0, 128),
        p_player_name: sanitizePlayerName(body.playerName),
        p_score: Math.max(0, Number(body.score) || 0),
        p_stars: Math.min(3, Math.max(0, Number(body.stars) || 0)),
        p_moves_left: Math.max(0, Number(body.movesLeft) || 0)
      })
    });
    sendJson(response, 200, { status: "submitted", scoreDate });
    return;
  }

  sendJson(response, 405, { error: "Method not allowed" });
}

async function loadEnvFile(filePath) {
  try {
    const content = await readFile(filePath, "utf8");
    for (const line of content.split(/\r?\n/)) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#") || !trimmed.includes("=")) {
        continue;
      }

      const [key, ...valueParts] = trimmed.split("=");
      if (process.env[key]) {
        continue;
      }

      process.env[key] = valueParts.join("=").trim().replace(/^['"]|['"]$/g, "");
    }
  } catch (error) {
    if (error.code !== "ENOENT") {
      throw error;
    }
  }
}

function createStaticServer() {
  return http.createServer(async (request, response) => {
    try {
      const requestUrl = new URL(request.url, `http://${request.headers.host}`);
      if (requestUrl.pathname === "/clerk-config.json") {
        response.writeHead(200, {
          "Content-Type": "application/json; charset=utf-8",
          "Cache-Control": "no-store"
        });
        response.end(JSON.stringify({ publishableKey: getClerkPublishableKey() }));
        return;
      }

      if (requestUrl.pathname === "/supabase-config.json") {
        response.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
        response.end("Not found");
        return;
      }

      if (requestUrl.pathname === "/api/leaderboard") {
        await handleLeaderboardRequest(request, requestUrl, response);
        return;
      }

      const pathname = decodeURIComponent(requestUrl.pathname);
      const relativePath = pathname === "/" ? "index.html" : pathname.slice(1);
      const absolutePath = path.resolve(root, relativePath);

      if (!absolutePath.startsWith(root)) {
        response.writeHead(403);
        response.end("Forbidden");
        return;
      }

      const fileStat = await stat(absolutePath);
      const filePath = fileStat.isDirectory() ? path.join(absolutePath, "index.html") : absolutePath;
      await stat(filePath);
      const extension = path.extname(filePath);

      response.writeHead(200, {
        "Content-Type": contentTypes.get(extension) ?? "application/octet-stream",
        "Cache-Control": "no-store"
      });
      createReadStream(filePath).pipe(response);
    } catch {
      response.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
      response.end("Not found");
    }
  });
}

function listenWithFallback(currentPort, attemptsLeft = 10) {
  const server = createStaticServer();

  server.on("error", (error) => {
    if (error.code === "EADDRINUSE" && attemptsLeft > 0) {
      console.log(`Port ${currentPort} is busy, trying ${currentPort + 1}...`);
      listenWithFallback(currentPort + 1, attemptsLeft - 1);
      return;
    }

    console.error(error.message);
    process.exitCode = 1;
  });

  server.listen(currentPort, host, () => {
    console.log(`GemQuest MVP running at http://localhost:${currentPort}`);
  });
}

listenWithFallback(port);
