import { createContext, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { type Product } from "@/data/products";
import { useCatalogue } from "./catalogue";
import { bagLines, bagSubtotal } from "./catalogue-rules";

type Line = { product: Product; qty: number };
interface BagCtx {
  lines: Line[];
  count: number;
  subtotal: number;
  open: boolean;
  setOpen: (v: boolean) => void;
  add: (id: string) => void;
  setQty: (id: string, qty: number) => void;
  remove: (id: string) => void;
}
const Ctx = createContext<BagCtx | null>(null);

export function BagProvider({ children }: { children: ReactNode }) {
  const { products, ready } = useCatalogue();
  const [items, setItems] = useState<Record<string, number>>({});
  const [open, setOpen] = useState(false);
  // Themed "added to your bag" bubble: { product, key } — key bumps on every add
  // so a rapid re-add restarts the pop animation and the auto-hide timer.
  const [added, setAdded] = useState<{ product: Product; key: number } | null>(null);
  const hideTimer = useRef<number | undefined>(undefined);
  const keyRef = useRef(0);
  useEffect(() => () => window.clearTimeout(hideTimer.current), []);
  useEffect(() => {
    if (ready) setItems((current) => Object.fromEntries(Object.entries(current).filter(([id]) => products.some((p) => p.id === id))));
  }, [products, ready]);

  const value = useMemo<BagCtx>(() => {
    const lines = bagLines(products, items);
    return {
      lines,
      count: lines.reduce((s, l) => s + l.qty, 0),
      subtotal: bagSubtotal(products, items),
      open,
      setOpen,
      add: (id) => {
        const p = products.find((x) => x.id === id);
        if (!p) return;
        setItems((s) => ({ ...s, [id]: (s[id] ?? 0) + 1 }));
        setAdded({ product: p, key: ++keyRef.current });
        window.clearTimeout(hideTimer.current);
        hideTimer.current = window.setTimeout(() => setAdded(null), 2400);
      },
      setQty: (id, qty) =>
        setItems((s) => {
          const n = { ...s };
          if (qty <= 0) delete n[id];
          else n[id] = qty;
          return n;
        }),
      remove: (id) => setItems((s) => { const n = { ...s }; delete n[id]; return n; }),
    };
  }, [items, open, products]);

  return (
    <Ctx.Provider value={value}>
      {children}
      <div className="bag-toast-region" role="status" aria-live="polite">
        {added && (
          <div key={added.key} className="bag-bubble">
            <span className="bag-bubble-check" aria-hidden>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3.5} strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 12.5l5 5L20 6.5" />
              </svg>
            </span>
            <span className="bag-bubble-copy">
              <span className="bag-bubble-title">Added to your bag</span>
              <span className="bag-bubble-item">{added.product.name}</span>
            </span>
          </div>
        )}
      </div>
    </Ctx.Provider>
  );
}

export const useBag = () => {
  const c = useContext(Ctx);
  if (!c) throw new Error("useBag outside BagProvider");
  return c;
};
