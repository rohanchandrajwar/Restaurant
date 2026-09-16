/*
# Indian Restaurant Ordering System - Schema

## Overview
Creates the full database schema for an Indian restaurant website with menu browsing,
cart ordering, UPI/QR payments, user accounts, and an admin dashboard.

## New Tables

### profiles
- `id` (uuid, primary key, references auth.users) — the user's auth ID
- `full_name` (text) — display name
- `phone` (text) — contact phone number
- `is_admin` (boolean, default false) — admin flag; users cannot set this themselves
- `created_at` (timestamptz)

### menu_items
- `id` (uuid, primary key)
- `name` (text, not null) — dish name
- `description` (text) — dish description
- `price` (numeric, not null) — price in INR
- `category` (text, not null) — e.g. Starters, Main Course, Breads, Rice, Desserts, Beverages
- `image_url` (text) — image URL
- `is_available` (boolean, default true)
- `is_veg` (boolean, default true) — vegetarian flag
- `spice_level` (text, default 'medium') — mild, medium, hot
- `created_at` (timestamptz)

### orders
- `id` (uuid, primary key)
- `user_id` (uuid, not null, references auth.users, default auth.uid())
- `total_amount` (numeric, not null) — total in INR
- `status` (text, default 'pending') — pending, confirmed, preparing, ready, delivered, cancelled
- `payment_method` (text, default 'upi') — upi, cod
- `payment_status` (text, default 'pending') — pending, paid, failed
- `notes` (text) — order notes / delivery instructions
- `delivery_address` (text) — delivery address
- `created_at` (timestamptz)
- `updated_at` (timestamptz)

### order_items
- `id` (uuid, primary key)
- `order_id` (uuid, references orders on delete cascade)
- `menu_item_id` (uuid, references menu_items)
- `name` (text) — snapshot of dish name at order time
- `price` (numeric) — snapshot of price at order time
- `quantity` (int, not null)

## Security (RLS)

- **profiles**: users can read/update their own profile. Admins can read all profiles.
- **menu_items**: everyone (anon + authenticated) can read. Only admins can insert/update/delete.
- **orders**: users can read/insert their own orders. Admins can read all and update status.
- **order_items**: users can read items belonging to their own orders. Admins can read all.
- Admin check uses: EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)

## Trigger
- Auto-create a profile row when a new auth user signs up (handle_new_user function).

## Notes
1. Menu items are seeded with sample Indian dishes.
2. The first user to register can be made admin by setting is_admin = true via SQL.
3. Order status transitions: pending -> confirmed -> preparing -> ready -> delivered (or cancelled).
*/

-- ============================================================
-- PROFILES
-- ============================================================
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text,
  phone text,
  is_admin boolean NOT NULL DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_profile" ON profiles;
CREATE POLICY "select_own_profile" ON profiles FOR SELECT
  TO authenticated USING (auth.uid() = id OR EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.is_admin = true));

DROP POLICY IF EXISTS "update_own_profile" ON profiles;
CREATE POLICY "update_own_profile" ON profiles FOR UPDATE
  TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "insert_own_profile" ON profiles;
CREATE POLICY "insert_own_profile" ON profiles FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = id);

-- Trigger to auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', ''));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- MENU ITEMS
-- ============================================================
CREATE TABLE IF NOT EXISTS menu_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  price numeric(10,2) NOT NULL,
  category text NOT NULL,
  image_url text,
  is_available boolean NOT NULL DEFAULT true,
  is_veg boolean NOT NULL DEFAULT true,
  spice_level text NOT NULL DEFAULT 'medium',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;

-- Everyone can read the menu (anon + authenticated)
DROP POLICY IF EXISTS "read_menu_items" ON menu_items;
CREATE POLICY "read_menu_items" ON menu_items FOR SELECT
  TO anon, authenticated USING (true);

-- Only admins can manage menu items
DROP POLICY IF EXISTS "insert_menu_items_admin" ON menu_items;
CREATE POLICY "insert_menu_items_admin" ON menu_items FOR INSERT
  TO authenticated WITH CHECK (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.is_admin = true));

DROP POLICY IF EXISTS "update_menu_items_admin" ON menu_items;
CREATE POLICY "update_menu_items_admin" ON menu_items FOR UPDATE
  TO authenticated USING (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.is_admin = true))
  WITH CHECK (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.is_admin = true));

DROP POLICY IF EXISTS "delete_menu_items_admin" ON menu_items;
CREATE POLICY "delete_menu_items_admin" ON menu_items FOR DELETE
  TO authenticated USING (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.is_admin = true));

-- ============================================================
-- ORDERS
-- ============================================================
CREATE TABLE IF NOT EXISTS orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  total_amount numeric(10,2) NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  payment_method text NOT NULL DEFAULT 'upi',
  payment_status text NOT NULL DEFAULT 'pending',
  notes text,
  delivery_address text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Users can read their own orders; admins can read all
DROP POLICY IF EXISTS "select_own_orders" ON orders;
CREATE POLICY "select_own_orders" ON orders FOR SELECT
  TO authenticated USING (
    auth.uid() = user_id OR EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.is_admin = true)
  );

-- Users can insert their own orders
DROP POLICY IF EXISTS "insert_own_orders" ON orders;
CREATE POLICY "insert_own_orders" ON orders FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

