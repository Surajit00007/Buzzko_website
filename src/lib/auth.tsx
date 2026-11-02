import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { User } from "@supabase/supabase-js";
import { useQueryClient } from "@tanstack/react-query";
import { useNavigate, useRouter } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";

const Context = createContext<{ user: User | null; isAdmin: boolean; ready: boolean; refresh: () => Promise<void>; signOut: () => Promise<void> } | null>(null);
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setAdmin] = useState(false);
  const [ready, setReady] = useState(false);
  const queryClient = useQueryClient();
  const router = useRouter();
  const navigate = useNavigate();
  async function refresh() {
    const { data } = await supabase.auth.getUser();
    setUser(data.user);
    if (data.user) {
      const { data: role } = await supabase.rpc("has_role", { _user_id: data.user.id, _role: "admin" });
      setAdmin(role === true);
    } else setAdmin(false);
    setReady(true);
  }
  useEffect(() => {
    void refresh();
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (!["SIGNED_IN", "SIGNED_OUT", "USER_UPDATED"].includes(event)) return;
      if (event === "SIGNED_OUT") { setUser(null); setAdmin(false); }
      // Auth operations cannot be awaited inside the SDK's notification lock.
      setTimeout(() => { void refresh(); void router.invalidate(); if (event !== "SIGNED_OUT") void queryClient.invalidateQueries(); }, 0);
    });
    return () => subscription.unsubscribe();
  }, []);
  async function signOut() {
    await queryClient.cancelQueries(); queryClient.clear();
    await supabase.auth.signOut();
    setUser(null); setAdmin(false);
    await navigate({ to: "/auth", search: { admin: false, checkout: false }, replace: true });
  }
  return <Context.Provider value={{ user, isAdmin, ready, refresh, signOut }}>{children}</Context.Provider>;
}
export function useAuth() { const value = useContext(Context); if (!value) throw new Error("Auth provider missing"); return value; }