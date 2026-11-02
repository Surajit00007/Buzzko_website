import { createContext, useContext, useEffect, useRef, useState } from "react";
import { ShoppingBag, Plus, Minus, X, Truck, UserRound, LogIn, LogOut, ShieldCheck, Tag, MessageCircle } from "lucide-react";

import { Link } from "@tanstack/react-router";
import { categories, formatINR, type Product } from "@/data/products";
import { useCatalogue } from "@/lib/catalogue";
import { featuredProducts, sellingPrice, sortProductsByCollection } from "@/lib/catalogue-rules";
import { useAuth } from "@/lib/auth";
import { ProductVisual } from "./ProductVisual";
import { ProductPrice } from "./ProductPrice";
import { OfferStrip } from "./OfferStrip";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useBag } from "@/lib/bag";
import { whatsappOrderUrl } from "@/lib/whatsapp-order";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";

/** Share an image-click "zoom preview" handler with the hero and shop cards. */
const PreviewSetterContext = createContext<(p: Product | null) => void>(() => { });
const usePreviewSetter = () => useContext(PreviewSetterContext);

/** Text wordmark placeholder (not the uploaded logo). To use the real logo, render <img src={logo} alt="buzzko" /> here. */
export function Wordmark({ className = "" }: { className?: string }) {
  const letters = ["b", "u", "z", "z", "k", "o"];
  // Logo letter colours: b pink, u purple, z lime, z pink, k cyan, o yellow
  const tones = ["pink", "purple", "lime", "pink", "cyan", "yellow"];
  return (
    <span className={`wordmark ${className}`} aria-label="buzzko">
      {letters.map((l, i) => (
        <span key={i} aria-hidden="true" style={{ ["--tone" as string]: `var(--${tones[i]})` }}>{l}</span>
      ))}
    </span>
  );
}

function Nav() {
  const { count, setOpen } = useBag();
  const { user, isAdmin, signOut } = useAuth();
  return (
    <header className="sticky top-0 z-40 bg-background/85 backdrop-blur-sm">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 md:px-10" aria-label="Main">
        <a href="#top" className="focus-ring rounded-lg"><Wordmark className="text-3xl" /></a>
        <ul className="hidden gap-8 text-sm font-medium md:flex">
          {["Shop", "Collections", "About"].map((l) => (
            <li key={l}><a href={`#${l === "Collections" ? "shop" : l.toLowerCase()}`} className="nav-link focus-ring rounded">{l}</a></li>
          ))}
        </ul>
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="focus-ring rounded-full text-ink hover:bg-pink/20 hover:text-ink" aria-label="Account" title="Account"><UserRound /></Button></DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {user ? <>
                {isAdmin && <DropdownMenuItem asChild><Link to="/studio"><ShieldCheck />Manage collection</Link></DropdownMenuItem>}
                <DropdownMenuItem onSelect={() => void signOut()}><LogOut />Sign out</DropdownMenuItem>
              </> : <>
                <DropdownMenuItem asChild><Link to="/auth" search={{ admin: true, checkout: false }}><ShieldCheck />Admin login</Link></DropdownMenuItem>
                <DropdownMenuItem asChild><Link to="/"><LogIn />Guest login</Link></DropdownMenuItem>
              </>}
            </DropdownMenuContent>
          </DropdownMenu>
          <Button variant="storefront" size="storefront" onClick={() => setOpen(true)} className="focus-ring relative flex items-center gap-2 rounded-full border-2 border-foreground px-4 py-2 text-sm font-semibold transition hover:bg-foreground hover:text-background" aria-label={`Open bag, ${count} items`}>
            <ShoppingBag className="h-4 w-4" /> Bag
            <span className="grid h-6 min-w-6 place-items-center rounded-full bg-pink px-1.5 text-xs text-ink" aria-live="polite">{count}</span>
          </Button>
        </div>
      </nav>
    </header>
  );
}

