import { BarChart3, Grid3X3, Package, ShoppingCart } from "lucide-react";
import React, { type ReactNode } from "react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarSeparator,
} from "@/components/ui/sidebar";
import { useRouter } from "next/router";
import Link from "next/link";
import { useTheme } from "next-themes";
import { Button } from "../ui/button";

interface DashboardProps {
  children: ReactNode;
  className?: string;
}

interface DashboardLayoutProps {
  children: ReactNode;
}

export const DashboardHeader = ({
  children,
  className = "",
}: DashboardProps) => {
  return <header className={`mb-6 space-y-2 ${className}`}>{children}</header>;
};

export const DashboardTitle = ({
  children,
  className = "",
}: DashboardProps) => (
  <h1 className={`text-2xl font-bold tracking-tight ${className}`}>
    {children}
  </h1>
);

export const DashboardDescription = ({
  children,
  className = "",
}: DashboardProps) => (
  <p className={`text-muted-foreground ${className}`}>{children}</p>
);

export const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  const router = useRouter();
  const { theme, setTheme } = useTheme();

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  return (
    <SidebarProvider defaultOpen={true}>
      <div className="flex h-screen w-full">
        <Sidebar>
          <SidebarHeader className="p-4">
            <h2 className="text-xl font-bold">Quickie</h2>
          </SidebarHeader>

          <SidebarContent className="px-4">
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  tooltip="Create Order"
                  isActive={router.pathname.includes("/dashboard")}
                >
                  <Link href="/dashboard">
                    <ShoppingCart className="mr-2 h-4 w-4" />
                    Dashboard
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>

            <SidebarSeparator className="my-2" />

            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  tooltip="Category Management"
                  isActive={router.pathname.includes("/categories")}
                >
                  <Link href="/categories">
                    <Grid3X3 className="mr-2 h-4 w-4" />
                    Category Management
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  tooltip="Product Management"
                  isActive={router.pathname.includes("/products")}
                >
                  <Link href="/products">
                    <Package className="mr-2 h-4 w-4" />
                    Product Management
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  tooltip="Sales Dashboard"
                  isActive={router.pathname.includes("/sales")}
                >
                  <Link href="/sales">
                    <BarChart3 className="mr-2 h-4 w-4" />
                    Sales Dashboard
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarContent>
          <SidebarFooter className="p-4">
            <p className="text-muted-foreground text-xs">Quickie v1.0</p>
            <div className="flex items-center gap-2">
              <Button variant="ghost" onClick={toggleTheme}>
                {theme === "dark" ? "Dark Mode" : "Light Mode"}
              </Button>
            </div>
          </SidebarFooter>
        </Sidebar>

        <main className="relative flex-1 overflow-auto p-6">{children}</main>
      </div>
    </SidebarProvider>
  );
};
