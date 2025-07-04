
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, Trash2 } from "lucide-react";

interface Producto {
  id: number;
  nombre: string;
  precio: number;
  categoria: string;
  stock: number;
}

const productosIniciales: Producto[] = [
  { id: 1, nombre: "Café Americano", precio: 2500, categoria: "Bebidas Calientes", stock: 50 },
  { id: 2, nombre: "Cappuccino", precio: 3500, categoria: "Bebidas Calientes", stock: 30 },
  { id: 3, nombre: "Latte", precio: 4000, categoria: "Bebidas Calientes", stock: 25 },
  { id: 4, nombre: "Espresso", precio: 2000, categoria: "Bebidas Calientes", stock: 40 },
  { id: 5, nombre: "Frappé", precio: 4500, categoria: "Bebidas Frías", stock: 20 },
  { id: 6, nombre: "Jugo Natural", precio: 3000, categoria: "Bebidas Frías", stock: 15 },
  { id: 7, nombre: "Croissant", precio: 2800, categoria: "Panadería", stock: 12 },
  { id: 8, nombre: "Muffin", precio: 2200, categoria: "Panadería", stock: 8 },
];

const GestionView = () => {
  const [productos, setProductos] = useState<Producto[]>(productosIniciales);
  const [productoEditando, setProductoEditando] = useState<Producto | null>(null);
  const [formulario, setFormulario] = useState({
    nombre: '',
    precio: '',
    categoria: '',
    stock: ''
  });

  const resetFormulario = () => {
    setFormulario({ nombre: '', precio: '', categoria: '', stock: '' });
    setProductoEditando(null);
  };

  const manejarSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const nuevoProducto: Producto = {
      id: productoEditando ? productoEditando.id : Date.now(),
      nombre: formulario.nombre,
      precio: parseFloat(formulario.precio),
      categoria: formulario.categoria,
      stock: parseInt(formulario.stock)
    };

    if (productoEditando) {
      setProductos(prev => prev.map(p => p.id === productoEditando.id ? nuevoProducto : p));
    } else {
      setProductos(prev => [...prev, nuevoProducto]);
    }

    resetFormulario();
  };

  const editarProducto = (producto: Producto) => {
    setProductoEditando(producto);
    setFormulario({
      nombre: producto.nombre,
      precio: producto.precio.toString(),
      categoria: producto.categoria,
      stock: producto.stock.toString()
    });
  };

  const eliminarProducto = (id: number) => {
    setProductos(prev => prev.filter(p => p.id !== id));
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Formulario */}
      <div>
        <Card>
          <CardHeader>
            <CardTitle>
              {productoEditando ? 'Editar Producto' : 'Agregar Producto'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={manejarSubmit} className="space-y-4">
              <div>
                <Label htmlFor="nombre">Nombre</Label>
                <Input
                  id="nombre"
                  value={formulario.nombre}
                  onChange={(e) => setFormulario(prev => ({...prev, nombre: e.target.value}))}
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="precio">Precio</Label>
                <Input
                  id="precio"
                  type="number"
                  value={formulario.precio}
                  onChange={(e) => setFormulario(prev => ({...prev, precio: e.target.value}))}
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="categoria">Categoría</Label>
                <Input
                  id="categoria"
                  value={formulario.categoria}
                  onChange={(e) => setFormulario(prev => ({...prev, categoria: e.target.value}))}
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="stock">Stock</Label>
                <Input
                  id="stock"
                  type="number"
                  value={formulario.stock}
                  onChange={(e) => setFormulario(prev => ({...prev, stock: e.target.value}))}
                  required
                />
              </div>
              
              <div className="flex space-x-2">
                <Button type="submit" className="flex-1">
                  {productoEditando ? 'Actualizar' : 'Agregar'}
                </Button>
                {productoEditando && (
                  <Button type="button" variant="outline" onClick={resetFormulario}>
                    Cancelar
                  </Button>
                )}
              </div>
            </form>
          </CardContent>
        </Card>
      </div>

      {/* Lista de Productos */}
      <div className="lg:col-span-2">
        <Card>
          <CardHeader>
            <CardTitle>Productos ({productos.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {productos.map(producto => (
                <div key={producto.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">{producto.nombre}</h3>
                    <div className="flex items-center space-x-4 mt-1">
                      <Badge variant="secondary">{producto.categoria}</Badge>
                      <span className="text-lg font-bold text-green-600">
                        ${producto.precio.toLocaleString()}
                      </span>
                      <span className={`text-sm ${producto.stock < 10 ? 'text-red-600' : 'text-gray-600'}`}>
                        Stock: {producto.stock}
                      </span>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => editarProducto(producto)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => eliminarProducto(producto.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default GestionView;