// position/scale/depth/tilt per hero object — asymmetric, some cropped
const layout = [
  { x: "4%", y: "8%", s: 270, d: 1.4, r: -12, delay: 0 },
  { x: "72%", y: "4%", s: 300, d: 0.6, r: 14, delay: 1.2 },
  { x: "80%", y: "64%", s: 190, d: 1.8, r: -20, delay: 2.1 },
  { x: "8%", y: "66%", s: 230, d: 0.9, r: 10, delay: 0.6 },
  { x: "56%", y: "70%", s: 155, d: 2.2, r: 8, delay: 1.7 },
  { x: "33%", y: "72%", s: 175, d: 1.1, r: -6, delay: 2.6 },
  { x: "41%", y: "3%", s: 155, d: 1.6, r: -8, delay: 1.9 },
];

function Hero() {
  const stage = useRef<HTMLDivElement>(null);
  const { add } = useBag();
  const setPreview = usePreviewSetter();
  const { products, ready } = useCatalogue();
  const picks = ready ? featuredProducts(products) : [];
  useEffect(() => {
    const el = stage.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches || window.matchMedia("(pointer: coarse)").matches) return;
    let raf = 0;
    const onMove = (e: PointerEvent) => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const r = el.getBoundingClientRect();
        el.style.setProperty("--px", String((e.clientX - r.left) / r.width - 0.5));
        el.style.setProperty("--py", String((e.clientY - r.top) / r.height - 0.5));
      });
    };
    el.addEventListener("pointermove", onMove);
    return () => { el.removeEventListener("pointermove", onMove); cancelAnimationFrame(raf); };
  }, []);

  return (
    <section id="top" ref={stage} className="hero-stage relative overflow-hidden" aria-label="Featured charms">
      {picks.map((p, index) => {
        const o = layout[index];
        if (!o) return null;
        return (
          <div key={p.id} data-featured-id={p.id} className={`charm-float hero-slot-${index} absolute z-10`} style={{ left: o.x, top: o.y, ["--d" as string]: o.d, ["--r" as string]: `${o.r}deg`, ["--delay" as string]: `${o.delay}s`, width: `clamp(${o.s * 0.42}px, ${o.s / 13}vw, ${o.s}px)` }}>
            <Button variant="storefront" size="storefront" onClick={() => setPreview(p)} className="charm-btn focus-ring block w-full rounded-full p-0" aria-label={`Zoom ${p.name}`}>
              <ProductVisual product={p} className="w-full object-contain drop-shadow-charm" />
            </Button>
            <div className="callout">
              <span className="price-tag">
                <Tag className="h-3 w-3" aria-hidden="true" />
                <span className="font-semibold">{formatINR(sellingPrice(p))}</span>
              </span>
              <Button variant="storefront" size="storefront" onClick={() => add(p.id)} className="hero-add focus-ring" aria-label={`Add ${p.name} to bag`}>
                <Plus className="h-3.5 w-3.5" aria-hidden="true" />
              </Button>
            </div>
          </div>
        );
      })}
      <div className="pointer-events-none relative z-30 flex min-h-[inherit] flex-col items-center justify-center px-4 text-center">
        <div className="hero-halo" aria-hidden="true" />
        <h1><Wordmark className="hero-wordmark" /></h1>
        <p className="mt-5 text-sm font-medium md:text-lg">keychains • phone charms • frames</p>
        {ready && picks.length === 0 && <p className="mt-8 text-sm text-muted-foreground" role="status">New picks coming soon</p>}
      </div>
    </section>
  );
}

function ProductCard({ p }: { p: Product }) {
  const { add } = useBag();
  const setPreview = usePreviewSetter();
  return (
    <article className="product-card group" data-product-id={p.id}>
      <Button variant="storefront" size="storefront" onClick={() => setPreview(p)} className="focus-ring block w-full rounded-[clamp(1rem,3vw,1.75rem)] p-0" aria-label={`Zoom ${p.name}`}>
        <div className="card-stage" style={{ ["--tone" as string]: `var(--${p.tone})` }}>
          <ProductVisual product={p} className={p.image ? "card-photo object-cover" : "card-charm w-1/2 object-contain drop-shadow-charm"} />
        </div>
      </Button>
      <div className="mt-3 flex flex-col gap-2 px-1 sm:mt-4 lg:flex-row lg:items-start lg:justify-between lg:gap-3">
        <div className="min-w-0">
          <p className="meta-label">{p.category}</p>
          <h3 className="font-display text-base font-semibold leading-tight sm:text-xl">{p.name}</h3>
          <p className="hidden text-xs text-muted-foreground sm:block">{p.material}</p>
          <ProductPrice product={p} />
        </div>
        <Button variant="storefront" size="storefront" onClick={() => add(p.id)} className="focus-ring min-h-10 w-full shrink-0 rounded-full border-2 border-foreground px-4 py-2 lg:w-auto text-xs font-semibold transition hover:bg-foreground hover:text-background" aria-label={`Add ${p.name} to bag`}>Add to bag</Button>
      </div>
    </article>
  );
}

