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

// Parlayan yazı animasyonu için stil ekle
const shineKeyframes = `
@keyframes shine {
  0% {
    background-position: -500px 0;
  }
  100% {
    background-position: 500px 0;
  }
}`;

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
    <>
      <style>{shineKeyframes}</style>
      <Container maxWidth="sm" sx={{ px: { xs: 1, sm: 2 } }}>
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
            flexDirection: { xs: 'column', md: 'row' },
            alignItems: 'center',
            justifyContent: 'center',
            gap: { xs: 0, md: 0 },
            position: 'relative',
          }}
        >
          {/* Sol maskot */}
          <Box
            sx={{
              width: { xs: 0, md: 300 },
              height: { xs: 0, md: '100%' },
              display: { xs: 'none', md: 'flex' },
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <img src="/uslu_maskot.png" alt="Uslu Maskot" style={{ width: 260, maxHeight: '80vh', objectFit: 'contain' }} />
          </Box>
          {/* Orta içerik */}
          <Box sx={{ flex: 1, maxWidth: { xs: '100%', sm: 400, md: 700 }, mx: 'auto', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: { xs: 'auto', md: '100vh' }, py: { xs: 4, md: 0 } }}>
            <Typography
              variant="h1"
              component="h1"
              align="center"
              gutterBottom
              sx={{
                fontWeight: 900,
                fontSize: { xs: '2rem', sm: '2.5rem', md: '5rem' },
                letterSpacing: 2,
                mb: { xs: 2, md: 4 },
                userSelect: 'none',
                textShadow: '2px 2px 8px rgba(0,0,0,0.12)',
                position: 'relative',
                color: 'inherit',
                display: 'inline-block',
              }}
            >
              <span style={{ color: '#e53935' }}>U</span>
              <span style={{ color: '#fb8c00' }}>S</span>
              <span style={{ color: '#fdd835' }}>L</span>
              <span style={{ color: '#43a047' }}>U</span>
              &nbsp;
              <span style={{ color: '#1e88e5' }}>D</span>
              <span style={{ color: '#8e24aa' }}>Ö</span>
              <span style={{ color: '#d81b60' }}>N</span>
              <span style={{ color: '#00bcd4' }}>E</span>
              <span style={{ color: '#ffb300' }}>R</span>
              {/* Parlak ışık efekti */}
              <Box
                component="span"
                sx={{
                  position: 'absolute',
                  left: 0,
                  top: 0,
                  width: '100%',
                  height: '100%',
                  pointerEvents: 'none',
                  background: 'linear-gradient(120deg, transparent 0%, rgba(255,255,255,0.7) 40%, rgba(255,255,255,0.9) 50%, rgba(255,255,255,0.7) 60%, transparent 100%)',
                  backgroundSize: '200% 100%',
                  mixBlendMode: 'lighten',
                  animation: 'shine 2s linear infinite',
                  borderRadius: 2,
                }}
              />
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: { xs: 2, sm: 3 }, width: '100%', justifyContent: 'center', alignItems: 'center', mt: { xs: 2, md: 0 } }}>
              <Button
                variant="contained"
                size="large"
                fullWidth={true}
                startIcon={<RestaurantIcon />}
                onClick={() => handleOrderType('dine-in')}
                sx={{ py: { xs: 2, md: 4 }, fontSize: { xs: '1rem', sm: '1.3rem', md: '1.5rem' }, minHeight: { xs: 48, md: 80 }, minWidth: 0, width: { xs: '100%', sm: 220, md: 300 } }}
                color="error"
              >
                İçeri
              </Button>
              <Button
                variant="contained"
                size="large"
                fullWidth={true}
                startIcon={<DeliveryDiningIcon />}
                onClick={() => handleOrderType('delivery')}
                sx={{ py: { xs: 2, md: 4 }, fontSize: { xs: '1rem', sm: '1.3rem', md: '1.5rem' }, minHeight: { xs: 48, md: 80 }, minWidth: 0, width: { xs: '100%', sm: 220, md: 300 } }}
                color="primary"
              >
                Kurye
              </Button>
            </Box>
          </Box>
          {/* Sağ maskot */}
          <Box
            sx={{
              width: { xs: 0, md: 300 },
              height: { xs: 0, md: '100%' },
              display: { xs: 'none', md: 'flex' },
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <img src="/uslu_maskot.png" alt="Uslu Maskot" style={{ width: 260, maxHeight: '80vh', objectFit: 'contain', transform: 'scaleX(-1)' }} />
          </Box>
        </Box>
      </Container>
    </>
  );
};

export default WelcomeScreen; 