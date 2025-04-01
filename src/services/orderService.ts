
import { supabase } from '@/integrations/supabase/client';

export interface Order {
  id: string;
  user_id: string;
  status: string;
  total_amount: number;
  shipping_address: any;
  payment_intent_id: string | null;
  created_at: string;
  updated_at: string | null;
  items?: OrderItem[];
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  quantity: number;
  unit_price: number;
  created_at: string | null;
  product?: {
    name: string;
    images: string[];
  };
}

export const fetchOrders = async () => {
  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .order('created_at', { ascending: false });
  
  if (error) {
    console.error('Error fetching orders:', error);
    throw error;
  }
  
  return data as Order[];
};

export const fetchOrderById = async (id: string) => {
  // First, fetch the order
  const { data: order, error: orderError } = await supabase
    .from('orders')
    .select('*')
    .eq('id', id)
    .single();
  
  if (orderError) {
    console.error('Error fetching order:', orderError);
    throw orderError;
  }
  
  // Then, fetch the order items and join with product names and images
  const { data: items, error: itemsError } = await supabase
    .from('order_items')
    .select(`
      *,
      product:product_id (
        name,
        images
      )
    `)
    .eq('order_id', id);
  
  if (itemsError) {
    console.error('Error fetching order items:', itemsError);
    throw itemsError;
  }
  
  return {
    ...order,
    items: items,
  } as Order;
};

export const updateOrderStatus = async (id: string, status: string) => {
  const { data, error } = await supabase
    .from('orders')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();
  
  if (error) {
    console.error('Error updating order status:', error);
    throw error;
  }
  
  return data as Order;
};
