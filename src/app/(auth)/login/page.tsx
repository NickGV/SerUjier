"use client";

import { useState, useRef, useEffect, Suspense } from "react";
// import { useSearchParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Badge } from "@/shared/ui/badge";
import {
  LogIn,
  User,
  Lock,
  Eye,
  EyeOff,
  AlertCircle,
  ChevronDown,
} from "lucide-react";

interface Usuario {
  id: string;
  nombre: string;
  rol: string;
  activo: boolean;
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div>Cargando...</div>}>
      <LoginForm />
    </Suspense>
  );
}

function LoginForm() {
  const [nombre, setNombre] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showUserList, setShowUserList] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // const params = useSearchParams();
  // const next = params.get("next") || "/"; // Comentado por ahora, no se usa

  // Cargar usuarios disponibles
  useEffect(() => {
    const fetchUsuarios = async () => {
      try {
        const response = await fetch("/api/auth/usuarios-login");
        const data = await response.json();
        if (data.usuarios) {
          setUsuarios(data.usuarios);
        }
      } catch (error) {
        console.error("Error fetching usuarios:", error);
      }
    };
    fetchUsuarios();
  }, []);

  // Solo usuarios activos para el autocompletado, pero los admins siempre están disponibles
  const usuariosDisponibles = usuarios.filter(
    (u) => u.activo || u.rol === "admin"
  );

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!nombre.trim() || !password.trim()) {
      setError("Por favor complete todos los campos");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Autenticar y crear sesión en un solo paso
      const response = await fetch("/api/auth/usuarios-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombre: nombre.trim(),
          password: password.trim(),
          createSession: true,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Error de autenticación");
        return;
      }

      if (!data.success) {
        setError(data.error || "Error de autenticación");
        return;
      }

      // Esperar un poco para que las cookies se establezcan
      await new Promise((resolve) => setTimeout(resolve, 200));

      // Usar window.location.href para forzar una recarga completa
      // Esto asegura que el middleware vea las cookies correctamente
      window.location.href = "conteo";
    } catch (err) {
      console.error("Login error:", err);
      setError("Error de conexión. Intente nuevamente.");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      onSubmit(e as React.FormEvent);
    }
  };

  const handleNombreSelect = (selectedNombre: string) => {
    setNombre(selectedNombre);
    setPassword("");
    setError(null);
    setShowUserList(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setNombre(value);
    setShowUserList(value.length > 0);
    setError(null);
  };

  const handleInputFocus = () => {
    if (nombre.length > 0 || usuariosDisponibles.length > 0) {
      setShowUserList(true);
    }
  };

  const handleClickOutside = (e: MouseEvent) => {
    if (
      dropdownRef.current &&
      !dropdownRef.current.contains(e.target as Node)
    ) {
      setShowUserList(false);
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const filteredUsuarios = usuariosDisponibles.filter((u) =>
    u.nombre.toLowerCase().includes(nombre.toLowerCase())
  );

  // Mostrar todos los usuarios disponibles si no hay texto de búsqueda
  const usuariosAMostrar =
    nombre.length === 0 ? usuariosDisponibles : filteredUsuarios;

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-gray-100 p-4 md:p-6 pt-6 md:pt-12">
      <div className="flex items-start justify-center">
        <div className="w-full max-w-sm md:max-w-md lg:max-w-lg space-y-6 md:space-y-8">
          {/* Header */}
          <div className="text-center">
            <div className="w-20 h-20 md:w-24 md:h-24 bg-gradient-to-r from-slate-600 to-slate-700 rounded-full flex items-center justify-center mx-auto mb-4 md:mb-6 shadow-lg">
              <LogIn className="w-10 h-10 md:w-12 md:h-12 text-white" />
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">
              Bienvenido
            </h1>
            <p className="text-gray-600 text-sm md:text-base">
              Sistema de Conteo de Asistencia
            </p>
          </div>

          {/* Login Form */}
          <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-xl">
            <CardHeader className="pb-4 md:pb-6 px-6 md:px-8">
              <CardTitle className="text-lg md:text-xl font-semibold text-gray-800 text-center">
                Iniciar Sesión
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 md:space-y-6 px-6 md:px-8">
              <form onSubmit={onSubmit}>
                {/* Nombre Field */}
                <div className="relative" ref={dropdownRef}>
                  <label 
                    htmlFor="nombre-input"
                    className="text-base font-medium text-gray-700 mb-2 flex items-center gap-2"
                  >
                    <User className="w-5 h-5" />
                    Nombre
                  </label>
                  <div className="relative">
                    <Input
                      id="nombre-input"
                      ref={inputRef}
                      placeholder="Escriba o seleccione su nombre"
                      value={nombre}
                      onChange={handleInputChange}
                      onFocus={handleInputFocus}
                      className="h-12 md:h-14 pr-12 text-base md:text-lg"
                      autoComplete="off"
                      aria-describedby="nombre-help"
                      aria-expanded={showUserList}
                      aria-haspopup="listbox"
                      role="combobox"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 h-10 w-10 p-0"
                      onClick={() => setShowUserList(!showUserList)}
                      aria-label={showUserList ? "Cerrar lista de usuarios" : "Abrir lista de usuarios"}
                      aria-expanded={showUserList}
                    >
                      <ChevronDown
                        className={`w-5 h-5 transition-transform ${
                          showUserList ? "rotate-180" : ""
                        }`}
                      />
                    </Button>
                  </div>
                  <div id="nombre-help" className="text-sm text-gray-500 mt-1">
                    Escriba para buscar o seleccione de la lista
                  </div>

                  {/* User List Dropdown */}
                  {showUserList && (
                    <div 
                      className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-xl z-[9999] max-h-64 overflow-y-auto"
                      role="listbox"
                      aria-label="Lista de usuarios disponibles"
                    >
                      {usuariosAMostrar.length > 0 ? (
                        usuariosAMostrar.map((usuario) => (
                          <div
                            key={usuario.id}
                            className="p-4 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0 transition-colors"
                            onClick={() => handleNombreSelect(usuario.nombre)}
                            role="option"
                            tabIndex={0}
                            aria-selected="false"
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' || e.key === ' ') {
                                e.preventDefault();
                                handleNombreSelect(usuario.nombre);
                              }
                            }}
                            aria-label={`Seleccionar usuario ${usuario.nombre}, rol ${usuario.rol}`}
                          >
                            <div className="flex items-center justify-between">
                              <div>
                                <div className="font-medium text-gray-800 flex items-center gap-2 text-base">
                                  {usuario.nombre}
                                  {usuario.nombre === "admin" && (
                                    <span className="text-yellow-500" aria-label="Usuario administrador">⭐</span>
                                  )}
                                </div>
                              </div>
                              <div className="flex flex-col items-end gap-1">
                                <Badge
                                  className={`text-sm ${
                                    usuario.rol === "admin"
                                      ? "bg-blue-50 text-blue-700 border-blue-200"
                                      : "bg-green-50 text-green-700 border-green-200"
                                  }`}
                                >
                                  {usuario.rol}
                                </Badge>
                                {!usuario.activo && usuario.rol !== "admin" && (
                                  <Badge className="text-sm bg-red-50 text-red-700 border-red-200">
                                    Inactivo
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="p-4 text-center text-gray-500 text-base">
                          No se encontraron usuarios
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Password Field */}
                <div>
                  <label 
                    htmlFor="password-input"
                    className="text-base font-medium text-gray-700 mb-2 flex items-center gap-2"
                  >
                    <Lock className="w-5 h-5" />
                    Contraseña
                  </label>
                  <div className="relative">
                    <Input
                      id="password-input"
                      type={showPassword ? "text" : "password"}
                      placeholder="Ingrese su contraseña"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      onKeyPress={handleKeyPress}
                      className="h-12 md:h-14 pr-12 text-base md:text-lg"
                      autoComplete="current-password"
                      aria-describedby="password-help"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 h-10 w-10 p-0"
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                    >
                      {showPassword ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </Button>
                  </div>
                  <div id="password-help" className="text-sm text-gray-500 mt-1">
                    Use la contraseña asignada por el administrador
                  </div>
                </div>

                {/* Error Message */}
                {error && (
                  <div 
                    className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-lg"
                    role="alert"
                    aria-live="polite"
                  >
                    <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                    <span className="text-base text-red-700">{error}</span>
                  </div>
                )}

                {/* Login Button */}
                <Button
                  type="submit"
                  disabled={loading || !nombre.trim() || !password.trim()}
                  className="w-full h-12 md:h-14 bg-gradient-to-r from-slate-600 to-slate-700 hover:from-slate-700 hover:to-slate-800 text-white font-semibold rounded-xl shadow-lg text-base md:text-lg"
                  aria-describedby="login-help"
                >
                  {loading ? (
                    <div className="flex items-center gap-3">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" aria-hidden="true"></div>
                      <span>Verificando...</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3">
                      <LogIn className="w-6 h-6" />
                      <span>Iniciar Sesión</span>
                    </div>
                  )}
                </Button>
                <div id="login-help" className="text-sm text-gray-500 mt-2 text-center">
                  Complete ambos campos para habilitar el botón
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Info */}
          <div className="text-center">
            <p className="text-sm md:text-base text-gray-500">
              ¿Problemas para acceder? Contacte al administrador
            </p>
            <p className="text-sm text-gray-400 mt-2">
              Admin de emergencia: admin / admin123
            </p>
          </div>

          {/* Stats */}
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-md">
            <CardContent className="p-6 md:p-8">
              <div className="grid grid-cols-2 gap-6 text-center">
                <div>
                  <div className="text-xl md:text-2xl font-bold text-slate-700">
                    {usuariosDisponibles.length}
                  </div>
                  <div className="text-sm md:text-base text-gray-500">
                    Usuarios Disponibles
                  </div>
                </div>
                <div>
                  <div className="text-xl md:text-2xl font-bold text-blue-700">
                    {
                      usuariosDisponibles.filter((u) => u.rol === "admin")
                        .length
                    }
                  </div>
                  <div className="text-sm md:text-base text-gray-500">Administradores</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
