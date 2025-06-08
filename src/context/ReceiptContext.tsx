import React, { createContext, useContext, useState, useEffect } from 'react';

interface ReceiptContextType {
  currentReceiptNumber: number;
  incrementReceiptNumber: () => void;
  resetReceiptNumber: () => void;
}

const ReceiptContext = createContext<ReceiptContextType | undefined>(undefined);

export const ReceiptProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentReceiptNumber, setCurrentReceiptNumber] = useState(() => {
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
      setCurrentReceiptNumber(1);
      localStorage.setItem('receiptDate', today);
    }
    localStorage.setItem('receiptNumber', currentReceiptNumber.toString());
  }, [currentReceiptNumber]);

  const incrementReceiptNumber = () => {
    setCurrentReceiptNumber(prev => prev + 1);
  };

  const resetReceiptNumber = () => {
    setCurrentReceiptNumber(1);
  };

  return (
    <ReceiptContext.Provider value={{ currentReceiptNumber, incrementReceiptNumber, resetReceiptNumber }}>
      {children}
    </ReceiptContext.Provider>
  );
};

export const useReceipt = () => {
  const context = useContext(ReceiptContext);
  if (context === undefined) {
    throw new Error('useReceipt must be used within a ReceiptProvider');
  }
  return context;
}; 