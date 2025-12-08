import { NextResponse } from 'next/server';
import { adminAuth } from '@/shared/lib/firebase-admin';
import { cookies } from 'next/headers';

export async function POST(req: Request) {
  debugger;
  try {
    const { user } = await req.json();

    if (!user) {
      return NextResponse.json({ error: 'Usuario requerido' }, { status: 400 });
    }

    // Crear un custom token para el usuario
    const customToken = await adminAuth.createCustomToken(user.id, {
      role: user.rol,
      nombre: user.nombre,
    });

    // Crear cookie de sesión
    const cookieStore = await cookies();
    cookieStore.set('session-user', JSON.stringify(user), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 días
    });

    return NextResponse.json({
      success: true,
      customToken,
      user,
    });
  } catch (error) {
    console.error('Error creating session:', error);
    return NextResponse.json(
      { error: 'Error al crear sesión' },
      { status: 500 }
    );
  }
}
