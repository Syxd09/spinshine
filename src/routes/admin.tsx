import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { Reveal } from "@/components/site/Reveal";
import { SpotlightCard } from "@/components/site/SpotlightCard";
import {
  getBookings,
  updateBookingStatus,
  createBookingAdmin,
  getBlockedDates,
  addBlockedDate,
  deleteBlockedDate,
} from "@/lib/admin-actions";
import {
  DEFAULT_IMAGES,
  DEFAULT_TEXTS,
  DEFAULT_FAQS,
  saveCmsConfig,
  cmsImages as initialCmsImages,
  cmsTexts as initialCmsTexts,
  cmsFaqs as initialCmsFaqs,
} from "@/lib/cms-config";
import { SERVICES as initialServices, LOCALITIES as initialLocalities, RADIUS_KM as initialRadius } from "@/lib/booking";
import {
  Calendar,
  DollarSign,
  Settings,
  Image as ImageIcon,
  MapPin,
  MessageSquare,
  Plus,
  Trash2,
  Save,
  RotateCcw,
  Search,
  Filter,
  CheckCircle,
  Clock,
  Lock,
  Unlock,
} from "lucide-react";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [{ title: "Admin Dashboard — SpinShine Control Panel" }],
  }),
  component: AdminPage,
});

type TabKey = "bookings" | "blocked" | "services" | "coverage" | "texts" | "images" | "faqs";

