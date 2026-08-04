-- ============================================================================
-- PHASE 1: FOUNDATIONS
-- Role-aware application profiles, DB-backed operational config (services,
-- localities, settings) and CMS content. Removes the need for hardcoded values
-- and localStorage-backed configuration.
--
-- All config/CMS tables expose SELECT to anon + authenticated (public site),
-- while writes happen only through service-role server functions (RLS blocks
-- direct client writes). Bookings & blocked_dates already exist in the first
-- migration; this migration layers roles + config on top.
-- ============================================================================

-- 1) PROFILES — one row per auth user, carrying the business role -------------
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role text not null default 'customer'
    check (role in ('customer', 'admin', 'technician', 'driver')),
  full_name text,
  phone text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
comment on table public.profiles is 'Application-level profile and role for each auth user.';

-- Auto-create a profile on signup. The very first user ever created becomes an
-- admin (bootstrap path); everyone else defaults to customer.
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, role, full_name, phone)
  values (
    new.id,
    case when not exists (select 1 from public.profiles)
         then 'admin' else 'customer' end,
    coalesce(new.raw_user_meta_data ->> 'full_name', null),
    coalesce(new.raw_user_meta_data ->> 'phone', null)
  )
  on conflict (id) do nothing;
  return new;
end; $$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Helpers used by the app + RLS.
create or replace function public.current_role()
returns text language sql stable security definer set search_path = public as $$
  select role from public.profiles where id = auth.uid()
$$;
grant execute on function public.current_role() to anon, authenticated;

alter table public.profiles enable row level security;
create policy "Users can read own profile"
  on public.profiles for select to authenticated using (auth.uid() = id);
create policy "Users can update own profile"
  on public.profiles for update to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id and role = (select role from public.profiles where id = auth.uid()));
grant select, update on public.profiles to authenticated;
grant all on public.profiles to service_role;

-- 2) SERVICES — cleanable catalog + rates --------------------------------------
create table public.services (
  id uuid primary key default gen_random_uuid(),
  key text not null unique,
  name text not null,
  unit text not null,
  rate integer not null default 0 check (rate >= 0),
  description text,
  onsite_only boolean not null default false,
  active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
comment on table public.services is 'Catalog of cleanable items with unit pricing.';

-- 3) LOCALITIES — coverage zones with distance from hub ------------------------
create table public.localities (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  km integer not null default 0 check (km >= 0),
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);
comment on table public.localities is 'Named localities and distance from the central hub in km.';

-- 4) SETTINGS — key/value operational knobs ------------------------------------
create table public.settings (
  key text primary key,
  value jsonb not null,
  updated_at timestamptz not null default now()
);
comment on table public.settings is 'Operational configuration key/value pairs (radius, fees, capacity...).';

-- 5) CMS_CONTENT — homepage editorial content ----------------------------------
create table public.cms_content (
  section text not null,
  key text not null,
  value jsonb not null,
  updated_at timestamptz not null default now(),
  primary key (section, key)
);
comment on table public.cms_content is 'Editorial content (texts, images, FAQs) keyed by section+key.';

-- RLS: public SELECT for the site; writes only via service_role server fns.
alter table public.services enable row level security;
alter table public.localities enable row level security;
alter table public.settings enable row level security;
alter table public.cms_content enable row level security;

create policy "Public read services"    on public.services    for select to anon, authenticated using (true);
create policy "Public read localities"  on public.localities  for select to anon, authenticated using (true);
create policy "Public read settings"    on public.settings    for select to anon, authenticated using (true);
create policy "Public read cms_content" on public.cms_content for select to anon, authenticated using (true);

grant select on public.services, public.localities, public.settings, public.cms_content to anon, authenticated;
grant all on public.services, public.localities, public.settings, public.cms_content to service_role;

-- 6) SEEDS (idempotent) ----------------------------------------------------------
insert into public.services (key, name, unit, rate, description, onsite_only, active, sort_order) values
  ('curtains',    'Curtain Cleaning',    'panel',    199, 'Sheers, linen, blackout',            false, true, 1),
  ('carpet',      'Carpet Cleaning',     'carpet',   899, 'Rugs & wall-to-wall',                false, true, 2),
  ('sofa',        'Sofa Cleaning',       'seat',     499, 'Fabric & leather',                   false, true, 3),
  ('mattress',    'Mattress Cleaning',   'mattress', 899, 'UV + steam sanitising',              false, true, 4),
  ('blanket',     'Blanket Cleaning',    'item',     399, 'Quilts, duvets, woollens',           false, true, 5),
  ('upholstery',  'Upholstery Cleaning', 'unit',     249, 'Chairs, recliners, office',          false, true, 6)
