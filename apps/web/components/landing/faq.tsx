import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@workspace/ui/components/accordion";

import { Reveal } from "@/components/landing/reveal";
import { SectionHeading } from "@/components/landing/section-heading";

const FAQS = [
  {
    q: "How long does it take to go live?",
    a: "Sandbox access is instant. Live approval depends on your KYB documents — a registered business with a certificate of incorporation, tax PIN, and director IDs is typically approved within 48 hours.",
  },
  {
    q: "Do you store card details on my servers?",
    a: "Never. Cards are captured by our hosted fields or checkout, sent straight to our PCI DSS Level 1 environment, and returned to you as a token. Your servers stay out of scope for PCI audit.",
  },
  {
    q: "What happens if a webhook fails to reach us?",
    a: "We retry with exponential backoff for 72 hours, and every event stays replayable from the dashboard indefinitely. Events are signed with HMAC-SHA256 and carry a timestamp so replays can be rejected.",
  },
  {
    q: "How fast is settlement, really?",
    a: "Mobile money collected before 16:00 EAT settles the same working day on Growth and Enterprise, next working day on Starter. Card settlement follows the acquirer cycle, typically T+2.",
  },
  {
    q: "Can I use XerinPay from outside Kenya?",
    a: "Yes. We are live in 14 markets and support 32 settlement currencies. Local acquiring is available in Kenya, Nigeria, Ghana, Tanzania, Uganda, Rwanda, and South Africa, with cross-border collections everywhere else.",
  },
  {
    q: "What are the fraud and chargeback protections?",
    a: "Every charge is scored in real time using device fingerprinting, velocity checks, BIN risk, and behavioural signals. You can write your own rules on top, force 3-D Secure by segment, and manage disputes with evidence templates in the dashboard.",
  },
  {
    q: "Do you offer a free tier for testing?",
    a: "The sandbox is free forever with unlimited test transactions. On live accounts you only pay per successful transaction — failed attempts, refunds, and API calls cost nothing.",
  },
  {
    q: "Who do I contact when something breaks at 2am?",
    a: "Our security and reliability operations centre runs 24/7. Growth accounts get a four-hour response SLA; Enterprise accounts get a named engineer and a direct escalation channel.",
  },
];

export function Faq() {
  return (
    <section id="faq" className="scroll-mt-24 py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="FAQ"
          title="Questions we get asked most"
          description="Still unsure about something? The docs go deeper, and support answers in hours, not days."
        />

        <Reveal delay={80} className="mx-auto mt-12 max-w-3xl">
          <Accordion
            type="single"
            collapsible
            className="w-full rounded-2xl border border-border/60 bg-card/50 px-5 sm:px-7"
          >
            {FAQS.map((item) => (
              <AccordionItem key={item.q} value={item.q}>
                <AccordionTrigger className="text-left text-base font-medium hover:no-underline">
                  {item.q}
                </AccordionTrigger>
                <AccordionContent className="text-sm leading-relaxed text-muted-foreground">
                  {item.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </Reveal>
      </div>
    </section>
  );
}
