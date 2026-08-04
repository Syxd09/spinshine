import { createContext, useContext, type ReactNode } from "react";
import type { CatalogConfig } from "./catalog-actions";

const CatalogContext = createContext<CatalogConfig | null>(null);

export function CatalogProvider({
  config,
  children,
}: {
  config: CatalogConfig;
  children: ReactNode;
}) {
  return <CatalogContext.Provider value={config}>{children}</CatalogContext.Provider>;
}

export function useCatalog(): CatalogConfig {
  const ctx = useContext(CatalogContext);
  if (!ctx) throw new Error("useCatalog must be used inside <CatalogProvider>");
  return ctx;
}
