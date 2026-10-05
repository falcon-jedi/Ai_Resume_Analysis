'use client';
import { IconMapper } from '@/app/_components/icons/IconMapper';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getInvoicesClient } from '@/app/api/client/payments/payments-client';

interface Invoice {
  id: string;
  invoiceNumber: string;
  subtotal: number;
  taxAmount: number;
  total: number;
  currency: string;
  status: string;
  pdfUrl: string | null;
  razorpayPaymentId: string | null;
  createdAt: string;
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, { bg: string; text: string; label: string }> = {
    paid: { bg: '#d4edda', text: '#155724', label: 'Paid' },
    pending: { bg: '#fff3cd', text: '#856404', label: 'Pending' },
    failed: { bg: '#f8d7da', text: '#721c24', label: 'Failed' },
  };
  const s = styles[status.toLowerCase()] ?? { bg: '#e2e3e5', text: '#383d41', label: status };
  return (
    <span
      className="px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wide"
      style={{ background: s.bg, color: s.text }}
    >
      {s.label}
    </span>
  );
}

function formatCurrency(amount: number, currency: string) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: currency || 'INR',
    minimumFractionDigits: 0,
  }).format(amount);
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function BillingClient() {
  const router = useRouter();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  useEffect(() => {
    async function fetchInvoices() {
      try {
        const res = await getInvoicesClient();
        if (res.success) setInvoices(res.invoices || []);
      } catch (err) {
        console.error('Failed to fetch invoices:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchInvoices();
  }, []);

  const handleDownload = async (invoice: Invoice) => {
    if (!invoice.pdfUrl) {
      alert('PDF is still being generated. Please check back in a moment.');
      return;
    }
    setDownloadingId(invoice.id);
    try {
      const res = await fetch(invoice.pdfUrl);
      if (!res.ok) {
        if (res.status === 202) {
          alert('PDF is still being generated. Please check back in a moment.');
          return;
        }
        throw new Error('Download failed');
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `invoice-${invoice.invoiceNumber}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Download failed:', err);
      alert('Failed to download invoice. Please try again.');
    } finally {
      setDownloadingId(null);
    }
  };

  return (
    <div className="w-full" style={{ fontFamily: 'Hanken Grotesk, sans-serif' }}>
      {/* Header */}
      <header className="mb-8 flex items-center justify-between border-b border-[#ddc0bd] pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <button
              onClick={() => router.back()}
              className="text-[#564240] hover:text-[#5b060c] transition-colors mr-1"
              aria-label="Go back"
            >
              <IconMapper name="arrow_back" className="text-[20px]" />
            </button>
            <h1
              className="text-[28px] lg:text-[32px] font-semibold text-[#5b060c]"
              style={{ fontFamily: 'Playfair Display, serif' }}
            >
              Billing & Invoices
            </h1>
            <IconMapper name="receipt_long" className="text-[#8a716f] text-xl" />
          </div>
          <p className="text-[14px] lg:text-[16px] text-[#564240]">
            View and download your payment receipts.
          </p>
        </div>

        <button
          onClick={() => router.push('/app/settings?section=subscription')}
          className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-lg text-[13px] font-semibold border border-[#ddc0bd] text-[#564240] hover:bg-[#ffe9e4] transition-colors cursor-pointer"
        >
          <IconMapper name="workspace_premium" className="text-[16px]" />
          Manage Subscription
        </button>
      </header>

      {/* Content */}
      {loading ? (
        /* Skeleton */
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="animate-pulse rounded-xl h-16"
              style={{ background: '#FFF8EE', border: '1px solid #E5D9C8' }}
            />
          ))}
        </div>
      ) : invoices.length === 0 ? (
        /* Empty state */
        <div
          className="rounded-2xl p-16 flex flex-col items-center text-center"
          style={{ background: '#FFF8EE', border: '1px solid #E5D9C8' }}
        >
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center mb-4"
            style={{ background: '#fff0ed', border: '1px solid #ddc0bd' }}
          >
            <IconMapper name="receipt_long" className="text-[#5b060c]" style={{ fontSize: 28 }} />
          </div>
          <h2
            className="text-[20px] font-semibold text-[#5b060c] mb-2"
            style={{ fontFamily: 'Playfair Display, serif' }}
          >
            No Invoices Yet
          </h2>
          <p className="text-[14px] text-[#564240] mb-6 max-w-sm">
            Your invoice history will appear here after your first successful payment.
          </p>
          <button
            onClick={() => router.push('/app/subscription')}
            className="px-6 py-2.5 rounded-lg text-[14px] font-semibold text-white cursor-pointer hover:opacity-90 transition-opacity"
            style={{ background: '#5b060c' }}
          >
            Upgrade Plan
          </button>
        </div>
      ) : (
        /* Invoice table */
        <div
          className="rounded-2xl overflow-hidden"
          style={{ background: '#FFF8EE', border: '1px solid #E5D9C8' }}
        >
          {/* Table header */}
          <div
            className="grid grid-cols-12 gap-4 px-6 py-3 text-[11px] font-bold uppercase tracking-widest text-[#564240] border-b border-[#E5D9C8]"
            style={{ background: '#f5ece0' }}
          >
            <span className="col-span-3">Invoice #</span>
            <span className="col-span-3">Date</span>
            <span className="col-span-2">Amount</span>
            <span className="col-span-2">Status</span>
            <span className="col-span-2 text-right">Receipt</span>
          </div>

          {/* Invoice rows */}
          <div className="divide-y divide-[#E5D9C8]">
            {invoices.map((invoice) => (
              <div
                key={invoice.id}
                className="grid grid-cols-12 gap-4 items-center px-6 py-4 hover:bg-[#fff0ed] transition-colors"
              >
                {/* Invoice number */}
                <div className="col-span-3">
                  <p className="text-[14px] font-semibold text-[#2b1611]">
                    {invoice.invoiceNumber}
                  </p>
                  {invoice.razorpayPaymentId && (
                    <p className="text-[11px] text-[#8a716f] mt-0.5 truncate">
                      {invoice.razorpayPaymentId}
                    </p>
                  )}
                </div>

                {/* Date */}
                <div className="col-span-3">
                  <p className="text-[14px] text-[#564240]">{formatDate(invoice.createdAt)}</p>
                </div>

                {/* Amount */}
                <div className="col-span-2">
                  <p className="text-[14px] font-semibold text-[#2b1611]">
                    {formatCurrency(invoice.total, invoice.currency)}
                  </p>
                </div>

                {/* Status badge */}
                <div className="col-span-2">
                  <StatusBadge status={invoice.status} />
                </div>

                {/* Download button */}
                <div className="col-span-2 flex justify-end">
                  {invoice.pdfUrl ? (
                    <button
                      onClick={() => handleDownload(invoice)}
                      disabled={downloadingId === invoice.id}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-semibold text-white cursor-pointer hover:opacity-90 transition-opacity disabled:opacity-60"
                      style={{ background: '#5b060c' }}
                    >
                      {downloadingId === invoice.id ? (
                        <>
                          <IconMapper
                            name="progress_activity"
                            className="text-[14px] animate-spin"
                          />
                          Downloading...
                        </>
                      ) : (
                        <>
                          <IconMapper name="download" className="text-[14px]" />
                          PDF
                        </>
                      )}
                    </button>
                  ) : (
                    <span
                      className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-[12px] font-semibold text-[#8a716f] border border-[#ddc0bd]"
                      title="PDF is being generated…"
                    >
                      <IconMapper name="hourglass_empty" className="text-[14px]" />
                      Pending
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Footer note */}
      {invoices.length > 0 && (
        <p className="text-[12px] text-[#8a716f] mt-4 text-center">
          All invoices are securely stored. For billing disputes, contact{' '}
          <a href="mailto:billing@jobpatra.in" className="text-[#5b060c] hover:underline">
            billing@jobpatra.in
          </a>
        </p>
      )}
    </div>
  );
}
