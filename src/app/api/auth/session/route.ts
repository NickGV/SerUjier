import { NextResponse } from "next/server";
import { adminAuth, adminDb } from "@/lib/firebase-admin";
import { Buffer } from "buffer";

const SESSION_COOKIE_NAME = "session";
const SESSION_EXPIRES_MS = 1000 * 60 * 60 * 24 * 5; // 5 días

export async function POST(req: Request) {
  try {
    const { nombre, password } = await req.json();

    if (!nombre || !password) {
      return NextResponse.json(
        { error: "Nombre and password are required" },
        { status: 400 }
      );
    }

    const usersRef = adminDb.collection("usuarios");
    const snapshot = await usersRef
      .where("nombre", "==", nombre)
      .limit(1)
      .get();

    if (snapshot.empty) {
      return NextResponse.json(
        { error: "Usuario o contraseña incorrectos" },
        { status: 401 }
      );
    }

    const userDoc = snapshot.docs[0];
    const userData = userDoc.data();

    // Decode the password from Base64 and compare
    const storedPassword = Buffer.from(userData.password, "base64").toString(
      "utf-8"
    );

    if (storedPassword !== password) {
      return NextResponse.json(
        { error: "Usuario o contraseña incorrectos" },
        { status: 401 }
      );
    }

    if (!userData.activo && userData.rol !== "admin") {
      return NextResponse.json(
        { error: "El usuario no está activo. Contacte al administrador." },
        { status: 403 }
      );
    }

    // Create a custom token for the user with the rol claim
    const customToken = await adminAuth.createCustomToken(userDoc.id, {
      rol: userData.rol,
      email: userData.email || `${userData.nombre}@ujier.local`,
    });

    // Create the session cookie directly from the custom token
    const sessionCookie = await adminAuth.createSessionCookie(customToken, {
      expiresIn: SESSION_EXPIRES_MS,
    });

    const res = NextResponse.json({ uid: userDoc.id, rol: userData.rol });
    res.cookies.set({
      name: SESSION_COOKIE_NAME,
      value: sessionCookie,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: SESSION_EXPIRES_MS / 1000,
    });
    return res;
  } catch (e) {
    console.error("Auth error:", e);
    const msg = e instanceof Error ? e.message : "Internal Server Error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  const raw = req.headers.get("cookie") ?? "";
  const session = raw
    .split(";")
    .map((s: string) => s.trim())
    .find((c: string) => c.startsWith(`${SESSION_COOKIE_NAME}=`))
    ?.split("=")[1];
  if (session) {
    try {
      const decoded = await adminAuth.verifySessionCookie(session, true);
      await adminAuth.revokeRefreshTokens(decoded.sub);
    } catch {
      // ignore revoke errors
    }
  }
  const res = NextResponse.json({ ok: true });
  res.cookies.set({
    name: SESSION_COOKIE_NAME,
    value: "",
    path: "/",
    maxAge: 0,
  });
  return res;
}
