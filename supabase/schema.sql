-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- TABLES
-- ============================================================================

-- Barbers table
CREATE TABLE barbers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  name_lv TEXT,
  photo_url TEXT,
  bio_ru TEXT,
  bio_lv TEXT,
  phone TEXT,
  telegram_chat_id TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Services table
CREATE TABLE services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name_ru TEXT NOT NULL,
  name_lv TEXT NOT NULL,
  description_ru TEXT,
  description_lv TEXT,
  price NUMERIC(10, 2) NOT NULL,
  duration_minutes INTEGER NOT NULL,
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Schedules table (weekly recurring schedule)
CREATE TABLE schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  barber_id UUID NOT NULL REFERENCES barbers(id) ON DELETE CASCADE,
  day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6),
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  is_working BOOLEAN DEFAULT true,
  UNIQUE(barber_id, day_of_week)
);

-- Schedule exceptions table (overrides for specific dates)
CREATE TABLE schedule_exceptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  barber_id UUID NOT NULL REFERENCES barbers(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  is_working BOOLEAN DEFAULT false,
  start_time TIME,
  end_time TIME,
  reason TEXT
);

-- Bookings table
CREATE TABLE bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  barber_id UUID NOT NULL REFERENCES barbers(id) ON DELETE CASCADE,
  service_id UUID NOT NULL REFERENCES services(id) ON DELETE CASCADE,
  client_name TEXT NOT NULL,
  client_phone TEXT NOT NULL,
  client_email TEXT,
  client_language TEXT DEFAULT 'ru' CHECK (client_language IN ('ru', 'lv')),
  date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed', 'no_show')),
  cancel_token UUID DEFAULT gen_random_uuid(),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  confirmed_at TIMESTAMPTZ,
  cancelled_at TIMESTAMPTZ
);

-- Settings table
CREATE TABLE settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================================
-- INDEXES
-- ============================================================================

CREATE INDEX idx_bookings_date_barber_id ON bookings(date, barber_id);
CREATE INDEX idx_bookings_status ON bookings(status);
CREATE INDEX idx_schedules_barber_id ON schedules(barber_id);
CREATE INDEX idx_schedule_exceptions_barber_id_date ON schedule_exceptions(barber_id, date);

-- ============================================================================
-- ROW LEVEL SECURITY
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE barbers ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE schedule_exceptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

-- Barbers policies
CREATE POLICY "Anyone can select active barbers"
  ON barbers FOR SELECT
  USING (is_active = true);

CREATE POLICY "Authenticated users can select all barbers"
  ON barbers FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can insert barbers"
  ON barbers FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update barbers"
  ON barbers FOR UPDATE
  USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete barbers"
  ON barbers FOR DELETE
  USING (auth.role() = 'authenticated');

-- Services policies
CREATE POLICY "Anyone can select active services"
  ON services FOR SELECT
  USING (is_active = true);

CREATE POLICY "Authenticated users can select all services"
  ON services FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can insert services"
  ON services FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update services"
  ON services FOR UPDATE
  USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete services"
  ON services FOR DELETE
  USING (auth.role() = 'authenticated');

-- Schedules policies
CREATE POLICY "Anyone can select active schedules"
  ON schedules FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM barbers
      WHERE barbers.id = schedules.barber_id
      AND barbers.is_active = true
    )
  );

CREATE POLICY "Authenticated users can select all schedules"
  ON schedules FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can insert schedules"
  ON schedules FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update schedules"
  ON schedules FOR UPDATE
  USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete schedules"
  ON schedules FOR DELETE
  USING (auth.role() = 'authenticated');

-- Schedule exceptions policies
CREATE POLICY "Authenticated users can manage schedule exceptions"
  ON schedule_exceptions
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- Bookings policies
CREATE POLICY "Anyone can insert bookings"
  ON bookings FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Authenticated users can select all bookings"
  ON bookings FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update bookings"
  ON bookings FOR UPDATE
  USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete bookings"
  ON bookings FOR DELETE
  USING (auth.role() = 'authenticated');

-- Settings policies
CREATE POLICY "Authenticated users can manage settings"
  ON settings
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- ============================================================================
-- TEST DATA
-- ============================================================================

-- Insert barber
INSERT INTO barbers (name, name_lv, bio_ru, bio_lv, phone, is_active)
VALUES (
  'Сергей Иванов',
  'Sergejs Ivanovs',
  'Опытный парикмахер с 10 летним стажем',
  'Pieredzējis frizieris ar 10 gadu pieredzi',
  '+37126123456',
  true
);

-- Insert service
INSERT INTO services (name_ru, name_lv, description_ru, description_lv, price, duration_minutes, is_active, sort_order)
VALUES (
  'Стрижка',
  'Matu griesana',
  'Классическая мужская стрижка',
  'Klasiskā vīriešu matu griesana',
  30.00,
  45,
  true,
  1
);

-- Insert weekly schedule for Monday-Friday 10:00-21:00
-- First get the barber ID (we'll use a subquery to get the first/only barber)
INSERT INTO schedules (barber_id, day_of_week, start_time, end_time, is_working)
SELECT id, day_of_week, '10:00'::TIME, '21:00'::TIME, true
FROM barbers, 
  LATERAL (
    SELECT * FROM (VALUES (1), (2), (3), (4), (5)) AS days(day_of_week)
  ) AS days
WHERE is_active = true
LIMIT 5;

-- Insert settings
INSERT INTO settings (key, value)
VALUES
  ('slot_duration_minutes', '45'),
  ('booking_lead_hours', '2'),
  ('max_advance_days', '30'),
  ('timezone', 'Europe/Riga');
