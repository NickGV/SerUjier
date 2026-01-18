import bcrypt from 'bcryptjs';
import { adminDb } from '@/shared/lib/firebase-admin';

const usuarios = [
  {
    nombre: 'admin',
    password: 'admin123',
    rol: 'admin',
    activo: true,
  },
];

async function seedUsuarios() {
  try {
    for (const usuario of usuarios) {
      const hashedPassword = await bcrypt.hash(usuario.password, 10);

      await adminDb.collection('usuarios').add({
        nombre: usuario.nombre,
        password: hashedPassword,
        rol: usuario.rol,
        activo: usuario.activo,
        createdAt: new Date().toISOString(),
      });
    }
  } catch (error) {}
}

seedUsuarios();
