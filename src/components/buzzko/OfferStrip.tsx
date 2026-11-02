import { Truck, Sparkles } from "lucide-react";
import { useCatalogue } from "@/lib/catalogue";
import { sellingPrice } from "@/lib/catalogue-rules";
import { Charm } from "./Charm";

export function OfferStrip() {
  const { products, ready } = useCatalogue();
  const keychains = products.filter((product) => product.category === "Keychains");
  // Never advertise a collection-wide price after an admin changes that offer.
  if (!ready || !keychains.length || !keychains.every((product) => sellingPrice(product) === 149)) return null;
  return <section className="offer-band" aria-label="Keychain offer">
    <a href="#shop" className="offer-strip focus-ring">
      <Sparkles className="offer-sparkle" aria-hidden="true" />
      <span className="offer-star" aria-hidden="true"><Charm shape="star" tone="pink" accent="purple" className="w-full" /></span>
      <p className="offer-copy">All <span className="offer-category">KEYCHAINS</span> at <span className="offer-price">₹149</span></p>
      <span className="offer-divider" aria-hidden="true" />
      <span className="offer-cod"><Truck aria-hidden="true" />COD Available</span>
      <span className="offer-smiley" aria-hidden="true"><Charm shape="smiley" tone="purple" accent="ink" className="w-full" /></span>
      <Sparkles className="offer-sparkle offer-sparkle-end" aria-hidden="true" />
    </a>
  </section>;
}