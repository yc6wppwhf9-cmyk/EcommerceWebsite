import { z } from 'zod';

export const registerSchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Invalid email format'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    phone: z.string().optional(),
  }),
});

export const loginSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email format'),
    password: z.string().min(1, 'Password is required'),
  }),
});

export const productSchema = z.object({
  body: z.object({
    name: z.string().min(1, 'Name is required'),
    price: z.number().nonnegative(),
    originalPrice: z.number().nonnegative().optional(),
    original_price: z.number().nonnegative().optional(),
    stock: z.number().int().nonnegative(),
    category_id: z.string().optional(),
    sub_category: z.string().optional(),
    description: z.string().optional(),
    sku: z.string().optional(),
    slug: z.string().optional(),
    images: z.array(z.any()).optional(),
    colors: z.array(z.any()).optional(),
    features: z.array(z.any()).optional(),
    isNew: z.boolean().optional(),
    highlighted: z.boolean().optional(),
    isPremium: z.boolean().optional(),
    gender: z.string().optional(),
    ageRange: z.string().optional(),
    size: z.string().optional(),
  }).passthrough(),
});

export const orderSchema = z.object({
  body: z.object({
    items: z.array(z.object({
      product_id: z.string().uuid(),
      quantity: z.number().int().positive(),
    })).min(1),
    shipping_name: z.string().min(2),
    shipping_phone: z.string().min(10),
    shipping_line1: z.string().min(5),
    shipping_city: z.string().min(2),
    shipping_state: z.string().min(2),
    shipping_pincode: z.string().length(6),
    payment_method: z.enum(['cod', 'online']).default('cod'),
    // COD orders don't send payment fields; online orders must send all three
    payment_id: z.string().optional(),
    razorpay_order_id: z.string().optional(),
    razorpay_payment_id: z.string().optional(),
    razorpay_signature: z.string().optional(),
    notes: z.string().optional(),
  }),
});
export const reviewSchema = z.object({
  body: z.object({
    product_id: z.string().uuid(),
    rating: z.number().int().min(1).max(5),
    title: z.string().min(2).optional(),
    body: z.string().min(5).optional(),
  }),
});

export const forgotPasswordSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email format'),
  }),
});

export const resetPasswordSchema = z.object({
  body: z.object({
    token: z.string().min(1, 'Token is required'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
  }),
});

export const jobSchema = z.object({
  body: z.object({
    title: z.string().min(3, 'Title is required'),
    description: z.string().min(10, 'Description is required'),
    location: z.string().min(2, 'Location is required'),
    department: z.string().optional(),
    job_type: z.enum(['full-time', 'part-time', 'contract', 'internship']),
    salary_min: z.number().nonnegative().optional(),
    salary_max: z.number().nonnegative().optional(),
    requirements: z.string().optional(),
    status: z.enum(['open', 'closed', 'draft']).optional(),
  }).passthrough(),
});

export const applicationSchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Name is required'),
    email: z.string().email('Valid email is required'),
    phone: z.string().min(7, 'Phone is required'),
    cover_letter: z.string().optional(),
    resume_url: z.string().optional(),
  }),
});
