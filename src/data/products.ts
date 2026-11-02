// Initial prototype catalogue; the shared catalogue provider reads Cloud products.
export type Category = "Keychains" | "Phone Charms" | "Frames";
export type Shape = "heart" | "flower" | "star" | "smiley" | "letter" | "frame";
export type Tone = "pink" | "purple" | "lime" | "cyan" | "yellow" | "ink";

export interface Product {
  id: string;
  name: string;
  category: Category;
  material: string;
  price: number; // INR
  salePrice?: number | undefined;
  shape: Shape;
  tone: Tone;
  accent: Tone;
  description: string;
  featured: boolean;
  featuredOrder: number;
  image?: string | undefined;
}

export const initialProducts: Product[] = [
  { id: "bubble-heart", name: "Bubble Heart", category: "Keychains", material: "Glossy resin, gold-tone ring", price: 349, shape: "heart", tone: "pink", accent: "yellow", description: "A puffy domed heart cast in candy resin.", featured: true, featuredOrder: 1 },
  { id: "daisy-pop", name: "Daisy Pop", category: "Phone Charms", material: "Enamel on zinc alloy, lanyard strap", price: 299, shape: "flower", tone: "yellow", accent: "pink", description: "Five round petals around a sunny centre.", featured: true, featuredOrder: 2 },
  { id: "lucky-star", name: "Lucky Star", category: "Keychains", material: "Acrylic, silver lobster clip", price: 279, shape: "star", tone: "lime", accent: "purple", description: "A soft-cornered star with a chunky outline.", featured: true, featuredOrder: 3 },
  { id: "smiley-club", name: "Smiley Club", category: "Phone Charms", material: "Glossy resin, beaded strap", price: 329, shape: "smiley", tone: "cyan", accent: "ink", description: "A grinning disc for good-day energy.", featured: true, featuredOrder: 4 },
  { id: "initial-b", name: "Initial B", category: "Keychains", material: "Layered acrylic, split ring", price: 249, shape: "letter", tone: "purple", accent: "lime", description: "Your letter, extra chunky. Shown here as B.", featured: true, featuredOrder: 5 },
  { id: "mini-frame", name: "Mini Frame", category: "Frames", material: "Enamel frame, clear acrylic window", price: 449, shape: "frame", tone: "pink", accent: "cyan", description: "A tiny wavy frame for your favourite photo.", featured: true, featuredOrder: 6 },
];

export const categories = ["All", "Keychains", "Phone Charms", "Frames"] as const;

export const formatINR = (n: number) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", minimumFractionDigits: 0, maximumFractionDigits: 2 }).format(n);
