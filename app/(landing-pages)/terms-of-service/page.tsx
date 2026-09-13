import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Terms of Service | Kaban.ng',
  description:
    'Terms of Service governing your access to and use of the Kaban real estate platform, web application, and listing marketplace.',
};

export default function TermsOfServicePage() {
  return (
    <main className="min-h-screen bg-neutral-50 py-12 px-4 sm:px-6 lg:px-8 text-neutral-800">
      <article className="max-w-4xl mx-auto bg-white rounded-2xl shadow-sm border border-neutral-200/80 p-6 sm:p-10 lg:p-12">
        {/* Header */}
        <header className="border-b border-neutral-200 pb-8 mb-8">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-neutral-900 tracking-tight">
            Terms of Service
          </h1>
          <p className="mt-2 text-sm text-neutral-500 font-medium">
            Kaban.ng &bull; Last updated: 13 September 2026
          </p>
          <p className="mt-4 text-base text-neutral-600 leading-relaxed">
            Welcome to Kaban (
            <Link
              href="https://kaban.ng"
              className="text-emerald-600 hover:text-emerald-700 underline underline-offset-2 transition-colors"
            >
              https://kaban.ng
            </Link>
            ). These Terms of Service (“Terms”) govern your access to and use of
            our website, web application, APIs, dashboards, and real-estate
            listing marketplace (collectively, the “Service”), operated by Kaban
            / Kaban Technologies (“Kaban”, “we”, “us”, or “our”).
          </p>
          <p className="mt-3 text-base text-neutral-600 leading-relaxed">
            By registering an account, listing a property, submitting content, or
            browsing Kaban.ng, you agree to these Terms. If you do not agree, do
            not use the Service.
          </p>
        </header>

        {/* Content Body */}
        <div className="space-y-8 text-neutral-700 text-sm sm:text-base leading-relaxed">
          {/* Section 1 */}
          <section>
            <h2 className="text-xl font-bold text-neutral-900 mb-3">
              1. Platform overview and scope
            </h2>
            <p className="mb-3">
              Kaban is a digital real-estate marketplace connecting property
              seekers (“Users”) with real estate agents, agencies, and developers
              (“Realtors”).
            </p>
            <p>
              Kaban acts as an online facilitator. We do not own, manage, broker,
              or execute sale, rent, or lease contracts for third-party listings
              unless we expressly say otherwise in writing. Any property
              transaction is solely between the User and the Realtor (or property
              owner). Kaban is not an escrow agent and is not a party to agency
              fees, deposits, or conveyancing unless separately agreed in writing.
            </p>
          </section>

          {/* Section 2 */}
          <section>
            <h2 className="text-xl font-bold text-neutral-900 mb-3">
              2. Eligibility and accounts
            </h2>
            <ul className="list-disc pl-5 space-y-2">
              <li>
                You must be at least 18 years old and able to form a binding
                contract under Nigerian law.
              </li>
              <li>
                You must provide accurate, complete, and up-to-date registration
                information.
              </li>
              <li>
                You are responsible for safeguarding your login credentials and for
                all activity under your account.
              </li>
              <li>
                Account types may include property seekers, realtors
                (agents/agencies), and administrators. Features depend on your role
                and verification status.
              </li>
              <li>
                We may refuse, suspend, or terminate accounts that violate these
                Terms or applicable law.
              </li>
            </ul>
          </section>

          {/* Section 3 */}
          <section>
            <h2 className="text-xl font-bold text-neutral-900 mb-3">
              3. Specific terms for Realtors
            </h2>
            <p className="mb-4">
              By registering or using a Realtor profile on Kaban.ng, you agree
              that:
            </p>
            <div className="space-y-4 pl-2 sm:pl-4 border-l-2 border-emerald-500/30">
              <div>
                <h3 className="font-semibold text-neutral-900">
                  Professional conduct and integrity
                </h3>
                <p className="text-neutral-600 mt-1">
                  You will maintain high ethical standards, provide true and
                  non-misleading information about prices, specifications,
                  availability, ownership, and your authority to market a property,
                  and treat prospective clients fairly.
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-neutral-900">
                  Authority to list
                </h3>
                <p className="text-neutral-600 mt-1">
                  You warrant that you have the necessary rights, mandate, or
                  authority to list and market each property, and that your content
                  does not infringe third-party rights.
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-neutral-900">
                  Accuracy of listings
                </h3>
                <p className="text-neutral-600 mt-1">
                  You are solely responsible for listing content (descriptions,
                  prices, details, location, images, videos, and contact
                  information).
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-neutral-900">
                  Licensing and legal compliance
                </h3>
                <p className="text-neutral-600 mt-1">
                  You will comply with applicable Nigerian laws (federal and
                  state), including real-estate practice and advertising rules,
                  fair housing / non-discrimination obligations, tax rules, and
                  anti-money laundering requirements where applicable.
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-neutral-900">
                  KYC and verification
                </h3>
                <p className="text-neutral-600 mt-1">
                  You may be required to submit identity or professional documents
                  (e.g. government ID, certifications). False documents may result
                  in immediate suspension. Verification status is not a guarantee
                  of listing quality or legality.
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-neutral-900">Moderation</h3>
                <p className="text-neutral-600 mt-1">
                  Listings may require submission for review. We may approve,
                  reject, unpublish, expire, remove, or limit visibility of
                  listings (including featured placement) for quality, safety,
                  legal, or policy reasons. Editing a live listing may return it
                  to a pending/review state as implemented in the product.
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-neutral-900">
                  Ratings, reviews, complaints, and sanctions
                </h3>
                <p className="text-neutral-600 mt-1">
                  In cases of fraud, misleading listings, or verified complaints, we
                  may investigate and issue warnings, restrict features, suspend,
                  or permanently deactivate your account, without financial
                  liability to you beyond what the law requires.
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-neutral-900">Cooperation</h3>
                <p className="text-neutral-600 mt-1">
                  You agree to cooperate reasonably with Kaban and lawful
                  authorities during inquiries relating to your listings or
                  conduct, including providing relevant records when required by
                  law.
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-neutral-900">
                  No exclusive agency with Kaban
                </h3>
                <p className="text-neutral-600 mt-1">
                  Unless agreed separately in writing, listing on Kaban does not
                  create employment or exclusive agency with Kaban.
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-neutral-900">
                  Non-broker liability
                </h3>
                <p className="text-neutral-600 mt-1">
                  Disputes about agency fees, deposits, or contractual performance
                  remain between the Realtor and the User.
                </p>
              </div>
            </div>
          </section>

          {/* Section 4 */}
          <section>
            <h2 className="text-xl font-bold text-neutral-900 mb-3">
              4. Listings, media, and content
            </h2>
            <ul className="list-disc pl-5 space-y-2">
              <li>
                You retain ownership of content you upload. By uploading, you grant
                Kaban a worldwide, non-exclusive, royalty-free licence to host,
                store, reproduce, display, distribute, and promote that content in
                connection with operating and marketing the Service (including search
                results, thumbnails, and emails).
              </li>
              <li>
                You must not upload unlawful, defamatory, fraudulent, infringing, or
                malicious content.
              </li>
              <li>
                Images and files may be processed by our infrastructure and
                third-party providers (e.g. cloud image hosting).
              </li>
              <li>
                Published listings may expire after a defined period (for example, a
                fixed number of days after publication). Expired listings may
                become non-public until renewed or resubmitted under platform rules.
              </li>
              <li>
                We may remove content that violates these Terms or the law without
                prior notice where necessary.
              </li>
            </ul>
          </section>

          {/* Section 5 */}
          <section>
            <h2 className="text-xl font-bold text-neutral-900 mb-3">
              5. Prohibited activities
            </h2>
            <p className="mb-3">Users and Realtors agree not to:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li>
                Post fraudulent, misleading, duplicate, or knowingly expired
                listings
              </li>
              <li>
                Scrape, harvest, or extract data using automated means without prior
                written consent
              </li>
              <li>Circumvent security, access controls, or rate limits</li>
              <li>Impersonate any person, agency, or entity</li>
              <li>
                Use the Service for spam, phishing, or unsolicited marketing outside
                allowed contact features
              </li>
              <li>Upload malware or content that disrupts the Service</li>
              <li>Post discriminatory, hateful, or illegal content</li>
              <li>Interfere with moderation, reporting, or admin tools</li>
            </ul>
          </section>

          {/* Section 6 */}
          <section>
            <h2 className="text-xl font-bold text-neutral-900 mb-3">
              6. Transactions, payments, and third-party services
            </h2>
            <ul className="list-disc pl-5 space-y-2">
              <li>
                Kaban does not guarantee that any listing is available, accurate,
                or will result in a completed deal.
              </li>
              <li>
                Unless stated otherwise, property payments, agency fees, caution
                deposits, and legal conveyancing are not processed by Kaban.
              </li>
              <li>
                The Service may link to third-party services (maps, video hosts,
                payment tools, social networks). We do not control those services
                and are not responsible for their content, policies, or practices.
              </li>
            </ul>
          </section>

          {/* Section 7 */}
          <section>
            <h2 className="text-xl font-bold text-neutral-900 mb-3">
              7. Intellectual property
            </h2>
            <p>
              Platform branding, software, interface design, logos, and proprietary
              code are owned by Kaban or its licensors. You may not copy or exploit
              them without prior written permission. Realtor-uploaded visual and
              textual listing content remains subject to Section 4.
            </p>
          </section>

          {/* Section 8 */}
          <section>
            <h2 className="text-xl font-bold text-neutral-900 mb-3">
              8. Disclaimers
            </h2>
            <p className="font-semibold text-neutral-900 mb-2">
              THE SERVICE IS PROVIDED ON AN “AS IS” AND “AS AVAILABLE” BASIS. TO
              THE MAXIMUM EXTENT PERMITTED BY LAW, KABAN DISCLAIMS ALL WARRANTIES,
              EXPRESS OR IMPLIED, INCLUDING MERCHANTABILITY, FITNESS FOR A
              PARTICULAR PURPOSE, AND NON-INFRINGEMENT.
            </p>
            <p>
              We do not warrant uninterrupted or error-free operation, continuous
              accuracy of third-party listings, or the physical condition, title,
              or suitability of any property.
            </p>
          </section>

          {/* Section 9 */}
          <section>
            <h2 className="text-xl font-bold text-neutral-900 mb-3">
              9. Limitation of liability
            </h2>
            <p className="font-semibold text-neutral-900 mb-2">
              TO THE MAXIMUM EXTENT PERMITTED BY LAW, KABAN AND ITS OFFICERS,
              EMPLOYEES, AND AGENTS SHALL NOT BE LIABLE FOR INDIRECT,
              INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, OR ANY LOSS
              OF PROFITS, DATA, GOODWILL, OR BUSINESS OPPORTUNITY, ARISING FROM
              YOUR USE OF THE SERVICE, RELIANCE ON ANY LISTING, OR DISPUTES
              BETWEEN USERS AND REALTORS.
            </p>
            <p className="mb-2">
              OUR TOTAL LIABILITY FOR ANY CLAIM RELATING TO THE SERVICE SHALL NOT
              EXCEED THE GREATER OF (A) FEES YOU PAID TO KABAN FOR THE SERVICE IN
              THE THREE (3) MONTHS BEFORE THE CLAIM, OR (B) NGN 50,000.
            </p>
            <p>
              Where the law does not allow certain limitations, our liability is
              limited to the maximum permitted.
            </p>
          </section>

          {/* Section 10 */}
          <section>
            <h2 className="text-xl font-bold text-neutral-900 mb-3">
              10. Indemnity
            </h2>
            <p>
              You agree to indemnify and hold harmless Kaban from claims,
              damages, losses, and expenses (including reasonable legal fees)
              arising from your content, listings, misuse of the Service, or breach
              of these Terms or applicable law.
            </p>
          </section>

          {/* Section 11 */}
          <section>
            <h2 className="text-xl font-bold text-neutral-900 mb-3">
              11. Suspension and termination
            </h2>
            <p>
              We may suspend or terminate your account and access immediately,
              without prior notice, if you violate these Terms, engage in fraud,
              compromise security, create risk for other users, or as required by
              law. Provisions that by nature should survive (including ownership,
              disclaimers, indemnity, and limitations of liability) survive
              termination.
            </p>
          </section>

          {/* Section 12 */}
          <section>
            <h2 className="text-xl font-bold text-neutral-900 mb-3">
              12. Changes to these Terms
            </h2>
            <p>
              We may modify these Terms at any time. For material changes, we will
              try to provide reasonable notice (for example, at least 14 days) via
              the Service or email where appropriate. Continued use after changes
              take effect constitutes acceptance.
            </p>
          </section>

          {/* Section 13 */}
          <section>
            <h2 className="text-xl font-bold text-neutral-900 mb-3">
              13. Governing law and dispute resolution
            </h2>
            <p className="mb-2">
              These Terms are governed by the laws of the Federal Republic of
              Nigeria. Disputes that cannot be resolved amicably shall be subject
              to the exclusive jurisdiction of Nigerian courts, without prejudice to
              mandatory consumer protections that cannot be waived.
            </p>
            <p>
              Contact{' '}
              <a
                href="mailto:contact@kaban.ng"
                className="text-emerald-600 hover:text-emerald-700 underline underline-offset-2 transition-colors"
              >
                contact@kaban.ng
              </a>{' '}
              to attempt informal resolution first.
            </p>
          </section>

          {/* Section 14 */}
          <section className="pt-4 border-t border-neutral-200">
            <h2 className="text-xl font-bold text-neutral-900 mb-3">
              14. Contact
            </h2>
            <p className="mb-1">
              <strong>Email:</strong>{' '}
              <a
                href="mailto:contact@kaban.ng"
                className="text-emerald-600 hover:text-emerald-700 underline underline-offset-2 transition-colors"
              >
                contact@kaban.ng
              </a>
            </p>
            <p>
              <strong>Website:</strong>{' '}
              <Link
                href="https://kaban.ng"
                className="text-emerald-600 hover:text-emerald-700 underline underline-offset-2 transition-colors"
              >
                https://kaban.ng
              </Link>
            </p>
          </section>
        </div>
      </article>
    </main>
  );
}