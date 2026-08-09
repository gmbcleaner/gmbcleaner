/*
# GMBCLEANER Core Schema

1. Overview
This migration creates the complete database schema for the GMBCLEANER reputation management platform.
It includes user profiles, wallets, orders, order items, deposits/payment requests, provider tasks,
support tickets, notifications, blog posts, FAQs, testimonials, and all admin-configurable settings
(pricing, networks, wallet addresses, SEO, system notices, audit logs).

2. New Tables
- profiles: extends auth.users with role, user_code, wallet_balance
- orders: client orders for review dispute cases
- order_items: individual review URLs within an order
- deposits: wallet funding requests (crypto payments)
- transactions: ledger of all wallet balance changes
- provider_tasks: per-link tasks assigned to provider admins
- support_tickets: client support requests
- ticket_messages: messages within a support ticket
- notifications: user notification center
- blog_posts: blog/resource articles
- faqs: FAQ entries (public + admin-managed)
- testimonials: client testimonials (admin-managed)
- pricing_settings: configurable base price and service fee
- network_settings: supported crypto networks
- wallet_addresses: admin-editable deposit wallet addresses
- seo_settings: per-page SEO metadata
- system_notices: admin-managed banner/notice content
- audit_logs: admin action audit trail
- site_settings: general site configuration

3. Security
- RLS enabled on every table.
- Owner-scoped policies for user data (orders, tickets, notifications, transactions).
- Public read for blog_posts, faqs, testimonials, pricing_settings, system_notices, seo_settings.
- All writes scoped to authenticated users or admin role.
*/

-- ============ PROFILES ============
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  role text NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin', 'provider')),
  user_code text NOT NULL DEFAULT ('GMB-' || upper(substr(encode(gen_random_bytes(4), 'hex'), 1, 8))),
  wallet_balance numeric(12,2) NOT NULL DEFAULT 0,
  full_name text,
  company text,
  phone text,
  avatar_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_profile" ON profiles;
CREATE POLICY "select_own_profile" ON profiles FOR SELECT
TO authenticated USING (auth.uid() = id OR EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin'));

DROP POLICY IF EXISTS "update_own_profile" ON profiles;
CREATE POLICY "update_own_profile" ON profiles FOR UPDATE
TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "admin_update_profiles" ON profiles;
CREATE POLICY "admin_update_profiles" ON profiles FOR UPDATE
TO authenticated USING (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin'))
WITH CHECK (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin'));

-- ============ ORDERS ============
CREATE TABLE IF NOT EXISTS orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES profiles(id) ON DELETE CASCADE,
  order_code text NOT NULL DEFAULT ('ORD-' || upper(substr(encode(gen_random_bytes(6), 'hex'), 1, 10))),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'rejected', 'on_hold')),
  total_amount numeric(12,2) NOT NULL DEFAULT 0,
  item_count integer NOT NULL DEFAULT 0,
  notes text,
  assigned_provider uuid REFERENCES profiles(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_orders" ON orders;
CREATE POLICY "select_own_orders" ON orders FOR SELECT
TO authenticated USING (auth.uid() = user_id OR EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role IN ('admin', 'provider')));

DROP POLICY IF EXISTS "insert_own_orders" ON orders;
CREATE POLICY "insert_own_orders" ON orders FOR INSERT
TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_orders" ON orders;
CREATE POLICY "update_own_orders" ON orders FOR UPDATE
TO authenticated USING (auth.uid() = user_id OR EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role IN ('admin', 'provider')))
WITH CHECK (auth.uid() = user_id OR EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role IN ('admin', 'provider')));

-- ============ ORDER ITEMS ============
CREATE TABLE IF NOT EXISTS order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  review_url text NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'rejected')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_order_items" ON order_items;
CREATE POLICY "select_order_items" ON order_items FOR SELECT
TO authenticated USING (EXISTS (SELECT 1 FROM orders WHERE orders.id = order_items.order_id AND (orders.user_id = auth.uid() OR EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role IN ('admin', 'provider')))));

