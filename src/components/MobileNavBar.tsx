import React from 'react';
import { ShoppingCart, Package, History, BarChart3, Calculator } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export type MobileView = 'venta' | 'gestion' | 'historial' | 'reportes' | 'caja';

interface MobileNavBarProps {
  currentView: MobileView;
  onChange: (view: MobileView) => void;
  isAdmin: boolean;
}

const MobileNavBar: React.FC<MobileNavBarProps> = ({ currentView, onChange, isAdmin }) => {
  const items = [
    { key: 'venta', label: 'Venta', icon: ShoppingCart },
    ...(isAdmin ? [{ key: 'gestion', label: 'Gestión', icon: Package }] : []),
    { key: 'historial', label: 'Historial', icon: History },
    { key: 'reportes', label: 'Reportes', icon: BarChart3 },
    ...(isAdmin ? [{ key: 'caja', label: 'Caja', icon: Calculator }] : []),
  ] as Array<{ key: MobileView; label: string; icon: any }>;

  return (
    <nav className="md:hidden fixed bottom-0 inset-x-0 z-50 bg-card border-t shadow-sm pb-[env(safe-area-inset-bottom)]">
      <div
        className="max-w-screen-md mx-auto px-2 py-2 grid gap-1"
        style={{ gridTemplateColumns: `repeat(${items.length}, minmax(0,1fr))` }}
      >
        {items.map(({ key, label, icon: Icon }) => (
          <Button
            key={key}
            variant={currentView === key ? 'default' : 'ghost'}
            className={cn(
              'flex flex-col items-center justify-center gap-1 h-12 px-2',
              currentView === key ? '' : 'text-muted-foreground'
            )}
            onClick={() => onChange(key)}
            aria-current={currentView === key ? 'page' : undefined}
            aria-label={label}
          >
            <Icon className="h-5 w-5" />
            <span className="text-[11px] leading-none">{label}</span>
          </Button>
        ))}
      </div>
    </nav>
  );
};

export default MobileNavBar;
