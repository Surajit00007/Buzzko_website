import { useEffect, useState } from "react";
import type { Product } from "@/data/products";
import { supabase } from "@/integrations/supabase/client";
import { Charm } from "./Charm";
export function ProductVisual({ product, className = "" }: { product: Product; className?: string }) {
  const [url, setUrl] = useState("");
  useEffect(() => {
    let active = true;
    setUrl("");
    async function load() {
      if (!product.image) return;
      const { data } = await supabase.storage.from("product-images").createSignedUrl(product.image, 3600);
      if (active) setUrl(data?.signedUrl ?? "");
    }
    void load();
    const timer = setInterval(() => { void load(); }, 50 * 60 * 1000);
    return () => { active = false; clearInterval(timer); };
  }, [product.image]);
  return url ? <img src={url} alt={product.name} className={`aspect-square ${className}`} onError={() => setUrl("")} /> : <Charm shape={product.shape} tone={product.tone} accent={product.accent} className={className} />;
}