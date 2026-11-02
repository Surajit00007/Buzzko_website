import { createFileRoute, Link } from "@tanstack/react-router";
import { useAuth } from "@/lib/auth";
import { useBag } from "@/lib/bag";
import { formatINR } from "@/data/products";
import { Button } from "@/components/ui/button";
import { Wordmark } from "@/components/buzzko/Storefront";
import { ProductPrice } from "@/components/buzzko/ProductPrice";
import { useState, type FormEvent } from "react";
import { MessageCircle, ArrowLeft } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ProductVisual } from "@/components/buzzko/ProductVisual";
import { sellingPrice } from "@/lib/catalogue-rules";
import { deliverySchema, whatsappOrderUrl, type DeliveryDetails } from "@/lib/whatsapp-order";
export const Route = createFileRoute("/checkout")({
  head: () => ({ meta: [{ title: "Checkout — buzzko WhatsApp orders" }, { name: "description", content: "Review your buzzko bag, add delivery details and request your order on WhatsApp." }, { property: "og:title", content: "Checkout — buzzko WhatsApp orders" }, { property: "og:description", content: "Review your buzzko bag, add delivery details and request your order on WhatsApp." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" }, { name: "robots", content: "noindex" }] }),
  component: Checkout,
});
function Checkout() {
  const { user, ready } = useAuth(); const { lines, subtotal } = useBag();
  const [details, setDetails] = useState<DeliveryDetails>({ name: "", phone: "", email: "", address: "", landmark: "", city: "", state: "", pincode: "", notes: "" });
  const [errors, setErrors] = useState<Partial<Record<keyof DeliveryDetails, string>>>({});
  const [opened, setOpened] = useState(false);
  const fields: { key: keyof DeliveryDetails; label: string; autoComplete: string; type?: string; optional?: boolean; maxLength: number }[] = [
    { key: "name", label: "Full name", autoComplete: "name", maxLength: 100 },
    { key: "phone", label: "Mobile number", type: "tel", autoComplete: "tel", maxLength: 14 },
    { key: "email", label: "Email", type: "email", autoComplete: "email", maxLength: 255 },
    { key: "address", label: "House / flat, street & area", autoComplete: "address-line1", maxLength: 300 },
    { key: "landmark", label: "Landmark (optional)", autoComplete: "address-line2", optional: true, maxLength: 150 },
    { key: "city", label: "City", autoComplete: "address-level2", maxLength: 100 },
    { key: "state", label: "State", autoComplete: "address-level1", maxLength: 100 },
    { key: "pincode", label: "PIN code", autoComplete: "postal-code", maxLength: 6 },
  ];
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!user || !lines.length) return;
    const result = deliverySchema.safeParse({ ...details, email: details.email || user.email || "" });
    if (!result.success) {
      const next: Partial<Record<keyof DeliveryDetails, string>> = {};
      for (const issue of result.error.issues) next[issue.path[0] as keyof DeliveryDetails] = issue.message;
      setErrors(next);
      const firstField = event.currentTarget.querySelector<HTMLInputElement>(`[name="${result.error.issues[0]?.path[0]}"]`);
      firstField?.focus();
      return;
    }
    setErrors({});
    window.open(whatsappOrderUrl(lines, result.data), "_blank", "noopener,noreferrer");
    setOpened(true);
  }
  return <main className="mx-auto min-h-screen max-w-6xl px-5 py-8 sm:px-8 sm:py-12">
    <div className="flex items-center justify-between gap-4"><Link to="/" className="focus-ring"><Wordmark className="text-4xl sm:text-5xl" /></Link><Button asChild variant="ghost"><Link to="/"><ArrowLeft aria-hidden="true" />Shop</Link></Button></div>
    <h1 className="mb-10 mt-12 font-display text-4xl font-semibold sm:text-5xl">Checkout</h1>
    <div className="grid items-start gap-12 lg:grid-cols-[1.15fr_1fr] lg:gap-16">
      <section aria-labelledby="delivery-heading">
        <h2 id="delivery-heading" className="mb-6 font-display text-2xl font-semibold">Contact & delivery</h2>
        {!lines.length ? <><p className="text-muted-foreground">Your bag is empty.</p><Button asChild variant="outline" className="mt-6 rounded-full"><Link to="/">Continue shopping</Link></Button></> : !ready ? <p role="status">Checking your account…</p> : !user ? <Button asChild className="min-h-12 w-full rounded-full"><Link to="/auth" search={{ admin: false, checkout: true }}>Sign in to checkout</Link></Button> :
          <form onSubmit={submit} className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            {fields.map(({ key, label, optional, ...props }) => <label key={key} className={`block text-sm font-medium ${["address", "landmark", "email"].includes(key) ? "sm:col-span-2" : ""}`}>
              {label}<Input {...props} name={key} required={!optional} inputMode={key === "pincode" ? "numeric" : undefined} value={key === "email" ? details.email || user.email || "" : details[key]} onChange={(e) => { setDetails((current) => ({ ...current, [key]: e.target.value })); setOpened(false); }} aria-invalid={Boolean(errors[key])} aria-describedby={errors[key] ? `${key}-error` : undefined} className="mt-2 h-12 rounded-lg border-foreground/25 bg-background text-base focus-visible:ring-pink" />
              {errors[key] && <span id={`${key}-error`} className="mt-1 block text-xs text-destructive">{errors[key]}</span>}
            </label>)}
            <label className="block text-sm font-medium sm:col-span-2">Order notes (optional)<Textarea name="notes" maxLength={500} value={details.notes} onChange={(e) => setDetails((current) => ({ ...current, notes: e.target.value }))} className="mt-2 rounded-lg border-foreground/25 text-base focus-visible:ring-pink" /></label>
            <div className="sm:col-span-2">
              <p className="mb-3 text-sm font-medium">Cash on delivery · India</p>
              <p className="mb-5 text-sm text-muted-foreground">Shipping and final total confirmed by buzzko. Your order is confirmed only after buzzko replies on WhatsApp.</p>
              <Button type="submit" variant="storefront" className="min-h-12 w-full rounded-full border-2 border-foreground bg-lime px-4 font-semibold text-ink hover:bg-lime/80"><MessageCircle aria-hidden="true" />Order on WhatsApp</Button>
              <p className="mt-3 text-xs text-muted-foreground">Your contact and delivery details will be shared with buzzko on WhatsApp.</p>
              {opened && <p role="status" className="mt-4 text-sm font-medium">Send the prepared message in WhatsApp to request your order. <a href={whatsappOrderUrl(lines, { ...details, email: details.email || user.email || "" })} target="_blank" rel="noopener noreferrer" className="underline">Open WhatsApp again</a></p>}
            </div>
          </form>}
      </section>
      <section aria-labelledby="bag-heading" className="border-t-2 border-foreground pt-6 lg:border-t-0 lg:border-l lg:border-border lg:pl-10">
        <h2 id="bag-heading" className="mb-4 font-display text-2xl font-semibold">Your bag</h2>
        <ul className="divide-y divide-border">{lines.map(({ product, qty }) => <li key={product.id} className="flex items-center gap-4 py-5"><div className="grid h-16 w-16 shrink-0 place-items-center overflow-hidden rounded-lg bg-muted"><ProductVisual product={product} className="h-14 w-14 object-contain" /></div><div className="min-w-0 flex-1"><p className="font-medium">{product.name}</p><p className="text-sm text-muted-foreground">Quantity: {qty}</p><ProductPrice product={product} /></div><span className="shrink-0 font-semibold">{formatINR(sellingPrice(product) * qty)}</span></li>)}</ul>
        <p className="flex justify-between border-t border-border py-6 text-lg font-semibold"><span>Subtotal</span><span>{formatINR(subtotal)}</span></p>
        <p className="text-sm text-muted-foreground">Shipping confirmed on WhatsApp</p>
      </section>
    </div>
  </main>;
}