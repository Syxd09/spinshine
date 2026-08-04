import heroDefault from "@/assets/hero.jpg";
import curtainsDefault from "@/assets/service-curtains.jpg";
import carpetDefault from "@/assets/service-carpet.jpg";
import sofaDefault from "@/assets/service-sofa.jpg";
import mattressDefault from "@/assets/service-mattress.png";
import blanketDefault from "@/assets/service-blanket.png";
import upholsteryDefault from "@/assets/service-upholstery.png";
import baBeforeDefault from "@/assets/ba-before.jpg";
import baAfterDefault from "@/assets/ba-after.jpg";

export interface StepItem {
  n: string;
  t: string;
  c: string;
}

export interface LinkItem {
  name: string;
  to: string;
}

export interface CmsTexts {
  heroHeading: string;
  heroSubheading: string;
  heroItalic: string;
  heroDesc: string;
  availabilityLabel: string;
  availabilityValue: string;
  trustList: string[];
  steps: StepItem[];
  links: LinkItem[];
}

export interface CmsImages {
  hero: string;
  curtains: string;
  carpet: string;
  sofa: string;
  mattress: string;
  blanket: string;
  upholstery: string;
  baBefore: string;
  baAfter: string;
}

export interface FaqQuestion {
  q: string;
  a: string;
}

export interface FaqCategory {
  id: string;
  label: string;
  questions: FaqQuestion[];
}

export const DEFAULT_IMAGES: CmsImages = {
  hero: heroDefault,
  curtains: curtainsDefault,
  carpet: carpetDefault,
  sofa: sofaDefault,
  mattress: mattressDefault,
  blanket: blanketDefault,
  upholstery: upholsteryDefault,
  baBefore: baBeforeDefault,
  baAfter: baAfterDefault,
};

export const DEFAULT_TEXTS: CmsTexts = {
  heroHeading: "Professional Care",
  heroSubheading: "For Modern",
  heroItalic: "homes.",
  heroDesc:
    "Curtains, carpets, blankets, sofas and mattresses cleaned by certified specialists — with unhooking, pickup, on-site service and rehanging across Bangalore.",
  availabilityLabel: "Next Slot Available:",
  availabilityValue: "Today, 2:00 PM – 4:00 PM",
  trustList: [
    "Pickup & Delivery",
    "Same Day Slots",
    "Professional Team",
    "Eco Friendly Cleaning",
    "Transparent Pricing",
    "30 km Delivery Radius",
    "On-site Cleaning Across Bangalore",
  ],
  steps: [
    {
      n: "01",
      t: "Book in 60 seconds",
      c: "Choose your service, pickup or on-site, and a slot that suits you.",
    },
    {
      n: "02",
      t: "We collect",
      c: "A uniformed technician arrives, inspects and tags every item with you.",
    },
    {
      n: "03",
      t: "Professional care",
      c: "Fabric-specific cleaning, drying and a two-stage quality check.",
    },
    {
      n: "04",
      t: "Delivered back",
      c: "Pressed, wrapped and rehung at your door — tracked end to end.",
    },
  ],
  links: [
    { name: "Our Process", to: "/process" },
    { name: "Pricing & Rates", to: "/pricing" },
    { name: "Service Areas", to: "/coverage" },
    { name: "FAQs", to: "/faq" },
    { name: "Track an Order", to: "/track" },
    { name: "Book a Pickup", to: "/book" },
  ],
};

