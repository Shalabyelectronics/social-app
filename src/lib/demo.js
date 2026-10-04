/**
 * Shared demo account so visitors can try the app without registering.
 * Set VITE_DEMO_EMAIL and VITE_DEMO_PASSWORD in the hosting environment
 * (Vercel → Project → Settings → Environment Variables), then redeploy.
 * The "Try the demo" button only appears when both are set.
 */
const demoEmail = import.meta.env.VITE_DEMO_EMAIL?.trim() || "";
const demoPassword = import.meta.env.VITE_DEMO_PASSWORD || "";

export const demoCredentials =
  demoEmail && demoPassword
    ? { email: demoEmail, password: demoPassword }
    : null;

/**
 * True when the logged-in user is the shared demo account
 * @param {object|null} user - The user from AuthContext
 * @returns {boolean}
 */
export const isDemoUser = (user) =>
  Boolean(demoEmail) &&
  user?.email?.toLowerCase() === demoEmail.toLowerCase();