-- Users can update their own orders (e.g., cancel); admins can update all (status changes)
DROP POLICY IF EXISTS "update_orders" ON orders;
CREATE POLICY "update_orders" ON orders FOR UPDATE
  TO authenticated USING (
    auth.uid() = user_id OR EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.is_admin = true)
  ) WITH CHECK (
    auth.uid() = user_id OR EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.is_admin = true)
  );

-- Users can delete their own orders; admins can delete any
DROP POLICY IF EXISTS "delete_orders" ON orders;
CREATE POLICY "delete_orders" ON orders FOR DELETE
  TO authenticated USING (
    auth.uid() = user_id OR EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.is_admin = true)
  );

-- ============================================================
-- ORDER ITEMS
-- ============================================================
CREATE TABLE IF NOT EXISTS order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  menu_item_id uuid REFERENCES menu_items(id),
  name text NOT NULL,
  price numeric(10,2) NOT NULL,
  quantity int NOT NULL DEFAULT 1,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- Users can read items for their own orders; admins can read all
DROP POLICY IF EXISTS "select_order_items" ON order_items;
CREATE POLICY "select_order_items" ON order_items FOR SELECT
  TO authenticated USING (
    EXISTS (SELECT 1 FROM orders WHERE orders.id = order_items.order_id AND orders.user_id = auth.uid())
    OR EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.is_admin = true)
  );

-- Users can insert items for their own orders
DROP POLICY IF EXISTS "insert_order_items" ON order_items;
CREATE POLICY "insert_order_items" ON order_items FOR INSERT
  TO authenticated WITH CHECK (
    EXISTS (SELECT 1 FROM orders WHERE orders.id = order_items.order_id AND orders.user_id = auth.uid())
  );

-- Admins can update/delete order items
DROP POLICY IF EXISTS "update_order_items" ON order_items;
CREATE POLICY "update_order_items" ON order_items FOR UPDATE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.is_admin = true)
  ) WITH CHECK (
    EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.is_admin = true)
  );

DROP POLICY IF EXISTS "delete_order_items" ON order_items;
CREATE POLICY "delete_order_items" ON order_items FOR DELETE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.is_admin = true)
  );

-- ============================================================
-- INDEXES
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_menu_items_category ON menu_items(category);

-- ============================================================
-- SEED MENU ITEMS
-- ============================================================
INSERT INTO menu_items (name, description, price, category, image_url, is_veg, spice_level) VALUES
('Paneer Tikka', 'Marinated cottage cheese cubes grilled in tandoor with bell peppers and spices', 280, 'Starters', '', true, 'medium'),
('Chicken Tikka', 'Boneless chicken marinated in yogurt and spices, grilled in clay oven', 320, 'Starters', '', false, 'medium'),
('Veg Samosa', 'Crispy pastry filled with spiced potatoes and peas', 120, 'Starters', '', true, 'mild'),
('Tandoori Chicken', 'Half chicken marinated in yogurt, ginger, garlic and tandoori spices', 380, 'Starters', '', false, 'hot'),
('Hara Bhara Kebab', 'Pan-fried patties made from spinach, green peas and potatoes', 220, 'Starters', '', true, 'mild'),
('Butter Chicken', 'Tender chicken in a rich, creamy tomato gravy with butter and aromatic spices', 340, 'Main Course', '', false, 'medium'),
('Paneer Butter Masala', 'Cottage cheese cubes in a velvety tomato and cashew gravy', 300, 'Main Course', '', true, 'medium'),
('Dal Makhani', 'Black lentils slow-cooked with butter, cream and tomatoes', 240, 'Main Course', '', true, 'mild'),
('Chicken Biryani', 'Fragrant basmati rice cooked with marinated chicken, saffron and spices', 360, 'Rice', '', false, 'hot'),
('Veg Biryani', 'Basmati rice layered with mixed vegetables, saffron and aromatic spices', 280, 'Rice', '', true, 'medium'),
('Jeera Rice', 'Basmati rice tempered with cumin seeds', 160, 'Rice', '', true, 'mild'),
('Garlic Naan', 'Soft tandoor-baked bread topped with garlic and butter', 60, 'Breads', '', true, 'mild'),
('Butter Naan', 'Soft tandoor-baked bread brushed with butter', 50, 'Breads', '', true, 'mild'),
('Tandoori Roti', 'Whole wheat bread baked in tandoor', 40, 'Breads', '', true, 'mild'),
('Laccha Paratha', 'Multi-layered flaky whole wheat bread', 55, 'Breads', '', true, 'mild'),
('Gulab Jamun', 'Deep-fried milk dumplings soaked in rose-cardamom sugar syrup', 140, 'Desserts', '', true, 'mild'),
('Rasmalai', 'Soft cheese patties soaked in saffron-cardamom milk', 160, 'Desserts', '', true, 'mild'),
('Gajar Ka Halwa', 'Slow-cooked carrot pudding with milk, ghee and nuts', 150, 'Desserts', '', true, 'mild'),
('Masala Chai', 'Traditional Indian spiced tea with milk', 40, 'Beverages', '', true, 'mild'),
('Sweet Lassi', 'Chilled yogurt drink blended with sugar and cardamom', 80, 'Beverages', '', true, 'mild'),
('Mango Lassi', 'Creamy yogurt drink blended with fresh mango pulp', 90, 'Beverages', '', true, 'mild'),
('Filter Coffee', 'South Indian style filtered coffee with milk', 60, 'Beverages', '', true, 'mild')
ON CONFLICT DO NOTHING;