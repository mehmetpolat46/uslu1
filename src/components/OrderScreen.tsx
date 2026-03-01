import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Box,
  Grid,
  Typography,
  Button,
  Card,
  CardContent,
  IconButton,
  TextField,
  Divider,
  Paper,
  AppBar,
  Toolbar,
  Snackbar,
  Alert,
  Badge,
} from '@mui/material';

import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import DeleteIcon from '@mui/icons-material/Delete';
import PrintIcon from '@mui/icons-material/Print';
import BarChartIcon from '@mui/icons-material/BarChart';
import SettingsIcon from '@mui/icons-material/Settings';
import HomeIcon from '@mui/icons-material/Home';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';

import OrderCompleteModal from './OrderCompleteModal';
import { useOrders } from '../context/OrderContext';
import { CartItem } from '../types';

/* ================= TYPES ================= */

interface Product {
  id: string | number;
  name: string;
  price: number;
  category: string;
  description?: string;
  image?: string;
}

interface FoodMenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
}

/* ================= CATEGORIES ================= */

const categories = [
  'Hatay Usulü Dönerler',
  'Klasik Dönerler',
  'Takolar',
  'Porsiyonlar',
  'Menüler',
  'İçecekler & Atıştırmalık',
];

/* ================= PRODUCTS ================= */

const products: Product[] = [
  // Hatay
  { id: 1, name: 'Hatay Usulü TAVUK Eko', price: 130, category: 'Hatay Usulü Dönerler' },
  { id: 2, name: 'Hatay Usulü TAVUK Normal', price: 150, category: 'Hatay Usulü Dönerler' },
  { id: 3, name: 'Hatay Usulü ET Eko', price: 230, category: 'Hatay Usulü Dönerler' },
  { id: 4, name: 'Hatay Usulü ET Normal', price: 270, category: 'Hatay Usulü Dönerler' },
  { id: 'hatay-lavas', name: 'Ekstra Lavaş', price: 15, category: 'Hatay Usulü Dönerler' },

  // Klasik
  { id: 5, name: 'Klasik TAVUK', price: 130, category: 'Klasik Dönerler' },
  { id: 6, name: 'Klasik ET', price: 230, category: 'Klasik Dönerler' },
  { id: 'klasik-lavas', name: 'Ekstra Lavaş', price: 15, category: 'Klasik Dönerler' },

  // Takolar
  { id: 7, name: 'Tavuk Tako', price: 100, category: 'Takolar' },
  { id: 8, name: 'Et Tako', price: 160, category: 'Takolar' },

  // Porsiyon
  { id: 9, name: 'Tavuk Porsiyon', price: 210, category: 'Porsiyonlar' },
  { id: 10, name: 'Et Porsiyon', price: 360, category: 'Porsiyonlar' },

  // Menüler
  { id: 11, name: 'Tavuk Menü', price: 210, category: 'Menüler' },
  { id: 'menu-lavas', name: 'Ekstra Lavaş', price: 15, category: 'Menüler' },

  // İçecek
  { id: 12, name: 'Ayran', price: 45, category: 'İçecekler & Atıştırmalık' },
  { id: 13, name: 'Su', price: 15, category: 'İçecekler & Atıştırmalık' },
  { id: 14, name: 'Kola', price: 60, category: 'İçecekler & Atıştırmalık' },
];

/* ================= COMPONENT ================= */

