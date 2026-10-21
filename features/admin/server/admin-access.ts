import { cookies } from 'next/headers';
import { ADMIN_DEMO_ROLE_COOKIE, parseAdminRole } from '../rules';
import type { AdminRole } from '../types';

export type AdminAccess =
  | { status: 'granted'; role: AdminRole; demo: boolean }
  | { status: 'forbidden'; demo: boolean }
  | { status: 'unauthenticated' };

function readRoleClaim(token: string | undefined): string | null {
  if (!token) return null;
  try {
    const payload = token.split('.')[1];
    if (!payload) return null;
    const claims = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8')) as { role?: unknown };
    return typeof claims.role === 'string' ? claims.role : null;
  } catch {
    return null;
  }
}

/**
 * Decide no servidor se a página administrativa pode ser exibida. Isto apenas evita renderizar a
 * interface para perfis sem acesso: cada consulta e operação continua sendo autorizada pelo backend.
 * Em desenvolvimento, sem um perfil administrativo real, usa a sessão demonstrativa.
 */
export async function getAdminAccess(): Promise<AdminAccess> {
  const store = await cookies();
  const accessToken = store.get('access_token')?.value;
  const role = parseAdminRole(readRoleClaim(accessToken));
  if (role) return { status: 'granted', role, demo: false };

  if (process.env.NODE_ENV === 'development') {
    const demoValue = store.get(ADMIN_DEMO_ROLE_COOKIE)?.value ?? 'admin';
    const demoRole = parseAdminRole(demoValue);
    return demoRole ? { status: 'granted', role: demoRole, demo: true } : { status: 'forbidden', demo: true };
  }

  const hasSession = Boolean(accessToken || store.has('refresh_token'));
  return hasSession ? { status: 'forbidden', demo: false } : { status: 'unauthenticated' };
}
