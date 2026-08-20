"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@workspace/ui/components/sidebar";
import { Badge } from "@workspace/ui/components/badge";

import { XerinPayLogo } from "@/components/landing/logo";
import { UserMenu } from "@/components/shell/user-menu";
import { ADMIN_NAV, MERCHANT_NAV, filterNav } from "@/lib/navigation";
import { usePermissions } from "@/lib/rbac/use-permissions";
import { useSession } from "@/lib/auth/session-provider";

/**
 * One sidebar component serves both portals. Which tree it renders comes from
 * the signed-in scope; which items survive comes from permissions. A Support
 * Agent and a Finance Officer see genuinely different navigation without either
 * being special-cased anywhere.
 */
export function AppSidebar({
  variant = "merchant",
  counters,
}: {
  variant?: "merchant" | "admin";
  counters?: Record<string, number | undefined>;
}) {
  const pathname = usePathname();
  const { has } = usePermissions();
  const { user } = useSession();

  const groups = React.useMemo(() => {
    const tree = variant === "admin" ? ADMIN_NAV : MERCHANT_NAV;
    return filterNav(tree, has);
  }, [variant, has]);

  const isActive = React.useCallback(
    (href: string) => {
      if (pathname === href) return true;
      // Avoid /admin matching every child route.
      const isRoot = href === "/admin" || href === "/dashboard";
      return !isRoot && pathname.startsWith(`${href}/`);
    },
    [pathname],
  );

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href={variant === "admin" ? "/admin" : "/dashboard"}>
                <XerinPayLogo wordmarkClassName="text-base" />
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>

        {variant === "merchant" && user?.merchant?.mode === "sandbox" ? (
          <div className="px-2 pb-1 group-data-[collapsible=icon]:hidden">
            <Badge
              variant="outline"
              className="w-full justify-center border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-400"
            >
              Sandbox mode
            </Badge>
          </div>
        ) : null}
      </SidebarHeader>

      <SidebarContent>
        {groups.map((group) => (
          <SidebarGroup key={group.label}>
            <SidebarGroupLabel>{group.label}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => {
                  const count = item.badgeKey ? counters?.[item.badgeKey] : undefined;
                  return (
                    <SidebarMenuItem key={item.href}>
                      <SidebarMenuButton
                        asChild
                        isActive={isActive(item.href)}
                        tooltip={item.title}
                      >
                        <Link href={item.href}>
                          {item.icon ? <item.icon /> : null}
                          <span>{item.title}</span>
                          {count ? (
                            <Badge
                              variant="secondary"
                              className="ml-auto h-5 min-w-5 justify-center px-1.5 text-[11px] tabular-nums group-data-[collapsible=icon]:hidden"
                            >
                              {count > 99 ? "99+" : count}
                            </Badge>
                          ) : null}
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>

      <SidebarFooter>
        <UserMenu />
      </SidebarFooter>
    </Sidebar>
  );
}
