import React from 'react';
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Lock, Unlock, User, Clock, DollarSign } from "lucide-react";
import { useTurno } from '@/contexts/TurnoContext';
import { useAuth } from '@/contexts/AuthContext';

interface TurnoStatusProps {
  className?: string;
}

const TurnoStatus = ({ className }: TurnoStatusProps) => {
  const { turnoActual } = useTurno();
  const { hasRole } = useAuth();

  // Solo mostrar para cajeros o cuando no hay turno abierto
  if (hasRole('admin') && turnoActual) {
    return null;
  }

  return (
    <div className={className}>
      {turnoActual ? (
        <Card className="bg-green-50 border-green-200">
          <CardContent className="p-3">
            <div className="flex items-center space-x-3 text-sm">
              <div className="flex items-center space-x-1">
                <Unlock className="h-4 w-4 text-green-600" />
                <span className="font-semibold text-green-800">Turno Abierto</span>
              </div>
              <div className="flex items-center space-x-1 text-green-700">
                <User className="h-3 w-3" />
                <span>{turnoActual.cajero}</span>
              </div>
              <div className="flex items-center space-x-1 text-green-700">
                <Clock className="h-3 w-3" />
                <span>{turnoActual.horaApertura}</span>
              </div>
              <div className="flex items-center space-x-1 text-green-700">
                <DollarSign className="h-3 w-3" />
                <span>{turnoActual.ventasRealizadas} ventas</span>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="bg-red-50 border-red-200">
          <CardContent className="p-3">
            <div className="flex items-center space-x-2 text-sm">
              <Lock className="h-4 w-4 text-red-600" />
              <span className="font-semibold text-red-800">Sin turno abierto</span>
              {!hasRole('admin') && (
                <Badge variant="destructive" className="text-xs">
                  Solicitar apertura
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default TurnoStatus;