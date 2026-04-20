export interface ProductVariant {
  color: string;
  colorCode: string;
  images: string[];
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  price: number;
  originalPrice: number;
  discount: string;
  rating: number;
  reviews: number;
  image: string;
  images?: string[];
  variants?: ProductVariant[];
  statusLabel?: string;
  isNew: boolean;
  highlighted: boolean;
  category: string;
  subcategory?: string;
  description: string;
  features: string[];
  specifications: Record<string, string>;
  stock: number;
  sku: string;
  createdAt: string;
  isPremium?: boolean;
  size?: string;
  gender?: 'men' | 'women' | 'kids' | 'unisex';
  ageRange?: string;
}

export interface CategoryInfo {
  id: string;
  title: string;
  subtitle: string;
  slug: string;
  image: string;
  bgColor: string;
  description: string;
  parentCategory?: string;
}

// ─── Cart Types ────────────────────────────────────────────────
export interface CartItem {
  product: Product;
  quantity: number;
}

export interface Cart {
  items: CartItem[];
  total: number;
  itemCount: number;
}

// ─── User & Auth Types ────────────────────────────────────────
export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  addresses: Address[];
  createdAt: string;
  role: 'user' | 'admin';
}

export interface Address {
  id: string;
  label: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  pincode: string;
  phone: string;
  isDefault: boolean;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

// ─── Order Types ──────────────────────────────────────────────
export interface Order {
  id: string;
  userId: string;
  items: OrderItem[];
  total: number;
  status: OrderStatus;
  shippingAddress: Address;
  paymentMethod: string;
  paymentId?: string;
  notes?: string;
  invoice_url?: string;
  createdAt: string;
  updatedAt: string;
}

export interface OrderItem {
  productId: string;
  productName: string;
  price: number;
  quantity: number;
  image: string;
}

export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'processing'
  | 'shipped'
  | 'delivered'
  | 'cancelled'
  | 'returned';

// ─── Search & Filter Types ────────────────────────────────────
export interface SearchFilters {
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  rating?: number;
  sortBy?: 'price-asc' | 'price-desc' | 'rating' | 'newest' | 'popular';
  query?: string;
}

// ─── Jobs & Applications ──────────────────────────────────────
export interface Job {
  id: string;
  title: string;
  description: string;
  location: string;
  department?: string;
  job_type: 'full-time' | 'part-time' | 'contract' | 'internship';
  salary_min?: number;
  salary_max?: number;
  requirements?: string;
  status: 'open' | 'closed' | 'draft';
  posted_by?: string;
  created_at: string;
  updated_at: string;
}

export interface Application {
  id: string;
  job_id: string;
  applicant_name: string;
  applicant_email: string;
  applicant_phone?: string;
  cover_letter?: string;
  resume_url?: string;
  status: 'pending' | 'shortlisted' | 'rejected' | 'hired';
  applied_at: string;
  updated_at: string;
  jobs?: { id: string; title: string; location: string; job_type: string };
}

// ─── Toast / Notification Types ───────────────────────────────
export interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
  duration?: number;
}
