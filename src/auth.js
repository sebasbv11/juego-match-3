const CLERK_BROWSER_SCRIPTS = [
  "/npm/@clerk/clerk-js@6/dist/clerk.browser.js",
  "/node_modules/@clerk/clerk-js/dist/clerk.browser.js",
  "https://cdn.jsdelivr.net/npm/@clerk/clerk-js@6.25.2/dist/clerk.browser.js"
];

const CLERK_UI_SCRIPTS = ["/npm/@clerk/ui@1/dist/ui.browser.js"];

export function createAuthController({ onChange } = {}) {
  const state = {
    status: "loading",
    user: null,
    error: "",
    clerk: null,
    activeForm: null
  };

  async function init() {
    try {
      const publishableKey = await loadPublishableKey();
      if (!publishableKey) {
        state.status = "setup-required";
        onChange?.();
        return;
      }

      await loadClerkUiScript(publishableKey);
      await loadClerkScript(publishableKey);
      state.clerk = await initializeClerk(publishableKey);
      syncState();
      state.clerk.addListener(syncState);
    } catch (error) {
      if (!navigator.onLine) {
        enterOfflineMode();
        return;
      }

      state.status = "error";
      state.error = error instanceof Error ? error.message : "No se pudo iniciar Clerk.";
    } finally {
      onChange?.();
    }
  }

  function syncState() {
    state.user = state.clerk?.user ?? null;
    state.status = state.user ? "signed-in" : "signed-out";
    if (state.status === "signed-in") {
      state.activeForm = null;
    }
    onChange?.();
  }

  function signIn() {
    openHostedAuth("sign-in");
  }

  function signUp() {
    openHostedAuth("sign-up");
  }

  function enterOfflineMode() {
    state.user = { username: "Invitado offline" };
    state.status = "signed-in";
    state.clerk = null;
    state.activeForm = null;
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

  function mountActiveForm(target) {
    if (state.status !== "signed-out" || !state.activeForm || !target || !state.clerk) {
      return;
    }

    showAuthForm(target, state.activeForm);
  }

  function showAuthForm(target, mode) {
    if (!hasClerkUiMethod(mode)) {
      state.error = "Clerk no expuso el formulario de inicio. Revisa que ClerkJS y Clerk UI carguen correctamente.";
      state.status = "error";
      onChange?.();
      return;
    }

    clearAuthForm(target);
    if (mode === "sign-up") {
      state.clerk.mountSignUp(target);
      return;
    }

    state.clerk.mountSignIn(target);
  }

  function hasClerkUiMethod(mode) {
    return mode === "sign-up"
      ? typeof state.clerk?.mountSignUp === "function"
      : typeof state.clerk?.mountSignIn === "function";
  }

  function redirectToHostedAuth(mode) {
    if (mode === "sign-up" && typeof state.clerk?.redirectToSignUp === "function") {
      state.clerk.redirectToSignUp();
      return true;
    }

    if (typeof state.clerk?.redirectToSignIn === "function") {
      state.clerk.redirectToSignIn();
      return true;
    }

    return false;
  }

  function openHostedAuth(mode) {
    if (!state.clerk) {
      return;
    }

    const redirectUrl = window.location.href;
    const options = {
      signInFallbackRedirectUrl: redirectUrl,
      signUpFallbackRedirectUrl: redirectUrl
    };

    if (mode === "sign-up" && typeof state.clerk.redirectToSignUp === "function") {
      state.clerk.redirectToSignUp(options);
      return;
    }

    if (typeof state.clerk.redirectToSignIn === "function") {
      state.clerk.redirectToSignIn(options);
    }
  }

  function clearAuthForm(target) {
    state.clerk?.unmountSignIn?.(target);
    state.clerk?.unmountSignUp?.(target);
    target.replaceChildren();
  }

  return {
    state,
    init,
    signIn,
    signUp,
    signOut,
    mountUserButton,
    mountActiveForm,
    openHostedAuth
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
        ${
          status === "signed-out"
            ? `<div id="clerk-auth-mount" class="clerk-auth-mount"></div>`
            : ""
        }
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

async function loadClerkScript(publishableKey) {
  if (window.Clerk) {
    return;
  }

  for (const source of getClerkScriptSources(publishableKey)) {
    try {
      await appendScript(source, publishableKey);
      if (window.Clerk) {
        return;
      }
    } catch {
      // Try the next official package source.
    }
  }

  throw new Error("No se pudo cargar ClerkJS.");
}

async function loadClerkUiScript(publishableKey) {
  for (const source of getClerkUiScriptSources(publishableKey)) {
    try {
      await appendScript(source, publishableKey);
      return;
    } catch {
      // ClerkJS can still fall back to bundled UI in some versions.
    }
  }
}

function getClerkScriptSources(publishableKey) {
  const frontendApi = getFrontendApiFromPublishableKey(publishableKey);
  const instanceSources = frontendApi
    ? [`https://${frontendApi}/npm/@clerk/clerk-js@6/dist/clerk.browser.js`]
    : [];

  return [
    ...instanceSources,
    ...CLERK_BROWSER_SCRIPTS.map((source) =>
      frontendApi && source.startsWith("/") ? `https://${frontendApi}${source}` : source
    )
  ];
}

function getClerkUiScriptSources(publishableKey) {
  const frontendApi = getFrontendApiFromPublishableKey(publishableKey);
  if (!frontendApi) {
    return [];
  }

  return CLERK_UI_SCRIPTS.map((source) => `https://${frontendApi}${source}`);
}

function getFrontendApiFromPublishableKey(publishableKey) {
  const encodedPayload = publishableKey.replace(/^pk_(test|live)_/, "");
  try {
    return atob(encodedPayload).replace(/\$$/, "");
  } catch {
    return "";
  }
}

async function initializeClerk(publishableKey) {
  if (!window.Clerk) {
    throw new Error("ClerkJS no esta disponible en la ventana.");
  }

  if (typeof window.Clerk === "function") {
    const clerk = new window.Clerk(publishableKey);
    await clerk.load(getClerkLoadOptions());
    return clerk;
  }

  await window.Clerk.load(getClerkLoadOptions());
  return window.Clerk;
}

function getClerkLoadOptions() {
  return window.__internal_ClerkUICtor
    ? { ui: { ClerkUI: window.__internal_ClerkUICtor } }
    : {};
}

function appendScript(source, publishableKey) {
  return new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.async = true;
    script.crossOrigin = "anonymous";
    script.dataset.clerkPublishableKey = publishableKey;
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
