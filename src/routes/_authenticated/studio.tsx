import { createFileRoute } from "@tanstack/react-router";
import { Studio } from "@/components/buzzko/Studio";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
export const Route = createFileRoute("/_authenticated/studio")({
  head: () => ({ meta: [{ title: "buzzko studio — manage your collection" }, { name: "description", content: "Manage buzzko products, photos, prices and featured picks." }, { property: "og:title", content: "buzzko studio — manage your collection" }, { property: "og:description", content: "Manage buzzko products, photos, prices and featured picks." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" }, { name: "robots", content: "noindex" }] }),
  component: AdminStudio,
});
function AdminStudio() {
  const { ready, isAdmin, signOut } = useAuth();
  if (!ready) return <p className="p-8" role="status">Checking your account…</p>;
  if (!isAdmin) return <main className="mx-auto max-w-md space-y-5 px-6 py-16"><h1 className="font-display text-3xl">Admin access required</h1><p>This account cannot manage the collection.</p><Button onClick={() => void signOut()}>Sign out</Button></main>;
  return <Studio />;
}