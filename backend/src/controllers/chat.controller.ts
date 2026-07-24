import { Request, Response } from 'express';
import Anthropic from '@anthropic-ai/sdk';
import jwt from 'jsonwebtoken';
import { supabase } from '../config/supabase';
import { config } from '../config/env';

const anthropic = new Anthropic({ apiKey: config.ANTHROPIC_API_KEY });

function getUserFromRequest(req: Request): { id: string; email: string; role: string } | null {
  try {
    const token = (req as any).cookies?.access_token;
    if (!token) return null;
    return jwt.verify(token, config.JWT_SECRET) as any;
  } catch {
    return null;
  }
}

// ─── Tool Implementations ────────────────────────────────────────────────────

const searchProducts = async (params: {
  category?: string;
  sub_category?: string;
  isPremium?: boolean;
  sort?: string;
  search?: string;
  limit?: number;
}) => {
  let query = supabase
    .from('products')
    .select('id, name, price, original_price, image, slug, rating, sub_category, is_premium, categories(slug, title)')
    .eq('is_active', true);

  if (params.category) {
    const { data: cat } = await supabase.from('categories').select('id').eq('slug', params.category).maybeSingle();
    if (cat) {
      query = query.or(`category_id.eq.${cat.id},sub_category.eq.${params.category}`);
    } else {
      query = query.eq('sub_category', params.category);
    }
  }
  if (params.sub_category) query = query.eq('sub_category', params.sub_category);
  if (params.isPremium) query = query.eq('is_premium', true);
  if (params.search) {
    const escaped = params.search.replace(/[%_\\]/g, '\\$&');
    query = query.ilike('name', `%${escaped}%`);
  }

  const sortMap: Record<string, { column: string; ascending: boolean }> = {
    rating: { column: 'rating', ascending: false },
    newest: { column: 'created_at', ascending: false },
    'price-asc': { column: 'price', ascending: true },
    'price-desc': { column: 'price', ascending: false },
  };
  const s = sortMap[params.sort || 'rating'] || { column: 'rating', ascending: false };
  query = query.order(s.column, { ascending: s.ascending }).limit(Math.min(params.limit || 4, 6));

  const { data, error } = await query;
  if (error) return [];
  return data || [];
};

const getNewArrivals = async (limit = 4) => {
  const { data, error } = await supabase
    .from('products')
    .select('id, name, price, original_price, image, slug, rating, categories(slug, title)')
    .eq('is_active', true)
    .order('created_at', { ascending: false })
    .limit(Math.min(limit, 6));
  if (error) return [];
  return data || [];
};

