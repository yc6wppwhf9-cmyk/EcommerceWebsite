export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: 'customer' | 'admin';
  is_verified: boolean;
  verification_token?: string;
  reset_token?: string;
  reset_token_expires?: string;
  created_at: string;
}

export interface Product {
  id: string;
  sku: string;
  slug: string;
  name: string;
  description?: string;
  price: number;
  original_price: number;
  category_id: string;
  image: string;
  images: string[];
  features: string[];
  specifications: Record<string, string>;
  rating: number;
  review_count: number;
  stock: number;
  is_new: boolean;
  is_highlighted: boolean;
  is_active: boolean;
  amazon_url?: string;
  created_at: string;
  updated_at: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
}

export interface Order {
  id: string;
  user_id: string;
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'return_requested' | 'returned';
  subtotal: number;
  shipping_fee: number;
  total: number;
  shipping_name: string;
  shipping_phone: string;
  shipping_line1: string;
  shipping_line2?: string;
  shipping_city: string;
  shipping_state: string;
  shipping_pincode: string;
  payment_method: 'cod' | 'online';
  payment_id?: string;
  payment_status: 'pending' | 'paid' | 'failed' | 'refunded';
  notes?: string;
  invoice_url?: string;
  created_at: string;
  updated_at: string;
  order_items?: OrderItem[];
}

export interface Review {
  id: string;
  product_id: string;
  user_id: string;
  rating: number;
  title?: string;
  body?: string;
  is_verified: boolean;
  created_at: string;
  user?: Partial<User>;
}
