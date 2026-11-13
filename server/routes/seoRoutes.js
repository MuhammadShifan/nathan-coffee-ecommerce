import express from 'express';
import Product from '../models/Product.js';
import { defaultProductsData } from './productRoutes.js';
import { SITE_URL, resolveUrl, SEO_CONFIG } from '../config/seoConfig.js';

const router = express.Router();

// Dynamic sitemap.xml generator
router.get('/sitemap.xml', async (req, res) => {
  try {
    let products = await Product.find({}, 'slug updatedAt');

    if (!products || products.length === 0) {
      products = defaultProductsData;
    }

    const todayDate = new Date().toISOString().split('T')[0];

    let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
`;

    // Static core pages
    SEO_CONFIG.staticPages.forEach((page) => {
      xml += `  <url>
    <loc>${resolveUrl(page.url)}</loc>
    <lastmod>${todayDate}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>
`;
    });

    // Dynamic individual product detail pages
    products.forEach((prod) => {
      if (prod.slug) {
        xml += `  <url>
    <loc>${resolveUrl(`/product/${prod.slug}`)}</loc>
    <lastmod>${todayDate}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.95</priority>
  </url>
`;
      }
    });

    xml += `</urlset>`;

    res.header('Content-Type', 'application/xml');
    res.header('Cache-Control', 'public, max-age=3600');
    res.send(xml);
  } catch (error) {
    console.error('Error generating sitemap.xml:', error);
    res.status(500).send('Error generating sitemap');
  }
});

// Dynamic robots.txt
router.get('/robots.txt', (req, res) => {
  try {
    const disallowRules = SEO_CONFIG.robots.disallow
      .map((path) => `Disallow: ${path}`)
      .join('\n');

    const allowRules = SEO_CONFIG.robots.allow
      .map((path) => `Allow: ${path}`)
      .join('\n');

    const robotsTxt = `# robots.txt for Nathan Coffee
User-agent: *
${allowRules}
${disallowRules}

# Dynamic Sitemap Reference
Sitemap: ${resolveUrl('/sitemap.xml')}
`;

    res.header('Content-Type', 'text/plain');
    res.header('Cache-Control', 'public, max-age=86400');
    res.send(robotsTxt);
  } catch (error) {
    console.error('Error generating robots.txt:', error);
    res.status(500).send('User-agent: *\nAllow: /\n');
  }
});

export default router;
