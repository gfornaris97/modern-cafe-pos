import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface Turno {
  id: string;
  fechaApertura: string;
  horaApertura: string;
  fechaCierre?: string;
  horaCierre?: string;
  cajero: string;
  montoApertura: number;
  montoCierre?: number;
  ventasRealizadas: number;
  totalVentas: number;
  estado: 'abierto' | 'cerrado';
}

interface TurnoContextType {
  turnoActual: Turno | null;
  turnos: Turno[];
  abrirTurno: (montoApertura: number, cajero: string) => void;
  cerrarTurno: (montoCierre: number, ventasRealizadas: number, totalVentas: number) => void;
  actualizarTurno: (ventasRealizadas: number, totalVentas: number) => void;
}

const TurnoContext = createContext<TurnoContextType | undefined>(undefined);

export const TurnoProvider = ({ children }: { children: ReactNode }) => {
  const [turnoActual, setTurnoActual] = useState<Turno | null>(() => {
    const turnoGuardado = localStorage.getItem('cafe-pos-turno');
    return turnoGuardado ? JSON.parse(turnoGuardado) : null;
  });
  
  const [turnos, setTurnos] = useState<Turno[]>(() => {
    const turnosGuardados = localStorage.getItem('cafe-pos-turnos');
    return turnosGuardados ? JSON.parse(turnosGuardados) : [];
  });

  // Sincronizar con localStorage
  useEffect(() => {
    if (turnoActual) {
      localStorage.setItem('cafe-pos-turno', JSON.stringify(turnoActual));
    } else {
      localStorage.removeItem('cafe-pos-turno');
    }
  }, [turnoActual]);

  useEffect(() => {
    localStorage.setItem('cafe-pos-turnos', JSON.stringify(turnos));
  }, [turnos]);

  const abrirTurno = (montoApertura: number, cajero: string) => {
    const ahora = new Date();
    const nuevoTurno: Turno = {
      id: Date.now().toString(),
      fechaApertura: ahora.toISOString().split('T')[0],
      horaApertura: ahora.toTimeString().split(' ')[0].slice(0, 5),
      cajero,
      montoApertura,
      ventasRealizadas: 0,
      totalVentas: 0,
      estado: 'abierto'
    };

    setTurnoActual(nuevoTurno);
  };

  const cerrarTurno = (montoCierre: number, ventasRealizadas: number, totalVentas: number) => {
    if (!turnoActual) return;

    const ahora = new Date();
    const turnoCerrado: Turno = {
      ...turnoActual,
      fechaCierre: ahora.toISOString().split('T')[0],
      horaCierre: ahora.toTimeString().split(' ')[0].slice(0, 5),
      montoCierre,
      ventasRealizadas,
      totalVentas,
      estado: 'cerrado'
    };

    // Guardar turno cerrado en historial
    setTurnos(prev => [...prev, turnoCerrado]);
    
    // Limpiar turno actual
    setTurnoActual(null);
  };

  const actualizarTurno = (ventasRealizadas: number, totalVentas: number) => {
    if (!turnoActual) return;

    setTurnoActual(prev => prev ? {
      ...prev,
      ventasRealizadas,
      totalVentas
    } : null);
  };

  return (
    <TurnoContext.Provider value={{
      turnoActual,
      turnos,
      abrirTurno,
      cerrarTurno,
      actualizarTurno
    }}>
      {children}
    </TurnoContext.Provider>
  );
};

export const useTurno = () => {
  const context = useContext(TurnoContext);
  if (context === undefined) {
    throw new Error('useTurno must be used within a TurnoProvider');
  }
  return context;
};