import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Privacy Policy | Kaban.ng',
  description:
    'Privacy Policy explaining how Kaban collects, uses, processes, shares, and safeguards your personal data.',
};

export default function PrivacyPolicyPage() {
  return (
    <main className="min-h-screen bg-neutral-50 py-12 px-4 sm:px-6 lg:px-8 text-neutral-900">
      <article className="max-w-4xl mx-auto bg-white rounded-2xl shadow-sm border border-neutral-200/80 p-6 sm:p-10 lg:p-12">
        {/* Header */}
        <header className="border-b border-neutral-200 pb-8 mb-8">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-neutral-950 tracking-tight">
            Privacy Policy
          </h1>
          <p className="mt-2 text-sm text-neutral-500 font-medium">
            Kaban.ng &bull; Last updated: 13 September 2026
          </p>
          <p className="mt-4 text-base text-neutral-900 leading-relaxed">
            Kaban (“we”, “us”, or “our”) respects your privacy and is committed
            to protecting your personal data. This Privacy Policy explains how
            we collect, use, process, share, and safeguard information when you
            use{' '}
            <Link
              href="https://kaban.ng"
              className="text-emerald-700 hover:text-emerald-800 underline underline-offset-2 transition-colors font-medium"
            >
              https://kaban.ng
            </Link>{' '}
            and related services (the “Service”).
          </p>
          <p className="mt-3 text-base text-neutral-900 leading-relaxed">
            This policy is intended to align with the Nigeria Data Protection Act
            (NDPA) and, where relevant, other standards such as the GDPR for
            persons in the EEA/UK.
          </p>
        </header>

        {/* Content Body with Scoped Typography Styles */}
        <div className="space-y-8 text-neutral-800 text-sm sm:text-base leading-relaxed [&_p]:text-neutral-800 [&_p]:leading-relaxed [&_a]:text-emerald-700 hover:[&_a]:text-emerald-800 [&_a]:underline [&_a]:underline-offset-2 [&_a]:transition-colors [&_a]:font-medium [&_h2]:text-xl [&_h2]:font-bold [&_h2]:text-neutral-950 [&_h2]:mb-3 [&_h3]:font-semibold [&_h3]:text-neutral-950 [&_strong]:text-neutral-950 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-2">
          {/* Section 1 */}
          <section>
            <h2>1. Data controller</h2>
            <p className="mb-3">
              Kaban / Kaban Technologies is the data controller for personal
              information collected under this policy.
            </p>
            <div className="p-4 bg-neutral-50 rounded-lg border border-neutral-200 space-y-1 font-mono text-xs sm:text-sm text-neutral-800">
              <p>
                <strong>Email:</strong>{' '}
                <a href="mailto:admin@kaban.ng">contact@kaban.ng</a>
              </p>
              <p>
                <strong>Website:</strong>{' '}
                <Link href="https://kaban.ng">https://kaban.ng</Link>
              </p>
            </div>
          </section>

          {/* Section 2 */}
          <section>
            <h2>2. Information we collect</h2>
            <p className="mb-4">
              We collect information you provide and data generated when you use
              the Service:
            </p>
            <div className="space-y-4 pl-2 sm:pl-4 border-l-2 border-emerald-500/40">
              <div>
                <h3>Account and identity</h3>
                <p className="mt-1">
                  Full name, email address, phone/WhatsApp number, password
                  (stored as a hash), role (e.g. seeker, agent, agency, admin),
                  profile/realtor photo.
                </p>
              </div>

              <div>
                <h3>Realtor / KYC</h3>
                <p className="mt-1">
                  Bio, company/agency name, office address, service area,
                  social links, verification documents (e.g. government ID,
                  certifications), and verification status.
                </p>
              </div>

              <div>
                <h3>Listings and related content</h3>
                <p className="mt-1">
                  Property descriptions, prices, details, locations/coordinates,
                  images, videos/links, submission, approval, rejection,
                  publication, featured status, and expiry metadata.
                </p>
              </div>

              <div>
                <h3>Communications</h3>
                <p className="mt-1">
                  Inquiries, contact requests, reports/complaints, support
                  messages, feedback.
                </p>
              </div>

              <div>
                <h3>Technical and usage data</h3>
                <p className="mt-1">
                  IP address, browser/device type, OS, approximate location from
                  IP, logs, cookies or similar technologies, page views, search
                  activity, referral URLs.
                </p>
              </div>

              <div>
                <h3>Authentication providers</h3>
                <p className="mt-1">
                  Data from sign-in providers (e.g. Google) if you choose
                  social login, as permitted by that provider.
                </p>
              </div>
            </div>
            <p className="mt-4 text-xs sm:text-sm text-neutral-500 italic">
              We do not intentionally collect data from children below the age
              required to use the Service under applicable law.
            </p>
          </section>

          {/* Section 3 */}
          <section>
            <h2>3. Legal grounds for processing</h2>
            <p className="mb-3">
              Depending on context and applicable law, we process personal data
              on the basis of:
            </p>
            <ul>
              <li>
                <strong>Contract:</strong> Creating accounts, publishing
                listings, facilitating User–Realtor connections.
              </li>
              <li>
                <strong>Legitimate interests:</strong> Security, fraud prevention,
                moderation, analytics, and product improvement (balanced against
                your rights).
              </li>
              <li>
                <strong>Consent:</strong> e.g. optional marketing or certain
                non-essential cookies.
              </li>
              <li>
                <strong>Legal obligation:</strong> Compliance with Nigerian law
                and lawful requests.
              </li>
            </ul>
          </section>

          {/* Section 4 */}
          <section>
            <h2>4. How we use your data</h2>
            <p className="mb-3">We use personal data to:</p>
            <ul>
              <li>Operate, maintain, and personalise the Service</li>
              <li>Authenticate users and manage password reset</li>
              <li>
                Facilitate property discovery and inquiries between Users and
                Realtors
              </li>
              <li>
                Review, moderate, approve, reject, feature, or expire listings
              </li>
              <li>Verify Realtor identity/professional status (KYC)</li>
              <li>
                Detect and prevent fraud, abuse, spam, and unauthorised access
              </li>
              <li>
                Send transactional notices (account, listing status, reports,
                expiry, security)
              </li>
              <li>Analyse performance and improve reliability</li>
              <li>Comply with legal obligations</li>
            </ul>
          </section>

          {/* Section 5 */}
          <section>
            <h2>5. Data sharing and processors</h2>
            <p className="mb-3">
              We do not sell your personal data. We may share information with:
            </p>
            <ul>
              <li>
                <strong>Verified Realtors:</strong> When a User submits an inquiry
                on a listing, relevant contact details may be shared so the Realtor
                can respond.
              </li>
              <li>
                <strong>Other users:</strong> As needed for public listing
                display (e.g. realtor name/contact shown on a listing you
                publish).
              </li>
              <li>
                <strong>Service providers:</strong> Hosting, databases, email
                delivery, image/media storage, analytics, and similar processors
                acting on our behalf.
              </li>
              <li>
                <strong>Authentication providers:</strong> If you use social login.
              </li>
              <li>
                <strong>Professional advisers and authorities:</strong> When
                required by law, court order, or to protect rights, safety, and
                security.
              </li>
            </ul>
          </section>

          {/* Section 6 */}
          <section>
            <h2>6. International transfers</h2>
            <p>
              Our providers may process data outside Nigeria. Where required by
              law, we use appropriate safeguards permitted under applicable
              data-protection rules.
            </p>
          </section>

          {/* Section 7 */}
          <section>
            <h2>7. Data retention</h2>
            <p className="mb-3">
              We retain personal data only as long as needed for the purposes in
              this policy, including:
            </p>
            <ul>
              <li>
                Account data while active and for a reasonable period after
                closure
              </li>
              <li>
                Listings and related records for operations, disputes, and
                compliance
              </li>
              <li>KYC documents for verification and compliance periods</li>
              <li>Security and system logs for a limited period</li>
            </ul>
            <p className="mt-3">
              You may request account deletion subject to legal retention
              requirements. We may retain limited information as required by
              law or to resolve disputes.
            </p>
          </section>

          {/* Section 8 */}
          <section>
            <h2>8. Security measures</h2>
            <p>
              We implement reasonable technical and organisational measures,
              including HTTPS, access controls, and secure data-handling
              practices. No method of transmission or storage is 100% secure.
            </p>
          </section>

          {/* Section 9 */}
          <section>
            <h2>9. Your data protection rights</h2>
            <p className="mb-3">
              Under applicable law (including the NDPA), you may have the right
              to:
            </p>
            <ul>
              <li>Access the personal data we hold about you</li>
              <li>Rectify inaccurate data</li>
              <li>
                Erase data (“right to be forgotten”), subject to legal mandates
              </li>
              <li>Object to or restrict certain processing</li>
              <li>
                Data portability in a structured, machine-readable format
              </li>
              <li>Withdraw consent where processing is consent-based</li>
            </ul>
            <p className="mt-4">
              To exercise these rights, contact{' '}
              <a href="mailto:admin@kaban.ng">contact@kaban.ng</a> and include
              the email on your account plus a clear description of your
              request. You may also lodge a complaint with the relevant
              data-protection authority in Nigeria (or in your country of
              residence, if applicable).
            </p>
          </section>

          {/* Section 10 */}
          <section>
            <h2>10. Cookies and similar technologies</h2>
            <p>
              We may use essential cookies for login/session security and
              optional cookies for analytics or preferences. You can control
              cookies in your browser; disabling some cookies may affect
              Service functionality.
            </p>
          </section>

          {/* Section 11 */}
          <section>
            <h2>11. Third-party links</h2>
            <p>
              The Service may link to third-party sites (e.g. maps or video
              platforms). Their privacy practices are governed by their own
              policies.
            </p>
          </section>

          {/* Section 12 */}
          <section>
            <h2>12. Updates to this policy</h2>
            <p>
              We may update this Privacy Policy periodically. Material changes
              will be reflected by an updated “Last updated” date and may be
              notified via the Service or email where appropriate. Continued
              use after updates constitutes acceptance of the revised policy
              where permitted by law.
            </p>
          </section>

          {/* Section 13 */}
          <section className="pt-4 border-t border-neutral-200">
            <h2>13. Contact</h2>
            <p className="mb-1">For privacy questions or requests:</p>
            <p className="mb-1">
              <strong>Email:</strong>{' '}
              <a href="mailto:admin@kaban.ng">contact@kaban.ng</a>
            </p>
            <p>
              <strong>Website:</strong>{' '}
              <Link href="https://kaban.ng">https://kaban.ng</Link>
            </p>
          </section>
        </div>
      </article>
    </main>
  );
}