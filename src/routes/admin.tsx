import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { SpotlightCard } from "@/components/site/SpotlightCard";
import { supabase } from "@/integrations/supabase/client";
import {
  getBookings,
  getBlockedDates,
  getMyRole,
  saveServices,
  saveLocalities,
  saveSettings,
  saveCms,
  listUsers,
  setUserRole,
  assignTechnician,
  assignDriver,
  makeMeAdmin,
} from "@/lib/admin-actions";
import { useCatalog } from "@/lib/catalog-state";
import type { CatalogSettings } from "@/lib/catalog-actions";
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
import { BookingsTab } from "@/features/admin/bookings-tab";
import { BlockedDatesTab } from "@/features/admin/blocked-dates-tab";
import { ServicesTab } from "@/features/admin/services-tab";
import { CoverageTab } from "@/features/admin/coverage-tab";
import { TextsTab } from "@/features/admin/texts-tab";
import { ImagesTab } from "@/features/admin/images-tab";
import { FaqsTab } from "@/features/admin/faqs-tab";
import { TeamTab } from "@/features/admin/team-tab";
import {
  Calendar,
  DollarSign,
  Settings,
  Image as ImageIcon,
  MapPin,
  MessageSquare,
  Save,
  RotateCcw,
  Clock,
  Lock,
  Unlock,
  LogOut,
  Users,
} from "lucide-react";
import type { BookingRow, BlockedDateRow, UserRow } from "@/features/admin/types";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [{ title: "Admin Dashboard — SpinShine Control Panel" }],
  }),
  component: AdminPage,
});

type TabKey =
  | "bookings"
  | "blocked"
  | "services"
  | "coverage"
  | "texts"
  | "images"
  | "faqs"
  | "team";
type AuthState = "loading" | "guest" | "forbidden" | "ready";

