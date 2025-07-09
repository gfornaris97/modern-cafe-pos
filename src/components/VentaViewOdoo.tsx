import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Minus, Trash2, DollarSign, Calculator, Search, Grid, List, ShoppingCart } from "lucide-react";
import { useApp, Producto, ItemVenta } from '@/contexts/AppContext';
import { useTurno } from '@/contexts/TurnoContext';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from "@/hooks/use-toast";
import PrintReceipt from './PrintReceipt';
import StockAlerts from './StockAlerts';

const VentaViewOdoo = () => {
  const { productos, registrarVenta } = useApp();
  const { turnoActual, actualizarTurno } = useTurno();
  const { user, hasRole } = useAuth();
  const { toast } = useToast();
  const [carrito, setCarrito] = useState<ItemVenta[]>([]);
  const [filtroCategoria, setFiltroCategoria] = useState<string>('todas');
  const [busqueda, setBusqueda] = useState('');
  const [ultimaVenta, setUltimaVenta] = useState<{items: ItemVenta[], total: number, montoPagado: number, vuelto: number} | null>(null);
  const [modalPago, setModalPago] = useState(false);
  const [metodoPago, setMetodoPago] = useState('efectivo');
  const [montoPagado, setMontoPagado] = useState('');
  const [vistaGrid, setVistaGrid] = useState(true);

  const categorias = ['todas', ...Array.from(new Set(productos.map(p => p.categoria)))];

  const productosFiltrados = productos.filter(producto => {
    const matchCategoria = filtroCategoria === 'todas' || producto.categoria === filtroCategoria;
    const matchBusqueda = producto.nombre.toLowerCase().includes(busqueda.toLowerCase());
    return matchCategoria && matchBusqueda;
  });

  const agregarAlCarrito = (producto: Producto) => {
    if (producto.stock <= 0) {
      toast({
        title: "Sin stock",
        description: `${producto.nombre} no tiene stock disponible`,
        variant: "destructive"
      });
      return;
    }

    const cantidadEnCarrito = carrito.find(item => item.producto.id === producto.id)?.cantidad || 0;
    
    if (cantidadEnCarrito >= producto.stock) {
      toast({
        title: "Stock insuficiente",
        description: `Solo hay ${producto.stock} unidades disponibles de ${producto.nombre}`,
        variant: "destructive"
      });
      return;
    }

    setCarrito(prev => {
      const itemExistente = prev.find(item => item.producto.id === producto.id);
      if (itemExistente) {
        return prev.map(item =>
          item.producto.id === producto.id
            ? { ...item, cantidad: item.cantidad + 1 }
            : item
        );
      } else {
        return [...prev, { producto, cantidad: 1 }];
      }
    });
  };

  const actualizarCantidad = (id: number, nuevaCantidad: number) => {
    if (nuevaCantidad <= 0) {
      setCarrito(prev => prev.filter(item => item.producto.id !== id));
    } else {
      const producto = productos.find(p => p.id === id);
      if (producto && nuevaCantidad > producto.stock) {
        toast({
          title: "Stock insuficiente",
          description: `Solo hay ${producto.stock} unidades disponibles`,
          variant: "destructive"
        });
        return;
      }
      
      setCarrito(prev =>
        prev.map(item =>
          item.producto.id === id
            ? { ...item, cantidad: nuevaCantidad }
            : item
        )
      );
    }
  };

  const total = carrito.reduce((sum, item) => sum + (item.producto.precio * item.cantidad), 0);

  const procesarVenta = () => {
    if (carrito.length === 0) {
      toast({
        title: "Carrito vacío",
        description: "Agrega productos al carrito antes de procesar la venta",
        variant: "destructive"
      });
      return;
    }
    
    // Verificar que hay turno abierto para cajeros
    if (!hasRole('admin') && !turnoActual) {
      toast({
        title: "Turno no iniciado",
        description: "No hay turno abierto. Solicita al administrador que abra un turno",
        variant: "destructive"
      });
      return;
    }
    
    // Abrir modal de pago
    setModalPago(true);
    setMontoPagado(total.toString());
  };

  const confirmarVenta = () => {
    const monto = Number(montoPagado);
    
    if (isNaN(monto) || monto < total) {
      toast({
        title: "Monto insuficiente",
        description: `El monto pagado debe ser al menos $${total.toLocaleString()}`,
        variant: "destructive"
      });
      return;
    }

    const vuelto = monto - total;
    
    // Guardar la venta actual para poder imprimir el recibo
    setUltimaVenta({
      items: [...carrito],
      total,
      montoPagado: monto,
      vuelto
    });
    
    registrarVenta(carrito, metodoPago, monto);
    
    // Actualizar turno con nueva venta
    if (turnoActual) {
      actualizarTurno(turnoActual.ventasRealizadas + 1, turnoActual.totalVentas + total);
    }
    
    toast({
      title: "Venta procesada",
      description: vuelto > 0 
        ? `Venta procesada. Vuelto: $${vuelto.toLocaleString()}` 
        : "Venta procesada exitosamente"
    });
    
    setCarrito([]);
    setModalPago(false);
    setMontoPagado('');
    setMetodoPago('efectivo');
  };

  const handlePrintComplete = () => {
    setUltimaVenta(null);
  };

  const vuelto = montoPagado ? Math.max(0, Number(montoPagado) - total) : 0;

  return (
    <div className="h-[calc(100vh-200px)] flex flex-col space-y-4">
      {/* Alertas de stock */}
      <StockAlerts />
      
      {/* Información del turno para cajeros */}
      {!hasRole('admin') && (
        <Card className="flex-shrink-0">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center space-x-2 text-lg">
              <Calculator className="h-5 w-5" />
              <span>Estado del Turno</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            {turnoActual ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">Turno abierto por</p>
                  <p className="font-semibold">{turnoActual.cajero}</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">Inicio</p>
                  <p className="font-semibold">{turnoActual.fechaApertura} - {turnoActual.horaApertura}</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">Ventas del turno</p>
                  <p className="font-semibold text-green-600">{turnoActual.ventasRealizadas}</p>
                </div>
              </div>
            ) : (
              <div className="text-center py-4">
                <p className="text-destructive font-semibold">No hay turno abierto</p>
                <p className="text-sm text-muted-foreground">Solicita al administrador que abra un turno</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
      
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-4 min-h-0">
        {/* Panel de productos */}
        <div className="lg:col-span-2 flex flex-col min-h-0">
          <Card className="flex-1 flex flex-col min-h-0">
            <CardHeader className="flex-shrink-0 pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl">Productos</CardTitle>
                <div className="flex items-center space-x-2">
                  <Button
                    variant={vistaGrid ? "default" : "outline"}
                    size="sm"
                    onClick={() => setVistaGrid(true)}
                  >
                    <Grid className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={!vistaGrid ? "default" : "outline"}
                    size="sm"
                    onClick={() => setVistaGrid(false)}
                  >
                    <List className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              
              {/* Barra de búsqueda */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Buscar productos..."
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              {/* Filtros de categoría */}
              <div className="flex flex-wrap gap-2">
                {categorias.map(categoria => (
                  <Button
                    key={categoria}
                    variant={filtroCategoria === categoria ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setFiltroCategoria(categoria)}
                    className="capitalize"
                  >
                    {categoria}
                  </Button>
                ))}
              </div>
            </CardHeader>
            
            <CardContent className="flex-1 overflow-auto">
              {vistaGrid ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                  {productosFiltrados.map(producto => (
                    <Card 
                      key={producto.id} 
                      className={`cursor-pointer hover:shadow-lg transition-all duration-200 border-2 hover:border-primary/50 ${
                        producto.stock <= 0 ? 'opacity-50' : ''
                      }`}
                      onClick={() => agregarAlCarrito(producto)}
                    >
                      <CardContent className="p-4">
                        <div className="text-center space-y-2">
                          <div className="h-16 bg-gradient-to-br from-primary/10 to-primary/20 rounded-lg flex items-center justify-center mb-3">
                            <span className="text-2xl font-bold text-primary">
                              {producto.nombre.charAt(0)}
                            </span>
                          </div>
                          <h3 className="font-semibold text-lg leading-tight">{producto.nombre}</h3>
                          <Badge variant="secondary" className="text-xs">
                            {producto.categoria}
                          </Badge>
                          <p className="text-2xl font-bold text-green-600">
                            ${producto.precio.toLocaleString()}
                          </p>
                          <p className={`text-sm font-medium ${producto.stock < 10 ? 'text-destructive' : 'text-muted-foreground'}`}>
                            Stock: {producto.stock}
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="space-y-2">
                  {productosFiltrados.map(producto => (
                    <div
                      key={producto.id}
                      className={`flex items-center justify-between p-4 border rounded-lg cursor-pointer hover:bg-accent transition-colors ${
                        producto.stock <= 0 ? 'opacity-50' : ''
                      }`}
                      onClick={() => agregarAlCarrito(producto)}
                    >
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-primary/10 to-primary/20 rounded-lg flex items-center justify-center">
                          <span className="text-lg font-bold text-primary">
                            {producto.nombre.charAt(0)}
                          </span>
                        </div>
                        <div>
                          <h3 className="font-semibold">{producto.nombre}</h3>
                          <p className="text-sm text-muted-foreground">{producto.categoria}</p>
                        </div>
                      </div>
                      <div className="text-right space-y-1">
                        <p className="text-xl font-bold text-green-600">
                          ${producto.precio.toLocaleString()}
                        </p>
                        <p className={`text-sm ${producto.stock < 10 ? 'text-destructive' : 'text-muted-foreground'}`}>
                          Stock: {producto.stock}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Panel del carrito */}
        <div className="flex flex-col min-h-0">
          <Card className="flex-1 flex flex-col min-h-0">
            <CardHeader className="flex-shrink-0">
              <CardTitle className="flex items-center space-x-2">
                <ShoppingCart className="h-5 w-5" />
                <span>Carrito ({carrito.length})</span>
              </CardTitle>
            </CardHeader>
            
            <CardContent className="flex-1 flex flex-col min-h-0">
              {carrito.length === 0 ? (
                <div className="flex-1 flex flex-col justify-center">
                  <div className="text-center space-y-4">
                    <ShoppingCart className="h-16 w-16 text-muted-foreground mx-auto" />
                    <p className="text-muted-foreground">El carrito está vacío</p>
                    <p className="text-sm text-muted-foreground">
                      Selecciona productos para comenzar una venta
                    </p>
                    
                    {/* Mostrar opción de imprimir recibo de la última venta */}
                    {ultimaVenta && (
                      <div className="mt-6 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                        <h4 className="font-semibold text-green-800 dark:text-green-200 mb-2">
                          Última venta procesada
                        </h4>
                        <div className="space-y-1 text-sm text-green-700 dark:text-green-300 mb-3">
                          <p>Total: ${ultimaVenta.total.toLocaleString()}</p>
                          <p>Pagado: ${ultimaVenta.montoPagado.toLocaleString()}</p>
                          {ultimaVenta.vuelto > 0 && (
                            <p className="font-semibold">Vuelto: ${ultimaVenta.vuelto.toLocaleString()}</p>
                          )}
                        </div>
                        <PrintReceipt 
                          items={ultimaVenta.items}
                          total={ultimaVenta.total}
                          montoPagado={ultimaVenta.montoPagado}
                          vuelto={ultimaVenta.vuelto}
                          onPrint={handlePrintComplete}
                        />
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex-1 overflow-auto space-y-3">
                    {carrito.map(item => (
                      <div key={item.producto.id} className="flex items-center justify-between p-3 bg-accent/50 rounded-lg">
                        <div className="flex-1">
                          <h4 className="font-medium text-sm leading-tight">{item.producto.nombre}</h4>
                          <p className="text-xs text-muted-foreground">
                            ${item.producto.precio.toLocaleString()} c/u
                          </p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-8 w-8 p-0"
                            onClick={() => actualizarCantidad(item.producto.id, item.cantidad - 1)}
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="w-8 text-center text-sm font-medium">{item.cantidad}</span>
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-8 w-8 p-0"
                            onClick={() => actualizarCantidad(item.producto.id, item.cantidad + 1)}
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            className="h-8 w-8 p-0"
                            onClick={() => actualizarCantidad(item.producto.id, 0)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="border-t pt-4 mt-4 space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-bold">Total:</span>
                      <span className="text-2xl font-bold text-green-600">
                        ${total.toLocaleString()}
                      </span>
                    </div>
                    <Button 
                      className="w-full" 
                      size="lg"
                      onClick={procesarVenta}
                    >
                      <DollarSign className="h-4 w-4 mr-2" />
                      Procesar Venta
                    </Button>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Modal de Pago */}
      <Dialog open={modalPago} onOpenChange={setModalPago}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <DollarSign className="h-5 w-5" />
              <span>Procesar Pago</span>
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="bg-accent p-4 rounded-lg">
              <div className="flex justify-between items-center mb-2">
                <span className="text-lg font-semibold">Total a pagar:</span>
                <span className="text-2xl font-bold text-green-600">
                  ${total.toLocaleString()}
                </span>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <Label htmlFor="metodoPago">Método de pago</Label>
                <Select value={metodoPago} onValueChange={setMetodoPago}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="efectivo">Efectivo</SelectItem>
                    <SelectItem value="tarjeta">Tarjeta</SelectItem>
                    <SelectItem value="transferencia">Transferencia</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {metodoPago === 'efectivo' && (
                <div>
                  <Label htmlFor="montoPagado">Monto recibido</Label>
                  <Input
                    id="montoPagado"
                    type="number"
                    value={montoPagado}
                    onChange={(e) => setMontoPagado(e.target.value)}
                    placeholder="0"
                    min={total}
                  />
                  {montoPagado && Number(montoPagado) >= total && (
                    <div className="mt-2 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                      <div className="flex items-center justify-between">
                        <span className="text-blue-800 dark:text-blue-200 font-medium">Vuelto:</span>
                        <span className="text-xl font-bold text-blue-600 dark:text-blue-400">
                          ${vuelto.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="flex gap-3">
              <Button 
                onClick={confirmarVenta} 
                className="flex-1"
                disabled={metodoPago === 'efectivo' && (!montoPagado || Number(montoPagado) < total)}
              >
                <Calculator className="h-4 w-4 mr-2" />
                Confirmar Venta
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setModalPago(false)}
              >
                Cancelar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default VentaViewOdoo;