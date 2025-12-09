import { NextResponse, type NextRequest } from 'next/server';

const SESSION_COOKIE_NAME = 'session';

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Permitir recursos estáticos y API
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/public') ||
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  // Permitir acceso a login
  if (pathname.startsWith('/login')) {
    return NextResponse.next();
  }

  // Verificar si hay sesión básica
  const sessionCookie = req.cookies.get(SESSION_COOKIE_NAME);
  const userCookie = req.cookies.get('session-user');
  const hasSession = sessionCookie || userCookie;

  if (!hasSession) {
    const url = req.nextUrl.clone();
    url.pathname = '/login';
    url.searchParams.set('next', pathname);
    return NextResponse.redirect(url);
  }

  // El control de roles específicos se maneja en los componentes RoleGuard
  // para evitar problemas con imports dinámicos en el middleware
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next|.*\\..*|api).*)'],
};
