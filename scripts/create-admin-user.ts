import bcrypt from 'bcryptjs';
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
      // Si el admin existe y tiene password en formato viejo, migrarlo
      const adminData = adminDoc.data();
      if (adminData.password && !adminData.password.startsWith('$2')) {
        const hashedPassword = await bcrypt.hash('admin123', 10);
        await adminDoc.ref.update({
          password: hashedPassword,
          activo: true,
          rol: 'admin',
          updatedAt: new Date().toISOString(),
        });
      } else {
        await adminDoc.ref.update({
          activo: true,
          rol: 'admin',
          updatedAt: new Date().toISOString(),
        });
      }
      return;
    }

    // Crear usuario admin con bcrypt
    const hashedPassword = await bcrypt.hash('admin123', 10);
    const adminUser = {
      nombre: 'admin',
      password: hashedPassword,
      rol: 'admin',
      activo: true,
      email: 'admin@ujier.local',
      createdAt: new Date().toISOString(),
    };

    await adminDb.collection('usuarios').add(adminUser);
  } catch (error) {
    console.error('Error creating admin user:', error);
  }
};

export { createAdminUser };
