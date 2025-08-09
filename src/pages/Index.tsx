
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Package, History, Coffee, LogOut, User, BarChart3, Calculator } from "lucide-react";
import VentaView from '@/components/VentaView';
import GestionView from '@/components/GestionView';
import HistorialView from '@/components/HistorialView';
import ReportesView from '@/components/ReportesView';
import ControlCajaView from '@/components/ControlCajaView';
import LoginView from '@/components/LoginView';
import { AppProvider } from '@/contexts/AppContext';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { TurnoProvider } from '@/contexts/TurnoContext';
import StockAlerts from '@/components/StockAlerts';
import TurnoStatus from '@/components/TurnoStatus';
import MobileNavBar from '@/components/MobileNavBar';

type ViewType = 'venta' | 'gestion' | 'historial' | 'reportes' | 'caja';

const MainApp = () => {
  const { user, logout, hasRole } = useAuth();
  const isAdmin = hasRole('admin');
  const [currentView, setCurrentView] = useState<ViewType>('venta');
  const renderView = () => {
    switch (currentView) {
      case 'venta':
        return <VentaView />;
      case 'gestion':
        return hasRole('admin') ? <GestionView /> : <VentaView />;
      case 'historial':
        return <HistorialView />;
      case 'reportes':
        return <ReportesView />;
      case 'caja':
        return hasRole('admin') ? <ControlCajaView /> : <VentaView />;
      default:
        return <VentaView />;
    }
  };

  return (
    <TurnoProvider>
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
              
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <User className="h-4 w-4" />
                  <span>{user?.name}</span>
                  <span className="px-2 py-1 bg-amber-100 text-amber-800 rounded-full text-xs">
                    {user?.role === 'admin' ? 'Administrador' : 'Cajero'}
                  </span>
                </div>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={logout}
                  className="flex items-center space-x-2"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Salir</span>
                </Button>
              </div>
            </div>
          </div>
        </header>

        {/* Navigation */}
        <nav className="hidden md:block bg-card border-b shadow-sm">
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
              
              {hasRole('admin') && (
                <Button
                  variant={currentView === 'gestion' ? 'default' : 'ghost'}
                  onClick={() => setCurrentView('gestion')}
                  className="flex items-center space-x-2 px-6 py-3 rounded-none"
                >
                  <Package className="h-4 w-4" />
                  <span>Gestión</span>
                </Button>
              )}
              
              <Button
                variant={currentView === 'historial' ? 'default' : 'ghost'}
                onClick={() => setCurrentView('historial')}
                className="flex items-center space-x-2 px-6 py-3 rounded-none"
              >
                <History className="h-4 w-4" />
                <span>Historial</span>
              </Button>
              
              <Button
                variant={currentView === 'reportes' ? 'default' : 'ghost'}
                onClick={() => setCurrentView('reportes')}
                className="flex items-center space-x-2 px-6 py-3 rounded-none"
              >
                <BarChart3 className="h-4 w-4" />
                <span>Reportes</span>
              </Button>
              
              {hasRole('admin') && (
                <Button
                  variant={currentView === 'caja' ? 'default' : 'ghost'}
                  onClick={() => setCurrentView('caja')}
                  className="flex items-center space-x-2 px-6 py-3 rounded-none"
                >
                  <Calculator className="h-4 w-4" />
                  <span>Control Caja</span>
                </Button>
              )}
            </div>
          </div>
        </nav>

        {/* Main Content */}
        <main className="container mx-auto px-4 pt-4 pb-24 md:py-6">
          {currentView !== 'venta' && (
            <div className="mb-6 space-y-4">
              <TurnoStatus />
              <StockAlerts />
            </div>
          )}
          {renderView()}
        </main>
        {/* Mobile bottom nav */}
        <MobileNavBar
          currentView={currentView}
          onChange={setCurrentView}
          isAdmin={isAdmin}
        />
        </div>
      </AppProvider>
    </TurnoProvider>
  );
};

const Index = () => {
  return (
    <AuthProvider>
      <AuthenticatedApp />
    </AuthProvider>
  );
};

const AuthenticatedApp = () => {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <LoginView />;
  }

  return <MainApp />;
};

export default Index;
