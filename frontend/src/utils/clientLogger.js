/**
 * clientLogger — capture les erreurs frontend et les envoie au backend (Winston)
 *
 * Intercepte :
 *  - console.error(...)
 *  - window.onerror (erreurs JS non catchées)
 *  - window.onunhandledrejection (promesses rejetées)
 *
 * Les logs sont écrits dans backend/logs/error.log et combined.log
 */

const BACKEND_LOG_URL = '/api/logs';

// Délai minimum entre deux envois identiques (évite le spam)
const DEBOUNCE_MS = 1000;
const _recentMessages = new Map();

function shouldSkip(message) {
  // Ignorer les erreurs d'extensions Chrome (non liées à l'app)
  if (message?.includes('runtime.lastError')) return true;
  if (message?.includes('message port closed')) return true;
  if (message?.includes('Extension context invalidated')) return true;
  return false;
}

function sendToBackend(level, message, stack = null, metadata = {}) {
  if (!message || shouldSkip(message)) return;

  // Dédoublonnage simple
  const key = `${level}:${message}`;
  const last = _recentMessages.get(key);
  if (last && Date.now() - last < DEBOUNCE_MS) return;
  _recentMessages.set(key, Date.now());

  const payload = {
    level,
    message: String(message),
    source: 'frontend',
    stack: stack || undefined,
    metadata: {
      url: window.location.href,
      ...metadata,
    },
  };

  // Utilise sendBeacon si dispo (fonctionne même lors du unload)
  const body = JSON.stringify(payload);
  if (navigator.sendBeacon) {
    const blob = new Blob([body], { type: 'application/json' });
    navigator.sendBeacon(BACKEND_LOG_URL, blob);
  } else {
    fetch(BACKEND_LOG_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body,
      keepalive: true,
    }).catch(() => {
      // Silencieux : on ne veut pas boucler sur une erreur du logger lui-même
    });
  }
}

/**
 * Initialise les intercepteurs globaux.
 * À appeler une seule fois dans main.jsx
 */
export function initClientLogger() {
  // 1. Intercepter console.error
  const _originalError = console.error.bind(console);
  console.error = (...args) => {
    _originalError(...args);
    const message = args.map((a) => (a instanceof Error ? a.message : String(a))).join(' ');
    const stack = args.find((a) => a instanceof Error)?.stack || null;
    sendToBackend('error', message, stack);
  };

  // 2. Erreurs JS globales non catchées
  window.onerror = (message, source, lineno, colno, error) => {
    sendToBackend('error', String(message), error?.stack || null, {
      file: source,
      line: lineno,
      col: colno,
    });
    return false; // Ne pas supprimer le comportement par défaut
  };

  // 3. Promesses rejetées non catchées
  window.addEventListener('unhandledrejection', (event) => {
    const reason = event.reason;
    const message = reason instanceof Error ? reason.message : String(reason);
    const stack = reason instanceof Error ? reason.stack : null;
    sendToBackend('error', `Unhandled rejection: ${message}`, stack);
  });
}

/**
 * API publique pour logger manuellement depuis n'importe quel composant
 */
export const clientLogger = {
  error: (message, metadata = {}) => sendToBackend('error', message, null, metadata),
  warn: (message, metadata = {}) => sendToBackend('warn', message, null, metadata),
  info: (message, metadata = {}) => sendToBackend('info', message, null, metadata),
};

export default clientLogger;
