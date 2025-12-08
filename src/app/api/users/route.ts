import { NextResponse } from "next/server";
import { adminDb } from "@/shared/lib/firebase-admin";

interface User {
  id: string;
  nombre: string;
  rol: string;
  activo: boolean;
  email?: string;
  password?: string;
  fechaCreacion?: string;
}

export async function GET() {
  try {
    const usersRef = adminDb.collection("usuarios");
    const snapshot = await usersRef.get();

    const users: User[] = snapshot.docs.map(
      (doc) =>
        ({
          id: doc.id,
          ...doc.data(),
        } as User)
    );

    // Filter only active users and admins for login dropdown
    const availableUsers = users.filter(
      (user) => user.activo === true || user.rol === "admin"
    );

    return NextResponse.json(availableUsers);
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json(
      { error: "Failed to fetch users" },
      { status: 500 }
    );
  }
}
