export function JsonLd() {
  const organizationSchema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'GMBCLEANER',
    url: 'https://gmbcleaner.online',
    logo: 'https://gmbcleaner.online/og-image.svg',
    description: 'Professional Google Maps review removal and dispute service. Remove fake, spam, and policy-violating reviews.',
    email: 'support@gmbcleaner.online',
    sameAs: [],
  };

  const websiteSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'GMBCLEANER',
    url: 'https://gmbcleaner.online',
    potentialAction: {
      '@type': 'SearchAction',
      target: 'https://gmbcleaner.online/blog?q={search_term_string}',
      'query-input': 'required name=search_term_string',
    },
  };

  const serviceSchema = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    serviceType: 'Google Maps Review Removal',
    provider: {
      '@type': 'Organization',
      name: 'GMBCLEANER',
    },
    areaServed: 'Worldwide',
    description: 'Professional Google Maps negative review removal service. We help businesses identify, report, and request removal of fake, spam, and policy-violating reviews through official platform channels.',
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: 'Review Dispute Services',
      itemListElement: [
        {
          '@type': 'Offer',
          itemOffered: {
            '@type': 'Service',
            name: 'Google Maps Negative Review Removal',
            description: 'Dispute and request removal of negative, fake, or policy-violating Google Maps reviews.',
          },
        },
        {
          '@type': 'Offer',
          itemOffered: {
            '@type': 'Service',
            name: 'Review Reputation Management',
            description: 'Professional management and protection of your Google Maps business reputation.',
          },
        },
      ],
    },
  };

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'How does GMBCLEANER remove negative Google Maps reviews?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'We identify reviews that violate Google Maps policies, prepare dispute requests, and submit them through Google\'s official channels. We do not remove reviews ourselves — only Google can make that decision.',
        },
      },
      {
        '@type': 'Question',
        name: 'How much does the service cost?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'GMBCLEANER uses a pay-per-order model. You fund your wallet with cryptocurrency and pay a flat fee per dispute submission. No subscriptions or hidden fees.',
        },
      },
      {
        '@type': 'Question',
        name: 'Is there a refund if the review is not removed?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'No. All sales are final. If a review is not removed by Google, the funds used for that order will not be restored to your wallet. You are paying for the dispute service, not guaranteed removal.',
        },
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
    </>
  );
}
