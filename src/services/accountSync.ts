/**
 * Account / cross-device sync — wire to Supabase, Firebase Auth, or similar.
 * All user data currently lives in AsyncStorage via Zustand persist.
 */
export type AuthUser = { id: string; email?: string };

export async function signIn(_email: string, _password: string): Promise<AuthUser | null> {
  return null;
}

export async function signOut(): Promise<void> {}

export async function syncLocalStateToCloud(): Promise<boolean> {
  return false;
}

export function isAccountSyncAvailable(): boolean {
  return false;
}
