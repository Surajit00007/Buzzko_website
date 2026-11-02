import { useState, type FormEvent } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowLeft, Plus, Pencil, Trash2, Save, X, Upload, LogOut } from "lucide-react";
import { type Product, formatINR } from "@/data/products";
import { useCatalogue } from "@/lib/catalogue";
import { productSchema, validatedProductSchema, productCategories, shapes, tones } from "@/lib/catalogue-rules";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ProductVisual } from "./ProductVisual";
import { ProductPrice } from "./ProductPrice";
import { Wordmark } from "./Storefront";

function newProduct(order: number): Product {
  return { id: crypto.randomUUID(), name: "", category: "Keychains", material: "", price: 0,
    shape: "heart", tone: "pink", accent: "yellow", description: "", featured: false, featuredOrder: order };
}
const selectClass = "h-10 w-full rounded-md border border-input bg-background px-3 text-sm focus-ring";
const swatchClasses = { pink: "bg-pink", purple: "bg-purple", lime: "bg-lime", cyan: "bg-cyan", yellow: "bg-yellow", ink: "bg-ink" };

export function Studio() {
  const { products, ready, storageError, saveProduct, deleteProduct } = useCatalogue();
  const [draft, setDraft] = useState<Product | null>(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [deleting, setDeleting] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const { signOut } = useAuth();
  function edit(p: Product) { setDraft({ ...p }); setError(""); setNotice(""); setDeleting(null); }
  function update<K extends keyof Product>(key: K, value: Product[K]) {
    setDraft((current) => current ? { ...current, [key]: value } : current);
  }
  async function save(event: FormEvent) {
    event.preventDefault();
    if (!draft) return;
    const result = validatedProductSchema.safeParse(draft);
    if (!result.success) { setError(result.error.issues.map((issue) => issue.message).join(" ")); return; }
    setBusy(true);
    try {
      await saveProduct(result.data);
      setNotice(`${result.data.name} saved to the collection.`);
      setDraft(null); setError("");
    } catch (err) { setError(err instanceof Error ? err.message : "Could not save this product."); }
    finally { setBusy(false); }
  }
  async function remove(p: Product) {
    try {
      await deleteProduct(p.id); setDeleting(null);
      if (draft?.id === p.id) setDraft(null);
      setNotice(`${p.name} removed from the collection and bag.`); setError("");
    } catch (err) { setError(err instanceof Error ? err.message : "Could not remove this product."); }
  }
  async function upload(file: File | undefined) {
    if (!file || !draft) return;
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type) || file.size > 5 * 1024 * 1024) { setError("Choose a JPG, PNG or WebP image under 5 MB."); return; }
    setBusy(true); setError("");
    const extension = file.type === "image/jpeg" ? "jpg" : file.type === "image/png" ? "png" : "webp";
    const path = `photos/${crypto.randomUUID()}.${extension}`;
    try {
      const { error } = await supabase.storage.from("product-images").upload(path, file, { contentType: file.type });
      if (error) throw error;
      update("image", path); setNotice("Photo uploaded. Save the product to publish it.");
    } catch { setError("Could not upload this image. Please try again."); }
    finally { setBusy(false); }
  }
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-6 md:px-10">
          <Link to="/" className="focus-ring"><Wordmark className="text-4xl" /></Link>
          <div className="flex gap-2"><Button asChild variant="ghost"><Link to="/"><ArrowLeft />Back to shop</Link></Button><Button variant="ghost" size="icon" aria-label="Sign out" title="Sign out" onClick={() => void signOut()}><LogOut /></Button></div>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-5 py-10 md:px-10">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-5">
          <div>
            <p className="meta-label mb-3">buzzko studio</p>
            <h1 className="font-display text-4xl font-semibold md:text-5xl">your collection</h1>
            <p className="mt-3 max-w-xl text-sm text-muted-foreground">Your collection is saved securely and shared with the storefront.</p>
          </div>
          <Button disabled={!ready || busy} onClick={() => edit(newProduct(Math.max(0, ...products.map((p) => p.featuredOrder)) + 1))}><Plus />Add product</Button>
        </div>
        <p role="status" className="mb-5 text-sm text-purple">{notice}</p>
        {(error || storageError) && <p role="alert" className="mb-5 text-sm text-destructive">{error || storageError}</p>}
        <div className={`grid items-start gap-10 ${draft ? "lg:grid-cols-[minmax(0,1fr)_minmax(320px,420px)]" : ""}`}>
          <section aria-label="Collection products" className="min-w-0">
            <p className="mb-4 text-sm text-muted-foreground">{products.length} products · {products.filter((p) => p.featured).length} best picks</p>
            <ul className="divide-y divide-border border-y border-border">
              {products.map((p) => <li key={p.id} className="flex flex-wrap items-center gap-4 py-5" data-studio-id={p.id}>
                <div className="grid h-16 w-16 shrink-0 place-items-center"><ProductVisual product={p} className="w-12 object-contain" /></div>
                <div className="min-w-0 flex-1 basis-36">
                  <h2 className="break-words font-display text-xl font-semibold">{p.name}</h2>
                  <p className="text-xs text-muted-foreground">{p.category}</p><ProductPrice product={p} />
                  <p className="mt-1 text-xs text-purple">{p.featured ? `Best pick · order ${p.featuredOrder}` : "Shop only"}</p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="icon" aria-label={`Edit ${p.name}`} title={`Edit ${p.name}`} onClick={() => edit(p)}><Pencil /></Button>
                  <Button variant="ghost" size="icon" aria-label={`Delete ${p.name}`} title={`Delete ${p.name}`} onClick={() => setDeleting(p.id)}><Trash2 /></Button>
                </div>
                {deleting === p.id && <div className="flex w-full flex-wrap items-center gap-3 text-sm">
                  <p>Remove {p.name} from the shop and bag?</p>
                  <Button variant="destructive" size="sm" onClick={() => remove(p)}>Remove product</Button>
                  <Button variant="ghost" size="sm" onClick={() => setDeleting(null)}>Cancel</Button>
                </div>}
              </li>)}
            </ul>
            {ready && products.length === 0 && <p className="py-10 text-muted-foreground">Your collection is empty.</p>}
          </section>
          {draft && <form onSubmit={save} noValidate className="min-w-0 border-t border-border pt-6 lg:border-t-0 lg:border-l lg:pl-8 lg:pt-0" aria-label="Product editor">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="font-display text-2xl font-semibold">{products.some((p) => p.id === draft.id) ? "Edit product" : "New product"}</h2>
              <Button variant="ghost" size="icon" type="button" aria-label="Close editor" title="Close editor" onClick={() => setDraft(null)}><X /></Button>
            </div>
            <div className="grid h-32 place-items-center pb-4"><ProductVisual product={draft} className="w-24 object-contain" /></div>
            <div className="space-y-5">
              <label className="block text-sm font-medium">Name<Input autoFocus value={draft.name} onChange={(e) => update("name", e.target.value)} required className="mt-2" /></label>
              <label className="block text-sm font-medium">Category<select className={`${selectClass} mt-2`} value={draft.category} onChange={(e) => { const value = productSchema.shape.category.safeParse(e.target.value); if (value.success) update("category", value.data); }}>{productCategories.map((c) => <option key={c}>{c}</option>)}</select></label>
              <label className="block text-sm font-medium">Material<Input value={draft.material} onChange={(e) => update("material", e.target.value)} className="mt-2" /></label>
              <label className="block text-sm font-medium">Price (INR)<Input type="number" min="0.01" step="0.01" value={Number.isNaN(draft.price) ? "" : draft.price} onChange={(e) => update("price", e.target.value === "" ? NaN : Number(e.target.value))} required className="mt-2" /></label>
              <label className="block text-sm font-medium">Sale price (INR, optional)<Input type="number" min="0.01" step="0.01" value={draft.salePrice ?? ""} onChange={(e) => update("salePrice", e.target.value === "" ? undefined : Number(e.target.value))} className="mt-2" /></label>
              <ProductPrice product={draft} />
              <label className="block text-sm font-medium"><span className="inline-flex items-center gap-2"><Upload className="h-4 w-4" />Product photo</span><Input type="file" accept="image/jpeg,image/png,image/webp" disabled={busy} onChange={(e) => void upload(e.target.files?.[0])} className="mt-2" /></label>
              {draft.image && <Button type="button" variant="outline" size="sm" onClick={() => update("image", undefined)}><X />Remove photo</Button>}
              <label className="block text-sm font-medium">Description<Input value={draft.description} onChange={(e) => update("description", e.target.value)} className="mt-2" /></label>
              <label className="block text-sm font-medium">Shape<select className={`${selectClass} mt-2`} value={draft.shape} onChange={(e) => { const value = productSchema.shape.shape.safeParse(e.target.value); if (value.success) update("shape", value.data); }}>{shapes.map((s) => <option key={s}>{s}</option>)}</select></label>
              {(["tone", "accent"] as const).map((key) => <fieldset key={key}><legend className="mb-2 text-sm font-medium">{key === "tone" ? "Main colour" : "Accent colour"}</legend>
                <div role="group" aria-label={key === "tone" ? "Main colour" : "Accent colour"} className="flex flex-wrap gap-2">
                  {tones.map((tone) => <Button key={tone} variant="outline" size="icon" type="button" title={tone} aria-label={`${key === "tone" ? "Main" : "Accent"} colour ${tone}`} aria-pressed={draft[key] === tone} onClick={() => update(key, tone)} className={draft[key] === tone ? "ring-2 ring-purple ring-offset-2 ring-offset-background" : ""}><span className={`h-5 w-5 rounded-full ${swatchClasses[tone]}`} /></Button>)}
                </div>
              </fieldset>)}
              <label className="flex items-center gap-3 text-sm font-semibold"><input type="checkbox" checked={draft.featured} onChange={(e) => update("featured", e.target.checked)} className="h-4 w-4 accent-purple" />Best pick / Featured</label>
              <label className="block text-sm font-medium">Featured order<Input type="number" min="0" step="1" value={Number.isNaN(draft.featuredOrder) ? "" : draft.featuredOrder} onChange={(e) => update("featuredOrder", e.target.value === "" ? NaN : Number(e.target.value))} className="mt-2" /></label>
              <p className="text-xs text-muted-foreground">Lower numbers appear first. The hero shows up to six featured products.</p>
              <Button type="submit" disabled={busy} className="w-full"><Save />{busy ? "Please wait…" : "Save product"}</Button>
            </div>
          </form>}
        </div>
      </main>
    </div>
  );
}