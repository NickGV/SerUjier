import { adminDb } from '@/shared/lib/firebase-admin';

const createAdminUser = async () => {
  try {
    // Verificar si ya existe
    const existingAdmin = await adminDb
      .collection('usuarios')
      .where('nombre', '==', 'admin')
      .get();

    if (!existingAdmin.empty) {
      const adminDoc = existingAdmin.docs[0];
      await adminDoc.ref.update({
        activo: true,
        rol: 'admin',
        updatedAt: new Date().toISOString(),
      });
      return;
    }

    // Crear contraseña encriptada usando el sistema de salt
    const password = 'admin123';
    const salt = 'ujier_salt_2025';
    const encryptedPassword = btoa(password + salt);

    // Crear usuario admin
    const adminUser = {
      nombre: 'admin',
      password: encryptedPassword,
      rol: 'admin',
      activo: true,
      email: 'admin@ujier.local',
      createdAt: new Date().toISOString(),
    };

    const docRef = await adminDb.collection('usuarios').add(adminUser);
  } catch (error) {}
};

export { createAdminUser };