DROP POLICY IF EXISTS "insert_order_items" ON order_items;
CREATE POLICY "insert_order_items" ON order_items FOR INSERT
TO authenticated WITH CHECK (EXISTS (SELECT 1 FROM orders WHERE orders.id = order_items.order_id AND orders.user_id = auth.uid()));

DROP POLICY IF EXISTS "update_order_items" ON order_items;
CREATE POLICY "update_order_items" ON order_items FOR UPDATE
TO authenticated USING (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role IN ('admin', 'provider')));

-- ============ DEPOSITS / PAYMENT REQUESTS ============
CREATE TABLE IF NOT EXISTS deposits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES profiles(id) ON DELETE CASCADE,
  amount numeric(12,2) NOT NULL CHECK (amount >= 20),
  currency text NOT NULL DEFAULT 'USDT',
  network text NOT NULL DEFAULT 'TRC20',
  tx_hash text,
  sender_wallet text,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  reject_reason text,
  created_at timestamptz DEFAULT now(),
  reviewed_at timestamptz
);
ALTER TABLE deposits ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_deposits" ON deposits;
CREATE POLICY "select_own_deposits" ON deposits FOR SELECT
TO authenticated USING (auth.uid() = user_id OR EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin'));

DROP POLICY IF EXISTS "insert_own_deposits" ON deposits;
CREATE POLICY "insert_own_deposits" ON deposits FOR INSERT
TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "admin_update_deposits" ON deposits;
CREATE POLICY "admin_update_deposits" ON deposits FOR UPDATE
TO authenticated USING (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin'))
WITH CHECK (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin'));

-- ============ TRANSACTIONS (LEDGER) ============
CREATE TABLE IF NOT EXISTS transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES profiles(id) ON DELETE CASCADE,
  type text NOT NULL CHECK (type IN ('deposit', 'order_payment', 'refund', 'adjustment')),
  amount numeric(12,2) NOT NULL,
  balance_after numeric(12,2),
  description text,
  reference_id uuid,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_transactions" ON transactions;
CREATE POLICY "select_own_transactions" ON transactions FOR SELECT
TO authenticated USING (auth.uid() = user_id OR EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin'));

DROP POLICY IF EXISTS "insert_own_transactions" ON transactions;
CREATE POLICY "insert_own_transactions" ON transactions FOR INSERT
TO authenticated WITH CHECK (auth.uid() = user_id);

-- ============ PROVIDER TASKS ============
CREATE TABLE IF NOT EXISTS provider_tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_item_id uuid NOT NULL REFERENCES order_items(id) ON DELETE CASCADE,
  provider_id uuid REFERENCES profiles(id),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed')),
  notes text,
  started_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE provider_tasks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_provider_tasks" ON provider_tasks;
CREATE POLICY "select_provider_tasks" ON provider_tasks FOR SELECT
TO authenticated USING (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role IN ('admin', 'provider')));

DROP POLICY IF EXISTS "update_provider_tasks" ON provider_tasks;
CREATE POLICY "update_provider_tasks" ON provider_tasks FOR UPDATE
TO authenticated USING (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role IN ('admin', 'provider')))
WITH CHECK (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role IN ('admin', 'provider')));

DROP POLICY IF EXISTS "insert_provider_tasks" ON provider_tasks;
CREATE POLICY "insert_provider_tasks" ON provider_tasks FOR INSERT
TO authenticated WITH CHECK (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin'));

-- ============ SUPPORT TICKETS ============
CREATE TABLE IF NOT EXISTS support_tickets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES profiles(id) ON DELETE CASCADE,
  subject text NOT NULL,
  status text NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved', 'closed')),
  priority text NOT NULL DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
ALTER TABLE support_tickets ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_tickets" ON support_tickets;
CREATE POLICY "select_own_tickets" ON support_tickets FOR SELECT
TO authenticated USING (auth.uid() = user_id OR EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin'));

DROP POLICY IF EXISTS "insert_own_tickets" ON support_tickets;
CREATE POLICY "insert_own_tickets" ON support_tickets FOR INSERT
TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_tickets" ON support_tickets;
CREATE POLICY "update_own_tickets" ON support_tickets FOR UPDATE
TO authenticated USING (auth.uid() = user_id OR EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin'))
WITH CHECK (auth.uid() = user_id OR EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin'));

CREATE TABLE IF NOT EXISTS ticket_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id uuid NOT NULL REFERENCES support_tickets(id) ON DELETE CASCADE,
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES profiles(id) ON DELETE CASCADE,
  message text NOT NULL,
  is_staff boolean NOT NULL DEFAULT false,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE ticket_messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_ticket_messages" ON ticket_messages;
CREATE POLICY "select_ticket_messages" ON ticket_messages FOR SELECT
TO authenticated USING (EXISTS (SELECT 1 FROM support_tickets t WHERE t.id = ticket_id AND (t.user_id = auth.uid() OR EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin'))));

DROP POLICY IF EXISTS "insert_ticket_messages" ON ticket_messages;
CREATE POLICY "insert_ticket_messages" ON ticket_messages FOR INSERT
TO authenticated WITH CHECK (auth.uid() = user_id);

-- ============ NOTIFICATIONS ============
CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES profiles(id) ON DELETE CASCADE,
  title text NOT NULL,
  message text NOT NULL,
  type text NOT NULL DEFAULT 'info' CHECK (type IN ('info', 'success', 'warning', 'error', 'order', 'payment')),
  is_read boolean NOT NULL DEFAULT false,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_notifications" ON notifications;
CREATE POLICY "select_own_notifications" ON notifications FOR SELECT
TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_notifications" ON notifications;
CREATE POLICY "insert_own_notifications" ON notifications FOR INSERT
TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_notifications" ON notifications;
CREATE POLICY "update_own_notifications" ON notifications FOR UPDATE
TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ============ BLOG POSTS ============
CREATE TABLE IF NOT EXISTS blog_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  slug text NOT NULL UNIQUE,
  excerpt text NOT NULL,
  content text NOT NULL,
  category text NOT NULL DEFAULT 'Reputation Management',
  author text NOT NULL DEFAULT 'GMBCLEANER Team',
  featured_image text,
  tags text[] DEFAULT '{}',
  is_published boolean NOT NULL DEFAULT true,
  published_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_read_blog" ON blog_posts;
CREATE POLICY "public_read_blog" ON blog_posts FOR SELECT
TO anon, authenticated USING (is_published = true);

DROP POLICY IF EXISTS "admin_manage_blog" ON blog_posts;
CREATE POLICY "admin_manage_blog" ON blog_posts FOR ALL
TO authenticated USING (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin'))
WITH CHECK (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin'));

-- ============ FAQS ============
CREATE TABLE IF NOT EXISTS faqs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  question text NOT NULL,
  answer text NOT NULL,
  category text NOT NULL DEFAULT 'general',
  sort_order integer NOT NULL DEFAULT 0,
  is_published boolean NOT NULL DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
ALTER TABLE faqs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_read_faqs" ON faqs;
CREATE POLICY "public_read_faqs" ON faqs FOR SELECT
TO anon, authenticated USING (is_published = true);

DROP POLICY IF EXISTS "admin_manage_faqs" ON faqs;
CREATE POLICY "admin_manage_faqs" ON faqs FOR ALL
TO authenticated USING (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin'))
WITH CHECK (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin'));

-- ============ TESTIMONIALS ============
CREATE TABLE IF NOT EXISTS testimonials (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  author_name text NOT NULL,
  author_role text,
  company text,
  avatar_url text,
  content text NOT NULL,
  rating integer NOT NULL DEFAULT 5 CHECK (rating BETWEEN 1 AND 5),
  is_published boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE testimonials ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_read_testimonials" ON testimonials;
CREATE POLICY "public_read_testimonials" ON testimonials FOR SELECT
TO anon, authenticated USING (is_published = true);

DROP POLICY IF EXISTS "admin_manage_testimonials" ON testimonials;
CREATE POLICY "admin_manage_testimonials" ON testimonials FOR ALL
TO authenticated USING (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin'))
WITH CHECK (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin'));

-- ============ PRICING SETTINGS ============
CREATE TABLE IF NOT EXISTS pricing_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  base_price numeric(10,2) NOT NULL DEFAULT 1.00,
  service_fee numeric(10,2) NOT NULL DEFAULT 0.15,
  min_deposit numeric(10,2) NOT NULL DEFAULT 20.00,
  updated_at timestamptz DEFAULT now()
);
ALTER TABLE pricing_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_read_pricing" ON pricing_settings;
CREATE POLICY "public_read_pricing" ON pricing_settings FOR SELECT
TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "admin_manage_pricing" ON pricing_settings;
CREATE POLICY "admin_manage_pricing" ON pricing_settings FOR ALL
TO authenticated USING (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin'))
WITH CHECK (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin'));

-- ============ NETWORK SETTINGS ============
CREATE TABLE IF NOT EXISTS network_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  currency text NOT NULL,
  network text NOT NULL,
  is_active boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE network_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_read_networks" ON network_settings;
CREATE POLICY "public_read_networks" ON network_settings FOR SELECT
TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "admin_manage_networks" ON network_settings;
CREATE POLICY "admin_manage_networks" ON network_settings FOR ALL
TO authenticated USING (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin'))
WITH CHECK (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin'));

-- ============ WALLET ADDRESSES ============
CREATE TABLE IF NOT EXISTS wallet_addresses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  network text NOT NULL,
  currency text NOT NULL,
  address text NOT NULL,
  qr_code_url text,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE wallet_addresses ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "authed_read_wallets" ON wallet_addresses;
CREATE POLICY "authed_read_wallets" ON wallet_addresses FOR SELECT
TO authenticated USING (is_active = true OR EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin'));

DROP POLICY IF EXISTS "admin_manage_wallets" ON wallet_addresses;
CREATE POLICY "admin_manage_wallets" ON wallet_addresses FOR ALL
TO authenticated USING (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin'))
WITH CHECK (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin'));

-- ============ SEO SETTINGS ============
CREATE TABLE IF NOT EXISTS seo_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  page_key text NOT NULL UNIQUE,
  title text,
  description text,
  og_image text,
  keywords text[],
  canonical_url text,
  updated_at timestamptz DEFAULT now()
);
ALTER TABLE seo_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_read_seo" ON seo_settings;
CREATE POLICY "public_read_seo" ON seo_settings FOR SELECT
TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "admin_manage_seo" ON seo_settings;
CREATE POLICY "admin_manage_seo" ON seo_settings FOR ALL
TO authenticated USING (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin'))
WITH CHECK (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin'));

-- ============ SYSTEM NOTICES ============
CREATE TABLE IF NOT EXISTS system_notices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  content text NOT NULL,
  type text NOT NULL DEFAULT 'info' CHECK (type IN ('info', 'success', 'warning', 'error')),
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE system_notices ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_read_notices" ON system_notices;
CREATE POLICY "public_read_notices" ON system_notices FOR SELECT
TO anon, authenticated USING (is_active = true);

DROP POLICY IF EXISTS "admin_manage_notices" ON system_notices;
CREATE POLICY "admin_manage_notices" ON system_notices FOR ALL
TO authenticated USING (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin'))
WITH CHECK (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin'));

-- ============ AUDIT LOGS ============
CREATE TABLE IF NOT EXISTS audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id uuid REFERENCES profiles(id),
  action text NOT NULL,
  entity_type text,
  entity_id uuid,
  details jsonb,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "admin_read_audit" ON audit_logs;
CREATE POLICY "admin_read_audit" ON audit_logs FOR SELECT
TO authenticated USING (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin'));

DROP POLICY IF EXISTS "insert_audit" ON audit_logs;
CREATE POLICY "insert_audit" ON audit_logs FOR INSERT
TO authenticated WITH CHECK (true);

-- ============ SITE SETTINGS ============
CREATE TABLE IF NOT EXISTS site_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text NOT NULL UNIQUE,
  value text NOT NULL,
  updated_at timestamptz DEFAULT now()
);
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_read_site_settings" ON site_settings;
CREATE POLICY "public_read_site_settings" ON site_settings FOR SELECT
TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "admin_manage_site_settings" ON site_settings;
CREATE POLICY "admin_manage_site_settings" ON site_settings FOR ALL
TO authenticated USING (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin'))
WITH CHECK (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin'));

-- ============ INDEXES ============
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_deposits_user_id ON deposits(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_provider_tasks_provider ON provider_tasks(provider_id);
CREATE INDEX IF NOT EXISTS idx_provider_tasks_status ON provider_tasks(status);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_blog_slug ON blog_posts(slug);
CREATE INDEX IF NOT EXISTS idx_support_tickets_user ON support_tickets(user_id);

-- ============ TRIGGER: auto-create profile on signup ============
CREATE OR REPLACE FUNCTION handle_new_user() RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, email) VALUES (NEW.id, NEW.email);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ============ TRIGGER: update updated_at ============
CREATE OR REPLACE FUNCTION update_updated_at() RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS profiles_updated_at ON profiles;
CREATE TRIGGER profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS orders_updated_at ON orders;
CREATE TRIGGER orders_updated_at BEFORE UPDATE ON orders FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS order_items_updated_at ON order_items;
CREATE TRIGGER order_items_updated_at BEFORE UPDATE ON order_items FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS support_tickets_updated_at ON support_tickets;
CREATE TRIGGER support_tickets_updated_at BEFORE UPDATE ON support_tickets FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS blog_posts_updated_at ON blog_posts;
CREATE TRIGGER blog_posts_updated_at BEFORE UPDATE ON blog_posts FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS faqs_updated_at ON faqs;
CREATE TRIGGER faqs_updated_at BEFORE UPDATE ON faqs FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS seo_settings_updated_at ON seo_settings;
CREATE TRIGGER seo_settings_updated_at BEFORE UPDATE ON seo_settings FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============ SEED DATA ============
INSERT INTO pricing_settings (base_price, service_fee, min_deposit) VALUES (1.00, 0.15, 20.00)
  ON CONFLICT DO NOTHING;

INSERT INTO network_settings (name, currency, network, sort_order) VALUES
  ('USDT TRC20', 'USDT', 'TRC20', 1),
  ('USDT BEP20', 'USDT', 'BEP20', 2),
  ('USDT ERC20', 'USDT', 'ERC20', 3),
  ('USDC ERC20', 'USDC', 'ERC20', 4),
  ('BTC', 'BTC', 'Bitcoin', 5)
  ON CONFLICT DO NOTHING;

INSERT INTO faqs (question, answer, category, sort_order) VALUES
  ('Is GMBCLEANER a legitimate service?', 'Yes. GMBCLEANER is a reputation management platform that helps businesses identify and report reviews that may violate platform policies. We operate transparently and only submit disputes through official channels.', 'general', 1),
  ('Can you guarantee removal of a review?', 'No. We do not guarantee removal of any review. We evaluate each case and submit policy-based disputes. Genuine, factually-based customer feedback is not eligible for dispute.', 'general', 2),
  ('How much does the service cost?', 'Each review case costs $1.00 plus a $0.15 service fee per item. You fund your wallet and pay from your account balance. The minimum deposit is $20.', 'pricing', 3),
  ('How long does the process take?', 'Most cases are reviewed and submitted within 24-72 hours. Final outcomes depend on the platform''s own review process and are outside our control.', 'general', 4),
  ('What payment methods do you accept?', 'We accept cryptocurrency payments including USDT on TRC20, BEP20, and ERC20 networks, as well as other configurable options. Wallet addresses are provided in your dashboard.', 'payments', 5),
  ('Is my data secure?', 'Yes. We use secure authentication, encrypted connections, and strict access controls. Your account data and order history are private to you.', 'security', 6)
  ON CONFLICT DO NOTHING;

INSERT INTO testimonials (author_name, author_role, company, content, rating, sort_order) VALUES
  ('Sarah Mitchell', 'Operations Director', 'Brightside Dental', 'GMBCLEANER helped us address a wave of spam reviews that were hurting our local search ranking. Their team was professional and transparent throughout.', 5, 1),
  ('James Okoro', 'Franchise Owner', 'Urban Fitness Group', 'After a competitor attack, we had dozens of fake reviews. GMBCLEANER systematically identified and reported each one. The process was clear and compliant.', 5, 2),
  ('Lena Park', 'Marketing Manager', 'Parkside Hospitality', 'What I appreciate most is the honesty. They told us upfront which reviews were genuine and should stay, and which ones had policy grounds for dispute.', 5, 3),
  ('David Chen', 'CEO', 'Chen Automotive', 'The dashboard makes it easy to submit cases and track status. Funding the wallet was straightforward and support was responsive.', 5, 4)
  ON CONFLICT DO NOTHING;

INSERT INTO blog_posts (title, slug, excerpt, content, category, tags) VALUES
  ('How to Identify Fake Reviews on Your Google Business Listing', 'how-to-identify-fake-reviews', 'Learn the key signs of fake, spam, or policy-violating reviews and what you can do about them.', 'Fake reviews can damage your business reputation and mislead potential customers. In this guide, we walk through the most common indicators of inauthentic reviews and the proper steps to dispute them through official channels.', 'Reputation Management', ARRAY['fake reviews', 'google maps', 'review dispute']),
  ('How Businesses Can Protect Their Online Reputation', 'protect-online-reputation', 'A proactive strategy for monitoring, managing, and defending your brand reputation across review platforms.', 'Your online reputation is one of your most valuable assets. This article covers proactive monitoring, response strategies, and when to escalate policy-violating content through official dispute channels.', 'Online Reputation', ARRAY['reputation management', 'brand protection']),
  ('What to Do When Your Listing Gets a Spam Attack', 'listing-spam-attack-response', 'A step-by-step response plan for businesses hit by coordinated review spam.', 'Coordinated review spam is increasingly common. We outline a clear response plan: documenting the attack, identifying policy violations, and submitting bulk disputes through the right channels.', 'Review Cleanup', ARRAY['spam reviews', 'review moderation']),
  ('How Review Moderation Works: A Transparent Look', 'how-review-moderation-works', 'Understanding the policies and processes behind review moderation on major platforms.', 'Every major review platform has published policies. We break down what content qualifies for removal, how the dispute process works, and what outcomes to realistically expect.', 'Review Moderation', ARRAY['review moderation', 'policy compliance']),
  ('Responding to Negative Reviews Professionally', 'responding-to-negative-reviews', 'Best practices for responding to genuine negative feedback in a way that builds trust.', 'Not all negative reviews should be disputed. Genuine feedback deserves a thoughtful, professional response. This guide covers tone, timing, and strategy for turning criticism into trust.', 'Customer Feedback', ARRAY['negative reviews', 'customer feedback'])
  ON CONFLICT (slug) DO NOTHING;

INSERT INTO seo_settings (page_key, title, description, keywords) VALUES
  ('home', 'GMBCLEANER — Reputation Management & Review Dispute Service', 'Identify, report, and request removal of fake, spam, or policy-violating reviews with a compliant reputation management service.', ARRAY['reputation management', 'fake review reporting', 'review dispute']),
  ('about', 'About GMBCLEANER — Our Mission & Approach', 'Learn about GMBCLEANER, a transparent reputation management service committed to compliance and ethical review dispute practices.', ARRAY['about gmbcleaner', 'reputation management company']),
  ('services', 'Review Dispute & Reputation Management Services | GMBCLEANER', 'Professional review dispute, reputation management, and review moderation services for businesses facing fake or policy-violating reviews.', ARRAY['review dispute service', 'review moderation service']),
  ('pricing', 'Pricing | GMBCLEANER Review Dispute Service', 'Transparent pricing for review dispute services. $1 per case plus a small service fee. Fund your wallet and pay as you go.', ARRAY['review dispute pricing', 'reputation management cost'])
  ON CONFLICT (page_key) DO NOTHING;
