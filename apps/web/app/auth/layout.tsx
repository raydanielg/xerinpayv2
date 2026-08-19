"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { ShieldCheck, Zap, Wallet, TrendingUp, Users, ArrowRight, type LucideIcon } from "lucide-react"

const slides = [
  {
    image: "/images/elegant-attractive-muslim-woman-using-mobile-laptop-searching-online-shopping-information-living-room-home-portrait-happy-woman-purchasing-product-via-online-shopping-pay-using-credit-card_657921-979.jpg",
    title: "Shop with Confidence",
    subtitle: "Pay securely for anything, anywhere — your money is protected on every transaction.",
    features: [
      { icon: ShieldCheck, title: "Secure Payments", desc: "End-to-end encryption on every transaction" },
      { icon: Zap, title: "Instant Transfers", desc: "Send and receive money in seconds" },
    ],
  },
  {
    image: "/images/ecommerce-phone-happy-black-woman-with-credit-card-online-shopping-digital-payment-app-home-smile-banking-excited-african-girl-checks-cash-budget-money-growth-savings-online_590464-111903.jpg",
    title: "Your Digital Wallet",
    subtitle: "Manage all your funds in one place — send, save, and spend with complete control.",
    features: [
      { icon: Wallet, title: "Digital Wallet", desc: "Manage all your funds in one place" },
      { icon: TrendingUp, title: "Grow Your Money", desc: "Track spending and save with insights" },
    ],
  },
  {
    image: "/images/2150384780.jpg",
    title: "Trusted by Thousands",
    subtitle: "Join a growing community of smart payers — fast, reliable, and always within reach.",
    features: [
      { icon: Users, title: "Trusted by Thousands", desc: "Join a growing community of smart payers" },
      { icon: ShieldCheck, title: "Bank-Grade Security", desc: "Your funds are safe and always protected" },
    ],
  },
]

function BrandingPanel() {
  const [current, setCurrent] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length)
    }, 6000)
    return () => clearInterval(interval)
  }, [])

  const slide = slides[current]!

  return (
    <div className="relative hidden overflow-hidden lg:flex lg:flex-col lg:justify-between lg:p-12">
      {/* Slideshow background */}
      {slides.map((s, i) => (
        <div
          key={i}
          className="absolute inset-0 transition-opacity duration-[1200ms] ease-in-out"
          style={{ opacity: i === current ? 1 : 0 }}
        >
          <Image
            src={s.image}
            alt={s.title}
            fill
            sizes="50vw"
            className="object-cover"
            priority={i === 0}
            loading={i === 0 ? "eager" : "lazy"}
          />
        </div>
      ))}

      {/* Overlay gradients */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/70 via-primary/40 to-black/85" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-black/40" />

      {/* Subtle grid pattern */}
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            "linear-gradient(white 1px, transparent 1px), linear-gradient(90deg, white 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />

      {/* Glow effects */}
      <div className="absolute -top-24 -right-24 size-96 rounded-full bg-primary/25 blur-3xl" />
      <div className="absolute -bottom-32 -left-32 size-96 rounded-full bg-primary/15 blur-3xl" />

      {/* Top - Brand name only (no logo) */}
      <div className="relative">
        <span className="text-xl font-semibold tracking-tight text-white">
          XerinPay
        </span>
      </div>

      {/* Middle - Rotating hero content */}
      <div className="relative flex flex-col gap-8 text-white">
        {/* Slide indicator dots */}
        <div className="flex items-center gap-2">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i === current ? "w-8 bg-white" : "w-1.5 bg-white/40 hover:bg-white/60"
              }`}
              aria-label={`Slide ${i + 1}`}
            />
          ))}
        </div>

        {/* Animated text content */}
        <div key={current} className="flex flex-col gap-4 animate-[fade-in-up_0.8s_ease-out_forwards]">
          <h2 className="text-4xl font-bold leading-tight tracking-tight">
            {slide.title}
          </h2>
          <p className="max-w-md text-lg text-white/75 leading-relaxed">
            {slide.subtitle}
          </p>

          <div className="mt-2 flex flex-col gap-3">
            {slide.features.map((feat, idx) => (
              <div key={idx} className="flex items-center gap-3">
                <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-white/10 backdrop-blur">
                  <feat.icon className="size-4 text-white" />
                </div>
                <div>
                  <p className="text-sm font-medium">{feat.title}</p>
                  <p className="text-xs text-white/50">{feat.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 flex items-center gap-2 text-sm text-white/60">
            <span>Learn more</span>
            <ArrowRight className="size-3.5" />
          </div>
        </div>
      </div>

      {/* Bottom - Trust badges */}
      <div className="relative flex flex-col gap-4">
        <div className="flex items-center gap-6 text-sm text-white/50">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="size-4" />
            <span>Secure</span>
          </div>
          <span className="size-1 rounded-full bg-white/20" />
          <div className="flex items-center gap-1.5">
            <Zap className="size-4" />
            <span>Instant</span>
          </div>
          <span className="size-1 rounded-full bg-white/20" />
          <div className="flex items-center gap-1.5">
            <Users className="size-4" />
            <span>Trusted</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      {/* Left - Form */}
      <div className="flex flex-col gap-4 p-6 sm:p-8 md:p-10">
        <div className="flex justify-center md:justify-start">
          <a href="/" className="group">
            <span className="bg-gradient-to-r from-primary via-orange-500 to-primary bg-clip-text text-3xl font-bold italic tracking-tight text-transparent transition-all duration-300 group-hover:tracking-wide sm:text-4xl" style={{ fontFamily: "var(--font-dancing)" }}>
              XerinPay
            </span>
          </a>
        </div>
        <div className="flex flex-1 items-center justify-center pb-10">
          <div className="w-full max-w-sm">{children}</div>
        </div>
        <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground">
          <a href="/help" className="hover:text-foreground">Help Center</a>
          <span className="size-1 rounded-full bg-muted-foreground/30" />
          <a href="/terms" className="hover:text-foreground">Terms</a>
          <span className="size-1 rounded-full bg-muted-foreground/30" />
          <a href="/privacy" className="hover:text-foreground">Privacy</a>
          <span className="size-1 rounded-full bg-muted-foreground/30" />
          <span>&copy; {new Date().getFullYear()} XerinPay</span>
        </div>
      </div>

      {/* Right - Branding slideshow */}
      <BrandingPanel />
    </div>
  )
}
