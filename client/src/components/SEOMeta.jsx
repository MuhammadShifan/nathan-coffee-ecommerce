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
  includeLocalBusiness = false,
  includeWebSiteSchema = false,
  includeOrganization = false,
  includeFAQ = false,
  noIndex = false,
}) => {
  const isHomePage =
    canonicalUrl === '/' ||
    canonicalUrl === '' ||
    canonicalUrl === SITE_URL ||
    canonicalUrl === `${SITE_URL}/`;

  const fullCanonical = resolveUrl(canonicalUrl);
  const fullOgImage = resolveUrl(ogImage);
  const logoUrl = 'https://www.nathancoffeethanjavur.com/Nlogo.jpg';
  const heroImageUrl = resolveUrl(SEO_CONFIG.business.heroImagePath);

  const shouldIncludeWebSite = isHomePage
    ? includeWebSiteSchema !== false
    : Boolean(includeWebSiteSchema);

  const shouldIncludeOrg = isHomePage
    ? includeOrganization !== false
    : Boolean(includeOrganization);

  const shouldIncludeLocalBusiness = isHomePage
    ? includeLocalBusiness !== false
    : Boolean(includeLocalBusiness);

  const websiteSchema = shouldIncludeWebSite
    ? {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      '@id': 'https://www.nathancoffeethanjavur.com/#website',
      name: 'Nathan Coffee Thanjavur',
      alternateName: ['Nathan Coffee', 'Nathan Filter Coffee', 'Nathan Coffee Thanjavur'],
      url: 'https://www.nathancoffeethanjavur.com',
      potentialAction: {
        '@type': 'SearchAction',
        target: 'https://www.nathancoffeethanjavur.com/shop?q={search_term_string}',
        'query-input': 'required name=search_term_string',
      },
    }
    : null;

  const organizationSchema = shouldIncludeOrg
    ? {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      '@id': 'https://www.nathancoffeethanjavur.com/#organization',
      name: 'Nathan Coffee Thanjavur',
      alternateName: [
        'Nathan Coffee',
        'Nathan Filter Coffee',
        'Nathan Coffee Thanjavur',
      ],
      url: 'https://www.nathancoffeethanjavur.com',
      logo: 'https://www.nathancoffeethanjavur.com/Nlogo.jpg',
      image: heroImageUrl,
      description: SEO_CONFIG.business.description,
      telephone: SEO_CONFIG.business.telephone,
      email: SEO_CONFIG.business.email,
      priceRange: SEO_CONFIG.business.priceRange,
      address: {
        '@type': 'PostalAddress',
        streetAddress: SEO_CONFIG.business.addresses[0].streetAddress,
        addressLocality: SEO_CONFIG.business.addresses[0].addressLocality,
        addressRegion: SEO_CONFIG.business.addresses[0].addressRegion,
        postalCode: SEO_CONFIG.business.addresses[0].postalCode,
        addressCountry: SEO_CONFIG.business.addresses[0].addressCountry,
      },
      sameAs: SEO_CONFIG.business.sameAs,
      contactPoint: {
        '@type': 'ContactPoint',
        telephone: SEO_CONFIG.business.telephone,
        contactType: 'customer service',
        areaServed: 'IN',
        availableLanguage: ['English', 'Tamil'],
      },
    }
    : null;

  const localBusinessSchema = shouldIncludeLocalBusiness
    ? {
      '@context': 'https://schema.org',
      '@type': 'CoffeeShop',
      '@id': 'https://www.nathancoffeethanjavur.com/#localbusiness',
      name: 'Nathan Coffee Thanjavur',
      alternateName: SEO_CONFIG.business.alternateNames,
      url: 'https://www.nathancoffeethanjavur.com',
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

  const breadcrumbsSchema =
    breadcrumbs && Array.isArray(breadcrumbs) && breadcrumbs.length > 0
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

  let productSchema = null;
  if (productData) {
    const prodName = productData.name || productData.title || title;
    const prodDescription =
      productData.description ||
      productData.shortDescription ||
      description;
    const prodSlug = productData.slug || '';
    const prodUrl = resolveUrl(
      productData.url || (prodSlug ? `/product/${prodSlug}` : canonicalUrl)
    );

    let prodImages = [];
    if (Array.isArray(productData.images) && productData.images.length > 0) {
      prodImages = productData.images
        .map((img) =>
          resolveUrl(typeof img === 'object' && img?.url ? img.url : img)
        )
        .filter(Boolean);
    } else if (productData.image) {
      const single =
        typeof productData.image === 'object' && productData.image?.url
          ? productData.image.url
          : productData.image;
      prodImages = [resolveUrl(single)];
    } else {
      prodImages = [resolveUrl('/images/250g front.png')];
    }

    const priceNum =
      productData.price != null
        ? Number(productData.price)
        : productData.variants?.length > 0
          ? Number(productData.variants[0].price)
          : 240;

    const inStock =
      productData.availability === 'https://schema.org/InStock' ||
      (productData.inStock !== false &&
        productData.availability !== 'https://schema.org/OutOfStock');

    const availability = inStock
      ? 'https://schema.org/InStock'
      : 'https://schema.org/OutOfStock';

    const brandName =
      typeof productData.brand === 'string'
        ? productData.brand
        : productData.brand?.name || 'Nathan Coffee';

    productSchema = {
      '@context': 'https://schema.org',
      '@type': 'Product',
      '@id': `${prodUrl}#product`,
      name: prodName,
      image: prodImages,
      description: prodDescription,
      sku:
        productData.sku ||
        `NC-${(prodSlug || prodName || 'COFFEE')
          .toUpperCase()
          .replace(/[^A-Z0-9]/g, '')}`,
      mpn: productData.mpn || productData.fssaiNumber || '22426461000422',
      brand: {
        '@type': 'Brand',
        name: brandName,
      },
      offers: {
        '@type': 'Offer',
        url: prodUrl,
        priceCurrency: 'INR',
        price: Number(priceNum) || 240,
        priceValidUntil: '2027-12-31',
        availability: availability,
        itemCondition: 'https://schema.org/NewCondition',
        seller: {
          '@type': 'Organization',
          name: 'Nathan Coffee Thanjavur',
          url: 'https://www.nathancoffeethanjavur.com',
        },
      },
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: String(productData.rating || '4.9'),
        reviewCount: String(productData.reviewCount || '248'),
        bestRating: '5',
        worstRating: '1',
      },
    };
  }

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
            text: 'Nathan Coffee is slow roasted using traditional drum roasting techniques perfected since 1950 in South Street Thanjavur. We use 100% selected plantation Arabica and Robusta beans with zero artificial colors, yielding a thick, aromatic golden decoction.',
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
            text: 'Yes! We ship freshly roasted and ground Nathan Coffee powder across all states in India with fast courier dispatch from Thanjavur.',
          },
        },
      ],
    }
    : null;

  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <link rel="canonical" href={fullCanonical} />
      <meta
        name="robots"
        content={
          noIndex
            ? 'noindex, nofollow'
            : 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1'
        }
      />

      <meta property="og:site_name" content="Nathan Coffee Thanjavur" />
      <meta property="og:type" content={ogType} />
      <meta property="og:url" content={fullCanonical} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={fullOgImage} />
      <meta property="og:locale" content="en_IN" />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={fullCanonical} />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={fullOgImage} />

      {organizationSchema && (
        <script type="application/ld+json">{JSON.stringify(organizationSchema)}</script>
      )}
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
