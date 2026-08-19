"use client";

import * as React from "react";
import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  Check,
  Copy,
  FlaskConical,
  PackageOpen,
  Timer,
} from "lucide-react";

import { Button } from "@workspace/ui/components/button";
import { Card } from "@workspace/ui/components/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@workspace/ui/components/tabs";

import { Reveal } from "@/components/landing/reveal";
import { SectionHeading } from "@/components/landing/section-heading";

const SNIPPETS = {
  curl: `curl https://api.xerinpay.com/v1/charges \\
  -H "Authorization: Bearer $XERINPAY_SECRET_KEY" \\
  -H "Idempotency-Key: 8f21c4ae-0b19" \\
  -d amount=4500 \\
  -d currency=KES \\
  -d method=mpesa \\
  -d "customer[phone]=+254712345678"`,
  node: `import XerinPay from "@xerinpay/node";

const xerin = new XerinPay(process.env.XERINPAY_SECRET_KEY);

const charge = await xerin.charges.create(
  {
    amount: 4500,
    currency: "KES",
    method: "mpesa",
    customer: { phone: "+254712345678" },
  },
  { idempotencyKey: "8f21c4ae-0b19" },
);

console.log(charge.status); // "pending" -> webhook confirms`,
  python: `import xerinpay

xerin = xerinpay.Client(api_key=os.environ["XERINPAY_SECRET_KEY"])

charge = xerin.charges.create(
    amount=4500,
    currency="KES",
    method="mpesa",
    customer={"phone": "+254712345678"},
    idempotency_key="8f21c4ae-0b19",
)

print(charge.status)  # "pending" -> webhook confirms`,
  webhook: `// Verify the signature before trusting anything.
import { verifySignature } from "@xerinpay/node";

export async function POST(req: Request) {
  const raw = await req.text();

  const event = verifySignature({
    payload: raw,
    signature: req.headers.get("x-xerinpay-signature")!,
    secret: process.env.XERINPAY_WEBHOOK_SECRET!,
    toleranceSeconds: 300,
  });

  if (event.type === "charge.settled") {
    await fulfilOrder(event.data.reference);
  }

  return new Response(null, { status: 200 });
}`,
} as const;

type Lang = keyof typeof SNIPPETS;

const TABS: { value: Lang; label: string }[] = [
  { value: "curl", label: "cURL" },
  { value: "node", label: "Node" },
  { value: "python", label: "Python" },
  { value: "webhook", label: "Webhook" },
];

const HIGHLIGHTS = [
  {
    icon: Timer,
    title: "First charge in 10 minutes",
    body: "Sandbox keys the moment you sign up, with simulated M-Pesa prompts and test cards for every failure path.",
  },
  {
    icon: PackageOpen,
    title: "SDKs that stay current",
    body: "Node, Python, PHP, Go, Java, and Flutter — typed, versioned, and generated from the same OpenAPI spec as our docs.",
  },
  {
    icon: FlaskConical,
    title: "Deterministic testing",
    body: "Trigger any webhook by hand, replay historical events, and pin your integration to a dated API version.",
  },
];

function CodeBlock({ code, lang }: { code: string; lang: Lang }) {
  const [copied, setCopied] = React.useState(false);

  const copy = React.useCallback(async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      // Clipboard unavailable (insecure context) — fail quietly.
    }
  }, [code]);

  return (
    <div className="relative">
      <Button
        type="button"
        size="icon"
        variant="ghost"
        onClick={copy}
        aria-label={copied ? "Copied" : "Copy code"}
        className="absolute right-2 top-2 z-10 size-8 text-zinc-400 hover:bg-white/10 hover:text-white"
      >
        {copied ? (
          <Check className="size-4 text-emerald-400" />
        ) : (
          <Copy className="size-4" />
        )}
      </Button>
      <pre className="max-h-[26rem] overflow-auto rounded-xl bg-zinc-950 p-5 text-[13px] leading-relaxed text-zinc-100 ring-1 ring-white/10">
        <code data-language={lang} className="font-mono">
          {code}
        </code>
      </pre>
    </div>
  );
}

export function Developers() {
  return (
    <section
      id="developers"
      className="relative scroll-mt-24 overflow-hidden border-y border-border/60 bg-muted/25 py-20 sm:py-28"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Developers"
          title="An API you can read in one sitting"
          description="Predictable resources, honest error messages, and idempotency on every mutating call. The kind of API you stop thinking about."
        />

        <div className="mt-14 grid items-start gap-8 lg:grid-cols-[1fr_1.15fr] lg:gap-10">
          <div className="space-y-6">
            {HIGHLIGHTS.map((item, i) => (
              <Reveal key={item.title} delay={i * 100} from="left">
                <div className="flex gap-4">
                  <span className="inline-flex size-11 shrink-0 items-center justify-center rounded-xl border border-border/70 bg-background">
                    <item.icon className="size-5 text-emerald-500" />
                  </span>
                  <div>
                    <h3 className="text-base font-semibold tracking-tight">
                      {item.title}
                    </h3>
                    <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                      {item.body}
                    </p>
                  </div>
                </div>
              </Reveal>
            ))}

            <Reveal delay={320} from="left">
              <div className="flex flex-col gap-3 pt-2 sm:flex-row">
                <Button asChild className="group">
                  <Link href="/auth/register">
                    Get sandbox keys
                    <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
                  </Link>
                </Button>
                <Button asChild variant="outline">
                  <a href="#faq">
                    <BookOpen className="size-4" />
                    API reference
                  </a>
                </Button>
              </div>
            </Reveal>
          </div>

          <Reveal delay={140} from="right">
            <Card className="overflow-hidden border-border/60 bg-card/80 p-0 shadow-xl">
              <Tabs defaultValue="curl" className="gap-0">
                <div className="flex items-center gap-2 border-b border-border/60 bg-muted/40 px-3 py-2.5">
                  <TabsList className="bg-transparent p-0">
                    {TABS.map((tab) => (
                      <TabsTrigger
                        key={tab.value}
                        value={tab.value}
                        className="text-xs data-[state=active]:bg-background"
                      >
                        {tab.label}
                      </TabsTrigger>
                    ))}
                  </TabsList>
                  <span className="ml-auto hidden font-mono text-[11px] text-muted-foreground sm:inline">
                    POST /v1/charges
                  </span>
                </div>

                {TABS.map((tab) => (
                  <TabsContent key={tab.value} value={tab.value} className="m-3">
                    <CodeBlock code={SNIPPETS[tab.value]} lang={tab.value} />
                  </TabsContent>
                ))}
              </Tabs>
            </Card>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
