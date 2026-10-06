import { useState } from 'react';
import Modal from './Modal';
import { showToast } from './Toast';
import { api, ApiError } from '@/lib/api';
import { X } from 'lucide-react';

interface Candidate {
  id: string;
  name: string;
  phone: string;
}

interface BroadcastResult {
  phone: string;
  success: boolean;
  status?: number;
  error?: string;
}

export default function WhatsAppBroadcastModal({ isOpen, onClose, candidates }: { isOpen: boolean; onClose: () => void; candidates: Candidate[] }) {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [manualNumber, setManualNumber] = useState('');
  const [manualNumbers, setManualNumbers] = useState<string[]>([]);
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [results, setResults] = useState<BroadcastResult[] | null>(null);

  const withPhones = candidates.filter((c) => c.phone);

  function toggle(id: string) {
    const next = new Set(selected);
    if (next.has(id)) next.delete(id); else next.add(id);
    setSelected(next);
  }

  function addManualNumber() {
    const trimmed = manualNumber.trim();
    if (trimmed && !manualNumbers.includes(trimmed)) {
      setManualNumbers([...manualNumbers, trimmed]);
      setManualNumber('');
    }
  }

  async function handleSend() {
    const phoneNumbers = [
      ...withPhones.filter((c) => selected.has(c.id)).map((c) => c.phone),
      ...manualNumbers,
    ];
    if (phoneNumbers.length === 0 || !message.trim()) return;
    setSending(true);
    setResults(null);
    try {
      const res = await api.post<{ results: BroadcastResult[]; sent: number; failed: number }>('/whatsapp/broadcast', { phoneNumbers, message: message.trim() });
      setResults(res.results);
      showToast(`Broadcast sent: ${res.sent} succeeded, ${res.failed} failed`, res.failed > 0 ? 'error' : 'success');
    } catch (err) {
      showToast(err instanceof ApiError ? err.message : 'Failed to send broadcast', 'error');
    } finally {
      setSending(false);
    }
  }

  function handleClose() {
    setSelected(new Set());
    setManualNumbers([]);
    setManualNumber('');
    setMessage('');
    setResults(null);
    onClose();
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="WhatsApp Broadcast" size="lg">
      <div className="space-y-4">
        <div>
          <label className="label">Recipients with a phone number</label>
          <div className="max-h-40 overflow-y-auto rounded-lg border border-gray-200 p-2 space-y-1">
            {withPhones.length === 0 ? (
              <p className="text-sm text-gray-400 px-2 py-1">None of the current records have a phone number.</p>
            ) : (
              withPhones.map((c) => (
                <label key={c.id} className="flex items-center gap-2 px-2 py-1 rounded hover:bg-gray-50 cursor-pointer">
                  <input type="checkbox" checked={selected.has(c.id)} onChange={() => toggle(c.id)} />
                  <span className="text-sm text-gray-700">{c.name}</span>
                  <span className="text-xs text-gray-400">{c.phone}</span>
                </label>
              ))
            )}
          </div>
        </div>

        <div>
          <label className="label">Or add a number manually</label>
          <div className="flex gap-2">
            <input className="input flex-1" placeholder="+234..." value={manualNumber} onChange={(e) => setManualNumber(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addManualNumber())} />
            <button type="button" onClick={addManualNumber} className="btn-secondary">Add</button>
          </div>
          {manualNumbers.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {manualNumbers.map((n) => (
                <span key={n} className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-700">
                  {n}
                  <button type="button" onClick={() => setManualNumbers(manualNumbers.filter((x) => x !== n))} className="text-gray-400 hover:text-gray-600"><X className="h-3 w-3" /></button>
                </span>
              ))}
            </div>
          )}
        </div>

        <div>
          <label className="label">Message *</label>
          <textarea className="input" rows={3} value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Type your broadcast message..." />
        </div>

        {results && (
          <div className="max-h-32 overflow-y-auto rounded-lg border border-gray-200 p-2 text-xs space-y-1">
            {results.map((r) => (
              <p key={r.phone} className={r.success ? 'text-green-600' : 'text-red-600'}>
                {r.phone}: {r.success ? 'sent' : (r.error || `failed (${r.status})`)}
              </p>
            ))}
          </div>
        )}

        <div className="flex justify-end gap-3 pt-2">
          <button type="button" onClick={handleClose} className="btn-secondary">Close</button>
          <button
            type="button"
            onClick={handleSend}
            disabled={sending || !message.trim() || (selected.size === 0 && manualNumbers.length === 0)}
            className="btn-primary"
          >
            {sending ? 'Sending...' : 'Send Broadcast'}
          </button>
        </div>
      </div>
    </Modal>
  );
}
