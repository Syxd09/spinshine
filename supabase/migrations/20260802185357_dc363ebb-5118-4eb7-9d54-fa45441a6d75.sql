CREATE TABLE public.blocked_dates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  blocked_on date NOT NULL UNIQUE,
  reason text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.blocked_dates TO anon, authenticated;
GRANT ALL ON public.blocked_dates TO service_role;
ALTER TABLE public.blocked_dates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Blocked dates are public" ON public.blocked_dates FOR SELECT USING (true);

CREATE TABLE public.bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_ref text NOT NULL UNIQUE,
  service text NOT NULL,
  mode text NOT NULL DEFAULT 'pickup',
  customer_name text NOT NULL,
  phone text NOT NULL,
  email text,
  address text NOT NULL,
  landmark text,
  notes text,
  pickup_date date NOT NULL,
  pickup_slot text NOT NULL,
  delivery_date date,
  delivery_slot text,
  estimated_price integer NOT NULL DEFAULT 0,
  payment_method text NOT NULL DEFAULT 'cash',
  status text NOT NULL DEFAULT 'confirmed',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT INSERT ON public.bookings TO anon, authenticated;
GRANT ALL ON public.bookings TO service_role;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can create a booking" ON public.bookings FOR INSERT TO anon, authenticated WITH CHECK (true);

CREATE INDEX bookings_pickup_idx ON public.bookings (pickup_date, pickup_slot);

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

CREATE TRIGGER bookings_updated_at BEFORE UPDATE ON public.bookings
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Availability: returns remaining capacity per slot for a date, without exposing bookings.
CREATE OR REPLACE FUNCTION public.slot_availability(_date date, _mode text DEFAULT 'pickup')
RETURNS TABLE (slot text, remaining int)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT s.slot,
         GREATEST(0, 4 - (
           SELECT count(*)::int FROM public.bookings b
           WHERE b.pickup_date = _date AND b.pickup_slot = s.slot
             AND b.mode = _mode AND b.status <> 'cancelled'
         )) AS remaining
  FROM (VALUES ('8:00 – 10:00 AM'),('10:00 – 12:00 PM'),('12:00 – 2:00 PM'),
               ('2:00 – 4:00 PM'),('4:00 – 6:00 PM'),('6:00 – 8:00 PM')) AS s(slot);
$$;
GRANT EXECUTE ON FUNCTION public.slot_availability(date, text) TO anon, authenticated;

-- Order tracking: requires both order ref and the phone used at booking.
CREATE OR REPLACE FUNCTION public.track_booking(_order_ref text, _phone text)
RETURNS TABLE (order_ref text, service text, mode text, pickup_date date, pickup_slot text,
               delivery_date date, delivery_slot text, status text, estimated_price int, created_at timestamptz)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT b.order_ref, b.service, b.mode, b.pickup_date, b.pickup_slot,
         b.delivery_date, b.delivery_slot, b.status, b.estimated_price, b.created_at
  FROM public.bookings b
  WHERE upper(b.order_ref) = upper(_order_ref)
    AND regexp_replace(b.phone, '\D', '', 'g') = regexp_replace(_phone, '\D', '', 'g')
  LIMIT 1;
$$;
GRANT EXECUTE ON FUNCTION public.track_booking(text, text) TO anon, authenticated;