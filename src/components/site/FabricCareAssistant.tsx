import { useState, useRef, useEffect } from "react";
import { MessageSquare, X, Send, Sparkles } from "lucide-react";

interface Message {
  sender: "user" | "bot";
  text: string;
  timestamp: Date;
}

const PRESETS = [
  { label: "Can silk curtains be cleaned?", q: "Can silk curtains be cleaned?" },
  { label: "How long does it take?", q: "How long will the cleaning take?" },
  { label: "What is on-site cleaning?", q: "Which services are done on-site vs pickup?" },
  { label: "Do you clean leather sofas?", q: "Can you clean leather or premium upholstery?" },
];

export function FabricCareAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      sender: "bot",
      text: "Hello! I am your SpinShine Fabric Care Assistant. How can I help you care for your premium home fabrics today?",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const feedRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (feedRef.current) {
      feedRef.current.scrollTop = feedRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleSend = (text: string) => {
    if (!text.trim()) return;

    const newMsg: Message = { sender: "user", text, timestamp: new Date() };
    setMessages((prev) => [...prev, newMsg]);
    setInput("");
    setIsTyping(true);

    // Simulate AI thinking and replying
    setTimeout(() => {
      const response = getAiResponse(text);
      setMessages((prev) => [
        ...prev,
        { sender: "bot", text: response, timestamp: new Date() },
      ]);
      setIsTyping(false);
    }, 800);
  };

  const getAiResponse = (query: string): string => {
    const q = query.toLowerCase();

    if (q.includes("silk") || q.includes("curtain")) {
      return "Yes, absolutely! We specialize in premium curtain care, including delicate fabrics like silk, velvet, linen, and sheer lace. Depending on the material, we utilize low-moisture dry extraction or eco-friendly fabric conditioners to prevent shrinkage or color bleeding. Curtains are carefully unhung by our technicians, cleaned, and rehung with precision.";
    }
    if (q.includes("time") || q.includes("how long") || q.includes("duration") || q.includes("day")) {
      return "Our standard turnaround time is 3 to 4 days for off-site services (like curtains and blankets) to ensure thorough multi-stage drying and UV-C sanitization. On-site services (such as sofa, carpet, and mattress cleaning) are completed on-site in about 2 to 4 hours, drying within 6 to 12 hours under normal ventilation.";
    }
    if (q.includes("on-site") || q.includes("onsite") || q.includes("pickup") || q.includes("where")) {
      return "We offer both modes! On-site cleaning is perfect for heavy items like sofas, mattresses, and wall-to-wall carpets. For curtains, blankets, and loose carpets, we offer hassle-free pickup and delivery. Our team handles the unhooking and rehanging of curtains completely.";
    }
    if (q.includes("leather") || q.includes("upholstery") || q.includes("sofa")) {
      return "We clean all kinds of upholstery, including fabric, suede, leatherette, and premium leather. For leather, we apply specialized cleaners followed by premium moisturizers/conditioners to restore the natural shine and protect the material from cracking.";
    }
    if (q.includes("price") || q.includes("cost") || q.includes("rate") || q.includes("charge")) {
      return "Our pricing is transparent and calculated per unit (e.g., per seat for sofas, per sq. ft. for carpets, or per piece for curtains/blankets). You can get an instant estimate on our 'Pricing' tab or proceed to 'Book' to configure your service and view the final rate before confirming.";
    }
    if (q.includes("yelahanka") || q.includes("where") || q.includes("radius") || q.includes("area") || q.includes("bangalore")) {
      return "We serve all major areas of Bangalore! Our pickup service covers a 30 km radius from our central care unit (including Whitefield, HSR, Koramangala, Indiranagar, Yelahanka, Hebbal, JP Nagar, RR Nagar, and more). If you are outside the radius, on-site service remains fully available.";
    }
    if (q.includes("eco") || q.includes("chemical") || q.includes("safe") || q.includes("child")) {
      return "Your family's safety is our priority. We exclusively use certified eco-friendly, biodegradable, and non-toxic cleaning agents. They are completely safe for children, pets, and individuals with respiratory sensitivities while delivering professional-grade cleaning results.";
    }

    return "SpinShine is Bangalore's premium fabric care leader. We offer professional unhooking, eco-friendly deep cleaning, sanitization, and delivery. Could you please specify which service (Curtains, Carpet, Sofa, Mattress, or Blanket) you would like to know more about?";
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 font-sans">
      {/* Floating Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-2 rounded-full bg-gradient-to-r from-teal to-royal p-4 text-white shadow-glow hover:scale-105 active:scale-95 transition-all duration-300 group"
          aria-label="Open Fabric Care Assistant"
        >
          <MessageSquare className="h-6 w-6" />
          <span className="max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-500 ease-out whitespace-nowrap font-bold text-xs uppercase tracking-wider pr-1">
            Fabric Care AI
          </span>
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="w-[360px] sm:w-[380px] h-[500px] rounded-3xl border border-border/80 bg-card/95 backdrop-blur-md shadow-lift flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-6 duration-300">
          {/* Header */}
          <div className="bg-gradient-to-r from-navy to-royal px-5 py-4 flex items-center justify-between text-white border-b border-border/10">
            <div className="flex items-center gap-2">
              <div className="bg-teal/20 p-1.5 rounded-xl border border-teal/30">
                <Sparkles className="h-4 w-4 text-teal" />
              </div>
              <div>
                <h3 className="font-extrabold text-sm tracking-tight font-display">Fabric Care AI</h3>
                <p className="text-[10px] text-teal/80 font-bold uppercase tracking-wider">Online Assistant</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 rounded-full hover:bg-white/10 transition-colors"
              aria-label="Close Assistant"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Messages Feed */}
          <div
            ref={feedRef}
            className="flex-1 p-5 overflow-y-auto space-y-4 scroll-smooth bg-secondary/20"
          >
            {messages.map((m, idx) => (
              <div
                key={idx}
                className={`flex flex-col ${
                  m.sender === "user" ? "items-end" : "items-start"
                }`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-3 text-xs leading-relaxed ${
                    m.sender === "user"
                      ? "bg-royal text-white rounded-tr-none shadow-soft"
                      : "bg-background text-foreground border border-border rounded-tl-none shadow-sm"
                  }`}
                >
                  {m.text}
                </div>
                <span className="text-[8px] text-muted-foreground mt-1 px-1">
                  {m.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </span>
              </div>
            ))}

            {isTyping && (
              <div className="flex items-center gap-1.5 bg-background border border-border px-4 py-3 rounded-2xl rounded-tl-none w-20 shadow-sm">
                <span className="h-1.5 w-1.5 bg-muted-foreground/60 rounded-full animate-bounce" />
                <span className="h-1.5 w-1.5 bg-muted-foreground/60 rounded-full animate-bounce [animation-delay:0.2s]" />
                <span className="h-1.5 w-1.5 bg-muted-foreground/60 rounded-full animate-bounce [animation-delay:0.4s]" />
              </div>
            )}
          </div>

          {/* Quick-reply presets */}
          {messages.length === 1 && (
            <div className="px-5 py-3 border-t border-border/50 bg-secondary/10 flex flex-wrap gap-1.5">
              {PRESETS.map((p, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSend(p.q)}
                  className="text-[10px] font-semibold text-muted-foreground bg-background hover:bg-royal hover:text-white hover:border-royal border border-border px-3 py-1.5 rounded-full transition-all duration-200"
                >
                  {p.label}
                </button>
              ))}
            </div>
          )}

          {/* Footer Input */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend(input);
            }}
            className="p-4 bg-background border-t border-border/80 flex items-center gap-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about silk, turnaround, Yelahanka..."
              className="flex-1 bg-secondary/35 border border-border/60 rounded-xl px-4 py-2.5 text-xs text-foreground placeholder:text-muted-foreground outline-none focus:border-royal transition-all"
            />
            <button
              type="submit"
              className="p-2.5 bg-royal hover:bg-navy text-white rounded-xl transition-colors shadow-soft"
              aria-label="Send query"
            >
              <Send className="h-4.5 w-4.5" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
