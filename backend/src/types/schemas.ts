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
    name: z.string().min(2),
    price: z.number().positive(),
    original_price: z.number().positive(),
    stock: z.number().int().nonnegative(),
    category_id: z.string().uuid().optional(),
    description: z.string().optional(),
    sku: z.string().min(3),
  }),
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
