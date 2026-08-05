
import {
  DEFAULT_SERVICES,
  DEFAULT_LOCALITIES,
  DEFAULT_SETTINGS,
  type ServiceItem,
  type LocalityItem,
} from "@/lib/booking";
import {
  DEFAULT_TEXTS,
  DEFAULT_IMAGES,
  DEFAULT_FAQS,
  type CmsTexts,
  type CmsImages,
  type FaqCategory,
} from "@/lib/cms-content";

export interface CatalogSettings {
  radiusKm: number;
  onsiteFee: number;
  deliveryDays: number;
  capacityPerSlot: number;
  maxQuantity: number;
  supportPhone: string;
  supportWhatsApp: string;
}

export interface CatalogConfig {
  services: ServiceItem[];
  localities: LocalityItem[];
  settings: CatalogSettings;
  texts: CmsTexts;
  images: CmsImages;
  faqs: FaqCategory[];
}

export const DEFAULT_SETTINGS_CATALOG: CatalogSettings = {
  radiusKm: DEFAULT_SETTINGS.radiusKm,
  onsiteFee: DEFAULT_SETTINGS.onsiteFee,
  deliveryDays: DEFAULT_SETTINGS.deliveryDays,
  capacityPerSlot: DEFAULT_SETTINGS.capacityPerSlot,
  maxQuantity: DEFAULT_SETTINGS.maxQuantity,
  supportPhone: DEFAULT_SETTINGS.supportPhone,
  supportWhatsApp: DEFAULT_SETTINGS.supportWhatsApp,
};

export function buildDefaultCatalog(): CatalogConfig {
  return {
    services: [...DEFAULT_SERVICES],
    localities: [...DEFAULT_LOCALITIES],
    settings: { ...DEFAULT_SETTINGS_CATALOG },
    texts: structuredClone(DEFAULT_TEXTS),
    images: { ...DEFAULT_IMAGES },
    faqs: structuredClone(DEFAULT_FAQS),
  };
}

// ---- server-side read with a short TTL cache -------------------------------
let catalogCache: { at: number; data: CatalogConfig } | undefined;
const CATALOG_TTL_MS = 60_000;

function isServer() {
  return typeof window === "undefined";
}

function asNumber(value: unknown, fallback: number): number {
  const n = typeof value === "number" ? value : Number(value);
  return Number.isFinite(n) ? n : fallback;
}

function asString(value: unknown, fallback: string): string {
  return typeof value === "string" && value.length > 0 ? value : fallback;
}

function asTexts(value: unknown): CmsTexts {
  const raw = value && typeof value === "object" ? (value as Partial<CmsTexts>) : {};
  return {
    heroHeading: asString(raw.heroHeading, DEFAULT_TEXTS.heroHeading),
    heroSubheading: asString(raw.heroSubheading, DEFAULT_TEXTS.heroSubheading),
    heroItalic: asString(raw.heroItalic, DEFAULT_TEXTS.heroItalic),
    heroDesc: asString(raw.heroDesc, DEFAULT_TEXTS.heroDesc),
    availabilityLabel: asString(raw.availabilityLabel, DEFAULT_TEXTS.availabilityLabel),
    availabilityValue: asString(raw.availabilityValue, DEFAULT_TEXTS.availabilityValue),
    trustList:
      Array.isArray(raw.trustList) && raw.trustList.length > 0
        ? raw.trustList
        : DEFAULT_TEXTS.trustList,
    steps: Array.isArray(raw.steps) && raw.steps.length > 0 ? raw.steps : DEFAULT_TEXTS.steps,
    links: Array.isArray(raw.links) && raw.links.length > 0 ? raw.links : DEFAULT_TEXTS.links,
  };
}

function asImages(value: unknown): CmsImages {
  const raw = value && typeof value === "object" ? (value as Record<string, string>) : {};
  const merged = { ...DEFAULT_IMAGES };
  for (const key of Object.keys(merged) as (keyof CmsImages)[]) {
    const v = raw[key];
    if (typeof v === "string" && v.trim().length > 0) merged[key] = v;
  }
  return merged;
}

function asFaqs(value: unknown): FaqCategory[] {
  if (!Array.isArray(value) || value.length === 0) return structuredClone(DEFAULT_FAQS);
  return value as FaqCategory[];
}

import { supabase } from "@/integrations/supabase/client";

async function readCatalogFromDb(): Promise<CatalogConfig> {
  const [servicesRes, localitiesRes, settingsRes, cmsRes] = await Promise.all([
    supabase.from("services").select("*").eq("active", true).order("sort_order", { ascending: true }),
    supabase.from("localities").select("*").order("sort_order", { ascending: true }),
    supabase.from("settings").select("key, value"),
    supabase.from("cms_content").select("section, key, value"),
  ]);

  if (servicesRes.error) throw servicesRes.error;
  if (localitiesRes.error) throw localitiesRes.error;
  if (settingsRes.error) throw settingsRes.error;
  if (cmsRes.error) throw cmsRes.error;

  const services: ServiceItem[] = (servicesRes.data ?? []).map((r) => ({
    key: r.key,
    name: r.name,
    unit: r.unit,
    rate: r.rate,
    onsiteOnly: r.onsite_only,
    desc: r.description ?? "",
  }));

  const localities: LocalityItem[] = (localitiesRes.data ?? []).map((r) => ({
    name: r.name,
    km: r.km,
  }));

  const settings = { ...DEFAULT_SETTINGS_CATALOG };
  for (const row of settingsRes.data ?? []) {
    const v = row.value;
    switch (row.key) {
      case "radius_km":
        settings.radiusKm = asNumber(v, settings.radiusKm);
        break;
      case "onsite_fee":
        settings.onsiteFee = asNumber(v, settings.onsiteFee);
        break;
      case "delivery_days":
        settings.deliveryDays = asNumber(v, settings.deliveryDays);
        break;
      case "capacity_per_slot":
        settings.capacityPerSlot = asNumber(v, settings.capacityPerSlot);
        break;
      case "max_quantity":
        settings.maxQuantity = asNumber(v, settings.maxQuantity);
        break;
      case "support_phone":
        settings.supportPhone = asString(v, settings.supportPhone);
        break;
      case "support_whatsapp":
        settings.supportWhatsApp = asString(v, settings.supportWhatsApp);
        break;
    }
  }

  const cms = { texts: DEFAULT_TEXTS, images: DEFAULT_IMAGES, faqs: DEFAULT_FAQS };
  for (const row of cmsRes.data ?? []) {
    if (row.section === "texts") cms.texts = asTexts(row.value);
    else if (row.section === "images") cms.images = asImages(row.value);
    else if (row.section === "faqs") cms.faqs = asFaqs(row.value);
  }

  return {
    services: services.length > 0 ? services : DEFAULT_SERVICES,
    localities: localities.length > 0 ? localities : DEFAULT_LOCALITIES,
    settings,
    texts: cms.texts,
    images: cms.images,
    faqs: cms.faqs,
  };
}

export function invalidateCatalogCache() {
  catalogCache = undefined;
}

export async function loadCatalog(): Promise<CatalogConfig> {
  const now = Date.now();
  if (catalogCache && now - catalogCache.at < CATALOG_TTL_MS) {
    return catalogCache.data;
  }

  try {
    const data = await readCatalogFromDb();
    catalogCache = { at: now, data };
    return data;
  } catch (err) {
    console.error("[catalog] DB read failed, using defaults", err);
    return buildDefaultCatalog();
  }
}

export async function getCatalogConfig() {
  return loadCatalog();
}
