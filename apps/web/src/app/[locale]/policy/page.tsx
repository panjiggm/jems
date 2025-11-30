import { getDictionary } from "@/lib/get-dictionary";
import { Locale } from "@/lib/i18n";
import Navbar from "@/components/navbar";
import FooterSimple from "@/components/footer-simple";
import { Metadata } from "next";

interface PolicyPageProps {
  params: Promise<{
    locale: Locale;
  }>;
}

export async function generateMetadata({
  params,
}: PolicyPageProps): Promise<Metadata> {
  const { locale } = await params;
  const dict = await getDictionary(locale);

  return {
    title: dict.policy?.title || "Privacy Policy | Holobiont",
    description:
      "Learn how Holobiont collects, uses, and protects your personal information. Read our comprehensive Privacy Policy for details.",
    openGraph: {
      title: dict.policy?.title || "Privacy Policy | Holobiont",
      description:
        "Learn how Holobiont collects, uses, and protects your personal information. Read our comprehensive Privacy Policy for details.",
      type: "website",
      locale: locale,
    },
    twitter: {
      card: "summary_large_image",
      title: dict.policy?.title || "Privacy Policy | Holobiont",
      description:
        "Learn how Holobiont collects, uses, and protects your personal information. Read our comprehensive Privacy Policy for details.",
    },
  };
}

