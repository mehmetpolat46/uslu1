import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Button, Container, Typography } from '@mui/material';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import DeliveryDiningIcon from '@mui/icons-material/DeliveryDining';

const WelcomeScreen: React.FC = () => {
  const navigate = useNavigate();
  const [selectedType, setSelectedType] = useState<'dine-in' | 'delivery' | null>(null);

  const handleOrderType = (type: 'dine-in' | 'delivery') => {
    setSelectedType(type);
    setTimeout(() => {
      navigate(`/order?type=${type}`);
    }, 200);
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