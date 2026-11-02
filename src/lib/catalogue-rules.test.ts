import { describe, it, expect } from "vitest";
import { initialProducts, type Product } from "@/data/products";
import { featuredProducts, productSchema, validatedProductSchema, bagLines, bagSubtotal, discountPercent, sellingPrice, sortProductsByCollection } from "./catalogue-rules";

const product = (overrides: Partial<Product> = {}): Product => ({ ...initialProducts[0], ...overrides } as Product);
describe("Catalogue rules", () => {
  it("charges the advertised ₹149 per keychain without discounting other categories", () => {
    const keychain = product({ category: "Keychains", price: 349, salePrice: 149 });
    const phone = product({ id: "phone", category: "Phone Charms", price: 299 });
    expect(sellingPrice(keychain)).toBe(149);
    expect(bagSubtotal([keychain, phone], { [keychain.id]: 2, phone: 1 })).toBe(597);
    expect(sellingPrice(phone)).toBe(299);
  });
  it("uses the sale price for bag totals", () => {
    const sale = product({ price: 500, salePrice: 400 });
    expect(sellingPrice(sale)).toBe(400);
    expect(bagSubtotal([sale], { [sale.id]: 3 })).toBe(1200);
  });
  it("derives the percentage from original and sale prices", () => {
    expect(discountPercent(product({ price: 500, salePrice: 400 }))).toBe(20);
    expect(discountPercent(product({ price: 500 }))).toBe(0);
  });
  it("requires a positive sale price below the original", () => {
    expect(validatedProductSchema.safeParse(product({ price: 500, salePrice: 0 })).success).toBe(false);
    expect(validatedProductSchema.safeParse(product({ price: 500, salePrice: 500 })).success).toBe(false);
    expect(validatedProductSchema.safeParse(product({ price: 500, salePrice: 600 })).success).toBe(false);
    expect(validatedProductSchema.safeParse(product({ price: 500, salePrice: 400 })).success).toBe(true);
  });
  it("selects only featured products in featuredOrder", () => {
    expect(featuredProducts([product({ id: "later", featuredOrder: 9 }), product({ id: "excluded", featured: false, featuredOrder: 0 }), product({ id: "first", featuredOrder: 1 })]).map((p) => p.id)).toEqual(["first", "later"]);
  });
  it("includes a seventh featured photo and caps picks at seven", () => {
    expect(featuredProducts(Array.from({ length: 8 }, (_, i) => product({ id: String(i), featuredOrder: i }))).map((p) => p.id)).toEqual(["0", "1", "2", "3", "4", "5", "6"]);
  });
  it("does not fill fewer than four featured products", () => {
    expect(featuredProducts([product(), product({ id: "not-featured", featured: false })])).toHaveLength(1);
  });
  it("returns no arbitrary picks for an empty featured collection", () => {
    expect(featuredProducts([product({ featured: false })])).toEqual([]);
  });
  it("requires a nonblank name", () => {
    expect(productSchema.safeParse(product({ name: "  " })).success).toBe(false);
  });
  it("requires a positive price", () => {
    expect(productSchema.safeParse(product({ price: 0 })).success).toBe(false);
    expect(productSchema.safeParse(product({ price: -1 })).success).toBe(false);
    expect(productSchema.safeParse(product({ price: 0.01 })).success).toBe(true);
  });
  it("allows only valid categories", () => {
    expect(productSchema.safeParse({ ...product(), category: "Unknown" }).success).toBe(false);
    expect(productSchema.safeParse(product({ category: "Frames" })).success).toBe(true);
  });
  it("requires a valid whole-number featured order", () => {
    expect(productSchema.safeParse(product({ featuredOrder: -1 })).success).toBe(false);
    expect(productSchema.safeParse(product({ featuredOrder: 1.5 })).success).toBe(false);
  });
  it("recalculates bag names and subtotal from current product data", () => {
    const updated = product({ name: "Updated heart", price: 500 });
    expect(bagLines([updated], { [updated.id]: 2 })[0]?.product.name).toBe("Updated heart");
    expect(bagSubtotal([updated], { [updated.id]: 2 })).toBe(1000);
  });
  it("ignores deleted products without breaking remaining bag lines", () => {
    const remaining = product({ id: "remaining", price: 300 });
    expect(bagLines([remaining], { deleted: 2, remaining: 3 })).toHaveLength(1);
    expect(bagSubtotal([remaining], { deleted: 2, remaining: 3 })).toBe(900);
  });
});describe("sortProductsByCollection", () => {
  it("shows Keychains first, then Phone Charms, then Frames", () => {
    const charms = product({ id: "charm", category: "Phone Charms" });
    const frame = product({ id: "frame", category: "Frames" });
    const keychain = product({ id: "key", category: "Keychains" });
    expect(sortProductsByCollection([charms, frame, keychain]).map((p) => p.id)).toEqual(["key", "charm", "frame"]);
  });
  it("keeps featured order within each category", () => {
    const a = product({ id: "a", category: "Keychains", featuredOrder: 3 });
    const b = product({ id: "b", category: "Keychains", featuredOrder: 1 });
    expect(sortProductsByCollection([a, b]).map((p) => p.id)).toEqual(["b", "a"]);
  });
});
