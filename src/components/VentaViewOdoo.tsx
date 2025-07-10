import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Minus, Trash2, DollarSign, ShoppingCart } from "lucide-react";
import { useApp, Producto, ItemVenta } from '@/contexts/AppContext';
import { useTurno } from '@/contexts/TurnoContext';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from "@/hooks/use-toast";
import PrintReceipt from './PrintReceipt';

const VentaViewOdoo = () => {
  const { productos, registrarVenta } = useApp();
  const { turnoActual, actualizarTurno } = useTurno();
  const { user, hasRole } = useAuth();
  const { toast } = useToast();
  const [carrito, setCarrito] = useState<ItemVenta[]>([]);
  const [filtroCategoria, setFiltroCategoria] = useState<string>('todas');
  const [ultimaVenta, setUltimaVenta] = useState<{items: ItemVenta[], total: number, montoPagado: number, vuelto: number} | null>(null);
  const [metodoPago, setMetodoPago] = useState('efectivo');
  const [montoPagado, setMontoPagado] = useState('');

  const categorias = ['todas', ...Array.from(new Set(productos.map(p => p.categoria)))];

  const productosFiltrados = productos.filter(producto => {
    return filtroCategoria === 'todas' || producto.categoria === filtroCategoria;
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

  const confirmarVenta = () => {
    if (carrito.length === 0) {
      toast({
        title: "Carrito vacío",
        description: "Agrega productos al carrito antes de procesar la venta",
        variant: "destructive"
      });
      return;
    }
    
    
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
    
    setUltimaVenta({
      items: [...carrito],
      total,
      montoPagado: monto,
      vuelto
    });
    
    registrarVenta(carrito, metodoPago, monto);
    
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
    setMontoPagado('');
    setMetodoPago('efectivo');
  };

  const handlePrintComplete = () => {
    setUltimaVenta(null);
  };

  const vuelto = montoPagado ? Math.max(0, Number(montoPagado) - total) : 0;

  const NumericKeypad = () => {
    const buttons = [
      ['7', '8', '9'],
      ['4', '5', '6'],
      ['1', '2', '3'],
      ['C', '0', '←']
    ];

    const handleKeypadClick = (value: string) => {
      if (value === 'C') {
        setMontoPagado('');
      } else if (value === '←') {
        setMontoPagado(prev => prev.slice(0, -1));
      } else {
        setMontoPagado(prev => {
          const newValue = prev + value;
          return newValue;
        });
      }
    };

    return (
      <div className="space-y-2">
        {buttons.map((row, rowIndex) => (
          <div key={rowIndex} className="grid grid-cols-3 gap-2">
            {row.map((button) => (
              <Button
                key={button}
                variant="outline"
                className="h-12 text-lg font-medium"
                onClick={() => handleKeypadClick(button)}
              >
                {button}
              </Button>
            ))}
          </div>
        ))}
        <Button 
          className="w-full h-12 text-lg mt-3"
          onClick={confirmarVenta}
          disabled={carrito.length === 0 || !montoPagado || Number(montoPagado) < total}
        >
          <DollarSign className="h-5 w-5 mr-2" />
          Procesar Venta
        </Button>
      </div>
    );
  };

  return (
    <div className="h-screen bg-gray-100 dark:bg-gray-900 flex flex-col">
      {/* Barra superior con información del turno */}
      <div className="h-8 bg-white dark:bg-gray-800 border-b px-4 flex items-center justify-between text-xs">
        <div className="flex items-center space-x-4">
          {hasRole('admin') ? (
            <span className="text-blue-600 dark:text-blue-400 font-medium">👑 Administrador</span>
          ) : (
            <span className="text-gray-600 dark:text-gray-400">Usuario</span>
          )}
        </div>
        <div className="flex items-center space-x-2">
          {turnoActual ? (
            <span className="bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 px-2 py-1 rounded">
              Turno: {turnoActual.cajero}
            </span>
          ) : (
            <span className="bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 px-2 py-1 rounded">
              Sin turno
            </span>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-1">
        {/* Columna izquierda - Carrito y Pago - Más ancha */}
        <div className="w-[480px] bg-white dark:bg-gray-800 border-r p-4 flex flex-col">
          {/* Lista de productos en el carrito */}
          <div className="flex-1 mb-4 overflow-hidden">
            <h2 className="text-lg font-semibold mb-4">Carrito</h2>
            {carrito.length === 0 ? (
              <div className="text-center py-8">
                <ShoppingCart className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">Carrito vacío</p>
              </div>
            ) : (
              <div className="space-y-2 overflow-y-auto h-full max-h-[40vh]">
                {carrito.map(item => (
                  <div key={item.producto.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="flex-1">
                      <h3 className="font-medium">{item.producto.nombre}</h3>
                      <p className="text-sm text-muted-foreground">
                        ${item.producto.precio.toLocaleString()} × {item.cantidad}
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
                      <span className="w-8 text-center font-medium">{item.cantidad}</span>
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
            )}
          </div>

          {/* Totales */}
          <div className="border-t pt-4 space-y-3">
            <div className="text-right">
              <p className="text-2xl font-bold">Total: ${total.toLocaleString()}</p>
            </div>

            {/* Fila compacta: Monto y Método de pago */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium mb-1">Monto recibido:</label>
                <div className="p-2 bg-gray-50 dark:bg-gray-700 rounded text-center">
                  <span className="text-lg font-bold">
                    ${montoPagado ? Number(montoPagado).toLocaleString() : '0'}
                  </span>
                </div>
              </div>
              
              <div>
                <label className="block text-xs font-medium mb-1">Método:</label>
                <Select value={metodoPago} onValueChange={setMetodoPago}>
                  <SelectTrigger className="h-10">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="efectivo">Efectivo</SelectItem>
                    <SelectItem value="tarjeta">Tarjeta</SelectItem>
                    <SelectItem value="transferencia">Transferencia</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <NumericKeypad />
              
            {montoPagado && Number(montoPagado) >= total && (
              <div className="p-2 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <p className="text-green-800 dark:text-green-200 font-bold">
                  Vuelto: ${vuelto.toLocaleString()}
                </p>
              </div>
            )}

            {ultimaVenta && (
              <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <h4 className="font-semibold text-green-800 dark:text-green-200 mb-2">
                  Última venta: ${ultimaVenta.total.toLocaleString()}
                </h4>
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

        {/* Columna derecha - Productos - Más compacta */}
        <div className="flex-1 p-4 overflow-hidden flex flex-col">
          {/* Filtros de categoría */}
          <div className="mb-4 flex-shrink-0">
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
          </div>

          {/* Grid de productos con scroll */}
          <div className="flex-1 overflow-y-auto">
            <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
              {productosFiltrados.map(producto => (
                <Card 
                  key={producto.id} 
                  className={`cursor-pointer hover:shadow-lg transition-all duration-200 ${
                    producto.stock <= 0 ? 'opacity-50' : ''
                  }`}
                  onClick={() => agregarAlCarrito(producto)}
                >
                  <CardContent className="p-3">
                    <div className="text-center space-y-1">
                      <div className="h-12 bg-gradient-to-br from-primary/10 to-primary/20 rounded-lg flex items-center justify-center mb-2">
                        <span className="text-lg font-bold text-primary">
                          {producto.nombre.charAt(0)}
                        </span>
                      </div>
                      <h3 className="font-semibold text-xs leading-tight line-clamp-2">{producto.nombre}</h3>
                      <p className="text-sm font-bold text-green-600">
                        ${producto.precio.toLocaleString()}
                      </p>
                      <p className={`text-xs ${producto.stock < 10 ? 'text-destructive' : 'text-muted-foreground'}`}>
                        {producto.stock}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VentaViewOdoo;