import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Minus, Trash2 } from "lucide-react";
import { useApp, Producto, ItemVenta } from '@/contexts/AppContext';
import { useToast } from "@/hooks/use-toast";
import PrintReceipt from './PrintReceipt';

const VentaView = () => {
  const { productos, registrarVenta } = useApp();
  const { toast } = useToast();
  const [carrito, setCarrito] = useState<ItemVenta[]>([]);
  const [filtroCategoria, setFiltroCategoria] = useState<string>('todas');
  const [ultimaVenta, setUltimaVenta] = useState<ItemVenta[] | null>(null);
  const [totalUltimaVenta, setTotalUltimaVenta] = useState<number>(0);

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
    
    // Guardar la venta actual para poder imprimir el recibo
    setUltimaVenta([...carrito]);
    setTotalUltimaVenta(total);
    
    registrarVenta(carrito, 'Efectivo');
    
    toast({
      title: "Venta procesada",
      description: `Venta por $${total.toLocaleString()} procesada exitosamente`
    });
    
    setCarrito([]);
  };

  const handlePrintComplete = () => {
    setUltimaVenta(null);
    setTotalUltimaVenta(0);
  };

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
                {ultimaVenta && ultimaVenta.length > 0 && (
                  <div className="mt-4 p-4 bg-green-50 rounded-lg border border-green-200">
                    <h4 className="font-semibold text-green-800 mb-2">
                      Última venta procesada
                    </h4>
                    <p className="text-sm text-green-700 mb-3">
                      Total: ${totalUltimaVenta.toLocaleString()}
                    </p>
                    <PrintReceipt 
                      items={ultimaVenta}
                      total={totalUltimaVenta}
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
    </div>
  );
};

export default VentaView;
