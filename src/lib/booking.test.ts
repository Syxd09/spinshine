import { describe, it, expect } from "vitest";
import {
  estimatePrice,
  makeOrderRef,
  SERVICES,
  LOCALITIES,
  RADIUS_KM,
  PAYMENT_METHODS,
  TRACK_STAGES,
  STAGE_LABELS,
  nextDays,
  toISODate,
} from "./booking";
import { DEFAULT_TEXTS, DEFAULT_IMAGES, DEFAULT_FAQS } from "./cms-content";
import type { ServiceItem, ServiceKey } from "./booking";
import type { CmsTexts, CmsImages, FaqCategory } from "./cms-content";

/* ═══════════════════════════════════════════════════
   §1. PRICE ESTIMATION ENGINE
   ═══════════════════════════════════════════════════ */

describe("Price Estimation Engine", () => {
  it("should calculate correct base tariff for pickup service", () => {
    const price = estimatePrice("curtains", 3, "pickup");
    expect(price).toBe(199 * 3);
  });

  it("should apply onsite convenience fee of ₹199 when in onsite mode", () => {
    const price = estimatePrice("sofa", 2, "onsite");
    expect(price).toBe(499 * 2 + 199);
  });

  it("should default quantity to at least 1 if 0 is passed", () => {
    const price = estimatePrice("carpet", 0, "pickup");
    expect(price).toBe(899);
  });

  it("should return 0 for undefined/invalid service keys", () => {
    const price = estimatePrice("invalid-service-key", 2, "pickup");
    expect(price).toBe(0);
  });

  it("should calculate correctly for every registered service", () => {
    const serviceKeys: ServiceKey[] = [
      "curtains",
      "carpet",
      "sofa",
      "mattress",
      "blanket",
      "upholstery",
    ];
    for (const key of serviceKeys) {
      const svc = SERVICES.find((s) => s.key === key);
      expect(svc).toBeDefined();
      const price = estimatePrice(key, 1, "pickup");
      expect(price).toBe(svc!.rate);
    }
  });

  it("should scale linearly with quantity", () => {
    for (let qty = 1; qty <= 10; qty++) {
      const price = estimatePrice("curtains", qty, "pickup");
      expect(price).toBe(199 * qty);
    }
  });

  it("should add exactly ₹199 surcharge for onsite mode across all services", () => {
    const serviceKeys: ServiceKey[] = [
      "curtains",
      "carpet",
      "sofa",
      "mattress",
      "blanket",
      "upholstery",
    ];
    for (const key of serviceKeys) {
      const pickup = estimatePrice(key, 1, "pickup");
      const onsite = estimatePrice(key, 1, "onsite");
      expect(onsite - pickup).toBe(199);
    }
  });

  it("should treat negative quantities as 1", () => {
    const price = estimatePrice("sofa", -5, "pickup");
    expect(price).toBe(499); // Max(1, -5) = 1
  });
});

/* ═══════════════════════════════════════════════════
   §2. UNIQUE ORDER ID GENERATOR
   ═══════════════════════════════════════════════════ */

describe("Unique Order ID Generator", () => {
  it("should generate order IDs starting with SS- prefix", () => {
    const ref = makeOrderRef();
    expect(ref.startsWith("SS-")).toBe(true);
  });

  it("should generate completely unique IDs with zero collisions over 500 iterations", () => {
    const idSet = new Set<string>();
    const iterations = 500;

    for (let i = 0; i < iterations; i++) {
      idSet.add(makeOrderRef());
    }

    expect(idSet.size).toBe(iterations);
  });

  it("should conform to SS-YYMMDD-SSSSSXXXX pattern", () => {
    const ref = makeOrderRef();
    const regex = /^SS-\d{6}-\d{5}[A-Z0-9]{4}$/;
    expect(regex.test(ref)).toBe(true);
  });

  it("should embed today's date in the ID", () => {
    const ref = makeOrderRef();
    const now = new Date();
    const yy = now.getFullYear().toString().slice(2);
    const mm = String(now.getMonth() + 1).padStart(2, "0");
    const dd = String(now.getDate()).padStart(2, "0");
    expect(ref).toContain(`SS-${yy}${mm}${dd}-`);
  });

  it("should have consistent length of 19 characters", () => {
    for (let i = 0; i < 50; i++) {
      expect(makeOrderRef().length).toBe(19);
    }
  });
});

/* ═══════════════════════════════════════════════════
   §3. SERVICE CATALOG INTEGRITY
   ═══════════════════════════════════════════════════ */

