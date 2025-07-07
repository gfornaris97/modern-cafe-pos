import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { Calendar, Download, TrendingUp, DollarSign, Package, ShoppingCart } from "lucide-react";
import { useApp } from '@/contexts/AppContext';

const COLORS = ['#f59e0b', '#ef4444', '#10b981', '#3b82f6', '#8b5cf6'];

const ReportesView = () => {
  const { ventas, productos } = useApp();
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');
  const [periodo, setPeriodo] = useState('todo');

  // Filtrar ventas por fecha
  const ventasFiltradas = useMemo(() => {
    if (periodo === 'todo') return ventas;
    
    const hoy = new Date();
    let fechaFiltro: Date;
    
    switch (periodo) {
      case 'hoy':
        fechaFiltro = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate());
        return ventas.filter(venta => new Date(venta.fecha) >= fechaFiltro);
      case 'semana':
        fechaFiltro = new Date(hoy.getTime() - 7 * 24 * 60 * 60 * 1000);
        return ventas.filter(venta => new Date(venta.fecha) >= fechaFiltro);
      case 'mes':
        fechaFiltro = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
        return ventas.filter(venta => new Date(venta.fecha) >= fechaFiltro);
      case 'personalizado':
        if (!fechaInicio || !fechaFin) return ventas;
        return ventas.filter(venta => {
          const fechaVenta = new Date(venta.fecha);
          return fechaVenta >= new Date(fechaInicio) && fechaVenta <= new Date(fechaFin);
        });
      default:
        return ventas;
    }
  }, [ventas, periodo, fechaInicio, fechaFin]);

  // Estadísticas generales
  const estadisticas = useMemo(() => {
    const totalVentas = ventasFiltradas.length;
    const ingresoTotal = ventasFiltradas.reduce((sum, venta) => sum + venta.total, 0);
    const promedioVenta = totalVentas > 0 ? ingresoTotal / totalVentas : 0;
    const productosVendidos = ventasFiltradas.reduce((sum, venta) => 
      sum + venta.items.reduce((itemSum, item) => itemSum + item.cantidad, 0), 0
    );

    return {
      totalVentas,
      ingresoTotal,
      promedioVenta,
      productosVendidos
    };
  }, [ventasFiltradas]);

  // Datos para gráfico de ventas por día
  const ventasPorDia = useMemo(() => {
    const ventasPorFecha = ventasFiltradas.reduce((acc, venta) => {
      const fecha = venta.fecha;
      acc[fecha] = (acc[fecha] || 0) + venta.total;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(ventasPorFecha)
      .map(([fecha, total]) => ({ fecha, total }))
      .sort((a, b) => a.fecha.localeCompare(b.fecha));
  }, [ventasFiltradas]);

  // Productos más vendidos
  const productosMasVendidos = useMemo(() => {
    const conteoProductos = ventasFiltradas.reduce((acc, venta) => {
      venta.items.forEach(item => {
        acc[item.producto] = (acc[item.producto] || 0) + item.cantidad;
      });
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(conteoProductos)
      .map(([producto, cantidad]) => ({ producto, cantidad }))
      .sort((a, b) => b.cantidad - a.cantidad)
      .slice(0, 5);
  }, [ventasFiltradas]);

  // Ventas por categoría
  const ventasPorCategoria = useMemo(() => {
    const ventasCategoria = ventasFiltradas.reduce((acc, venta) => {
      venta.items.forEach(item => {
        const producto = productos.find(p => p.nombre === item.producto);
        const categoria = producto?.categoria || 'Sin categoría';
        acc[categoria] = (acc[categoria] || 0) + (item.cantidad * item.precio);
      });
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(ventasCategoria)
      .map(([categoria, total]) => ({ categoria, total }));
  }, [ventasFiltradas, productos]);

  // Métodos de pago
  const ventasPorMetodoPago = useMemo(() => {
    const metodosPago = ventasFiltradas.reduce((acc, venta) => {
      acc[venta.metodoPago] = (acc[venta.metodoPago] || 0) + venta.total;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(metodosPago)
      .map(([metodo, total]) => ({ metodo, total }));
  }, [ventasFiltradas]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold text-gray-800">Reportes de Ventas</h2>
        <Button variant="outline" className="flex items-center space-x-2">
          <Download className="h-4 w-4" />
          <span>Exportar</span>
        </Button>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Calendar className="h-5 w-5" />
            <span>Filtros</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4 items-end">
            <div className="min-w-[200px]">
              <Label htmlFor="periodo">Período</Label>
              <Select value={periodo} onValueChange={setPeriodo}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar período" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todo">Todo el tiempo</SelectItem>
                  <SelectItem value="hoy">Hoy</SelectItem>
                  <SelectItem value="semana">Última semana</SelectItem>
                  <SelectItem value="mes">Último mes</SelectItem>
                  <SelectItem value="personalizado">Personalizado</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {periodo === 'personalizado' && (
              <>
                <div>
                  <Label htmlFor="fechaInicio">Fecha inicio</Label>
                  <Input
                    id="fechaInicio"
                    type="date"
                    value={fechaInicio}
                    onChange={(e) => setFechaInicio(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="fechaFin">Fecha fin</Label>
                  <Input
                    id="fechaFin"
                    type="date"
                    value={fechaFin}
                    onChange={(e) => setFechaFin(e.target.value)}
                  />
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Estadísticas generales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Ventas</p>
                <p className="text-2xl font-bold">{estadisticas.totalVentas}</p>
              </div>
              <ShoppingCart className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Ingresos Totales</p>
                <p className="text-2xl font-bold">${estadisticas.ingresoTotal.toLocaleString()}</p>
              </div>
              <DollarSign className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Promedio por Venta</p>
                <p className="text-2xl font-bold">${Math.round(estadisticas.promedioVenta).toLocaleString()}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Productos Vendidos</p>
                <p className="text-2xl font-bold">{estadisticas.productosVendidos}</p>
              </div>
              <Package className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Ventas por día */}
        <Card>
          <CardHeader>
            <CardTitle>Ventas por Día</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <LineChart width={500} height={300} data={ventasPorDia}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="fecha" />
                <YAxis />
                <Tooltip formatter={(value) => [`$${Number(value).toLocaleString()}`, 'Total']} />
                <Line type="monotone" dataKey="total" stroke="#f59e0b" strokeWidth={2} />
              </LineChart>
            </div>
          </CardContent>
        </Card>

        {/* Productos más vendidos */}
        <Card>
          <CardHeader>
            <CardTitle>Productos Más Vendidos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <BarChart width={500} height={300} data={productosMasVendidos}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="producto" angle={-45} textAnchor="end" height={100} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="cantidad" fill="#f59e0b" />
              </BarChart>
            </div>
          </CardContent>
        </Card>

        {/* Ventas por categoría */}
        <Card>
          <CardHeader>
            <CardTitle>Ventas por Categoría</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80 flex justify-center">
              <PieChart width={400} height={300}>
                <Pie
                  data={ventasPorCategoria}
                  cx={200}
                  cy={150}
                  labelLine={false}
                  label={({ categoria, percent }) => `${categoria} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="total"
                >
                  {ventasPorCategoria.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`$${Number(value).toLocaleString()}`, 'Total']} />
              </PieChart>
            </div>
          </CardContent>
        </Card>

        {/* Métodos de pago */}
        <Card>
          <CardHeader>
            <CardTitle>Ventas por Método de Pago</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <BarChart width={500} height={300} data={ventasPorMetodoPago}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="metodo" />
                <YAxis />
                <Tooltip formatter={(value) => [`$${Number(value).toLocaleString()}`, 'Total']} />
                <Bar dataKey="total" fill="#10b981" />
              </BarChart>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabla de productos más vendidos */}
      <Card>
        <CardHeader>
          <CardTitle>Detalle de Productos Más Vendidos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Producto</th>
                  <th className="text-right p-2">Cantidad Vendida</th>
                  <th className="text-right p-2">Ingresos</th>
                </tr>
              </thead>
              <tbody>
                {productosMasVendidos.map((item, index) => {
                  const producto = productos.find(p => p.nombre === item.producto);
                  const ingresos = item.cantidad * (producto?.precio || 0);
                  return (
                    <tr key={index} className="border-b">
                      <td className="p-2">{item.producto}</td>
                      <td className="text-right p-2">{item.cantidad}</td>
                      <td className="text-right p-2">${ingresos.toLocaleString()}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ReportesView;