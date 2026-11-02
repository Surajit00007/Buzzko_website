import { z } from "zod";
import { formatINR, type Product } from "@/data/products";
import { sellingPrice } from "./catalogue-rules";

export const buzzkoWhatsAppNumber = "919625924179";
export const deliverySchema = z.object({
  name: z.string().trim().min(1, "Enter your full name.").max(100),
  phone: z.string().trim().regex(/^(?:\+91[ -]?)?[6-9]\d{9}$/, "Enter a valid 10-digit Indian mobile number."),
  email: z.string().trim().email("Enter a valid email address.").max(255),
  address: z.string().trim().min(1, "Enter your house number and street.").max(300),
  landmark: z.string().trim().max(150),
  city: z.string().trim().min(1, "Enter your city.").max(100),
  state: z.string().trim().min(1, "Enter your state.").max(100),
  pincode: z.string().trim().regex(/^[1-9]\d{5}$/, "Enter a valid 6-digit PIN code."),
  notes: z.string().trim().max(500),
});
export type DeliveryDetails = z.infer<typeof deliverySchema>;
export type OrderLine = { product: Product; qty: number };

export function whatsappOrderUrl(lines: OrderLine[], customer?: DeliveryDetails) {
  if (!lines.length) throw new Error("Your bag is empty.");
  const subtotal = Math.round(lines.reduce((total, { product, qty }) => total + sellingPrice(product) * qty, 0) * 100) / 100;
  const parts = ["Hi buzzko! I'd like to order:", "", ...lines.map(({ product, qty }, index) =>
    `${index + 1}. ${product.name} [${product.id}] × ${qty} — ${formatINR(sellingPrice(product))} each — ${formatINR(sellingPrice(product) * qty)}`), "", `Subtotal: ${formatINR(subtotal)}`];
  if (customer) {
    const details = deliverySchema.parse(customer);
    parts.push("", "Contact & delivery details", `Name: ${details.name}`, `Mobile: ${details.phone}`, `Email: ${details.email}`,
      `Address: ${details.address}`, ...(details.landmark ? [`Landmark: ${details.landmark}`] : []),
      `City: ${details.city}`, `State: ${details.state}`, `PIN code: ${details.pincode}`, "Country: India",
      "Payment preference: Cash on delivery", ...(details.notes ? [`Order notes: ${details.notes}`] : []));
  }
  parts.push("", "Please confirm availability, shipping charges and the final total. Thank you!");
  return `https://wa.me/${buzzkoWhatsAppNumber}?text=${encodeURIComponent(parts.join("\n"))}`;
}