const OrderScreen: React.FC = () => {

  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { addOrder } = useOrders(); // ❌ kullanılmıyor ama istersen sonra bağlayabilirsin

  const orderType =
    searchParams.get('type') === 'delivery' ? 'delivery' : 'dine-in';

  const [selectedCategory, setSelectedCategory] = useState(categories[0]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [quantities, setQuantities] = useState<Record<string | number, number>>({});
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

  /* ================= CART FUNCTIONS ================= */

  const handleQuantityChange = (productId: string | number, change: number) => {
    setQuantities(prev => ({
      ...prev,
      [productId]: Math.max(0, (prev[productId] || 0) + change),
    }));
  };

  const addToCart = (product: Product) => {
    const quantity = quantities[product.id] || 0;
    if (quantity === 0) return;

    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);

      if (existing) {
        return prev.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }

      return [...prev, { ...product, quantity }];
    });

    setQuantities(prev => ({
      ...prev,
      [product.id]: 0,
    }));
  };

  const removeFromCart = (id: string | number) => {
    setCart(prev => prev.filter(item => item.id !== id));
  };

  const calculateTotal = () => {
    return cart.reduce((total, item) => total + item.price * item.quantity, 0);
  };

  /* ================= RENDER ================= */

  const filteredProducts = products.filter(
    product => product.category === selectedCategory
  );

  return (
    <Box>

      {/* HEADER */}
      <AppBar position="static">
        <Toolbar>
          <IconButton onClick={() => navigate('/')}>
            <ArrowBackIcon />
          </IconButton>

          <Typography sx={{ flexGrow: 1 }}>
            USLU DÖNER – {orderType === 'delivery' ? 'Kurye' : 'İçeride'}
          </Typography>

          <Button startIcon={<BarChartIcon />} onClick={() => navigate('/admin')}>
            Raporlar
          </Button>

          <Button startIcon={<HomeIcon />} onClick={() => navigate('/')}>
            Ana Sayfa
          </Button>

          <IconButton>
            <Badge badgeContent={cart.length} color="error">
              <ShoppingCartIcon />
            </Badge>
          </IconButton>
        </Toolbar>
      </AppBar>

      {/* CONTENT */}
      <Box p={3}>
        <Grid container spacing={2}>

          {/* PRODUCTS */}
          <Grid item xs={12} md={9}>
            {categories.map(category => (
              <Button
                key={category}
                variant={selectedCategory === category ? 'contained' : 'outlined'}
                onClick={() => setSelectedCategory(category)}
                sx={{ mr: 1, mb: 1 }}
              >
                {category}
              </Button>
            ))}

            <Grid container spacing={2}>
              {filteredProducts.map(product => (
                <Grid item xs={12} sm={6} md={4} key={`${product.id}-${product.category}`}>
                  <Card>
                    <CardContent>
                      <Typography>{product.name}</Typography>
                      <Typography fontWeight="bold">
                        {product.price}₺
                      </Typography>

                      <Box display="flex" alignItems="center" mt={1}>
                        <IconButton
                          onClick={() => handleQuantityChange(product.id, -1)}
                        >
                          <RemoveIcon />
                        </IconButton>

                        <TextField
                          value={quantities[product.id] || 0}
                          size="small"
                          sx={{ width: 50 }}
                          inputProps={{ readOnly: true }}
                        />

                        <IconButton
                          onClick={() => handleQuantityChange(product.id, 1)}
                        >
                          <AddIcon />
                        </IconButton>

                        <Button
                          variant="contained"
                          sx={{ ml: 1 }}
                          disabled={!quantities[product.id]}
                          onClick={() => addToCart(product)}
                        >
                          Ekle
                        </Button>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Grid>

          {/* CART */}
          <Grid item xs={12} md={3}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6">🛒 Sepet</Typography>

              <Divider sx={{ my: 2 }} />

              {cart.map(item => (
                <Box key={item.id} display="flex" justifyContent="space-between" mb={1}>
                  <Typography>
                    {item.quantity}x {item.name}
                  </Typography>

                  <Box>
                    {item.price * item.quantity}₺

                    <IconButton onClick={() => removeFromCart(item.id)}>
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                </Box>
              ))}

              <Divider sx={{ my: 2 }} />

              <Typography fontWeight="bold">
                Toplam: {calculateTotal()}₺
              </Typography>

              <Button
                fullWidth
                variant="contained"
                sx={{ mt: 2 }}
                disabled={cart.length === 0}
                onClick={() => setShowCompleteModal(true)}
              >
                Siparişi Tamamla
              </Button>
            </Paper>
          </Grid>

        </Grid>
      </Box>

      <OrderCompleteModal
        open={showCompleteModal}
        onClose={() => setShowCompleteModal(false)}
        orderType={orderType}
        cart={cart}
        total={calculateTotal()}
        onComplete={() => {
          setCart([]);
          setShowSuccessMessage(true);
        }}
      />

      <Snackbar
        open={showSuccessMessage}
        autoHideDuration={3000}
        onClose={() => setShowSuccessMessage(false)}
      >
        <Alert severity="success">
          Sipariş başarıyla kaydedildi!
        </Alert>
      </Snackbar>

    </Box>
  );
};

export default OrderScreen;
