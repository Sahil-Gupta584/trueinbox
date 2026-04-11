import {  api } from "../lib/api";
import type {User} from "../lib/api";
import React, { useEffect, useState } from "react";
import { useSession } from "../lib/auth-client";
import { useLocation } from "wouter";
import { } from "lucide-react";
import { Logo } from "./logo";

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { data: session, isPending } = useSession();
  const [location, setLocation] = useLocation();
  const [checking, setChecking] = useState(true);
  const [profile, setProfile] = useState<User | null>(null);

  useEffect(() => {
    if (isPending) return;

    if (!session) {
      setLocation("/sign-in");
      setChecking(false);
      return;
    }

    // Fetch full profile to check name
    api.me().then((u) => {
      setProfile(u);
      if (!u.name && location !== "/onboarding") {
        setLocation("/onboarding");
      }
      setChecking(false);
    }).catch(() => {
      setChecking(false);
    });
  }, [session, isPending]);

  if (isPending || checking) {
    return (
      <div className="min-h-screen bg-muted flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Logo size={28} />
          <div className="w-5 h-5 rounded-full border-2 border-primary border-t-transparent animate-spin" />
        </div>
      </div>
    );
  }

  if (!session) return null;
  return <>{children}</>;
}
