import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  AppBar,
  Toolbar,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import trLocale from 'date-fns/locale/tr';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import DeleteIcon from '@mui/icons-material/Delete';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useNavigate } from 'react-router-dom';
import { useOrders } from '../context/OrderContext';
import PrintIcon from '@mui/icons-material/Print';
import HomeIcon from '@mui/icons-material/Home';
import ExcelExport from './ExcelExport';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

interface PhoneAddressData {
  address: string;
}

interface SavedPhones {
  [key: string]: PhoneAddressData;
}

const AdminPanel: React.FC = () => {
  const navigate = useNavigate();
  const { orders, deleteOrder, getSalesStats } = useOrders();
  const [tabValue, setTabValue] = useState(0);
  const [startDate, setStartDate] = useState<Date | null>(new Date());
  const [endDate, setEndDate] = useState<Date | null>(new Date());
  const [dateRange, setDateRange] = useState('today');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<{ name: string; quantity: number; total: number } | null>(null);
  const [phoneAddress, setPhoneAddress] = useState({ phone: '', address: '' });
  const [savedPhones, setSavedPhones] = useState<SavedPhones>(() => {
    const saved = localStorage.getItem('savedPhones');
    return saved ? JSON.parse(saved) : {};
  });

  // Save to localStorage whenever savedPhones changes
  useEffect(() => {
    localStorage.setItem('savedPhones', JSON.stringify(savedPhones));
  }, [savedPhones]);

  const handleSavePhoneAddress = () => {
    if (phoneAddress.phone && phoneAddress.address) {
      setSavedPhones((prev: SavedPhones) => ({
        ...prev,
        [phoneAddress.phone]: { address: phoneAddress.address }
      }));
      setPhoneAddress({ phone: '', address: '' });
    }
  };

  const handleDeletePhoneAddress = (phone: string) => {
    setSavedPhones((prev: SavedPhones) => {
      const newPhones = { ...prev };
      delete newPhones[phone];
      return newPhones;
    });
  };

  const stats = getSalesStats();

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleDateRangeChange = (event: any) => {
    const value = event.target.value;
    setDateRange(value);
    const today = new Date();
    
    switch (value) {
      case 'today':
        setStartDate(today);
        setEndDate(today);
        break;
      case 'yesterday':
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        setStartDate(yesterday);
        setEndDate(yesterday);
        break;
      case 'thisWeek':
        const startOfWeek = new Date(today);
        startOfWeek.setDate(today.getDate() - today.getDay());
        setStartDate(startOfWeek);
        setEndDate(today);
        break;
      case 'custom':
        // Custom date range will be handled by DatePicker components
        break;
    }
  };

  // Siparişleri tarihe göre grupla
  const groupedOrders = orders.reduce((acc, order) => {
    const date = new Date(order.date).toLocaleDateString('tr-TR');
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(order);
    return acc;
  }, {} as { [key: string]: typeof orders });

  // Günlük toplam satışları hesapla
  const dailySales = Object.entries(groupedOrders).map(([date, orders]) => ({
    date,
    totalSales: orders.reduce((sum, order) => sum + order.total, 0),
    orderCount: orders.length,
    deliveryCount: orders.filter(order => order.type === 'delivery').length,
  }));

  // Ürün bazlı satışları hesapla
  const productSales = orders.reduce((acc, order) => {
    order.items.forEach(item => {
      const existing = acc.find(p => p.name === item.name);
      if (existing) {
        existing.quantity += item.quantity;
        existing.total += item.price * item.quantity;
      } else {
        acc.push({
          name: item.name,
          quantity: item.quantity,
          total: item.price * item.quantity,
        });
      }
    });
    return acc;
  }, [] as Array<{ name: string; quantity: number; total: number }>);

  const handleDeleteProduct = (product: { name: string; quantity: number; total: number }) => {
    setSelectedProduct(product);
    setDeleteDialogOpen(true);
  };

  const confirmDeleteProduct = () => {
    if (selectedProduct) {
      // Seçili ürünü içeren siparişleri bul ve sil
      const ordersToDelete = orders.filter(order => 
        order.items.some(item => item.name === selectedProduct.name)
      );
      
      ordersToDelete.forEach(order => {
        deleteOrder(order.id);
      });
    }
    setDeleteDialogOpen(false);
    setSelectedProduct(null);
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
    const excelData = orders.flatMap(order => 
      order.items.map(item => [
        new Date(order.date).toLocaleString('tr-TR'),
        order.type === 'dine-in' ? 'İçeride' : 'Kurye',
        item.name,
        item.quantity,
        item.price,
        item.price * item.quantity,
        order.type === 'delivery' ? order.phone : '-',
        order.type === 'delivery' ? order.address : '-',
        order.type === 'delivery' ? (order.paymentType === 'cash' ? 'Nakit' : 'Kredi Kartı') : '-'
      ])
    );

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
    link.setAttribute('download', `uslu_doner_rapor_${new Date().toLocaleString('tr-TR').replace(/[/\\?%*:|"<>]/g, '-')}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static" color="default" elevation={1}>
        <Toolbar>
          <IconButton
            edge="start"
            color="inherit"
            onClick={() => navigate('/')}
            sx={{ mr: 2 }}
          >
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            USLU DÖNER - Yönetim Paneli
          </Typography>
          <ExcelExport data={orders} filename="uslu_doner_rapor" />
          <Button
            startIcon={<HomeIcon />}
            onClick={() => navigate('/')}
            sx={{ ml: 1 }}
          >
            Ana Sayfa
          </Button>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Paper sx={{ width: '100%', mb: 2 }}>
          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            indicatorColor="primary"
            textColor="primary"
          >
            <Tab label="Kasa" />
            <Tab label="Raporlar" />
            <Tab label="Sipariş Geçmişi" />
            <Tab label="Ayarlar" />
          </Tabs>

          <TabPanel value={tabValue} index={0}>
            <Box sx={{ mb: 3, display: 'flex', gap: 2, alignItems: 'center' }}>
              <FormControl sx={{ minWidth: 200 }}>
                <InputLabel>Tarih Aralığı</InputLabel>
                <Select
                  value={dateRange}
                  label="Tarih Aralığı"
                  onChange={handleDateRangeChange}
                >
                  <MenuItem value="today">Bugün</MenuItem>
                  <MenuItem value="yesterday">Dün</MenuItem>
                  <MenuItem value="thisWeek">Bu Hafta</MenuItem>
                  <MenuItem value="custom">Özel Aralık</MenuItem>
                </Select>
              </FormControl>

              {dateRange === 'custom' && (
                <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={trLocale}>
                  <DatePicker
                    label="Başlangıç Tarihi"
                    value={startDate}
                    onChange={(newValue) => setStartDate(newValue)}
                  />
                  <DatePicker
                    label="Bitiş Tarihi"
                    value={endDate}
                    onChange={(newValue) => setEndDate(newValue)}
                  />
                </LocalizationProvider>
              )}
            </Box>

            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Ürün Adı</TableCell>
                    <TableCell>Kategori</TableCell>
                    <TableCell align="right">Satış Adedi</TableCell>
                    <TableCell align="right">Toplam Tutar</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {Object.entries(stats.productStats).map(([name, data]) => (
                    <TableRow key={name}>
                      <TableCell>{name}</TableCell>
                      <TableCell>{data.category}</TableCell>
                      <TableCell align="right">{data.quantity}</TableCell>
                      <TableCell align="right">{data.total}₺</TableCell>
                    </TableRow>
                  ))}
                  <TableRow>
                    <TableCell colSpan={2}>
                      <Typography variant="h6">Toplam</Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="h6">
                        {Object.values(stats.productStats).reduce((sum, data) => sum + data.quantity, 0)}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="h6">{stats.totalSales}₺</Typography>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
          </TabPanel>

          <TabPanel value={tabValue} index={1}>
            <Box sx={{ mb: 2 }}>
              <Button
                variant="contained"
                startIcon={<FileDownloadIcon />}
                sx={{ mb: 2 }}
                onClick={exportToExcel}
              >
                Excel'e Aktar
              </Button>
            </Box>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Ürün Adı</TableCell>
                    <TableCell align="right">Satış Adedi</TableCell>
                    <TableCell align="right">Toplam Tutar</TableCell>
                    <TableCell align="right">İşlemler</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {productSales.map((row) => (
                    <TableRow key={row.name}>
                      <TableCell>{row.name}</TableCell>
                      <TableCell align="right">{row.quantity}</TableCell>
                      <TableCell align="right">{row.total}₺</TableCell>
                      <TableCell align="right">
                        <IconButton
                          color="error"
                          onClick={() => handleDeleteProduct(row)}
                          title="Bu ürünün tüm satışlarını sil"
                        >
                          <DeleteIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </TabPanel>

          <TabPanel value={tabValue} index={2}>
            {Object.entries(groupedOrders).map(([date, dayOrders]) => (
              <Box key={date} sx={{ mb: 4 }}>
                <Typography variant="h6" gutterBottom>
                  🗓️ {date}
                </Typography>

                <Typography variant="subtitle1" gutterBottom>
                  ✅ İçeride Siparişler:
                </Typography>
                {dayOrders
                  .filter((order) => order.type === 'dine-in')
                  .map((order) => (
                    <Box key={order.id} sx={{ ml: 2, mb: 1 }}>
                      {order.items.map((item, index) => (
                        <Typography key={index}>
                          - {item.quantity}x {item.name} – {item.price}₺
                        </Typography>
                      ))}
                      <Button
                        size="small"
                        startIcon={<DeleteIcon />}
                        color="error"
                        sx={{ mt: 1 }}
                        onClick={() => deleteOrder(order.id)}
                      >
                        Siparişi Sil
                      </Button>
                    </Box>
                  ))}

                <Typography variant="subtitle1" gutterBottom sx={{ mt: 2 }}>
                  🔴 Kurye Siparişleri:
                </Typography>
                {dayOrders
                  .filter((order) => order.type === 'delivery')
                  .map((order) => (
                    <Box key={order.id} sx={{ ml: 2, mb: 1 }}>
                      {order.items.map((item, index) => (
                        <Typography key={index}>
                          - {item.quantity}x {item.name} – {item.price}₺
                        </Typography>
                      ))}
                      <Typography variant="body2" color="textSecondary">
                        📱 {order.phone}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        📍 {order.address}
                      </Typography>
                      <Button
                        size="small"
                        startIcon={<DeleteIcon />}
                        color="error"
                        sx={{ mt: 1 }}
                        onClick={() => deleteOrder(order.id)}
                      >
                        Siparişi Sil
                      </Button>
                    </Box>
                  ))}

                <Typography variant="h6" sx={{ mt: 2 }}>
                  TOPLAM: {dayOrders.reduce((sum, order) => sum + order.total, 0)}₺
                </Typography>
              </Box>
            ))}
          </TabPanel>

          <TabPanel value={tabValue} index={3}>
            <Box sx={{ maxWidth: 600 }}>
              <Typography variant="h6" gutterBottom>
                Telefon ve Adres Kayıtları
              </Typography>
              <Box sx={{ mb: 2 }}>
                <TextField
                  label="Telefon"
                  fullWidth
                  sx={{ mb: 2 }}
                  value={phoneAddress.phone}
                  onChange={(e) => {
                    const phone = e.target.value;
                    if (phone.length === 10) {
                      const address = savedPhones[phone]?.address || '';
                      setPhoneAddress({ phone, address });
                    } else {
                      setPhoneAddress(prev => ({ ...prev, phone }));
                    }
                  }}
                />
                <TextField
                  label="Adres"
                  fullWidth
                  multiline
                  rows={2}
                  sx={{ mb: 2 }}
                  value={phoneAddress.address}
                  onChange={(e) => setPhoneAddress(prev => ({ ...prev, address: e.target.value }))}
                />
                <Button
                  variant="contained"
                  fullWidth
                  onClick={handleSavePhoneAddress}
                >
                  Kaydet
                </Button>
              </Box>

              <Typography variant="h6" gutterBottom sx={{ mt: 4 }}>
                Kayıtlı Telefonlar
              </Typography>
              <Box sx={{ mb: 4 }}>
                {Object.entries(savedPhones).map(([phone, data]: [string, any]) => (
                  <Box key={phone} sx={{ mb: 2, p: 2, border: '1px solid #ddd', borderRadius: 1 }}>
                    <Typography variant="subtitle1">📱 {phone}</Typography>
                    <Typography variant="body2" color="textSecondary">📍 {data.address}</Typography>
                    <Button
                      size="small"
                      color="error"
                      onClick={() => handleDeletePhoneAddress(phone)}
                      sx={{ mt: 1 }}
                    >
                      Sil
                    </Button>
                  </Box>
                ))}
              </Box>

              <Typography variant="h6" gutterBottom sx={{ mt: 4 }}>
                Kurye Ücretleri
              </Typography>
              <TextField
                label="Ürün Başına Ek Ücret"
                type="number"
                defaultValue="15"
                sx={{ mb: 2 }}
                fullWidth
              />
              <TextField
                label="İçecek Başına Ek Ücret"
                type="number"
                defaultValue="5"
                sx={{ mb: 2 }}
                fullWidth
              />

              <Typography variant="h6" gutterBottom sx={{ mt: 4 }}>
                Yazıcı Ayarları
              </Typography>
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Yazıcı Seçimi</InputLabel>
                <Select label="Yazıcı Seçimi" defaultValue="">
                  <MenuItem value="default">Varsayılan Yazıcı</MenuItem>
                  <MenuItem value="printer1">Yazıcı 1</MenuItem>
                  <MenuItem value="printer2">Yazıcı 2</MenuItem>
                </Select>
              </FormControl>

              <Typography variant="h6" gutterBottom sx={{ mt: 4 }}>
                Gün Sonu İşlemleri
              </Typography>
              <Button
                variant="contained"
                color="error"
                fullWidth
                sx={{ mb: 2 }}
              >
                Gün Sonu Sıfırlama
              </Button>

              <Button
                variant="contained"
                color="primary"
                fullWidth
                sx={{ mt: 4 }}
              >
                Ayarları Kaydet
              </Button>
            </Box>
          </TabPanel>
        </Paper>

        <Dialog
          open={deleteDialogOpen}
          onClose={() => setDeleteDialogOpen(false)}
        >
          <DialogTitle>Ürün Satışlarını Sil</DialogTitle>
          <DialogContent>
            <Typography>
              {selectedProduct?.name} ürününün tüm satışlarını silmek istediğinizden emin misiniz?
              Bu işlem geri alınamaz.
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDeleteDialogOpen(false)}>İptal</Button>
            <Button onClick={confirmDeleteProduct} color="error">
              Sil
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </Box>
  );
};

export default AdminPanel; 