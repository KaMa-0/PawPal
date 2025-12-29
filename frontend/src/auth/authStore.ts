export const ROLES = ["OWNER", "SITTER", "ADMIN"] as const;
export type Role = (typeof ROLES)[number];

export type AuthState = {
  token: string;
  userId: string;
  email: string;
  role: Role;
};

const KEY = "pawpal_auth";

export function getAuth(): AuthState | null {
  const raw = localStorage.getItem(KEY);
  if (!raw) return null;

  try {
    return JSON.parse(raw) as AuthState;
  } catch {
    return null;
  }
}

export function setAuth(state: AuthState) {
  localStorage.setItem(KEY, JSON.stringify(state));
}

export function clearAuth() {
  localStorage.removeItem(KEY);
}