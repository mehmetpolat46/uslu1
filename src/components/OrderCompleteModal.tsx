import React, { useEffect, useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  TextField,
  Button,
  FormControl,
  RadioGroup,
  FormControlLabel,
  Radio
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
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

    const deliveryFee = initialOrderType === 'delivery' ? cart.reduce((fee, item) => {
      const quantity = item.quantity ?? 1;

      const isLavas = item.name.toLowerCase().includes('lavaş');
      if (isLavas) return fee; // lavaş'tan kuru ücreti alınmaz

      if (['Hatay Usulü Dönerler', 'Klasik Dönerler', 'Takolar', 'Porsiyonlar', 'Menüler'].includes(item.category)) {
        return fee + 15 * quantity;
      }

      if (item.category === 'İçecekler & Atıştırmalık') {
        return fee + 5 * quantity;
      }

      return fee;
    }, 0) : 0;

    const finalTotal = total + deliveryFee;

    addOrder({
      type: initialOrderType,
      items: orderItems,
      total: finalTotal,
      phone: initialOrderType === 'delivery' ? phone : undefined,
      address: initialOrderType === 'delivery' ? address : undefined,
      paymentType: initialOrderType === 'delivery' ? paymentType : undefined
    });

    setReceiptNumber(prev => prev + 1);
    onComplete();
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth>
      <DialogTitle>
        Sipariş Tamamla
        <IconButton onClick={onClose} style={{ position: 'absolute', right: 8, top: 8 }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent>
        {initialOrderType === 'delivery' && (
          <>
            <TextField
              label="Telefon"
              fullWidth
              value={phone}
              onChange={e => setPhone(e.target.value)}
              margin="normal"
            />
            <TextField
              label="Son 4 Hanesi"
              fullWidth
              value={lastFourDigits}
              onChange={e => setLastFourDigits(e.target.value)}
              margin="normal"
            />
            <TextField
              label="Adres"
              fullWidth
              value={address}
              onChange={e => setAddress(e.target.value)}
              margin="normal"
            />
            <FormControl component="fieldset" margin="normal">
              <RadioGroup row value={paymentType} onChange={e => setPaymentType(e.target.value as 'cash' | 'card')}>
                <FormControlLabel value="cash" control={<Radio />} label="Nakit" />
                <FormControlLabel value="card" control={<Radio />} label="Kart" />
              </RadioGroup>
            </FormControl>
          </>
        )}
        <p><strong>Toplam:</strong> {total} TL</p>
        {initialOrderType === 'delivery' && <p><strong>Kurye Ücreti:</strong> {deliveryFee} TL</p>}
        <p><strong>Genel Toplam:</strong> {total + deliveryFee} TL</p>
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
