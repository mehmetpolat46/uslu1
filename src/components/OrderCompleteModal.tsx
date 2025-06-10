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

  // Reset input fields when modal opens
  useEffect(() => {
    if (open) {
      setPhone('');
      setAddress('');
      setLastFourDigits('');
      setPaymentType('cash');
    }
  }, [open]);

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

  addOrder({
    type: initialOrderType,
    items: orderItems,
      total: total,
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
                max-width: 400px;
                margin: 0 auto;
                background: #fff;
              }
              
              .receipt {
                background: white;
                padding: 20px;
                border-radius: 8px;
                box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                font-family: 'Courier New', monospace;
                color: #000;
                font-weight: 600;
              }
              
              .header { 
                text-align: center;
                margin-bottom: 20px;
                color: #000;
              }
              
              .header h2 {
                font-size: 20px;
                margin: 0;
                color: #000;
                font-weight: 700;
              }
              
              .header p {
                color: #000;
                margin: 5px 0 0;
                font-size: 14px;
                font-weight: 600;
              }
              
              .receipt-number {
                font-weight: 700;
                font-size: 16px;
                color: #000;
              }
              
              .info {
                margin-bottom: 25px;
                font-size: 13px;
                color: #000;
                font-weight: 600;
              }
              
              .info p {
                margin: 5px 0;
                color: #000;
                font-weight: 600;
              }

              .info p:last-of-type {
                margin-bottom: 20px;
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
                color: #000;
                font-weight: 600;
              }
              
              .item-name {
                flex: 1;
                margin-right: 10px;
                color: #000;
                font-weight: 600;
              }
              
              .item-details {
                text-align: right;
                white-space: nowrap;
                color: #000;
                font-weight: 600;
              }
              
              .dots {
                border-bottom: 1px dotted #000;
                flex: 1;
                margin: 0 8px;
                position: relative;
                top: -4px;
              }
              
              .total {
                border-top: 2px dashed #000;
                padding-top: 15px;
                margin-top: 20px;
                font-size: 14px;
                  color: #000;
                font-weight: 600;
                }
              
              .total p {
                margin: 8px 0;
                display: flex;
                justify-content: space-between;
                align-items: center;
                color: #000;
                font-weight: 600;
              }
              
              .total .grand-total {
                font-weight: 700;
                font-size: 16px;
                color: #000;
                margin-top: 10px;
              }
              
              .footer {
                text-align: center;
                margin-top: 25px;
                font-size: 12px;
                color: #000;
                border-top: 1px dashed #000;
                padding-top: 15px;
                font-weight: 600;
              }
              .items span {
              font-size: 16px;
              }
              
              .footer p {
                margin: 5px 0;
                color: #000;
                font-weight: 600;
  }
            </style>
          </head>
          <body>
            <div class="receipt">
            <div class="header">
              <h2>USLU DÖNER</h2>
                <p>Hatay Usulü & Klasik Döner </p>
              <p class="receipt-number">Fiş No: ${receiptNumber}</p>
            </div>
            
            <div class="info">
                <p>Tarih: ${new Date().toLocaleString('tr-TR')}</p>
                <p>Sipariş Tipi: ${initialOrderType === 'delivery' ? 'Paket Servis' : 'Yerinde'}</p>
              ${initialOrderType === 'delivery' ? `
                  <p>Telefon: ${phone}</p> <br/>
                  <p>Adres: ${address}</p><br/><br/><br/>
                  <p>Ödeme: ${paymentType === 'cash' ? 'Nakit' : 'Kart'}</p>
              ` : ''}
            </div>
            
            <div class="items">
              ${cart.map(item => `
                <div class="item">
                  <span class="item-name">${item.name}</span>
                  <span class="dots"></span>
                    <span class="item-details">
                      ${item.quantity}x ${item.price} TL
                    </span>
                </div>
              `).join('')}
            </div>
            
            <div class="total">
              <p class="grand-total">
                  <span>Toplam:</span>
                  <span>${total.toFixed(2)} TL</span>
              </p>
            </div>
            
            <div class="footer">
              <p>Bizi tercih ettiğiniz için teşekkür ederiz!</p>
              <p>Afiyet olsun...</p>
              </div>
            </div>
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }

    setReceiptNumber(prev => prev + 1);
    onComplete();
    onClose();
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="sm" 
      fullWidth
      PaperProps={{
        sx: {
          maxHeight: '90vh',
          width: '90%',
          maxWidth: '600px'
        }
      }}
    >
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6" sx={{ fontSize: '1.1rem' }}>Siparişi Tamamla</Typography>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      <DialogContent>
        <Box sx={{ mt: 2 }}>
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontSize: '0.9rem' }}>Ürün</TableCell>
                  <TableCell align="right" sx={{ fontSize: '0.9rem' }}>Adet</TableCell>
                  <TableCell align="right" sx={{ fontSize: '0.9rem' }}>Fiyat</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {cart.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell sx={{ fontSize: '0.9rem' }}>{item.name}</TableCell>
                    <TableCell align="right" sx={{ fontSize: '0.9rem' }}>{item.quantity}</TableCell>
                    <TableCell align="right" sx={{ fontSize: '0.9rem' }}>{item.price} TL</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

        {initialOrderType === 'delivery' && (
            <Box sx={{ mt: 3 }}>
            <TextField
              fullWidth
                label="Telefon Son 4 Hanesi"
              value={lastFourDigits}
                onChange={(e) => setLastFourDigits(e.target.value)}
                sx={{ mb: 2 }}
                inputProps={{ maxLength: 4 }}
                helperText="Son 4 haneyi girerek kayıtlı bilgileri getirebilirsiniz"
            />
            <TextField
              fullWidth
              label="Telefon"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
                sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="Adres"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
                sx={{ mb: 2 }}
              />
              <FormControl component="fieldset" sx={{ mb: 2 }}>
                <FormLabel component="legend">Ödeme Tipi</FormLabel>
                <RadioGroup
                value={paymentType}
                onChange={(e) => setPaymentType(e.target.value as 'cash' | 'card')}
                >
                  <FormControlLabel value="cash" control={<Radio />} label="Nakit" />
                  <FormControlLabel value="card" control={<Radio />} label="Kart" />
                </RadioGroup>
            </FormControl>
            </Box>
          )}

          <Box sx={{ mt: 2 }}>
            <Typography variant="h6" align="right">
              Toplam: {total} TL
            </Typography>
          </Box>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>İptal</Button>
        <Button
          onClick={handleComplete}
          variant="contained"
          color="primary"
        >
          Tamamla
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default OrderCompleteModal;
