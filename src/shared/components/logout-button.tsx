"use client";
import React from "react";

export default function LogoutButton() {
  const onLogout = async () => {
    await fetch("/api/auth/session", { method: "DELETE" });
    window.location.href = "/login";
  };
  return (
    <button onClick={onLogout} className="text-sm text-red-600 underline">
      Cerrar sesión
    </button>
  );
}