export default async function PolicyPage({ params }: PolicyPageProps) {
  const { locale } = await params;
  const dict = await getDictionary(locale);
  const { policy } = dict;

  return (
    <div className="min-h-screen bg-background">
      <div className="relative mx-auto max-w-(--breakpoint-lg) px-4 sm:px-6 lg:px-8">
        <Navbar />
      </div>
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-3xl font-bold mb-4">{policy.title}</h1>
          <p className="text-sm text-muted-foreground">{policy.lastUpdated}</p>
        </div>

        {/* Content */}
        <div className="prose prose-slate dark:prose-invert max-w-none">
          {/* 1. Introduction */}
          <section className="mb-10">
            <h2 className="text-xl font-semibold mb-4">
              {policy.sections.introduction.title}
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed mb-4">
              {policy.sections.introduction.content}
            </p>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {policy.sections.introduction.readCarefully}
            </p>
          </section>

          {/* 2. Information We Collect */}
          <section className="mb-10">
            <h2 className="text-xl font-semibold mb-4">
              {policy.sections.informationWeCollect.title}
            </h2>

            <h3 className="text-lg font-medium mb-3 mt-6">
              {
                policy.sections.informationWeCollect.subsections.personalInfo
                  .title
              }
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed mb-4">
              {
                policy.sections.informationWeCollect.subsections.personalInfo
                  .content
              }
            </p>
            <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground ml-4">
              {policy.sections.informationWeCollect.subsections.personalInfo.items.map(
                (item, index) => (
                  <li key={index}>{item}</li>
                ),
              )}
            </ul>

            <h3 className="text-lg font-medium mb-3 mt-6">
              {
                policy.sections.informationWeCollect.subsections.contentData
                  .title
              }
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed mb-4">
              {
                policy.sections.informationWeCollect.subsections.contentData
                  .content
              }
            </p>
            <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground ml-4">
              {policy.sections.informationWeCollect.subsections.contentData.items.map(
                (item, index) => (
                  <li key={index}>{item}</li>
                ),
              )}
            </ul>

            <h3 className="text-lg font-medium mb-3 mt-6">
              {
                policy.sections.informationWeCollect.subsections.socialMediaData
                  .title
              }
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed mb-4">
              {
                policy.sections.informationWeCollect.subsections.socialMediaData
                  .content
              }
            </p>
            <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground ml-4">
              {policy.sections.informationWeCollect.subsections.socialMediaData.items.map(
                (item, index) => (
                  <li key={index} className="text-sm text-muted-foreground">
                    {item}
                  </li>
                ),
              )}
            </ul>

            <h3 className="text-lg font-medium mb-3 mt-6">
              {policy.sections.informationWeCollect.subsections.usageData.title}
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed mb-4">
              {
                policy.sections.informationWeCollect.subsections.usageData
                  .content
              }
            </p>
            <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground ml-4">
              {policy.sections.informationWeCollect.subsections.usageData.items.map(
                (item, index) => (
                  <li key={index} className="text-sm text-muted-foreground">
                    {item}
                  </li>
                ),
              )}
            </ul>
          </section>

          {/* 3. How We Use Your Information */}
          <section className="mb-10">
            <h2 className="text-xl font-semibold mb-4">
              {policy.sections.howWeUseYourInformation.title}
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed mb-6">
              {policy.sections.howWeUseYourInformation.content}
            </p>
            {policy.sections.howWeUseYourInformation.purposes.map(
              (purpose, index) => (
                <div key={index} className="mb-4">
                  <h4 className="text-sm font-medium mb-2">{purpose.title}</h4>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {purpose.description}
                  </p>
                </div>
              ),
            )}
          </section>

          {/* 4. How We Share Your Information */}
          <section className="mb-10">
            <h2 className="text-xl font-semibold mb-4">
              {policy.sections.howWeShareYourInformation.title}
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed mb-6">
              {policy.sections.howWeShareYourInformation.content}
            </p>
            {policy.sections.howWeShareYourInformation.circumstances.map(
              (circumstance, index) => (
                <div key={index} className="mb-4">
                  <h4 className="text-sm font-medium mb-2">
                    {circumstance.title}
                  </h4>
                  <p className="text-muted-foreground leading-relaxed">
                    {circumstance.description}
                  </p>
                </div>
              ),
            )}
          </section>

          {/* 5. Data Storage and Security */}
          <section className="mb-10">
            <h2 className="text-xl font-semibold mb-4">
              {policy.sections.dataStorage.title}
            </h2>

            <h3 className="text-lg font-medium mb-3 mt-6">
              {policy.sections.dataStorage.subsections.storage.title}
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed mb-4">
              {policy.sections.dataStorage.subsections.storage.content}
            </p>
            <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground ml-4">
              {policy.sections.dataStorage.subsections.storage.measures.map(
                (measure, index) => (
                  <li key={index} className="text-sm text-muted-foreground">
                    {measure}
                  </li>
                ),
              )}
            </ul>

            <h3 className="text-lg font-medium mb-3 mt-6">
              {policy.sections.dataStorage.subsections.retention.title}
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {policy.sections.dataStorage.subsections.retention.content}
            </p>

            <h3 className="text-xl font-medium mb-3 mt-6">
              {policy.sections.dataStorage.subsections.security.title}
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {policy.sections.dataStorage.subsections.security.content}
            </p>
          </section>

          {/* 6. Your Rights and Choices */}
          <section className="mb-10">
            <h2 className="text-xl font-semibold mb-4">
              {policy.sections.yourRights.title}
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed mb-6">
              {policy.sections.yourRights.content}
            </p>
            {policy.sections.yourRights.rights.map((right, index) => (
              <div key={index} className="mb-4">
                <h4 className="text-sm font-medium mb-2">{right.title}</h4>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {right.description}
                </p>
              </div>
            ))}
            <p className="text-sm text-muted-foreground leading-relaxed mt-6">
              {policy.sections.yourRights.exerciseRights}
            </p>
          </section>

          {/* 7. Cookies and Tracking Technologies */}
          <section className="mb-10">
            <h2 className="text-xl font-semibold mb-4">
              {policy.sections.cookies.title}
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed mb-4">
              {policy.sections.cookies.content}
            </p>
            <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground ml-4 mb-4">
              {policy.sections.cookies.purposes.map((purpose, index) => (
                <li key={index} className="text-sm text-muted-foreground">
                  {purpose}
                </li>
              ))}
            </ul>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {policy.sections.cookies.control}
            </p>
          </section>

          {/* 8. Third-Party Services */}
          <section className="mb-10">
            <h2 className="text-xl font-semibold mb-4">
              {policy.sections.thirdPartyServices.title}
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed mb-6">
              {policy.sections.thirdPartyServices.content}
            </p>
            {policy.sections.thirdPartyServices.platforms.map(
              (platform, index) => (
                <div key={index} className="mb-4">
                  <h4 className="text-sm font-medium mb-2">{platform.title}</h4>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {platform.description}
                  </p>
                </div>
              ),
            )}
            <p className="text-sm text-muted-foreground leading-relaxed mt-6">
              {policy.sections.thirdPartyServices.notice}
            </p>
          </section>

          {/* 9. Children's Privacy */}
          <section className="mb-10">
            <h2 className="text-xl font-semibold mb-4">
              {policy.sections.childrenPrivacy.title}
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {policy.sections.childrenPrivacy.content}
            </p>
          </section>

          {/* 10. International Data Transfers */}
          <section className="mb-10">
            <h2 className="text-xl font-semibold mb-4">
              {policy.sections.internationalUsers.title}
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {policy.sections.internationalUsers.content}
            </p>
          </section>

          {/* 11. GDPR and CCPA Rights */}
          <section className="mb-10">
            <h2 className="text-xl font-semibold mb-4">
              {policy.sections.dataProtectionRights.title}
            </h2>

            <h3 className="text-lg font-medium mb-3 mt-6">
              {policy.sections.dataProtectionRights.subsections.gdpr.title}
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed mb-4">
              {policy.sections.dataProtectionRights.subsections.gdpr.content}
            </p>
            <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground ml-4">
              {policy.sections.dataProtectionRights.subsections.gdpr.rights.map(
                (right, index) => (
                  <li key={index} className="text-sm text-muted-foreground">
                    {right}
                  </li>
                ),
              )}
            </ul>

            <h3 className="text-lg font-medium mb-3 mt-6">
              {policy.sections.dataProtectionRights.subsections.ccpa.title}
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed mb-4">
              {policy.sections.dataProtectionRights.subsections.ccpa.content}
            </p>
            <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground ml-4">
              {policy.sections.dataProtectionRights.subsections.ccpa.rights.map(
                (right, index) => (
                  <li key={index} className="text-sm text-muted-foreground">
                    {right}
                  </li>
                ),
              )}
            </ul>
          </section>

          {/* 12. Do Not Track Signals */}
          <section className="mb-10">
            <h2 className="text-xl font-semibold mb-4">
              {policy.sections.doNotTrack.title}
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {policy.sections.doNotTrack.content}
            </p>
          </section>

          {/* 13. Changes to This Privacy Policy */}
          <section className="mb-10">
            <h2 className="text-xl font-semibold mb-4">
              {policy.sections.changes.title}
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed mb-4">
              {policy.sections.changes.content}
            </p>
            <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground ml-4 mb-4">
              {policy.sections.changes.notifications.map(
                (notification, index) => (
                  <li key={index} className="text-sm text-muted-foreground">
                    {notification}
                  </li>
                ),
              )}
            </ul>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {policy.sections.changes.continued}
            </p>
          </section>

          {/* 14. Contact Us */}
          <section className="mb-10">
            <h2 className="text-xl font-semibold mb-4">
              {policy.sections.contact.title}
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed mb-4">
              {policy.sections.contact.content}
            </p>
            <div className="space-y-2">
              {policy.sections.contact.methods.map((method, index) => (
                <p key={index} className="text-sm text-muted-foreground">
                  <span className="font-medium">{method.label}:</span>{" "}
                  <a
                    href={`mailto:${method.value}`}
                    className="text-primary hover:underline"
                  >
                    {method.value}
                  </a>
                </p>
              ))}
            </div>
          </section>

          {/* 15. Consent */}
          <section className="mb-10">
            <h2 className="text-xl font-semibold mb-4">
              {policy.sections.consent.title}
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {policy.sections.consent.content}
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
