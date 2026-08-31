export interface Address {
  id?: string;
  user_id?: string;
  name: string;
  phone: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  pincode: string;
  is_default?: boolean;
  created_at?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: 'user' | 'admin';
  is_verified?: boolean;
  addresses?: Address[];
  createdAt?: string;
  created_at?: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface ProductVariant {
  color: string;
  colorCode: string;
  images: string[];
}

export interface Product {
  id: string;
  sku?: string;
  slug?: string;
  name: string;
  description?: string;
  price: number;
  originalPrice?: number;
  original_price?: number;
  category: string;
  category_id?: string;
  categories?: { slug: string; title?: string };
  subcategory?: string;
  sub_category?: string;
  gender?: string;
  ageRange?: string;
  age_range?: string;
  size?: string;
  juniorStyle?: string;
  junior_style?: string;
  image: string;
  images?: string[];
  amazonUrl?: string;
  amazon_url?: string;
  flipkart_url?: string;
  myntra_url?: string;
  ajio_url?: string;
  variants?: ProductVariant[];
  colors?: Array<{ name?: string; color?: string; code?: string; colorCode?: string; images?: string[] }>;
  features?: string[];
  specifications?: Record<string, string>;
  rating?: number;
  reviews?: number;
  review_count?: number;
  stock: number;
  isNew?: boolean;
  is_new?: boolean;
  highlighted?: boolean;
  is_highlighted?: boolean;
  isPremium?: boolean;
  is_premium?: boolean;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

export interface CategoryInfo {
  id: string;
  title: string;
  subtitle: string;
  slug: string;
  image: string;
  bgColor: string;
  description?: string;
  parentCategory?: string;
}

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
  created_at?: string;
  updated_at?: string;
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
  jobs?: { id?: string; title?: string; location?: string; job_type?: string };
  users?: { id?: string; name?: string; email?: string };
}
