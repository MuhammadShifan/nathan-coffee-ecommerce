import React from 'react';
import { Helmet } from 'react-helmet-async';

const SEOMeta = ({
  title = 'Nathan Coffee | Pure & Fresh Filter Coffee Powder from Thanjavur',
  description = 'Buy 100% Pure South Indian Filter Coffee Powder Online fromNathan Coffee Mart. Freshly roasted in Thanjavur and Thanjavur. Rich aroma, slow drum roast, available in 250g, 500g, 1kg packs with fast delivery across India.',
  keywords = 'coffee powder,Nathan coffee, nathan coffee,Nathan coffee mart, filter coffee powder, buy filter coffee powder online, Thanjavur coffee powder, thanjavur coffee powder, pure coffee powder, best coffee powder in tamil nadu, degree coffee powder, chicory coffee blend, south indian filter coffee powder',
  canonicalUrl = 'https://Nathancoffee.com',
  ogImage = '/images/hero-coffee.jpg',
  ogType = 'website',
  productData = null,
  breadcrumbs = null,
  includeLocalBusiness = true,
  includeFAQ = false,
}) => {
  const siteUrl = 'https://Nathancoffee.com';
  const fullCanonical = canonicalUrl.startsWith('http') ? canonicalUrl : `${siteUrl}${canonicalUrl}`;
  const fullOgImage = ogImage.startsWith('http') ? ogImage : `${siteUrl}${ogImage}`;

  // Organization & LocalBusiness Schema
  const localBusinessSchema = {
    '@context': 'https://schema.org',
    '@type': 'CoffeeShop',
    '@id': 'https://Nathancoffee.com/#localbusiness',
    name: 'Nathan Coffee Mart',
    alternateName: ['Nathan Coffee', 'Nathan Filter Coffee', 'Nathan Coffee Thanjavur', 'Nathan Coffee Thanjavur'],
    url: siteUrl,
    logo: `${siteUrl}/images/logo.jpeg`,
    image: `${siteUrl}/images/hero-coffee.jpg`,
    description: 'Premier manufacturer and retailer of 100% Pure South Indian Filter Coffee Powder and traditional roasted blends in Thanjavur and Thanjavur.',
    founder: {
      '@type': 'Person',
      name: 'GrandfatherNathan',
      jobTitle: 'Master Coffee Roaster & Founder',
    },
    foundingDate: '1950',
    telephone: '+91-6383805976',
    email: 'info@Nathancoffee.com',
    priceRange: '₹₹',
    currenciesAccepted: 'INR',
    paymentAccepted: 'Cash, Credit Card, Debit Card, UPI, Net Banking, Razorpay',
    address: [
      {
        '@type': 'PostalAddress',
        streetAddress: '2928, South Street, Near Canara Bank',
        addressLocality: 'Thanjavur',
        addressRegion: 'Tamil Nadu',
        postalCode: '613001',
        addressCountry: 'IN',
      },
      {
        '@type': 'PostalAddress',
        streetAddress: 'Nathan Coffee Mart Hub, R.S. Puram / Avinashi Road',
        addressLocality: 'Thanjavur',
        addressRegion: 'Tamil Nadu',
        postalCode: '641002',
        addressCountry: 'IN',
      }
    ],
    geo: {
      '@type': 'GeoCoordinates',
      latitude: '10.7870',
      longitude: '79.1378',
    },
    openingHoursSpecification: [
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
        opens: '09:00',
        closes: '18:00',
      },
    ],
    sameAs: [
      'https://www.facebook.com/Nathancoffee',
      'https://www.instagram.com/Nathancoffee',
      'https://wa.me/916383805976',
    ],
  };

  // BreadcrumbList Schema
  const breadcrumbsSchema = breadcrumbs
    ? {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: breadcrumbs.map((crumb, idx) => ({
        '@type': 'ListItem',
        position: idx + 1,
        name: crumb.name,
        item: crumb.url.startsWith('http') ? crumb.url : `${siteUrl}${crumb.url}`,
      })),
    }
    : null;

  // Product Schema (if on product or shop page)
  const productSchema = productData
    ? {
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: productData.title,
      image: productData.images?.map((img) => (img.url?.startsWith('http') ? img.url : `${siteUrl}${img.url}`)) || [
        `${siteUrl}/images/250g front.png`,
      ],
      description: productData.description || description,
      sku: productData.variants?.[0]?.sku || `NC-${productData.slug || 'COFFEE'}`,
      mpn: productData.fssaiNumber || '22426461000422',
      brand: {
        '@type': 'Brand',
        name: 'Nathan Coffee',
        logo: `${siteUrl}/images/logo.jpeg`,
      },
      offers: {
        '@type': 'AggregateOffer',
        url: `${siteUrl}/shop#${productData.slug || ''}`,
        priceCurrency: 'INR',
        lowPrice: productData.variants?.[0]?.price || 240,
        highPrice: productData.variants?.[productData.variants.length - 1]?.price || 1100,
        offerCount: productData.variants?.length || 3,
        availability: 'https://schema.org/InStock',
        itemCondition: 'https://schema.org/NewCondition',
        seller: {
          '@type': 'Organization',
          name: 'Nathan Coffee Mart',
        },
      },
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: productData.rating || '4.9',
        reviewCount: productData.reviewCount || '248',
        bestRating: '5',
        worstRating: '1',
      },
    }
    : null;

  // FAQ Schema for Search Snippets
  const faqSchema = includeFAQ
    ? {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: [
        {
          '@type': 'Question',
          name: 'What is special aboutNathan Filter Coffee Powder?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Nathan Coffee is slow roasted using traditional drum roasting techniques perfected since 1950 in South Street Thanjavur and Thanjavur. We use 100% selected plantation Arabica and Robusta beans with zero artificial colors, yielding a thick, aromatic golden decoction.',
          },
        },
        {
          '@type': 'Question',
          name: 'How do I brew authentic South Indian Filter Coffee withNathan Coffee Powder?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Add 2-3 tablespoons ofNathan Pure Coffee Powder to the top compartment of a traditional stainless steel or brass filter. Gently press down with the plunger disc, pour freshly boiled water, and let the thick decoction drip for 10-15 minutes. Mix with hot frothy boiled milk and sugar.',
          },
        },
        {
          '@type': 'Question',
          name: 'Do you deliverNathan Coffee powder across India?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Yes! We ship freshly roasted and groundNathan Coffee powder across all states in India with fast courier dispatch from Thanjavur and Thanjavur, offering Free Delivery on orders above ₹500.',
          },
        },
      ],
    }
    : null;

  return (
    <Helmet>
      {/* HTML Meta */}
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <link rel="canonical" href={fullCanonical} />
      <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />

      {/* Open Graph / Facebook */}
      <meta property="og:site_name" content="Nathan Coffee Mart" />
      <meta property="og:type" content={ogType} />
      <meta property="og:url" content={fullCanonical} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={fullOgImage} />
      <meta property="og:locale" content="en_IN" />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={fullCanonical} />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={fullOgImage} />

      {/* JSON-LD Schemas */}
      {includeLocalBusiness && (
        <script type="application/ld+json">{JSON.stringify(localBusinessSchema)}</script>
      )}
      {breadcrumbsSchema && (
        <script type="application/ld+json">{JSON.stringify(breadcrumbsSchema)}</script>
      )}
      {productSchema && (
        <script type="application/ld+json">{JSON.stringify(productSchema)}</script>
      )}
      {faqSchema && (
        <script type="application/ld+json">{JSON.stringify(faqSchema)}</script>
      )}
    </Helmet>
  );
};

export default SEOMeta;
