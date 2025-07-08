import React from 'react';
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, Package } from "lucide-react";
import { useApp } from '@/contexts/AppContext';

interface StockAlertsProps {
  className?: string;
  threshold?: number;
}

const StockAlerts = ({ className, threshold = 10 }: StockAlertsProps) => {
  const { productos } = useApp();
  
  const productosStockBajo = productos.filter(producto => producto.stock <= threshold);
  const productosAgotados = productos.filter(producto => producto.stock === 0);
  
  if (productosStockBajo.length === 0) {
    return null;
  }

  return (
    <div className={className}>
      {productosAgotados.length > 0 && (
        <Alert variant="destructive" className="mb-4">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <strong>Productos agotados:</strong>{' '}
            {productosAgotados.map(p => p.nombre).join(', ')}
          </AlertDescription>
        </Alert>
      )}
      
      {productosStockBajo.filter(p => p.stock > 0).length > 0 && (
        <Alert className="mb-4 border-amber-200 bg-amber-50">
          <Package className="h-4 w-4 text-amber-600" />
          <AlertDescription className="text-amber-800">
            <strong>Stock bajo:</strong>{' '}
            {productosStockBajo.filter(p => p.stock > 0).map(p => 
              `${p.nombre} (${p.stock})`
            ).join(', ')}
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export const StockAlertsCard = ({ className, threshold = 10 }: StockAlertsProps) => {
  const { productos } = useApp();
  
  const productosStockBajo = productos.filter(producto => producto.stock <= threshold);
  const productosAgotados = productos.filter(producto => producto.stock === 0);
  
  if (productosStockBajo.length === 0) {
    return null;
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <AlertTriangle className="h-5 w-5 text-amber-600" />
          <span>Alertas de Stock</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {productosAgotados.map(producto => (
            <div key={producto.id} className="flex items-center justify-between p-3 bg-red-50 border border-red-200 rounded-lg">
              <div>
                <h4 className="font-medium text-red-800">{producto.nombre}</h4>
                <p className="text-sm text-red-600">{producto.categoria}</p>
              </div>
              <Badge variant="destructive">Agotado</Badge>
            </div>
          ))}
          
          {productosStockBajo.filter(p => p.stock > 0).map(producto => (
            <div key={producto.id} className="flex items-center justify-between p-3 bg-amber-50 border border-amber-200 rounded-lg">
              <div>
                <h4 className="font-medium text-amber-800">{producto.nombre}</h4>
                <p className="text-sm text-amber-600">{producto.categoria}</p>
              </div>
              <Badge variant="outline" className="text-amber-700 border-amber-300">
                {producto.stock} restantes
              </Badge>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default StockAlerts;