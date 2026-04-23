"use client";

import { createContext, useContext, type ReactNode } from "react";

export type AdminTheme = "light" | "dark";

const AdminThemeContext = createContext<AdminTheme>("light");

export function AdminThemeProvider({
  value,
  children,
}: {
  value: AdminTheme;
  children: ReactNode;
}) {
  return <AdminThemeContext.Provider value={value}>{children}</AdminThemeContext.Provider>;
}

export function useAdminTheme() {
  return useContext(AdminThemeContext);
}
