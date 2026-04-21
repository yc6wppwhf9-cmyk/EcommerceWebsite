import { Request, Response } from 'express';
import Anthropic from '@anthropic-ai/sdk';
import { supabase } from '../config/supabase';
import { config } from '../config/env';

const anthropic = new Anthropic({ apiKey: config.ANTHROPIC_API_KEY });

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
  query = query.order(s.column, { ascending: s.ascending });
  query = query.limit(params.limit || 4);

  const { data, error } = await query;
  if (error) return [];
  return data || [];
};

const tools: Anthropic.Tool[] = [
  {
    name: 'search_products',
    description: `Search products from the Priority Bags database. Use this whenever the user asks about bags, backpacks, luggage, or product recommendations.
Categories available: school-backpacks, college-backpacks, laptop-bags, travel-bags, luggage, duffle, backpacks, pouches, lunch-bags, trolley-backpacks, combo-set.
For premium/luxury items use isPremium: true.
For children/kids use categories like school-backpacks, trolley-backpacks, lunch-bags.
Always call this tool to get real product data before recommending.`,
    input_schema: {
      type: 'object' as const,
      properties: {
        category: {
          type: 'string',
          description: 'Product category slug. E.g. school-backpacks, luggage, backpacks, laptop-bags, duffle, pouches, lunch-bags, trolley-backpacks, combo-set, college-backpacks',
        },
        search: {
          type: 'string',
          description: 'Keyword to search in product names',
        },
        isPremium: {
          type: 'boolean',
          description: 'Set true to search only premium/luxury products',
        },
        sort: {
          type: 'string',
          enum: ['rating', 'newest', 'price-asc', 'price-desc'],
          description: 'Sort order. Default is rating (best sellers first)',
        },
        limit: {
          type: 'number',
          description: 'Number of products to return (max 6)',
        },
      },
    },
  },
];

const SYSTEM_PROMPT = `You are a friendly shopping assistant for Priority Bags (prioritybags.in), an Indian bag and luggage brand. You help customers find the perfect bags, backpacks, and luggage.

Guidelines:
- Always search the database before recommending products using the search_products tool
- Be warm, helpful, and concise
- When recommending products, mention the name and price (in ₹)
- For children's bags: school-backpacks for ages 3-15, trolley-backpacks for kids who need wheels, lunch-bags for tiffin bags
- For travel: luggage, duffle, travel-bags
- For college/office: college-backpacks, laptop-bags
- For premium: use isPremium flag
- Always sort by rating to show best sellers first
- Keep responses short and friendly — 2-3 sentences max, then show products`;

export const chat = async (req: Request, res: Response) => {
  const { messages } = req.body as { messages: Anthropic.MessageParam[] };

  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: 'messages array is required' });
  }

  if (!config.ANTHROPIC_API_KEY) {
    return res.status(503).json({ error: 'Chat service not configured' });
  }

  try {
    let currentMessages = [...messages];
    let response = await anthropic.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 1024,
      system: SYSTEM_PROMPT,
      tools,
      messages: currentMessages,
    });

    // Agentic loop — handle tool calls
    while (response.stop_reason === 'tool_use') {
      const toolUseBlock = response.content.find((b): b is Anthropic.ToolUseBlock => b.type === 'tool_use');
      if (!toolUseBlock) break;

      const input = toolUseBlock.input as Parameters<typeof searchProducts>[0];
      if (input.limit) input.limit = Math.min(input.limit, 6);
      const products = await searchProducts(input);

      currentMessages = [
        ...currentMessages,
        { role: 'assistant', content: response.content },
        {
          role: 'user',
          content: [{
            type: 'tool_result',
            tool_use_id: toolUseBlock.id,
            content: JSON.stringify(products),
          }],
        },
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
    const toolBlock = currentMessages
      .flatMap(m => (Array.isArray(m.content) ? m.content : []))
      .find((b: any) => b.type === 'tool_result');

    let products: any[] = [];
    if (toolBlock && typeof toolBlock === 'object' && 'content' in toolBlock) {
      try { products = JSON.parse(toolBlock.content as string); } catch { /* ignore */ }
    }

    return res.json({
      message: textBlock?.text || "I'm here to help you find the perfect bag!",
      products,
    });
  } catch (err: any) {
    console.error('Chat error:', err);
    return res.status(500).json({ error: 'Chat service error' });
  }
};
