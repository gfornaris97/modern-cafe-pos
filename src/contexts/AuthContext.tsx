import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface User {
  id: string;
  username: string;
  role: 'admin' | 'cajero';
  name: string;
}

interface AuthContextType {
  user: User | null;
  login: (username: string, password: string) => boolean;
  logout: () => void;
  isAuthenticated: boolean;
  hasRole: (role: 'admin' | 'cajero') => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Usuarios predefinidos
const USERS: User[] = [
  {
    id: '1',
    username: 'admin',
    role: 'admin',
    name: 'Administrador'
  },
  {
    id: '2',
    username: 'cajero',
    role: 'cajero',
    name: 'Cajero'
  }
];

// Contraseñas (en producción estarían hasheadas)
const PASSWORDS: Record<string, string> = {
  admin: 'admin123',
  cajero: 'cajero123'
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);

  // Cargar sesión guardada al inicializar
  useEffect(() => {
    const savedUser = localStorage.getItem('cafe-pos-user');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch {
        localStorage.removeItem('cafe-pos-user');
      }
    }
  }, []);

  const login = (username: string, password: string): boolean => {
    const foundUser = USERS.find(u => u.username === username);
    
    if (foundUser && PASSWORDS[username] === password) {
      setUser(foundUser);
      localStorage.setItem('cafe-pos-user', JSON.stringify(foundUser));
      return true;
    }
    
    return false;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('cafe-pos-user');
  };

  const hasRole = (role: 'admin' | 'cajero'): boolean => {
    if (!user) return false;
    if (user.role === 'admin') return true; // Admin tiene acceso a todo
    return user.role === role;
  };

  return (
    <AuthContext.Provider value={{
      user,
      login,
      logout,
      isAuthenticated: !!user,
      hasRole
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};