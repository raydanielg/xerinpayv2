"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowRight, Menu, Moon, Sun, X } from "lucide-react";

import { Button } from "@workspace/ui/components/button";
import { cn } from "@workspace/ui/lib/utils";

import { XerinPayLogo } from "@/components/landing/logo";

const LINKS = [
  { href: "#features", label: "Product" },
  { href: "#security", label: "Security" },
  { href: "#developers", label: "Developers" },
  { href: "#pricing", label: "Pricing" },
  { href: "#faq", label: "FAQ" },
] as const;

/**
 * Provider-agnostic theme toggle.
 *
 * Flips the `dark` class on <html> and mirrors the choice into the two
 * localStorage keys shadcn setups commonly use, so it stays in sync whether the
 * app is wired to next-themes (`theme`) or the custom shadcn provider
 * (`vite-ui-theme`). Swap the body for `useTheme()` if you prefer.
 */
function ThemeToggle() {
  const [isDark, setIsDark] = React.useState(false);
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
    setIsDark(document.documentElement.classList.contains("dark"));
  }, []);

  const toggle = React.useCallback(() => {
    const next = !document.documentElement.classList.contains("dark");
    document.documentElement.classList.toggle("dark", next);
    document.documentElement.style.colorScheme = next ? "dark" : "light";
    try {
      const value = next ? "dark" : "light";
      window.localStorage.setItem("theme", value);
      window.localStorage.setItem("vite-ui-theme", value);
    } catch {
      // Storage blocked (private mode) — the class toggle still applies.
    }
    setIsDark(next);
  }, []);

  return (
    <Button
      variant="ghost"
      size="icon"
      aria-label="Toggle colour theme"
      aria-pressed={mounted ? isDark : undefined}
      onClick={toggle}
      className="text-muted-foreground hover:text-foreground"
    >
      {mounted && isDark ? (
        <Sun className="size-4" />
      ) : (
        <Moon className="size-4" />
      )}
    </Button>
  );
}

export function MarketingNav() {
  const [scrolled, setScrolled] = React.useState(false);
  const [open, setOpen] = React.useState(false);

  React.useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Lock body scroll while the mobile sheet is open.
  React.useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-all duration-300",
        scrolled
          ? "border-b border-border/60 bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60"
          : "border-b border-transparent bg-transparent",
      )}
    >
      <nav
        aria-label="Main"
        className="mx-auto flex h-16 w-full max-w-7xl items-center gap-4 px-4 sm:px-6 lg:h-18 lg:px-8"
      >
        <Link
          href="/"
          className="rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        >
          <XerinPayLogo />
          <span className="sr-only">XerinPay home</span>
        </Link>

        <ul className="ml-6 hidden items-center gap-1 lg:flex">
          {LINKS.map((link) => (
            <li key={link.href}>
              <a
                href={link.href}
                className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>

        <div className="ml-auto flex items-center gap-1.5 sm:gap-2">
          <ThemeToggle />
          <Button
            asChild
            variant="ghost"
            size="sm"
            className="hidden sm:inline-flex"
          >
            <Link href="/auth/login">Sign in</Link>
          </Button>
          <Button asChild size="sm" className="group">
            <Link href="/auth/register">
              Get API keys
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            aria-expanded={open}
            aria-controls="mobile-nav"
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
          </Button>
        </div>
      </nav>

      {/* Mobile sheet */}
      <div
        id="mobile-nav"
        hidden={!open}
        className="border-t border-border/60 bg-background/95 backdrop-blur-xl lg:hidden"
      >
        <ul className="mx-auto grid max-w-7xl gap-1 px-4 py-4 sm:px-6">
          {LINKS.map((link) => (
            <li key={link.href}>
              <a
                href={link.href}
                onClick={() => setOpen(false)}
                className="flex items-center justify-between rounded-lg px-3 py-3 text-base font-medium text-foreground/90 transition-colors hover:bg-accent"
              >
                {link.label}
                <ArrowRight className="size-4 text-muted-foreground" />
              </a>
            </li>
          ))}
          <li className="mt-2 grid gap-2 border-t border-border pt-4 sm:hidden">
            <Button asChild variant="outline" className="w-full">
              <Link href="/auth/login">Sign in</Link>
            </Button>
          </li>
        </ul>
      </div>
    </header>
  );
}
