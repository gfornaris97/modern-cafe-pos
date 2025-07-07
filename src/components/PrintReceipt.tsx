
import React from 'react';
import { Printer } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { ItemVenta } from '@/contexts/AppContext';

interface PrintReceiptProps {
  items: ItemVenta[];
  total: number;
  montoPagado?: number;
  vuelto?: number;
  onPrint?: () => void;
}

const PrintReceipt = ({ items, total, montoPagado, vuelto, onPrint }: PrintReceiptProps) => {
  const printReceipt = () => {
    const receiptContent = generateReceiptHTML(items, total, montoPagado, vuelto);
    
    // Crear ventana de impresión
    const printWindow = window.open('', '_blank', 'width=300,height=600');
    if (printWindow) {
      printWindow.document.write(receiptContent);
      printWindow.document.close();
      
      // Esperar a que se cargue el contenido y luego imprimir
      printWindow.onload = () => {
        printWindow.print();
        printWindow.close();
      };
    }
    
    if (onPrint) {
      onPrint();
    }
  };

  const generateReceiptHTML = (items: ItemVenta[], total: number, montoPagado?: number, vuelto?: number) => {
    const now = new Date();
    const fecha = now.toLocaleDateString('es-ES');
    const hora = now.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Recibo - Café POS</title>
        <style>
          body {
            font-family: 'Courier New', monospace;
            font-size: 12px;
            margin: 0;
            padding: 20px;
            width: 260px;
            background: white;
          }
          .header {
            text-align: center;
            border-bottom: 2px solid #000;
            padding-bottom: 10px;
            margin-bottom: 15px;
          }
          .header h1 {
            margin: 0;
            font-size: 18px;
          }
          .header p {
            margin: 5px 0;
            font-size: 10px;
          }
          .info {
            margin-bottom: 15px;
            font-size: 11px;
          }
          .items {
            border-bottom: 1px solid #000;
            padding-bottom: 10px;
            margin-bottom: 10px;
          }
          .item {
            display: flex;
            justify-content: space-between;
            margin-bottom: 5px;
          }
          .item-name {
            flex: 1;
            font-size: 11px;
          }
          .item-qty {
            width: 30px;
            text-align: center;
            font-size: 11px;
          }
          .item-price {
            width: 60px;
            text-align: right;
            font-size: 11px;
          }
          .total {
            text-align: right;
            font-size: 14px;
            font-weight: bold;
            margin-top: 10px;
          }
          .footer {
            text-align: center;
            margin-top: 20px;
            font-size: 10px;
            border-top: 1px solid #000;
            padding-top: 10px;
          }
          @media print {
            body {
              width: auto;
              margin: 0;
              padding: 10px;
            }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>☕ CAFÉ POS</h1>
          <p>Sistema de Punto de Venta</p>
          <p>--------------------------------</p>
        </div>
        
        <div class="info">
          <p>Fecha: ${fecha}</p>
          <p>Hora: ${hora}</p>
          <p>Cajero: Admin</p>
        </div>
        
        <div class="items">
          <div style="display: flex; justify-content: space-between; font-weight: bold; margin-bottom: 8px;">
            <span>Producto</span>
            <span>Cant</span>
            <span>Total</span>
          </div>
          ${items.map(item => `
            <div class="item">
              <div class="item-name">${item.producto.nombre}</div>
              <div class="item-qty">${item.cantidad}</div>
              <div class="item-price">$${(item.producto.precio * item.cantidad).toLocaleString()}</div>
            </div>
            <div style="font-size: 10px; color: #666; margin-bottom: 5px;">
              $${item.producto.precio.toLocaleString()} x ${item.cantidad}
            </div>
          `).join('')}
        </div>
        
        <div class="total">
          <p>TOTAL: $${total.toLocaleString()}</p>
          ${montoPagado ? `<p>PAGADO: $${montoPagado.toLocaleString()}</p>` : ''}
          ${vuelto && vuelto > 0 ? `<p style="font-size: 16px; margin-top: 5px;">VUELTO: $${vuelto.toLocaleString()}</p>` : ''}
        </div>
        
        <div class="footer">
          <p>¡Gracias por su compra!</p>
          <p>Vuelva pronto</p>
          <p>--------------------------------</p>
        </div>
      </body>
      </html>
    `;
  };

  if (items.length === 0) {
    return null;
  }

  return (
    <Button 
      onClick={printReceipt}
      variant="outline"
      className="w-full mt-2"
    >
      <Printer className="h-4 w-4 mr-2" />
      Imprimir Recibo
    </Button>
  );
};

export default PrintReceipt;
