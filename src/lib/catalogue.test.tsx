import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, beforeEach, vi } from "vitest";
import { CatalogueProvider, useCatalogue, CATALOGUE_KEY } from "./catalogue";
import { BagProvider, useBag } from "./bag";
import { featuredProducts } from "./catalogue-rules";
import { initialProducts, type Product } from "@/data/products";

const backend = vi.hoisted(() => ({ products: [] as Product[], admin: true }));
vi.mock("@/integrations/supabase/client", () => ({ supabase: { from: () => ({
  select: () => ({ order: () => ({ order: async () => ({ data: backend.products.map((data) => ({ data })), error: null }) }) }),
  upsert: ({ data }: { data: Product }) => ({ select: () => ({ single: async () => {
    if (!backend.admin) return { data: null, error: new Error("Forbidden") };
    backend.products = backend.products.map((p) => p.id === data.id ? data : p);
    return { data: { id: data.id }, error: null };
  } }) }),
  delete: () => ({ eq: (_column: string, id: string) => ({ select: async () => {
    if (!backend.admin) return { data: [], error: null };
    backend.products = backend.products.filter((p) => p.id !== id);
    return { data: [{ id }], error: null };
  } }) }),
}) } }));

function Harness() {
  const { products, saveProduct, deleteProduct } = useCatalogue();
  const { add, subtotal, lines } = useBag();
  const first = products[0];
  return <>
    <output data-testid="picks">{featuredProducts(products).map((p) => p.id).join(",")}</output>
    <output data-testid="subtotal">{subtotal}</output>
    <output data-testid="names">{lines.map((line) => line.product.name).join(",")}</output>
    <button onClick={() => first && add(first.id)}>add</button>
    <button onClick={() => first && void saveProduct({ ...first, name: "Changed heart", price: 500, salePrice: 400, featured: false }).catch(() => {})}>edit</button>
    <button onClick={() => first && void deleteProduct(first.id).catch(() => {})}>delete</button>
  </>;
}
const view = () => render(<CatalogueProvider><BagProvider><Harness /></BagProvider></CatalogueProvider>);
describe("Shared Cloud catalogue", () => {
  beforeEach(() => { localStorage.clear(); backend.products = initialProducts.map((p) => ({ ...p })); backend.admin = true; });
  it("saves edits, updates hero selection and live bag price, and restores after remount", async () => {
    const mounted = view();
    await waitFor(() => expect(screen.getByTestId("picks").textContent).toContain("bubble-heart"));
    fireEvent.click(screen.getByText("add"));
    fireEvent.click(screen.getByText("add"));
    fireEvent.click(screen.getByText("edit"));
    await waitFor(() => expect(screen.getByTestId("picks").textContent).not.toContain("bubble-heart"));
    expect(screen.getByTestId("subtotal").textContent).toBe("800");
    expect(screen.getByTestId("names").textContent).toBe("Changed heart");
    expect(backend.products[0]).toMatchObject({ name: "Changed heart", price: 500, salePrice: 400, featured: false });
    expect(localStorage.getItem(CATALOGUE_KEY)).toBeNull();
    mounted.unmount();
    view();
    await waitFor(() => expect(screen.getByTestId("picks").textContent).not.toContain("bubble-heart"));
    fireEvent.click(screen.getByText("add"));
    expect(screen.getByTestId("subtotal").textContent).toBe("400");
  });
  it("removes deleted products from the bag", async () => {
    view();
    fireEvent.click(screen.getByText("add"));
    fireEvent.click(screen.getByText("delete"));
    await waitFor(() => expect(screen.getByTestId("subtotal").textContent).toBe("0"));
    expect(screen.getByTestId("names").textContent).toBe("");
  });
  it("shows a themed 'Added to your bag' bubble when an item is added, and hides it after ~2.4s", async () => {
    view();
    expect(screen.queryByText("Added to your bag")).toBeNull();
    fireEvent.click(screen.getByText("add"));
    expect(screen.getByText("Added to your bag")).toBeTruthy();
    expect(screen.getByText("Added to your bag").closest(".bag-bubble")?.textContent).toContain(initialProducts[0]?.name ?? "");
    fireEvent.click(screen.getByText("add"));
    expect(screen.getByText("Added to your bag")).toBeTruthy();
    await new Promise((resolve) => setTimeout(resolve, 2500));
    expect(screen.queryByText("Added to your bag")).toBeNull();
  });
  it("keeps an intentionally empty Cloud catalogue after refresh", async () => {
    backend.products = [];
    view();
    await waitFor(() => expect(screen.getByTestId("picks").textContent).toBe(""));
  });
  it("does not apply edits or deletions when Cloud denies a non-admin", async () => {
    backend.admin = false; view();
    await waitFor(() => expect(screen.getByTestId("picks").textContent).toContain("bubble-heart"));
    fireEvent.click(screen.getByText("edit")); fireEvent.click(screen.getByText("delete"));
    await waitFor(() => expect(backend.products[0]?.name).toBe("Bubble Heart"));
    expect(backend.products).toHaveLength(6);
  });
});