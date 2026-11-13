import React from 'react';
import { Helmet } from 'react-helmet-async';
import { SEO_CONFIG, SITE_URL, resolveUrl } from '../config/seoConfig';

const SEOMeta = ({
  title = SEO_CONFIG.defaults.title,
  description = SEO_CONFIG.defaults.description,
  keywords = SEO_CONFIG.defaults.keywords,
  canonicalUrl = '/',
  ogImage = SEO_CONFIG.defaults.ogImage,
  ogType = SEO_CONFIG.defaults.ogType,
  productData = null,
  breadcrumbs = null,
  includeLocalBusiness = true,
  includeWebSiteSchema = true,
  includeFAQ = false,
}) => {
  const fullCanonical = resolveUrl(canonicalUrl);
  const fullOgImage = resolveUrl(ogImage);
  const logoUrl = resolveUrl(SEO_CONFIG.business.logoPath);
  const heroImageUrl = resolveUrl(SEO_CONFIG.business.heroImagePath);

  // 1. WebSite Schema (Enables Google Search sitelinks & brand recognition)
  const websiteSchema = includeWebSiteSchema
    ? {
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        '@id': `${SITE_URL}/#website`,
        name: SEO_CONFIG.business.name,
        alternateName: SEO_CONFIG.business.alternateNames,
        url: SITE_URL,
        potentialAction: {
          '@type': 'SearchAction',
          target: `${SITE_URL}/shop?q={search_term_string}`,
          'query-input': 'required name=search_term_string',
        },
      }
    : null;

  // 2. Organization & LocalBusiness Schema (Reusing verified business details)
  const localBusinessSchema = includeLocalBusiness
    ? {
        '@context': 'https://schema.org',
        '@type': 'CoffeeShop',
        '@id': `${SITE_URL}/#localbusiness`,
        name: SEO_CONFIG.business.name,
        alternateName: SEO_CONFIG.business.alternateNames,
        url: SITE_URL,
        logo: logoUrl,
        image: heroImageUrl,
        description: SEO_CONFIG.business.description,
        founder: {
          '@type': 'Person',
          name: SEO_CONFIG.business.founder.name,
          jobTitle: SEO_CONFIG.business.founder.jobTitle,
        },
        foundingDate: SEO_CONFIG.business.foundingDate,
        telephone: SEO_CONFIG.business.telephone,
        email: SEO_CONFIG.business.email,
        priceRange: SEO_CONFIG.business.priceRange,
        currenciesAccepted: SEO_CONFIG.business.currenciesAccepted,
        paymentAccepted: SEO_CONFIG.business.paymentAccepted,
        address: SEO_CONFIG.business.addresses.map((addr) => ({
          '@type': 'PostalAddress',
          streetAddress: addr.streetAddress,
          addressLocality: addr.addressLocality,
          addressRegion: addr.addressRegion,
          postalCode: addr.postalCode,
          addressCountry: addr.addressCountry,
        })),
        geo: {
          '@type': 'GeoCoordinates',
          latitude: SEO_CONFIG.business.addresses[0].geo.latitude,
          longitude: SEO_CONFIG.business.addresses[0].geo.longitude,
        },
        openingHoursSpecification: SEO_CONFIG.business.openingHours.map((hours) => ({
          '@type': 'OpeningHoursSpecification',
          dayOfWeek: hours.dayOfWeek,
          opens: hours.opens,
          closes: hours.closes,
        })),
        sameAs: SEO_CONFIG.business.sameAs,
      }
    : null;

  // 3. BreadcrumbList Schema
  const breadcrumbsSchema = breadcrumbs
    ? {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: breadcrumbs.map((crumb, idx) => ({
          '@type': 'ListItem',
          position: idx + 1,
          name: crumb.name,
          item: resolveUrl(crumb.url),
        })),
      }
    : null;

  // 4. Product Schema (if on product detail page or shop item)
  const productSchema = productData
    ? {
        '@context': 'https://schema.org',
        '@type': 'Product',
        '@id': `${resolveUrl(`/product/${productData.slug || ''}`)}#product`,
        name: productData.title,
        image:
          productData.images && productData.images.length > 0
            ? productData.images.map((img) => resolveUrl(img.url || img))
            : [resolveUrl('/images/250g front.png')],
        description: productData.description || description,
        sku: productData.variants?.[0]?.sku || `NC-${productData.slug || 'COFFEE'}`,
        mpn: productData.fssaiNumber || '22426461000422',
        brand: {
          '@type': 'Brand',
          name: SEO_CONFIG.business.name,
          logo: logoUrl,
        },
        offers: {
          '@type': 'AggregateOffer',
          url: resolveUrl(`/product/${productData.slug || ''}`),
          priceCurrency: 'INR',
          lowPrice:
            productData.variants && productData.variants.length > 0
              ? Math.min(...productData.variants.map((v) => Number(v.price) || 0))
              : 240,
          highPrice:
            productData.variants && productData.variants.length > 0
              ? Math.max(...productData.variants.map((v) => Number(v.price) || 0))
              : 1100,
          offerCount: productData.variants?.length || 1,
          availability: 'https://schema.org/InStock',
          itemCondition: 'https://schema.org/NewCondition',
          seller: {
            '@type': 'Organization',
            name: SEO_CONFIG.business.name,
            url: SITE_URL,
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

  // 5. FAQ Schema for Search Snippets
  const faqSchema = includeFAQ
    ? {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: [
          {
            '@type': 'Question',
            name: 'What is special about Nathan Filter Coffee Powder?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'Nathan Coffee is slow roasted using traditional drum roasting techniques perfected since 1950 in South Street Thanjavur and Thanjavur. We use 100% selected plantation Arabica and Robusta beans with zero artificial colors, yielding a thick, aromatic golden decoction.',
            },
          },
          {
            '@type': 'Question',
            name: 'How do I brew authentic South Indian Filter Coffee with Nathan Coffee Powder?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'Add 2-3 tablespoons of Nathan Pure Coffee Powder to the top compartment of a traditional stainless steel or brass filter. Gently press down with the plunger disc, pour freshly boiled water, and let the thick decoction drip for 10-15 minutes. Mix with hot frothy boiled milk and sugar.',
            },
          },
          {
            '@type': 'Question',
            name: 'Do you deliver Nathan Coffee powder across India?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'Yes! We ship freshly roasted and ground Nathan Coffee powder across all states in India with fast courier dispatch from Thanjavur and Thanjavur, offering Free Delivery on orders above ₹500.',
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
      <meta
        name="robots"
        content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1"
      />

      {/* Open Graph / Facebook */}
      <meta property="og:site_name" content={SEO_CONFIG.business.name} />
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
      {websiteSchema && (
        <script type="application/ld+json">{JSON.stringify(websiteSchema)}</script>
      )}
      {localBusinessSchema && (
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
