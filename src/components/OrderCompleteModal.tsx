import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  TextField,
  TableContainer,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  IconButton,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import ExcelExport from './ExcelExport';
import { useOrders } from '../context/OrderContext';
import { CartItem, OrderItem } from '../types';

interface OrderCompleteModalProps {
  open: boolean;
  onClose: () => void;
  orderType: 'dine-in' | 'delivery';
  cart: CartItem[];
  total: number;
  onComplete: () => void;
}

const OrderCompleteModal: React.FC<OrderCompleteModalProps> = ({
  open,
  onClose,
  orderType: initialOrderType,
  cart,
  total,
  onComplete
}) => {
  const { addOrder } = useOrders();
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [lastFourDigits, setLastFourDigits] = useState('');
  const [paymentType, setPaymentType] = useState<'cash' | 'card'>('cash');
  const [receiptNumber, setReceiptNumber] = useState(() => {
    const savedNumber = localStorage.getItem('receiptNumber');
    const savedDate = localStorage.getItem('receiptDate');
    const today = new Date().toDateString();

    if (savedDate === today && savedNumber) {
      return parseInt(savedNumber, 10);
    }
    return 1;
  });

  useEffect(() => {
    const savedDate = localStorage.getItem('receiptDate');
    const today = new Date().toDateString();

    if (savedDate !== today) {
      setReceiptNumber(1);
      localStorage.setItem('receiptDate', today);
    }
    localStorage.setItem('receiptNumber', receiptNumber.toString());
  }, [receiptNumber]);

  useEffect(() => {
    if (lastFourDigits.length === 4) {
      const savedPhones = JSON.parse(localStorage.getItem('savedPhones') || '{}');
      const foundPhone = Object.keys(savedPhones).find(p => p.endsWith(lastFourDigits));
      if (foundPhone) {
        setPhone(foundPhone);
        setAddress(savedPhones[foundPhone].address);
      }
    }
  }, [lastFourDigits]);

  const handleComplete = () => {
    const orderItems: OrderItem[] = cart.map(item => ({
      ...item,
      id: item.id.toString(),
      category: item.category || 'default',
      name: item.name.toLowerCase().includes('lavaş') ? `${item.name} (Ekstra Lavaş)` : item.name
    }));

    const deliveryFee = initialOrderType === 'delivery' ? (() => {
      let hasMainDish = false;
      let hasDrink = false;

      cart.forEach(item => {
        if (item.name.toLowerCase().includes('lavaş')) {
          return; // Skip lavaş items
        }
        if (['Hatay Usulü Dönerler', 'Klasik Dönerler', 'Takolar', 'Porsiyonlar', 'Menüler'].includes(item.category)) {
          hasMainDish = true;
        } else if (item.category === 'İçecekler & Atıştırmalık') {
          hasDrink = true;
        }
      });

      let fee = 0;
      if (hasMainDish) fee += 15;
      if (hasDrink) fee += 5;

      return fee;
    })() : 0;

    const finalTotal = total;

    addOrder({
      type: initialOrderType,
      items: orderItems,
      total: finalTotal,
      phone: initialOrderType === 'delivery' ? phone : undefined,
      address: initialOrderType === 'delivery' ? address : undefined,
      paymentType: initialOrderType === 'delivery' ? paymentType : undefined,
    });

    // Yazdırma işlemi
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>USLU DÖNER - Sipariş Fişi</title>
            <style>
              @import url('https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap');
              
              body { 
                font-family: 'Roboto', sans-serif;
                padding: 20px;
                max-width: 300px;
                margin: 0 auto;
                background: #fff;
              }
              
              .header { 
                text-align: center;
                margin-bottom: 25px;
                border-bottom: 2px dashed #333;
                padding-bottom: 15px;
              }
              
              .header h2 {
                color: #e74c3c;
                margin: 0;
                font-size: 24px;
                font-weight: 700;
              }
              
              .header p {
                color: #666;
                margin: 5px 0 0;
                font-size: 14px;
              }
              
              .receipt-number {
                font-weight: 700;
                font-size: 16px;
                color: #000;
              }
              
              .info {
                margin-bottom: 25px;
                font-size: 13px;
                color: #444;
              }
              
              .info p {
                margin: 5px 0;
              }
              
              .items {
                margin-bottom: 25px;
              }
              
              .item {
                margin-bottom: 12px;
                font-size: 13px;
                display: flex;
                justify-content: space-between;
                align-items: center;
              }
              
              .item-name {
                flex: 1;
                margin-right: 10px;
              }
              
              .item-details {
                text-align: right;
                white-space: nowrap;
              }
              
              .dots {
                border-bottom: 1px dotted #999;
                flex: 1;
                margin: 0 8px;
                position: relative;
                top: -4px;
              }
              
              .total {
                border-top: 2px dashed #333;
                padding-top: 15px;
                margin-top: 20px;
                font-size: 14px;
              }
              .body {
                  color: #000;
                }
              
              .total p {
                margin: 8px 0;
                display: flex;
                justify-content: space-between;
                align-items: center;
              }
              
              .total .grand-total {
                font-weight: 700;
                font-size: 16px;
                color: #e74c3c;
                margin-top: 10px;
              }
              
              .footer {
                text-align: center;
                margin-top: 25px;
                font-size: 12px;
                color: #666;
                border-top: 1px dashed #ccc;
                padding-top: 15px;
              }
              
              .footer p {
                margin: 5px 0;
              }
              
              .divider {
                border-top: 1px dashed #ccc;
                margin: 15px 0;
              }
            </style>
          </head>
          <body>
            <div class="header">
              <h2>USLU DÖNER</h2>
              <p>Sipariş Fişi</p>
              <p class="receipt-number">Fiş No: ${receiptNumber}</p>
            </div>
            
            <div class="info">
              <p><strong>Tarih:</strong> ${new Date().toLocaleString('tr-TR')}</p>
              <p><strong>Sipariş Tipi:</strong> ${initialOrderType === 'dine-in' ? 'İçeride' : 'Kurye'}</p>
              ${initialOrderType === 'delivery' ? `
                <div class="divider"></div>
                <p><strong>Telefon:</strong> ${phone || '...............................'}</p>
                <p><strong>Adres:</strong> ${address || '..............................................................................................................................'}</p> <br/>
                <p><strong>Ödeme Tipi:</strong> ${paymentType === 'cash' ? 'Nakit' : 'Kredi Kartı'}</p>
              ` : ''}
            </div>
            
            <div class="items">
              ${cart.map(item => `
                <div class="item">
                  <span class="item-name">${item.name}</span>
                  <span class="dots"></span>
                  <span class="item-details">${item.quantity} x ${item.price}₺ = ${item.price * item.quantity}₺</span>
                </div>
              `).join('')}
            </div>
            
            <div class="total">
              <p>
                <span>Ara Toplam</span>
                <span>${total}₺</span>
              </p>
              <p class="grand-total">
                <span>Genel Toplam</span>
                <span>${total}₺</span>
              </p>
            </div>
            
            <div class="footer">
              <p>Bizi tercih ettiğiniz için teşekkür ederiz!</p>
              <p>Afiyet olsun...</p>
            </div>
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
      
      // Fiş numarasını artır
      setReceiptNumber(prev => prev + 1);
    }

    onComplete();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6">Siparişi Tamamla</Typography>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      <DialogContent>
        <Box mb={2}>
          <Typography variant="subtitle1" gutterBottom>
            Sipariş Özeti
          </Typography>
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Ürün</TableCell>
                  <TableCell align="right">Adet</TableCell>
                  <TableCell align="right">Fiyat</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {cart.map((item) => (
                  <TableRow key={item.name}>
                    <TableCell>{item.name}</TableCell>
                    <TableCell align="right">{item.quantity}</TableCell>
                    <TableCell align="right">{item.price * item.quantity}₺</TableCell>
                  </TableRow>
                ))}
                <TableRow>
                  <TableCell colSpan={2}>
                    <Typography variant="subtitle2">Ara Toplam</Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Typography variant="subtitle2">{total}₺</Typography>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        </Box>

        {initialOrderType === 'delivery' && (
          <>
            <TextField
              fullWidth
              label="Telefon Son 4 Hane"
              value={lastFourDigits}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, '').slice(0, 4);
                setLastFourDigits(value);
              }}
              inputProps={{
                maxLength: 4,
                inputMode: 'numeric',
                pattern: '[0-9]*'
              }}
              margin="normal"
            />
            <TextField
              fullWidth
              label="Telefon"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              margin="normal"
              disabled
            />
            <TextField
              fullWidth
              label="Adres"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              margin="normal"
              multiline
              rows={2}
            />
          </>
        )}

        <Box sx={{ mt: 2 }}>
          <Typography variant="h6" gutterBottom>
            Toplam: {total}₺
          </Typography>
          {initialOrderType === 'delivery' && (
            <FormControl fullWidth margin="normal">
              <InputLabel>Ödeme Tipi</InputLabel>
              <Select
                value={paymentType}
                onChange={(e) => setPaymentType(e.target.value as 'cash' | 'card')}
                label="Ödeme Tipi"
              >
                <MenuItem value="cash">Nakit</MenuItem>
                <MenuItem value="card">Kredi Kartı</MenuItem>
              </Select>
            </FormControl>
          )}
          <Button
            variant="contained"
            color="primary"
            fullWidth
            onClick={handleComplete}
            sx={{ mt: 2 }}
          >
            Siparişi Tamamla
          </Button>
          <ExcelExport 
            data={[{
              date: new Date(),
              type: initialOrderType,
              items: cart,
              phone: initialOrderType === 'delivery' ? phone : undefined,
              address: initialOrderType === 'delivery' ? address : undefined,
              paymentType: initialOrderType === 'delivery' ? paymentType : undefined,
              total: total + cart.reduce((fee, item) => {
                if (item.category === 'İçecekler') {
                  return fee + (5 * item.quantity);
                }
                return fee;
              }, 0)
            }]} 
            filename="uslu_doner_siparis" 
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>İptal</Button>
      </DialogActions>
    </Dialog>
  );
};

export default OrderCompleteModal;
