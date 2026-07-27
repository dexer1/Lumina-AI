export const UI_ACTION_EVENT = 'lumina:ui-action';

export function openUiAction(type, detail = {}) {
  window.dispatchEvent(new CustomEvent(UI_ACTION_EVENT, {
    detail: { type, ...detail },
  }));
}

export function showUiToast(message, tone = 'default') {
  openUiAction('toast', { message, tone });
}

export function openAssistant(view = 'home', prefill = '') {
  window.dispatchEvent(new CustomEvent('lumina:assistant:open', {
    detail: { view, prefill },
  }));
}

export function openExternal(url) {
  const nextWindow = window.open(url, '_blank', 'noopener,noreferrer');
  if (!nextWindow) window.location.assign(url);
}
