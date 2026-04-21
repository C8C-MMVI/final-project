// src/hooks/useReceiptDownload.js
// Professional cellphone repair receipt PDF — thermal receipt aesthetic
// Usage: const { downloadReceipt, downloadAllReceipts } = useReceiptDownload(shopInfo)

import { useCallback } from 'react';

function loadJsPDF() {
  return new Promise((resolve, reject) => {
    if (window.jspdf) { resolve(window.jspdf.jsPDF); return; }
    const script   = document.createElement('script');
    script.src     = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
    script.onload  = () => resolve(window.jspdf.jsPDF);
    script.onerror = () => reject(new Error('Failed to load jsPDF'));
    document.head.appendChild(script);
  });
}

// Page dimensions — 80mm wide (standard thermal receipt width)
const PAGE_W   = 80;
const PAD      = 8;
const L        = PAD;
const R        = PAGE_W - PAD;
const MID      = PAGE_W / 2;
const COL_DESC = L;
const COL_QTY  = 52;
const COL_AMT  = R;

const fmtDate = (d) => {
  if (!d) return '---';
  return new Date(d).toLocaleDateString('en-PH', { month: 'long', day: 'numeric', year: 'numeric' });
};

const fmtAmtShort = (n) =>
  'PHP ' + Number(n ?? 0).toFixed(2);

function dashedLine(doc, y) {
  doc.setDrawColor(180, 180, 180);
  doc.setLineWidth(0.2);
  doc.setLineDashPattern([1.5, 1.5], 0);
  doc.line(L, y, R, y);
  doc.setLineDashPattern([], 0);
}

function solidLine(doc, y) {
  doc.setDrawColor(26, 188, 156);
  doc.setLineWidth(0.4);
  doc.line(L, y, R, y);
}

