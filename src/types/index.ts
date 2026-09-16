export interface Profile {
  id: string;
  full_name: string | null;
  phone: string | null;
  is_admin: boolean;
  created_at: string;
}

export interface MenuItem {
  id: string;
  name: string;
  description: string | null;
  price: number;
  category: string;
  image_url: string | null;
  is_available: boolean;
  is_veg: boolean;
  spice_level: string;
  created_at: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  menu_item_id: string | null;
  name: string;
  price: number;
  quantity: number;
}

export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'preparing'
  | 'ready'
  | 'delivered'
  | 'cancelled';

export type PaymentStatus = 'pending' | 'paid' | 'failed';

export interface Order {
  id: string;
  user_id: string;
  total_amount: number;
  status: OrderStatus;
  payment_method: string;
  payment_status: PaymentStatus;
  notes: string | null;
  delivery_address: string | null;
  created_at: string;
  updated_at: string;
  order_items?: OrderItem[];
}

export interface CartItem {
  menu_item: MenuItem;
  quantity: number;
}
