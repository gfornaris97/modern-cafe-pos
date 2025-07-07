import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Coffee, AlertCircle } from "lucide-react";
import { useAuth } from '@/contexts/AuthContext';
import { Alert, AlertDescription } from "@/components/ui/alert";

const LoginView = () => {
  const { login } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    if (!username || !password) {
      setError('Por favor, ingresa usuario y contraseña');
      setIsLoading(false);
      return;
    }

    const success = login(username, password);
    
    if (!success) {
      setError('Usuario o contraseña incorrectos');
    }

    setIsLoading(false);
  };

  const fillCredentials = (user: 'admin' | 'cajero') => {
    if (user === 'admin') {
      setUsername('admin');
      setPassword('admin123');
    } else {
      setUsername('cajero');
      setPassword('cajero123');
    }
    setError('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <Coffee className="h-12 w-12 text-amber-600" />
          </div>
          <CardTitle className="text-2xl font-bold text-gray-800">
            Café POS
          </CardTitle>
          <p className="text-gray-600">
            Inicia sesión para acceder al sistema
          </p>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Usuario</Label>
              <Input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Ingresa tu usuario"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Contraseña</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Ingresa tu contraseña"
              />
            </div>

            <Button 
              type="submit" 
              className="w-full" 
              disabled={isLoading}
            >
              {isLoading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
            </Button>
          </form>

          <div className="mt-6 pt-4 border-t border-gray-200">
            <p className="text-sm text-gray-600 text-center mb-3">
              Usuarios de prueba:
            </p>
            
            <div className="space-y-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => fillCredentials('admin')}
                className="w-full text-left justify-start"
              >
                <div className="text-left">
                  <div className="font-medium">Administrador</div>
                  <div className="text-xs text-gray-500">admin / admin123</div>
                </div>
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => fillCredentials('cajero')}
                className="w-full text-left justify-start"
              >
                <div className="text-left">
                  <div className="font-medium">Cajero</div>
                  <div className="text-xs text-gray-500">cajero / cajero123</div>
                </div>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LoginView;