// ── Draw one receipt ──────────────────────────────────────────────────────────
function drawReceipt(doc, sale, shopInfo) {
  const TOP_PAD = 14;
  let y = 0;

  // ── Dark header ───────────────────────────────────────────────────────────
  const HEADER_H = 50;
  doc.setFillColor(10, 22, 44);
  doc.rect(0, 0, PAGE_W, HEADER_H, 'F');

  // Shop name — large & bold, centered
  doc.setFont('courier', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(255, 255, 255);
  const shopName = (sale.shopName ?? shopInfo?.name ?? 'TechnoLogs Repair').substring(0, 26);
  doc.text(shopName, MID, TOP_PAD + 8, { align: 'center' });

  // Thin teal divider under shop name
  doc.setDrawColor(26, 188, 156);
  doc.setLineWidth(0.3);
  doc.line(L + 6, TOP_PAD + 13, R - 6, TOP_PAD + 13);

  // "OFFICIAL RECEIPT" — spaced-out label
  doc.setFont('courier', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(26, 188, 156);
  doc.text('O F F I C I A L   R E C E I P T', MID, TOP_PAD + 22, { align: 'center' });

  // Optional phone/address
  if (shopInfo?.phone || shopInfo?.address) {
    const sub = (shopInfo.phone || shopInfo.address || '').substring(0, 32);
    doc.setFont('courier', 'normal');
    doc.setFontSize(6);
    doc.setTextColor(80, 110, 105);
    doc.text(sub, MID, TOP_PAD + 31, { align: 'center' });
  }

  y = HEADER_H + 4;

  // ── Receipt meta ──────────────────────────────────────────────────────────
  doc.setFont('courier', 'normal');
  doc.setFontSize(6.5);
  doc.setTextColor(140, 140, 140);
  doc.text('RECEIPT NO.', L, y);
  doc.text('DATE', R, y, { align: 'right' });
  y += 4;

  doc.setFont('courier', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(30, 30, 30);
  doc.text(`SALE-${String(sale.saleId).padStart(4, '0')}`, L, y);
  doc.text(fmtDate(sale.soldAt), R, y, { align: 'right' });
  y += 6;

  doc.setFont('courier', 'normal');
  doc.setFontSize(6.5);
  doc.setTextColor(140, 140, 140);
  doc.text('REPAIR JOB', L, y);
  doc.text('PAYMENT', R, y, { align: 'right' });
  y += 4;

  doc.setFont('courier', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(30, 30, 30);
  doc.text(`#${sale.requestId}`, L, y);
  doc.text(sale.paymentMethod ?? '---', R, y, { align: 'right' });
  y += 6;

  // ── Customer & Device ─────────────────────────────────────────────────────
  if (sale.customerName || sale.deviceType) {
    doc.setFont('courier', 'normal');
    doc.setFontSize(6.5);
    doc.setTextColor(140, 140, 140);
    if (sale.customerName) doc.text('CUSTOMER', L, y);
    if (sale.deviceType)   doc.text('DEVICE', R, y, { align: 'right' });
    y += 4;

    doc.setFont('courier', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(30, 30, 30);
    if (sale.customerName) doc.text(sale.customerName.substring(0, 18), L, y);
    if (sale.deviceType)   doc.text(sale.deviceType.substring(0, 14), R, y, { align: 'right' });
    y += 6;
  }

  // ── Technician ────────────────────────────────────────────────────────────
  doc.setFont('courier', 'normal');
  doc.setFontSize(6.5);
  doc.setTextColor(140, 140, 140);
  doc.text('TECHNICIAN', L, y);
  y += 4;

  doc.setFont('courier', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(30, 30, 30);
  doc.text((sale.technicianName ?? '---').substring(0, 26), L, y);
  y += 6;

  y += 2;
  dashedLine(doc, y);
  y += 6;

  // ── Items table header ────────────────────────────────────────────────────
  doc.setFont('courier', 'normal');
  doc.setFontSize(6.5);
  doc.setTextColor(140, 140, 140);
  doc.text('ITEM', COL_DESC, y);
  doc.text('QTY', COL_QTY, y, { align: 'right' });
  doc.text('AMOUNT', COL_AMT, y, { align: 'right' });
  y += 3.5;

  dashedLine(doc, y);
  y += 5;

  // ── Line items ────────────────────────────────────────────────────────────
  const items = sale.items ?? [];

  if (items.length === 0) {
    doc.setFont('courier', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(30, 30, 30);
    doc.text('Repair Service', COL_DESC, y);
    doc.setFont('courier', 'normal');
    doc.text('1', COL_QTY, y, { align: 'right' });
    doc.text(fmtAmtShort(sale.amount), COL_AMT, y, { align: 'right' });
    y += 6;
  } else {
    items.forEach(item => {
      const desc    = item.description ?? item.desc ?? 'Service';
      const trimmed = desc.length > 22 ? desc.slice(0, 20) + '..' : desc;
      const qty     = Number(item.quantity ?? 1);
      const unitP   = Number(item.unitPrice ?? item.unit_price ?? 0);
      const sub     = Number(item.subtotal ?? (qty * unitP));

      doc.setFont('courier', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(30, 30, 30);
      doc.text(trimmed, COL_DESC, y);

      doc.setFont('courier', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(80, 80, 80);
      doc.text(String(qty), COL_QTY, y, { align: 'right' });

      doc.setTextColor(30, 30, 30);
      doc.text(fmtAmtShort(sub), COL_AMT, y, { align: 'right' });
      y += 5;

      if (qty > 1) {
        doc.setFontSize(6.5);
        doc.setTextColor(150, 150, 150);
        doc.text(`  @ PHP ${unitP.toFixed(2)} each`, COL_DESC, y);
        y += 4;
      }
    });
  }

  y += 2;
  dashedLine(doc, y);
  y += 5;

  // ── Subtotal ──────────────────────────────────────────────────────────────
  if (items.length > 0) {
    const subtotal = items.reduce((s, i) => {
      const qty  = Number(i.quantity ?? 1);
      const unit = Number(i.unitPrice ?? i.unit_price ?? 0);
      return s + Number(i.subtotal ?? (qty * unit));
    }, 0);

    doc.setFont('courier', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(100, 100, 100);
    doc.text('Subtotal', L, y);
    doc.text(fmtAmtShort(subtotal), R, y, { align: 'right' });
    y += 5;
  }

  // ── Total bar ─────────────────────────────────────────────────────────────
  y += 2;
  const BAR_H = 12;
  doc.setFillColor(10, 22, 44);
  doc.roundedRect(L - 2, y - 3, R - L + 4, BAR_H, 1.5, 1.5, 'F');

  doc.setFont('courier', 'bold');
  doc.setFontSize(7);
  doc.setTextColor(26, 188, 156);
  doc.text('TOTAL', L + 2, y + 4);

  doc.setFontSize(9.5);
  doc.setTextColor(255, 255, 255);
  doc.text(fmtAmtShort(sale.amount), R - 2, y + 4.5, { align: 'right' });
  y += BAR_H + 5;

  // ── Teal accent line ──────────────────────────────────────────────────────
  solidLine(doc, y);
  y += 6;

  // ── Footer ────────────────────────────────────────────────────────────────
  doc.setFont('courier', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(100, 100, 100);
  doc.text('Thank you for trusting us', MID, y, { align: 'center' });
  y += 4.5;
  doc.text('with your device!', MID, y, { align: 'center' });
  y += 5;

  doc.setFontSize(6.5);
  doc.setTextColor(140, 140, 140);
  doc.text('Warranty: 7 days on parts and labor.', MID, y, { align: 'center' });
  y += 4.5;
  doc.text('Bring this receipt upon return.', MID, y, { align: 'center' });
  y += 6;

  dashedLine(doc, y);
  y += 5;

  doc.setFontSize(6.5);
  doc.setTextColor(160, 160, 160);
  doc.text((sale.shopName ?? shopInfo?.name ?? 'TechnoLogs Repair').toUpperCase(), MID, y, { align: 'center' });
  y += 4.5;

  const now = new Date().toLocaleString('en-PH', { dateStyle: 'medium', timeStyle: 'short' });
  doc.setFontSize(6);
  doc.setTextColor(190, 190, 190);
  doc.text(`Generated: ${now}`, MID, y, { align: 'center' });

  return y + 10;
}

// ── Hook ──────────────────────────────────────────────────────────────────────
export function useReceiptDownload(shopInfo = {}) {

  const downloadReceipt = useCallback(async (sale) => {
    try {
      const JsPDF    = await loadJsPDF();
      const doc      = new JsPDF({ unit: 'mm', format: [PAGE_W, 200], orientation: 'portrait' });
      const contentH = drawReceipt(doc, sale, shopInfo);
      doc.internal.pageSize.height = Math.max(contentH, 100);
      doc.save(`receipt_SALE-${String(sale.saleId).padStart(4, '0')}.pdf`);
    } catch (err) {
      console.error('Receipt error:', err);
      alert('Could not generate receipt. Please try again.');
    }
  }, [shopInfo]);

  const downloadAllReceipts = useCallback(async (sales) => {
    if (!sales || sales.length === 0) return;
    try {
      const JsPDF = await loadJsPDF();
      const doc   = new JsPDF({ unit: 'mm', format: [PAGE_W, 200], orientation: 'portrait' });
      sales.forEach((sale, idx) => {
        if (idx > 0) doc.addPage([PAGE_W, 200]);
        drawReceipt(doc, sale, shopInfo);
      });
      const today = new Date().toISOString().slice(0, 10);
      doc.save(`${(shopInfo?.name ?? 'technologs').replace(/\s+/g, '_')}_receipts_${today}.pdf`);
    } catch (err) {
      console.error('Receipt error:', err);
      alert('Could not generate receipts. Please try again.');
    }
  }, [shopInfo]);

  return { downloadReceipt, downloadAllReceipts };
}