-- ==============================================================================
-- SUT CANTEEN EXPRESS - SUPABASE DATABASE SCHEMA
-- วิธีใช้: คัดลอกโค้ดทั้งหมดนี้ไปวางในหน้า "SQL Editor" บนเว็บ Supabase แล้วกด "Run"
-- ==============================================================================

-- 1. เปิดใช้ Extension สร้าง UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. ตารางโรงอาหาร (Canteens)
CREATE TABLE IF NOT EXISTS public.canteens (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    thai_name TEXT NOT NULL,
    location_note TEXT,
    short_name TEXT,
    tagline TEXT,
    image_url TEXT,
    lat NUMERIC,
    lng NUMERIC,
    open_hours TEXT DEFAULT '07:00 - 20:00',
    base_queue_minutes INT DEFAULT 5,
    queue_level TEXT DEFAULT 'Low',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ใส่ข้อมูลโรงอาหาร มทส. ทั้ง 5 โรง (ข้อมูลเริ่มต้น)
INSERT INTO public.canteens (id, name, thai_name, location_note, short_name, tagline, image_url, lat, lng, open_hours, base_queue_minutes, queue_level)
VALUES 
('canteen-5', 'Kasalong Canteen', 'โรงอาหารกาสะลองคำ', 'Suraniwet Dorms, Gate 4', 'Kasalong Canteen', 'Popular canteen near student dormitories', 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=600&q=80', 14.8835, 102.0240, '06:00 - 21:00', 10, 'Medium'),
('canteen-1', 'Prao Saed Thong Canteen', 'โรงอาหารพราวแสดทอง', 'Lecture Building 1 (B1)', 'Prao Saed Thong', 'Hub of delicious food next to B1', 'https://images.unsplash.com/photo-1567521464027-f127ff144326?auto=format&fit=crop&w=600&q=80', 14.8783, 102.0195, '07:00 - 18:00', 5, 'Low'),
('canteen-3', 'Krua Than Thao Canteen', 'โรงอาหารครัวท่านท้าว', 'Opposite SUT Transportation Center', 'Krua Than Thao', 'Central campus canteen with evening market', 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=600&q=80', 14.8812, 102.0168, '06:30 - 20:00', 8, 'Low'),
('canteen-6', 'Don Tawan Canteen', 'โรงอาหารดอนตะวัน', 'Near Suraniwet Dorm 15', 'Don Tawan', 'Cozy campus cafe & made-to-order', 'https://images.unsplash.com/photo-1525610553991-2bede1a236e2?auto=format&fit=crop&w=600&q=80', 14.8860, 102.0210, '08:00 - 20:00', 5, 'Low'),
('canteen-4', 'Den Thong Kwao Canteen', 'โรงอาหารเด่นทองกวาว', 'Opposite Academic Building 2', 'Den Thong Kwao', 'Quiet atmosphere near scientific equipment center', 'https://images.unsplash.com/photo-1541123437800-1bb1317badc2?auto=format&fit=crop&w=600&q=80', 14.8745, 102.0175, '08:00 - 17:00', 3, 'Low')
ON CONFLICT (id) DO NOTHING;

-- 3. ตารางร้านค้า (Stalls) - ว่างเปล่า เพื่อให้ทดสอบสร้างร้านค้าเอง
CREATE TABLE IF NOT EXISTS public.stalls (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    canteen_id TEXT REFERENCES public.canteens(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    thai_name TEXT,
    category TEXT DEFAULT 'Made-to-Order',
    image_url TEXT,
    wait_minutes INT DEFAULT 5,
    rating NUMERIC DEFAULT 5.0,
    is_open BOOLEAN DEFAULT true,
    fastest BOOLEAN DEFAULT false,
    owner_phone TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. ตารางเมนูอาหาร (Menus) - ว่างเปล่า เพื่อให้ทดสอบเพิ่มเมนูเอง
CREATE TABLE IF NOT EXISTS public.menus (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    stall_id UUID REFERENCES public.stalls(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    thai_name TEXT,
    price NUMERIC NOT NULL,
    prep_time INT DEFAULT 5,
    description TEXT,
    image_url TEXT,
    is_popular BOOLEAN DEFAULT false,
    is_available BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. ตารางออเดอร์ & คิว (Orders)
CREATE TABLE IF NOT EXISTS public.orders (
    id TEXT PRIMARY KEY,
    order_number TEXT NOT NULL,
    type TEXT DEFAULT 'PREDICTIVE_SLOTTING',
    status TEXT DEFAULT 'HOLDING_IN_CLOUD',
    student_name TEXT,
    student_phone TEXT,
    canteen_id TEXT,
    canteen_name TEXT,
    stall_id UUID REFERENCES public.stalls(id) ON DELETE SET NULL,
    stall_name TEXT,
    items JSONB NOT NULL DEFAULT '[]'::jsonb,
    total_amount NUMERIC NOT NULL DEFAULT 0,
    pickup_qr_pin TEXT,
    special_notes TEXT,
    status_logs JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. กำหนดสิทธิ์ RLS (Row Level Security) สำหรับช่วงพัฒนาให้เขียน/อ่านได้ทันที
ALTER TABLE public.canteens ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stalls ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.menus ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow all canteens" ON public.canteens;
CREATE POLICY "Allow all canteens" ON public.canteens FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow all stalls" ON public.stalls;
CREATE POLICY "Allow all stalls" ON public.stalls FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow all menus" ON public.menus;
CREATE POLICY "Allow all menus" ON public.menus FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow all orders" ON public.orders;
CREATE POLICY "Allow all orders" ON public.orders FOR ALL USING (true) WITH CHECK (true);

-- 7. เปิดใช้งาน Realtime สำหรับการแจ้งเตือนออเดอร์และร้านค้า
DO $$
BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.stalls;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

DO $$
BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.menus;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

DO $$
BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.orders;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

-- 8. ตารางข้อมูลผู้ใช้งานและโปรไฟล์ (Users / Profiles)
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE NOT NULL,
    password TEXT,
    full_name TEXT NOT NULL,
    student_id TEXT,
    role TEXT NOT NULL DEFAULT 'customer',
    customer_type TEXT DEFAULT 'student',
    role_title TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow all users" ON public.users;
CREATE POLICY "Allow all users" ON public.users FOR ALL USING (true) WITH CHECK (true);

DO $$
BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.users;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

