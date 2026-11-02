import { formatINR, type Product } from "@/data/products";
import { sellingPrice, discountPercent } from "@/lib/catalogue-rules";
export function ProductPrice({ product }: { product: Product }) {
  return <span className="inline-flex flex-wrap items-center gap-x-2 gap-y-1 text-sm">
    <span className="font-semibold">{formatINR(sellingPrice(product))}</span>
    {product.salePrice !== undefined && <><s className="text-xs text-muted-foreground">{formatINR(product.price)}</s><span className="text-xs font-semibold text-pink-deep">{discountPercent(product)}% off</span></>}
  </span>;
}