/** Zoomed-in preview shown when a product image is clicked. Only the button adds to bag. */
function ProductPreview({ p, onClose }: { p: Product | null; onClose: () => void }) {
  const { add } = useBag();
  return (
    <Dialog open={!!p} onOpenChange={(o) => { if (!o) onClose(); }}>
      <DialogContent aria-describedby={undefined} className="preview-dialog max-w-md gap-3 rounded-3xl border-2 border-foreground bg-background p-4 sm:max-w-lg sm:p-5">
        {p && (
          <>
            <div className="preview-stage overflow-hidden" style={{ ["--tone" as string]: `var(--${p.tone})` }}>
              <ProductVisual product={p} className={p.image ? "h-[54vh] w-full object-cover" : "w-2/3 object-contain drop-shadow-charm"} />
            </div>
            <div className="px-1">
              <p className="meta-label">{p.category}</p>
              <DialogTitle asChild>
                <h3 className="font-display truncate text-xl font-semibold leading-tight sm:text-2xl">{p.name}</h3>
              </DialogTitle>
              <p className="hidden text-xs text-muted-foreground sm:block">{p.material}</p>
              <ProductPrice product={p} />
            </div>
            <Button variant="storefront" size="storefront" onClick={() => add(p.id)} className="focus-ring min-h-12 w-full rounded-full border-2 border-foreground bg-lime px-4 font-semibold text-ink hover:bg-lime/80" aria-label={`Add ${p.name} to bag`}>Add to bag</Button>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

function Shop() {
  const { products } = useCatalogue();
  const [cat, setCat] = useState<(typeof categories)[number]>("All");
  const list = sortProductsByCollection(cat === "All" ? products : products.filter((p) => p.category === cat));
  return (
    <section id="shop" className="mx-auto max-w-7xl px-4 py-14 sm:px-6 md:px-10 md:py-20" aria-labelledby="shop-h">
      <div className="mb-8 flex flex-col justify-between gap-5 md:mb-10 lg:flex-row lg:items-end">
        <h2 id="shop-h" className="font-display text-4xl font-bold sm:text-5xl md:text-7xl">The shop</h2>
        <div role="group" aria-label="Filter by category" className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none] sm:mx-0 sm:flex-wrap sm:px-0">
          {categories.map((c) => (
            <Button variant="storefront" size="storefront" key={c} onClick={() => setCat(c)} aria-pressed={cat === c} className={`filter-chip focus-ring shrink-0 whitespace-nowrap ${cat === c ? "is-on" : ""}`}>{c}</Button>
          ))}
        </div>
      </div>
      <div className="grid grid-cols-2 gap-x-3 gap-y-8 sm:gap-x-5 sm:gap-y-10 md:grid-cols-3 lg:gap-x-6 lg:gap-y-12">
        {list.map((p) => <ProductCard key={p.id} p={p} />)}
      </div>
      {list.length === 0 && <p className="py-10 text-muted-foreground">No products in this collection yet.</p>}
    </section>
  );
}

function About() {
  return (
    <section id="about" className="mx-auto max-w-4xl px-5 py-24 text-center md:px-10">
      <p className="meta-label mb-4">About buzzko</p>
      <p className="font-display text-3xl font-semibold leading-tight md:text-5xl">
        Tiny <span className="text-pink-deep">objects</span> with big <span className="text-purple">personality</span>. Designed to dangle, clip, collect and swap — made in small batches.
      </p>
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t-2 border-foreground bg-background">
      <div className="mx-auto max-w-7xl px-5 py-10 md:px-10">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div>
            <Wordmark className="text-3xl sm:text-4xl" />
            <p className="meta-label mt-3">keychains • phone charms • frames</p>
          </div>
          <ul className="flex flex-wrap items-center gap-2">
            <li><a href="https://wa.me/919625924179" target="_blank" rel="noopener noreferrer" aria-label="WhatsApp +91 9625924179" title="WhatsApp +91 9625924179" className="social-logo social-whatsapp focus-ring">
              <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M20.5 3.5A11.9 11.9 0 0 0 12 .01C5.4.01.02 5.38.02 11.99c0 2.11.55 4.17 1.6 6L0 24l6.15-1.61A11.94 11.94 0 0 0 12 23.9h.01c6.6 0 11.98-5.37 11.98-11.98 0-3.2-1.24-6.2-3.49-8.42ZM12 21.88a9.94 9.94 0 0 1-5.06-1.38l-.36-.22-3.75.98 1-3.65-.24-.38A9.92 9.92 0 0 1 2.06 12c0-5.49 4.46-9.95 9.95-9.95a9.88 9.88 0 0 1 7.03 2.92 9.88 9.88 0 0 1 2.91 7.03c0 5.49-4.46 9.88-9.95 9.88Zm5.46-7.44c-.3-.15-1.77-.87-2.04-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.17-.17.2-.35.22-.65.07-.3-.15-1.26-.46-2.4-1.48-.89-.79-1.49-1.77-1.67-2.07-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.18.2-.3.3-.5.1-.2.05-.37-.03-.52-.07-.15-.67-1.62-.92-2.22-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.8.37-.27.3-1.04 1.02-1.04 2.49s1.07 2.9 1.22 3.1c.15.2 2.1 3.21 5.1 4.5.72.31 1.28.5 1.72.64.72.23 1.38.2 1.9.12.58-.09 1.77-.72 2.02-1.42.25-.7.25-1.29.18-1.42-.08-.12-.28-.2-.58-.35Z" /></svg>
            </a></li>
            <li><a href="https://www.instagram.com/buzz.ko/" target="_blank" rel="noopener noreferrer" aria-label="Instagram @buzz.ko" title="Instagram @buzz.ko" className="social-logo social-instagram focus-ring">
              {/* Original Instagram logo with official gradient */}
              <svg viewBox="0 0 24 24" width={24} height={24} fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                <defs>
                  <linearGradient id="buzzko-ig-linear" x1="10%" y1="100%" x2="90%" y2="0%">
                    <stop offset="0%" stopColor="#405de6" />
                    <stop offset="25%" stopColor="#5851db" />
                    <stop offset="50%" stopColor="#833ab4" />
                    <stop offset="75%" stopColor="#c13584" />
                    <stop offset="100%" stopColor="#e1306c" />
                  </linearGradient>
                  <radialGradient id="buzzko-ig-radial" cx="20%" cy="110%" r="130%" fx="20%" fy="110%">
                    <stop offset="0%" stopColor="#ffd521" />
                    <stop offset="10%" stopColor="#ffd521" />
                    <stop offset="50%" stopColor="#f50000" />
                    <stop offset="100%" stopColor="#b900b4" stopOpacity="0" />
                  </radialGradient>
                </defs>
                <rect width="24" height="24" rx="5.5" fill="url(#buzzko-ig-linear)" />
                <rect width="24" height="24" rx="5.5" fill="url(#buzzko-ig-radial)" />
                <rect x="3.8" y="3.8" width="16.4" height="16.4" rx="4.5" stroke="#ffffff" strokeWidth="1.75" fill="none" />
                <circle cx="12" cy="12" r="3.7" stroke="#ffffff" strokeWidth="1.75" fill="none" />
                <circle cx="16.5" cy="7.5" r="1.15" fill="#ffffff" />
              </svg>
            </a></li>
            <li><a href="https://www.facebook.com/search/pages/?q=Buzzko" target="_blank" rel="noopener noreferrer" aria-label="Find Buzzko on Facebook" title="Find Buzzko on Facebook" className="social-logo social-facebook focus-ring">
              {/* Official Facebook logo */}
              <svg viewBox="0 0 24 24" width={24} height={24} aria-hidden="true">
                <path
                  fill="#1877F2"
                  d="M24 12c0-6.627-5.373-12-12-12S0 5.373 0 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 22.954 24 17.99 24 12z"
                />
                <path
                  fill="#ffffff"
                  d="M16.671 15.469l.532-3.47h-3.328v-2.25c0-.949.465-1.874 1.956-1.874h1.513V4.922s-1.374-.235-2.686-.235c-2.741 0-4.533 1.662-4.533 4.669v2.57H7.078v3.47h3.047v8.385a12.09 12.09 0 003.75 0v-8.385h2.796z"
                />
              </svg>
            </a></li>
          </ul>
        </div>
        <div className="mt-8 flex flex-col items-center gap-3 border-t border-border pt-6 text-sm text-muted-foreground md:flex-row md:justify-between">
          <p className="inline-flex items-center gap-2">
            <Truck className="h-4 w-4" aria-hidden="true" />
            Free shipping across India over ₹999
          </p>
          <p>
            Designed by{" "}
            <a
              href="https://www.instagram.com/surajit_unfiltered/"
              target="_blank"
              rel="noopener noreferrer"
              className="credit-link focus-ring rounded"
              aria-label="Designed by Surajit Sahoo — Instagram @surajit_unfiltered"
            >
              Surajit Sahoo
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}

function BagDrawer() {
  const { open, setOpen, lines, setQty, remove, subtotal } = useBag();
  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetContent className="flex w-full flex-col bg-background sm:max-w-md">
        <SheetHeader>
          <SheetTitle className="font-display text-3xl">Your bag</SheetTitle>
          <SheetDescription>{lines.length ? "Review your charms." : "Your bag is empty — go pick a charm."}</SheetDescription>
        </SheetHeader>
        <ul className="flex-1 space-y-4 overflow-y-auto px-4">
          {lines.map(({ product: p, qty }) => (
            <li key={p.id} className="flex items-center gap-4 rounded-2xl bg-muted p-3">
              <div className="grid h-16 w-16 shrink-0 place-items-center rounded-xl bg-background"><ProductVisual product={p} className="w-11 object-contain" /></div>
              <div className="flex-1">
                <p className="font-semibold">{p.name}</p>
                <ProductPrice product={p} />
                <div className="mt-2 flex items-center gap-2">
                  <Button variant="storefront" size="storefront" className="qty-btn focus-ring" onClick={() => setQty(p.id, qty - 1)} aria-label={`Decrease ${p.name}`}><Minus className="h-3 w-3" /></Button>
                  <span className="w-6 text-center text-sm" aria-label="Quantity">{qty}</span>
                  <Button variant="storefront" size="storefront" className="qty-btn focus-ring" onClick={() => setQty(p.id, qty + 1)} aria-label={`Increase ${p.name}`}><Plus className="h-3 w-3" /></Button>
                </div>
              </div>
              <div className="flex flex-col items-end gap-2">
                <span className="text-sm font-semibold">{formatINR(sellingPrice(p) * qty)}</span>
                <Button variant="storefront" size="storefront" onClick={() => remove(p.id)} className="focus-ring rounded p-1 text-muted-foreground hover:text-foreground" aria-label={`Remove ${p.name}`}><X className="h-4 w-4" /></Button>
              </div>
            </li>
          ))}
        </ul>
        <div className="border-t border-border p-4">
          <div className="flex justify-between text-lg font-semibold"><span>Subtotal</span><span>{formatINR(subtotal)}</span></div>
          {lines.length > 0 ? <>
            <Button asChild variant="storefront" className="mt-4 min-h-12 w-full rounded-full border-2 border-foreground bg-lime px-4 font-semibold text-ink hover:bg-lime/80"><a href={whatsappOrderUrl(lines)} target="_blank" rel="noopener noreferrer"><MessageCircle aria-hidden="true" />Order on WhatsApp</a></Button>
            <Button asChild variant="outline" className="mt-3 min-h-12 w-full rounded-full border-2 border-foreground" onClick={() => setOpen(false)}><Link to="/checkout">Checkout</Link></Button>
          </> : <Button variant="outline" className="mt-4 min-h-12 w-full rounded-full" onClick={() => setOpen(false)}>Continue shopping</Button>}
        </div>
      </SheetContent>
    </Sheet>
  );
}

export function Storefront() {
  const [preview, setPreview] = useState<Product | null>(null);
  return (
    <PreviewSetterContext.Provider value={setPreview}>
      <Nav />
      <main><Hero /><OfferStrip /><Shop /><About /></main>
      <Footer />
      <BagDrawer />
      <ProductPreview p={preview} onClose={() => setPreview(null)} />
    </PreviewSetterContext.Provider>
  );
}
