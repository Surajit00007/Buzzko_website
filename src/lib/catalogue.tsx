import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { initialProducts, type Product } from "@/data/products";
import { catalogueSchema, validatedProductSchema } from "./catalogue-rules";
import { supabase } from "@/integrations/supabase/client";

export const CATALOGUE_KEY = "buzzko.catalogue.v1";
interface CatalogueContext {
  products: Product[];
  ready: boolean;
  storageError: string;
  saveProduct: (product: Product) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
}
const Context = createContext<CatalogueContext | null>(null);

export function CatalogueProvider({ children }: { children: ReactNode }) {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [ready, setReady] = useState(false);
  const [storageError, setStorageError] = useState("");
  useEffect(() => {
    async function read() {
      try {
        const { data, error } = await supabase.from("products").select("data").order("sort_order").order("id");
        if (error) throw error;
        setProducts(catalogueSchema.parse((data ?? []).map((row) => row.data)));
        setStorageError("");
      } catch {
        setStorageError("The collection could not be loaded. Please refresh and try again.");
      }
      setReady(true);
    }
    void read();
    const sync = () => { void read(); };
    window.addEventListener("focus", sync);
    return () => window.removeEventListener("focus", sync);
  }, []);
  return <Context.Provider value={{ products, ready, storageError,
    saveProduct: async (product) => {
      const validated = validatedProductSchema.parse(product);
      const { error } = await supabase.from("products").upsert({ id: validated.id, data: JSON.parse(JSON.stringify(validated)), sort_order: validated.featuredOrder }).select("id").single();
      if (error) throw new Error("Could not save. An admin account is required.");
      setProducts((current) => current.some((p) => p.id === product.id) ? current.map((p) => p.id === product.id ? validated : p) : [...current, validated]);
    },
    deleteProduct: async (id) => {
      const { data, error } = await supabase.from("products").delete().eq("id", id).select("id");
      if (error || !data?.length) throw new Error("Could not remove this product. An admin account is required.");
      setProducts((current) => current.filter((p) => p.id !== id));
    },
  }}>{children}</Context.Provider>;
}
export function useCatalogue() {
  const context = useContext(Context);
  if (!context) throw new Error("useCatalogue outside CatalogueProvider");
  return context;
}