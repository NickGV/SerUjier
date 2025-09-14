import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  try {
    const user = await getCurrentUser();

    if (user) {
      // Si tenemos un usuario desde getCurrentUser, necesitamos obtener más datos desde Firestore
      const { adminDb } = await import("@/lib/firebase-admin");

      try {
        const userDoc = await adminDb
          .collection("usuarios")
          .doc(user.uid)
          .get();

        if (userDoc.exists) {
          const userData = userDoc.data();

          // Verificar si el usuario está activo
          if (userData?.activo === false && userData?.rol !== "admin") {
            return NextResponse.json({ user: null }, { status: 200 });
          }

          const userInfo = {
            id: user.uid,
            nombre: userData?.nombre || "Usuario",
            rol: userData?.rol || user.role,
            email: userData?.email || `${userData?.nombre}@ujier.local`,
            activo: userData?.activo ?? true,
          };

          return NextResponse.json({ user: userInfo }, { status: 200 });
        }
      } catch (firestoreError) {
        console.error("Error fetching user from Firestore:", firestoreError);
      }
    }

    return NextResponse.json({ user: null }, { status: 200 });
  } catch (error) {
    console.error("Error checking session:", error);
    return NextResponse.json({ user: null }, { status: 200 });
  }
}
