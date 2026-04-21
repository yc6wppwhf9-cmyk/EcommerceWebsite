import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MessageCircle, X, Send, ShoppingBag } from 'lucide-react';
const BASE = (import.meta as any).env.VITE_API_URL || '';

interface Product {
  id: string;
  name: string;
  price: number;
  original_price?: number;
  image: string;
  slug: string;
  rating?: number;
}

interface Message {
  role: 'user' | 'assistant';
  text: string;
  products?: Product[];
}

const SUGGESTED = [
  'Best bags for 3 year old',
  'Premium luggage',
  'School backpacks',
  'Laptop bags under ₹1500',
];

export const ChatBot = () => {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', text: "Hi! 👋 I'm your Priority Bags assistant. Ask me anything — best bags for kids, travel luggage, premium collections and more!" },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const send = async (text: string) => {
    if (!text.trim() || loading) return;
    const userMsg: Message = { role: 'user', text };
    const history = [...messages, userMsg];
    setMessages(history);
    setInput('');
    setLoading(true);

    try {
      const firstUserIdx = history.findIndex(m => m.role === 'user');
      const apiMessages = history.slice(firstUserIdx).map(m => ({ role: m.role, content: m.text }));
      const res = await fetch(`${BASE}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: apiMessages }),
      });
      const data = await res.json();
      if (!res.ok || data.error || !data.message) {
        setMessages(prev => [...prev, { role: 'assistant', text: "Sorry, I'm having trouble connecting. Please try again!" }]);
        return;
      }
      setMessages(prev => [...prev, { role: 'assistant', text: data.message, products: data.products }]);
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', text: "Sorry, I'm having trouble connecting. Please try again!" }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setOpen(v => !v)}
        className="fixed bottom-6 right-6 z-[80] w-14 h-14 bg-black text-white rounded-full shadow-2xl flex items-center justify-center hover:bg-gray-800 transition-all duration-300 hover:scale-110"
        aria-label="Chat with us"
      >
        {open ? <X size={22} /> : <MessageCircle size={22} />}
      </button>

      {/* Chat drawer */}
      {open && (
        <div className="fixed bottom-24 right-6 z-[79] w-[340px] sm:w-[380px] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-gray-100" style={{ height: '520px' }}>
          {/* Header */}
          <div className="bg-black px-4 py-3 flex items-center gap-3">
            <div className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center">
              <ShoppingBag size={16} className="text-white" />
            </div>
            <div>
              <p className="text-white font-semibold text-sm">Priority Bags Assistant</p>
              <p className="text-white/60 text-[11px]">Ask about products, recommendations & more</p>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3 bg-gray-50">
            {messages.map((msg, i) => (
              <div key={i} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                <div className={`max-w-[85%] px-3 py-2 rounded-2xl text-sm leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-black text-white rounded-br-sm'
                    : 'bg-white text-gray-800 shadow-sm border border-gray-100 rounded-bl-sm'
                }`}>
                  {msg.text}
                </div>

                {/* Product cards */}
                {msg.products && msg.products.length > 0 && (
                  <div className="mt-2 w-full space-y-2">
                    {msg.products.slice(0, 4).map(p => (
                      <Link
                        key={p.id}
                        to={`/product/${p.slug || p.id}`}
                        onClick={() => setOpen(false)}
                        className="flex items-center gap-3 bg-white border border-gray-100 rounded-xl p-2 hover:border-gray-300 hover:shadow-sm transition-all"
                      >
                        <img src={p.image} alt={p.name} className="w-12 h-12 object-contain rounded-lg bg-gray-50 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-[12px] font-semibold text-gray-800 line-clamp-2 leading-tight">{p.name}</p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-[12px] font-bold text-black">₹{p.price.toLocaleString('en-IN')}</span>
                            {p.original_price && p.original_price > p.price && (
                              <span className="text-[10px] text-gray-400 line-through">₹{p.original_price.toLocaleString('en-IN')}</span>
                            )}
                          </div>
                        </div>
                        <span className="text-[10px] text-gray-400 flex-shrink-0">View →</span>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {loading && (
              <div className="flex items-start">
                <div className="bg-white border border-gray-100 rounded-2xl rounded-bl-sm px-3 py-2 shadow-sm">
                  <div className="flex gap-1 items-center h-4">
                    {[0, 1, 2].map(i => (
                      <div key={i} className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
                    ))}
                  </div>
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Suggestions (only on first message) */}
          {messages.length === 1 && (
            <div className="px-3 py-2 bg-gray-50 border-t border-gray-100 flex gap-1.5 flex-wrap">
              {SUGGESTED.map(s => (
                <button key={s} onClick={() => send(s)} className="text-[10px] bg-white border border-gray-200 text-gray-600 rounded-full px-2.5 py-1 hover:border-black hover:text-black transition-colors">
                  {s}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <div className="px-3 py-3 bg-white border-t border-gray-100 flex gap-2">
            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && send(input)}
              placeholder="Ask about bags, kids, travel..."
              className="flex-1 text-sm border border-gray-200 rounded-xl px-3 py-2 outline-none focus:border-black transition-colors"
            />
            <button
              onClick={() => send(input)}
              disabled={!input.trim() || loading}
              className="w-9 h-9 bg-black text-white rounded-xl flex items-center justify-center disabled:opacity-40 hover:bg-gray-800 transition-colors flex-shrink-0"
            >
              <Send size={14} />
            </button>
          </div>
        </div>
      )}
    </>
  );
};
