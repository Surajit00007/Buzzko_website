import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Wordmark } from "@/components/buzzko/Storefront";

export const Route = createFileRoute("/auth")({
  validateSearch: (search: Record<string, unknown>) => ({ admin: search["admin"] === true || search["admin"] === "true", checkout: search["checkout"] === true || search["checkout"] === "true" }),
  head: () => ({ meta: [{ title: "Sign in — buzzko" }, { name: "description", content: "Sign in to your buzzko account." }, { property: "og:title", content: "Sign in — buzzko" }, { property: "og:description", content: "Sign in to your buzzko account." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" }, { name: "robots", content: "noindex" }] }),
  component: AuthPage,
});
function AuthPage() {
  const { admin, checkout } = Route.useSearch();
  const { user, isAdmin, refresh, signOut } = useAuth();
  const navigate = useNavigate();
  const [signup, setSignup] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  async function submit(event: FormEvent) {
    event.preventDefault(); setBusy(true); setMessage("");
    try {
      if (signup && !admin) {
        const { error } = await supabase.auth.signUp({ email, password, options: { emailRedirectTo: `${window.location.origin}/auth?checkout=${checkout}` } });
        if (error) throw error;
        setMessage("Check your email to confirm your account, then sign in.");
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        await refresh();
        if (admin) {
          const { data: allowed } = await supabase.rpc("has_role", { _user_id: data.user.id, _role: "admin" });
          if (!allowed) { setMessage("This account does not have admin access."); return; }
        }
        setPassword("");
        await navigate({ to: admin ? "/studio" : checkout ? "/checkout" : "/" });
      }
    } catch (err) { setMessage(err instanceof Error ? err.message : "Sign-in failed. Please try again."); }
    finally { setBusy(false); }
  }
  return <main className="mx-auto min-h-screen max-w-md px-6 py-12">
    <Link to="/" className="focus-ring"><Wordmark className="text-5xl" /></Link>
    <h1 className="mb-8 mt-12 font-display text-3xl font-semibold">{admin ? "Admin login" : signup ? "Create an account" : "Sign in"}</h1>
    {user && (!admin || isAdmin) ? <div className="space-y-4"><p className="text-sm">You’re signed in.</p><Button asChild><Link to={admin ? "/studio" : checkout ? "/checkout" : "/"}>{admin ? "Manage collection" : checkout ? "Return to checkout" : "Back to shop"}</Link></Button><Button variant="ghost" onClick={() => void signOut()}>Sign out</Button></div> : <form onSubmit={submit} className="space-y-5">
      <label className="block text-sm font-medium">Email<Input type="email" autoComplete="email" required maxLength={255} value={email} onChange={(e) => setEmail(e.target.value)} className="mt-2" /></label>
      <label className="block text-sm font-medium">Password<Input type="password" autoComplete={signup ? "new-password" : "current-password"} required minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} className="mt-2" /></label>
      <Button className="w-full" disabled={busy}>{busy ? "Please wait…" : signup && !admin ? "Create account" : "Sign in"}</Button>
      {!admin && <Button variant="ghost" type="button" onClick={() => { setSignup(!signup); setMessage(""); }}>{signup ? "Already have an account? Sign in" : "Create an account"}</Button>}
    </form>}
    {message && <p role="status" className="mt-5 text-sm text-pink-deep">{message}</p>}
    <Button asChild variant="ghost" className="mt-6"><Link to="/">Continue browsing</Link></Button>
  </main>;
}