on conflict (key) do update set
  name = excluded.name, unit = excluded.unit, rate = excluded.rate,
  description = excluded.description, sort_order = excluded.sort_order;

insert into public.localities (name, km, sort_order) values
  ('Koramangala',     5,  1), ('Indiranagar',      6,  2), ('HSR Layout',       10, 3),
  ('Jayanagar',       8,  4), ('JP Nagar',         11, 5), ('Whitefield',       18, 6),
  ('Marathahalli',    15, 7), ('Hebbal',           13, 8), ('Yelahanka',        19, 9),
  ('RR Nagar',        16, 10),('Sarjapur Road',    17, 11),('Electronic City',  22, 12),
  ('Nelamangala',     34, 13),('Devanahalli',      38, 14),('Hoskote',          33, 15)
on conflict (name) do update set km = excluded.km, sort_order = excluded.sort_order;

insert into public.settings (key, value) values
  ('radius_km',          '30'),
  ('onsite_fee',         '199'),
  ('delivery_days',      '3'),
  ('capacity_per_slot',  '4'),
  ('max_quantity',       '50'),
  ('support_phone',      '"+91 00000 00000"'),
  ('support_whatsapp',   '"+910000000000"')
on conflict (key) do update set value = excluded.value;

-- CMS seeds: texts, images (empty => use bundled defaults) and FAQs.
insert into public.cms_content (section, key, value) values
  ('texts', 'home', '{
    "heroHeading": "Professional Care",
    "heroSubheading": "For Modern",
    "heroItalic": "homes.",
    "heroDesc": "Curtains, carpets, blankets, sofas and mattresses cleaned by certified specialists — with unhooking, pickup, on-site service and rehanging across Bangalore.",
    "availabilityLabel": "Next Slot Available:",
    "availabilityValue": "Today, 2:00 PM – 4:00 PM",
    "trustList": ["Pickup & Delivery","Same Day Slots","Professional Team","Eco Friendly Cleaning","Transparent Pricing","30 km Delivery Radius","On-site Cleaning Across Bangalore"],
    "steps": [
      {"n":"01","t":"Book in 60 seconds","c":"Choose your service, pickup or on-site, and a slot that suits you."},
      {"n":"02","t":"We collect","c":"A uniformed technician arrives, inspects and tags every item with you."},
      {"n":"03","t":"Professional care","c":"Fabric-specific cleaning, drying and a two-stage quality check."},
      {"n":"04","t":"Delivered back","c":"Pressed, wrapped and rehung at your door — tracked end to end."}
    ],
    "links": [
      {"name":"Our Process","to":"/process"},{"name":"Pricing & Rates","to":"/pricing"},
      {"name":"Service Areas","to":"/coverage"},{"name":"FAQs","to":"/faq"},
      {"name":"Track an Order","to":"/track"},{"name":"Book a Pickup","to":"/book"}
    ]
  }'::jsonb),
  ('images', 'home', '{
    "hero":"","curtains":"","carpet":"","sofa":"","mattress":"",
    "blanket":"","upholstery":"","baBefore":"","baAfter":""
  }'::jsonb),
  ('faqs', 'home', '[
    {
      "id": "booking",
      "label": "Booking & Operations",
      "questions": [
        {"q":"What is your average turnaround time?","a":"Our standard turnaround time is 48 to 72 hours for pickup items (curtains, blankets, loose rugs). On-site cleaning services (sofas, mattresses, wall-to-wall carpets) are completed on the same day in about 2 to 4 hours."},
        {"q":"How do I reschedule or cancel my booking?","a":"You can reschedule or cancel your slot free of charge up to 12 hours before your scheduled appointment. You can do this by clicking the link in your SMS confirmation or by contacting our helpdesk directly."},
        {"q":"Do I need to be present for pickup or rehanging?","a":"Yes, someone needs to be present to verify the item count and review the pre-service inspection checklist with our technician. The same applies to rehanging to ensure you are fully satisfied with the placement."},
        {"q":"Are there any travel or transportation charges?","a":"Pickup & delivery is free for all orders inside the 30 km service radius. On-site services have a flat transportation fee of ₹199 to cover mobile machinery transportation, regardless of location in Bangalore."},
        {"q":"Can I book emergency or same-day service?","a":"Yes, we reserve a limited number of slots for emergency requests (such as spills on carpets or pet stains). Please contact us via phone or WhatsApp immediately for urgent availability."}
      ]
    },
    {
      "id": "fabric",
      "label": "Fabric & Curtain Care",
      "questions": [
        {"q":"Do your technicians remove and rehang curtains?","a":"Absolutely. Our service is completely hands-off for you. Our technicians will safely unhook the curtains from any tracking, pelmets, or rings, transport them to our facility, and return to rehang them perfectly at no extra charge."},
        {"q":"How do you handle delicate fabrics like silk, velvet, or linen?","a":"We perform colorfastness and shrinkage tests on a hidden patch first. Silks and velvets are cleaned using a solvent-based, moisture-free delicate dry-cleaning process that preserves sheen and prevents water staining."},
        {"q":"Can you clean rubber-backed blackout curtains?","a":"Yes. Thermal-coated or rubber-backed blackout curtains are cleaned using a cold-wash process and ambient air drying. Heat drying can melt or peel the rubber backing, so we dry them in climate-controlled chambers."},
        {"q":"Do you guarantee complete stain removal?","a":"While we use premium cleaning agents and advanced extraction techniques to lift the vast majority of organic, beverage, and pet stains, some old, chemically set stains (like bleach or dye) can permanently alter fabric fibers. We will inspect and advise you of the expected result before starting."},
        {"q":"What measures do you take to prevent curtain shrinkage?","a":"We avoid high-heat commercial dryers and harsh chemicals that shrink cotton or linen yarns. By utilizing pH-neutral detergents, cold-washing, and tension-table pressing, we keep curtain shrinkage to less than 1-2%."}
      ]
    },
    {
      "id": "onsite",
      "label": "On-Site Cleaning",
      "questions": [
        {"q":"What equipment do your technicians bring for on-site services?","a":"Our mobile teams bring industrial hot-water extraction machines, specialized foam shampoo generators, UV-C sanitization wands, high-pressure steam cleaners, and high-velocity air blowers."},
        {"q":"How long does a sofa or carpet take to dry after on-site cleaning?","a":"We extract 90%+ of the injected water using heavy-duty vacuum motors. With our high-velocity air blowers, sofas and mattresses dry in 3 to 5 hours, and carpets dry in about 4 to 6 hours depending on ventilation."},
        {"q":"Are the chemicals safe for children, elderly residents, and pets?","a":"Yes. We use eco-friendly, biodegradable, and low-VOC cleaning agents that leave behind zero toxic residues or strong chemical scents. All detergents are rinsed thoroughly with clean water."},
        {"q":"Can you remove pet odors and urine stains from mattresses?","a":"Yes, we treat mattresses and carpets with enzyme-based deodorizers that break down organic urine salts and completely neutralize odor molecules rather than just masking them."},
        {"q":"How do you clean leather sofas?","a":"Leather upholstery does not undergo water extraction. We apply leather-safe cleaning cream to dissolve oils and grime, wipe it down, and finish with a premium moisturizing cream to prevent cracking."}
      ]
    },
    {
      "id": "payments",
      "label": "Payments & Invoicing",
      "questions": [
        {"q":"When and how do I pay for my service?","a":"Payment is completed after the service or delivery is done. You can pay our technician on-site using UPI (GPay/PhonePe), Credit/Debit cards, or Cash on Delivery."},
        {"q":"Is the estimated price final?","a":"The online estimate is based on the quantities you select. The final price is calculated and printed on an invoice by the technician after verifying the counts and dimensions in person. There are no hidden fees or extra charges."},
        {"q":"Do you provide corporate tax invoices (GST)?","a":"Yes. We can issue standard tax invoices containing your company GSTIN for corporate carpet, sofa, or curtain maintenance services."},
        {"q":"Do you offer discounts for bulk bookings?","a":"Yes, we offer custom packages for entire home cleanings (such as full curtain rehanging + carpet + sofa packages) and commercial contract accounts. Please contact our support team for a custom quote."}
      ]
    }
  ]'::jsonb)
on conflict (section, key) do update set value = excluded.value;
