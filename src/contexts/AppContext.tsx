
import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface Producto {
  id: number;
  nombre: string;
  precio: number;
  categoria: string;
  stock: number;
}

export interface ItemVenta {
  producto: Producto;
  cantidad: number;
}

export interface Venta {
  id: number;
  fecha: string;
  hora: string;
  total: number;
  items: Array<{
    producto: string;
    cantidad: number;
    precio: number;
  }>;
  metodoPago: string;
  montoPagado?: number;
  vuelto?: number;
}

interface AppContextType {
  productos: Producto[];
  ventas: Venta[];
  agregarProducto: (producto: Omit<Producto, 'id'>) => void;
  actualizarProducto: (producto: Producto) => void;
  eliminarProducto: (id: number) => void;
  registrarVenta: (items: ItemVenta[], metodoPago: string, montoPagado?: number) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

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

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [productos, setProductos] = useState<Producto[]>(() => {
    const productosGuardados = localStorage.getItem('cafe-pos-productos');
    return productosGuardados ? JSON.parse(productosGuardados) : productosIniciales;
  });
  const [ventas, setVentas] = useState<Venta[]>(() => {
    const ventasGuardadas = localStorage.getItem('cafe-pos-ventas');
    return ventasGuardadas ? JSON.parse(ventasGuardadas) : [];
  });

  // Sincronizar productos con localStorage
  React.useEffect(() => {
    localStorage.setItem('cafe-pos-productos', JSON.stringify(productos));
  }, [productos]);

  // Sincronizar ventas con localStorage  
  React.useEffect(() => {
    localStorage.setItem('cafe-pos-ventas', JSON.stringify(ventas));
  }, [ventas]);

  const agregarProducto = (nuevoProducto: Omit<Producto, 'id'>) => {
    const producto: Producto = {
      ...nuevoProducto,
      id: Date.now()
    };
    setProductos(prev => [...prev, producto]);
  };

  const actualizarProducto = (productoActualizado: Producto) => {
    setProductos(prev => 
      prev.map(p => p.id === productoActualizado.id ? productoActualizado : p)
    );
  };

  const eliminarProducto = (id: number) => {
    setProductos(prev => prev.filter(p => p.id !== id));
  };

  const registrarVenta = (items: ItemVenta[], metodoPago: string, montoPagado?: number) => {
    const ahora = new Date();
    const fecha = ahora.toISOString().split('T')[0];
    const hora = ahora.toTimeString().split(' ')[0].slice(0, 5);
    const total = items.reduce((sum, item) => sum + (item.producto.precio * item.cantidad), 0);

    const nuevaVenta: Venta = {
      id: Date.now(),
      fecha,
      hora,
      total,
      items: items.map(item => ({
        producto: item.producto.nombre,
        cantidad: item.cantidad,
        precio: item.producto.precio
      })),
      metodoPago,
      montoPagado: montoPagado || total,
      vuelto: montoPagado ? Math.max(0, montoPagado - total) : 0
    };

    setVentas(prev => [nuevaVenta, ...prev]);

    // Actualizar stock de productos
    items.forEach(item => {
      setProductos(prev => 
        prev.map(p => 
          p.id === item.producto.id 
            ? { ...p, stock: p.stock - item.cantidad }
            : p
        )
      );
    });
  };

  return (
    <AppContext.Provider value={{
      productos,
      ventas,
      agregarProducto,
      actualizarProducto,
      eliminarProducto,
      registrarVenta
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
