import React, { useState } from 'react';
import { Sparkles, Brain, ArrowRight, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface AIPredictionsProps {
  productName: string;
  category: string;
}

export const AIPredictions: React.FC<AIPredictionsProps> = ({ productName, category }) => {
  const [insight, setInsight] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const generateInsight = async () => {
    setLoading(true);
    // Simulate AI thinking
    setTimeout(() => {
      const insights = [
        `Style Forecast: The ${productName} is trending in urban centers. Pair it with a charcoal overcoat for a sleek 2026 tech-minimalist look.`,
        `Durability Analytics: Based on 10,000+ stress tests, this bag's reinforced handles are rated for 5+ years of daily metropolitan commute.`,
        `Trend Alert: ${category} are seeing a 40% surge in demand. This specific model is predicted to be a classic by next season.`
      ];
      setInsight(insights[Math.floor(Math.random() * insights.length)]);
      setLoading(false);
    }, 1500);
  };

  return (
    <div className="bg-gradient-to-br from-[#14052b] to-[#2a0a5a] rounded-[2.5rem] p-8 md:p-12 text-white relative overflow-hidden group">
      <div className="absolute top-0 right-0 p-12 opacity-10 pointer-events-none group-hover:scale-110 transition-transform duration-[2s]">
        <Brain size={160} />
      </div>

      <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
        <div className="w-16 h-16 md:w-20 md:h-20 bg-white/10 backdrop-blur-xl rounded-2xl flex items-center justify-center shrink-0 border border-white/20">
          <Sparkles className="w-8 h-8 text-yellow-400" />
        </div>

        <div className="flex-1 space-y-4 text-center md:text-left">
          <h3 className="text-xl md:text-3xl font-black uppercase tracking-tighter">AI Style Consultant</h3>
          <p className="text-slate-300 text-sm md:text-base font-medium leading-relaxed max-w-xl">
            Our neural engine analyzes global fashion trends and materials to provide personalized ownership insights.
          </p>
          
          <AnimatePresence mode="wait">
            {insight ? (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white/5 border border-white/10 p-6 rounded-2xl md:rounded-[2rem] text-sm md:text-base italic leading-loose text-yellow-100"
              >
                "{insight}"
              </motion.div>
            ) : null}
          </AnimatePresence>

          {!insight && (
            <button
              onClick={generateInsight}
              disabled={loading}
              className="bg-white text-[#14052b] font-black text-[10px] md:text-xs px-10 py-4 md:py-5 rounded-xl md:rounded-2xl transition-all hover:scale-105 active:scale-95 flex items-center gap-3 uppercase tracking-widest disabled:opacity-50 mx-auto md:mx-0 shadow-2xl shadow-white/10"
            >
              {loading ? <Loader2 className="animate-spin" size={16} /> : <><Sparkles size={16} /> Generate Insight <ArrowRight size={14} /></>}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
