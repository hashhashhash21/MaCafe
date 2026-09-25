"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createClient, AnamEvent, type AnamClient, type Message } from "@anam-ai/js-sdk";
import { Coffee, Globe2, LoaderCircle, Mic, Minus, Plus, Send, ShoppingBag, Sparkles, Trash2, X, Printer, Package, History } from "lucide-react";

type MenuItem = { id: number; image: string; name: string; ar: string; price: number; calories: number; category: string; note: string; badge?: string; largePrice?: number; doublePrice?: number };
type CartMeta = { size: "regular" | "large" | "double"; milk: "regular" | "oat" | "almond" | "none"; unitPrice: number };

const menu: MenuItem[] = [
  {"id": 1, "largePrice": 16, "image": "/products/hot-spanish-latte.webp", "name": "Hot Spanish Latte", "ar": "سبانش لاتيه حار", "price": 14, "calories": 0, "category": "Hot Beverages", "note": "Sweet espresso, condensed milk and steamed milk.", "badge": "Signature"},
  {"id": 2, "image": "/products/iced-spanish-latte.webp", "name": "Iced Spanish Latte", "ar": "سبانش لاتيه مثلج", "price": 15, "calories": 0, "category": "Cold Beverages", "note": "Sweet espresso and creamy milk served over ice.", "badge": "Popular"},
  {"id": 3, "largePrice": 12, "image": "/products/cappuccino.webp", "name": "Cappuccino", "ar": "كابتشينو", "price": 10, "calories": 0, "category": "Hot Beverages", "note": "Espresso with steamed milk and a thick layer of foam.", "badge": "Classic"},
  {"id": 4, "image": "/products/americano.webp", "name": "Americano", "ar": "أمريكانو", "price": 10, "calories": 0, "category": "Hot Beverages", "note": "Espresso lengthened with hot water for a clean bold cup."},
  {"id": 5, "largePrice": 12, "image": "/products/latte.webp", "name": "Latte", "ar": "لاتيه", "price": 10, "calories": 0, "category": "Hot Beverages", "note": "Espresso with smooth steamed milk."},
  {"id": 6, "largePrice": 15, "image": "/products/hot-chocolate.webp", "name": "Hot Chocolate", "ar": "شوكولاتة ساخنة", "price": 13, "calories": 0, "category": "Hot Beverages", "note": "Rich chocolate blended with hot milk."},
  {"id": 7, "largePrice": 15, "image": "/products/mocha.webp", "name": "Mocha", "ar": "موكا", "price": 13, "calories": 0, "category": "Hot Beverages", "note": "Espresso, chocolate and steamed milk."},
  {"id": 8, "doublePrice": 10, "image": "/products/espresso.webp", "name": "Espresso", "ar": "إسبريسو", "price": 7, "calories": 0, "category": "Hot Beverages", "note": "A concentrated shot of espresso.", "badge": "Classic"},
  {"id": 9, "image": "/products/green-tea.webp", "name": "Premium Dilmah Green Tea", "ar": "شاي ديلما أخضر فاخر", "price": 7, "calories": 0, "category": "Hot Beverages", "note": "Premium green tea served hot."},
  {"id": 10, "image": "/products/black-tea.webp", "name": "Premium Dilmah Black Tea", "ar": "شاي ديلما أسود فاخر", "price": 7, "calories": 0, "category": "Hot Beverages", "note": "Premium black tea served hot."},
  {"id": 11, "largePrice": 16, "image": "/products/caramel-macchiato.webp", "name": "Caramel Macchiato", "ar": "كراميل ماكياتو", "price": 14, "calories": 0, "category": "Hot Beverages", "note": "Espresso and steamed milk finished with caramel.", "badge": "Popular"},
  {"id": 12, "largePrice": 16, "image": "/products/white-mocha.webp", "name": "White Mocha", "ar": "وايت موكا", "price": 14, "calories": 0, "category": "Hot Beverages", "note": "Espresso with white chocolate and steamed milk."},
  {"id": 13, "image": "/products/caramel-frappe.webp", "name": "Caramel Frappe", "ar": "كراميل فرابيه", "price": 16, "calories": 0, "category": "Cold Beverages", "note": "Blended iced coffee with caramel."},
  {"id": 14, "image": "/products/mocha-frappe.webp", "name": "Mocha Frappe", "ar": "موكا فرابيه", "price": 16, "calories": 0, "category": "Cold Beverages", "note": "Blended iced coffee with chocolate."},
  {"id": 15, "image": "/products/vanilla-oreo-frappe.webp", "name": "Vanilla Oreo Frappe", "ar": "فانيلا أوريو فرابيه", "price": 18, "calories": 0, "category": "Cold Beverages", "note": "Creamy vanilla frappe blended with Oreo.", "badge": "Treat"},
  {"id": 16, "image": "/products/chocolate-oreo-frappe.webp", "name": "Chocolate Oreo Frappe", "ar": "شوكولاتة أوريو فرابيه", "price": 18, "calories": 0, "category": "Cold Beverages", "note": "Chocolate frappe blended with Oreo.", "badge": "Treat"},
  {"id": 17, "image": "/products/strawberry-banana-smoothie.webp", "name": "Strawberry Banana Smoothie", "ar": "سموذي فراولة وموز", "price": 20, "calories": 0, "category": "Cold Beverages", "note": "Fruit smoothie with strawberry and banana."},
  {"id": 18, "image": "/products/mango-smoothie.webp", "name": "Mango Smoothie", "ar": "سموذي مانجو", "price": 20, "calories": 0, "category": "Cold Beverages", "note": "Smooth and refreshing mango fruit blend."},
  {"id": 19, "image": "/products/iced-americano.webp", "name": "Iced Americano", "ar": "أمريكانو مثلج", "price": 10, "calories": 0, "category": "Cold Beverages", "note": "Espresso and chilled water served over ice."},
  {"id": 20, "image": "/products/iced-latte.webp", "name": "Iced Latte", "ar": "لاتيه مثلج", "price": 12, "calories": 0, "category": "Cold Beverages", "note": "Espresso and cold milk over ice."},
  {"id": 21, "image": "/products/iced-mocha.webp", "name": "Iced Mocha", "ar": "موكا مثلج", "price": 15, "calories": 0, "category": "Cold Beverages", "note": "Espresso, chocolate and milk over ice."},
  {"id": 22, "image": "/products/iced-caramel-macchiato.webp", "name": "Iced Caramel Macchiato", "ar": "كراميل ماكياتو مثلج", "price": 16, "calories": 0, "category": "Cold Beverages", "note": "Iced espresso and milk with caramel.", "badge": "Popular"},
  {"id": 23, "image": "/products/iced-white-mocha.webp", "name": "Iced White Mocha", "ar": "وايت موكا مثلج", "price": 16, "calories": 0, "category": "Cold Beverages", "note": "Iced espresso with white chocolate and milk."},
  {"id": 24, "image": "/products/chocolate-mcbites.webp", "name": "Chocolate McBites", "ar": "ماك بايتس شوكولاتة", "price": 9, "calories": 0, "category": "Treats", "note": "Bite-size chocolate bakery treat."},
  {"id": 25, "image": "/products/double-chocolate-cookie.webp", "name": "Double Chocolate Cookie", "ar": "كوكيز دبل شوكولاتة", "price": 10, "calories": 0, "category": "Treats", "note": "Soft cookie packed with chocolate."},
  {"id": 26, "image": "/products/triple-chocolate-cookie.webp", "name": "Triple Chocolate Cookie", "ar": "كوكيز تربل شوكولاتة", "price": 10, "calories": 0, "category": "Treats", "note": "Rich cookie with three chocolate notes."},
  {"id": 27, "image": "/products/brown-tumbler.webp", "name": "Brown Tumbler", "ar": "تمبلر بني", "price": 40, "calories": 0, "category": "Tumblers", "note": "Reusable brown McCafé tumbler."},
];

