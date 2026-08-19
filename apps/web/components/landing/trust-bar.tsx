const PARTNERS = [
  "M-PESA",
  "Visa",
  "Mastercard",
  "Airtel Money",
  "Equity Bank",
  "KCB",
  "Flutterwave",
  "Co-op Bank",
  "Amex",
  "NCBA",
];

export function TrustBar() {
  return (
    <section
      aria-label="Payment methods and banking partners"
      className="border-y border-border/60 bg-muted/30 py-8"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <p className="text-center text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
          Settling for 4,000+ businesses across 14 markets
        </p>

        <div className="relative mt-6 overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_12%,black_88%,transparent)]">
          <div className="xp-marquee-track flex w-max items-center gap-12 pr-12">
            {[...PARTNERS, ...PARTNERS].map((name, i) => (
              <span
                key={`${name}-${i}`}
                className="whitespace-nowrap text-lg font-semibold tracking-tight text-muted-foreground/70 transition-colors hover:text-foreground sm:text-xl"
              >
                {name}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
