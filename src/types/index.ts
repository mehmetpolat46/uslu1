export interface CartItem {
  id: string | number;
  name: string;
  price: number;
  quantity: number;
  category: string;
}

export interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  category: string;
}

export interface Order {
  id: string;
  date: Date;
  type: 'dine-in' | 'delivery';
  items: OrderItem[];
  total: number;
  phone?: string;
  address?: string;
  paymentType?: 'cash' | 'card';
} 