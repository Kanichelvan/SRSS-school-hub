// AUTH-001 AC4: map Firebase Auth error codes to plain, non-revealing messages.
const MESSAGES = {
  "auth/invalid-credential": "That email and password don't match our records. Check both and try again.",
  "auth/wrong-password": "That email and password don't match our records. Check both and try again.",
  "auth/user-not-found": "That email and password don't match our records. Check both and try again.",
  "auth/invalid-email": "Enter a valid email address.",
  "auth/user-disabled": "This account has been disabled. Please contact the school office.",
  "auth/too-many-requests": "Too many attempts. Wait a few minutes, or reset your password.",
  "auth/network-request-failed": "We couldn't reach the sign-in service. Check your connection and try again.",
  "auth/popup-closed-by-user": "The Google sign-in window was closed before finishing.",
  "auth/popup-blocked": "Your browser blocked the sign-in window. Allow pop-ups for this site and try again.",
  "auth/invalid-action-code": "This sign-in link has expired or was already used. Request a new one.",
  "auth/expired-action-code": "This sign-in link has expired. Request a new one.",
  "auth/unauthorized-domain": "Sign-in isn't enabled for this web address yet. Please contact the school.",
  "auth/multi-factor-auth-required": "This account needs a second sign-in step.",
};

export function authErrorMessage(error) {
  return MESSAGES[error?.code] || "Sign-in did not complete. Please try again, or contact the school office.";
}
