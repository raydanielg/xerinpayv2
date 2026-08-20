"use client";

import * as React from "react";
import Link from "next/link";
import { Bell, Moon, Sun } from "lucide-react";

import { Badge } from "@workspace/ui/components/badge";
import { Button } from "@workspace/ui/components/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu";
import { Separator } from "@workspace/ui/components/separator";
import { SidebarTrigger } from "@workspace/ui/components/sidebar";

import { formatRelative } from "@/lib/format";
import { useMarkAllRead, useNotifications } from "@/lib/api/queries";
import { useSession } from "@/lib/auth/session-provider";

function ThemeToggle() {
  const [isDark, setIsDark] = React.useState(false);
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
    setIsDark(document.documentElement.classList.contains("dark"));
  }, []);

  return (
    <Button
      variant="ghost"
      size="icon"
      aria-label="Toggle colour theme"
      onClick={() => {
        const next = !document.documentElement.classList.contains("dark");
        document.documentElement.classList.toggle("dark", next);
        document.documentElement.style.colorScheme = next ? "dark" : "light";
        try {
          const value = next ? "dark" : "light";
          window.localStorage.setItem("theme", value);
          window.localStorage.setItem("vite-ui-theme", value);
        } catch {
          /* storage blocked — the class toggle still applies */
        }
        setIsDark(next);
      }}
      className="text-muted-foreground"
    >
      {mounted && isDark ? <Sun className="size-4" /> : <Moon className="size-4" />}
    </Button>
  );
}

function NotificationBell() {
  const { data } = useNotifications();
  const markAllRead = useMarkAllRead();

  const items = data?.results ?? [];
  const unread = items.filter((n) => !n.is_read);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative text-muted-foreground"
          aria-label={`Notifications${unread.length ? `, ${unread.length} unread` : ""}`}
        >
          <Bell className="size-4" />
          {unread.length ? (
            <span className="absolute right-1.5 top-1.5 flex size-2">
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-500 opacity-75" />
              <span className="relative inline-flex size-2 rounded-full bg-emerald-500" />
            </span>
          ) : null}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel className="flex items-center justify-between">
          Notifications
          {unread.length ? (
            <button
              type="button"
              onClick={() => markAllRead.mutate()}
              className="text-xs font-normal text-muted-foreground hover:text-foreground"
            >
              Mark all read
            </button>
          ) : null}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />

        {items.length === 0 ? (
          <p className="px-2 py-6 text-center text-sm text-muted-foreground">
            Nothing new.
          </p>
        ) : (
          items.slice(0, 8).map((item) => (
            <DropdownMenuItem key={item.id} asChild className="items-start gap-2">
              <Link href={item.href ?? "#"}>
                {!item.is_read ? (
                  <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-emerald-500" />
                ) : (
                  <span className="mt-1.5 size-1.5 shrink-0" />
                )}
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-medium">{item.title}</span>
                  <span className="block truncate text-xs text-muted-foreground">
                    {item.body}
                  </span>
                  <span className="mt-0.5 block text-[11px] text-muted-foreground">
                    {formatRelative(item.created_at)}
                  </span>
                </span>
              </Link>
            </DropdownMenuItem>
          ))
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function ShellHeader({ children }: { children?: React.ReactNode }) {
  const { user, isStaff } = useSession();
  const sandbox = !isStaff && user?.merchant?.mode === "sandbox";

  return (
    <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center gap-2 border-b border-border/60 bg-background/80 px-4 backdrop-blur-xl lg:px-6">
      <SidebarTrigger className="-ml-1" />
      <Separator orientation="vertical" className="mr-2 h-4" />

      <div className="min-w-0 flex-1">{children}</div>

      <div className="flex items-center gap-1">
        {sandbox ? (
          <Badge
            variant="outline"
            className="mr-1 hidden border-amber-500/30 bg-amber-500/10 text-amber-700 sm:inline-flex dark:text-amber-400"
          >
            Test data
          </Badge>
        ) : null}
        <NotificationBell />
        <ThemeToggle />
      </div>
    </header>
  );
}
