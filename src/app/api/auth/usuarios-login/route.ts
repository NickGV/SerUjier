import { NextResponse } from "next/server";
import { adminDb, adminAuth } from "@/lib/firebase-admin";

// Force dynamic rendering for this API route
export const dynamic = "force-dynamic";

// TODO: Verificar si se puede usar el hashPassword de utils.ts, arreglar el update de password del ujier para que use esta encriptacion
// const encryptPassword = (password: string): string => {
//   // Usando btoa para encoding base64 simple + un salt
//   const salt = "ujier_salt_2025"
//   return btoa(password + salt)
// }

// const verifyPassword = (password: string, encryptedPassword: string): boolean => {
//   const salt = "ujier_salt_2025"
//   return btoa(password + salt) === encryptedPassword
// }

const verifyPassword = (
  password: string,
  encryptedPassword: string,
  userName: string
): boolean => {
  try {
    // Según el sistema original, las contraseñas se generan como:
    // 1. Tomar el primer nombre en minúsculas sin tildes
    // 2. Agregar un punto: "nombre."
    // 3. Encriptar con btoa(password + "ujier_salt_2025")

    const salt = "ujier_salt_2025";

    // Normalizar el nombre de usuario para generar la contraseña base
    const primerNombre = userName.split(" ")[0].toLowerCase();
    const nombreNormalizado = primerNombre
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "") // Quitar tildes
      .replace(/[^a-z]/g, ""); // Solo letras minúsculas

    const passwordEsperada = nombreNormalizado + ".";

    // Verificar si la contraseña ingresada coincide con la esperada
    if (password === passwordEsperada) {
      // Encriptar la contraseña esperada y compararla con la almacenada
      const encryptedExpected = Buffer.from(
        passwordEsperada + salt,
        "utf8"
      ).toString("base64");
      return encryptedExpected === encryptedPassword;
    }

    // Fallback: intentar con la contraseña ingresada directamente
    const encryptedInput = Buffer.from(password + salt, "utf8").toString(
      "base64"
    );
    return encryptedInput === encryptedPassword;
  } catch (error) {
    console.error("Error verifying password:", error);
    return false;
  }
};

export async function GET() {
  try {
    const usuariosSnapshot = await adminDb.collection("usuarios").get();
    const usuarios = usuariosSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return NextResponse.json({ usuarios });
  } catch (error) {
    console.error("Error fetching usuarios:", error);
    return NextResponse.json(
      { error: "Error al obtener usuarios" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const { nombre, password, createSession = false } = await req.json();

    if (!nombre || !password) {
      return NextResponse.json(
        { error: "Nombre y contraseña son requeridos" },
        { status: 400 }
      );
    }

    // Buscar usuario por nombre
    const usuariosSnapshot = await adminDb
      .collection("usuarios")
      .where("nombre", "==", nombre.trim())
      .get();

    if (usuariosSnapshot.empty) {
      return NextResponse.json(
        { error: "Usuario no encontrado" },
        { status: 401 }
      );
    }

    const userDoc = usuariosSnapshot.docs[0];
    const userData = userDoc.data();

    // Verificar si el usuario está activo (los admins siempre están activos)
    if (!userData.activo && userData.rol !== "admin") {
      return NextResponse.json({ error: "Usuario inactivo" }, { status: 401 });
    }

    // Verificar contraseña
    const isValidPassword = verifyPassword(
      password,
      userData.password,
      userData.nombre
    );
    if (!isValidPassword) {
      return NextResponse.json(
        { error: "Contraseña incorrecta" },
        { status: 401 }
      );
    }

    // Preparar datos del usuario (sin la contraseña)
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
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

        response.cookies.set("session-user", JSON.stringify(user), {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
          maxAge: 60 * 60 * 24 * 7, // 7 días
          path: "/",
        });

        // También crear cookie de sesión para middleware
        response.cookies.set("session", customToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
          maxAge: 60 * 60 * 24 * 7, // 7 días
          path: "/",
        });

        return response;
      } catch (sessionError) {
        console.error("Error creating session:", sessionError);
        return NextResponse.json(
          { error: "Error al crear sesión" },
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
    console.error("Error authenticating user:", error);
    return NextResponse.json(
      { error: "Error al autenticar usuario" },
      { status: 500 }
    );
  }
}
