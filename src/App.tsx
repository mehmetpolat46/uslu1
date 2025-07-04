import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import WelcomeScreen from './components/WelcomeScreen';
import OrderScreen from './components/OrderScreen';
import AdminPanel from './components/AdminPanel';
import { OrderProvider } from './context/OrderContext';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    error: {
      main: '#d32f2f',
    },
    secondary: {
      main: '#ffa000',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontSize: '2rem',
      fontWeight: 600,
    },
    h2: {
      fontSize: '1.5rem',
      fontWeight: 500,
    },
    h6: {
      fontSize: '1.1rem',
      fontWeight: 500,
    },
    body1: {
      fontSize: '0.9rem',
    },
    body2: {
      fontSize: '0.8rem',
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: '0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          boxShadow: '0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)',
        },
      },
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <OrderProvider>
        <Router>
          <Routes>
            <Route path="/" element={<WelcomeScreen />} />
            <Route path="/order" element={<OrderScreen />} />
            <Route path="/admin" element={<AdminPanel />} />
          </Routes>
        </Router>
      </OrderProvider>
    </ThemeProvider>
  );
}

export default App; 