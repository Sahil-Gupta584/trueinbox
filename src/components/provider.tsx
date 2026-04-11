import React, { useEffect } from "react";
import { initTheme } from "../lib/theme";

interface ProviderProps {
  children: React.ReactNode;
}

export function Provider({ children }: ProviderProps) {
  useEffect(() => {
    initTheme();
  }, []);

  return <>{children}</>;
}
