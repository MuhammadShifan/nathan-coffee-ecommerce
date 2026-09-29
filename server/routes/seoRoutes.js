import express from 'express';
import Product from '../models/Product.js';
import { defaultProductsData } from './productRoutes.js';

const router = express.Router();

// Dynamic sitemap.xml generator
router.get('/sitemap.xml', async (req, res) => {
  try {
    const baseUrl = process.env.SITE_URL || 'https://Nathancoffee.com';
    let products = await Product.find({}, 'slug updatedAt');

    if (!products || products.length === 0) {
      products = defaultProductsData;
    }

    const staticPages = [
      { url: '/', changefreq: 'daily', priority: '1.0' },
      { url: '/shop', changefreq: 'daily', priority: '0.9' },
      { url: '/about', changefreq: 'weekly', priority: '0.8' },
      { url: '/contact', changefreq: 'monthly', priority: '0.8' },
      { url: '/checkout', changefreq: 'monthly', priority: '0.5' },
    ];

    let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
`;

    staticPages.forEach((page) => {
      xml += `  <url>
    <loc>${baseUrl}${page.url}</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>
`;
    });

    products.forEach((prod) => {
      xml += `  <url>
    <loc>${baseUrl}/shop#${prod.slug}</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.95</priority>
  </url>
`;
    });

    xml += `</urlset>`;

    res.header('Content-Type', 'application/xml');
    res.send(xml);
  } catch (error) {
    res.status(500).send('Error generating sitemap');
  }
});

// Dynamic robots.txt
router.get('/robots.txt', (req, res) => {
  const baseUrl = process.env.SITE_URL || 'https://Nathancoffee.com';
  const robotsTxt = `User-agent: *
Allow: /
Disallow: /admin/
Disallow: /api/admin/

Sitemap: ${baseUrl}/sitemap.xml
`;
  res.header('Content-Type', 'text/plain');
  res.send(robotsTxt);
});

export default router;
