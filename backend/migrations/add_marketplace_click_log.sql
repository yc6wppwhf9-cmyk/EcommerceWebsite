-- One row per "Buy on <marketplace>" click, so clicks can be reported by date.
-- products.<marketplace>_clicks keeps the all-time counter used for Best Sellers.
CREATE TABLE IF NOT EXISTS public.marketplace_clicks (
  id BIGSERIAL PRIMARY KEY,
  product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
  marketplace TEXT NOT NULL CHECK (marketplace IN ('amazon', 'flipkart', 'myntra', 'ajio')),
  source TEXT NOT NULL DEFAULT 'site',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_marketplace_clicks_created_at ON public.marketplace_clicks (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_marketplace_clicks_product ON public.marketplace_clicks (product_id);

-- No policies: only the backend (service role, which bypasses RLS) may access this table.
ALTER TABLE public.marketplace_clicks ENABLE ROW LEVEL SECURITY;
