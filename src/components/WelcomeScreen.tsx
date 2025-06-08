import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Button, Container, Typography } from '@mui/material';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import DeliveryDiningIcon from '@mui/icons-material/DeliveryDining';

const WelcomeScreen: React.FC = () => {
  const navigate = useNavigate();

  const handleOrderType = (type: 'dine-in' | 'delivery') => {
    navigate('/order', { state: { orderType: type } });
  };

  return (
    <Container maxWidth="sm">
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
        <Typography variant="h1" component="h1" align="center" gutterBottom>
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
          >
            Kurye
          </Button>
        </Box>
      </Box>
    </Container>
  );
};

export default WelcomeScreen; 