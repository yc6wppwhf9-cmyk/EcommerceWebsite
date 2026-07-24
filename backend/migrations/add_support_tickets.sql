-- Run this in Supabase SQL Editor before deploying the support/warranty API.

CREATE TABLE IF NOT EXISTS support_tickets (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ticket_number     VARCHAR(32) UNIQUE NOT NULL,
  type              VARCHAR(20) NOT NULL CHECK (type IN ('contact', 'warranty')),
  name              VARCHAR(120) NOT NULL,
  email             VARCHAR(254) NOT NULL,
  phone             VARCHAR(20),
  order_reference   VARCHAR(100),
  product_name      VARCHAR(200),
  purchase_date     DATE,
  subject           VARCHAR(200) NOT NULL,
  message           TEXT NOT NULL,
  status            VARCHAR(30) NOT NULL DEFAULT 'open'
                    CHECK (status IN ('open', 'in_review', 'waiting_customer', 'resolved', 'closed')),
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_support_tickets_email
  ON support_tickets (email, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_support_tickets_status
  ON support_tickets (status, created_at DESC);

DROP TRIGGER IF EXISTS trg_support_tickets_updated ON support_tickets;
CREATE TRIGGER trg_support_tickets_updated
  BEFORE UPDATE ON support_tickets
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
