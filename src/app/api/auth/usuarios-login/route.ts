import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { adminDb, adminAuth } from '@/shared/lib/firebase-admin';

// Force dynamic rendering for this API route
export const dynamic = 'force-dynamic';

const verifyPassword = (password: string, storedPassword: string): boolean => {
  try {
    // Try bcrypt first (new format)
    if (storedPassword.startsWith('$2')) {
      return bcrypt.compareSync(password, storedPassword);
    }
  } catch {
    // fall through to old format
  }

  // Fallback: old base64 format
  const salt = 'ujier_salt_2025';
  const encryptedInput = Buffer.from(password + salt, 'utf8').toString(
    'base64'
  );
  return encryptedInput === storedPassword;
};

export async function GET() {
  try {
    const usuariosSnapshot = await adminDb.collection('usuarios').get();
    const usuarios = usuariosSnapshot.docs.map((doc) => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password, ...data } = doc.data();
      return { id: doc.id, ...data };
    });

    return NextResponse.json({ usuarios });
  } catch (error) {
    console.error('Error fetching usuarios:', error);
    return NextResponse.json(
      { error: 'Error al obtener usuarios' },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const { nombre, password, createSession = false } = await req.json();

    if (!nombre || !password) {
      return NextResponse.json(
        { error: 'Nombre y contraseña son requeridos' },
        { status: 400 }
      );
    }

    // Buscar usuario por nombre
    const usuariosSnapshot = await adminDb
      .collection('usuarios')
      .where('nombre', '==', nombre.trim())
      .get();

    if (usuariosSnapshot.empty) {
      return NextResponse.json(
        { error: 'Usuario no encontrado' },
        { status: 401 }
      );
    }

    const userDoc = usuariosSnapshot.docs[0];
    const userData = userDoc.data();

    // Verificar si el usuario está activo (los admins siempre están activos)
    if (!userData.activo && userData.rol !== 'admin') {
      return NextResponse.json({ error: 'Usuario inactivo' }, { status: 401 });
    }

    // Verificar contraseña
    const isValidPassword = verifyPassword(password, userData.password);
    if (!isValidPassword) {
      return NextResponse.json(
        { error: 'Contraseña incorrecta' },
        { status: 401 }
      );
    }

    // Si la contraseña aún está en formato base64 antiguo, migrarla a bcrypt
    if (!userData.password.startsWith('$2')) {
      try {
        const hashedPassword = bcrypt.hashSync(password, 10);
        await adminDb.collection('usuarios').doc(userDoc.id).update({
          password: hashedPassword,
        });
      } catch (migrationError) {
        console.error('Error migrating password to bcrypt:', migrationError);
        // Non-blocking: login still succeeds even if migration fails
      }
    }

    // Preparar datos del usuario (sin la contraseña)

    const { password: _, ...userWithoutPassword } = userData;
    const user = {
      id: userDoc.id,
      ...userWithoutPassword,
    };

    // Si se solicita crear sesión, crear cookie y token
    if (createSession) {
      try {
        // Crear custom token
        const customToken = await adminAuth.createCustomToken(userDoc.id, {
          rol: userData.rol,
          nombre: userData.nombre,
        });

        // Crear cookie de sesión
        const response = NextResponse.json({
          success: true,
          user,
          customToken,
        });

        response.cookies.set('session-user', JSON.stringify(user), {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          maxAge: 60 * 60 * 24 * 7, // 7 días
          path: '/',
        });

        // También crear cookie de sesión para middleware
        response.cookies.set('session', customToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          maxAge: 60 * 60 * 24 * 7, // 7 días
          path: '/',
        });

        return response;
      } catch (sessionError) {
        console.error('Error creating session:', sessionError);
        return NextResponse.json(
          { error: 'Error al crear sesión' },
          { status: 500 }
        );
      }
    }

    // Si no se solicita sesión, solo retornar datos del usuario
    return NextResponse.json({
      success: true,
      user,
    });
  } catch (error) {
    console.error('Error authenticating user:', error);
    return NextResponse.json(
      { error: 'Error al autenticar usuario' },
      { status: 500 }
    );
  }
}
