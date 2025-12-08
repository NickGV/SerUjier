import { cookies } from 'next/headers';
import { adminAuth, adminDb } from '@/shared/lib/firebase-admin';
type DecodedIdToken = { uid: string; email?: string } & Record<string, unknown>;

export type AppRole = 'ujier' | 'directiva' | 'admin';

export interface SessionUser {
  uid: string;
  email?: string;
  role: AppRole;
}

const SESSION_COOKIE_NAME = 'session';

export async function getSessionCookie() {
  const cookieStore = await cookies();
  return cookieStore.get(SESSION_COOKIE_NAME)?.value;
}

export async function getCurrentUser(): Promise<SessionUser | null> {
  try {
    // Primero intentar obtener de la cookie de usuario
    const cookieStore = await cookies();
    const userCookie = cookieStore.get('session-user')?.value;

    if (userCookie) {
      try {
        const userData = JSON.parse(userCookie);
        return {
          uid: userData.id,
          email: userData.email || `${userData.nombre}@ujier.local`,
          role: userData.rol as AppRole,
        };
      } catch (parseError) {
        console.error('Error parsing user cookie:', parseError);
      }
    }

    // Fallback: intentar con session cookie/token
    const session = await getSessionCookie();
    if (!session) return null;

    try {
      // Intentar como session cookie primero
      const decoded: DecodedIdToken = await adminAuth.verifySessionCookie(
        session,
        true
      );

      // Check if the role is in the token claims
      const maybeRole = (decoded as unknown as { rol?: AppRole }).rol;
      if (maybeRole) {
        return {
          uid: decoded.uid,
          email: decoded.email || undefined,
          role: maybeRole,
        };
      }

      // Fallback: get role from Firestore
      const snap = await adminDb.collection('usuarios').doc(decoded.uid).get();
      type UserDoc = { rol?: AppRole };
      const data = (snap.exists ? (snap.data() as UserDoc) : undefined) || {};
      const role: AppRole = data.rol ?? 'ujier';
      return { uid: decoded.uid, email: decoded.email || undefined, role };
    } catch {
      // Si falla como session cookie, intentar como custom token
      try {
        const decoded = await adminAuth.verifyIdToken(session);
        const maybeRole = (decoded as unknown as { rol?: AppRole }).rol;

        if (maybeRole) {
          return {
            uid: decoded.uid,
            email: decoded.email || undefined,
            role: maybeRole,
          };
        }

        // Fallback: get role from Firestore
        const snap = await adminDb
          .collection('usuarios')
          .doc(decoded.uid)
          .get();
        type UserDoc = { rol?: AppRole };
        const data = (snap.exists ? (snap.data() as UserDoc) : undefined) || {};
        const role: AppRole = data.rol ?? 'ujier';
        return { uid: decoded.uid, email: decoded.email || undefined, role };
      } catch (tokenError) {
        console.error('Error verifying token:', tokenError);
        return null;
      }
    }
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
}

export function canAccess(
  role: AppRole,
  route: 'conteo' | 'simpatizantes' | 'historial' | 'ujieres' | 'admin'
) {
  if (role === 'admin') return true;
  if (role === 'directiva') {
    return ['conteo', 'simpatizantes', 'historial', 'ujieres'].includes(route);
  }
  if (role === 'ujier') {
    return ['conteo', 'simpatizantes'].includes(route);
  }
  return false;
}
