import { z } from "zod";
import type { Product } from "@/data/products";

export const productCategories = ["Keychains", "Phone Charms", "Frames"] as const;
export const shapes = ["heart", "flower", "star", "smiley", "letter", "frame"] as const;
export const tones = ["pink", "purple", "lime", "cyan", "yellow", "ink"] as const;
export const productSchema = z.object({
  id: z.string().min(1),
  name: z.string().trim().min(1, "Name is required."),
  category: z.enum(productCategories),
  material: z.string().trim(),
  price: z.number().finite().positive("Price must be positive."),
  salePrice: z.number().finite().positive("Sale price must be positive.").optional(),
  shape: z.enum(shapes),
  tone: z.enum(tones),
  accent: z.enum(tones),
  description: z.string(),
  image: z.string().regex(/^photos\/[a-zA-Z0-9_.-]+$/, "Choose an uploaded product image.").optional(),
  featured: z.boolean(),
  featuredOrder: z.number().int().nonnegative("Featured order must be a whole number, zero or above."),
});
export const validatedProductSchema = productSchema.refine((p) => p.salePrice === undefined || p.salePrice < p.price, "Sale price must be lower than the original price.");
export const catalogueSchema = z.array(validatedProductSchema).refine(
  (products) => new Set(products.map((p) => p.id)).size === products.length,
  "Product IDs must be unique.",
);
// Shop/collection display order: Keychains first, then Phone Charms, then Frames,
// keeping the existing featured order within each category.
const categoryRank: Record<(typeof productCategories)[number], number> = {
  Keychains: 0,
  "Phone Charms": 1,
  Frames: 2,
};
export function sortProductsByCollection(products: Product[]) {
  return [...products].sort(
    (a, b) => (categoryRank[a.category] ?? 99) - (categoryRank[b.category] ?? 99) || a.featuredOrder - b.featuredOrder,
  );
}
export function featuredProducts(products: Product[]) {
  return products.filter((p) => p.featured === true).sort((a, b) => a.featuredOrder - b.featuredOrder).slice(0, 7);
}
export function bagLines(products: Product[], items: Record<string, number>) {
  return products.flatMap((product) => {
    const qty = items[product.id] ?? 0;
    return qty > 0 ? [{ product, qty }] : [];
  });
}
export function bagSubtotal(products: Product[], items: Record<string, number>) {
  return Math.round(bagLines(products, items).reduce((sum, line) => sum + sellingPrice(line.product) * line.qty, 0) * 100) / 100;
}
export function sellingPrice(product: Product) { return product.salePrice ?? product.price; }
export function discountPercent(product: Product) { return product.salePrice === undefined ? 0 : Math.round((1 - product.salePrice / product.price) * 100); }