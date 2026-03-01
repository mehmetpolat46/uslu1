import React, { useState } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
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
  CardMedia,
  CardActions,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  RadioGroup,
  FormControlLabel,
  Radio,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import DeleteIcon from '@mui/icons-material/Delete';
import PrintIcon from '@mui/icons-material/Print';
import BarChartIcon from '@mui/icons-material/BarChart';
import SettingsIcon from '@mui/icons-material/Settings';
import HomeIcon from '@mui/icons-material/Home';
import OrderCompleteModal from './OrderCompleteModal';
import { useOrders } from '../context/OrderContext';
import {
  ArrowBack as ArrowBackIcon,
  ShoppingCart as ShoppingCartIcon,
} from '@mui/icons-material';
import { CartItem } from '../types';

interface Product {
  id: string | number;
  name: string;
  price: number;
  category: string;
  description?: string;
  image?: string;
}

interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
}

const categories = [
  'Hatay Usulü Dönerler',
  'Klasik Dönerler',
  'Takolar',
  'Porsiyonlar',
  'Menüler',
  'İçecekler & Atıştırmalık',
];

const products: Product[] = [
  // Hatay Usulü Dönerler
  {
    id: 1,
    name: 'Hatay Usulü TAVUK Eko Döner',
    price: 130,
    category: 'Hatay Usulü Dönerler',
  },
  {
    id: 2,
    name: 'Hatay Usulü TAVUK Normal Döner',
    price: 150,
    category: 'Hatay Usulü Dönerler',
  },
  {
    id: 3,
    name: 'Hatay Usulü TAVUK Maksi Döner',
    price: 190,
    category: 'Hatay Usulü Dönerler',
  },
  
  {
    id: 4,
    name: 'Hatay Usulü ET Eko Döner',
    price: 230,
    category: 'Hatay Usulü Dönerler',
  },
  {
    id: 5,
    name: 'Hatay Usulü ET Normal Döner',
    price: 270,
    category: 'Hatay Usulü Dönerler',
  },
  {
    id: 6,
    name: 'Hatay Usulü ET Maksi Döner',
    price: 330,
    category: 'Hatay Usulü Dönerler',
  },
  {
    id: 'hud-lavas',
    name: 'Ekstra Lavaş',
    price: 15,
    category: 'Hatay Usulü Dönerler',
  },
  {
    id:221,
    name: 'Mercimek Çorbası',
    price: 90,
    category: 'Hatay Usulü Dönerler',
  },

  // Klasik Dönerler
  {
    id: 7,
    name: 'Klasik TAVUK Eko Döner',
    price: 130,
    category: 'Klasik Dönerler',
  },
  {
    id: 8,
    name: 'Klasik TAVUK Normal Döner',
    price: 150,
    category: 'Klasik Dönerler',
  },
  {
    id: 9,
    name: 'Klasik ET Eko Döner',
    price: 230,
    category: 'Klasik Dönerler',
  },
  {
    id: 10,
    name: 'Klasik ET Normal Döner',
    price: 270,
    category: 'Klasik Dönerler',
  },
  {
    id: 'hud-lavas',
    name: 'Ekstra Lavaş',
    price: 15,
    category: 'Klasik Dönerler',
  },

  // Takolar
  {
    id: 11,
    name: 'TAVUK Tekli Tako',
    price: 100,
    category: 'Takolar',
  },
  {
    id: 12,
    name: 'TAVUK İkili Tako',
    price: 170,
    category: 'Takolar',
  },
  {
    id: 13,
    name: 'ET Tekli Tako',
    price: 160,
    category: 'Takolar',
  },
  {
    id: 14,
    name: 'ET İkili Tako',
    price: 290,
    category: 'Takolar',
  },
  {
    id: 15,
    name: 'Karışık Combo Tako',
    price: 230,
    category: 'Takolar',
  },
  

  // Porsiyonlar
  {
    id: 16,
    name: 'TAVUK Döner Porsiyon',
    price: 210,
    category: 'Porsiyonlar',
  },
  {
    id: 17,
    name: 'Pilav Üstü TAVUK Döner Porsiyon',
    price: 230,
    category: 'Porsiyonlar',
  },
  {
    id: 18,
    name: 'ET Döner Porsiyon',
    price: 360,
    category: 'Porsiyonlar',
  },
  {
    id: 19,
    name: 'Pilav Üstü ET Döner Porsiyon',
    price: 380,
    category: 'Porsiyonlar',
  },
  {
    id: 'hud-lavas',
    name: 'Ekstra Lavaş',
    price: 15,
    category: 'Porsiyonlar',
  },

  // Menüler
  {
    id: 20,
    name: 'TAVUK Döner Menü',
    price: 210,
    category: 'Menüler',
  },
  {
    id: 21,
    name: 'ET Döner Menü',
    price: 330,
    category: 'Menüler',
  },
  {
    id: 'm-lavas',
    name: 'Ekstra Lavaş',
    price: 15,
    category: 'Menüler',
  },

  // İçecekler & Atıştırmalık
  {
    id: 22,
    name: 'Ayran',
    price: 45,
    category: 'İçecekler & Atıştırmalık',
  },
  {
    id: 23,
    name: 'Kutu İçecekler',
    price: 60,
    category: 'İçecekler & Atıştırmalık',
  },
  {
    id: 24,
    name: 'Şalgam',
    price: 45,
    category: 'İçecekler & Atıştırmalık',
  },
  {
    id: 25,
    name: 'Soda',
    price: 30,
    category: 'İçecekler & Atıştırmalık',
  },
  {
    id: 26,
    name: 'Su',
    price: 15,
    category: 'İçecekler & Atıştırmalık',
  },
  {
    id: 27,
    name: 'Külahta Patates Kızartması',
    price: 60,
    category: 'İçecekler & Atıştırmalık',
  },
  {
    id: 28,
    name: 'Antep Usulü Katmer Tatlısı',
    price: 150,
    category: 'İçecekler & Atıştırmalık',
  },
  {
    id: 29,
    name: '1 LT Kola ',
    price: 85,
    category: 'İçecekler & Atıştırmalık',
  },
  {
    id: 30,
    name: '1 LT Ayaran',
    price: 85,
    category: 'İçecekler & Atıştırmalık',
  },
  {
    id: 31,
    name: '2,5 LT Kola',
    price: 110,
    category: 'İçecekler & Atıştırmalık',
  },

  {
    id: 'drink-2',
    name: 'Servis Patates',
    price: 80,
    category: 'İçecekler & Atıştırmalık',
    image: 'https://via.placeholder.com/150',
  },
 
];

