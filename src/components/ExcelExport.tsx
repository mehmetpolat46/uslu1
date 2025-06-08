import React from 'react';
import { Button } from '@mui/material';
import PrintIcon from '@mui/icons-material/Print';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

interface OrderItem {
  name: string;
  quantity: number;
  price: number;
  category: string;
}

interface Order {
  date: string | Date;
  type: 'dine-in' | 'delivery';
  items: OrderItem[];
  phone?: string;
  address?: string;
  paymentType?: 'cash' | 'card';
  total: number;
}

interface ExcelExportProps {
  data: Order[];
  filename: string;
}

const ExcelExport: React.FC<ExcelExportProps> = ({ data, filename }) => {
  const exportToPDF = () => {
    const doc = new jsPDF('p', 'mm', 'a4');
    
    // Başlık ekle
    doc.setFontSize(20);
    doc.setTextColor(41, 128, 185);
    doc.text('USLU DÖNER', 105, 20, { align: 'center' });
    
    // Alt başlık
    doc.setFontSize(16);
    doc.setTextColor(44, 62, 80);
    doc.text('Sipariş Raporu', 105, 30, { align: 'center' });
    
    // Tarih ekle
    doc.setFontSize(10);
    doc.setTextColor(52, 73, 94);
    doc.text(`Oluşturulma Tarihi: ${new Date().toLocaleString('tr-TR')}`, 14, 40);

    // Tablo başlıkları
    const headers = [
      'Tarih',
      'Sipariş Tipi',
      'Ürün',
      'Adet',
      'Birim Fiyat',
      'Toplam Fiyat',
      'Telefon',
      'Adres',
      'Ödeme Tipi'
    ];

    // Tablo verilerini hazırla
    const tableData = data.flatMap(order => 
      order.items.map((item: OrderItem) => [
        new Date(order.date).toLocaleString('tr-TR'),
        order.type === 'dine-in' ? 'İçeride' : 'Kurye',
        item.name + ' (K)',
        item.quantity.toString(),
        `${item.price.toLocaleString('tr-TR')}₺`,
        `${(item.price * item.quantity).toLocaleString('tr-TR')}₺`,
        order.type === 'delivery' ? order.phone : '-',
        order.type === 'delivery' ? order.address : '-',
        order.type === 'delivery' ? (order.paymentType === 'cash' ? 'Nakit' : 'Kredi Kartı') : '-'
      ])
    );

    // Tabloyu oluştur
    (doc as any).autoTable({
      head: [headers],
      body: tableData,
      startY: 45,
      theme: 'grid',
      styles: {
        fontSize: 10,
        cellPadding: 3,
        lineColor: [41, 128, 185],
        lineWidth: 0.1,
      },
      headStyles: {
        fillColor: [41, 128, 185],
        textColor: 255,
        fontSize: 11,
        fontStyle: 'bold',
        halign: 'center',
      },
      bodyStyles: {
        fontSize: 10,
        halign: 'center',
      },
      columnStyles: {
        0: { cellWidth: 30, halign: 'left' },
        1: { cellWidth: 20 },
        2: { cellWidth: 40, halign: 'left' },
        3: { cellWidth: 15 },
        4: { cellWidth: 20, halign: 'right' },
        5: { cellWidth: 20, halign: 'right' },
        6: { cellWidth: 25, halign: 'left' },
        7: { cellWidth: 40, halign: 'left', minCellHeight: 35, cellPadding: 5 },
        8: { cellWidth: 25 },
      },
      margin: { top: 45 },
      didDrawPage: function(data: any) {
        // Her sayfanın altına sayfa numarası ekle
        doc.setFontSize(10);
        doc.text(
          `Sayfa ${data.pageCount}`,
          data.settings.margin.left,
          doc.internal.pageSize.height - 10
        );
      }
    });

    // PDF'i indir
    doc.save(`${filename}_${new Date().toLocaleString('tr-TR').replace(/[/\\?%*:|"<>]/g, '-')}.pdf`);
  };

  return (
    <Button
      variant="outlined"
      color="primary"
      onClick={exportToPDF}
      startIcon={<PrintIcon />}
    >
      PDF Raporu
    </Button>
  );
};

export default ExcelExport; 