// In development the Vite proxy forwards /api/* to localhost:4000, making cookies
// same-origin. In production set VITE_API_URL to your backend URL.
const BASE = import.meta.env.VITE_API_URL || '';

// ─── In-memory GET cache (stale-while-revalidate) ────────────────────────────
// Caches responses for GET requests for TTL ms. On a cache hit the stored value
// is returned immediately and a background refresh is queued so the next call
// gets fresh data. This eliminates the cold-start penalty on revisits.
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes
interface CacheEntry { data: unknown; ts: number }
const _cache = new Map<string, CacheEntry>();
const _inflight = new Map<string, Promise<unknown>>();

function cacheGet<T>(key: string, fetcher: () => Promise<T>): Promise<T> {
  const hit = _cache.get(key);
  const now = Date.now();
  if (hit && now - hit.ts < CACHE_TTL) {
    // Return stale data instantly; silently refresh in background
    fetcher().then(data => _cache.set(key, { data, ts: Date.now() })).catch(() => {});
    return Promise.resolve(hit.data as T);
  }
  // Deduplicate in-flight requests for the same key
  if (_inflight.has(key)) return _inflight.get(key) as Promise<T>;
  const promise = fetcher().then(data => {
    _cache.set(key, { data, ts: Date.now() });
    _inflight.delete(key);
    return data;
  }).catch(err => { _inflight.delete(key); throw err; });
  _inflight.set(key, promise);
  return promise;
}

/**
 * Read the CSRF token from the `csrf_token` cookie that the backend sets on
 * login/register. The backend uses the double-submit cookie pattern:
 *   - JWT lives in an httpOnly cookie (JS-invisible, immune to XSS)
 *   - CSRF token lives in a regular cookie (JS-readable, origin-isolated)
 *   - Every state-changing request echoes it as X-CSRF-Token header
 */
function getCsrfToken(): string {
  try {
    const match = document.cookie.split('; ').find((c) => c.startsWith('csrf_token='));
    return match ? decodeURIComponent(match.split('=')[1]) : '';
  } catch {
    return '';
  }
}

const MUTATING = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);

let _isRefreshing = false;

