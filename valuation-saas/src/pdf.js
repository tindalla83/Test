'use strict';

const PDFDocument = require('pdfkit');

const INK = '#16202E';
const MUTED = '#5A6675';
const ACCENT = '#226A6A';
const LINE = '#D7DEE6';
const CONF = { high: '#2E7D5B', medium: '#9A7016', low: '#A4503A' };

function gbp(v) {
  if (typeof v !== 'number' || !isFinite(v)) return '—';
  return '£' + Math.round(v).toLocaleString('en-GB');
}

// Stream a branded valuation report PDF to `res`.
// opts: { company, project, valuation } where valuation = { location, createdAt,
// marketOverview, results, model }
function streamReport(res, { company, project, valuation }) {
  const doc = new PDFDocument({ size: 'A4', margin: 50, info: { Title: `${project.name} — Valuation`, Author: company.name } });
  doc.pipe(res);

  const pageW = doc.page.width - doc.page.margins.left - doc.page.margins.right;
  const left = doc.page.margins.left;

  // Brand header
  doc.rect(left, 44, pageW, 4).fill(ACCENT);
  doc.fillColor(INK).font('Helvetica-Bold').fontSize(18).text(company.name || 'Valuation report', left, 60);
  doc.fillColor(MUTED).font('Helvetica').fontSize(10).text('House type valuation report', { continued: false });
  doc.moveDown(0.8);

  // Title block
  doc.fillColor(INK).font('Helvetica-Bold').fontSize(15).text(project.name);
  doc.fillColor(MUTED).font('Helvetica').fontSize(10.5);
  doc.text(`Location: ${valuation.location || project.location}`);
  const date = new Date(valuation.createdAt || Date.now()).toLocaleString('en-GB', {
    day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit',
  });
  doc.text(`Generated: ${date}`);
  doc.moveDown(0.8);

  // Market overview
  if (valuation.marketOverview) {
    doc.fillColor(ACCENT).font('Helvetica-Bold').fontSize(9).text('AREA MARKET OVERVIEW', { characterSpacing: 1 });
    doc.moveDown(0.2);
    doc.fillColor(INK).font('Helvetica').fontSize(10.5).text(valuation.marketOverview, { align: 'left' });
    doc.moveDown(0.9);
  }

  // Results
  (valuation.results || []).forEach((r, i) => {
    ensureSpace(doc, 150);
    const y0 = doc.y;
    doc.moveTo(left, y0).lineTo(left + pageW, y0).lineWidth(1).strokeColor(LINE).stroke();
    doc.moveDown(0.5);

    doc.fillColor(INK).font('Helvetica-Bold').fontSize(12.5).text(r.name || `House type ${i + 1}`, { continued: true });
    const conf = CONF[r.confidence] || CONF.medium;
    doc.font('Helvetica-Bold').fontSize(9).fillColor(conf).text(`   ${(r.confidence || 'medium').toUpperCase()} CONFIDENCE`);

    doc.moveDown(0.3);
    doc.fillColor(INK).font('Helvetica-Bold').fontSize(20).text(gbp(r.predictedPrice));
    const rng = r.priceRange || {};
    const bits = [];
    if (typeof rng.low === 'number' && typeof rng.high === 'number') bits.push(`Range ${gbp(rng.low)} – ${gbp(rng.high)}`);
    if (typeof r.pricePerSqft === 'number') bits.push(`${gbp(r.pricePerSqft)} / sqft`);
    if (bits.length) doc.fillColor(MUTED).font('Helvetica').fontSize(10).text(bits.join('   ·   '));

    if (r.summary) {
      doc.moveDown(0.3);
      doc.fillColor(INK).font('Helvetica').fontSize(10).text(r.summary);
    }

    const comps = Array.isArray(r.comparables) ? r.comparables : [];
    if (comps.length) {
      doc.moveDown(0.3);
      doc.fillColor(MUTED).font('Helvetica-Bold').fontSize(8.5).text('COMPARABLES', { characterSpacing: 0.5 });
      comps.forEach((c) => {
        const price = typeof c.price === 'number' ? gbp(c.price) : '';
        const src = c.source ? ` (${c.source})` : '';
        doc.fillColor(INK).font('Helvetica').fontSize(9.5).text(`• ${c.description || ''} — ${price}${src}`);
      });
    }
    doc.moveDown(0.8);
  });

  // Footer disclaimer
  ensureSpace(doc, 60);
  doc.moveDown(0.5);
  doc.moveTo(left, doc.y).lineTo(left + pageW, doc.y).lineWidth(1).strokeColor(LINE).stroke();
  doc.moveDown(0.4);
  doc.fillColor(MUTED).font('Helvetica-Oblique').fontSize(8).text(
    'These figures are AI-generated indicative estimates based on live web research at the time of generation. ' +
      'They are not a formal RICS valuation and should be verified against current market evidence before use in a ' +
      'viability appraisal or transaction.'
  );

  doc.end();
}

function ensureSpace(doc, needed) {
  const bottom = doc.page.height - doc.page.margins.bottom;
  if (doc.y + needed > bottom) doc.addPage();
}

module.exports = { streamReport };
