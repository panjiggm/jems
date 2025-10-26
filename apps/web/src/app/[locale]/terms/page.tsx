import { getDictionary } from "@/lib/get-dictionary";
import { Locale } from "@/lib/i18n";
import Navbar from "@/components/navbar";
import FooterSimple from "@/components/common/footer-simple";
import { Metadata } from "next";

interface TermsPageProps {
  params: {
    locale: Locale;
  };
}

export async function generateMetadata({
  params,
}: TermsPageProps): Promise<Metadata> {
  const dict = await getDictionary(params.locale);

  return {
    title: dict.terms?.title || "Terms of Service | Hidden Jems",
    description:
      "Read our Terms of Service to understand the rules and regulations governing the use of Hidden Jems content management platform.",
    openGraph: {
      title: dict.terms?.title || "Terms of Service | Hidden Jems",
      description:
        "Read our Terms of Service to understand the rules and regulations governing the use of Hidden Jems content management platform.",
      type: "website",
      locale: params.locale,
    },
    twitter: {
      card: "summary_large_image",
      title: dict.terms?.title || "Terms of Service | Hidden Jems",
      description:
        "Read our Terms of Service to understand the rules and regulations governing the use of Hidden Jems content management platform.",
    },
  };
}

export default async function TermsPage({ params }: TermsPageProps) {
  const dict = await getDictionary(params.locale);
  const { terms } = dict;

  return (
    <div className="min-h-screen bg-background">
      <div className="relative mx-auto max-w-(--breakpoint-lg) px-4 sm:px-6 lg:px-8">
        <Navbar />
      </div>
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-3xl font-bold mb-4">{terms.title}</h1>
          <p className="text-sm text-muted-foreground">{terms.lastUpdated}</p>
        </div>

        {/* Content */}
        <div className="prose prose-slate dark:prose-invert max-w-none">
          {/* 1. Acceptance of Terms */}
          <section className="mb-10">
            <h2 className="text-xl font-semibold mb-4">
              {terms.sections.acceptance.title}
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {terms.sections.acceptance.content}
            </p>
          </section>

          {/* 2. Description of Service */}
          <section className="mb-10">
            <h2 className="text-xl font-semibold mb-4">
              {terms.sections.description.title}
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed mb-4">
              {terms.sections.description.content}
            </p>
            <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground ml-4">
              {terms.sections.description.features.map((feature, index) => (
                <li key={index} className="text-sm text-muted-foreground">
                  {feature}
                </li>
              ))}
            </ul>
          </section>

          {/* 3. User Accounts */}
          <section className="mb-10">
            <h2 className="text-xl font-semibold mb-4">
              {terms.sections.userAccounts.title}
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed mb-4">
              {terms.sections.userAccounts.content}
            </p>
            <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground ml-4">
              {terms.sections.userAccounts.requirements.map((req, index) => (
                <li key={index} className="text-sm text-muted-foreground">
                  {req}
                </li>
              ))}
            </ul>
          </section>

          {/* 4. User Content */}
          <section className="mb-10">
            <h2 className="text-xl font-semibold mb-4">
              {terms.sections.userContent.title}
            </h2>

            <h3 className="text-xl font-medium mb-3 mt-6">
              {terms.sections.userContent.subsections.ownership.title}
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {terms.sections.userContent.subsections.ownership.content}
            </p>

            <h3 className="text-lg font-medium mb-3 mt-6">
              {terms.sections.userContent.subsections.responsibility.title}
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed mb-4">
              {terms.sections.userContent.subsections.responsibility.content}
            </p>
            <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground ml-4">
              {terms.sections.userContent.subsections.responsibility.prohibited.map(
                (item, index) => (
                  <li key={index} className="text-sm text-muted-foreground">
                    {item}
                  </li>
                ),
              )}
            </ul>
          </section>

          {/* 5. Social Media Integration */}
          <section className="mb-10">
            <h2 className="text-xl font-semibold mb-4">
              {terms.sections.socialMedia.title}
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed mb-4">
              {terms.sections.socialMedia.content}
            </p>
            <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground ml-4">
              {terms.sections.socialMedia.terms.map((term, index) => (
                <li key={index} className="text-sm text-muted-foreground">
                  {term}
                </li>
              ))}
            </ul>
          </section>

          {/* 6. Prohibited Uses */}
          <section className="mb-10">
            <h2 className="text-xl font-semibold mb-4">
              {terms.sections.prohibitedUses.title}
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed mb-4">
              {terms.sections.prohibitedUses.content}
            </p>
            <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground ml-4">
              {terms.sections.prohibitedUses.items.map((item, index) => (
                <li key={index} className="text-sm text-muted-foreground">
                  {item}
                </li>
              ))}
            </ul>
          </section>

          {/* 7. Data and Privacy */}
          <section className="mb-10">
            <h2 className="text-xl font-semibold mb-4">
              {terms.sections.dataAndPrivacy.title}
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {terms.sections.dataAndPrivacy.content}
            </p>
          </section>

          {/* 8. Intellectual Property */}
          <section className="mb-10">
            <h2 className="text-xl font-semibold mb-4">
              {terms.sections.intellectualProperty.title}
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {terms.sections.intellectualProperty.content}
            </p>
          </section>

          {/* 9. Payment and Subscription */}
          <section className="mb-10">
            <h2 className="text-xl font-semibold mb-4">
              {terms.sections.paymentAndSubscription.title}
            </h2>

            <h3 className="text-xl font-medium mb-3 mt-6">
              {terms.sections.paymentAndSubscription.subsections.fees.title}
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {terms.sections.paymentAndSubscription.subsections.fees.content}
            </p>

            <h3 className="text-xl font-medium mb-3 mt-6">
              {terms.sections.paymentAndSubscription.subsections.billing.title}
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {
                terms.sections.paymentAndSubscription.subsections.billing
                  .content
              }
            </p>

            <h3 className="text-xl font-medium mb-3 mt-6">
              {terms.sections.paymentAndSubscription.subsections.changes.title}
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {
                terms.sections.paymentAndSubscription.subsections.changes
                  .content
              }
            </p>
          </section>

          {/* 10. Termination */}
          <section className="mb-10">
            <h2 className="text-xl font-semibold mb-4">
              {terms.sections.termination.title}
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed mb-4">
              {terms.sections.termination.content}
            </p>
            <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground ml-4">
              {terms.sections.termination.effects.map((effect, index) => (
                <li key={index} className="text-sm text-muted-foreground">
                  {effect}
                </li>
              ))}
            </ul>
          </section>

          {/* 11. Disclaimers */}
          <section className="mb-10">
            <h2 className="text-xl font-semibold mb-4">
              {terms.sections.disclaimers.title}
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed mb-4 font-medium">
              {terms.sections.disclaimers.content}
            </p>
            <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground ml-4">
              {terms.sections.disclaimers.items.map((item, index) => (
                <li key={index} className="text-sm text-muted-foreground">
                  {item}
                </li>
              ))}
            </ul>
          </section>

          {/* 12. Limitation of Liability */}
          <section className="mb-10">
            <h2 className="text-xl font-semibold mb-4">
              {terms.sections.limitationOfLiability.title}
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed mb-4 font-medium">
              {terms.sections.limitationOfLiability.content}
            </p>
            <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground ml-4">
              {terms.sections.limitationOfLiability.items.map((item, index) => (
                <li key={index} className="text-sm text-muted-foreground">
                  {item}
                </li>
              ))}
            </ul>
          </section>

          {/* 13. Indemnification */}
          <section className="mb-10">
            <h2 className="text-xl font-semibold mb-4">
              {terms.sections.indemnification.title}
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed mb-4">
              {terms.sections.indemnification.content}
            </p>
            <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground ml-4">
              {terms.sections.indemnification.items.map((item, index) => (
                <li key={index} className="text-sm text-muted-foreground">
                  {item}
                </li>
              ))}
            </ul>
          </section>

          {/* 14. Changes to Terms */}
          <section className="mb-10">
            <h2 className="text-xl font-semibold mb-4">
              {terms.sections.changes.title}
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {terms.sections.changes.content}
            </p>
          </section>

          {/* 15. Governing Law */}
          <section className="mb-10">
            <h2 className="text-xl font-semibold mb-4">
              {terms.sections.governingLaw.title}
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {terms.sections.governingLaw.content}
            </p>
          </section>

          {/* 16. Dispute Resolution */}
          <section className="mb-10">
            <h2 className="text-xl font-semibold mb-4">
              {terms.sections.disputeResolution.title}
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed mb-4">
              {terms.sections.disputeResolution.content}
            </p>
            <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground ml-4">
              {terms.sections.disputeResolution.steps.map((step, index) => (
                <li key={index} className="text-sm text-muted-foreground">
                  {step}
                </li>
              ))}
            </ol>
          </section>

          {/* 17. Severability */}
          <section className="mb-10">
            <h2 className="text-xl font-semibold mb-4">
              {terms.sections.severability.title}
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {terms.sections.severability.content}
            </p>
          </section>

          {/* 18. Waiver */}
          <section className="mb-10">
            <h2 className="text-xl font-semibold mb-4">
              {terms.sections.waiver.title}
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {terms.sections.waiver.content}
            </p>
          </section>

          {/* 19. Entire Agreement */}
          <section className="mb-10">
            <h2 className="text-xl font-semibold mb-4">
              {terms.sections.entireAgreement.title}
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {terms.sections.entireAgreement.content}
            </p>
          </section>

          {/* 20. Contact Information */}
          <section className="mb-10">
            <h2 className="text-xl font-semibold mb-4">
              {terms.sections.contact.title}
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed mb-4">
              {terms.sections.contact.content}
            </p>
            <p className="text-sm text-muted-foreground">
              <a
                href={`mailto:${terms.sections.contact.email}`}
                className="text-sm text-primary hover:underline"
              >
                {terms.sections.contact.email}
              </a>
            </p>
          </section>
        </div>
      </div>
      <div className="container mx-auto px-4 pb-8 max-w-4xl">
        <FooterSimple />
      </div>
    </div>
  );
}
