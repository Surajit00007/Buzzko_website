import { describe, expect, it } from "vitest";
import { initialProducts } from "@/data/products";
import { deliverySchema, whatsappOrderUrl } from "./whatsapp-order";

const keychain = { ...initialProducts[0], id: "keychain-04", name: "Cola Can Duo", price: 349, salePrice: 149 } as typeof initialProducts[number];
const details = { name: "Test Buyer", phone: "9876543210", email: "buyer@example.com", address: "12 Test Street", landmark: "Near park", city: "Kolkata", state: "West Bengal", pincode: "700001", notes: "Gift order" };
describe("WhatsApp ordering", () => {
  it("opens buzzko's existing WhatsApp number", () => {
    expect(new URL(whatsappOrderUrl([{ product: keychain, qty: 1 }])).pathname).toBe("/919625924179");
  });
  it("includes selected products, quantities and the selling-price subtotal", () => {
    const message = new URL(whatsappOrderUrl([{ product: keychain, qty: 2 }])).searchParams.get("text");
    expect(message).toContain("Cola Can Duo [keychain-04] × 2 — ₹149 each — ₹298");
    expect(message).toContain("Subtotal: ₹298");
  });
  it("includes checkout contact and delivery details", () => {
    const message = new URL(whatsappOrderUrl([{ product: keychain, qty: 1 }], details)).searchParams.get("text");
    for (const value of Object.values(details)) expect(message).toContain(value);
  });
  it("rejects empty bags", () => {
    expect(() => whatsappOrderUrl([])).toThrow();
  });
  it("requires valid delivery details before checkout handoff", () => {
    expect(deliverySchema.safeParse(details).success).toBe(true);
    for (const field of ["name", "phone", "email", "address", "city", "state", "pincode"]) {
      expect(deliverySchema.safeParse({ ...details, [field]: "" }).success).toBe(false);
    }
    expect(deliverySchema.safeParse({ ...details, pincode: "12345" }).success).toBe(false);
    expect(deliverySchema.safeParse({ ...details, phone: "12345" }).success).toBe(false);
  });
});