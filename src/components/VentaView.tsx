import React, { useState } from 'react';
import VentaViewOdoo from './VentaViewOdoo';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Minus, Trash2, DollarSign, Calculator } from "lucide-react";
import { useApp, Producto, ItemVenta } from '@/contexts/AppContext';
import { useTurno } from '@/contexts/TurnoContext';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from "@/hooks/use-toast";
import PrintReceipt from './PrintReceipt';
import StockAlerts from './StockAlerts';

const VentaView = () => {
  return <VentaViewOdoo />;
};

export default VentaView;
