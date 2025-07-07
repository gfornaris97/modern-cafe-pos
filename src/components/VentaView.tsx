import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Minus, Trash2, DollarSign, Calculator } from "lucide-react";
import { useApp, Producto, ItemVenta } from '@/contexts/AppContext';
import { useToast } from "@/hooks/use-toast";
import PrintReceipt from './PrintReceipt';

const VentaView = () => {
  const { productos, registrarVenta } = useApp();
  const { toast } = useToast();
  const [carrito, setCarrito] = useState<ItemVenta[]>([]);
  const [filtroCategoria, setFiltroCategoria] = useState<string>('todas');
  const [ultimaVenta, setUltimaVenta] = useState<{items: ItemVenta[], total: number, montoPagado: number, vuelto: number} | null>(null);
  const [modalPago, setModalPago] = useState(false);
  const [metodoPago, setMetodoPago] = useState('efectivo');
  const [montoPagado, setMontoPagado] = useState('');

  const categorias = ['todas', ...Array.from(new Set(productos.map(p => p.categoria)))];

  const productosFiltrados = filtroCategoria === 'todas' 
    ? productos 
    : productos.filter(p => p.categoria === filtroCategoria);

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
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Productos */}
      <div className="lg:col-span-2">
        <Card>
          <CardHeader>
            <CardTitle>Productos</CardTitle>
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
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {productosFiltrados.map(producto => (
                <Card 
                  key={producto.id} 
                  className={`cursor-pointer hover:shadow-md transition-shadow ${
                    producto.stock <= 0 ? 'opacity-50' : ''
                  }`}
                >
                  <CardContent className="p-4" onClick={() => agregarAlCarrito(producto)}>
                    <div className="text-center">
                      <h3 className="font-semibold text-lg mb-2">{producto.nombre}</h3>
                      <Badge variant="secondary" className="mb-2">
                        {producto.categoria}
                      </Badge>
                      <p className="text-2xl font-bold text-green-600 mb-2">
                        ${producto.precio.toLocaleString()}
                      </p>
                      <p className={`text-sm ${producto.stock < 10 ? 'text-red-600' : 'text-gray-600'}`}>
                        Stock: {producto.stock}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Carrito */}
      <div>
        <Card>
          <CardHeader>
            <CardTitle>Carrito de Compras</CardTitle>
          </CardHeader>
          <CardContent>
            {carrito.length === 0 ? (
              <div>
                <p className="text-gray-500 text-center py-8">
                  El carrito está vacío
                </p>
                
                {/* Mostrar opción de imprimir recibo de la última venta */}
                {ultimaVenta && (
                  <div className="mt-4 p-4 bg-green-50 rounded-lg border border-green-200">
                    <h4 className="font-semibold text-green-800 mb-2">
                      Última venta procesada
                    </h4>
                    <div className="space-y-1 text-sm text-green-700 mb-3">
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
            ) : (
              <div className="space-y-4">
                {carrito.map(item => (
                  <div key={item.producto.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <h4 className="font-medium">{item.producto.nombre}</h4>
                      <p className="text-sm text-gray-600">
                        ${item.producto.precio.toLocaleString()} c/u
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => actualizarCantidad(item.producto.id, item.cantidad - 1)}
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                      <span className="w-8 text-center">{item.cantidad}</span>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => actualizarCantidad(item.producto.id, item.cantidad + 1)}
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => actualizarCantidad(item.producto.id, 0)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ))}
                
                <div className="border-t pt-4">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-xl font-bold">Total:</span>
                    <span className="text-2xl font-bold text-green-600">
                      ${total.toLocaleString()}
                    </span>
                  </div>
                  <Button 
                    className="w-full" 
                    size="lg"
                    onClick={procesarVenta}
                  >
                    Procesar Venta
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
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
            <div className="bg-gray-50 p-4 rounded-lg">
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
                    <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <div className="flex items-center justify-between">
                        <span className="text-blue-800 font-medium">Vuelto:</span>
                        <span className="text-xl font-bold text-blue-600">
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

export default VentaView;
