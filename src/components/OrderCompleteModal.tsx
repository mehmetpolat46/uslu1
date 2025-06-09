import React, { useEffect, useState } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button, IconButton, Radio, RadioGroup,
  FormControlLabel, FormLabel
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { useOrders } from '../context/OrderContext';
import { CartItem, OrderItem } from '../types';
import ExcelExport from './ExcelExport';

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
      let fee = 0;

      cart.forEach(item => {
        const quantity = item.quantity ?? 1;

        if (item.name.toLowerCase().includes('lavaş')) {
          return; // Lavaş için kuru ücret alınmaz
        }

        const mainCategories = ['Hatay Usulü Dönerler', 'Klasik Dönerler', 'Takolar', 'Porsiyonlar', 'Menüler'];
        if (mainCategories.includes(item.category || '')) {
          fee += 15 * quantity;
        } else if (item.category === 'İçecekler & Atıştırmalık') {
          fee += 5 * quantity;
        }
      });

      return fee;
    })() : 0;

    const finalTotal = total + deliveryFee;

    addOrder({
      type: initialOrderType,
      items: orderItems,
      total: finalTotal,
      phone: initialOrderType === 'delivery' ? phone : undefined,
      address: initialOrderType === 'delivery' ? address : undefined,
      paymentType: initialOrderType === 'delivery' ? paymentType : undefined,
    });

    onComplete();
    setReceiptNumber(prev => prev + 1);
    localStorage.setItem('receiptNumber', (receiptNumber + 1).toString());
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>
        Siparişi Tamamla
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{ position: 'absolute', right: 8, top: 8 }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers>
        {initialOrderType === 'delivery' && (
          <>
            <TextField
              label="Telefon Numarası"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              fullWidth
              margin="normal"
            />
            <TextField
              label="Son 4 Hane"
              value={lastFourDigits}
              onChange={(e) => setLastFourDigits(e.target.value)}
              fullWidth
              margin="normal"
            />
            <TextField
              label="Adres"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              fullWidth
              margin="normal"
            />
            <FormLabel component="legend" sx={{ mt: 2 }}>Ödeme Türü</FormLabel>
            <RadioGroup
              row
              value={paymentType}
              onChange={(e) => setPaymentType(e.target.value as 'cash' | 'card')}
            >
              <FormControlLabel value="cash" control={<Radio />} label="Nakit" />
              <FormControlLabel value="card" control={<Radio />} label="Kart" />
            </RadioGroup>
          </>
        )}
        <p style={{ marginTop: 16, fontWeight: 'bold' }}>
          Toplam Tutar: {total} TL + Kuru Ücret: {deliveryFee} TL = <span style={{ color: 'green' }}>{total + deliveryFee} TL</span>
        </p>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleComplete} variant="contained" color="primary">
          Siparişi Tamamla
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default OrderCompleteModal;
