const CLERK_BROWSER_SCRIPTS = [
  "/node_modules/@clerk/clerk-js/dist/clerk.browser.js",
  "https://cdn.jsdelivr.net/npm/@clerk/clerk-js@6.25.2/dist/clerk.browser.js"
];

export function createAuthController({ onChange } = {}) {
  const state = {
    status: "loading",
    user: null,
    error: "",
    clerk: null
  };

  async function init() {
    try {
      const publishableKey = await loadPublishableKey();
      if (!publishableKey) {
        state.status = "setup-required";
        onChange?.();
        return;
      }

      await loadClerkScript();
      state.clerk = new window.Clerk(publishableKey);
      await state.clerk.load();
      syncState();
      state.clerk.addListener(syncState);
    } catch (error) {
      state.status = "error";
      state.error = error instanceof Error ? error.message : "No se pudo iniciar Clerk.";
    } finally {
      onChange?.();
    }
  }

  function syncState() {
    state.user = state.clerk?.user ?? null;
    state.status = state.user ? "signed-in" : "signed-out";
    onChange?.();
  }

  function signIn() {
    state.clerk?.openSignIn();
  }

  function signUp() {
    state.clerk?.openSignUp();
  }

  async function signOut() {
    await state.clerk?.signOut();
    syncState();
  }

  function mountUserButton(target) {
    if (state.status === "signed-in" && target && state.clerk) {
      state.clerk.mountUserButton(target);
    }
  }

  return {
    state,
    init,
    signIn,
    signUp,
    signOut,
    mountUserButton
  };
}

export function renderAuthGate({ status, error }) {
  if (status === "loading") {
    return `
      <section class="auth-gate">
        <div class="auth-panel">
          <p class="eyebrow">Autenticacion</p>
          <h1>Preparando acceso...</h1>
          <p>Conectando GemQuest con Clerk.</p>
        </div>
      </section>
    `;
  }

  if (status === "setup-required") {
    return `
      <section class="auth-gate">
        <div class="auth-panel">
          <p class="eyebrow">Clerk</p>
          <h1>Configura tu llave publica</h1>
          <p>Define CLERK_PUBLISHABLE_KEY en tu entorno y reinicia el servidor local.</p>
        </div>
      </section>
    `;
  }

  if (status === "error") {
    return `
      <section class="auth-gate">
        <div class="auth-panel">
          <p class="eyebrow">Clerk</p>
          <h1>No se pudo iniciar sesion</h1>
          <p>${escapeHtml(error || "Revisa la configuracion de Clerk.")}</p>
        </div>
      </section>
    `;
  }

  return `
    <section class="auth-gate">
      <div class="auth-panel">
        <p class="eyebrow">GemQuest</p>
        <h1>Entra para jugar</h1>
        <p>Inicia sesion o crea una cuenta para guardar tu progreso.</p>
        <div class="auth-actions">
          <button class="primary-button" data-auth-action="sign-in">Iniciar sesion</button>
          <button class="secondary-button" data-auth-action="sign-up">Crear cuenta</button>
        </div>
      </div>
    </section>
  `;
}

export function renderAuthBar(user) {
  const name = user?.firstName || user?.username || user?.primaryEmailAddress?.emailAddress || "Jugador";
  return `
    <aside class="auth-bar" aria-label="Cuenta">
      <span>${escapeHtml(name)}</span>
      <div id="clerk-user-button" class="clerk-user-button"></div>
      <button class="quiet-button" data-auth-action="sign-out">Salir</button>
    </aside>
  `;
}

async function loadPublishableKey() {
  const response = await fetch("/clerk-config.json", { cache: "no-store" });
  if (!response.ok) {
    throw new Error("No se pudo leer la configuracion publica de Clerk.");
  }

  const config = await response.json();
  return config.publishableKey;
}

async function loadClerkScript() {
  if (window.Clerk) {
    return;
  }

  for (const source of CLERK_BROWSER_SCRIPTS) {
    try {
      await appendScript(source);
      return;
    } catch {
      // Try the next official package source.
    }
  }

  throw new Error("No se pudo cargar ClerkJS.");
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

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}
