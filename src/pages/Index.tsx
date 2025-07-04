
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Package, History, Coffee } from "lucide-react";
import VentaView from '@/components/VentaView';
import GestionView from '@/components/GestionView';
import HistorialView from '@/components/HistorialView';
import { AppProvider } from '@/contexts/AppContext';

type ViewType = 'venta' | 'gestion' | 'historial';

const Index = () => {
  const [currentView, setCurrentView] = useState<ViewType>('venta');

  const renderView = () => {
    switch (currentView) {
      case 'venta':
        return <VentaView />;
      case 'gestion':
        return <GestionView />;
      case 'historial':
        return <HistorialView />;
      default:
        return <VentaView />;
    }
  };

  return (
    <AppProvider>
      <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100">
        {/* Header */}
        <header className="bg-white shadow-md border-b border-amber-200">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Coffee className="h-8 w-8 text-amber-600" />
                <h1 className="text-2xl font-bold text-gray-800">Café POS</h1>
              </div>
              <div className="text-sm text-gray-600">
                Sistema de Punto de Venta
              </div>
            </div>
          </div>
        </header>

        {/* Navigation */}
        <nav className="bg-white border-b border-amber-200 shadow-sm">
          <div className="container mx-auto px-4">
            <div className="flex space-x-1">
              <Button
                variant={currentView === 'venta' ? 'default' : 'ghost'}
                onClick={() => setCurrentView('venta')}
                className="flex items-center space-x-2 px-6 py-3 rounded-none"
              >
                <ShoppingCart className="h-4 w-4" />
                <span>Ventas</span>
              </Button>
              <Button
                variant={currentView === 'gestion' ? 'default' : 'ghost'}
                onClick={() => setCurrentView('gestion')}
                className="flex items-center space-x-2 px-6 py-3 rounded-none"
              >
                <Package className="h-4 w-4" />
                <span>Gestión</span>
              </Button>
              <Button
                variant={currentView === 'historial' ? 'default' : 'ghost'}
                onClick={() => setCurrentView('historial')}
                className="flex items-center space-x-2 px-6 py-3 rounded-none"
              >
                <History className="h-4 w-4" />
                <span>Historial</span>
              </Button>
            </div>
          </div>
        </nav>

        {/* Main Content */}
        <main className="container mx-auto px-4 py-6">
          {renderView()}
        </main>
      </div>
    </AppProvider>
  );
};

export default Index;