const getUserOrders = async (userId: string, limit = 5) => {
  const { data, error } = await supabase
    .from('orders')
    .select('id, status, total, created_at, payment_method, shipping_city, order_items(name, price, quantity, image)')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(Math.min(limit, 10));
  if (error) return [];
  return (data || []).map((o: any) => ({
    id: o.id,
    shortId: '#' + o.id.slice(0, 8).toUpperCase(),
    status: o.status,
    total: o.total,
    date: new Date(o.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
    paymentMethod: o.payment_method === 'cod' ? 'Cash on Delivery' : 'Online Payment',
    city: o.shipping_city,
    items: (o.order_items || []).map((i: any) => ({ name: i.name, price: i.price, quantity: i.quantity, image: i.image })),
  }));
};

const getOrderStatus = async (userId: string, orderId: string) => {
  // Strip # prefix if user typed it
  const cleanId = orderId.replace(/^#/, '').toLowerCase();
  const { data, error } = await supabase
    .from('orders')
    .select('id, status, total, created_at, payment_method, payment_status, shipping_city, shipping_state, order_items(name, price, quantity, image)')
    .eq('user_id', userId)
    .ilike('id', `${cleanId}%`)
    .limit(1)
    .maybeSingle();
  if (error || !data) return null;
  return {
    id: data.id,
    shortId: '#' + data.id.slice(0, 8).toUpperCase(),
    status: data.status,
    paymentStatus: data.payment_status,
    total: data.total,
    date: new Date(data.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
    city: `${data.shipping_city}, ${data.shipping_state}`,
    paymentMethod: data.payment_method === 'cod' ? 'Cash on Delivery' : 'Online Payment',
    items: (data.order_items || []).map((i: any) => ({ name: i.name, price: i.price, quantity: i.quantity, image: i.image })),
  };
};

const getUserWishlist = async (userId: string) => {
  const { data, error } = await supabase
    .from('wishlists')
    .select('products(id, name, price, original_price, image, slug, rating)')
    .eq('user_id', userId)
    .limit(6);
  if (error) return [];
  return (data || []).map((w: any) => w.products).filter(Boolean);
};

// ─── Tools Schema ────────────────────────────────────────────────────────────

const tools: Anthropic.Tool[] = [
  {
    name: 'search_products',
    description: 'Search products from the Priority Bags catalog. Use for product recommendations, finding bags by type, price, or keyword.',
    input_schema: {
      type: 'object' as const,
      properties: {
        category: { type: 'string', description: 'Category slug: school-backpacks, college-backpacks, laptop-bags, travel-bags, luggage, duffle, backpacks, pouches, lunch-bags, trolley-backpacks, combo-set' },
        search: { type: 'string', description: 'Keyword to search in product names' },
        isPremium: { type: 'boolean', description: 'Set true to search only premium/luxury products' },
        sort: { type: 'string', enum: ['rating', 'newest', 'price-asc', 'price-desc'] },
        limit: { type: 'number', description: 'Number of results to return (max 6)' },
      },
    },
  },
  {
    name: 'get_new_arrivals',
    description: 'Fetch the latest/newest products added to the store. Use when user asks about new launches, latest arrivals, what is new, or newly added products.',
    input_schema: {
      type: 'object' as const,
      properties: {
        limit: { type: 'number', description: 'How many new products to show (max 6, default 4)' },
      },
    },
  },
  {
    name: 'get_my_orders',
    description: 'Fetch the logged-in user\'s order history. Use when user asks "my orders", "recent orders", "what did I buy", "show my purchases", "order history".',
    input_schema: {
      type: 'object' as const,
      properties: {
        limit: { type: 'number', description: 'Number of recent orders to show (max 10, default 5)' },
      },
    },
  },
  {
    name: 'get_order_status',
    description: 'Get the status and details of a specific order. Use when user asks about a specific order or provides an order ID.',
    input_schema: {
      type: 'object' as const,
      properties: {
        orderId: { type: 'string', description: 'Order ID or the first few characters of the order ID (e.g. "ABC12345")' },
      },
      required: ['orderId'],
    },
  },
  {
    name: 'get_wishlist',
    description: 'Fetch the logged-in user\'s saved/wishlist items. Use when user asks "my wishlist", "saved items", "products I liked", "favourites".',
    input_schema: {
      type: 'object' as const,
      properties: {},
    },
  },
];

// ─── System Prompt ───────────────────────────────────────────────────────────

const SYSTEM_PROMPT = `You are Priya, a friendly and knowledgeable shopping assistant for Priority Bags (prioritybags.in), a trusted Indian bag and luggage brand. You speak like a warm, helpful Indian customer service representative — concise, professional, and caring.

## WHAT YOU CAN DO
- Recommend products and search the catalog
- Show new launches and latest arrivals
- Show a logged-in user's order history and order status
- Show a logged-in user's wishlist
- Answer any question about shopping, policies, shipping, returns, payments

## PRIORITY BAGS — COMPLETE INFORMATION

**Shipping:**
- FREE delivery on orders above ₹1,499
- ₹99 delivery fee on orders below ₹1,499
- Estimated delivery in 2–12 business days across India, depending on destination
- Express delivery not currently available

**Returns & Exchanges:**
- 7-day easy returns from the date of delivery
- Item must be unused, unwashed, with original tags and packaging intact
- How to return: Email info@prioritybags.in or use the website contact form
- Eligible refunds are initiated after the returned item is received and inspected
- Exchange availability depends on the product and current stock; support will confirm the options

**Payment Methods:**
- UPI (GPay, PhonePe, Paytm, BHIM)
- Credit & Debit Cards (Visa, Mastercard, RuPay)
- Net Banking (all major banks)
- Cash on Delivery (COD) — available across most pincodes
- EMI, when shown at checkout, is subject to the issuing bank's eligibility and terms
- Online payments are processed by Razorpay

**Order Cancellation:**
- Contact support immediately to request cancellation before dispatch
- Once an order is dispatched, cancellation may no longer be possible; eligible items can use the return process after delivery
- Approved refunds are sent to the original payment method; bank processing time varies

**Warranty:**
- 12-month manufacturing warranty on all products
- Covers: zipper failures, stitching defects, broken handles, buckle issues
- Not covered: physical damage from misuse, cuts, water damage, normal wear and tear
- Claim warranty: Use the warranty form on the website to receive a trackable reference number

**Tracking:**
- Once shipped, available tracking details are sent to the customer
- You can also check status in your account under "My Orders"

**Contact & Support:**
- Email: info@prioritybags.in
- Support ticket tracking: Available on the website

**About Priority Bags:**
- Made-in-India brand focused on affordable, quality bags and luggage
- Products for Men, Women, Kids (ages 3–15)
- Premium collection available for luxury buyers

## PRODUCT CATEGORIES
- school-backpacks → Kids school bags (age 3–12), colourful designs
- college-backpacks → College/university bags, stylish and spacious
- laptop-bags → With padded laptop compartment (13", 15.6", 17")
- travel-bags → Weekend duffels and cabin bags
- luggage → Hard/soft shell trolley suitcases
- duffle → Sports duffel, gym bags
- backpacks → Casual everyday backpacks
- pouches → Small accessories, travel pouches, pencil cases
- lunch-bags → Kids tiffin / lunch bags
- trolley-backpacks → Kids rolling school bags on wheels
- combo-set → Bundle deals (bag + pouch, etc.)

## RULES
1. ALWAYS call search_products before recommending any product — never make up product names or prices
2. For "new arrivals" / "latest" / "new launch" → call get_new_arrivals
3. For "my orders" / "order history" / "what did I buy" → call get_my_orders
4. For "order status" + an order ID → call get_order_status
5. For "my wishlist" / "saved items" → call get_wishlist
6. If user asks about orders/wishlist and is NOT logged in → tell them to log in from the top-right corner
7. Keep text responses SHORT — 1–2 sentences max introducing the products. NEVER list products in a table or bullet list — they are shown as clickable cards automatically. Just say something like "Here are some great options for you:" and stop.
8. Use ₹ for all prices. Never fabricate product details
9. For policy questions — answer directly from the information above, no tool needed
10. If unsure about anything → direct them to info@prioritybags.in`;

// ─── Handler ─────────────────────────────────────────────────────────────────

export const chat = async (req: Request, res: Response) => {
  const { messages } = req.body as { messages: Anthropic.MessageParam[] };

  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: 'messages array is required' });
  }

  if (!config.ANTHROPIC_API_KEY) {
    return res.status(503).json({ error: 'Chat service not configured' });
  }

  const user = getUserFromRequest(req);

  try {
    let currentMessages = [...messages];
    let response = await anthropic.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 1024,
      system: SYSTEM_PROMPT,
      tools,
      messages: currentMessages,
    });

    const MAX_TURNS = 5;
    let turns = 0;
    let products: any[] = [];
    let orders: any[] = [];

    while (response.stop_reason === 'tool_use' && turns < MAX_TURNS) {
      turns++;
      const toolUseBlocks = response.content.filter((b): b is Anthropic.ToolUseBlock => b.type === 'tool_use');
      const toolResults: Anthropic.ToolResultBlockParam[] = [];

      for (const block of toolUseBlocks) {
        const input = block.input as any;
        let result: any;

        switch (block.name) {
          case 'search_products': {
            if (input.limit) input.limit = Math.min(input.limit, 6);
            const found = await searchProducts(input);
            products = found;
            result = found;
            break;
          }
          case 'get_new_arrivals': {
            const found = await getNewArrivals(input.limit);
            products = found;
            result = found;
            break;
          }
          case 'get_my_orders': {
            if (!user) {
              result = { error: 'NOT_LOGGED_IN' };
            } else {
              const found = await getUserOrders(user.id, input.limit);
              orders = found;
              result = found;
            }
            break;
          }
          case 'get_order_status': {
            if (!user) {
              result = { error: 'NOT_LOGGED_IN' };
            } else {
              const found = await getOrderStatus(user.id, input.orderId);
              if (found) orders = [found];
              result = found ?? { error: 'ORDER_NOT_FOUND' };
            }
            break;
          }
          case 'get_wishlist': {
            if (!user) {
              result = { error: 'NOT_LOGGED_IN' };
            } else {
              const found = await getUserWishlist(user.id);
              // Wishlist items are shown as product cards
              products = found;
              result = found;
            }
            break;
          }
          default:
            result = { error: 'Unknown tool' };
        }

        toolResults.push({
          type: 'tool_result',
          tool_use_id: block.id,
          content: JSON.stringify(result),
        });
      }

      currentMessages = [
        ...currentMessages,
        { role: 'assistant', content: response.content },
        { role: 'user', content: toolResults },
      ];

      response = await anthropic.messages.create({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 1024,
        system: SYSTEM_PROMPT,
        tools,
        messages: currentMessages,
      });
    }

    const textBlock = response.content.find((b): b is Anthropic.TextBlock => b.type === 'text');

    return res.json({
      message: textBlock?.text || "I'm here to help you find the perfect bag!",
      products,
      orders,
    });
  } catch (err: any) {
    console.error('Chat error:', err);
    return res.status(500).json({ error: 'Chat service error' });
  }
};
