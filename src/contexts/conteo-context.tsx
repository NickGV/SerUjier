"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import type { ConteoData } from "@/app/types";

interface ConteoContextType {
  // Estados principales
  hermanos: number;
  setHermanos: (value: number | ((prev: number) => number)) => void;
  hermanas: number;
  setHermanas: (value: number | ((prev: number) => number)) => void;
  ninos: number;
  setNinos: (value: number | ((prev: number) => number)) => void;
  adolescentes: number;
  setAdolescentes: (value: number | ((prev: number) => number)) => void;
  simpatizantesCount: number;
  setSimpatizantesCount: (value: number | ((prev: number) => number)) => void;
  fecha: string;
  setFecha: (value: string) => void;
  tipoServicio: string;
  setTipoServicio: (value: string) => void;
  selectedUjieres: string[];
  setSelectedUjieres: (
    value: string[] | ((prev: string[]) => string[])
  ) => void;
  modoConsecutivo: boolean;
  setModoConsecutivo: (value: boolean) => void;
  datosServicioBase: ConteoData | null;
  setDatosServicioBase: (value: ConteoData | null) => void;

  // Estados para listas del día
  simpatizantesDelDia: any[];
  setSimpatizantesDelDia: (
    value: any[] | ((prev: any[]) => any[])
  ) => void;
  hermanosDelDia: any[];
  setHermanosDelDia: (
    value: any[] | ((prev: any[]) => any[])
  ) => void;
  hermanasDelDia: any[];
  setHermanasDelDia: (
    value: any[] | ((prev: any[]) => any[])
  ) => void;
  ninosDelDia: any[];
  setNinosDelDia: (
    value: any[] | ((prev: any[]) => any[])
  ) => void;
  adolescentesDelDia: any[];
  setAdolescentesDelDia: (
    value: any[] | ((prev: any[]) => any[])
  ) => void;

  // Funciones de utilidad
  resetConteoForm: () => void;
  clearConteoData: () => void;
}

const ConteoContext = createContext<ConteoContextType | undefined>(undefined);

export function ConteoProvider({ children }: { children: ReactNode }) {
  // Estados principales
  const [hermanos, setHermanos] = useState(0);
  const [hermanas, setHermanas] = useState(0);
  const [ninos, setNinos] = useState(0);
  const [adolescentes, setAdolescentes] = useState(0);
  const [simpatizantesCount, setSimpatizantesCount] = useState(0);
  const [fecha, setFecha] = useState(new Date().toISOString().split("T")[0]);
  const [tipoServicio, setTipoServicio] = useState("dominical");
  const [selectedUjieres, setSelectedUjieres] = useState<string[]>([]);
  const [modoConsecutivo, setModoConsecutivo] = useState(false);
  const [datosServicioBase, setDatosServicioBase] = useState<ConteoData | null>(
    null
  );

  // Estados para listas del día
  const [simpatizantesDelDia, setSimpatizantesDelDia] = useState<any[]>([]);
  const [hermanosDelDia, setHermanosDelDia] = useState<any[]>([]);
  const [hermanasDelDia, setHermanasDelDia] = useState<any[]>([]);
  const [ninosDelDia, setNinosDelDia] = useState<any[]>([]);
  const [adolescentesDelDia, setAdolescentesDelDia] = useState<any[]>([]);



  // Cargar datos del localStorage al inicializar
  useEffect(() => {
    const savedConteo = localStorage.getItem("conteo-data");
    if (savedConteo) {
      try {
        const parsed = JSON.parse(savedConteo);
        setHermanos(parsed.hermanos || 0);
        setHermanas(parsed.hermanas || 0);
        setNinos(parsed.ninos || 0);
        setAdolescentes(parsed.adolescentes || 0);
        setSimpatizantesCount(parsed.simpatizantesCount || 0);
        setFecha(parsed.fecha || new Date().toISOString().split("T")[0]);
        setTipoServicio(parsed.tipoServicio || "dominical");
        setSelectedUjieres(parsed.selectedUjieres || []);
        setModoConsecutivo(parsed.modoConsecutivo || false);
        setDatosServicioBase(parsed.datosServicioBase || null);
        setSimpatizantesDelDia(parsed.simpatizantesDelDia || []);
        setHermanosDelDia(parsed.hermanosDelDia || []);
        setHermanasDelDia(parsed.hermanasDelDia || []);
        setNinosDelDia(parsed.ninosDelDia || []);
        setAdolescentesDelDia(parsed.adolescentesDelDia || []);
      } catch (error) {
        console.error("Error parsing saved conteo data:", error);
        clearConteoData();
      }
    }
  }, []);

  // Guardar en localStorage cada vez que cambie algún estado
  useEffect(() => {
    const conteoData = {
      hermanos,
      hermanas,
      ninos,
      adolescentes,
      simpatizantesCount,
      fecha,
      tipoServicio,
      selectedUjieres,
      modoConsecutivo,
      datosServicioBase,
      simpatizantesDelDia,
      hermanosDelDia,
      hermanasDelDia,
      ninosDelDia,
      adolescentesDelDia,
    };

    localStorage.setItem("conteo-data", JSON.stringify(conteoData));
  }, [
    hermanos,
    hermanas,
    ninos,
    adolescentes,
    simpatizantesCount,
    fecha,
    tipoServicio,
    selectedUjieres,
    modoConsecutivo,
    datosServicioBase,
    simpatizantesDelDia,
    hermanosDelDia,
    hermanasDelDia,
    ninosDelDia,
    adolescentesDelDia,
  ]);

  const resetConteoForm = () => {
    setHermanos(0);
    setHermanas(0);
    setNinos(0);
    setAdolescentes(0);
    setSimpatizantesCount(0);
    setSimpatizantesDelDia([]);
    setHermanosDelDia([]);
    setHermanasDelDia([]);
    setNinosDelDia([]);
    setAdolescentesDelDia([]);
    setFecha(new Date().toISOString().split("T")[0]);
    setTipoServicio("dominical");
    setSelectedUjieres([]);
    setModoConsecutivo(false);
    setDatosServicioBase(null);
  };

  const clearConteoData = () => {
    localStorage.removeItem("conteo-data");
    resetConteoForm();
  };

  const value: ConteoContextType = {
    hermanos,
    setHermanos,
    hermanas,
    setHermanas,
    ninos,
    setNinos,
    adolescentes,
    setAdolescentes,
    simpatizantesCount,
    setSimpatizantesCount,
    fecha,
    setFecha,
    tipoServicio,
    setTipoServicio,
    selectedUjieres,
    setSelectedUjieres,
    modoConsecutivo,
    setModoConsecutivo,
    datosServicioBase,
    setDatosServicioBase,
    simpatizantesDelDia,
    setSimpatizantesDelDia,
    hermanosDelDia,
    setHermanosDelDia,
    hermanasDelDia,
    setHermanasDelDia,
    ninosDelDia,
    setNinosDelDia,
    adolescentesDelDia,
    setAdolescentesDelDia,
    resetConteoForm,
    clearConteoData,
  };

  return (
    <ConteoContext.Provider value={value}>{children}</ConteoContext.Provider>
  );
}

export function useConteo() {
  const context = useContext(ConteoContext);
  if (context === undefined) {
    throw new Error("useConteo must be used within a ConteoProvider");
  }
  return context;
}
