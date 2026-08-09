import type { Metadata } from 'next';
import { Navbar } from '@/components/shared/navbar';
import { Footer } from '@/components/shared/footer';
import { PageHeader } from '@/components/shared/sections';

export const metadata: Metadata = {
  title: 'Refund Policy',
  description:
    'Read the GMBCLEANER Refund Policy covering wallet funding, when refunds are and are not applicable, the refund process and timeline, partial refunds, and how to request a refund.',
};

export default function RefundPage() {
  return (
    <>
      <Navbar />
      <main>
        <PageHeader
          eyebrow="Legal"
          title="Refund Policy"
          description="We want you to feel confident using GMBCLEANER. This policy explains when refunds are available, when they are not, and how to request one."
        />

        <section className="py-16">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
            <div className="space-y-12">
              {/* Intro + last updated */}
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6">
                <p className="text-sm text-navy-600 leading-relaxed">
                  This Refund Policy forms part of the GMBCLEANER Terms &amp; Conditions and applies to all wallet
                  funding transactions and orders placed through the Service. By funding your wallet or placing an
                  order, you agree to the terms set out below. If you have any questions, please contact us at
                  support@gmbcleaner.com before making a payment.
                </p>
                <p className="mt-4 text-sm font-medium text-navy-900">
                  Last updated: August 1, 2025
                </p>
              </div>

              {/* 1. Wallet Funding and Deposits */}
              <section className="space-y-4">
                <h2 className="text-2xl font-bold tracking-tight text-navy-900">
                  1. Wallet Funding and Deposits
                </h2>
                <p className="text-navy-600 leading-relaxed">
                  GMBCLEANER operates on a prepaid wallet model. You fund your wallet with cryptocurrency, and the
                  funds are held on your account as a credit balance. You then use this balance to pay for individual
                  review dispute orders.
                </p>
                <p className="text-navy-600 leading-relaxed">
                  The minimum amount required to fund your wallet is $20.00 USD per transaction. This minimum exists
                  to cover network and processing fees associated with cryptocurrency transactions.
                </p>
                <p className="text-navy-600 leading-relaxed">
                  When you fund your wallet, the transaction is processed through our integrated cryptocurrency payment
                  processor. Once the transaction is confirmed on the blockchain network, the corresponding amount is
                  credited to your wallet balance. Cryptocurrency transactions are irreversible by nature, and we
                  cannot reverse or cancel a confirmed transaction on the blockchain.
                </p>
                <p className="text-navy-600 leading-relaxed">
                  Wallet funding is not a payment for a specific order. It is a deposit of credit that you control and
                  use at your discretion. You may request a refund of your unused wallet balance at any time, subject
                  to the conditions in Section 3 of this policy.
                </p>
              </section>

              {/* 2. When Refunds Are Applicable */}
              <section className="space-y-4">
                <h2 className="text-2xl font-bold tracking-tight text-navy-900">
                  2. When Refunds Are Applicable
                </h2>
                <p className="text-navy-600 leading-relaxed">
                  We are committed to fair treatment of our users. Refunds are available in the following situations:
                </p>

                <h3 className="text-xl font-semibold text-navy-900 pt-2">
                  2.1 Unused Wallet Balance
                </h3>
                <p className="text-navy-600 leading-relaxed">
                  If you have an unused wallet balance and no active orders, you may request a refund of that balance
                  at any time. The refund will be issued in the same cryptocurrency originally used to fund the wallet,
                  to the same wallet address from which the payment was made. If the original wallet address is no
                  longer accessible, contact us to arrange an alternative.
                </p>

                <h3 className="text-xl font-semibold text-navy-900 pt-2">
                  2.2 Service Not Rendered
                </h3>
                <p className="text-navy-600 leading-relaxed">
                  If you have paid for an order and we have not submitted a dispute request to the relevant platform,
                  you are entitled to a full refund of the order fee. This includes situations where we have accepted
                  your order but have not yet begun processing it, or where we are unable to process the order due to
                  a technical issue on our end.
                </p>

                <h3 className="text-xl font-semibold text-navy-900 pt-2">
                  2.3 Duplicate Payment
                </h3>
                <p className="text-navy-600 leading-relaxed">
                  If you accidentally fund your wallet twice for the same transaction, or if a technical error results
                  in a duplicate charge, we will refund the duplicate amount in full. Please notify us as soon as you
                  become aware of the duplicate so we can investigate and process the refund promptly.
                </p>

                <h3 className="text-xl font-semibold text-navy-900 pt-2">
                  2.4 Declined Dispute Request
                </h3>
                <p className="text-navy-600 leading-relaxed">
                  If, during our internal review, we determine that a flagged review does not appear to violate any
                  platform policy and we decline to submit a dispute request, the full order fee will be credited back
                  to your wallet balance automatically. You may then use this credit for other orders or request a
                  refund of the credit to your original payment method.
                </p>

                <h3 className="text-xl font-semibold text-navy-900 pt-2">
                  2.5 Account Closure
                </h3>
                <p className="text-navy-600 leading-relaxed">
                  If you choose to close your account and you have an unused wallet balance with no active orders, we
                  will refund that balance to you. Please allow up to fourteen (14) business days for the refund to be
                  processed.
                </p>
              </section>

              {/* 3. When Refunds Are NOT Applicable */}
              <section className="space-y-4">
                <h2 className="text-2xl font-bold tracking-tight text-navy-900">
                  3. When Refunds Are NOT Applicable
                </h2>
                <p className="text-navy-600 leading-relaxed">
                  Refunds are not available in the following situations. Please review these carefully before placing
                  an order.
                </p>

                <h3 className="text-xl font-semibold text-navy-900 pt-2">
                  3.1 Service Already Rendered
                </h3>
                <p className="text-navy-600 leading-relaxed">
                  Once we have submitted a dispute request to the relevant platform on your behalf, the order is
                  considered complete and the fee is non-refundable. This applies regardless of the outcome of the
                  dispute. We are paid for the work of preparing and submitting the dispute request, not for the
                  platform&apos;s decision. The host platform, not GMBCLEANER, determines whether a review is removed.
                </p>

                <h3 className="text-xl font-semibold text-navy-900 pt-2">
                  3.2 Platform Decision Unfavorable
                </h3>
                <p className="text-navy-600 leading-relaxed">
                  If we submit a dispute request and the host platform decides not to remove the review, the order fee
                  is non-refundable. As stated in our Terms &amp; Conditions, we do not guarantee any particular
                  outcome. The decision to remove a review rests entirely with the host platform and is outside our
                  control. We commit to preparing and submitting dispute requests in good faith, but we cannot
                  guarantee a favorable result.
                </p>

                <h3 className="text-xl font-semibold text-navy-900 pt-2">
                  3.3 False or Misleading Information
                </h3>
                <p className="text-navy-600 leading-relaxed">
                  If an order is cancelled or a dispute is rejected because you provided false, misleading, or
                  fraudulent information, no refund will be issued. This includes situations where fabricated
                  evidence or misrepresentations are discovered during our review or by the host platform.
                </p>

                <h3 className="text-xl font-semibold text-navy-900 pt-2">
                  3.4 Violation of Terms
                </h3>
                <p className="text-navy-600 leading-relaxed">
                  If your account is terminated for cause due to a violation of our Terms &amp; Conditions or
                  Acceptable Use Policy, any wallet balance associated with the violation may be forfeited and no
                  refund will be issued. This includes balances associated with fraudulent, abusive, or unlawful
                  activity.
                </p>

                <h3 className="text-xl font-semibold text-navy-900 pt-2">
                  3.5 Insufficient Balance Below Minimum
                </h3>
                <p className="text-navy-600 leading-relaxed">
                  If you attempt to fund your wallet with an amount below the $20.00 USD minimum and the transaction
                  is not processed, we are not responsible for any resulting loss. Where possible, amounts below the
                  minimum will be returned to the sender, but the sender is responsible for any network fees incurred.
                </p>

                <h3 className="text-xl font-semibold text-navy-900 pt-2">
                  3.6 Cryptocurrency Network Issues
                </h3>
                <p className="text-navy-600 leading-relaxed">
                  We are not responsible for refunds arising from issues on the cryptocurrency network itself, including
                  delayed confirmations, network congestion, or transactions sent to an incorrect address by the user.
                  We strongly recommend that you verify the destination address and network before confirming any
                  transaction.
                </p>
              </section>

              {/* 4. Refund Process and Timeline */}
              <section className="space-y-4">
                <h2 className="text-2xl font-bold tracking-tight text-navy-900">
                  4. Refund Process and Timeline
                </h2>
                <p className="text-navy-600 leading-relaxed">
                  We aim to process all eligible refunds as quickly as possible. The following timeline applies:
                </p>

                <div className="overflow-hidden rounded-2xl border border-slate-200">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-slate-50 text-navy-900">
                      <tr>
                        <th className="px-6 py-4 font-semibold">Step</th>
                        <th className="px-6 py-4 font-semibold">Description</th>
                        <th className="px-6 py-4 font-semibold whitespace-nowrap">Timeframe</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 text-navy-600">
                      <tr>
                        <td className="px-6 py-4 font-medium text-navy-900">1. Request</td>
                        <td className="px-6 py-4">You submit a refund request through your dashboard or by email.</td>
                        <td className="px-6 py-4 whitespace-nowrap">Day 0</td>
                      </tr>
                      <tr>
                        <td className="px-6 py-4 font-medium text-navy-900">2. Review</td>
                        <td className="px-6 py-4">We review your request and verify eligibility.</td>
                        <td className="px-6 py-4 whitespace-nowrap">1–3 business days</td>
                      </tr>
                      <tr>
                        <td className="px-6 py-4 font-medium text-navy-900">3. Approval</td>
                        <td className="px-6 py-4">If approved, we initiate the refund transaction.</td>
                        <td className="px-6 py-4 whitespace-nowrap">Within 5 business days</td>
                      </tr>
                      <tr>
                        <td className="px-6 py-4 font-medium text-navy-900">4. Processing</td>
                        <td className="px-6 py-4">The refund is confirmed on the blockchain network.</td>
                        <td className="px-6 py-4 whitespace-nowrap">1–7 business days</td>
                      </tr>
                      <tr>
                        <td className="px-6 py-4 font-medium text-navy-900">5. Complete</td>
                        <td className="px-6 py-4">Funds appear in your wallet.</td>
                        <td className="px-6 py-4 whitespace-nowrap">Total: up to 14 business days</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <p className="text-navy-600 leading-relaxed">
                  The total time from request to receipt depends on the speed of blockchain confirmations, which is
                  outside our control. We will provide you with a transaction hash once the refund has been initiated
                  so that you can track it on the blockchain.
                </p>
                <p className="text-navy-600 leading-relaxed">
                  Refunds are issued in the same cryptocurrency originally used for payment. We do not refund in a
                  different cryptocurrency or in fiat currency. If the original payment method is no longer available,
                  contact us to discuss alternatives.
                </p>
                <p className="text-navy-600 leading-relaxed">
                  Any network fees associated with processing the refund will be deducted from the refund amount. We do
                  not charge additional fees for processing eligible refunds.
                </p>
              </section>

              {/* 5. Partial Refunds */}
              <section className="space-y-4">
                <h2 className="text-2xl font-bold tracking-tight text-navy-900">
                  5. Partial Refunds for Partially Completed Orders
                </h2>
                <p className="text-navy-600 leading-relaxed">
                  In certain situations, an order may be only partially completed. In these cases, a partial refund may
                  be available.
                </p>
                <ul className="space-y-2.5 text-navy-600 leading-relaxed pl-6 list-disc marker:text-teal-500">
                  <li>
                    <span className="font-medium text-navy-900">Bulk orders:</span> If you submit a bulk order covering
                    multiple reviews and we are only able to prepare and submit disputes for some of them, you will
                    receive a partial refund for the reviews we were unable to process. The refund will be credited to
                    your wallet balance.
                  </li>
                  <li>
                    <span className="font-medium text-navy-900">Order cancellation before submission:</span> If you
                    cancel an order after we have begun preliminary review but before we have submitted the dispute
                    request to the platform, a partial refund of fifty percent (50%) of the order fee may be issued to
                    your wallet balance, reflecting the work already performed.
                  </li>
                  <li>
                    <span className="font-medium text-navy-900">Technical failure during submission:</span> If a
                    technical issue on our end prevents us from completing the submission after we have prepared the
                    dispute, we will credit the full order fee back to your wallet balance and re-attempt the
                    submission at no additional charge.
                  </li>
                </ul>
                <p className="text-navy-600 leading-relaxed">
                  Partial refunds are issued as credits to your wallet balance. You may use the credit for future orders
                  or request that it be refunded to your original payment method, subject to the process in Section 4.
                </p>
                <p className="text-navy-600 leading-relaxed">
                  Partial refunds are not available where the only reason for the request is that the host platform
                  declined to remove a review after we submitted a complete and good-faith dispute request.
                </p>
              </section>

              {/* 6. How to Request a Refund */}
              <section className="space-y-4">
                <h2 className="text-2xl font-bold tracking-tight text-navy-900">
                  6. How to Request a Refund
                </h2>
                <p className="text-navy-600 leading-relaxed">
                  To request a refund, please follow these steps:
                </p>
                <ol className="space-y-3 text-navy-600 leading-relaxed pl-6 list-decimal marker:text-teal-500 marker:font-semibold">
                  <li>
                    <span className="font-medium text-navy-900">Log in to your account</span> and navigate to your
                    dashboard.
                  </li>
                  <li>
                    <span className="font-medium text-navy-900">Locate the order or transaction</span> for which you
                    are requesting a refund, or select &quot;Refund wallet balance&quot; if you are requesting a
                    refund of unused funds.
                  </li>
                  <li>
                    <span className="font-medium text-navy-900">Click &quot;Request Refund&quot;</span> and complete the
                    refund request form, including the reason for your request and the wallet address where you would
                    like to receive the refund.
                  </li>
                  <li>
                    <span className="font-medium text-navy-900">Submit the form.</span> You will receive a confirmation
                    email with your request reference number.
                  </li>
                </ol>
                <p className="text-navy-600 leading-relaxed">
                  If you are unable to access your account or prefer to request a refund by email, you may also send
                  your request to support@gmbcleaner.com. Please include your account email, the order number or
                    transaction details, the reason for the refund, and the wallet address for receiving the refund.
                </p>
                <p className="text-navy-600 leading-relaxed">
                  To help us process your request quickly, please include as much detail as possible. Incomplete
                  requests may take longer to review. We may ask you to verify your identity before processing a
                  refund to protect your account from unauthorized access.
                </p>
              </section>

              {/* 7. Contact Information */}
              <section className="space-y-4">
                <h2 className="text-2xl font-bold tracking-tight text-navy-900">
                  7. Contact Information
                </h2>
                <p className="text-navy-600 leading-relaxed">
                  If you have any questions about this Refund Policy or need help with a refund request, we are here to
                  help.
                </p>
                <div className="rounded-2xl border border-slate-200 bg-white p-6">
                  <p className="text-navy-900 font-semibold">GMBCLEANER Support</p>
                  <p className="mt-2 text-navy-600">Email: support@gmbcleaner.com</p>
                  <p className="text-navy-600">Website: https://gmbcleaner.com</p>
                  <p className="text-navy-600">Hours: Monday–Friday, 9:00 AM – 6:00 PM (Eastern Time)</p>
                </div>
                <p className="text-navy-600 leading-relaxed">
                  We aim to respond to all refund-related inquiries within two (2) business days. If your request is
                  urgent, please include &quot;URGENT&quot; in the subject line of your email and we will prioritize it
                  accordingly.
                </p>
              </section>

              {/* 8. Changes to This Policy */}
              <section className="space-y-4">
                <h2 className="text-2xl font-bold tracking-tight text-navy-900">
                  8. Changes to This Policy
                </h2>
                <p className="text-navy-600 leading-relaxed">
                  We may update this Refund Policy from time to time. When we do, we will revise the &quot;Last
                  updated&quot; date at the top of this page. Any changes will apply to transactions completed after the
                  updated date. Transactions completed before the update will be governed by the policy in effect at
                  the time of the transaction.
                </p>
                <p className="text-navy-600 leading-relaxed">
                  We encourage you to review this policy periodically. If you have any questions about how a change
                  affects you, please contact us using the details in Section 7.
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