const menuItems: MenuItem[] = [
  {
    id: '1',
    name: 'Döner Porsiyon',
    description: 'Özel soslu döner porsiyon',
    price: 130,
    image: '/images/doner.jpg',
    category: 'Ana Yemekler'
  },
  {
    id: '2',
    name: 'İskender',
    description: 'Özel domates soslu iskender',
    price: 150,
    image: '/images/iskender.jpg',
    category: 'Ana Yemekler'
  },
  {
    id: '3',
    name: 'Lahmacun',
    description: 'İnce hamurlu lahmacun',
    price: 45,
    image: '/images/lahmacun.jpg',
    category: 'Fast Food'
  },
  {
    id: '4',
    name: 'Pide',
    description: 'Kaşarlı pide',
    price: 60,
    image: '/images/pide.jpg',
    category: 'Fast Food'
  },
  {
    id: '5',
    name: 'Ayran',
    description: 'Soğuk ayran',
    price: 15,
    image: '/images/ayran.jpg',
    category: 'İçecekler'
  },
  {
    id: '6',
    name: 'Kola',
    description: 'Soğuk kola',
    price: 20,
    image: '/images/kola.jpg',
    category: 'İçecekler'
  }
];

const OrderScreen: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { addOrder } = useOrders();
  const orderType = searchParams.get('type') === 'delivery' ? 'delivery' : 'dine-in';
  const [selectedCategory, setSelectedCategory] = useState<string>(categories[0]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [quantities, setQuantities] = useState<Record<string | number, number>>({});
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [paymentType, setPaymentType] = useState<'cash' | 'card'>('cash');
  const [showCompleteModal, setShowCompleteModal] = useState(false);

  const handleQuantityChange = (productId: string | number, change: number) => {
    setQuantities((prev) => ({
      ...prev,
      [productId]: Math.max(0, (prev[productId] || 0) + change),
    }));
  };

  const addToCart = (product: Product) => {
    const quantity = quantities[product.id] || 0;
    if (quantity === 0) return;

    setCart((prev) => {
      const existingItem = prev.find((item) => item.id === product.id);
      if (existingItem) {
        return prev.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prev, { ...product, quantity }];
    });

    setQuantities((prev) => ({
      ...prev,
      [product.id]: 0,
    }));
  };

  const removeFromCart = (productId: string | number) => {
    setCart((prev) => prev.filter((item) => item.id !== productId));
  };

  const calculateTotal = () => {
    const subtotal = cart.reduce((total, item) => total + item.price * item.quantity, 0);
    const deliveryFee = orderType === 'delivery' ? calculateDeliveryFee() : 0;
    return subtotal + deliveryFee;
  };

  const calculateDeliveryFee = () => {
    if (orderType !== 'delivery') return 0;

    let fee = 0;

    cart.forEach(item => {
      const quantity = item.quantity || 1;

      if (item.name.toLowerCase().includes('lavaş')) {
        return; // Skip lavaş items
      }

      if (['Hatay Usulü Dönerler', 'Klasik Dönerler', 'Takolar', 'Porsiyonlar', 'Menüler'].includes(item.category)) {
        fee += (20 * quantity); // Her ana ürün için 20 TL
      } else if (item.category === 'İçecekler & Atıştırmalık') {
        fee += (10 * quantity); // Her içecek için 10 TL
      }
    });

    return fee;
  };

  const handleComplete = () => {
    // Yazdırma işlemi
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      const content = `
        <html>
          <head>
            <title>Uslu Döner - Sipariş Fişi</title>
            <style>
              body { font-family: monospace; padding: 20px; }
              .header { text-align: center; margin-bottom: 20px; }
              .divider { border-top: 1px dashed #000; margin: 10px 0; }
              .total { font-weight: bold; }
              .right { text-align: right; }
              .item { margin: 5px 0; }
              .price { float: right; }
              .clear { clear: both; }
            </style>
          </head>
          <body>
            <div class="header">
              <h2>🍽️ USLU DÖNER</h2>
              <p>📍 Sipariş Tipi: ${orderType === 'dine-in' ? 'İçeride' : 'Kurye'}</p>
              <p>📆 ${new Date().toLocaleString('tr-TR')}</p>
            </div>
            <div class="divider"></div>
            ${cart.map(item => `
              <div class="item">
                <span>${item.quantity}x ${item.name}</span>
                <span class="price">${(item.price * item.quantity).toFixed(2)}₺</span>
                <div class="clear"></div>
              </div>
            `).join('')}
            <div class="divider"></div>
            ${orderType === 'delivery' ? `
              <div class="item">
                <span>Kurye Ücreti</span>
                <span class="price">${calculateDeliveryFee().toFixed(2)}₺</span>
                <div class="clear"></div>
              </div>
              <div class="divider"></div>
              <div>
                <p>📱 Telefon: ${phone || '-'}</p>
                <p>📍 Adres: ${address || '-'}</p>
              </div>
              <div class="divider"></div>
              <div>
                <p>💳 Ödeme Tipi: ${paymentType === 'cash' ? 'Nakit' : 'Kredi Kartı'}</p>
              </div>
            ` : ''}
            <div class="divider"></div>
            <div class="total right">
              Toplam: ${calculateTotal().toFixed(2)}₺
            </div>
            <div class="divider"></div>
            <div style="text-align: center; margin-top: 20px;">
              <p>Bizi tercih ettiğiniz için teşekkür ederiz!</p>
              <p>Afiyet olsun...</p>
            </div>
          </body>
        </html>
      `;
      printWindow.document.write(content);
      printWindow.document.close();
      printWindow.print();
    }

    // Sepeti temizle
    setCart([]);
    setQuantities({});

    // Modalı kapat
    setIsOrderModalOpen(false);

    // Başarı mesajını göster
    setShowSuccessMessage(true);
  };

  const exportToExcel = () => {
    // Excel başlıkları
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

    // Siparişleri Excel formatına dönüştür
    const excelData = cart.map(item => [
      new Date().toLocaleString('tr-TR'),
      orderType === 'dine-in' ? 'İçeride' : 'Kurye',
      item.name,
      item.quantity,
      item.price,
      item.price * item.quantity,
      orderType === 'delivery' ? phone : '-',
      orderType === 'delivery' ? address : '-',
      orderType === 'delivery' ? (paymentType === 'cash' ? 'Nakit' : 'Kredi Kartı') : '-'
    ]);

    // CSV formatına dönüştür
    const csvContent = [
      headers.join(','),
      ...excelData.map(row => row.join(','))
    ].join('\n');

    // CSV dosyasını indir
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `uslu_doner_siparis_${new Date().toLocaleString('tr-TR').replace(/[/\\?%*:|"<>]/g, '-')}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleAddToCart = (item: MenuItem) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(cartItem => cartItem.id === item.id);
      if (existingItem) {
        return prevCart.map(cartItem =>
          cartItem.id === item.id
            ? { ...cartItem, quantity: cartItem.quantity + 1 }
            : cartItem
        );
      }
      return [...prevCart, { 
        id: item.id,
        name: item.name,
        price: item.price,
        quantity: 1,
        category: item.category
      }];
    });
  };

  const filteredProducts = products.filter(
    (product) => product.category === selectedCategory
  );

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static" color="default" elevation={1}>
        <Toolbar sx={{ minHeight: '64px' }}>
          <IconButton
            edge="start"
            color="inherit"
            onClick={() => navigate('/')}
            sx={{ mr: 1 }}
          >
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1, fontSize: '1.1rem', color: orderType === 'delivery' ? 'primary.main' : 'error.main' }}>
            USLU DÖNER – {orderType === 'dine-in' ? 'İçeride' : 'Kurye'}
          </Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              startIcon={<BarChartIcon />}
              onClick={() => navigate('/admin')}
              size="small"
              sx={{ fontSize: '0.8rem' }}
              color={orderType === 'delivery' ? 'primary' : 'error'}
            >
              Raporlar
            </Button>
            <Button
              startIcon={<SettingsIcon />}
              onClick={() => navigate('/admin')}
              size="small"
              sx={{ fontSize: '0.8rem' }}
              color={orderType === 'delivery' ? 'primary' : 'error'}
            >
              Ayarlar
            </Button>
            <Button
              startIcon={<HomeIcon />}
              onClick={() => navigate('/')}
              size="small"
              sx={{ fontSize: '0.8rem' }}
              color={orderType === 'delivery' ? 'primary' : 'error'}
            >
              Ana Sayfa
            </Button>
            <Button
              startIcon={<PrintIcon />}
              onClick={exportToExcel}
              size="small"
              sx={{ fontSize: '0.8rem' }}
              color={orderType === 'delivery' ? 'primary' : 'error'}
            >
              Excel
            </Button>
            <IconButton color="inherit" size="small">
              <Badge badgeContent={cart.length} color="primary">
                <ShoppingCartIcon />
              </Badge>
            </IconButton>
          </Box>
        </Toolbar>
      </AppBar>

      <Box sx={{ p: 3 }}>
        <Grid container spacing={2}>
          {/* Left side - Categories and Products */}
          <Grid item xs={12} md={9}>
            <Box sx={{ mb: 2, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {categories.map((category) => (
                <Button
                  key={category}
                  variant={selectedCategory === category ? 'contained' : 'outlined'}
                  onClick={() => setSelectedCategory(category)}
                  sx={{ 
                    minWidth: '120px',
                    height: '40px',
                    fontSize: '0.9rem'
                  }}
                  color={orderType === 'delivery' ? 'primary' : 'error'}
                >
                  {category}
                </Button>
              ))}
            </Box>

            <Grid container spacing={1}>
              {filteredProducts.map((product) => (
                <Grid item xs={12} sm={6} md={4} key={product.id}>
                  <Card sx={{ height: '100%' }}>
                    <CardContent>
                      <Typography variant="h6" sx={{ fontSize: '1rem' }}>{product.name}</Typography>
                      <Typography color="textSecondary" sx={{ fontSize: '1.1rem', fontWeight: 'bold' }}>
                        {product.price}₺
                      </Typography>
                      {product.description && (
                        <Typography variant="body2" sx={{ fontSize: '0.8rem' }}>{product.description}</Typography>
                      )}
                      <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                        <IconButton
                          onClick={() => handleQuantityChange(product.id, -1)}
                          disabled={!quantities[product.id]}
                          size="small"
                        >
                          <RemoveIcon />
                        </IconButton>
                        <TextField
                          value={quantities[product.id] || 0}
                          size="small"
                          sx={{ width: 50, mx: 1 }}
                          inputProps={{ 
                            readOnly: true,
                            style: { textAlign: 'center', fontSize: '1rem' }
                          }}
                        />
                        <IconButton
                          onClick={() => handleQuantityChange(product.id, 1)}
                          size="small"
                        >
                          <AddIcon />
                        </IconButton>
                        <Button
                          variant="contained"
                          onClick={() => addToCart(product)}
                          disabled={!quantities[product.id]}
                          sx={{ ml: 1, fontSize: '0.8rem' }}
                          color={orderType === 'delivery' ? 'primary' : 'error'}
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

          {/* Right side - Cart */}
          <Grid item xs={12} md={3}>
            <Paper sx={{ p: 2, height: 'calc(100vh - 120px)', position: 'sticky', top: '20px', overflow: 'auto' }}>
              <Typography variant="h6" gutterBottom sx={{ fontSize: '1.1rem', fontWeight: 600, color: orderType === 'delivery' ? 'primary.main' : 'error.main' }}>
                🛒 Sepet
              </Typography>
              <Divider sx={{ mb: 2 }} />
              {cart.length === 0 ? (
                <Typography color="textSecondary" align="center" sx={{ py: 4, fontSize: '0.9rem' }}>
                  Sepetiniz boş.
                  <br />
                  Lütfen sol taraftan ürün seçin.
                </Typography>
              ) : (
                <>
                  {cart.map((item) => (
                    <Box
                      key={item.id}
                      sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        mb: 1,
                        p: 1,
                        borderRadius: 1,
                        '&:hover': {
                          backgroundColor: 'rgba(0, 0, 0, 0.04)'
                        }
                      }}
                    >
                      <Box>
                        <Typography sx={{ fontSize: '0.9rem', fontWeight: 500 }}>{item.name}</Typography>
                        <Typography variant="body2" color="textSecondary" sx={{ fontSize: '0.8rem' }}>
                          {item.quantity} x {item.price}₺
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Typography sx={{ mr: 1, fontSize: '0.9rem', fontWeight: 500 }}>
                          {item.quantity * item.price}₺
                        </Typography>
                        <IconButton
                          size="small"
                          onClick={() => removeFromCart(item.id)}
                          sx={{ p: 0.5 }}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Box>
                    </Box>
                  ))}
                  <Divider sx={{ my: 2 }} />
                  <Typography variant="h6" gutterBottom sx={{ fontSize: '1.1rem', fontWeight: 600, color: orderType === 'delivery' ? 'primary.main' : 'error.main' }}>
                    Toplam: {calculateTotal()}₺
                  </Typography>
                  {orderType === 'delivery' && (
                    <Typography variant="body2" color="textSecondary" gutterBottom sx={{ fontSize: '0.8rem' }}>
                      * Kurye ücreti dahildir
                    </Typography>
                  )}
                  <Button
                    variant="contained"
                    fullWidth
                    disabled={cart.length === 0}
                    startIcon={<PrintIcon />}
                    onClick={() => setShowCompleteModal(true)}
                    sx={{ mt: 2, py: 1.5, fontSize: '0.9rem' }}
                    color={orderType === 'delivery' ? 'primary' : 'error'}
                  >
                    Siparişi Tamamla
                  </Button>
                </>
              )}
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
        onComplete={handleComplete}
      />

      <Snackbar
        open={showSuccessMessage}
        autoHideDuration={3000}
        onClose={() => setShowSuccessMessage(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity="success" sx={{ width: '100%' }}>
          Sipariş başarıyla kaydedildi!
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default OrderScreen; 
