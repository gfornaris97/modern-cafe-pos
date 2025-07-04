
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Calendar, Search, DollarSign } from "lucide-react";
import { useApp, Venta } from '@/contexts/AppContext';

const HistorialView = () => {
  const { ventas } = useApp();
  const [filtroFecha, setFiltroFecha] = useState('');
  const [ventaSeleccionada, setVentaSeleccionada] = useState<Venta | null>(null);

  const ventasFiltradas = filtroFecha 
    ? ventas.filter(venta => venta.fecha === filtroFecha)
    : ventas;

  const totalVentas = ventasFiltradas.reduce((sum, venta) => sum + venta.total, 0);
  const promedioVenta = ventasFiltradas.length > 0 ? totalVentas / ventasFiltradas.length : 0;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Panel de Control */}
      <div className="space-y-6">
        {/* Filtros */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Search className="h-5 w-5" />
              <span>Filtros</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Fecha</label>
                <Input
                  type="date"
                  value={filtroFecha}
                  onChange={(e) => setFiltroFecha(e.target.value)}
                />
              </div>
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => setFiltroFecha('')}
              >
                Limpiar Filtros
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Estadísticas */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <DollarSign className="h-5 w-5" />
              <span>Estadísticas</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="text-center">
                <p className="text-sm text-gray-600">Total Ventas</p>
                <p className="text-2xl font-bold text-green-600">
                  ${totalVentas.toLocaleString()}
                </p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-600">Promedio por Venta</p>
                <p className="text-xl font-semibold">
                  ${Math.round(promedioVenta).toLocaleString()}
                </p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-600">Número de Ventas</p>
                <p className="text-xl font-semibold">
                  {ventasFiltradas.length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Lista de Ventas */}
      <div className="lg:col-span-2 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Historial de Ventas</CardTitle>
          </CardHeader>
          <CardContent>
            {ventas.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">No hay ventas registradas</p>
                <p className="text-sm text-gray-400 mt-2">
                  Las ventas aparecerán aquí cuando se procesen en la vista de Ventas
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {ventasFiltradas.map(venta => (
                  <div 
                    key={venta.id} 
                    className="p-4 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors"
                    onClick={() => setVentaSeleccionada(venta)}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center space-x-2 mb-2">
                          <Calendar className="h-4 w-4 text-gray-500" />
                          <span className="text-sm text-gray-600">
                            {venta.fecha} - {venta.hora}
                          </span>
                          <Badge variant={venta.metodoPago === 'Efectivo' ? 'default' : 'secondary'}>
                            {venta.metodoPago}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600">
                          {venta.items.length} producto(s)
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xl font-bold text-green-600">
                          ${venta.total.toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Detalle de Venta */}
        {ventaSeleccionada && (
          <Card>
            <CardHeader>
              <CardTitle>Detalle de Venta #{ventaSeleccionada.id}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between text-sm">
                  <span>Fecha:</span>
                  <span>{ventaSeleccionada.fecha} - {ventaSeleccionada.hora}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Método de Pago:</span>
                  <Badge variant={ventaSeleccionada.metodoPago === 'Efectivo' ? 'default' : 'secondary'}>
                    {ventaSeleccionada.metodoPago}
                  </Badge>
                </div>
                
                <div className="border-t pt-4">
                  <h4 className="font-semibold mb-3">Productos:</h4>
                  {ventaSeleccionada.items.map((item, index) => (
                    <div key={index} className="flex justify-between items-center py-2">
                      <div>
                        <span className="font-medium">{item.producto}</span>
                        <span className="text-gray-600 ml-2">
                          (${item.precio.toLocaleString()} x {item.cantidad})
                        </span>
                      </div>
                      <span className="font-semibold">
                        ${(item.precio * item.cantidad).toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
                
                <div className="border-t pt-4">
                  <div className="flex justify-between items-center">
                    <span className="text-xl font-bold">Total:</span>
                    <span className="text-2xl font-bold text-green-600">
                      ${ventaSeleccionada.total.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
        </Card>
        )}
      </div>
    </div>
  );
};

export default HistorialView;
