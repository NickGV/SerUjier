import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";

// Force dynamic rendering for this page
export const dynamic = "force-dynamic";

export default async function HomePage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  redirect("/conteo");
}
