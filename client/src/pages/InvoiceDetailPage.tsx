import { useParams, Link } from 'react-router-dom';
import { useStore } from '@/store/useStore';
import { formatCurrency, formatDate } from '@/lib/utils';
import StatusBadge from '@/components/ui/StatusBadge';
import Modal from '@/components/ui/Modal';
import { useState } from 'react';
import { ArrowLeft, CreditCard, FileQuestion } from 'lucide-react';
import { v4 as uuid } from 'uuid';
import { showToast } from '@/components/ui/Toast';
import type { Payment } from '@/types';

export default function InvoiceDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { invoices, payments, addPayment, updateInvoice } = useStore();
  const invoice = invoices.find((i) => i.id === id);
  const invoicePayments = payments.filter((p) => p.invoiceId === id);
  const [showPayment, setShowPayment] = useState(false);
  const [paymentForm, setPaymentForm] = useState({ amount: 0, method: 'bank-transfer' as Payment['method'], reference: '', notes: '' });

  if (!invoice) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 mb-4">
          <FileQuestion className="h-8 w-8 text-gray-400" />
        </div>
        <h2 className="text-lg font-semibold text-gray-900 mb-1">Invoice not found</h2>
        <p className="text-sm text-gray-500 max-w-sm mb-6">
          The invoice you're looking for doesn't exist or may have been deleted.
        </p>
        <Link to="/invoices" className="btn-primary">
          <ArrowLeft className="h-4 w-4 mr-2" /> Back to Invoices
        </Link>
      </div>
    );
  }

  const inv = invoice;
  const balance = inv.total - inv.amountPaid;

  function handlePayment(e: React.FormEvent) {
    e.preventDefault();
    if (paymentForm.amount <= 0 || paymentForm.amount > balance) return;
    addPayment({
      id: uuid(),
      invoiceId: inv.id,
      amount: paymentForm.amount,
      currency: inv.currency,
      method: paymentForm.method,
      reference: paymentForm.reference,
      date: new Date().toISOString(),
      notes: paymentForm.notes,
    });
    showToast('Payment recorded successfully');
    setShowPayment(false);
    setPaymentForm({ amount: 0, method: 'bank-transfer', reference: '', notes: '' });
  }

  function markAsSent() {
    updateInvoice(inv.id, { status: 'sent' });
    showToast('Invoice marked as sent');
  }

  return (
    <div className="space-y-6">
      <Link to="/invoices" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700">
        <ArrowLeft className="h-4 w-4" /> Back to Invoices
      </Link>

      <div className="card p-8 max-w-3xl mx-auto">
        <div className="flex items-start justify-between mb-8">
          <div>
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-500 text-white font-bold mb-3">M</div>
            <h2 className="text-xl font-bold text-gray-900">MODE Digital Creations</h2>
            <p className="text-sm text-gray-500">admin@modedigital.ng</p>
          </div>
          <div className="text-right">
            <h1 className="text-2xl font-bold text-gray-900">INVOICE</h1>
            <p className="text-sm text-gray-500 mt-1">{inv.invoiceNumber}</p>
            <div className="mt-2"><StatusBadge status={inv.status} /></div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-8 mb-8">
          <div>
            <p className="text-xs font-medium text-gray-500 uppercase mb-1">Bill To</p>
            <p className="text-sm font-semibold text-gray-900">{inv.clientName}</p>
            <p className="text-sm text-gray-600">{inv.clientEmail}</p>
          </div>
          <div className="text-right">
            <div className="space-y-1 text-sm">
              <p><span className="text-gray-500">Issue Date: </span><span className="font-medium">{formatDate(inv.issueDate)}</span></p>
              <p><span className="text-gray-500">Due Date: </span><span className="font-medium">{formatDate(inv.dueDate)}</span></p>
            </div>
          </div>
        </div>

        <table className="min-w-full mb-6">
          <thead>
            <tr className="border-b-2 border-gray-200">
              <th className="text-left text-xs font-medium text-gray-500 uppercase pb-2">Description</th>
              <th className="text-right text-xs font-medium text-gray-500 uppercase pb-2">Qty</th>
              <th className="text-right text-xs font-medium text-gray-500 uppercase pb-2">Unit Price</th>
              <th className="text-right text-xs font-medium text-gray-500 uppercase pb-2">Total</th>
            </tr>
          </thead>
          <tbody>
            {inv.items.map((item) => (
              <tr key={item.id} className="border-b border-gray-100">
                <td className="py-3 text-sm text-gray-900">{item.description}</td>
                <td className="py-3 text-sm text-gray-600 text-right">{item.quantity}</td>
                <td className="py-3 text-sm text-gray-600 text-right">{formatCurrency(item.unitPrice, inv.currency)}</td>
                <td className="py-3 text-sm font-medium text-gray-900 text-right">{formatCurrency(item.total, inv.currency)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="flex justify-end mb-8">
          <div className="w-64 space-y-2">
            <div className="flex justify-between text-sm"><span className="text-gray-500">Subtotal</span><span>{formatCurrency(inv.subtotal, inv.currency)}</span></div>
            <div className="flex justify-between text-sm"><span className="text-gray-500">VAT (7.5%)</span><span>{formatCurrency(inv.tax, inv.currency)}</span></div>
            <div className="flex justify-between text-sm font-bold border-t border-gray-200 pt-2"><span>Total</span><span>{formatCurrency(inv.total, inv.currency)}</span></div>
            <div className="flex justify-between text-sm text-green-600"><span>Paid</span><span>{formatCurrency(inv.amountPaid, inv.currency)}</span></div>
            <div className="flex justify-between text-sm font-bold text-brand-600"><span>Balance Due</span><span>{formatCurrency(balance, inv.currency)}</span></div>
          </div>
        </div>

        {inv.notes && (
          <div className="border-t border-gray-200 pt-4 mb-6">
            <p className="text-xs font-medium text-gray-500 mb-1">Notes</p>
            <p className="text-sm text-gray-600">{inv.notes}</p>
          </div>
        )}

        <div className="flex gap-3">
          {inv.status === 'draft' && <button onClick={markAsSent} className="btn-primary">Mark as Sent</button>}
          {balance > 0 && inv.status !== 'draft' && (
            <button onClick={() => { setPaymentForm({ ...paymentForm, amount: balance }); setShowPayment(true); }} className="btn-primary">
              <CreditCard className="h-4 w-4 mr-2" /> Record Payment
            </button>
          )}
        </div>

        {invoicePayments.length > 0 && (
          <div className="mt-6 border-t border-gray-200 pt-4">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Payment History</h3>
            <div className="space-y-2">
              {invoicePayments.map((p) => (
                <div key={p.id} className="flex items-center justify-between text-sm rounded-lg bg-gray-50 px-4 py-2">
                  <div>
                    <span className="font-medium text-gray-900">{formatCurrency(p.amount, p.currency)}</span>
                    <span className="text-gray-500 ml-2 capitalize">{p.method.replace(/-/g, ' ')}</span>
                    {p.reference && <span className="text-gray-400 ml-2">Ref: {p.reference}</span>}
                  </div>
                  <span className="text-gray-500">{formatDate(p.date)}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <Modal isOpen={showPayment} onClose={() => setShowPayment(false)} title="Record Payment">
        <form onSubmit={handlePayment} className="space-y-4">
          <div><label className="label">Amount *</label><input required type="number" step="0.01" max={balance} className="input" value={paymentForm.amount} onChange={(e) => setPaymentForm({ ...paymentForm, amount: Number(e.target.value) })} /></div>
          <div>
            <label className="label">Payment Method</label>
            <select className="input" value={paymentForm.method} onChange={(e) => setPaymentForm({ ...paymentForm, method: e.target.value as Payment['method'] })}>
              <option value="bank-transfer">Bank Transfer</option>
              <option value="card">Card</option>
              <option value="cash">Cash</option>
              <option value="paystack">Paystack</option>
              <option value="flutterwave">Flutterwave</option>
            </select>
          </div>
          <div><label className="label">Reference</label><input className="input" value={paymentForm.reference} onChange={(e) => setPaymentForm({ ...paymentForm, reference: e.target.value })} /></div>
          <div><label className="label">Notes</label><textarea className="input" rows={2} value={paymentForm.notes} onChange={(e) => setPaymentForm({ ...paymentForm, notes: e.target.value })} /></div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setShowPayment(false)} className="btn-secondary">Cancel</button>
            <button type="submit" className="btn-primary">Record Payment</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