describe("Service Catalog Integrity", () => {
  it("should have exactly 6 registered services", () => {
    expect(SERVICES.length).toBe(6);
  });

  it("should contain all required service keys", () => {
    const expectedKeys: ServiceKey[] = [
      "curtains",
      "carpet",
      "sofa",
      "mattress",
      "blanket",
      "upholstery",
    ];
    const actualKeys = SERVICES.map((s) => s.key);
    for (const key of expectedKeys) {
      expect(actualKeys).toContain(key);
    }
  });

  it("should have no duplicate service keys", () => {
    const keys = SERVICES.map((s) => s.key);
    expect(new Set(keys).size).toBe(keys.length);
  });

  it("should have positive rates for all services", () => {
    for (const svc of SERVICES) {
      expect(svc.rate).toBeGreaterThan(0);
    }
  });

  it("should have non-empty name, unit, and desc for each service", () => {
    for (const svc of SERVICES) {
      expect(svc.name.length).toBeGreaterThan(0);
      expect(svc.unit.length).toBeGreaterThan(0);
      expect(svc.desc.length).toBeGreaterThan(0);
    }
  });
});

/* ═══════════════════════════════════════════════════
   §4. LOCALITY & COVERAGE DATA
   ═══════════════════════════════════════════════════ */

describe("Locality & Coverage Data", () => {
  it("should have at least 10 localities", () => {
    expect(LOCALITIES.length).toBeGreaterThanOrEqual(10);
  });

  it("should have no duplicate locality names", () => {
    const names = LOCALITIES.map((l) => l.name);
    expect(new Set(names).size).toBe(names.length);
  });

  it("should have positive km distances for all localities", () => {
    for (const loc of LOCALITIES) {
      expect(loc.km).toBeGreaterThan(0);
    }
  });

  it("should define a positive service radius", () => {
    expect(RADIUS_KM).toBeGreaterThan(0);
  });
});

/* ═══════════════════════════════════════════════════
   §5. PAYMENT METHODS
   ═══════════════════════════════════════════════════ */

describe("Payment Methods", () => {
  it("should have at least 3 payment options", () => {
    expect(PAYMENT_METHODS.length).toBeGreaterThanOrEqual(3);
  });

  it("should include UPI, Card, and Cash on delivery", () => {
    const keys = PAYMENT_METHODS.map((p) => p.key);
    expect(keys).toContain("upi");
    expect(keys).toContain("card");
    expect(keys).toContain("cash");
  });

  it("should have non-empty labels and hints", () => {
    for (const pm of PAYMENT_METHODS) {
      expect(pm.label.length).toBeGreaterThan(0);
      expect(pm.hint.length).toBeGreaterThan(0);
    }
  });
});

/* ═══════════════════════════════════════════════════
   §6. TRACKING STAGE PIPELINE
   ═══════════════════════════════════════════════════ */

describe("Tracking Stage Pipeline", () => {
  it("should have exactly 7 stages in the order lifecycle", () => {
    expect(TRACK_STAGES.length).toBe(7);
  });

  it("should begin with 'confirmed' and end with 'delivered'", () => {
    expect(TRACK_STAGES[0]).toBe("confirmed");
    expect(TRACK_STAGES[TRACK_STAGES.length - 1]).toBe("delivered");
  });

  it("should follow correct lifecycle sequence", () => {
    const expected = [
      "confirmed",
      "collected",
      "cleaning",
      "drying",
      "quality_check",
      "out_for_delivery",
      "delivered",
    ];
    expect([...TRACK_STAGES]).toEqual(expected);
  });

  it("should have human-readable labels for all stages plus cancelled", () => {
    for (const stage of TRACK_STAGES) {
      expect(STAGE_LABELS[stage]).toBeDefined();
      expect(STAGE_LABELS[stage]!.length).toBeGreaterThan(0);
    }
    expect(STAGE_LABELS["cancelled"]).toBeDefined();
  });
});

/* ═══════════════════════════════════════════════════
   §7. DATE UTILITY FUNCTIONS
   ═══════════════════════════════════════════════════ */

