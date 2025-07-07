import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { 
  DollarSign, 
  Lock, 
  Unlock, 
  Clock, 
  User, 
  Calculator,
  TrendingUp,
  AlertCircle
} from "lucide-react";
import { useApp } from '@/contexts/AppContext';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from "@/hooks/use-toast";

interface Turno {
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

const ControlCajaView = () => {
  const { ventas } = useApp();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [turnoActual, setTurnoActual] = useState<Turno | null>(() => {
    const turnoGuardado = localStorage.getItem('cafe-pos-turno');
    return turnoGuardado ? JSON.parse(turnoGuardado) : null;
  });
  
  const [turnos, setTurnos] = useState<Turno[]>(() => {
    const turnosGuardados = localStorage.getItem('cafe-pos-turnos');
    return turnosGuardados ? JSON.parse(turnosGuardados) : [];
  });
  
  const [montoApertura, setMontoApertura] = useState('');
  const [montoCierre, setMontoCierre] = useState('');
  const [modalApertura, setModalApertura] = useState(false);
  const [modalCierre, setModalCierre] = useState(false);

  // Calcular ventas del turno actual
  const ventasDelTurno = turnoActual ? ventas.filter(venta => {
    const fechaVenta = new Date(`${venta.fecha} ${venta.hora}`);
    const fechaApertura = new Date(`${turnoActual.fechaApertura} ${turnoActual.horaApertura}`);
    return fechaVenta >= fechaApertura;
  }) : [];

  const totalVentasTurno = ventasDelTurno.reduce((sum, venta) => sum + venta.total, 0);

  const abrirTurno = () => {
    if (!montoApertura || isNaN(Number(montoApertura))) {
      toast({
        title: "Error",
        description: "Ingresa un monto válido para abrir la caja",
        variant: "destructive"
      });
      return;
    }

    const ahora = new Date();
    const nuevoTurno: Turno = {
      id: Date.now().toString(),
      fechaApertura: ahora.toISOString().split('T')[0],
      horaApertura: ahora.toTimeString().split(' ')[0].slice(0, 5),
      cajero: user?.name || 'Usuario',
      montoApertura: Number(montoApertura),
      ventasRealizadas: 0,
      totalVentas: 0,
      estado: 'abierto'
    };

    setTurnoActual(nuevoTurno);
    localStorage.setItem('cafe-pos-turno', JSON.stringify(nuevoTurno));
    
    toast({
      title: "Turno abierto",
      description: `Caja abierta con $${Number(montoApertura).toLocaleString()}`
    });
    
    setMontoApertura('');
    setModalApertura(false);
  };

  const cerrarTurno = () => {
    if (!turnoActual) return;
    
    if (!montoCierre || isNaN(Number(montoCierre))) {
      toast({
        title: "Error",
        description: "Ingresa el monto de cierre de caja",
        variant: "destructive"
      });
      return;
    }

    const ahora = new Date();
    const turnoCerrado: Turno = {
      ...turnoActual,
      fechaCierre: ahora.toISOString().split('T')[0],
      horaCierre: ahora.toTimeString().split(' ')[0].slice(0, 5),
      montoCierre: Number(montoCierre),
      ventasRealizadas: ventasDelTurno.length,
      totalVentas: totalVentasTurno,
      estado: 'cerrado'
    };

    // Guardar turno cerrado en historial
    const nuevosTurnos = [...turnos, turnoCerrado];
    setTurnos(nuevosTurnos);
    localStorage.setItem('cafe-pos-turnos', JSON.stringify(nuevosTurnos));
    
    // Limpiar turno actual
    setTurnoActual(null);
    localStorage.removeItem('cafe-pos-turno');
    
    toast({
      title: "Turno cerrado",
      description: `Turno cerrado exitosamente. Total ventas: $${totalVentasTurno.toLocaleString()}`
    });
    
    setMontoCierre('');
    setModalCierre(false);
  };

  const montoEsperadoCierre = turnoActual ? turnoActual.montoApertura + totalVentasTurno : 0;
  const diferencia = montoCierre ? Number(montoCierre) - montoEsperadoCierre : 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold text-gray-800">Control de Caja</h2>
        <Badge variant={turnoActual ? "default" : "secondary"} className="text-sm px-3 py-1">
          {turnoActual ? "Caja Abierta" : "Caja Cerrada"}
        </Badge>
      </div>

      {/* Estado actual de la caja */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            {turnoActual ? (
              <Unlock className="h-5 w-5 text-green-600" />
            ) : (
              <Lock className="h-5 w-5 text-red-600" />
            )}
            <span>Estado Actual</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {turnoActual ? (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center space-x-3">
                  <User className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="text-sm text-gray-600">Cajero</p>
                    <p className="font-semibold">{turnoActual.cajero}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <Clock className="h-5 w-5 text-purple-600" />
                  <div>
                    <p className="text-sm text-gray-600">Apertura</p>
                    <p className="font-semibold">
                      {turnoActual.fechaApertura} - {turnoActual.horaApertura}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <DollarSign className="h-5 w-5 text-green-600" />
                  <div>
                    <p className="text-sm text-gray-600">Monto Inicial</p>
                    <p className="font-semibold">
                      ${turnoActual.montoApertura.toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t">
                <div className="flex items-center space-x-3">
                  <TrendingUp className="h-5 w-5 text-orange-600" />
                  <div>
                    <p className="text-sm text-gray-600">Ventas Realizadas</p>
                    <p className="font-semibold">{ventasDelTurno.length}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <Calculator className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="text-sm text-gray-600">Total Ventas</p>
                    <p className="font-semibold text-green-600">
                      ${totalVentasTurno.toLocaleString()}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <DollarSign className="h-5 w-5 text-purple-600" />
                  <div>
                    <p className="text-sm text-gray-600">Total Esperado</p>
                    <p className="font-semibold">
                      ${montoEsperadoCierre.toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <Lock className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 mb-4">La caja está cerrada</p>
              <p className="text-sm text-gray-500">
                Abre un turno para comenzar a registrar ventas
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Botones de acción */}
      <div className="flex gap-4">
        {!turnoActual ? (
          <Dialog open={modalApertura} onOpenChange={setModalApertura}>
            <DialogTrigger asChild>
              <Button className="flex items-center space-x-2">
                <Unlock className="h-4 w-4" />
                <span>Abrir Turno</span>
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Abrir Turno de Caja</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="montoApertura">Monto inicial en caja</Label>
                  <Input
                    id="montoApertura"
                    type="number"
                    value={montoApertura}
                    onChange={(e) => setMontoApertura(e.target.value)}
                    placeholder="0"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Ingresa el dinero en efectivo con el que inicias
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button onClick={abrirTurno} className="flex-1">
                    Abrir Turno
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => setModalApertura(false)}
                  >
                    Cancelar
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        ) : (
          <Dialog open={modalCierre} onOpenChange={setModalCierre}>
            <DialogTrigger asChild>
              <Button variant="destructive" className="flex items-center space-x-2">
                <Lock className="h-4 w-4" />
                <span>Cerrar Turno</span>
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Cerrar Turno de Caja</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                  <div className="flex justify-between">
                    <span>Monto inicial:</span>
                    <span>${turnoActual.montoApertura.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Total ventas:</span>
                    <span className="text-green-600">
                      +${totalVentasTurno.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between font-semibold border-t pt-2">
                    <span>Total esperado:</span>
                    <span>${montoEsperadoCierre.toLocaleString()}</span>
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="montoCierre">Dinero actual en caja</Label>
                  <Input
                    id="montoCierre"
                    type="number"
                    value={montoCierre}
                    onChange={(e) => setMontoCierre(e.target.value)}
                    placeholder="0"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Cuenta el dinero físico en la caja
                  </p>
                </div>

                {montoCierre && (
                  <div className={`p-3 rounded-lg flex items-center space-x-2 ${
                    diferencia === 0 
                      ? 'bg-green-50 text-green-800' 
                      : diferencia > 0 
                      ? 'bg-blue-50 text-blue-800'
                      : 'bg-red-50 text-red-800'
                  }`}>
                    <AlertCircle className="h-4 w-4" />
                    <span className="text-sm">
                      {diferencia === 0 
                        ? 'Perfecto! La caja cuadra exactamente'
                        : diferencia > 0
                        ? `Sobrante: $${diferencia.toLocaleString()}`
                        : `Faltante: $${Math.abs(diferencia).toLocaleString()}`
                      }
                    </span>
                  </div>
                )}
                
                <div className="flex gap-2">
                  <Button onClick={cerrarTurno} className="flex-1">
                    Cerrar Turno
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => setModalCierre(false)}
                  >
                    Cancelar
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Historial de turnos */}
      <Card>
        <CardHeader>
          <CardTitle>Historial de Turnos</CardTitle>
        </CardHeader>
        <CardContent>
          {turnos.length === 0 ? (
            <p className="text-gray-500 text-center py-4">
              No hay turnos registrados
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2">Fecha</th>
                    <th className="text-left p-2">Cajero</th>
                    <th className="text-right p-2">Monto Inicial</th>
                    <th className="text-right p-2">Ventas</th>
                    <th className="text-right p-2">Total Ventas</th>
                    <th className="text-right p-2">Monto Final</th>
                    <th className="text-right p-2">Diferencia</th>
                  </tr>
                </thead>
                <tbody>
                  {turnos.slice().reverse().map((turno) => {
                    const diferenciaTurno = turno.montoCierre 
                      ? turno.montoCierre - (turno.montoApertura + turno.totalVentas)
                      : 0;
                    
                    return (
                      <tr key={turno.id} className="border-b">
                        <td className="p-2">
                          {turno.fechaApertura}
                          <br />
                          <span className="text-xs text-gray-500">
                            {turno.horaApertura} - {turno.horaCierre}
                          </span>
                        </td>
                        <td className="p-2">{turno.cajero}</td>
                        <td className="text-right p-2">
                          ${turno.montoApertura.toLocaleString()}
                        </td>
                        <td className="text-right p-2">{turno.ventasRealizadas}</td>
                        <td className="text-right p-2 text-green-600">
                          ${turno.totalVentas.toLocaleString()}
                        </td>
                        <td className="text-right p-2">
                          ${turno.montoCierre?.toLocaleString() || 'N/A'}
                        </td>
                        <td className={`text-right p-2 ${
                          diferenciaTurno === 0 
                            ? 'text-green-600' 
                            : diferenciaTurno > 0 
                            ? 'text-blue-600'
                            : 'text-red-600'
                        }`}>
                          {diferenciaTurno === 0 
                            ? '✓' 
                            : `$${diferenciaTurno.toLocaleString()}`
                          }
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ControlCajaView;