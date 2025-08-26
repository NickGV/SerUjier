import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";

// Forzar renderizado dinámico para evitar errores de cookies durante el build
export const dynamic = 'force-dynamic';

export default async function HomePage() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      redirect("/login");
    }
    redirect("/conteo");
  } catch (error) {
    console.error("Error in HomePage:", error);
    // En caso de error, redirigir a login
    redirect("/login");
  }
}