describe("Date Utility Functions", () => {
  describe("nextDays()", () => {
    it("should return exactly N future dates", () => {
      const days = nextDays(7);
      expect(days.length).toBe(7);
    });

    it("should return dates starting from tomorrow", () => {
      const days = nextDays(3);
      const tomorrow = new Date();
      tomorrow.setHours(0, 0, 0, 0);
      tomorrow.setDate(tomorrow.getDate() + 1);
      expect(days[0]!.getTime()).toBe(tomorrow.getTime());
    });

    it("should return consecutive calendar days", () => {
      const days = nextDays(5);
      for (let i = 1; i < days.length; i++) {
        const diff = days[i]!.getTime() - days[i - 1]!.getTime();
        expect(diff).toBe(24 * 60 * 60 * 1000); // exactly 1 day in ms
      }
    });

    it("should return empty array for count 0", () => {
      expect(nextDays(0)).toEqual([]);
    });
  });

  describe("toISODate()", () => {
    it("should format date as YYYY-MM-DD string", () => {
      const d = new Date(2026, 7, 4); // Aug 4, 2026
      expect(toISODate(d)).toBe("2026-08-04");
    });

    it("should pad single-digit months and days with leading zeros", () => {
      const d = new Date(2026, 0, 5); // Jan 5, 2026
      expect(toISODate(d)).toBe("2026-01-05");
    });

    it("should handle Dec 31 correctly", () => {
      const d = new Date(2026, 11, 31);
      expect(toISODate(d)).toBe("2026-12-31");
    });
  });
});

/* ═══════════════════════════════════════════════════
   §8. CMS DEFAULT CONTENT CONFIGURATION
   ═══════════════════════════════════════════════════ */

describe("CMS Default Configuration", () => {
  describe("Default Texts", () => {
    it("should contain all required editorial fields", () => {
      expect(DEFAULT_TEXTS.heroHeading).toBeDefined();
      expect(DEFAULT_TEXTS.heroSubheading).toBeDefined();
      expect(DEFAULT_TEXTS.heroItalic).toBeDefined();
      expect(DEFAULT_TEXTS.heroDesc).toBeDefined();
      expect(DEFAULT_TEXTS.availabilityLabel).toBeDefined();
      expect(DEFAULT_TEXTS.availabilityValue).toBeDefined();
    });

    it("should have non-empty trust badge list with at least 5 items", () => {
      expect(DEFAULT_TEXTS.trustList.length).toBeGreaterThanOrEqual(5);
      for (const item of DEFAULT_TEXTS.trustList) {
        expect(item.length).toBeGreaterThan(0);
      }
    });

    it("should have exactly 4 process steps", () => {
      expect(DEFAULT_TEXTS.steps.length).toBe(4);
    });

    it("should have sequential step numbers 01-04", () => {
      expect(DEFAULT_TEXTS.steps.map((s) => s.n)).toEqual(["01", "02", "03", "04"]);
    });

    it("should have non-empty title and content for each step", () => {
      for (const step of DEFAULT_TEXTS.steps) {
        expect(step.t.length).toBeGreaterThan(0);
        expect(step.c.length).toBeGreaterThan(0);
      }
    });

    it("should include navigation links for all main pages", () => {
      const routes = DEFAULT_TEXTS.links.map((l) => l.to);
      expect(routes).toContain("/process");
      expect(routes).toContain("/pricing");
      expect(routes).toContain("/coverage");
      expect(routes).toContain("/faq");
      expect(routes).toContain("/track");
      expect(routes).toContain("/book");
    });
  });

  describe("Default Images", () => {
    it("should define all 9 required image slots", () => {
      const keys: (keyof CmsImages)[] = [
        "hero",
        "curtains",
        "carpet",
        "sofa",
        "mattress",
        "blanket",
        "upholstery",
        "baBefore",
        "baAfter",
      ];
      for (const key of keys) {
        expect(typeof DEFAULT_IMAGES[key]).toBe("string");
        expect(DEFAULT_IMAGES[key].length).toBeGreaterThan(0);
      }
    });
  });

  describe("Default FAQs", () => {
    it("should have at least 4 FAQ categories", () => {
      expect(DEFAULT_FAQS.length).toBeGreaterThanOrEqual(4);
    });

    it("should have unique category IDs", () => {
      const ids = DEFAULT_FAQS.map((c) => c.id);
      expect(new Set(ids).size).toBe(ids.length);
    });

    it("should have non-empty labels for all categories", () => {
      for (const cat of DEFAULT_FAQS) {
        expect(cat.label.length).toBeGreaterThan(0);
      }
    });

    it("should have at least 3 questions per category", () => {
      for (const cat of DEFAULT_FAQS) {
        expect(cat.questions.length).toBeGreaterThanOrEqual(3);
      }
    });

    it("should have non-empty question and answer text for every FAQ entry", () => {
      for (const cat of DEFAULT_FAQS) {
        for (const q of cat.questions) {
          expect(q.q.length).toBeGreaterThan(0);
          expect(q.a.length).toBeGreaterThan(0);
        }
      }
    });

    it("should contain expected category IDs", () => {
      const ids = DEFAULT_FAQS.map((c) => c.id);
      expect(ids).toContain("booking");
      expect(ids).toContain("fabric");
      expect(ids).toContain("onsite");
      expect(ids).toContain("payments");
    });
  });
});