const categories = ["All Items", "Hot Beverages", "Cold Beverages", "Treats", "Tumblers"];
const slugs = ["hot_spanish_latte", "iced_spanish_latte", "cappuccino", "americano", "latte", "hot_chocolate", "mocha", "espresso", "green_tea", "black_tea", "caramel_macchiato", "white_mocha", "caramel_frappe", "mocha_frappe", "vanilla_oreo_frappe", "chocolate_oreo_frappe", "strawberry_banana_smoothie", "mango_smoothie", "iced_americano", "iced_latte", "iced_mocha", "iced_caramel_macchiato", "iced_white_mocha", "chocolate_mcbites", "double_chocolate_cookie", "triple_chocolate_cookie", "brown_tumbler"];
const categoryMap: Record<string, string> = { all: "All Items", hot: "Hot Beverages", cold: "Cold Beverages", treats: "Treats", tumblers: "Tumblers" };

export default function Home() {
  const [category, setCategory] = useState("All Items");
  const [cart, setCart] = useState<Record<number, number>>({});
  const [cartMeta, setCartMeta] = useState<Record<number, CartMeta>>({});
  const [pickupToken, setPickupToken] = useState("");
  const [arabic, setArabic] = useState(false);
  const [status, setStatus] = useState<"idle" | "connecting" | "connected" | "error">("idle");
  const [error, setError] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [query, setQuery] = useState("");
  const [reply, setReply] = useState("");
  const [cartOpen, setCartOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [inventory, setInventory] = useState<Record<string, number>>({});
  const [orders, setOrders] = useState<any[]>([]);
  const [savingOrder, setSavingOrder] = useState(false);
  const [lastInvoice, setLastInvoice] = useState<any>(null);
  const [adminAuth, setAdminAuth] = useState(false);
  const [adminCsrf, setAdminCsrf] = useState("");
  const [anamAdmin, setAnamAdmin] = useState<any>({apiKey:"",apiKeyHint:"",apiKeyConfigured:false,avatarId:"",agentId:"",voiceId:"",llmId:"",baristaName:""});
  const [anamAdminMsg, setAnamAdminMsg] = useState("");
  const clientRef = useRef<AnamClient | null>(null);
  const unregisterRef = useRef<Array<() => void>>([]);
  const transcriptCountRef = useRef(0);
  const cartRef = useRef<Record<number, number>>({});
  const cartMetaRef = useRef<Record<number, CartMeta>>({});
  const inventoryRef = useRef<Record<string, number>>({});
  useEffect(() => { cartRef.current = cart; }, [cart]);
  useEffect(() => { cartMetaRef.current = cartMeta; }, [cartMeta]);
  useEffect(() => { inventoryRef.current = inventory; }, [inventory]);
  const connected = status === "connected";
  const visible = category === "All Items" ? menu : menu.filter((item) => item.category === category);
  const count = Object.values(cart).reduce((sum, qty) => sum + qty, 0);
  const total = menu.reduce((sum, item) => sum + (cartMeta[item.id]?.unitPrice ?? item.price) * (cart[item.id] || 0), 0);
  const vat = total * 15 / 115;
  const subtotal = total - vat;
  const cartItems = useMemo(() => menu.filter((item) => cart[item.id]), [cart]);

  const refreshBackOffice = useCallback(async () => {
    try {
      const i = await fetch('/api/inventory').then(r=>r.json()); setInventory(i.inventory || {});
      const st = await fetch('/api/admin/status').then(r=>r.json()); setAdminAuth(Boolean(st.authenticated)); setAdminCsrf(String(st.csrfToken || ""));
      if (st.authenticated) { const o=await fetch('/api/orders').then(r=>r.json()); setOrders(o.orders || []); const ac=await fetch('/api/admin/anam-config').then(r=>r.json()); if(!ac.error)setAnamAdmin((v:any)=>({...v,...ac,apiKey:''})); }
    } catch {}
  }, []);
  useEffect(() => { refreshBackOffice(); }, [refreshBackOffice]);

  async function openAdmin() {
    const st=await fetch('/api/admin/status').then(r=>r.json());
    if(st.authenticated){setAdminAuth(true);setAdminCsrf(String(st.csrfToken || ""));setSettingsOpen(true);await refreshBackOffice();return;}
    const password=window.prompt("Admin password"); if(!password)return;
    const res=await fetch('/api/admin/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({password})});
    if(!res.ok){const e=await res.json().catch(()=>({}));setReply(e.error || "Invalid admin password.");return;} const login=await res.json(); setAdminAuth(true);setAdminCsrf(String(login.csrfToken || ""));setSettingsOpen(true);await refreshBackOffice();
  }

  async function submitCurrentOrder() {
    if (savingOrder) throw new Error("Order is already being saved.");
    const currentCart = cartRef.current;
    const currentMeta = cartMetaRef.current;
    const items = menu.filter(item => currentCart[item.id]).map(item => ({
      id: item.id,
      qty: currentCart[item.id],
      size: currentMeta[item.id]?.size || "regular",
      milk: currentMeta[item.id]?.milk || "regular",
    }));
    if (!items.length) throw new Error("The order is empty.");
    setSavingOrder(true);
    try {
      const res = await fetch('/api/orders', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({ items, paymentMethod:'pay_at_counter' }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Order could not be saved');
      setLastInvoice(data.order);
      setPickupToken(`#${data.order.id}`);
      setReply(`Order confirmed. Invoice ${data.order.id}`);
      window.dispatchEvent(new CustomEvent('abc-training-event',{detail:{type:'order_confirmed',orderId:data.order.id,items:data.order.items,total:data.order.total}}));
      await refreshBackOffice();
      return data.order;
    } finally { setSavingOrder(false); }
  }

  async function confirmOrder() {
    try { await submitCurrentOrder(); }
    catch(e:any) { setReply(String(e?.message || e).replace('OUT_OF_STOCK:','Out of stock product ID: ')); }
  }

  function downloadInvoicePdf() { if(!lastInvoice)return; window.open(`/api/invoices/${encodeURIComponent(lastInvoice.id)}/pdf?uuid=${encodeURIComponent(lastInvoice.uuid)}`,'_blank'); }

  function printInvoice() {
    if (!lastInvoice) return; const w=window.open('','_blank','width=760,height=900'); if(!w)return;
    const rows=lastInvoice.items.map((x:any)=>`<tr><td>${x.name}</td><td>${x.qty}</td><td>${x.unitPrice.toFixed(2)}</td><td>${(x.qty*x.unitPrice).toFixed(2)}</td></tr>`).join('');
    w.document.write(`<!doctype html><html><head><title>${lastInvoice.id}</title><style>body{font-family:Arial;padding:32px;color:#222}h1{margin:0}table{width:100%;border-collapse:collapse;margin:24px 0}td,th{padding:10px;border-bottom:1px solid #ddd;text-align:left}.tot{font-size:18px;font-weight:bold}.muted{color:#666}.box{border:1px solid #ddd;border-radius:12px;padding:16px}</style></head><body><h1>Maram&apos;s Cafe</h1><p class="muted">Tax invoice / فاتورة ضريبية</p><div class="box"><b>Invoice:</b> ${lastInvoice.id}<br><b>Issued:</b> ${new Date(lastInvoice.issuedAt).toLocaleString()}<br><b>UUID:</b> ${lastInvoice.uuid}<br><b>ZATCA status:</b> ${lastInvoice.zatcaStatus}</div><table><thead><tr><th>Item</th><th>Qty</th><th>Unit SAR</th><th>Total</th></tr></thead><tbody>${rows}</tbody></table><p>Subtotal before VAT: SAR ${lastInvoice.subtotal.toFixed(2)}</p><p>VAT 15%: SAR ${lastInvoice.vat.toFixed(2)}</p><p class="tot">Total incl. VAT: SAR ${lastInvoice.total.toFixed(2)}</p><p>Payment: ${lastInvoice.paymentStatus}</p><p class="muted">Draft local tax invoice. ZATCA clearance/reporting is not activated until seller credentials and a compliant integration are configured.</p><script>window.onload=()=>window.print()</script></body></html>`); w.document.close();
  }

  function add(id: number) { if ((inventory[String(id)] ?? 1) <= (cart[id] || 0)) { setReply("This item is out of stock."); return; } const item = menu.find((candidate) => candidate.id === id); if (item && !cartMeta[id]) setCartMeta((current) => ({ ...current, [id]: { size: "regular", milk: "regular", unitPrice: item.price } })); setCart((current) => ({ ...current, [id]: (current[id] || 0) + 1 })); }
  function remove(id: number) { setCart((current) => { const next = { ...current }; if ((next[id] || 0) <= 1) { delete next[id]; setCartMeta((meta) => { const m = { ...meta }; delete m[id]; return m; }); } else next[id]--; return next; }); }
  function itemFromSlug(slug: unknown) { const index = slugs.indexOf(String(slug)); return index >= 0 ? menu[index] : undefined; }
  function askBarista() {
    if (!query.trim()) return;
    if (clientRef.current && connected) {
      clientRef.current.sendUserMessage(query.trim());
      setQuery("");
      return;
    }
    const text = query.trim();
    const recorder = (window as any).ABCTrainingRecorder;
    if (recorder?.playIntent) recorder.playIntent(text).catch?.(() => {});
    const match = menu.find((item) => `${item.name} ${item.ar}`.toLowerCase().includes(text.toLowerCase()) || text.toLowerCase().includes(item.name.toLowerCase()));
    setReply(match ? `${match.name} is SAR ${match.price}. ${match.note}` : arabic ? "يسعدني أساعدك. جرّب السبانش لاتيه أو الكابتشينو أو أحد المشروبات المثلجة." : "I’d be happy to help. Try our Spanish Latte, Cappuccino, or an iced coffee.");
    setQuery("");
  }

  const stopSession = useCallback(async () => {
    unregisterRef.current.forEach((unregister) => unregister());
    unregisterRef.current = [];
    await clientRef.current?.stopStreaming();
    clientRef.current = null;
    setStatus("idle");
  }, []);

  const startSession = useCallback(async () => {
    if (status === "connecting") return;
    setStatus("connecting"); setError(""); setMessages([]); setReply("");
    try {
      const response = await fetch("/api/anam/session", { method: "POST" });
      const data = await response.json() as { sessionToken?: string; error?: string; code?: string };
      if (!response.ok || !data.sessionToken) throw new Error(data.error || "Could not start the live barista.");
      const client = createClient(data.sessionToken, { metrics: { disableClientMetrics: true } });
      clientRef.current = client;
      client.addListener(AnamEvent.CONNECTION_ESTABLISHED, () => setStatus("connected"));
      client.addListener(AnamEvent.CONNECTION_CLOSED, () => { clientRef.current = null; setStatus("idle"); });
      client.addListener(AnamEvent.MESSAGE_HISTORY_UPDATED, (history) => {
        setMessages(history);
        const fresh = history.slice(transcriptCountRef.current);
        transcriptCountRef.current = history.length;
        fresh.forEach((message) => window.dispatchEvent(new CustomEvent('abc-transcript-message', { detail: { role: String(message.role) === 'user' ? 'user' : 'assistant', content: message.content } })));
        const last = [...history].reverse().find((message) => String(message.role) !== "user"); if (last) setReply(last.content);
      });
      const register = (name: string, run: (args: Record<string, unknown>) => string | Promise<string>) => client.registerToolCallHandler(name, { onStart: async ({ arguments: args }) => run(args) });
      unregisterRef.current = [
        register("show_signature_menu", () => { setCategory("All Items"); setReply("Signature picks: Hot Spanish Latte, Iced Spanish Latte, Caramel Macchiato and Iced Caramel Macchiato."); return "Signature recommendations displayed."; }),
        register("filter_coffee_menu", ({ category: value }) => { if (value === "bucket") setCartOpen(true); else setCategory(categoryMap[String(value)] || "All Items"); return `Menu filtered to ${String(value)}.`; }),
        register("show_item_details", ({ itemId }) => { const item = itemFromSlug(itemId); if (!item) return "Item not found."; setCategory(item.category); setReply(`${item.name} — SAR ${item.price}. ${item.note}`); return `${item.name} displayed.`; }),
        register("select_coffee_item", ({ itemId, quantity, size, milk }) => {
          const item = itemFromSlug(itemId); if (!item) return "Item not found.";
          const qty = Math.max(1, Math.min(10, Number(quantity) || 1));
          const available = inventoryRef.current[String(item.id)] ?? 0;
          const already = cartRef.current[item.id] || 0;
          if (available < already + qty) return `Cannot add ${qty} ${item.name}. Only ${Math.max(0, available - already)} remaining in stock.`;
          const requestedSize = String(size || "regular");
          const actualSize: CartMeta["size"] = requestedSize === "double" && item.doublePrice ? "double" : requestedSize === "large" && item.largePrice ? "large" : "regular";
          const unitPrice = actualSize === "double" ? (item.doublePrice ?? item.price) : actualSize === "large" ? (item.largePrice ?? item.price) : item.price;
          const requestedMilk = String(milk || "regular");
          const actualMilk: CartMeta["milk"] = ["regular","oat","almond","none"].includes(requestedMilk) ? requestedMilk as CartMeta["milk"] : "regular";
          setCartMeta((current) => ({ ...current, [item.id]: { size: actualSize, milk: actualMilk, unitPrice } }));
          setCart((current) => ({ ...current, [item.id]: (current[item.id] || 0) + qty }));
          return `Added ${qty} ${actualSize} ${item.name}${actualMilk !== "regular" ? ` with ${actualMilk} milk` : ""}.`;
        }),
        register("remove_coffee_item", ({ itemId, quantity }) => { const item = itemFromSlug(itemId); if (!item) return "Item not found."; const qty = Math.max(1, Number(quantity) || 1); setCart((current) => { const next = { ...current }; const remaining = (next[item.id] || 0) - qty; if (remaining > 0) next[item.id] = remaining; else { delete next[item.id]; setCartMeta((meta) => { const m={...meta}; delete m[item.id]; return m; }); } return next; }); return `Removed ${qty} ${item.name}.`; }),
        register("show_order_confirmation", () => { setCartOpen(true); return "Order review opened."; }),
        register("close_order_confirmation", () => { setCartOpen(false); return "Order review closed."; }),
        register("confirm_and_generate_token", async ({ confirmed }) => {
          if (confirmed !== true) return "Order was not confirmed.";
          try { const order = await submitCurrentOrder(); setCartOpen(true); return `Order confirmed and saved. Pickup token is #${order.id}.`; }
          catch (e:any) { const message=String(e?.message||e).replace('OUT_OF_STOCK:','Out of stock product ID: '); setReply(message); setCartOpen(true); return `Order could not be confirmed: ${message}`; }
        }),
        register("reset_order", () => { setCart({}); setCartMeta({}); setPickupToken(""); setCartOpen(false); return "Order cleared."; }),
      ];
      await client.streamToVideoElement("avatar-video");
      setStatus("connected");
    } catch (cause) {
      clientRef.current = null;
      setError(cause instanceof Error ? cause.message : "Could not start the live barista.");
      setStatus("error");
    }
  }, [status]);

  useEffect(() => () => { unregisterRef.current.forEach((unregister) => unregister()); clientRef.current?.stopStreaming(); }, []);

  useEffect(() => {
    const context = (document as Document & { modelContext?: { registerTool: (tool: unknown, options?: { signal?: AbortSignal }) => void | Promise<void> } }).modelContext;
    if (!context?.registerTool) return;
    const lifecycle = new AbortController();
    const registrations = [
      context.registerTool({
        name: "add_menu_item",
        title: "Add menu item",
        description: "Add a coffee or pastry to the visible McCafé bucket by its numeric menu ID.",
        inputSchema: { type: "object", properties: { itemId: { type: "number", minimum: 1, maximum: 27 }, quantity: { type: "number", minimum: 1, maximum: 10 } }, required: ["itemId"], additionalProperties: false },
        annotations: { readOnlyHint: false, untrustedContentHint: false },
        execute(input: unknown) {
          const data = input as { itemId?: number; quantity?: number };
          const item = menu.find((candidate) => candidate.id === data.itemId);
          if (!item || !Number.isInteger(data.quantity ?? 1)) throw new Error("Choose a valid item ID and whole-number quantity.");
          const quantity = data.quantity ?? 1;
          const available = inventoryRef.current[String(item.id)] ?? 0;
          const already = cartRef.current[item.id] || 0;
          if (available < already + quantity) throw new Error(`Only ${Math.max(0,available-already)} ${item.name} remaining in stock.`);
          setCartMeta((current) => ({ ...current, [item.id]: current[item.id] || { size: "regular", milk: "regular", unitPrice: item.price } }));
          setCart((current) => ({ ...current, [item.id]: (current[item.id] || 0) + quantity }));
          return { added: item.name, quantity, remaining: available-already-quantity };
        },
      }, { signal: lifecycle.signal }),
      context.registerTool({
        name: "clear_bucket",
        title: "Clear bucket",
        description: "Remove every item from the visible McCafé bucket.",
        inputSchema: { type: "object", properties: {}, additionalProperties: false },
        annotations: { readOnlyHint: false, untrustedContentHint: false },
        execute() { setCart({}); setCartMeta({}); setPickupToken(""); return { cleared: true }; },
      }, { signal: lifecycle.signal }),
    ];
    Promise.all(registrations.map((entry) => Promise.resolve(entry))).catch(() => undefined);
    return () => lifecycle.abort();
  }, []);

  return (
    <main className="min-h-screen bg-[#090807] text-stone-100" dir={arabic ? "rtl" : "ltr"}>
      <header className="sticky top-0 z-30 border-b border-black/10 bg-[#090807]/92 backdrop-blur-xl">
        <div className="mx-auto flex h-20 max-w-[1480px] items-center justify-between gap-3 px-5 lg:px-8">
          <div className="flex items-center gap-3"><div className="grid size-11 place-items-center rounded-2xl border border-amber-400/30 bg-amber-400/10 text-amber-400"><Coffee size={23} /></div><div><div className="flex items-baseline gap-1 font-black tracking-tight"><span className="text-xl text-[#222]">Mc</span><span className="text-xl text-amber-400">CAFÉ</span></div><p className="text-xs text-stone-600">Virtual Barista</p></div></div>
          <div className="flex items-center gap-2"><button onClick={openAdmin} className="rounded-full border border-black/10 bg-white px-4 py-2.5 text-sm font-bold text-stone-700 hover:border-amber-400/50">{arabic ? "الإعدادات" : "Admin settings"}</button><button onClick={() => setArabic(!arabic)} className="grid size-10 place-items-center rounded-full border border-black/10 text-stone-300 hover:border-amber-400/40" aria-label="Switch language"><Globe2 size={18} /></button><button onClick={() => { setCart({}); setCartMeta({}); setPickupToken(""); setReply(""); }} className="hidden rounded-full border border-black/10 bg-black/[.03] px-4 py-2.5 text-sm font-semibold text-stone-300 hover:text-[#222] sm:block">{arabic ? "عميل جديد" : "Next customer"}</button></div>
        </div>
      </header>

      <div className="mx-auto grid max-w-[1480px] gap-6 px-5 py-6 lg:grid-cols-[360px_1fr] lg:px-8">
        <aside className="relative overflow-hidden rounded-[2rem] border border-amber-400/20 bg-white p-5 lg:sticky lg:top-28 lg:h-[calc(100vh-8.5rem)]">
          <div className="flex h-full flex-col"><div className="mb-4 flex items-center justify-between"><span className={`rounded-full border px-3 py-1 text-xs font-bold uppercase tracking-[.16em] ${connected ? "border-emerald-400/20 bg-emerald-400/10 text-emerald-300" : "border-stone-500/20 bg-white/5 text-stone-600"}`}>{connected ? "Live barista" : "Barista offline"}</span><Sparkles className="text-amber-400" size={20} /></div>
            <div className="relative min-h-72 flex-1 overflow-hidden rounded-[1.5rem] border border-black/10 bg-cover bg-center" style={{ backgroundImage: "linear-gradient(to top,rgba(0,0,0,.82),rgba(0,0,0,.08)),url('/barista-coffee.png')" }}>
              <video id="avatar-video" autoPlay playsInline className={`absolute inset-0 h-full w-full object-cover transition-opacity ${connected ? "opacity-100" : "opacity-0"}`} />
              <div className="absolute inset-x-5 bottom-5 rounded-2xl border border-black/10 bg-black/55 p-4 backdrop-blur-md"><p className="font-bold">مرام · Maram</p><p className="mt-0.5 text-sm text-stone-300">{connected ? (arabic ? "جاهز لمساعدتك في طلبك" : "Ready to help with your order") : (arabic ? "ابدأ جلسة صوتية مباشرة" : "Start a live voice session")}</p></div>
            </div>
            {error && <p className="mt-3 rounded-xl border border-red-400/20 bg-red-400/10 p-3 text-sm text-red-200">{error}</p>}
            <button disabled={status === "connecting"} onClick={connected ? stopSession : startSession} className={`mt-5 flex w-full items-center justify-center gap-2 rounded-2xl px-5 py-4 font-extrabold transition disabled:opacity-60 ${connected ? "border border-red-400/30 bg-red-400/10 text-red-300" : "bg-amber-400 text-stone-950 hover:bg-amber-300"}`}>{status === "connecting" ? <LoaderCircle className="animate-spin" size={19}/> : <Mic size={19} />}{status === "connecting" ? (arabic ? "جاري الاتصال…" : "Connecting…") : connected ? (arabic ? "إنهاء المكالمة" : "End call") : (arabic ? "تحدث مع مرام" : "Speak with Maram")}</button>
          </div>
        </aside>

        <section className="min-w-0">
          <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><p className="mb-2 text-sm font-bold uppercase tracking-[.2em] text-amber-400">Maram's Cafe Menu</p><h1 className="text-3xl font-black tracking-tight text-[#222] sm:text-4xl">{arabic ? "اختر مشروبك أو الحلى المفضل من ماك كافيه" : "Your McCafé favourites, all in one place"}</h1></div>
            <button onClick={() => setCartOpen(true)} className="flex items-center gap-2 self-start rounded-2xl border border-black/10 bg-black/[.03] px-4 py-3 text-sm font-bold sm:self-auto"><ShoppingBag size={18} className="text-amber-400" />{arabic ? "طلبي" : "My order"}<span className="rounded-full bg-amber-400 px-2 py-0.5 text-xs text-black">{count}</span></button>
          </div>
          <nav className="scrollbar-none mb-6 flex gap-2 overflow-x-auto pb-1" aria-label="Menu categories">{categories.map((name) => <button key={name} onClick={() => setCategory(name)} className={`shrink-0 rounded-full px-4 py-2.5 text-sm font-bold ${category === name ? "bg-amber-400 text-stone-950" : "border border-black/10 bg-black/[.02] text-stone-600 hover:text-[#222]"}`}>{name}</button>)}</nav>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{visible.map((item) => <article key={item.id} className="group flex min-h-[26rem] flex-col rounded-[1.5rem] border border-black/10 bg-white p-5 transition hover:-translate-y-1 hover:border-amber-400/40"><div className="mb-5 flex flex-col items-start gap-3"><div className="h-36 w-full overflow-hidden rounded-2xl bg-white"><img src={item.image} alt={item.name} className="h-full w-full object-contain p-2" /></div>{item.badge && <span className="rounded-full bg-amber-400/10 px-3 py-1 text-xs font-bold text-amber-400">{item.badge}</span>}</div><h2 className="text-xl font-extrabold text-[#222]">{arabic ? item.ar : item.name}</h2><p className="mt-1 font-semibold text-amber-400/75" dir={arabic ? "ltr" : "rtl"}>{arabic ? item.name : item.ar}</p><p className="mt-3 flex-1 text-sm leading-6 text-stone-600">{item.note}</p><div className="mt-5 flex items-center justify-between border-t border-black/10 pt-4"><div><p className="font-black"><span className="text-xs text-stone-600">SAR</span> {item.price}</p><p className="text-xs text-stone-600">Approx. Riyadh price</p></div>{cart[item.id] ? <div className="flex items-center gap-3"><button onClick={() => remove(item.id)} aria-label={`Remove ${item.name}`} className="grid size-9 place-items-center rounded-xl bg-black/10"><Minus size={15} /></button><b>{cart[item.id]}</b><button onClick={() => add(item.id)} aria-label={`Add ${item.name}`} className="grid size-9 place-items-center rounded-xl bg-amber-400 text-black"><Plus size={15} /></button></div> : <button onClick={() => add(item.id)} className="rounded-xl bg-white px-4 py-2 text-sm font-extrabold text-stone-950 transition group-hover:bg-amber-400">+ {arabic ? "أضف" : "Add"}</button>}</div></article>)}</div>
          {reply && <div className="mt-6 flex items-start justify-between gap-4 rounded-2xl border border-amber-400/20 bg-amber-400/[.06] p-4 text-sm leading-6 text-amber-50"><span><b className="text-amber-400">مرام:</b> {reply}</span><button onClick={() => setReply("")} aria-label="Close reply"><X size={17} /></button></div>}
          {connected && messages.length > 0 && <p className="mt-2 text-right text-xs text-stone-600">{messages.length} live transcript messages</p>}
        </section>
      </div>
      {cartOpen && <CartSheet cartItems={cartItems} cart={cart} cartMeta={cartMeta} total={total} subtotal={subtotal} vat={vat} pickupToken={pickupToken} arabic={arabic} add={add} remove={remove} clear={() => { setCart({}); setCartMeta({}); setPickupToken(""); }} confirm={confirmOrder} close={() => setCartOpen(false)} savingOrder={savingOrder} printInvoice={printInvoice} downloadInvoicePdf={downloadInvoicePdf} lastInvoice={lastInvoice} />}
      {settingsOpen && <div className="fixed inset-0 z-[60] overflow-auto bg-black/60 p-4 backdrop-blur-sm" onMouseDown={(e) => e.target === e.currentTarget && setSettingsOpen(false)}><div className="mx-auto my-10 max-w-5xl rounded-3xl bg-white p-6 text-stone-900 shadow-2xl"><div className="flex items-start justify-between gap-4"><div><p className="text-sm font-bold uppercase tracking-[.18em] text-amber-600">Back Office</p><h2 className="mt-1 text-2xl font-black">مرام · Maram's Cafe Admin</h2><p className="mt-1 text-sm text-stone-500">Authenticated cloud back office · Cloudflare D1 order history.</p></div><div className="flex gap-2"><button onClick={async()=>{await fetch('/api/admin/logout',{method:'POST',headers:{'X-Admin-CSRF':adminCsrf}});setAdminAuth(false);setAdminCsrf('');setSettingsOpen(false)}} className="rounded-xl bg-stone-100 px-3 text-xs font-bold">Logout</button><button onClick={() => setSettingsOpen(false)} className="grid size-9 place-items-center rounded-xl bg-stone-100"><X size={17}/></button></div></div><div className="mt-6 grid gap-3 sm:grid-cols-3"><SettingCard label="Connection" value={connected ? "Connected" : status === "connecting" ? "Connecting" : "Offline"}/><SettingCard label="Avatar ID" value={anamAdmin.avatarId || "Not configured"}/><SettingCard label="Voice ID" value={anamAdmin.voiceId || "Not configured"}/><SettingCard label="LLM ID" value={anamAdmin.llmId || "Not configured"}/><SettingCard label="AutoLearning" value="Recorder available in background"/><SettingCard label="Payments" value="Pay at counter enabled · gateway not configured"/></div><section className="mt-8 rounded-2xl border border-stone-200 p-4"><div className="mb-4"><h3 className="font-black">Anam configuration</h3><p className="text-xs text-stone-500">Server-side settings. The saved API key is encrypted and is never displayed back in full.</p></div><div className="grid gap-3 sm:grid-cols-2"><label className="text-xs font-bold">API Key<input type="password" autoComplete="off" placeholder={anamAdmin.apiKeyConfigured ? `Saved ${anamAdmin.apiKeyHint} — enter only to replace` : "Enter Anam API key"} value={anamAdmin.apiKey || ""} onChange={e=>setAnamAdmin((v:any)=>({...v,apiKey:e.target.value}))} className="mt-1 w-full rounded-xl border p-2 font-normal"/></label><label className="text-xs font-bold">Barista name<input value={anamAdmin.baristaName||""} onChange={e=>setAnamAdmin((v:any)=>({...v,baristaName:e.target.value}))} className="mt-1 w-full rounded-xl border p-2 font-normal"/></label><label className="text-xs font-bold">Avatar ID<input value={anamAdmin.avatarId||""} onChange={e=>setAnamAdmin((v:any)=>({...v,avatarId:e.target.value}))} className="mt-1 w-full rounded-xl border p-2 font-mono text-xs font-normal"/></label><label className="text-xs font-bold">Agent / Share ID<input value={anamAdmin.agentId||""} onChange={e=>setAnamAdmin((v:any)=>({...v,agentId:e.target.value}))} className="mt-1 w-full rounded-xl border p-2 font-mono text-xs font-normal"/></label><label className="text-xs font-bold">Voice ID<input value={anamAdmin.voiceId||""} onChange={e=>setAnamAdmin((v:any)=>({...v,voiceId:e.target.value}))} className="mt-1 w-full rounded-xl border p-2 font-mono text-xs font-normal"/></label><label className="text-xs font-bold">LLM ID<input value={anamAdmin.llmId||""} onChange={e=>setAnamAdmin((v:any)=>({...v,llmId:e.target.value}))} className="mt-1 w-full rounded-xl border p-2 font-mono text-xs font-normal"/></label></div><div className="mt-4 flex flex-wrap gap-2"><button onClick={async()=>{setAnamAdminMsg("Testing…");const r=await fetch('/api/admin/anam-config/test',{method:'POST',headers:{'Content-Type':'application/json','X-Admin-CSRF':adminCsrf},body:JSON.stringify(anamAdmin)});const d=await r.json();setAnamAdminMsg(d.message||d.error||'Test failed');}} className="rounded-xl border border-stone-300 px-4 py-2 text-sm font-bold">Test Anam connection</button><button onClick={async()=>{setAnamAdminMsg("Saving…");const r=await fetch('/api/admin/anam-config',{method:'PUT',headers:{'Content-Type':'application/json','X-Admin-CSRF':adminCsrf},body:JSON.stringify(anamAdmin)});const d=await r.json();if(r.ok){setAnamAdmin((v:any)=>({...v,...d,apiKey:''}));setAnamAdminMsg('Saved. New Maram sessions will use these settings.');}else setAnamAdminMsg(d.error||'Save failed');}} className="rounded-xl bg-stone-900 px-4 py-2 text-sm font-bold text-white">Save Anam settings</button></div>{anamAdminMsg&&<p className="mt-3 rounded-xl bg-stone-50 p-3 text-sm">{anamAdminMsg}</p>}</section><div className="mt-8 grid gap-6 lg:grid-cols-2"><section><div className="mb-3 flex items-center gap-2"><Package size={18}/><h3 className="font-black">Inventory</h3></div><div className="max-h-80 overflow-auto rounded-2xl border border-stone-200"><table className="w-full text-sm"><tbody>{menu.map(item=><tr key={item.id} className="border-b border-stone-100"><td className="p-2">{item.name}</td><td className="p-2 text-right"><input type="number" min="0" value={inventory[String(item.id)] ?? 0} onChange={e=>setInventory(v=>({...v,[String(item.id)]:Math.max(0,Number(e.target.value)||0)}))} className="w-20 rounded-lg border p-2 text-right"/></td></tr>)}</tbody></table></div><button onClick={async()=>{await fetch('/api/inventory',{method:'PUT',headers:{'Content-Type':'application/json','X-Admin-CSRF':adminCsrf},body:JSON.stringify({inventory})}); await refreshBackOffice();}} className="mt-3 rounded-xl bg-stone-900 px-4 py-2 font-bold text-white">Save stock</button></section><section><div className="mb-3 flex items-center gap-2"><History size={18}/><h3 className="font-black">Order history</h3></div><div className="max-h-80 space-y-2 overflow-auto">{orders.length===0?<p className="rounded-2xl bg-stone-50 p-4 text-sm text-stone-500">No saved orders yet.</p>:orders.map((o:any)=><div key={o.id} className="rounded-2xl border border-stone-200 p-3"><div className="flex justify-between"><b>{o.id}</b><b>SAR {Number(o.total).toFixed(2)}</b></div><p className="text-xs text-stone-500">{new Date(o.issuedAt).toLocaleString()} · {o.items?.length||0} lines · {o.paymentStatus}</p></div>)}</div></section></div><p className="mt-6 rounded-2xl bg-amber-50 p-4 text-sm text-amber-900"><b>ZATCA:</b> invoice records now contain UUID, issue time, VAT breakdown and a ZATCA status field, but clearance/reporting/signing is intentionally marked draft until the legal seller details, certificate/CSID and integration mode are configured. Card payment is likewise not charged until a payment provider account is connected.</p></div></div>}
    </main>
  );
}

function CartSheet({ cartItems, cart, cartMeta, total, subtotal, vat, pickupToken, arabic, add, remove, clear, confirm, close, savingOrder, printInvoice, downloadInvoicePdf, lastInvoice }: { cartItems: MenuItem[]; cart: Record<number, number>; cartMeta: Record<number, CartMeta>; total: number; subtotal: number; vat: number; pickupToken: string; arabic: boolean; add: (id:number)=>void; remove:(id:number)=>void; clear:()=>void; confirm:()=>void; close:()=>void; savingOrder:boolean; printInvoice:()=>void; downloadInvoicePdf:()=>void; lastInvoice:any }) {
  const money = (value:number) => value.toFixed(2);
  return <div className="fixed inset-0 z-50 bg-black/65 backdrop-blur-sm" onMouseDown={(e) => e.target === e.currentTarget && close()}><aside role="dialog" aria-modal="true" aria-label="Shopping bucket" className={`absolute inset-y-0 ${arabic ? "left-0" : "right-0"} flex w-full max-w-md flex-col border-black/10 bg-white p-5 shadow-2xl`}><div className="flex items-start justify-between"><div><h2 className="text-2xl font-black text-[#222]">{arabic ? "طلبي" : "My order"}</h2><p className="mt-1 text-sm text-stone-600">{arabic ? "راجع طلبك قبل التأكيد" : "Review your order before confirming"}</p></div><button onClick={close} aria-label="Close bucket" className="grid size-9 place-items-center rounded-xl bg-black/10"><X size={17}/></button></div><div className="flex min-h-0 flex-1 flex-col">{cartItems.length === 0 ? <div className="grid flex-1 place-items-center text-center"><div><ShoppingBag className="mx-auto mb-3 text-stone-700" size={48}/><p className="font-bold text-stone-300">{arabic ? "سلّتك فارغة" : "Your bucket is empty"}</p></div></div> : <><div className="flex-1 space-y-3 overflow-auto py-5">{cartItems.map((item) => { const meta=cartMeta[item.id] || {size:"regular",milk:"regular",unitPrice:item.price}; return <div key={item.id} className="flex items-center gap-3 rounded-2xl border border-black/10 bg-black/[.02] p-3"><img src={item.image} alt="" className="size-14 rounded-xl bg-white object-contain p-1" /><div className="min-w-0 flex-1"><p className="truncate font-bold">{arabic ? item.ar : item.name}</p><p className="text-xs text-stone-600">{meta.size}{meta.milk !== "regular" ? ` · ${meta.milk} milk` : ""}</p><p className="text-sm text-amber-400">SAR {money(meta.unitPrice * cart[item.id])}</p></div><button onClick={() => remove(item.id)} className="grid size-8 place-items-center rounded-lg bg-black/10"><Minus size={14}/></button><b>{cart[item.id]}</b><button onClick={() => add(item.id)} className="grid size-8 place-items-center rounded-lg bg-amber-400 text-black"><Plus size={14}/></button></div>})}</div><div className="border-t border-black/10 pt-5">{pickupToken ? <div className="mb-4 rounded-2xl border border-emerald-400/25 bg-emerald-400/10 p-4 text-center"><p className="text-sm text-emerald-200">{arabic ? "تم تأكيد الطلب · رمز الاستلام" : "Order confirmed · Pickup token"}</p><p className="mt-1 text-3xl font-black text-[#222]">{pickupToken}</p></div> : null}<div className="mb-4 space-y-1 text-sm"><div className="flex justify-between text-stone-600"><span>{arabic ? "قبل الضريبة" : "Subtotal before VAT"}</span><span>SAR {money(subtotal)}</span></div><div className="flex justify-between text-stone-600"><span>{arabic ? "ضريبة القيمة المضافة 15%" : "VAT 15%"}</span><span>SAR {money(vat)}</span></div><div className="flex items-end justify-between border-t border-black/10 pt-3"><div><p className="text-sm text-stone-600">{arabic ? "الإجمالي شامل الضريبة" : "Total incl. VAT"}</p><p className="text-3xl font-black text-[#222]">SAR {money(total)}</p></div><button onClick={clear} className="flex items-center gap-1 text-sm text-red-300"><Trash2 size={15}/>{arabic ? "مسح" : "Clear"}</button></div></div><button disabled={Boolean(pickupToken)||savingOrder} onClick={confirm} className="w-full rounded-2xl bg-amber-400 py-4 font-extrabold text-black disabled:opacity-50">{savingOrder ? (arabic ? "جارٍ الحفظ…" : "Saving order…") : pickupToken ? (arabic ? "تم التأكيد" : "Confirmed") : (arabic ? "تأكيد وحفظ الفاتورة" : "Confirm & save invoice")}</button>{lastInvoice && <><button onClick={downloadInvoicePdf} className="mt-2 flex w-full items-center justify-center gap-2 rounded-2xl bg-stone-900 py-3 font-bold text-white"><Printer size={17}/>{arabic ? "تنزيل PDF" : "Download PDF"}</button><button onClick={printInvoice} className="mt-2 flex w-full items-center justify-center gap-2 rounded-2xl border border-stone-200 py-3 font-bold text-stone-800"><Printer size={17}/>{arabic ? "طباعة / حفظ PDF" : "Print / Save PDF"}</button></>}</div></>}</div></aside></div>;
}


function SettingCard({label,value}:{label:string;value:string}) { return <div className="rounded-2xl border border-stone-200 bg-stone-50 p-4"><p className="text-xs font-bold uppercase tracking-wide text-stone-500">{label}</p><p className="mt-1 break-all font-semibold text-stone-900">{value}</p></div>; }
