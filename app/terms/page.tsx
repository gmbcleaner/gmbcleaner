import type { Metadata } from 'next';
import { Navbar } from '@/components/shared/navbar';
import { Footer } from '@/components/shared/footer';
import { PageHeader } from '@/components/shared/sections';

export const metadata: Metadata = {
  title: 'Terms & Conditions',
  description:
    'Read the Terms & Conditions governing your use of GMBCLEANER, including user responsibilities, acceptable use, crypto payment terms, order processing, limitation of liability, and dispute resolution.',
};

export default function TermsPage() {
  return (
    <>
      <Navbar />
      <main>
        <PageHeader
          eyebrow="Legal"
          title="Terms & Conditions"
          description="The terms that govern your use of the GMBCLEANER platform and services. Please read them carefully before creating an account or placing an order."
        />

        <section className="py-16">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
            <div className="space-y-12">
              {/* Intro + last updated */}
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6">
                <p className="text-sm text-navy-600 leading-relaxed">
                  These Terms &amp; Conditions (&quot;Terms&quot;) form a legally binding agreement between you
                  (&quot;User,&quot; &quot;you,&quot; or &quot;your&quot;) and GMBCLEANER (&quot;Company,&quot;
                  &quot;we,&quot; &quot;us,&quot; or &quot;our&quot;) governing your access to and use of the
                  GMBCLEANER website, platform, and services (collectively, the &quot;Service&quot;). By creating an
                  account, funding your wallet, or submitting an order, you acknowledge that you have read, understood,
                  and agree to be bound by these Terms. If you do not agree, you must not access or use the Service.
                </p>
                <p className="mt-4 text-sm font-medium text-navy-900">
                  Last updated: August 1, 2025
                </p>
              </div>

              {/* 1. Service Description and Scope */}
              <section className="space-y-4">
                <h2 className="text-2xl font-bold tracking-tight text-navy-900">
                  1. Service Description and Scope
                </h2>
                <p className="text-navy-600 leading-relaxed">
                  GMBCLEANER provides a reputation management and review dispute service that helps businesses
                  identify, report, and request the removal of reviews that may violate a platform&apos;s published
                  content policies. Our scope of work includes reviewing the reviews you flag, assessing them against
                  the relevant platform&apos;s policies, preparing and submitting dispute requests through that
                  platform&apos;s official channels, and reporting the outcome to you.
                </p>
                <p className="text-navy-600 leading-relaxed">
                  The Service is limited to the preparation and submission of dispute requests. We are not a law
                  firm and do not provide legal advice. We do not post reviews, write reviews, incentivize reviews,
                  or engage with genuine, factually-based customer feedback. We do not remove reviews ourselves;
                  only the host platform has the authority to remove a review.
                </p>
                <p className="text-navy-600 leading-relaxed">
                  The Service is offered on a per-order basis. There are no recurring subscriptions unless explicitly
                  stated in a separate written agreement. Any features, tools, or dashboards we provide are intended
                  to support the dispute process and are not separate products.
                </p>
              </section>

              {/* 2. User Responsibilities */}
              <section className="space-y-4">
                <h2 className="text-2xl font-bold tracking-tight text-navy-900">
                  2. User Responsibilities
                </h2>
                <p className="text-navy-600 leading-relaxed">
                  To use the Service, you must be at least 18 years of age and have the legal capacity to enter into a
                  binding contract. If you are using the Service on behalf of a business, you represent that you have
                  the authority to bind that business to these Terms.
                </p>
                <p className="text-navy-600 leading-relaxed">You agree to:</p>
                <ul className="space-y-2.5 text-navy-600 leading-relaxed pl-6 list-disc marker:text-teal-500">
                  <li>Provide accurate, current, and complete information when creating your account.</li>
                  <li>
                    Maintain the confidentiality of your account credentials and accept responsibility for all
                    activity that occurs under your account.
                  </li>
                  <li>
                    Notify us promptly of any unauthorized use of your account or any other security breach you become
                    aware of.
                  </li>
                  <li>
                    Ensure that the reviews you flag for dispute are, to the best of your knowledge, reviews you
                    genuinely believe violate the relevant platform&apos;s policies.
                  </li>
                  <li>
                    Provide any supporting information we reasonably request in order to prepare or substantiate a
                    dispute request.
                  </li>
                  <li>
                    Keep your contact information up to date so that we can reach you regarding your orders and
                    account.
                  </li>
                </ul>
                <p className="text-navy-600 leading-relaxed">
                  You are solely responsible for the accuracy of the business listings and review URLs you submit to
                  us. We are not liable for disputes submitted against the wrong listing or for outcomes affected by
                  inaccurate information you provided.
                </p>
              </section>

              {/* 3. Acceptable Use Policy */}
              <section className="space-y-4">
                <h2 className="text-2xl font-bold tracking-tight text-navy-900">
                  3. Acceptable Use Policy
                </h2>
                <p className="text-navy-600 leading-relaxed">
                  You agree not to use the Service to engage in any unlawful, fraudulent, or abusive activity. The
                  following are strictly prohibited:
                </p>
                <ul className="space-y-2.5 text-navy-600 leading-relaxed pl-6 list-disc marker:text-teal-500">
                  <li>
                    Submitting dispute requests for genuine, factually-based reviews simply because they are negative
                    or unflattering.
                  </li>
                  <li>
                    Fabricating, altering, or misrepresenting evidence, screenshots, or other supporting materials
                    provided to us or to the host platform.
                  </li>
                  <li>
                    Using the Service to harass, intimidate, or retaliate against any reviewer, customer, or
                    competitor.
                  </li>
                  <li>
                    Attempting to circumvent, disable, or otherwise interfere with the security features of the
                    Service or the host platform.
                  </li>
                  <li>
                    Using automated systems, bots, or scripts to access the Service in a manner that sends more
                    requests than a human could reasonably send manually.
                  </li>
                  <li>
                    Reselling, sublicensing, or redistributing access to the Service without our written consent.
                  </li>
                  <li>
                    Using the Service for any illegal purpose, including but not limited to fraud, defamation, or
                    violation of applicable consumer protection laws.
                  </li>
                </ul>
                <p className="text-navy-600 leading-relaxed">
                  We reserve the right to refuse, suspend, or cancel any order or account that we believe, in our sole
                  discretion, violates this Acceptable Use Policy. We may also report suspected illegal activity to
                  the appropriate authorities.
                </p>
              </section>

              {/* 4. Payment Terms */}
              <section className="space-y-4">
                <h2 className="text-2xl font-bold tracking-tight text-navy-900">
                  4. Payment Terms
                </h2>

                <h3 className="text-xl font-semibold text-navy-900 pt-2">4.1 Wallet Funding</h3>
                <p className="text-navy-600 leading-relaxed">
                  The Service operates on a prepaid wallet model. You fund your GMBCLEANER wallet and then use that
                  balance to pay for individual orders. Wallet funds are held on account and applied to orders as you
                  submit them.
                </p>

                <h3 className="text-xl font-semibold text-navy-900 pt-2">4.2 Cryptocurrency Payments</h3>
                <p className="text-navy-600 leading-relaxed">
                  We accept payment in cryptocurrency through our integrated payment processor. By funding your wallet,
                  you authorize us to process the transaction through that processor. You are responsible for
                  ensuring that you send the correct amount in the correct currency to the address provided. We are
                  not responsible for funds sent to an incorrect address or for transactions that fail due to
                  insufficient gas or network fees on your end.
                </p>
                <p className="text-navy-600 leading-relaxed">
                  All cryptocurrency transactions are final once confirmed on the relevant blockchain network. We do
                  not control the blockchain and cannot reverse, cancel, or modify a transaction once it has been
                  confirmed. Wallet funding credits are denominated in US dollars and applied at the exchange rate in
                  effect at the time of confirmation, as determined by our payment processor.
                </p>

                <h3 className="text-xl font-semibold text-navy-900 pt-2">4.3 Minimum Funding</h3>
                <p className="text-navy-600 leading-relaxed">
                  The minimum amount required to fund your wallet is $20.00 USD per transaction. This minimum exists
                  to cover network and processing fees associated with cryptocurrency transactions. Amounts below
                  the minimum will not be processed and may be returned to the sender at the sender&apos;s expense.
                </p>

                <h3 className="text-xl font-semibold text-navy-900 pt-2">4.4 Pricing and Order Fees</h3>
                <p className="text-navy-600 leading-relaxed">
                  Each order type has a published fee that is displayed before you confirm the order. Fees are
                  deducted from your wallet balance at the time you submit the order. Prices may change without
                  notice, but any change will not affect orders already submitted and paid for.
                </p>

                <h3 className="text-xl font-semibold text-navy-900 pt-2">4.5 Taxes</h3>
                <p className="text-navy-600 leading-relaxed">
                  You are responsible for any taxes, duties, or similar charges assessed on your use of the Service
                  in your jurisdiction. We do not collect or remit taxes on your behalf unless required by law.
                </p>
              </section>

              {/* 5. Order Processing */}
              <section className="space-y-4">
                <h2 className="text-2xl font-bold tracking-tight text-navy-900">
                  5. Order Processing
                </h2>
                <p className="text-navy-600 leading-relaxed">
                  When you submit an order, the applicable fee is immediately deducted from your wallet balance. The
                  order then enters our review queue. We assess the flagged review against the relevant
                  platform&apos;s policies and, where appropriate, prepare and submit a dispute request through that
                  platform&apos;s official channels.
                </p>
                <p className="text-navy-600 leading-relaxed">
                  Processing times vary based on the volume of orders, the responsiveness of the host platform, and
                  the complexity of the case. We do not guarantee a specific turnaround time for any order. We will
                  provide status updates through your dashboard and may contact you if we need additional
                  information.
                </p>
                <p className="text-navy-600 leading-relaxed">
                  An order is considered complete when we have submitted the dispute request to the host platform and
                  reported the outcome to you, regardless of whether the platform removes the review. The outcome of
                  any dispute is determined solely by the host platform, not by GMBCLEANER.
                </p>
                <p className="text-navy-600 leading-relaxed">
                  If we determine, during our review, that a flagged review does not appear to violate any platform
                  policy, we may decline to submit a dispute request. In that case, the order fee will be refunded to
                  your wallet balance as a credit. We are not obligated to submit a dispute request for every review
                  you flag.
                </p>
              </section>

              {/* 6. No Guarantee of Results */}
              <section className="space-y-4">
                <h2 className="text-2xl font-bold tracking-tight text-navy-900">
                  6. No Guarantee of Results
                </h2>
                <p className="text-navy-600 leading-relaxed">
                  GMBCLEANER does not guarantee that any review will be removed, that any dispute will be successful,
                  or that any particular outcome will be achieved. The decision to remove a review rests entirely
                  with the host platform and is based on that platform&apos;s policies and review processes, which
                  are outside our control.
                </p>
                <p className="text-navy-600 leading-relaxed">
                  We commit to preparing and submitting dispute requests in good faith and in accordance with the
                  relevant platform&apos;s policies. We do not guarantee a favorable decision, a specific timeframe,
                  or any particular number of removals. Any statements regarding past results or success rates refer
                  only to historical outcomes and are not a promise of future performance.
                </p>
                <p className="text-navy-600 leading-relaxed">
                  You acknowledge that the Service is a best-efforts service and that results may vary significantly
                  from case to case.
                </p>
              </section>

              {/* 7. Limitation of Liability */}
              <section className="space-y-4">
                <h2 className="text-2xl font-bold tracking-tight text-navy-900">
                  7. Limitation of Liability
                </h2>
                <p className="text-navy-600 leading-relaxed">
                  To the maximum extent permitted by applicable law, in no event shall GMBCLEANER, its officers,
                  directors, employees, agents, affiliates, or contractors be liable for any indirect, incidental,
                  special, consequential, or punitive damages, or any loss of profits, business, revenue, data, or
                  goodwill, arising out of or related to your use of the Service.
                </p>
                <p className="text-navy-600 leading-relaxed">
                  Our total aggregate liability for any claim arising out of or relating to these Terms or the
                  Service shall not exceed the total amount you have paid to us through the Service in the three (3)
                  months preceding the event giving rise to the claim.
                </p>
                <p className="text-navy-600 leading-relaxed">
                  We are not liable for any action or inaction taken by a host platform, including the removal,
                  retention, or restoration of any review. We are not liable for any damages resulting from the
                  content of reviews themselves, as that content is created and published by third parties outside
                  our control.
                </p>
                <p className="text-navy-600 leading-relaxed">
                  Some jurisdictions do not allow the exclusion or limitation of certain damages, so some of the
                  above limitations may not apply to you.
                </p>
              </section>

              {/* 8. Account Termination */}
              <section className="space-y-4">
                <h2 className="text-2xl font-bold tracking-tight text-navy-900">
                  8. Account Termination
                </h2>
                <p className="text-navy-600 leading-relaxed">
                  You may close your account at any time by contacting support. Upon closure, any remaining wallet
                  balance will be handled in accordance with our Refund Policy.
                </p>
                <p className="text-navy-600 leading-relaxed">
                  We may suspend or terminate your account, without notice, if you:
                </p>
                <ul className="space-y-2.5 text-navy-600 leading-relaxed pl-6 list-disc marker:text-teal-500">
                  <li>Violate these Terms or our Acceptable Use Policy.</li>
                  <li>Provide false, misleading, or fraudulent information to us.</li>
                  <li>Fail to pay any amount owed to us.</li>
                  <li>Engage in conduct that we believe could harm us, other users, or any third party.</li>
                  <li>Are the subject of legal action or a government request that compels us to act.</li>
                </ul>
                <p className="text-navy-600 leading-relaxed">
                  Upon termination by us for cause, any wallet balance associated with fraudulent or abusive activity
                  may be forfeited. Upon termination for any other reason, remaining balances will be processed in
                  accordance with our Refund Policy.
                </p>
                <p className="text-navy-600 leading-relaxed">
                  The provisions of these Terms that by their nature should survive termination will continue to
                  apply, including the Limitation of Liability, Dispute Resolution, and Governing Law sections.
                </p>
              </section>

              {/* 9. Dispute Resolution */}
              <section className="space-y-4">
                <h2 className="text-2xl font-bold tracking-tight text-navy-900">
                  9. Dispute Resolution
                </h2>

                <h3 className="text-xl font-semibold text-navy-900 pt-2">9.1 Good Faith Negotiation</h3>
                <p className="text-navy-600 leading-relaxed">
                  If a dispute arises out of or relates to these Terms or the Service, the parties agree to first
                  attempt to resolve it through good-faith negotiation. The complaining party must send a written
                  notice describing the dispute to the other party, and the parties will attempt to resolve the
                  matter within thirty (30) days.
                </p>

                <h3 className="text-xl font-semibold text-navy-900 pt-2">9.2 Binding Arbitration</h3>
                <p className="text-navy-600 leading-relaxed">
                  If the dispute is not resolved through negotiation within thirty (30) days, the dispute shall be
                  finally resolved by binding arbitration administered by a single arbitrator under the applicable
                  rules of an arbitration body mutually agreed upon by the parties. The arbitration shall be
                  conducted remotely where possible. The arbitrator&apos;s award shall be final and binding, and
                  judgment may be entered on it in any court of competent jurisdiction.
                </p>
                <p className="text-navy-600 leading-relaxed">
                  Each party shall bear its own costs in connection with the arbitration, except that the
                  arbitrator may award reasonable costs to the prevailing party where permitted by law.
                </p>

                <h3 className="text-xl font-semibold text-navy-900 pt-2">9.3 Class Action Waiver</h3>
                <p className="text-navy-600 leading-relaxed">
                  You and GMBCLEANER agree that any arbitration or legal proceeding shall be conducted on an
                  individual basis only, and not as a class action or other representative proceeding. Neither party
                  may join or consolidate claims with those of any other person or entity.
                </p>

                <h3 className="text-xl font-semibold text-navy-900 pt-2">9.4 Equitable Relief</h3>
                <p className="text-navy-600 leading-relaxed">
                  Nothing in this section prevents either party from seeking injunctive or other equitable relief from
                  a court of competent jurisdiction to protect intellectual property, confidentiality, or other
                  rights where monetary damages would be inadequate.
                </p>
              </section>

              {/* 10. Governing Law */}
              <section className="space-y-4">
                <h2 className="text-2xl font-bold tracking-tight text-navy-900">
                  10. Governing Law
                </h2>
                <p className="text-navy-600 leading-relaxed">
                  These Terms and any dispute arising out of or relating to them shall be governed by and construed in
                  accordance with the laws of the State of Delaware, United States of America, without regard to its
                  conflict of laws principles.
                </p>
                <p className="text-navy-600 leading-relaxed">
                  The United Nations Convention on Contracts for the International Sale of Goods does not apply to
                  these Terms. If any provision of these Terms is held to be invalid or unenforceable, that provision
                  shall be severed and the remaining provisions shall remain in full force and effect.
                </p>
              </section>

              {/* 11. Changes to These Terms */}
              <section className="space-y-4">
                <h2 className="text-2xl font-bold tracking-tight text-navy-900">
                  11. Changes to These Terms
                </h2>
                <p className="text-navy-600 leading-relaxed">
                  We may update these Terms from time to time. When we do, we will revise the &quot;Last updated&quot;
                  date at the top of this page. We encourage you to review these Terms periodically. Your continued
                  use of the Service after any change constitutes your acceptance of the revised Terms. If you do not
                  agree to the updated Terms, you should stop using the Service.
                </p>
                <p className="text-navy-600 leading-relaxed">
                  For material changes that affect your rights or obligations, we will make a reasonable effort to
                  notify you through your account dashboard or by email. However, it remains your responsibility to
                  review these Terms regularly.
                </p>
              </section>

              {/* 12. Contact */}
              <section className="space-y-4">
                <h2 className="text-2xl font-bold tracking-tight text-navy-900">
                  12. Contact Us
                </h2>
                <p className="text-navy-600 leading-relaxed">
                  If you have any questions about these Terms, you may contact us at:
                </p>
                <div className="rounded-2xl border border-slate-200 bg-white p-6">
                  <p className="text-navy-900 font-semibold">GMBCLEANER Support</p>
                  <p className="mt-2 text-navy-600">Email: support@gmbcleaner.com</p>
                  <p className="text-navy-600">Website: https://gmbcleaner.com</p>
                  <p className="text-navy-600">Hours: Monday–Friday, 9:00 AM – 6:00 PM (Eastern Time)</p>
                </div>
                <p className="text-navy-600 leading-relaxed">
                  We aim to respond to all inquiries within two (2) business days.
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
