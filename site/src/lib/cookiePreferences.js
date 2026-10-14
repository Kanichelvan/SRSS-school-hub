export const COOKIE_PREFERENCES_KEY = 'srss.cookiePreferences.v1';
export const COOKIE_PREFERENCES_AGE = 180 * 24 * 60 * 60 * 1000;

export function preferenceRecord(choices, now = Date.now()) {
  return { version: 1, functional: choices.functional === true, externalMedia: choices.externalMedia === true, savedAt: now, expiresAt: now + COOKIE_PREFERENCES_AGE };
}

export function parsePreferences(raw, now = Date.now()) {
  try {
    const value = JSON.parse(raw);
    if (value?.version !== 1 || typeof value.functional !== 'boolean' || typeof value.externalMedia !== 'boolean' || !Number.isFinite(value.savedAt) || !Number.isFinite(value.expiresAt) || value.savedAt > now || value.expiresAt <= now || value.expiresAt - value.savedAt !== COOKIE_PREFERENCES_AGE) return null;
    return value;
  } catch { return null; }
}
