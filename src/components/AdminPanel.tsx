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
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

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
  const [resetDialogOpen, setResetDialogOpen] = useState(false);
  const [analysisCategory, setAnalysisCategory] = useState('all');
  const [analysisProductName, setAnalysisProductName] = useState('');

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

  // Siparişleri seçilen tarih aralığına göre filtrele
  const startOfDay = startDate ? new Date(startDate) : null;
  if (startOfDay) startOfDay.setHours(0,0,0,0);
  const endOfDay = endDate ? new Date(endDate) : null;
  if (endOfDay) endOfDay.setHours(23,59,59,999);
  const filteredOrders = orders.filter(order => {
    const orderDate = new Date(order.date);
    if (startOfDay && orderDate < startOfDay) return false;
    if (endOfDay && orderDate > endOfDay) return false;
    return true;
  });

  // Siparişleri tarihe göre grupla (filtrelenmiş)
  const groupedOrders = filteredOrders.reduce((acc, order) => {
    const date = new Date(order.date).toLocaleDateString('tr-TR');
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(order);
    return acc;
  }, {} as { [key: string]: typeof filteredOrders });

  // Günlük toplam satışları hesapla (filtrelenmiş)
  const dailySales = Object.entries(groupedOrders).map(([date, orders]) => ({
    date,
    totalSales: orders.reduce((sum, order) => sum + order.total, 0),
    orderCount: orders.length,
    deliveryCount: orders.filter(order => order.type === 'delivery').length,
  }));

  // Ürün bazlı satışları hesapla (filtrelenmiş)
  const productSales = filteredOrders.reduce((acc, order) => {
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

  // stats fonksiyonunu da filtrelenmiş siparişlerle oluştur
  const filteredStats = (() => {
    const stats = {
      totalSales: 0,
      totalOrders: filteredOrders.length,
      totalDeliveryOrders: 0,
      productStats: {} as {
        [key: string]: {
          quantity: number;
          total: number;
          category: string;
        };
      },
    };
    filteredOrders.forEach((order) => {
      stats.totalSales += order.total;
      if (order.type === 'delivery') {
        stats.totalDeliveryOrders++;
      }
      order.items.forEach((item) => {
        if (!stats.productStats[item.name]) {
          stats.productStats[item.name] = {
            quantity: 0,
            total: 0,
            category: item.category,
          };
        }
        stats.productStats[item.name].quantity += item.quantity;
        stats.productStats[item.name].total += item.price * item.quantity;
      });
    });
    return stats;
  })();

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

  // Gün sonu sıfırlama işlemi
  const handleDayReset = () => {
    if (!startDate) return;
    const startOfDay = new Date(startDate);
    startOfDay.setHours(0,0,0,0);
    const endOfDay = new Date(startDate);
    endOfDay.setHours(23,59,59,999);
    orders.forEach(order => {
      const orderDate = new Date(order.date);
      if (orderDate >= startOfDay && orderDate <= endOfDay) {
        deleteOrder(order.id);
      }
    });
    setResetDialogOpen(false);
  };

  const analysisChartData = React.useMemo(() => {
    // Tüm siparişlerden ürünleri topla, içeri ve kurye ayrı say
    const stats: { [key: string]: { name: string; dineInQuantity: number; deliveryQuantity: number } } = {};
    filteredOrders.forEach(order => {
      order.items.forEach(item => {
        // Kategori filtresi
        if (analysisCategory === 'Et' && !item.name.toLowerCase().includes('et')) return;
        if (analysisCategory === 'Tavuk' && !item.name.toLowerCase().includes('tavuk')) return;
        // Ürün ismi filtresi
        if (analysisProductName && !item.name.toLowerCase().includes(analysisProductName.toLowerCase())) return;
        if (!stats[item.name]) {
          stats[item.name] = { name: item.name, dineInQuantity: 0, deliveryQuantity: 0 };
        }
        if (order.type === 'dine-in') {
          stats[item.name].dineInQuantity += item.quantity;
        } else if (order.type === 'delivery') {
          stats[item.name].deliveryQuantity += item.quantity;
        }
      });
    });
    return Object.values(stats);
  }, [filteredOrders, analysisCategory, analysisProductName]);

  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.setFont('courier', 'normal');
    doc.text('Uslu Döner Satış Raporu', 14, 16);
    const tableColumn = ['Ürün Adı', 'Kategori', 'Adet', 'Toplam Tutar (₺)'];
    const tableRows = Object.entries(filteredStats.productStats).map(([name, data]) => [
      name,
      data.category,
      data.quantity,
      data.total
    ]);
    // Toplam satırı
    tableRows.push([
      'Toplam',
      '',
      Object.values(filteredStats.productStats).reduce((sum, data) => sum + data.quantity, 0),
      filteredStats.totalSales
    ]);
    // Ekmek satırı
    tableRows.push([
      'Toplam Ekmek',
      '',
      Object.entries(filteredStats.productStats).reduce((sum, [name, data]) => {
        if (
          data.category === 'İçecekler & Atıştırmalık' ||
          data.category === 'Takolar' ||
          name.toLowerCase().includes('tako')
        ) return sum;
        let ekmek = 1;
        if (name.toLowerCase().includes('maksi')) ekmek = 2;
        return sum + ekmek * data.quantity;
      }, 0),
      ''
    ]);
    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 22,
      styles: { font: 'courier', fontStyle: 'normal', fontSize: 11 },
    });
    doc.save('uslu_doner_satis_raporu.pdf');
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
            <Tab label="Analiz" />
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
              <Button
                variant="contained"
                color="secondary"
                onClick={exportToPDF}
              >
                PDF'ye Aktar
              </Button>
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
                  {Object.entries(filteredStats.productStats).map(([name, data]) => (
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
                        {Object.values(filteredStats.productStats).reduce((sum, data) => sum + data.quantity, 0)}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="h6">{filteredStats.totalSales}₺</Typography>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell colSpan={4} align="right">
                      <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                        Toplam Ekmek: {
                          Object.entries(filteredStats.productStats).reduce((sum, [name, data]) => {
                            if (
                              data.category === 'İçecekler & Atıştırmalık' ||
                              data.category === 'Takolar' ||
                              name.toLowerCase().includes('tako')
                            ) return sum;
                            let ekmek = 1;
                            if (name.toLowerCase().includes('maksi')) ekmek = 2;
                            return sum + ekmek * data.quantity;
                          }, 0)
                        }
                      </Typography>
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
            {/* Sipariş Geçmişi için Tarih Filtresi */}
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
            {/* Analiz Sekmesi */}
            <Box sx={{ mb: 3, display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
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
              <FormControl sx={{ minWidth: 160 }}>
                <InputLabel>Kategori</InputLabel>
                <Select
                  value={analysisCategory || 'all'}
                  label="Kategori"
                  onChange={e => setAnalysisCategory(e.target.value)}
                >
                  <MenuItem value="all">Tümü</MenuItem>
                  <MenuItem value="Et">Et</MenuItem>
                  <MenuItem value="Tavuk">Tavuk</MenuItem>
                </Select>
              </FormControl>
              <TextField
                label="Ürün İsmi Ara"
                value={analysisProductName}
                onChange={e => setAnalysisProductName(e.target.value)}
                sx={{ minWidth: 200 }}
              />
            </Box>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={analysisChartData} margin={{ top: 16, right: 32, left: 16, bottom: 16 }}>
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="dineInQuantity" fill="#e53935" name="İçeri Satış" />
                <Bar dataKey="deliveryQuantity" fill="#1976d2" name="Kurye Satış" />
              </BarChart>
            </ResponsiveContainer>
          </TabPanel>

          <TabPanel value={tabValue} index={4}>
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
                onClick={() => setResetDialogOpen(true)}
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

        <Dialog
          open={resetDialogOpen}
          onClose={() => setResetDialogOpen(false)}
        >
          <DialogTitle>Gün Sonu Sıfırlama</DialogTitle>
          <DialogContent>
            <Typography>Bu işlemde seçili gündeki tüm siparişler silinecek. Emin misiniz?</Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setResetDialogOpen(false)}>İptal</Button>
            <Button onClick={handleDayReset} color="error">Evet, Sıfırla</Button>
          </DialogActions>
        </Dialog>
      </Container>
    </Box>
  );
};

export default AdminPanel; 