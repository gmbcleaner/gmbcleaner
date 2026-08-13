import type { Metadata } from 'next';
import { Navbar } from '@/components/shared/navbar';
import { Footer } from '@/components/shared/footer';
import { PageHeader } from '@/components/shared/sections';

export const metadata: Metadata = {
  title: 'Refund Policy',
  description:
    'Read the GMBCLEANER Refund Policy. All sales are final. No refunds on deposits, orders, or crypto payments. If a review is not removed, balance is not restored.',
  keywords: ['GMBCLEANER refund', 'refund policy', 'no refund', 'crypto payment refund', 'wallet deposit refund'],
  openGraph: {
    title: 'Refund Policy | GMBCLEANER',
    description: 'All sales are final. No refunds on deposits, orders, or crypto payments.',
    url: 'https://gmbcleaner.online/refund',
    siteName: 'GMBCLEANER',
    images: [{ url: 'https://gmbcleaner.online/og-image.png', width: 1200, height: 630 }],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Refund Policy | GMBCLEANER',
    description: 'All sales are final. No refunds on deposits, orders, or crypto payments.',
    images: ['https://gmbcleaner.online/og-image.png'],
  },
  alternates: {
    canonical: 'https://gmbcleaner.online/refund',
  },
};

export default function RefundPage() {
  return (
    <>
      <Navbar />
      <main>
        <PageHeader
          eyebrow="Legal"
          title="Refund Policy"
          description="All sales are final. Please read this policy carefully before funding your wallet or placing an order."
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
                  support@gmbcleaner.online before making a payment.
                </p>
                <p className="mt-4 text-sm font-medium text-navy-900">
                  Last updated: August 10, 2026
                </p>
              </div>

              {/* CRITICAL: NO REFUND POLICY BANNER */}
              <div className="rounded-2xl border-2 border-red-300 bg-red-50 p-6">
                <h2 className="text-lg font-bold tracking-tight text-red-700 uppercase">
                  Strict No Refund Policy
                </h2>
                <div className="mt-3 space-y-2">
                  <p className="text-sm font-bold text-red-800 leading-relaxed">
                    ALL SALES ARE FINAL. NO EXCEPTIONS.
                  </p>
                  <ul className="space-y-1.5 text-sm font-semibold text-red-800 leading-relaxed pl-5 list-disc marker:text-red-500">
                    <li>No refunds on wallet deposits — once funded, your balance is non-refundable.</li>
                    <li>No refunds on orders — once an order is placed and the fee is deducted, it is non-refundable.</li>
                    <li>Crypto payments are final and irreversible — we cannot reverse any confirmed blockchain transaction.</li>
                    <li>If a review is NOT removed by the platform, your balance is NOT restored — you pay for the dispute service, not for guaranteed removal.</li>
                  </ul>
                </div>
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
                <p className="text-navy-800 leading-relaxed font-semibold">
                  Wallet funding is final. Once you deposit funds, no refund will be issued. Deposited funds may
                  only be used toward orders on the platform.
                </p>
              </section>

              {/* 2. All Sales Are Final */}
              <section className="space-y-4">
                <h2 className="text-2xl font-bold tracking-tight text-red-700">
                  2. All Sales Are Final
                </h2>
                <div className="rounded-2xl border border-red-200 bg-red-50 p-6 space-y-4">
                  <p className="text-navy-800 leading-relaxed font-semibold">
                    GMBCLEANER maintains a strict no-refund policy. The following payments are non-refundable:
                  </p>

                  <h3 className="text-lg font-bold text-navy-900 pt-2">2.1 Deposits Are Non-Refundable</h3>
                  <p className="text-navy-800 leading-relaxed">
                    All wallet deposits are final. Once you fund your wallet with cryptocurrency and the transaction
                    is confirmed on the blockchain, the deposit is non-refundable. You may use the deposited balance
                    toward orders on the platform, but you may not claim a refund of the deposited amount.
                  </p>

                  <h3 className="text-lg font-bold text-navy-900 pt-2">2.2 Orders Are Non-Refundable</h3>
                  <p className="text-navy-800 leading-relaxed">
                    Once an order is placed and the fee is deducted from your wallet, the fee is non-refundable. This
                    applies regardless of the outcome of the dispute. We are paid for the work of preparing and
                    submitting the dispute request — not for the platform&apos;s decision.
                  </p>

                  <h3 className="text-lg font-bold text-navy-900 pt-2">2.3 Unfavorable Outcomes Do Not Restore Balance</h3>
                  <p className="text-navy-800 leading-relaxed">
                    If a review is NOT removed by the host platform, the funds used for that order will NOT be added
                    back to your wallet balance. The decision to remove a review rests entirely with the host
                    platform and is outside our control. You acknowledge that you are paying for the dispute service
                    itself — not for guaranteed removal.
                  </p>

                  <h3 className="text-lg font-bold text-navy-900 pt-2">2.4 Crypto Payments Are Irreversible</h3>
                  <p className="text-navy-800 leading-relaxed">
                    All cryptocurrency transactions are final and irreversible. Once a transaction is confirmed on
                    the blockchain, it cannot be reversed, cancelled, or refunded by GMBCLEANER. We do not control
                    the blockchain and have no ability to undo confirmed transactions.
                  </p>
                </div>
              </section>

              {/* 3. Exceptions */}
              <section className="space-y-4">
                <h2 className="text-2xl font-bold tracking-tight text-navy-900">
                  3. Limited Exceptions
                </h2>
                <p className="text-navy-600 leading-relaxed">
                  The only situations in which a credit or adjustment may be considered are:
                </p>
                <ul className="space-y-2.5 text-navy-600 leading-relaxed pl-6 list-disc marker:text-teal-500">
                  <li>
                    <span className="font-medium text-navy-900">Service not rendered:</span> If you have paid for an
                    order and we have not submitted a dispute request to the relevant platform, a credit may be
                    applied to your wallet. This does not constitute a refund — it is an internal credit only.
                  </li>
                  <li>
                    <span className="font-medium text-navy-900">Declined dispute:</span> If, during our internal
                    review, we determine that a flagged review does not appear to violate any platform policy and we
                    decline to submit a dispute request, the order fee will be credited back to your wallet balance.
                    You may use this credit for other orders.
                  </li>
                  <li>
                    <span className="font-medium text-navy-900">Duplicate payment:</span> If a technical error
                    results in a duplicate charge, we will credit the duplicate amount to your wallet. This is an
                    internal credit, not a refund to your original payment method.
                  </li>
                </ul>
                <p className="text-navy-600 leading-relaxed">
                  These exceptions do not entitle you to a refund of funds to your original payment method. All
                  credits remain within your GMBCLEANER wallet and are subject to the same no-refund policy.
                </p>
              </section>

              {/* 4. No Refunds for Platform Decisions */}
              <section className="space-y-4">
                <h2 className="text-2xl font-bold tracking-tight text-navy-900">
                  4. No Refunds Based on Platform Decisions
                </h2>
                <p className="text-navy-600 leading-relaxed">
                  GMBCLEANER does not guarantee that any review will be removed. The decision to remove a review
                  rests entirely with the host platform. We do not offer refunds, credits, or reversals based on:
                </p>
                <ul className="space-y-2.5 text-navy-600 leading-relaxed pl-6 list-disc marker:text-teal-500">
                  <li>A platform&apos;s decision to keep a review live.</li>
                  <li>A platform&apos;s rejection of a dispute request.</li>
                  <li>Delays in platform review processes.</li>
                  <li>Any outcome that is not removal of the review.</li>
                </ul>
                <p className="text-navy-600 leading-relaxed">
                  You expressly acknowledge that the Service is a best-efforts dispute submission service and that
                  payment is for the preparation and submission of the dispute — not for any particular result.
                </p>
              </section>

              {/* 5. How to Contact Support */}
              <section className="space-y-4">
                <h2 className="text-2xl font-bold tracking-tight text-navy-900">
                  5. Contact Support for Billing Disputes
                </h2>
                <p className="text-navy-600 leading-relaxed">
                  If you have a billing dispute or believe you were charged in error, please contact our support
                  team. We will review your inquiry and respond within two (2) business days.
                </p>
                <p className="text-navy-600 leading-relaxed">
                  To help us resolve your inquiry quickly, please provide:
                </p>
                <ol className="space-y-2.5 text-navy-600 leading-relaxed pl-6 list-decimal marker:text-teal-500 marker:font-semibold">
                  <li>Your account email address.</li>
                  <li>The order number or transaction hash.</li>
                  <li>A description of the billing issue.</li>
                  <li>Any supporting documentation (screenshots, transaction confirmations, etc.).</li>
                </ol>
                <div className="rounded-2xl border border-slate-200 bg-white p-6">
                  <p className="text-navy-900 font-semibold">GMBCLEANER Support</p>
                  <p className="mt-2 text-navy-600">Email: support@gmbcleaner.online</p>
                  <p className="text-navy-600">Website: https://gmbcleaner.online</p>
                  <p className="text-navy-600">Hours: Monday–Friday, 9:00 AM – 6:00 PM (Eastern Time)</p>
                </div>
              </section>

              {/* 6. Changes to This Policy */}
              <section className="space-y-4">
                <h2 className="text-2xl font-bold tracking-tight text-navy-900">
                  6. Changes to This Policy
                </h2>
                <p className="text-navy-600 leading-relaxed">
                  We may update this Refund Policy from time to time. When we do, we will revise the &quot;Last
                  updated&quot; date at the top of this page. Any changes will apply to transactions completed after the
                  updated date. Transactions completed before the update will be governed by the policy in effect at
                  the time of the transaction.
                </p>
                <p className="text-navy-600 leading-relaxed">
                  We encourage you to review this policy periodically. If you have any questions about how a change
                  affects you, please contact us using the details in Section 5.
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