function getFriendlyErrorMessage(error: string): string {
  if (!error) return 'Something went wrong. Please try again.';
  
  const lower = error.toLowerCase();
  
  // Database / Technical Errors
  if (lower.includes('null value') && lower.includes('column "image"')) return 'Image Required: Please upload at least one product photo before saving.';
  if (lower.includes('null value')) return 'Missing Information: Please fill in all required fields (marked with *).';
  if (lower.includes('unique constraint') || lower.includes('already exists')) return 'Duplicate Entry: This SKU or name is already in use. Please try a different one.';
  if (lower.includes('foreign key constraint')) return 'Link Error: We couldn\'t find the category or related data you selected.';
  
  // Auth Errors
  if (lower.includes('invalid login') || lower.includes('incorrect password')) return 'Login Failed: The email or password you entered is incorrect.';
  if (lower.includes('user not found')) return 'Account Not Found: We couldn\'t find an account with that email.';
  if (lower.includes('too short')) return 'Security Notice: Your password is too short. Please use at least 8 characters.';
  if (lower.includes('token expired') || lower.includes('unauthorized')) return 'Session Expired: Please log in again to continue.';

  // Network / Generic
  if (lower.includes('failed to fetch')) return 'Connection Error: We can\'t reach the server. Please check your internet.';
  if (lower.includes('server error') || lower.includes('500')) return 'Server Hiccup: Something went wrong on our end. We\'re looking into it!';

  return error; // Return original if not matched, but it might still be a user-friendly message from backend
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const method = (options.method || 'GET').toUpperCase();
  const isFormData = options.body instanceof FormData;

  const headers: Record<string, string> = {
    ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
    ...(options.headers as Record<string, string>),
  };

  if (MUTATING.has(method)) {
    const csrf = getCsrfToken();
    if (csrf) headers['X-CSRF-Token'] = csrf;
  }

  try {
    const res = await fetch(`${BASE}${path}`, {
      ...options,
      headers,
      credentials: 'include',
    });

    const text = await res.text();
    let data: any = {};
    if (text) {
      try {
        data = JSON.parse(text);
      } catch {
        if (!res.ok) throw new Error(`Server encountered an error (${res.status}).`);
      }
    }

    if (!res.ok) {
      // On 401, attempt a silent token refresh then retry once
      if (res.status === 401 && !_isRefreshing && path !== '/api/auth/refresh') {
        _isRefreshing = true;
        try {
          await fetch(`${BASE}/api/auth/refresh`, { method: 'POST', credentials: 'include' });
        } finally {
          _isRefreshing = false;
        }
        return request<T>(path, options);
      }
      const rawMsg = data.error || data.message || `Request failed (${res.status})`;
      throw new Error(getFriendlyErrorMessage(rawMsg));
    }
    return data as T;
  } catch (err: any) {
    if (err.message === 'Failed to fetch') {
      throw new Error(getFriendlyErrorMessage('failed to fetch'));
    }
    throw err;
  }
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
  verifyEmail: (token: string) =>
    request<{ message: string }>('/api/auth/verify-email', {
      method: 'POST',
      body: JSON.stringify({ token }),
    }),
  forgotPassword: (email: string) =>
    request<{ message: string }>('/api/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    }),
  resetPassword: (token: string, password: string) =>
    request<{ message: string }>('/api/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ token, password }),
    }),
  changePassword: (data: { currentPassword: string; newPassword: string }) =>
    request<{ message: string }>('/api/auth/change-password', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  logout: () =>
    request<{ message: string }>('/api/auth/logout', { method: 'POST' }),

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
    const url = `/api/products${qs}`;
    return cacheGet(url, () => request<{ products: any[]; page: number; limit: number }>(url));
  },
  getProduct: (slug: string) =>
    cacheGet(`/api/products/${slug}`, () => request<any>(`/api/products/${slug}`)),
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
  updateOrderStatus: (id: string, status: string, invoice_url?: string) =>
    request<any>(`/api/orders/${id}/status`, { 
      method: 'PATCH', 
      body: JSON.stringify({ status, invoice_url }) 
    }),

  // Reviews
  getReviews: (productId: string) => request<any[]>(`/api/reviews/product/${productId}`),
  createReview: (data: { product_id: string; rating: number; title?: string; body?: string }) =>
    request<any>('/api/reviews', { method: 'POST', body: JSON.stringify(data) }),
  deleteReview: (id: string) => request<any>(`/api/reviews/${id}`, { method: 'DELETE' }),

  // Jobs
  getJobs: (params?: { status?: string; page?: number; limit?: number }) => {
    const qs = params ? '?' + new URLSearchParams(params as any).toString() : '';
    return request<{ jobs: any[]; pagination: any }>(`/api/jobs${qs}`);
  },
  getJob: (id: string) => request<any>(`/api/jobs/${id}`),
  createJob: (data: any) =>
    request<any>('/api/jobs', { method: 'POST', body: JSON.stringify(data) }),
  updateJob: (id: string, data: any) =>
    request<any>(`/api/jobs/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteJob: (id: string) =>
    request<any>(`/api/jobs/${id}`, { method: 'DELETE' }),
  submitApplication: (jobId: string, data: { name: string; email: string; phone: string; cover_letter?: string; resume_url?: string }) =>
    request<any>(`/api/jobs/${jobId}/apply`, { method: 'POST', body: JSON.stringify(data) }),
  getAllApplications: (params?: { status?: string; page?: number; limit?: number }) => {
    const qs = params ? '?' + new URLSearchParams(params as any).toString() : '';
    return request<{ applications: any[]; pagination: any }>(`/api/jobs/applications${qs}`);
  },
  getJobApplications: (jobId: string) =>
    request<{ applications: any[]; pagination: any }>(`/api/jobs/${jobId}/applications`),
  updateApplicationStatus: (appId: string, status: string) =>
    request<any>(`/api/jobs/applications/${appId}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }),

  // Site Settings
  getSetting: (key: string) => request<any>(`/api/settings/${key}`),
  updateSetting: (key: string, value: object) =>
    request<any>(`/api/settings/${key}`, { method: 'PUT', body: JSON.stringify(value) }),

  // Payments (Razorpay)
  createPaymentOrder: (amount: number, receipt: string) =>
    request<any>('/api/payments/create-order', {
      method: 'POST',
      body: JSON.stringify({ amount, receipt }),
    }),
  verifyPayment: (data: { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string }) =>
    request<any>('/api/payments/verify', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
};
