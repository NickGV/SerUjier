"use client";

import React from "react";
import { UserProvider, useUser } from "@/shared/contexts/user-context";
import { BottomNavigation } from "@/shared/components/bottom-navigation";

function DashboardContent({ children }: { children: React.ReactNode }) {
  const { user, logout, isLoading } = useUser();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    // Redirect to login if not authenticated
    if (typeof window !== "undefined") {
      window.location.href = "/login";
    }
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Main content with bottom padding for navigation */}
      <main className="pb-36">{children}</main>

      {/* Bottom Navigation */}
      <BottomNavigation currentUser={user} onLogout={logout} />
    </div>
  );
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <UserProvider>
      <DashboardContent>{children}</DashboardContent>
    </UserProvider>
  );
}