export const DEFAULT_FAQS: FaqCategory[] = [
  {
    id: "booking",
    label: "Booking & Operations",
    questions: [
      {
        q: "What is your average turnaround time?",
        a: "Our standard turnaround time is 48 to 72 hours for pickup items (curtains, blankets, loose rugs). On-site cleaning services (sofas, mattresses, wall-to-wall carpets) are completed on the same day in about 2 to 4 hours.",
      },
      {
        q: "How do I reschedule or cancel my booking?",
        a: "You can reschedule or cancel your slot free of charge up to 12 hours before your scheduled appointment. You can do this by clicking the link in your SMS confirmation or by contacting our helpdesk directly.",
      },
      {
        q: "Do I need to be present for pickup or rehanging?",
        a: "Yes, someone needs to be present to verify the item count and review the pre-service inspection checklist with our technician. The same applies to rehanging to ensure you are fully satisfied with the placement.",
      },
      {
        q: "Are there any travel or transportation charges?",
        a: "Pickup & delivery is free for all orders inside the 30 km service radius. On-site services have a flat transportation fee of ₹199 to cover mobile machinery transportation, regardless of location in Bangalore.",
      },
      {
        q: "Can I book emergency or same-day service?",
        a: "Yes, we reserve a limited number of slots for emergency requests (such as spills on carpets or pet stains). Please contact us via phone or WhatsApp immediately for urgent availability.",
      },
    ],
  },
  {
    id: "fabric",
    label: "Fabric & Curtain Care",
    questions: [
      {
        q: "Do your technicians remove and rehang curtains?",
        a: "Absolutely. Our service is completely hands-off for you. Our technicians will safely unhook the curtains from any tracking, pelmets, or rings, transport them to our facility, and return to rehang them perfectly at no extra charge.",
      },
      {
        q: "How do you handle delicate fabrics like silk, velvet, or linen?",
        a: "We perform colorfastness and shrinkage tests on a hidden patch first. Silks and velvets are cleaned using a solvent-based, moisture-free delicate dry-cleaning process that preserves sheen and prevents water staining.",
      },
      {
        q: "Can you clean rubber-backed blackout curtains?",
        a: "Yes. Thermal-coated or rubber-backed blackout curtains are cleaned using a cold-wash process and ambient air drying. Heat drying can melt or peel the rubber backing, so we dry them in climate-controlled chambers.",
      },
      {
        q: "Do you guarantee complete stain removal?",
        a: "While we use premium cleaning agents and advanced extraction techniques to lift the vast majority of organic, beverage, and pet stains, some old, chemically set stains (like bleach or dye) can permanently alter fabric fibers. We will inspect and advise you of the expected result before starting.",
      },
      {
        q: "What measures do you take to prevent curtain shrinkage?",
        a: "We avoid high-heat commercial dryers and harsh chemicals that shrink cotton or linen yarns. By utilizing pH-neutral detergents, cold-washing, and tension-table pressing, we keep curtain shrinkage to less than 1-2%.",
      },
    ],
  },
  {
    id: "onsite",
    label: "On-Site Cleaning",
    questions: [
      {
        q: "What equipment do your technicians bring for on-site services?",
        a: "Our mobile teams bring industrial hot-water extraction machines, specialized foam shampoo generators, UV-C sanitization wands, high-pressure steam cleaners, and high-velocity air blowers.",
      },
      {
        q: "How long does a sofa or carpet take to dry after on-site cleaning?",
        a: "We extract 90%+ of the injected water using heavy-duty vacuum motors. With our high-velocity air blowers, sofas and mattresses dry in 3 to 5 hours, and carpets dry in about 4 to 6 hours depending on ventilation.",
      },
      {
        q: "Are the chemicals safe for children, elderly residents, and pets?",
        a: "Yes. We use eco-friendly, biodegradable, and low-VOC cleaning agents that leave behind zero toxic residues or strong chemical scents. All detergents are rinsed thoroughly with clean water.",
      },
      {
        q: "Can you remove pet odors and urine stains from mattresses?",
        a: "Yes, we treat mattresses and carpets with enzyme-based deodorizers that break down organic urine salts and completely neutralize odor molecules rather than just masking them.",
      },
      {
        q: "How do you clean leather sofas?",
        a: "Leather upholstery does not undergo water extraction. We apply leather-safe cleaning cream to dissolve oils and grime, wipe it down, and finish with a premium moisturizing cream to prevent cracking.",
      },
    ],
  },
  {
    id: "payments",
    label: "Payments & Invoicing",
    questions: [
      {
        q: "When and how do I pay for my service?",
        a: "Payment is completed after the service or delivery is done. You can pay our technician on-site using UPI (GPay/PhonePe), Credit/Debit cards, or Cash on Delivery.",
      },
      {
        q: "Is the estimated price final?",
        a: "The online estimate is based on the quantities you select. The final price is calculated and printed on an invoice by the technician after verifying the counts and dimensions in person. There are no hidden fees or extra charges.",
      },
      {
        q: "Do you provide corporate tax invoices (GST)?",
        a: "Yes. We can issue standard tax invoices containing your company's GSTIN for corporate carpet, sofa, or curtain maintenance services.",
      },
      {
        q: "Do you offer discounts for bulk bookings?",
        a: "Yes, we offer custom packages for entire home cleanings (such as full curtain rehanging + carpet + sofa packages) and commercial contract accounts. Please contact our support team for a custom quote.",
      },
    ],
  },
];