function AdminPage() {
  const [passphrase, setPassphrase] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authError, setAuthError] = useState(false);
  const [activeTab, setActiveTab] = useState<TabKey>("bookings");

  // Database Mode State
  const [isLocalStorageMode, setIsLocalStorageMode] = useState(false);

  // Database States
  const [bookings, setBookings] = useState<any[]>([]);
  const [blockedDays, setBlockedDays] = useState<any[]>([]);
  const [loadingDb, setLoadingDb] = useState(false);

  // Search & Filter States
  const [bookingSearch, setBookingSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // CMS Edit States
  const [services, setServices] = useState<any[]>([]);
  const [localities, setLocalities] = useState<any[]>([]);
  const [radiusKm, setRadiusKm] = useState(30);
  const [cmsImages, setCmsImages] = useState(initialCmsImages);
  const [cmsTexts, setCmsTexts] = useState(initialCmsTexts);
  const [cmsFaqs, setCmsFaqs] = useState(initialCmsFaqs);

  // Form States
  const [newBlockDate, setNewBlockDate] = useState("");
  const [newBlockReason, setNewBlockReason] = useState("");
  const [newLocalityName, setNewLocalityName] = useState("");
  const [newLocalityKm, setNewLocalityKm] = useState(10);
  const [newServiceKey, setNewServiceKey] = useState("");
  const [newServiceName, setNewServiceName] = useState("");
  const [newServiceUnit, setNewServiceUnit] = useState("item");
  const [newServiceRate, setNewServiceRate] = useState(199);
  const [newServiceDesc, setNewServiceDesc] = useState("");

  // Manual Booking Form States
  const [mbName, setMbName] = useState("");
  const [mbPhone, setMbPhone] = useState("");
  const [mbEmail, setMbEmail] = useState("");
  const [mbAddress, setMbAddress] = useState("");
  const [mbLandmark, setMbLandmark] = useState("");
  const [mbService, setMbService] = useState("curtains");
  const [mbQty, setMbQty] = useState(1);
  const [mbMode, setMbMode] = useState("pickup");
  const [mbDate, setMbDate] = useState("");
  const [mbSlot, setMbSlot] = useState("8:00 – 10:00 AM");

  useEffect(() => {
    const auth = sessionStorage.getItem("ss_admin_auth");
    if (auth === "true") {
      setIsAuthenticated(true);
      fetchDatabaseData();
    }
    // Set initial CMS state clones
    setServices([...initialServices]);
    setLocalities([...initialLocalities]);
    setRadiusKm(initialRadius);
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (passphrase === "admin123") {
      sessionStorage.setItem("ss_admin_auth", "true");
      setIsAuthenticated(true);
      setAuthError(false);
      fetchDatabaseData();
    } else {
      setAuthError(true);
    }
  };

  const loadLocalDatabase = () => {
    setIsLocalStorageMode(true);
    const localB = localStorage.getItem("ss_local_bookings");
    if (localB) {
      setBookings(JSON.parse(localB));
    } else {
      setBookings([]);
    }
    const localD = localStorage.getItem("ss_local_blocked_dates");
    if (localD) {
      setBlockedDays(JSON.parse(localD));
    } else {
      setBlockedDays([]);
    }
  };

  const fetchDatabaseData = async () => {
    setLoadingDb(true);
    try {
      const bRes = await getBookings();
      const dRes = await getBlockedDates();

      if (bRes.success && dRes.success) {
        setBookings(bRes.data || []);
        setBlockedDays(dRes.data || []);
        setIsLocalStorageMode(false);
      } else {
        // Fallback to local storage mode
        loadLocalDatabase();
      }
    } catch (err) {
      console.error("Error fetching database: falling back to local storage mode", err);
      loadLocalDatabase();
    } finally {
      setLoadingDb(false);
    }
  };

  const handleStatusChange = async (id: string, status: string) => {
    if (isLocalStorageMode) {
      const updated = bookings.map((b) => (b.id === id ? { ...b, status, updated_at: new Date().toISOString() } : b));
      setBookings(updated);
      localStorage.setItem("ss_local_bookings", JSON.stringify(updated));
      return;
    }

    try {
      const res = await updateBookingStatus({ data: { id, status } });
      if (res.success) {
        await fetchDatabaseData();
      } else {
        alert("Failed to update status: " + res.error);
      }
    } catch (err) {
      alert("Failed to update status: " + err);
    }
  };

  const handleAddBlockedDate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBlockDate) return;

    if (isLocalStorageMode) {
      const newBlock = {
        id: Math.random().toString(36).substring(2, 9),
        blocked_on: newBlockDate,
        reason: newBlockReason || "Blocked",
        created_at: new Date().toISOString(),
      };
      const updated = [...blockedDays, newBlock].sort((a, b) => a.blocked_on.localeCompare(b.blocked_on));
      setBlockedDays(updated);
      localStorage.setItem("ss_local_blocked_dates", JSON.stringify(updated));
      setNewBlockDate("");
      setNewBlockReason("");
      return;
    }

    try {
      const res = await addBlockedDate({ data: { date: newBlockDate, reason: newBlockReason } });
      if (res.success) {
        setNewBlockDate("");
        setNewBlockReason("");
        await fetchDatabaseData();
      } else {
        alert("Failed to block date: " + res.error);
      }
    } catch (err) {
      alert("Failed to block date: " + err);
    }
  };

  const handleDeleteBlockedDate = async (id: string) => {
    if (isLocalStorageMode) {
      const updated = blockedDays.filter((d) => d.id !== id);
      setBlockedDays(updated);
      localStorage.setItem("ss_local_blocked_dates", JSON.stringify(updated));
      return;
    }

    try {
      const res = await deleteBlockedDate({ data: id });
      if (res.success) {
        await fetchDatabaseData();
      } else {
        alert("Failed to delete blocked date: " + res.error);
      }
    } catch (err) {
      alert("Failed to delete blocked date: " + err);
    }
  };

  const handleCreateBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mbName || !mbPhone || !mbAddress || !mbDate) {
      alert("Please fill in Name, Phone, Address, and Date");
      return;
    }

    const selectedSvcItem = services.find((s) => s.key === mbService);
    const basePrice = selectedSvcItem ? selectedSvcItem.rate * mbQty : 199;
    const onsitePrice = mbMode === "onsite" ? 199 : 0;
    const finalPrice = basePrice + onsitePrice;

    if (isLocalStorageMode) {
      const orderRef = "SS-" + Math.random().toString(36).substring(2, 7).toUpperCase();
      const newBooking = {
        id: Math.random().toString(36).substring(2, 9),
        order_ref: orderRef,
        customer_name: mbName,
        phone: mbPhone,
        email: mbEmail || null,
        address: mbAddress,
        landmark: mbLandmark || null,
        service: mbService,
        qty: mbQty,
        mode: mbMode,
        pickup_date: mbDate,
        pickup_slot: mbSlot,
        estimated_price: finalPrice,
        status: "confirmed",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      const updated = [newBooking, ...bookings];
      setBookings(updated);
      localStorage.setItem("ss_local_bookings", JSON.stringify(updated));

      // Reset Form
      setMbName("");
      setMbPhone("");
      setMbEmail("");
      setMbAddress("");
      setMbLandmark("");
      setMbDate("");
      alert(`Booking manually added (Local Mode)! Order Ref: ${orderRef}`);
      return;
    }

    try {
      const res = await createBookingAdmin({
        data: {
          customer_name: mbName,
          phone: mbPhone,
          email: mbEmail || null,
          address: mbAddress,
          landmark: mbLandmark || null,
          service: mbService,
          qty: mbQty,
          mode: mbMode,
          pickup_date: mbDate,
          pickup_slot: mbSlot,
          estimated_price: finalPrice,
          status: "confirmed",
        }
      });

      if (res.success) {
        // Reset Form
        setMbName("");
        setMbPhone("");
        setMbEmail("");
        setMbAddress("");
        setMbLandmark("");
        setMbDate("");
        await fetchDatabaseData();
        alert(`Booking manually added! Order Ref: ${res.data.order_ref}`);
      } else {
        alert("Failed to create booking: " + res.error);
      }
    } catch (err) {
      alert("Failed to create booking: " + err);
    }
  };

  // Local Storage Save functions
  const handleSaveCMS = () => {
    saveCmsConfig(cmsImages, cmsTexts, cmsFaqs);
    localStorage.setItem("ss_services", JSON.stringify(services));
    localStorage.setItem("ss_localities", JSON.stringify(localities));
    localStorage.setItem("ss_radius_km", JSON.stringify(radiusKm));
    alert("Configuration successfully saved to local storage!");
    window.location.reload();
  };

  const handleResetToDefaults = () => {
    if (confirm("Are you sure you want to restore all texts, images, rates, and zones to standard defaults?")) {
      localStorage.removeItem("ss_services");
      localStorage.removeItem("ss_localities");
      localStorage.removeItem("ss_radius_km");
      localStorage.removeItem("ss_cms_images");
      localStorage.removeItem("ss_cms_texts");
      localStorage.removeItem("ss_cms_faqs");
      localStorage.removeItem("ss_local_bookings");
      localStorage.removeItem("ss_local_blocked_dates");
      window.location.reload();
    }
  };

  // Filter logic
  const activeBookings = Array.isArray(bookings) ? bookings : [];
  const filteredBookings = activeBookings.filter((b) => {
    const matchesSearch =
      b.customer_name?.toLowerCase().includes(bookingSearch.toLowerCase()) ||
      b.phone?.includes(bookingSearch) ||
      b.order_ref?.toLowerCase().includes(bookingSearch.toLowerCase());
    const matchesStatus = statusFilter === "all" || b.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const activeBlockedDays = Array.isArray(blockedDays) ? blockedDays : [];

  if (!isAuthenticated) {
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
            <p className="text-xs text-white/50">Enter password to manage bookings, zones, rates, and images.</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-4">
            <input
              type="password"
              placeholder="Enter passphrase"
              value={passphrase}
              onChange={(e) => setPassphrase(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-white/30 outline-none focus:ring-2 focus:ring-teal/50 text-center"
            />
            {authError && <p className="text-xs text-royal font-bold">Incorrect Passphrase. Try again.</p>}
            <button
              type="submit"
              className="w-full rounded-xl bg-gradient-to-r from-teal via-royal to-gold py-3 text-xs font-bold uppercase tracking-wider text-white shadow-lift hover:shadow-glow transition-all"
            >
              Unlock Dashboard
            </button>
          </form>
        </SpotlightCard>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Header />
      <main className="flex-1 pt-28 pb-16 px-6">
        <div className="max-w-6xl mx-auto space-y-8">
          
          {/* Header Controls */}
          <div className="flex flex-wrap justify-between items-center gap-4 bg-card border border-border p-6 rounded-2xl shadow-soft">
            <div>
              <h1 className="text-2xl font-black text-foreground flex items-center gap-2">
                <Unlock size={22} className="text-teal" /> SpinShine Control Panel
              </h1>
              <p className="text-xs text-muted-foreground mt-1 flex items-center gap-2">
                <span>Manage database objects, dynamic pricing rates, and editorial content.</span>
                {isLocalStorageMode && (
                  <span className="bg-amber-100 border border-amber-300 text-amber-800 px-2 py-0.5 rounded text-[10px] font-bold uppercase">
                    Local Storage Mode
                  </span>
                )}
              </p>
            </div>
            <div className="flex gap-3">
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
                onClick={handleSaveCMS}
                className="flex items-center gap-2 rounded-full bg-navy text-white px-5 py-2 text-xs font-bold uppercase tracking-wider hover:bg-royal hover:shadow-glow transition-all"
              >
                <Save size={14} /> Save Config
              </button>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex flex-wrap gap-2 border-b border-border pb-px overflow-x-auto">
            {([
              { k: "bookings", l: "Bookings", i: <Clock size={14} /> },
              { k: "blocked", l: "Blocked Dates", i: <Calendar size={14} /> },
              { k: "services", l: "Services & Rates", i: <DollarSign size={14} /> },
              { k: "coverage", l: "Localities & Radius", i: <MapPin size={14} /> },
              { k: "texts", l: "CMS Texts", i: <Settings size={14} /> },
              { k: "images", l: "CMS Images", i: <ImageIcon size={14} /> },
              { k: "faqs", l: "CMS FAQs", i: <MessageSquare size={14} /> },
            ] as const).map((tab) => (
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

          {/* Tab 1: Bookings Content */}
          {activeTab === "bookings" && (
            <div className="space-y-8 animate-fade-in">
              <div className="grid gap-6 md:grid-cols-[1.5fr_1fr] items-start">
                
                {/* Bookings List */}
                <div className="space-y-4">
                  <div className="flex flex-wrap gap-3 items-center justify-between">
                    <h2 className="text-lg font-bold text-foreground">Active Customer Orders ({filteredBookings.length})</h2>
                    <div className="flex gap-2">
                      <div className="relative">
                        <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                        <input
                          type="text"
                          placeholder="Search reference/name..."
                          value={bookingSearch}
                          onChange={(e) => setBookingSearch(e.target.value)}
                          className="pl-9 pr-4 py-2 rounded-full border border-border bg-card text-xs font-semibold outline-none focus:ring-1 focus:ring-ring"
                        />
                      </div>
                      <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="px-4 py-2 rounded-full border border-border bg-card text-xs font-semibold outline-none"
                      >
                        <option value="all">All Statuses</option>
                        <option value="confirmed">Confirmed</option>
                        <option value="collected">Collected</option>
                        <option value="cleaning">Cleaning</option>
                        <option value="drying">Drying</option>
                        <option value="quality_check">Quality Check</option>
                        <option value="out_for_delivery">Out for Delivery</option>
                        <option value="delivered">Delivered</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </div>
                  </div>

                  {loadingDb ? (
                    <div className="text-center py-12 text-xs text-muted-foreground">Loading database bookings...</div>
                  ) : filteredBookings.length === 0 ? (
                    <div className="text-center py-12 border border-dashed border-border rounded-2xl text-xs text-muted-foreground">
                      No matching bookings found.
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {filteredBookings.map((b) => (
                        <div key={b.id} className="bg-card border border-border p-5 rounded-2xl shadow-soft flex flex-wrap justify-between items-center gap-4 hover:border-royal/20 transition-all">
                          <div className="space-y-1">
                            <span className="text-[10px] font-extrabold bg-secondary text-foreground px-2.5 py-0.5 rounded-full uppercase tracking-wider">{b.order_ref}</span>
                            <h3 className="font-bold text-foreground text-sm">{b.customer_name} · <span className="text-muted-foreground text-xs">{b.phone}</span></h3>
                            <p className="text-xs text-muted-foreground leading-relaxed max-w-md">
                              {(b.service || "").toUpperCase()} ({b.mode}) · {b.pickup_date} {b.pickup_slot} · <strong>₹{b.estimated_price}</strong>
                            </p>
                            {b.address && <p className="text-[10px] text-muted-foreground font-semibold">Address: {b.address}</p>}
                          </div>
                          <div>
                            <select
                              value={b.status}
                              onChange={(e) => handleStatusChange(b.id, e.target.value)}
                              className="rounded-lg border border-border bg-background px-3 py-1.5 text-xs font-bold outline-none"
                            >
                              <option value="confirmed">Confirmed</option>
                              <option value="collected">Collected</option>
                              <option value="cleaning">Cleaning</option>
                              <option value="drying">Drying</option>
                              <option value="quality_check">Quality Check</option>
                              <option value="out_for_delivery">Out for Delivery</option>
                              <option value="delivered">Delivered</option>
                              <option value="cancelled">Cancelled</option>
                            </select>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Manual Booking Form */}
                <div className="bg-card border border-border p-6 rounded-2xl shadow-soft space-y-4">
                  <h2 className="text-sm font-extrabold uppercase tracking-widest text-foreground">Create Manual Booking</h2>
                  <form onSubmit={handleCreateBooking} className="space-y-3.5">
                    <div>
                      <label className="block text-[9px] font-bold text-muted-foreground uppercase">Customer Name</label>
                      <input
                        type="text"
                        value={mbName}
                        onChange={(e) => setMbName(e.target.value)}
                        className="w-full mt-1 p-2.5 rounded-lg border border-border text-xs font-semibold bg-background"
                        placeholder="John Doe"
                      />
                    </div>
                    <div>
                      <label className="block text-[9px] font-bold text-muted-foreground uppercase">Phone Number</label>
                      <input
                        type="text"
                        value={mbPhone}
                        onChange={(e) => setMbPhone(e.target.value)}
                        className="w-full mt-1 p-2.5 rounded-lg border border-border text-xs font-semibold bg-background"
                        placeholder="e.g. +91 99999 99999"
                      />
                    </div>
                    <div>
                      <label className="block text-[9px] font-bold text-muted-foreground uppercase">Email Address (Optional)</label>
                      <input
                        type="email"
                        value={mbEmail}
                        onChange={(e) => setMbEmail(e.target.value)}
                        className="w-full mt-1 p-2.5 rounded-lg border border-border text-xs font-semibold bg-background"
                      />
                    </div>
                    <div>
                      <label className="block text-[9px] font-bold text-muted-foreground uppercase">Address</label>
                      <textarea
                        value={mbAddress}
                        onChange={(e) => setMbAddress(e.target.value)}
                        className="w-full mt-1 p-2.5 rounded-lg border border-border text-xs font-semibold bg-background"
                        rows={2}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[9px] font-bold text-muted-foreground uppercase">Service</label>
                        <select
                          value={mbService}
                          onChange={(e) => setMbService(e.target.value)}
                          className="w-full mt-1 p-2.5 rounded-lg border border-border text-xs font-semibold bg-background"
                        >
                          {services.map((s) => (
                            <option key={s.key} value={s.key}>{s.name}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-[9px] font-bold text-muted-foreground uppercase">Quantity</label>
                        <input
                          type="number"
                          min="1"
                          value={mbQty}
                          onChange={(e) => setMbQty(parseInt(e.target.value) || 1)}
                          className="w-full mt-1 p-2.5 rounded-lg border border-border text-xs font-semibold bg-background"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[9px] font-bold text-muted-foreground uppercase">Mode</label>
                        <select
                          value={mbMode}
                          onChange={(e) => setMbMode(e.target.value)}
                          className="w-full mt-1 p-2.5 rounded-lg border border-border text-xs font-semibold bg-background"
                        >
                          <option value="pickup">Pickup</option>
                          <option value="onsite">On-site</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-[9px] font-bold text-muted-foreground uppercase">Pickup Date</label>
                        <input
                          type="date"
                          value={mbDate}
                          onChange={(e) => setMbDate(e.target.value)}
                          className="w-full mt-1 p-2.5 rounded-lg border border-border text-xs font-semibold bg-background"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-[9px] font-bold text-muted-foreground uppercase">Pickup Slot</label>
                      <select
                        value={mbSlot}
                        onChange={(e) => setMbSlot(e.target.value)}
                        className="w-full mt-1 p-2.5 rounded-lg border border-border text-xs font-semibold bg-background"
                      >
                        <option value="8:00 – 10:00 AM">8:00 – 10:00 AM</option>
                        <option value="10:00 – 12:00 PM">10:00 – 12:00 PM</option>
                        <option value="12:00 – 2:00 PM">12:00 – 2:00 PM</option>
                        <option value="2:00 – 4:00 PM">2:00 – 4:00 PM</option>
                        <option value="4:00 – 6:00 PM">4:00 – 6:00 PM</option>
                        <option value="6:00 – 8:00 PM">6:00 – 8:00 PM</option>
                      </select>
                    </div>
                    <button
                      type="submit"
                      className="w-full rounded-xl bg-navy text-white py-3 text-xs font-bold uppercase tracking-wider hover:bg-royal hover:shadow-glow transition-all"
                    >
                      Insert Order
                    </button>
                  </form>
                </div>

              </div>
            </div>
          )}

          {/* Tab 2: Blocked Dates Content */}
          {activeTab === "blocked" && (
            <div className="grid gap-6 md:grid-cols-[1.5fr_1fr] items-start animate-fade-in">
              <div className="space-y-4">
                <h2 className="text-lg font-bold text-foreground">Active Blocked Dates ({activeBlockedDays.length})</h2>
                {activeBlockedDays.length === 0 ? (
                  <div className="text-center py-12 border border-dashed border-border rounded-2xl text-xs text-muted-foreground bg-card">
                    No dates are blocked.
                  </div>
                ) : (
                  <div className="grid gap-4 sm:grid-cols-2">
                    {activeBlockedDays.map((d) => (
                      <div key={d.id} className="bg-card border border-border p-5 rounded-2xl shadow-soft flex justify-between items-center gap-3">
                        <div>
                          <strong className="text-sm font-bold text-foreground">{d.blocked_on}</strong>
                          <p className="text-xs text-muted-foreground mt-0.5">{d.reason || "No reason specified"}</p>
                        </div>
                        <button
                          onClick={() => handleDeleteBlockedDate(d.id)}
                          className="p-2 rounded-lg hover:bg-royal/10 text-royal transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="bg-card border border-border p-6 rounded-2xl shadow-soft space-y-4">
                <h2 className="text-sm font-extrabold uppercase tracking-widest text-foreground">Block a Date</h2>
                <form onSubmit={handleAddBlockedDate} className="space-y-4">
                  <div>
                    <label className="block text-[9px] font-bold text-muted-foreground uppercase">Select Date</label>
                    <input
                      type="date"
                      value={newBlockDate}
                      onChange={(e) => setNewBlockDate(e.target.value)}
                      className="w-full mt-1 p-2.5 rounded-lg border border-border text-xs font-semibold bg-background"
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] font-bold text-muted-foreground uppercase">Block Reason (Optional)</label>
                    <input
                      type="text"
                      value={newBlockReason}
                      onChange={(e) => setNewBlockReason(e.target.value)}
                      className="w-full mt-1 p-2.5 rounded-lg border border-border text-xs font-semibold bg-background"
                      placeholder="e.g. System Maintenance"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full rounded-xl bg-navy text-white py-3 text-xs font-bold uppercase tracking-wider hover:bg-royal hover:shadow-glow transition-all"
                  >
                    Confirm Date Block
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* Tab 3: Services & Rates Content */}
          {activeTab === "services" && (
            <div className="grid gap-6 md:grid-cols-[1.5fr_1fr] items-start animate-fade-in">
              <div className="space-y-4">
                <h2 className="text-lg font-bold text-foreground">Active Services Directory</h2>
                <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-soft">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-secondary/50 text-[10px] font-bold uppercase text-muted-foreground border-b border-border">
                      <tr>
                        <th className="px-6 py-4">Key</th>
                        <th className="px-6 py-4">Name</th>
                        <th className="px-6 py-4">Unit</th>
                        <th className="px-6 py-4">Rate (₹)</th>
                        <th className="px-6 py-4">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border text-foreground">
                      {services.map((s, idx) => (
                        <tr key={s.key}>
                          <td className="px-6 py-4 text-xs font-mono">{s.key}</td>
                          <td className="px-6 py-4">
                            <input
                              type="text"
                              value={s.name}
                              onChange={(e) => {
                                const copy = [...services];
                                copy[idx].name = e.target.value;
                                setServices(copy);
                              }}
                              className="border border-transparent hover:border-border px-2 py-1 rounded w-full font-bold bg-background"
                            />
                          </td>
                          <td className="px-6 py-4 text-xs">
                            <input
                              type="text"
                              value={s.unit}
                              onChange={(e) => {
                                const copy = [...services];
                                copy[idx].unit = e.target.value;
                                setServices(copy);
                              }}
                              className="border border-transparent hover:border-border px-2 py-1 rounded w-full font-semibold bg-background"
                            />
                          </td>
                          <td className="px-6 py-4 font-display font-extrabold text-royal">
                            <input
                              type="number"
                              value={s.rate}
                              onChange={(e) => {
                                const copy = [...services];
                                copy[idx].rate = parseInt(e.target.value) || 0;
                                setServices(copy);
                              }}
                              className="border border-transparent hover:border-border px-2 py-1 rounded w-20 font-bold bg-background"
                            />
                          </td>
                          <td className="px-6 py-4 text-center">
                            <button
                              onClick={() => {
                                const copy = services.filter((_, filterIdx) => filterIdx !== idx);
                                setServices(copy);
                              }}
                              className="p-1 text-royal hover:text-royal/80"
                            >
                              <Trash2 size={14} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="bg-card border border-border p-6 rounded-2xl shadow-soft space-y-4">
                <h2 className="text-sm font-extrabold uppercase tracking-widest text-foreground">Add New Service Profile</h2>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (!newServiceKey || !newServiceName) return;
                    setServices([
                      ...services,
                      {
                        key: newServiceKey,
                        name: newServiceName,
                        unit: newServiceUnit,
                        rate: newServiceRate,
                        desc: newServiceDesc,
                      },
                    ]);
                    setNewServiceKey("");
                    setNewServiceName("");
                    setNewServiceDesc("");
                  }}
                  className="space-y-4"
                >
                  <div>
                    <label className="block text-[9px] font-bold text-muted-foreground uppercase">Unique Key</label>
                    <input
                      type="text"
                      value={newServiceKey}
                      onChange={(e) => setNewServiceKey(e.target.value)}
                      className="w-full mt-1 p-2.5 rounded-lg border border-border text-xs font-semibold bg-background"
                      placeholder="e.g. upholstery"
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] font-bold text-muted-foreground uppercase">Service Name</label>
                    <input
                      type="text"
                      value={newServiceName}
                      onChange={(e) => setNewServiceName(e.target.value)}
                      className="w-full mt-1 p-2.5 rounded-lg border border-border text-xs font-semibold bg-background"
                      placeholder="e.g. Upholstery Extraction"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[9px] font-bold text-muted-foreground uppercase">Unit</label>
                      <input
                        type="text"
                        value={newServiceUnit}
                        onChange={(e) => setNewServiceUnit(e.target.value)}
                        className="w-full mt-1 p-2.5 rounded-lg border border-border text-xs font-semibold bg-background"
                      />
                    </div>
                    <div>
                      <label className="block text-[9px] font-bold text-muted-foreground uppercase">Rate (₹)</label>
                      <input
                        type="number"
                        value={newServiceRate}
                        onChange={(e) => setNewServiceRate(parseInt(e.target.value) || 0)}
                        className="w-full mt-1 p-2.5 rounded-lg border border-border text-xs font-semibold bg-background"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[9px] font-bold text-muted-foreground uppercase">Description</label>
                    <input
                      type="text"
                      value={newServiceDesc}
                      onChange={(e) => setNewServiceDesc(e.target.value)}
                      className="w-full mt-1 p-2.5 rounded-lg border border-border text-xs font-semibold bg-background"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full rounded-xl bg-navy text-white py-3 text-xs font-bold uppercase tracking-wider hover:bg-royal hover:shadow-glow transition-all"
                  >
                    Add Service Profile
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* Tab 4: Coverage Content */}
          {activeTab === "coverage" && (
            <div className="grid gap-6 md:grid-cols-[1.5fr_1fr] items-start animate-fade-in">
              <div className="space-y-6">
                <div>
                  <h2 className="text-lg font-bold text-foreground">Delivery Boundaries</h2>
                  <div className="bg-card border border-border p-6 rounded-2xl mt-3 space-y-4">
                    <div className="flex justify-between items-center">
                      <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Pickup & Return Radius Limit</label>
                      <span className="font-display text-lg font-black text-royal">{radiusKm} km</span>
                    </div>
                    <input
                      type="range"
                      min="5"
                      max="60"
                      value={radiusKm}
                      onChange={(e) => setRadiusKm(parseInt(e.target.value))}
                      className="w-full h-1 bg-border rounded-lg appearance-none cursor-pointer accent-royal"
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <h2 className="text-sm font-bold text-foreground uppercase tracking-wider">Locality List Directory</h2>
                  <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-soft">
                    <table className="w-full text-left text-sm">
                      <thead className="bg-secondary/50 text-[10px] font-bold uppercase text-muted-foreground border-b border-border">
                        <tr>
                          <th className="px-6 py-4">Locality Name</th>
                          <th className="px-6 py-4">Distance (km)</th>
                          <th className="px-6 py-4">Status</th>
                          <th className="px-6 py-4 text-center">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border text-foreground">
                        {localities.map((locItem, idx) => (
                          <tr key={locItem.name}>
                            <td className="px-6 py-4 font-semibold">{locItem.name}</td>
                            <td className="px-6 py-4">
                              <input
                                type="number"
                                value={locItem.km}
                                onChange={(e) => {
                                  const copy = [...localities];
                                  copy[idx].km = parseInt(e.target.value) || 0;
                                  setLocalities(copy);
                                }}
                                className="border border-transparent hover:border-border px-2 py-1 rounded w-20 font-bold bg-background"
                              />
                            </td>
                            <td className="px-6 py-4">
                              <span
                                className={`rounded-full px-3 py-1 text-[9px] font-extrabold uppercase tracking-wider ${
                                  locItem.km <= radiusKm ? "bg-teal/10 text-teal-700" : "bg-royal/10 text-royal"
                                }`}
                              >
                                {locItem.km <= radiusKm ? "Full Coverage" : "On-site Only"}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-center">
                              <button
                                onClick={() => {
                                  const copy = localities.filter((_, filterIdx) => filterIdx !== idx);
                                  setLocalities(copy);
                                }}
                                className="p-1 text-royal hover:text-royal/80"
                              >
                                <Trash2 size={14} />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              <div className="bg-card border border-border p-6 rounded-2xl shadow-soft space-y-4">
                <h2 className="text-sm font-extrabold uppercase tracking-widest text-foreground">Add Locality Zone</h2>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (!newLocalityName) return;
                    setLocalities([...localities, { name: newLocalityName, km: newLocalityKm }]);
                    setNewLocalityName("");
                    setNewLocalityKm(10);
                  }}
                  className="space-y-4"
                >
                  <div>
                    <label className="block text-[9px] font-bold text-muted-foreground uppercase">Locality Name</label>
                    <input
                      type="text"
                      value={newLocalityName}
                      onChange={(e) => setNewLocalityName(e.target.value)}
                      className="w-full mt-1 p-2.5 rounded-lg border border-border text-xs font-semibold bg-background"
                      placeholder="e.g. Outer Ring Road"
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] font-bold text-muted-foreground uppercase">Distance from Hub (km)</label>
                    <input
                      type="number"
                      value={newLocalityKm}
                      onChange={(e) => setNewLocalityKm(parseInt(e.target.value) || 0)}
                      className="w-full mt-1 p-2.5 rounded-lg border border-border text-xs font-semibold bg-background"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full rounded-xl bg-navy text-white py-3 text-xs font-bold uppercase tracking-wider hover:bg-royal hover:shadow-glow transition-all"
                  >
                    Add Area Profile
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* Tab 5: Texts Content */}
          {activeTab === "texts" && (
            <div className="bg-card border border-border p-8 rounded-2xl shadow-soft space-y-6 animate-fade-in">
              <h2 className="text-lg font-bold text-foreground">Homepage Editorial Texts</h2>
              
              <div className="grid gap-6 sm:grid-cols-2">
                <div>
                  <label className="block text-[10px] font-bold text-muted-foreground uppercase">Hero Title Heading</label>
                  <input
                    type="text"
                    value={cmsTexts.heroHeading}
                    onChange={(e) => setCmsTexts({ ...cmsTexts, heroHeading: e.target.value })}
                    className="w-full mt-1.5 p-3 rounded-xl border border-border text-xs font-bold bg-background"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-muted-foreground uppercase">Hero Subtitle</label>
                  <input
                    type="text"
                    value={cmsTexts.heroSubheading}
                    onChange={(e) => setCmsTexts({ ...cmsTexts, heroSubheading: e.target.value })}
                    className="w-full mt-1.5 p-3 rounded-xl border border-border text-xs font-bold bg-background"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-muted-foreground uppercase">Hero Italic Highlight</label>
                  <input
                    type="text"
                    value={cmsTexts.heroItalic}
                    onChange={(e) => setCmsTexts({ ...cmsTexts, heroItalic: e.target.value })}
                    className="w-full mt-1.5 p-3 rounded-xl border border-border text-xs font-bold bg-background"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-muted-foreground uppercase">Live Slot Label</label>
                  <input
                    type="text"
                    value={cmsTexts.availabilityLabel}
                    onChange={(e) => setCmsTexts({ ...cmsTexts, availabilityLabel: e.target.value })}
                    className="w-full mt-1.5 p-3 rounded-xl border border-border text-xs font-bold bg-background"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-[10px] font-bold text-muted-foreground uppercase">Live Slot Value</label>
                  <input
                    type="text"
                    value={cmsTexts.availabilityValue}
                    onChange={(e) => setCmsTexts({ ...cmsTexts, availabilityValue: e.target.value })}
                    className="w-full mt-1.5 p-3 rounded-xl border border-border text-xs font-bold bg-background"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-[10px] font-bold text-muted-foreground uppercase">Hero Description Paragraph</label>
                  <textarea
                    value={cmsTexts.heroDesc}
                    onChange={(e) => setCmsTexts({ ...cmsTexts, heroDesc: e.target.value })}
                    className="w-full mt-1.5 p-3 rounded-xl border border-border text-xs font-semibold bg-background"
                    rows={3}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Tab 6: Images Content */}
          {activeTab === "images" && (
            <div className="bg-card border border-border p-8 rounded-2xl shadow-soft space-y-6 animate-fade-in">
              <h2 className="text-lg font-bold text-foreground">CMS Image Configurations</h2>
              
              <div className="grid gap-6 md:grid-cols-2">
                {Object.keys(cmsImages).map((key) => {
                  const val = cmsImages[key as keyof typeof cmsImages];
                  return (
                    <div key={key} className="p-4 rounded-xl border border-border bg-background space-y-3">
                      <div className="flex justify-between items-center">
                        <label className="text-[10px] font-extrabold uppercase tracking-widest text-muted-foreground">{key} Image URL</label>
                        <span className="text-[9px] text-teal uppercase font-bold">dynamic asset</span>
                      </div>
                      <input
                        type="text"
                        value={val}
                        onChange={(e) => setCmsImages({ ...cmsImages, [key]: e.target.value })}
                        className="w-full p-2.5 rounded-lg border border-border text-xs font-semibold bg-background"
                      />
                      <div className="aspect-[16/9] w-full overflow-hidden rounded-lg border border-border/80">
                        <img src={val} alt={key} className="h-full w-full object-cover" />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Tab 7: FAQs Content */}
          {activeTab === "faqs" && (
            <div className="space-y-6 animate-fade-in">
              <h2 className="text-lg font-bold text-foreground">FAQ Categories & Questions</h2>
              
              {cmsFaqs.map((cat, catIdx) => (
                <div key={cat.id} className="bg-card border border-border p-6 rounded-2xl shadow-soft space-y-4">
                  <div className="flex justify-between items-center border-b border-border pb-3">
                    <h3 className="font-extrabold text-foreground text-sm flex items-center gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-teal" />
                      {cat.label}
                    </h3>
                    <button
                      onClick={() => {
                        const copy = [...cmsFaqs];
                        const targetCat = copy[catIdx];
                        if (targetCat) {
                          targetCat.questions.push({ q: "New Question Title?", a: "New Answer text here..." });
                          setCmsFaqs(copy);
                        }
                      }}
                      className="flex items-center gap-1 text-[10px] font-extrabold text-teal uppercase tracking-widest bg-teal/5 border border-teal/10 px-3 py-1 rounded-full hover:bg-teal/10"
                    >
                      <Plus size={12} /> Add Q&A
                    </button>
                  </div>

                  <div className="space-y-4">
                    {cat.questions.map((qItem, qIdx) => (
                      <div key={qIdx} className="p-4 rounded-xl border border-border bg-background space-y-3 relative group">
                        <button
                          onClick={() => {
                            const copy = [...cmsFaqs];
                            const targetCat = copy[catIdx];
                            if (targetCat) {
                              targetCat.questions = targetCat.questions.filter((_, qFilterIdx) => qFilterIdx !== qIdx);
                              setCmsFaqs(copy);
                            }
                          }}
                          className="absolute top-4 right-4 text-royal opacity-50 hover:opacity-100 transition-opacity"
                        >
                          <Trash2 size={14} />
                        </button>
                        <div className="pr-8">
                          <label className="block text-[9px] font-bold text-muted-foreground uppercase">Question</label>
                          <input
                            type="text"
                            value={qItem.q}
                            onChange={(e) => {
                              const copy = [...cmsFaqs];
                              const targetCat = copy[catIdx];
                              const targetQ = targetCat?.questions[qIdx];
                              if (targetQ) {
                                targetQ.q = e.target.value;
                                setCmsFaqs(copy);
                              }
                            }}
                            className="w-full mt-1.5 p-2 rounded border border-border text-xs font-bold bg-background"
                          />
                        </div>
                        <div>
                          <label className="block text-[9px] font-bold text-muted-foreground uppercase">Answer</label>
                          <textarea
                            value={qItem.a}
                            onChange={(e) => {
                              const copy = [...cmsFaqs];
                              const targetCat = copy[catIdx];
                              const targetQ = targetCat?.questions[qIdx];
                              if (targetQ) {
                                targetQ.a = e.target.value;
                                setCmsFaqs(copy);
                              }
                            }}
                            className="w-full mt-1.5 p-2 rounded border border-border text-xs font-semibold bg-background"
                            rows={3}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

        </div>
      </main>
      <Footer />
    </div>
  );
}
