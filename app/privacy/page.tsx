import type { Metadata } from 'next';
import { Navbar } from '@/components/shared/navbar';
import { Footer } from '@/components/shared/footer';
import { PageHeader } from '@/components/shared/sections';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description:
    'Learn how GMBCLEANER collects, uses, stores, and protects your personal data, including information about cookies, third-party services like Supabase and crypto payment processors, data retention, and your rights under GDPR.',
};

export default function PrivacyPage() {
  return (
    <>
      <Navbar />
      <main>
        <PageHeader
          eyebrow="Legal"
          title="Privacy Policy"
          description="Your privacy matters to us. This policy explains what data we collect, how we use it, how we keep it secure, and the rights you have over your information."
        />

        <section className="py-16">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
            <div className="space-y-12">
              {/* Intro + last updated */}
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6">
                <p className="text-sm text-navy-600 leading-relaxed">
                  This Privacy Policy explains how GMBCLEANER (&quot;Company,&quot; &quot;we,&quot; &quot;us,&quot; or
                  &quot;our&quot;) collects, uses, discloses, and safeguards your information when you use our website,
                  platform, and services (collectively, the &quot;Service&quot;). We are committed to protecting your
                  privacy and handling your data transparently and in accordance with applicable data protection laws.
                </p>
                <p className="mt-4 text-sm font-medium text-navy-900">
                  Last updated: August 1, 2025
                </p>
              </div>

              {/* 1. Information We Collect */}
              <section className="space-y-4">
                <h2 className="text-2xl font-bold tracking-tight text-navy-900">
                  1. Information We Collect
                </h2>
                <p className="text-navy-600 leading-relaxed">
                  We collect only the information necessary to provide and improve the Service. The categories of
                  information we collect are described below.
                </p>

                <h3 className="text-xl font-semibold text-navy-900 pt-2">
                  1.1 Information You Provide Directly
                </h3>
                <ul className="space-y-2.5 text-navy-600 leading-relaxed pl-6 list-disc marker:text-teal-500">
                  <li>
                    <span className="font-medium text-navy-900">Account information:</span> Your name, email address,
                    and password when you register for an account.
                  </li>
                  <li>
                    <span className="font-medium text-navy-900">Business information:</span> The business name, listing
                    URL, and related details you provide when submitting a review dispute order.
                  </li>
                  <li>
                    <span className="font-medium text-navy-900">Order details:</span> The review URLs, review content
                    excerpts, and any notes or supporting materials you submit with an order.
                  </li>
                  <li>
                    <span className="font-medium text-navy-900">Communications:</span> The content of any messages,
                    emails, or support requests you send to us.
                  </li>
                </ul>

                <h3 className="text-xl font-semibold text-navy-900 pt-2">
                  1.2 Information Collected Automatically
                </h3>
                <ul className="space-y-2.5 text-navy-600 leading-relaxed pl-6 list-disc marker:text-teal-500">
                  <li>
                    <span className="font-medium text-navy-900">Usage data:</span> Information about how you interact
                    with the Service, such as pages visited, features used, and time spent on the platform.
                  </li>
                  <li>
                    <span className="font-medium text-navy-900">Device and technical data:</span> IP address, browser
                    type and version, operating system, and referring page URLs.
                  </li>
                  <li>
                    <span className="font-medium text-navy-900">Cookies and similar technologies:</span> See Section 4
                    below for details on how we use cookies.
                  </li>
                </ul>

                <h3 className="text-xl font-semibold text-navy-900 pt-2">
                  1.3 Information From Payment Processing
                </h3>
                <p className="text-navy-600 leading-relaxed">
                  When you fund your wallet, we receive confirmation of the transaction from our payment processor.
                  This may include the transaction hash, the amount, the currency, and the wallet address used. We do
                  not store your private wallet keys, and we never request them.
                </p>
              </section>

              {/* 2. How We Use Your Data */}
              <section className="space-y-4">
                <h2 className="text-2xl font-bold tracking-tight text-navy-900">
                  2. How We Use Your Data
                </h2>
                <p className="text-navy-600 leading-relaxed">We use the information we collect for the following purposes:</p>
                <ul className="space-y-2.5 text-navy-600 leading-relaxed pl-6 list-disc marker:text-teal-500">
                  <li>
                    <span className="font-medium text-navy-900">Providing the Service:</span> Creating and managing
                    your account, processing your wallet funding, and preparing and submitting your review dispute
                    orders.
                  </li>
                  <li>
                    <span className="font-medium text-navy-900">Communication:</span> Sending you order status
                    updates, responding to your support requests, and notifying you of important changes to the
                    Service or these policies.
                  </li>
                  <li>
                    <span className="font-medium text-navy-900">Account security:</span> Verifying your identity,
                    detecting and preventing fraud, and protecting your account from unauthorized access.
                  </li>
                  <li>
                    <span className="font-medium text-navy-900">Service improvement:</span> Analyzing usage patterns to
                    improve our features, fix bugs, and enhance the user experience. We use aggregated and
                    de-identified data for this purpose wherever possible.
                  </li>
                  <li>
                    <span className="font-medium text-navy-900">Legal compliance:</span> Meeting our legal obligations
                    and responding to lawful requests from authorities where required.
                  </li>
                </ul>
                <p className="text-navy-600 leading-relaxed">
                  We do not sell your personal information to third parties. We do not use your data to train
                  third-party artificial intelligence models.
                </p>
              </section>

              {/* 3. Data Storage and Security */}
              <section className="space-y-4">
                <h2 className="text-2xl font-bold tracking-tight text-navy-900">
                  3. Data Storage and Security
                </h2>
                <p className="text-navy-600 leading-relaxed">
                  Your data is stored using Supabase, a secure, cloud-based database platform that provides encrypted
                  data storage at rest and in transit. All data transmitted between your browser and our servers is
                  protected using TLS (Transport Layer Security) encryption.
                </p>
                <p className="text-navy-600 leading-relaxed">
                  We implement industry-standard security measures to protect your information, including:
                </p>
                <ul className="space-y-2.5 text-navy-600 leading-relaxed pl-6 list-disc marker:text-teal-500">
                  <li>Encrypted password storage using one-way hashing algorithms.</li>
                  <li>Row-level security policies that restrict data access to authorized users only.</li>
                  <li>Regular security reviews of our database configuration and access controls.</li>
                  <li>Principle of least privilege for all internal access to user data.</li>
                  <li>Secure session management for authenticated users.</li>
                </ul>
                <p className="text-navy-600 leading-relaxed">
                  While we take reasonable measures to protect your data, no method of transmission or storage is
                  completely secure. We cannot guarantee absolute security, and you acknowledge that you provide your
                  information at your own risk.
                </p>
              </section>

              {/* 4. Cookie Usage */}
              <section className="space-y-4">
                <h2 className="text-2xl font-bold tracking-tight text-navy-900">
                  4. Cookie Usage
                </h2>
                <p className="text-navy-600 leading-relaxed">
                  Cookies are small text files placed on your device by the websites you visit. We use cookies and
                  similar technologies to operate the Service and to understand how you use it.
                </p>

                <h3 className="text-xl font-semibold text-navy-900 pt-2">4.1 Essential Cookies</h3>
                <p className="text-navy-600 leading-relaxed">
                  These cookies are necessary for the Service to function. They enable you to log in, maintain your
                  session, and access secure areas of the platform. Essential cookies cannot be disabled, as doing so
                  would prevent the Service from working.
                </p>

                <h3 className="text-xl font-semibold text-navy-900 pt-2">4.2 Functional Cookies</h3>
                <p className="text-navy-600 leading-relaxed">
                  These cookies remember your preferences, such as your selected language or display settings, so that
                  we can provide a more personalized experience.
                </p>

                <h3 className="text-xl font-semibold text-navy-900 pt-2">4.3 Analytics Cookies</h3>
                <p className="text-navy-600 leading-relaxed">
                  These cookies help us understand how visitors interact with the Service by collecting and reporting
                  information anonymously. We use this data to identify trends and improve the user experience.
                </p>

                <h3 className="text-xl font-semibold text-navy-900 pt-2">4.4 Managing Cookies</h3>
                <p className="text-navy-600 leading-relaxed">
                  You can control and manage cookies through your browser settings. Most browsers allow you to refuse
                  cookies or alert you when cookies are being sent. Disabling cookies may affect the functionality of
                  the Service. Please refer to your browser&apos;s help documentation for instructions on managing
                  cookies.
                </p>
              </section>

              {/* 5. Third-Party Services */}
              <section className="space-y-4">
                <h2 className="text-2xl font-bold tracking-tight text-navy-900">
                  5. Third-Party Services
                </h2>
                <p className="text-navy-600 leading-relaxed">
                  We rely on certain third-party services to operate the Service. These providers may collect, store,
                  and process data on our behalf in accordance with their own privacy policies. We share only the
                  minimum data necessary to use their services.
                </p>

                <h3 className="text-xl font-semibold text-navy-900 pt-2">5.1 Supabase (Authentication &amp; Database)</h3>
                <p className="text-navy-600 leading-relaxed">
                  We use Supabase for user authentication and as our primary database provider. Supabase stores your
                  account credentials, profile information, order data, and wallet balance. Supabase processes data in
                  accordance with its own privacy policy and complies with industry-standard security practices.
                  Your authentication data is protected by Supabase&apos;s built-in security features, including
                  encrypted password hashing and row-level security policies.
                </p>

                <h3 className="text-xl font-semibold text-navy-900 pt-2">5.2 Cryptocurrency Payment Processor</h3>
                <p className="text-navy-600 leading-relaxed">
                  We use an integrated cryptocurrency payment processor to handle wallet funding transactions. When you
                  fund your wallet, the processor receives your transaction details, including the wallet address and
                  transaction amount. The processor operates under its own privacy and security policies. We do not
                  store your private wallet keys or seed phrases, and we never request them.
                </p>

                <h3 className="text-xl font-semibold text-navy-900 pt-2">5.3 Review Platforms</h3>
                <p className="text-navy-600 leading-relaxed">
                  When we submit a dispute request on your behalf, the relevant review platform (such as Google) may
                  receive information you provided to us, including business listing details and the content of the
                  flagged review. These platforms process such information under their own terms and privacy policies.
                </p>

                <p className="text-navy-600 leading-relaxed">
                  We are not responsible for the privacy practices of third-party services. We encourage you to review
                  the privacy policies of any third-party service that you interact with.
                </p>
              </section>

              {/* 6. Data Retention */}
              <section className="space-y-4">
                <h2 className="text-2xl font-bold tracking-tight text-navy-900">
                  6. Data Retention Policy
                </h2>
                <p className="text-navy-600 leading-relaxed">
                  We retain your personal information only for as long as necessary to fulfill the purposes described in
                  this policy, comply with our legal obligations, and resolve disputes.
                </p>
                <ul className="space-y-2.5 text-navy-600 leading-relaxed pl-6 list-disc marker:text-teal-500">
                  <li>
                    <span className="font-medium text-navy-900">Active accounts:</span> Your account data is retained
                    for as long as your account is active. If you close your account, we will delete or anonymize your
                    personal data within thirty (30) days, except where retention is required by law.
                  </li>
                  <li>
                    <span className="font-medium text-navy-900">Order records:</span> Records of completed orders,
                    including dispute submissions and outcomes, are retained for two (2) years after the order is
                    completed, after which they are deleted or anonymized.
                  </li>
                  <li>
                    <span className="font-medium text-navy-900">Transaction data:</span> Payment transaction records
                    are retained for seven (7) years as required for tax and financial compliance purposes.
                  </li>
                  <li>
                    <span className="font-medium text-navy-900">Support communications:</span> Emails and support
                    messages are retained for one (1) year after the conversation is closed.
                  </li>
                  <li>
                    <span className="font-medium text-navy-900">Server logs:</span> Technical server logs are retained
                    for ninety (90) days for security and troubleshooting purposes.
                  </li>
                </ul>
                <p className="text-navy-600 leading-relaxed">
                  When data is no longer needed, we securely delete it or anonymize it so that it can no longer be
                  associated with you.
                </p>
              </section>

              {/* 7. Your Rights */}
              <section className="space-y-4">
                <h2 className="text-2xl font-bold tracking-tight text-navy-900">
                  7. Your Rights
                </h2>
                <p className="text-navy-600 leading-relaxed">
                  Depending on your jurisdiction, you may have certain rights regarding your personal data. We are
                  committed to helping you exercise these rights.
                </p>

                <h3 className="text-xl font-semibold text-navy-900 pt-2">7.1 Right of Access</h3>
                <p className="text-navy-600 leading-relaxed">
                  You have the right to request a copy of the personal data we hold about you. You can access much of
                  this information directly through your account dashboard. For a complete export, contact us using the
                  details in Section 9.
                </p>

                <h3 className="text-xl font-semibold text-navy-900 pt-2">7.2 Right to Deletion</h3>
                <p className="text-navy-600 leading-relaxed">
                  You have the right to request that we delete your personal data. You may initiate this process by
                  closing your account or by contacting us directly. We will delete your data within thirty (30) days,
                  except where we are legally required to retain certain records, such as transaction data for tax
                  compliance.
                </p>

                <h3 className="text-xl font-semibold text-navy-900 pt-2">7.3 Right to Correction</h3>
                <p className="text-navy-600 leading-relaxed">
                  You have the right to request that we correct any inaccurate or incomplete personal data we hold
                  about you. You can update most profile information directly through your account settings. For
                  information you cannot edit yourself, contact us and we will make the correction promptly.
                </p>

                <h3 className="text-xl font-semibold text-navy-900 pt-2">7.4 Additional Rights</h3>
                <ul className="space-y-2.5 text-navy-600 leading-relaxed pl-6 list-disc marker:text-teal-500">
                  <li>
                    <span className="font-medium text-navy-900">Right to object:</span> You may object to our
                    processing of your data for certain purposes, such as direct marketing.
                  </li>
                  <li>
                    <span className="font-medium text-navy-900">Right to restrict processing:</span> You may request
                    that we limit our processing of your data in certain circumstances.
                  </li>
                  <li>
                    <span className="font-medium text-navy-900">Right to data portability:</span> You may request that
                    we provide your personal data in a structured, machine-readable format so that you can transfer it
                    to another service.
                  </li>
                  <li>
                    <span className="font-medium text-navy-900">Right to withdraw consent:</span> Where we rely on your
                    consent to process data, you may withdraw that consent at any time.
                  </li>
                </ul>
                <p className="text-navy-600 leading-relaxed">
                  To exercise any of these rights, contact us using the details in Section 9. We will respond to your
                  request within thirty (30) days. We may need to verify your identity before processing your request.
                </p>
              </section>

              {/* 8. GDPR Compliance */}
              <section className="space-y-4">
                <h2 className="text-2xl font-bold tracking-tight text-navy-900">
                  8. GDPR Compliance Statement
                </h2>
                <p className="text-navy-600 leading-relaxed">
                  GMBCLEANER is committed to complying with the European Union&apos;s General Data Protection
                  Regulation (GDPR) and the UK Data Protection Act with respect to the personal data of individuals
                  located in the European Economic Area (EEA) and the United Kingdom.
                </p>
                <p className="text-navy-600 leading-relaxed">
                  Our lawful basis for processing your personal data is:
                </p>
                <ul className="space-y-2.5 text-navy-600 leading-relaxed pl-6 list-disc marker:text-teal-500">
                  <li>
                    <span className="font-medium text-navy-900">Contractual necessity:</span> We process your account
                    and order data to provide the Service you have requested.
                  </li>
                  <li>
                    <span className="font-medium text-navy-900">Legal obligation:</span> We retain certain records,
                    such as transaction data, to comply with tax and financial regulations.
                  </li>
                  <li>
                    <span className="font-medium text-navy-900">Legitimate interests:</span> We process usage and
                    analytics data to improve the Service and maintain security, where our interests do not override
                    your rights and freedoms.
                  </li>
                  <li>
                    <span className="font-medium text-navy-900">Consent:</span> We rely on your consent for
                    non-essential cookies and optional marketing communications. You may withdraw consent at any time.
                  </li>
                </ul>
                <p className="text-navy-600 leading-relaxed">
                  If you are located in the EEA or the UK, you have the rights described in Section 7. If you believe we
                  have not complied with our obligations under the GDPR, you have the right to lodge a complaint with
                  your local data protection authority. You may also contact our data protection contact at
                  privacy@gmbcleaner.online.
                </p>
                <p className="text-navy-600 leading-relaxed">
                  We do not transfer your personal data outside the EEA or UK without appropriate safeguards in place,
                  such as Standard Contractual Clauses approved by the European Commission.
                </p>
              </section>

              {/* 9. Contact for Privacy Concerns */}
              <section className="space-y-4">
                <h2 className="text-2xl font-bold tracking-tight text-navy-900">
                  9. Contact for Privacy Concerns
                </h2>
                <p className="text-navy-600 leading-relaxed">
                  If you have any questions, concerns, or requests regarding this Privacy Policy or your personal data,
                  please contact us:
                </p>
                <div className="rounded-2xl border border-slate-200 bg-white p-6">
                  <p className="text-navy-900 font-semibold">GMBCLEANER Privacy Team</p>
                  <p className="mt-2 text-navy-600">Email: privacy@gmbcleaner.online</p>
                  <p className="text-navy-600">General support: support@gmbcleaner.online</p>
                  <p className="text-navy-600">Website: https://gmbcleaner.online</p>
                  <p className="text-navy-600">Hours: Monday–Friday, 9:00 AM – 6:00 PM (Eastern Time)</p>
                </div>
                <p className="text-navy-600 leading-relaxed">
                  We aim to respond to all privacy-related inquiries within five (5) business days. For requests to
                  exercise your data rights, we will respond within thirty (30) days as required by applicable law.
                </p>
              </section>

              {/* 10. Changes to This Policy */}
              <section className="space-y-4">
                <h2 className="text-2xl font-bold tracking-tight text-navy-900">
                  10. Changes to This Policy
                </h2>
                <p className="text-navy-600 leading-relaxed">
                  We may update this Privacy Policy from time to time to reflect changes in our practices, technology,
                  legal requirements, or other factors. When we do, we will revise the &quot;Last updated&quot; date at
                  the top of this page.
                </p>
                <p className="text-navy-600 leading-relaxed">
                  For material changes that affect your rights, we will provide a more prominent notice, such as a
                  notification in your account dashboard or an email to the address on file. We encourage you to
                  review this policy periodically to stay informed about how we collect, use, and protect your data.
                </p>
              </section>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