function AdminPage() {
  const router = useRouter();
  const catalog = useCatalog();
  const [myId, setMyId] = useState<string | undefined>(undefined);

  const [authState, setAuthState] = useState<AuthState>("loading");
  const [activeTab, setActiveTab] = useState<TabKey>("bookings");

  // Bookings & blocked dates (database-driven with local fallback)
  const [bookings, setBookings] = useState<BookingRow[]>([]);
  const [blockedDays, setBlockedDays] = useState<BlockedDateRow[]>([]);
  const [users, setUsers] = useState<UserRow[]>([]);
  const [isLocalMode, setIsLocalMode] = useState(false);
  const [loadingDb, setLoadingDb] = useState(false);

  // Operational config + CMS (seeded from the database catalog)
  const [services, setServices] = useState<ServiceItem[]>(() => catalog.services);
  const [localities, setLocalities] = useState<LocalityItem[]>(() => catalog.localities);
  const [settings, setSettings] = useState<CatalogSettings>(() => ({ ...catalog.settings }));
  const [cmsTexts, setCmsTexts] = useState<CmsTexts>(() => structuredClone(catalog.texts));
  const [cmsImages, setCmsImages] = useState<CmsImages>(() => ({ ...catalog.images }));
  const [cmsFaqs, setCmsFaqs] = useState<FaqCategory[]>(() => structuredClone(catalog.faqs));

  const loadLocalDatabase = useCallback(() => {
    setIsLocalMode(true);
    const localB = localStorage.getItem("ss_local_bookings");
    setBookings(localB ? JSON.parse(localB) : []);
    const localD = localStorage.getItem("ss_local_blocked_dates");
    setBlockedDays(localD ? JSON.parse(localD) : []);
  }, []);

  const fetchDatabaseData = useCallback(async () => {
    setLoadingDb(true);
    try {
      const bRes = await getBookings();
      const dRes = await getBlockedDates();
      if (bRes.success && dRes.success) {
        setBookings((bRes.data as unknown as BookingRow[]) || []);
        setBlockedDays((dRes.data as BlockedDateRow[]) || []);
        setIsLocalMode(false);
      } else {
        loadLocalDatabase();
      }
    } catch (err) {
      console.error("Error fetching database: falling back to local storage mode", err);
      loadLocalDatabase();
    } finally {
      setLoadingDb(false);
    }
  }, [loadLocalDatabase]);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getSession();
      if (!data.session) {
        setAuthState("guest");
        return;
      }
      setMyId(data.session.user.id);
      try {
        const res = await getMyRole();
        if (res.success && res.role === "admin") {
          setAuthState("ready");
          fetchDatabaseData();
          fetchTeam();
        } else {
          setAuthState("forbidden");
        }
      } catch (err) {
        console.warn("Admin auth check failed", err);
        setAuthState("guest");
      }
    })();
  }, [fetchDatabaseData]);

  const fetchTeam = useCallback(async () => {
    const res = await listUsers();
    if (res.success) setUsers((res.data as UserRow[]) ?? []);
  }, []);

  const handleSetRole = async (userId: string, role: string) => {
    const res = await setUserRole({ data: { userId, role: role as "admin" | "customer" | "technician" | "driver" } });
    if (res.success) {
      setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, role } : u)));
    } else {
      alert("Failed to update role: " + res.error);
    }
  };

  const handleAssign = async (
    bookingId: string,
    column: "technician" | "driver",
    userId: string | null,
  ) => {
    const fn = column === "technician" ? assignTechnician : assignDriver;
    const res = await fn({ data: { bookingId, userId } });
    if (!res.success) alert("Failed to assign: " + res.error);
    else fetchDatabaseData();
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    await router.invalidate();
    await router.navigate({ to: "/" });
  };

  const handleSaveConfig = async () => {
    const results = await Promise.all([
      saveServices({ data: services }),
      saveLocalities({ data: localities }),
      saveSettings({
        data: {
          radiusKm: settings.radiusKm,
          onsiteFee: settings.onsiteFee,
          deliveryDays: settings.deliveryDays,
          capacityPerSlot: settings.capacityPerSlot,
          maxQuantity: settings.maxQuantity,
          supportPhone: settings.supportPhone,
          supportWhatsApp: settings.supportWhatsApp,
        },
      }),
      saveCms({ data: { texts: cmsTexts, images: cmsImages, faqs: cmsFaqs } }),
    ]);
    const failed = results.find((r) => !r.success);
    if (failed) {
      alert("Failed to save configuration: " + failed.error);
      return;
    }
    await router.invalidate();
    alert("Configuration saved to the database and published.");
  };

  const handleResetToDefaults = () => {
    if (
      !confirm("Reset all texts, images, rates, zones, and settings to standard defaults and save?")
    )
      return;
    setServices([...DEFAULT_SERVICES]);
    setLocalities([...DEFAULT_LOCALITIES]);
    setSettings({ ...DEFAULT_SETTINGS });
    setCmsTexts(structuredClone(DEFAULT_TEXTS));
    setCmsImages({ ...DEFAULT_IMAGES });
    setCmsFaqs(structuredClone(DEFAULT_FAQS));
  };

  if (authState === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-navy">
        <p className="text-sm text-white/60">Checking access…</p>
      </div>
    );
  }

  if (authState === "guest") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-navy bg-grid-pattern-dark p-6">
        <SpotlightCard
          glowColor="rgba(20, 184, 166, 0.15)"
          borderColor="rgba(110, 68, 255, 0.25)"
          className="w-full max-w-md border-white/10"
          innerClassName="!bg-navy/95 p-8 space-y-6 text-center text-white rounded-[inherit]"
        >
          <div className="mx-auto h-12 w-12 rounded-full bg-teal/10 flex items-center justify-center text-teal animate-float">
            <Lock size={24} />
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-extrabold font-display">SpinShine Console</h1>
            <p className="text-xs text-white/50">
              Sign in with your admin account to manage the panel.
            </p>
          </div>
          <Link
            to="/login"
            className="block rounded-xl bg-gradient-to-r from-teal via-royal to-gold py-3 text-xs font-bold uppercase tracking-wider text-white shadow-lift hover:shadow-glow transition-all"
          >
            Go to sign in
          </Link>
          <Link
            to="/"
            className="block text-[10px] text-white/40 hover:text-white transition-colors"
          >
            ← Back to website
          </Link>
        </SpotlightCard>
      </div>
    );
  }

  const handlePromoteSelf = async () => {
    const res = await makeMeAdmin();
    if (res.success) {
      alert("Successfully promoted account to Admin! Loading console...");
      setAuthState("ready");
      fetchDatabaseData();
      fetchTeam();
    } else {
      alert("Failed to promote: " + res.error);
    }
  };

  if (authState === "forbidden") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-navy bg-grid-pattern-dark p-6">
        <SpotlightCard
          glowColor="rgba(20, 184, 166, 0.15)"
          borderColor="rgba(110, 68, 255, 0.25)"
          className="w-full max-w-md border-white/10"
          innerClassName="!bg-navy/95 p-8 space-y-6 text-center text-white rounded-[inherit]"
        >
          <div className="mx-auto h-12 w-12 rounded-full bg-royal/10 flex items-center justify-center text-royal animate-float">
            <Lock size={24} />
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-extrabold font-display">Admin access required</h1>
            <p className="text-xs text-white/50">Your account does not have the admin role.</p>
          </div>
          <div className="space-y-3">
            <button
              onClick={handlePromoteSelf}
              className="w-full rounded-xl bg-gradient-to-r from-teal via-royal to-gold py-3 text-xs font-bold uppercase tracking-wider text-white shadow-lift hover:shadow-glow transition-all cursor-pointer"
            >
              Simulate Admin Access (Set Role to Admin)
            </button>
            <button
              onClick={signOut}
              className="w-full rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 py-3 text-xs font-bold uppercase tracking-wider text-white transition-all cursor-pointer"
            >
              Sign out
            </button>
          </div>
        </SpotlightCard>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Header />
      <main className="flex-1 pt-28 pb-16 px-6">
        <div className="max-w-6xl mx-auto space-y-8">
          <div className="flex flex-wrap justify-between items-center gap-4 bg-card border border-border p-6 rounded-2xl shadow-soft">
            <div>
              <h1 className="text-2xl font-black text-foreground flex items-center gap-2">
                <Unlock size={22} className="text-teal" /> SpinShine Control Panel
              </h1>
              <p className="text-xs text-muted-foreground mt-1 flex items-center gap-2">
                <span>
                  Manage bookings, rates, coverage, and editorial content in the database.
                </span>
                {isLocalMode && (
                  <span className="bg-amber-100 border border-amber-300 text-amber-800 px-2 py-0.5 rounded text-[10px] font-bold uppercase">
                    Local Storage Mode
                  </span>
                )}
              </p>
            </div>
            <div className="flex gap-3 flex-wrap">
              <button
                onClick={fetchDatabaseData}
                className="flex items-center gap-2 rounded-full border border-border bg-background px-4.5 py-2 text-xs font-bold uppercase tracking-wider hover:bg-secondary transition-colors"
              >
                <Clock size={14} /> Refresh DB
              </button>
              <button
                onClick={handleResetToDefaults}
                className="flex items-center gap-2 rounded-full border border-royal/30 bg-royal/5 px-4.5 py-2 text-xs font-bold text-royal uppercase tracking-wider hover:bg-royal/10 transition-colors"
              >
                <RotateCcw size={14} /> Reset Defaults
              </button>
              <button
                onClick={handleSaveConfig}
                className="flex items-center gap-2 rounded-full bg-navy text-white px-5 py-2 text-xs font-bold uppercase tracking-wider hover:bg-royal hover:shadow-glow transition-all"
              >
                <Save size={14} /> Save Config
              </button>
              <button
                onClick={signOut}
                className="flex items-center gap-2 rounded-full border border-border bg-background px-4.5 py-2 text-xs font-bold uppercase tracking-wider hover:bg-secondary transition-colors"
              >
                <LogOut size={14} /> Sign out
              </button>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 border-b border-border pb-px overflow-x-auto">
            {(
              [
                { k: "bookings", l: "Bookings", i: <Clock size={14} /> },
                { k: "blocked", l: "Blocked Dates", i: <Calendar size={14} /> },
                { k: "services", l: "Services & Rates", i: <DollarSign size={14} /> },
                { k: "coverage", l: "Localities & Radius", i: <MapPin size={14} /> },
                { k: "texts", l: "CMS Texts", i: <Settings size={14} /> },
                { k: "images", l: "CMS Images", i: <ImageIcon size={14} /> },
                { k: "faqs", l: "CMS FAQs", i: <MessageSquare size={14} /> },
                { k: "team", l: "Team & Roles", i: <Users size={14} /> },
              ] as const
            ).map((tab) => (
              <button
                key={tab.k}
                onClick={() => setActiveTab(tab.k)}
                className={`flex items-center gap-2 px-4.5 py-3 text-xs font-bold uppercase tracking-wider border-b-2 transition-all ${
                  activeTab === tab.k
                    ? "border-teal text-teal font-extrabold"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                {tab.i} {tab.l}
              </button>
            ))}
          </div>

          {activeTab === "bookings" && (
            <div className="animate-fade-in">
              <BookingsTab
                bookings={bookings}
                loading={loadingDb}
                isLocalMode={isLocalMode}
                services={services}
                users={users}
                onAssign={handleAssign}
                onChanged={fetchDatabaseData}
              />
            </div>
          )}
          {activeTab === "blocked" && (
            <div className="animate-fade-in">
              <BlockedDatesTab
                blockedDays={blockedDays}
                isLocalMode={isLocalMode}
                onChanged={fetchDatabaseData}
              />
            </div>
          )}
          {activeTab === "services" && (
            <div className="animate-fade-in">
              <ServicesTab services={services} setServices={setServices} />
            </div>
          )}
          {activeTab === "coverage" && (
            <div className="animate-fade-in">
              <CoverageTab
                localities={localities}
                setLocalities={setLocalities}
                radiusKm={settings.radiusKm}
                setRadiusKm={(n) => setSettings((s) => ({ ...s, radiusKm: n }))}
                capacityPerSlot={settings.capacityPerSlot}
                setCapacityPerSlot={(n) => setSettings((s) => ({ ...s, capacityPerSlot: n }))}
                deliveryDays={settings.deliveryDays}
                setDeliveryDays={(n) => setSettings((s) => ({ ...s, deliveryDays: n }))}
                onsiteFee={settings.onsiteFee}
                setOnsiteFee={(n) => setSettings((s) => ({ ...s, onsiteFee: n }))}
                maxQuantity={settings.maxQuantity}
                setMaxQuantity={(n) => setSettings((s) => ({ ...s, maxQuantity: n }))}
              />
            </div>
          )}
          {activeTab === "texts" && (
            <div className="animate-fade-in">
              <TextsTab texts={cmsTexts} setTexts={setCmsTexts} />
            </div>
          )}
          {activeTab === "images" && (
            <div className="animate-fade-in">
              <ImagesTab images={cmsImages} setImages={setCmsImages} />
            </div>
          )}
          {activeTab === "faqs" && (
            <div className="animate-fade-in">
              <FaqsTab faqs={cmsFaqs} setFaqs={setCmsFaqs} />
            </div>
          )}
          {activeTab === "team" && (
            <div className="animate-fade-in">
              <TeamTab
                users={users}
                meId={myId}
                onSetRole={handleSetRole}
                onRefresh={fetchTeam}
              />
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
