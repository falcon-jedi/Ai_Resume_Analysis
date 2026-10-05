/**
 * PDF Service — converts HTML to PDF using Puppeteer.
 *
 * Puppeteer is heavy and launches a headless Chromium process.
 * It must be used in a Node.js environment (Next.js Route Handler, not Edge Runtime).
 *
 * Usage:
 *   import { generatePdf } from '@/app/service/resume/pdf.service';
 *   const buffer = await generatePdf(html);
 *   // stream or upload buffer
 */
import type { ResumePdfResponse } from '@/app/api/model/response/resume';

export type { ResumePdfResponse };

export async function generatePdf(html: string): Promise<Buffer> {
  // Dynamic import keeps Puppeteer out of the main bundle
  const puppeteer = await import('puppeteer');
  const browser = await puppeteer.default.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
  });

  try {
    const page = await browser.newPage();

    await page.setContent(html, { waitUntil: 'load' });

    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: {
        top: '10mm',
        right: '10mm',
        bottom: '10mm',
        left: '10mm',
      },
    });

    return Buffer.from(pdfBuffer);
  } finally {
    await browser.close();
  }
}
