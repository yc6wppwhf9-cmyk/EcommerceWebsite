import { Request, Response } from 'express';
import Anthropic from '@anthropic-ai/sdk';
import jwt from 'jsonwebtoken';
import { supabase } from '../config/supabase';
import { config } from '../config/env';

const anthropic = new Anthropic({ apiKey: config.ANTHROPIC_API_KEY || 'sk-ant-dev-key' });

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
  min_price?: number;
  max_price?: number;
  limit?: number;
}) => {
  let query = supabase
    .from('products')
    .select('id, name, price, original_price, image, slug, rating, sub_category, is_premium, gender, amazon_url, myntra_url, flipkart_url, ajio_url, categories(slug, title)')
    .eq('is_active', true);

  if (params.category) {
    const catSlug = params.category.trim().toLowerCase();
    if (catSlug === 'junior' || catSlug === 'kids') {
      query = query.or('gender.eq.kids,sub_category.in.(school-backpacks,kids-trolley,trolley-backpacks,combo-set,pouches,lunch-bags)');
    } else if (catSlug === 'kids-trolley') {
      query = query.or('sub_category.eq.kids-trolley,name.ilike.%kids trolley%,name.ilike.%kids trolly%');
    } else if (catSlug === 'trolley-backpacks') {
      query = query.or('sub_category.eq.trolley-backpacks,name.ilike.%trolley backpack%,name.ilike.%trolly backpack%');
    } else if (catSlug === 'laptop' || catSlug === 'laptop-bags' || catSlug === 'laptop-backpacks') {
      query = query.or('sub_category.in.(laptop-backpacks,laptop-bags),name.ilike.%laptop%');
    } else if (catSlug === 'college' || catSlug === 'college-backpacks') {
      query = query.or('sub_category.in.(college-backpacks),name.ilike.%college%');
    } else if (catSlug === 'luggage' || catSlug === 'travel' || catSlug === 'trolley-bags') {
      query = query.or('sub_category.in.(luggage,trolley-bags,travel,duffle),name.ilike.%luggage%,name.ilike.%trolley%');
    } else {
      const { data: cat } = await supabase.from('categories').select('id').eq('slug', catSlug).maybeSingle();
      if (cat) {
        query = query.or(`category_id.eq.${cat.id},sub_category.eq.${catSlug}`);
      } else {
        query = query.eq('sub_category', catSlug);
      }
    }
  }

  if (params.sub_category) {
    const sub = params.sub_category.trim().toLowerCase();
    query = query.eq('sub_category', sub);
  }

  if (params.isPremium !== undefined) {
    query = query.eq('is_premium', params.isPremium);
  }

  if (params.min_price) {
    query = query.gte('price', params.min_price);
  }

  if (params.max_price) {
    query = query.lte('price', params.max_price);
  }

  if (params.search) {
    const rawSearch = params.search.trim();
    const cleanSearch = rawSearch.replace(/[%_\\]/g, '\\$&');
    const searchLower = rawSearch.toLowerCase();
    
    if (searchLower.includes('trolley') || searchLower.includes('trolly')) {
      if (searchLower.includes('kid') || searchLower.includes('child') || searchLower.includes('frozen') || searchLower.includes('cinderella') || searchLower.includes('spiderman')) {
        query = query.or(`sub_category.eq.kids-trolley,name.ilike.%${cleanSearch}%`);
      } else {
        query = query.or(`name.ilike.%${cleanSearch}%,sub_category.ilike.%trolley%,sub_category.eq.luggage`);
      }
    } else if (searchLower.includes('3 year') || searchLower.includes('nursery') || searchLower.includes('kg') || searchLower.includes('preschool') || searchLower.includes('toddler')) {
      query = query.or('name.ilike.%minion%,name.ilike.%gracious%,name.ilike.%fluffy%,name.ilike.%fuzzy%,name.ilike.%power%,name.ilike.%smiley%,sub_category.eq.combo-set');
    } else if (searchLower.includes('6 to 10') || searchLower.includes('primary')) {
      query = query.or('name.ilike.%tipsy%,name.ilike.%mischief%,name.ilike.%funky%,name.ilike.%ranger%,sub_category.eq.kids-trolley');
    } else {
      query = query.or(`name.ilike.%${cleanSearch}%,description.ilike.%${cleanSearch}%,sub_category.ilike.%${cleanSearch}%`);
    }
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
    .select('id, name, price, original_price, image, slug, rating, amazon_url, categories(slug, title)')
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
    .select('products(id, name, price, original_price, image, slug, rating, amazon_url)')
    .eq('user_id', userId)
    .limit(6);
  if (error) return [];
  return (data || []).map((w: any) => w.products).filter(Boolean);
};

// ─── Tools Schema ────────────────────────────────────────────────────────────

const tools: Anthropic.Tool[] = [
  {
    name: 'search_products',
    description: 'Search products from the Priority Bags and TRAWORLD catalog. Use for product recommendations, finding bags by age group, category, price range, or keywords (e.g. laptop, trolley, school, college, duffle, luggage).',
    input_schema: {
      type: 'object' as const,
      properties: {
        category: {
          type: 'string',
          description: 'Category slug: school-backpacks, college-backpacks, laptop-backpacks, trekking-backpacks, luggage, duffle, backpacks, pouches, lunch-bags, kids-trolley, trolley-backpacks, combo-set, junior, travel, accessories, premium',
        },
        search: { type: 'string', description: 'Keyword to search (e.g. "frozen", "spiderman", "laptop", "waterproof", "nursery", "trolley", "3 year old")' },
        isPremium: { type: 'boolean', description: 'Set true to search exclusively luxury/premium TRAWORLD products' },
        min_price: { type: 'number', description: 'Minimum price in INR' },
        max_price: { type: 'number', description: 'Maximum price in INR' },
        sort: { type: 'string', enum: ['rating', 'newest', 'price-asc', 'price-desc'] },
        limit: { type: 'number', description: 'Number of results to return (max 6)' },
      },
    },
  },
  {
    name: 'get_new_arrivals',
    description: 'Fetch the latest/newest products added to the store. Use when user asks about new launches, latest arrivals, or newly added bags.',
    input_schema: {
      type: 'object' as const,
      properties: {
        limit: { type: 'number', description: 'How many new products to show (max 6, default 4)' },
      },
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

const SYSTEM_PROMPT = `You are Priority Assistant, the smart, friendly, and knowledgeable AI shopping assistant for Priority Bags (prioritybags.in) and its premium travel line TRAWORLD. You speak in a polite, warm, concise, and helpful tone.

## BRAND PROFILE & PRODUCT KNOWLEDGE
1. **Priority Bags**: India's leading youth and everyday bag brand offering sturdy, stylish, and high-value backpacks, school bags, college bags, laptop packs, and junior accessories.
2. **TRAWORLD**: Luxury travel collection featuring ultra-durable polypropylene/polycarbonate 360-degree silent spinner trolley suitcases, cabin luggage, and executive duffles.

## EXACT AGE GUIDELINES FOR SCHOOL & JUNIOR BAGS:
- **Below 3 Years (Playschool / Toddler)**: For toddlers under 3, recommend our smallest lightweight 14-inch bags (Minion / Gracious series) with parental support.
- **3 to 5 Years (Nursery, Kindergarten & Preschool)**: 14" to 15" bags (20L–24L capacity) designed for early schoolers:
  - *Minion Series (001, 002, 004)* — 14" with fun sequin prints & light ergonomics.
  - *Gracious Series (004, 006)* — 14" colorful, lightweight carry.
  - *Fluffy, Fuzzy, Power (15"), Smiley (15")* — 15" compact school packs.
  - *Junior Combo Sets* — matching backpack + insulated lunch tiffin pouch + pencil case.
- **6 to 10 Years (Primary School & Kids Luggage)**: 16" to 17" bags (28L–30L capacity) and rolling trolleys:
  - *Tipsy Series (001–008)* — 16" water-resistant PVC/polyester primary school bags.
  - *Mischief Series (002, 003, 005)* — 16" ergonomic primary packs.
  - *Funky Series* & *Ranger Series (17")* — spacious multi-compartment school bags.
  - *Priority Kids Trolley Bags (18", 20", 22")* — hard-shell 360° rolling suitcases with Disney Princess, Cinderella, Frozen, Spiderman, Captain America, and Unicorn prints.
- **11 Years & Above (Middle/High School, College & Laptop)**: 18.5"+ (32L–36L capacity):
  - *College Backpacks*: Blockbuster, Iconic, Ignis, Incredible, Sonata, Stellar, Striker.
  - *Laptop Backpacks*: Atlas, Matrix, Oxford, XTREME, Zipster, PROTECH PLUS (with padded 15.6"-17" tech sleeves).
  - *Trekking & Adventure*: Mount 001 heavy-duty rucksacks (45L–55L).
- **Travel Luggage & Trolley Bags**:
  - *Priority Luggage*: Romania, Vienna, Morocco, Denmark hard-case luggage sets.
  - *TRAWORLD Luxury Luggage*: 360° spinner wheels, TSA locks, scratch-resistant shells (Cabin 20", Medium 24", Large 28", and 2/3-piece sets).

## HOW PURCHASING & POLICIES WORK
- **Direct Marketplace Purchasing**: Products are purchased directly through our marketplace storefronts (Amazon, Flipkart, Myntra, Ajio) by clicking "Buy on Amazon" or marketplace buttons on each product card.
- **Orders & Tracking**: Order placement, delivery tracking, cancellations, returns, and refunds are managed securely within "Your Orders" on Amazon / Myntra / Flipkart where the order was placed.
- **Warranty & Customer Care**: All Priority products carry a 1-year manufacturer warranty. For support, customers can reach us at **info@prioritybags.in** or use the support status tracker on this site.

## CONVERSATIONAL RULES
1. ALWAYS call search_products before recommending products to retrieve real catalog items.
2. When the user asks for "new arrivals", "latest", or "new launch" → call get_new_arrivals.
3. When the user asks for "my wishlist" or "saved items" → call get_wishlist (remind user to log in if they are not).
4. Keep introductory text concise (1–2 sentences) — product cards render automatically as interactive cards below your message.
5. Answer questions about materials (water-resistant PU/PVC, polyester, polycarbonate shells, ergonomic mesh padding, reinforced zippers) clearly and accurately.
6. NEVER fabricate fake product names or prices.`;

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
