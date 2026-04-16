const BASE = import.meta.env.VITE_API_URL || 'http://localhost:4000';

function getToken(): string | null {
  try {
    const raw = localStorage.getItem('priority-bags-token');
    return raw || null;
  } catch {
    return null;
  }
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const isFormData = options.body instanceof FormData;
  const headers: Record<string, string> = {
    ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
    ...(options.headers as Record<string, string>),
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${BASE}${path}`, { ...options, headers });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Request failed');
  return data as T;
}

export const api = {
  // Auth
  login: (email: string, password: string) =>
    request<{ user: any; token: string }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  register: (name: string, email: string, password: string, phone?: string) =>
    request<{ user: any; token: string }>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password, phone }),
    }),

  // User
  getMe: () => request<any>('/api/users/me'),
  updateMe: (data: { name?: string; phone?: string }) =>
    request<any>('/api/users/me', { method: 'PUT', body: JSON.stringify(data) }),

  // Addresses
  getAddresses: () => request<any[]>('/api/users/me/addresses'),
  addAddress: (data: any) =>
    request<any>('/api/users/me/addresses', { method: 'POST', body: JSON.stringify(data) }),
  deleteAddress: (id: string) =>
    request<any>(`/api/users/me/addresses/${id}`, { method: 'DELETE' }),

  // Products
  getProducts: (params?: Record<string, string>) => {
    const qs = params ? '?' + new URLSearchParams(params).toString() : '';
    // Backend returns { products, page, limit }
    return request<{ products: any[]; page: number; limit: number }>(`/api/products${qs}`);
  },
  getProduct: (slug: string) => request<any>(`/api/products/${slug}`),
  createProduct: (data: any) =>
    request<any>('/api/products', { method: 'POST', body: JSON.stringify(data) }),
  updateProduct: (id: string, data: any) =>
    request<any>(`/api/products/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteProduct: (id: string) =>
    request<any>(`/api/products/${id}`, { method: 'DELETE' }),

  uploadImage: (formData: FormData) =>
    request<{ url: string }>('/api/products/upload-image', {
      method: 'POST',
      body: formData,
      headers: {}, // Let browser set multipart/form-data with boundary
    }),
  bulkUpload: (formData: FormData) =>
    request<{ success: boolean; count: number }>('/api/products/bulk-upload', {
      method: 'POST',
      body: formData,
      headers: {},
    }),

  // Orders
  getOrders: (params?: { page?: number; limit?: number }) => {
    const qs = params ? '?' + new URLSearchParams(params as any).toString() : '';
    return request<{ data: any[]; pagination: any }>(`/api/orders${qs}`);
  },
  getOrder: (id: string) => request<any>(`/api/orders/${id}`),
  createOrder: (data: any) =>
    request<any>('/api/orders', { method: 'POST', body: JSON.stringify(data) }),
  updateOrderStatus: (id: string, status: string) =>
    request<any>(`/api/orders/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }),

  // Reviews
  getReviews: (productId: string) => request<any[]>(`/api/reviews/product/${productId}`),
  createReview: (data: { product_id: string; rating: number; title?: string; body?: string }) =>
    request<any>('/api/reviews', { method: 'POST', body: JSON.stringify(data) }),
  deleteReview: (id: string) => request<any>(`/api/reviews/${id}`, { method: 'DELETE' }),
};
