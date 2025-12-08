import { adminDb } from "@/shared/lib/firebase-admin";

const createAdminUser = async () => {
  try {
    console.log("Creando usuario admin de emergencia...");
    
    // Verificar si ya existe
    const existingAdmin = await adminDb
      .collection("usuarios")
      .where("nombre", "==", "admin")
      .get();
    
    if (!existingAdmin.empty) {
      console.log("Usuario admin ya existe. Actualizando...");
      const adminDoc = existingAdmin.docs[0];
      await adminDoc.ref.update({
        activo: true,
        rol: "admin",
        updatedAt: new Date().toISOString(),
      });
      console.log("Usuario admin actualizado correctamente");
      return;
    }
    
    // Crear contraseña encriptada usando el sistema de salt
    const password = "admin123";
    const salt = "ujier_salt_2025";
    const encryptedPassword = btoa(password + salt);
    
    // Crear usuario admin
    const adminUser = {
      nombre: "admin",
      password: encryptedPassword,
      rol: "admin",
      activo: true,
      email: "admin@ujier.local",
      createdAt: new Date().toISOString(),
    };
    
    const docRef = await adminDb.collection("usuarios").add(adminUser);
    console.log(`Usuario admin creado con ID: ${docRef.id}`);
    console.log("Credenciales: admin / admin123");
    
    // Verificar que se puede leer
    const verification = await docRef.get();
    if (verification.exists) {
      console.log("✅ Usuario verificado correctamente");
      console.log("Datos:", verification.data());
    } else {
      console.log("❌ Error: No se pudo verificar el usuario");
    }
    
  } catch (error) {
    console.error("Error creando usuario admin:", error);
  }
};

// Ejecutar si se llama directamente
if (require.main === module) {
  createAdminUser()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}

export { createAdminUser };
