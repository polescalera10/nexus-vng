"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export function SignOutButton() {
  const router = useRouter();

  async function signOut() {
    await createClient().auth.signOut();
    router.refresh();
    router.replace("/area-privada");
  }

  return (
    <button
      type="button"
      onClick={signOut}
      className="rounded-full border border-text-strong/15 bg-transparent px-4 py-2 font-body text-[13px] font-semibold text-text-body transition-colors hover:bg-bg-elevated"
    >
      Cerrar sesión
    </button>
  );
}
