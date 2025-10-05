"use client";

import React from "react";
import SidebarLayout from "@/components/SidebarLayout";

const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <SidebarLayout>
      <main className="flex-1">{children}</main>
    </SidebarLayout>
  );
};

export default Layout;
