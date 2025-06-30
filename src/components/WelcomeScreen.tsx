import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Button, Container, Typography } from '@mui/material';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import DeliveryDiningIcon from '@mui/icons-material/DeliveryDining';
import { useOrders } from '../context/OrderContext';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';

const WelcomeScreen: React.FC = () => {
  const navigate = useNavigate();
  const [selectedType, setSelectedType] = useState<'dine-in' | 'delivery' | null>(null);
  const { orders, deleteOrder } = useOrders();
  const [confirmOpen, setConfirmOpen] = useState(false);

  const handleOrderType = (type: 'dine-in' | 'delivery') => {
    setSelectedType(type);
    setTimeout(() => {
      navigate(`/order?type=${type}`);
    }, 200);
  };

  const handleDeleteLastOrder = () => {
    setConfirmOpen(true);
  };

  const handleConfirmDelete = () => {
    if (orders.length === 0) return;
    const lastOrder = orders[orders.length - 1];
    deleteOrder(lastOrder.id);
    setConfirmOpen(false);
  };

  const handleCancelDelete = () => {
    setConfirmOpen(false);
  };

  return (
    <Container maxWidth="sm">
      <Button
        variant="contained"
        color="success"
        onClick={handleDeleteLastOrder}
        disabled={orders.length === 0}
        sx={{
          position: 'fixed',
          left: 24,
          bottom: 24,
          zIndex: 1300,
          fontWeight: 600,
          px: 3,
          py: 1.5,
          borderRadius: 2,
          boxShadow: 3
        }}
      >
        Son Siparişi Sil
      </Button>
      <Dialog open={confirmOpen} onClose={handleCancelDelete}>
        <DialogTitle>Son Siparişi Sil</DialogTitle>
        <DialogContent>
          <Typography>Son siparişi silmek istediğinize emin misiniz?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelDelete} color="inherit">İptal</Button>
          <Button onClick={handleConfirmDelete} color="success" variant="contained">Evet, Sil</Button>
        </DialogActions>
      </Dialog>
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 4,
        }}
      >
        <Typography variant="h1" component="h1" align="center" gutterBottom sx={{ color: 'primary.main' }}>
          Uslu Döner
        </Typography>
        <Box sx={{ display: 'flex', gap: 4, width: '100%' }}>
          <Button
            variant="contained"
            size="large"
            fullWidth
            startIcon={<RestaurantIcon />}
            onClick={() => handleOrderType('dine-in')}
            sx={{ py: 3, fontSize: '1.2rem' }}
            color="error"
          >
            İçeri
          </Button>
          <Button
            variant="contained"
            size="large"
            fullWidth
            startIcon={<DeliveryDiningIcon />}
            onClick={() => handleOrderType('delivery')}
            sx={{ py: 3, fontSize: '1.2rem' }}
            color="primary"
          >
            Kurye
          </Button>
        </Box>
      </Box>
    </Container>
  );
};

export default WelcomeScreen; 