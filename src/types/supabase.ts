
export type User = {
  id: string;
  email: string;
  is_admin?: boolean;
}

export type Profile = {
  id: string;
  email: string;
  role?: string;
  is_admin?: boolean;
  updated_at?: string;
  created_at?: string;
}

export type Category = {
  id: string;
  name: string;
  description?: string;
  created_at?: string;
  updated_at?: string;
}

export type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';

export type Order = {
  id: string;
  user_id: string;
  created_at?: string;
  updated_at?: string;
  total_amount: number;
  status: OrderStatus;
  payment_intent_id?: string;
  shipping_address: {
    name: string;
    street: string;
    city: string;
    state: string;
    zip: string;
    country: string;
  };
}

export type OrderItem = {
  id: string;
  order_id: string;
  product_id: string;
  quantity: number;
  unit_price: number;
  created_at?: string;
}

export type Review = {
  id: string;
  product_id: string;
  user_id: string;
  rating: number;
  comment?: string;
  created_at?: string;
}
