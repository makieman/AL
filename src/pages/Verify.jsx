import { useState } from 'react';
import { useConnection } from '@solana/wallet-adapter-react';
import UrgencyBadge from '../components/UrgencyBadge';
import StatusBadge from '../components/StatusBadge';
import Spinner from '../components/Spinner';
import { useToast } from '../components/Toast';
import { getReferral } from '../lib/solana';
import { getReferrals } from '../lib/storage';

const MOCK_REFERRALS = {
  'AFL-REF-001': {
    referralId: 'AFL-REF-001',
    doctorWallet: 'Dtvs7mD3mQz5KfD9J9mQxC6gK2X7mD3bq8TjQ7mD3mQz',
    patientWallet: 'AFL-2045',
    fromFacility: 'Nairobi West Hospital',
    toFacility: 'Aga Khan Hospital',
    toFacilityWallet: 'HN7cABqLq46Es1jh92dQQisAi5YqpGj1RRdbzmH2dgHY',
    notes: 'Chronic cough and night sweats. Needs specialist review.',
    urgency: 'medium',
    timestamp: new Date('2026-05-10T05:45:00Z').getTime(),
    status: 'pending',
    app: 'afyalink',
  },
};

function truncate(addr) {
  if (!addr || addr.length < 10) return addr || '';
  return `${addr.slice(0, 4)}...${addr.slice(-4)}`;
}

function formatTimestamp(ts) {
  return new Date(ts).toLocaleDateString('en-KE', {
    year: 'numeric', month: 'long', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

export default function Verify() {
  const { connection } = useConnection();
  const { addToast } = useToast();

  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null); // { valid: boolean, referral?: Referral, paymentStatus?: string, paymentTx?: string, isMock?: boolean }

  const handleVerify = async () => {
    const sig = input.trim();
    if (!sig) {
      addToast('Paste a referral ID first', 'error');
      return;
    }

    setLoading(true);
    setResult(null);

    const mock = MOCK_REFERRALS[sig];
    if (mock) {
      setResult({
        valid: true,
        referral: mock,
        paymentStatus: mock.status,
        paymentTx: mock.paymentTx,
        isMock: true,
      });
      addToast('Referral verified (demo)', 'success');
      setLoading(false);
      return;
    }

    try {
      const referral = await getReferral(connection, sig);

      if (!referral || referral.app !== 'afyalink') {
        setResult({ valid: false });
        addToast('Invalid referral — not found on Solana', 'error');
      } else {
        // Check localStorage for payment status
        const stored = getReferrals();
        const local = stored.find(r => r.referralId === sig);
        const paymentStatus = local?.status || referral.status || 'pending';
        const paymentTx = local?.paymentTx || referral.paymentTx;

        setResult({ valid: true, referral: { ...referral, status: paymentStatus, paymentTx }, paymentStatus, paymentTx });
        addToast('Referral verified on Solana ✓', 'success');
      }
    } catch (err) {
      console.error('Verify error:', err);
      setResult({ valid: false });
      addToast('Verification failed — check the referral ID', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto px-4 pb-24 pt-4">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Verify Referral</h1>
        <p className="text-sm text-gray-500">Confirm referral authenticity on Solana</p>
      </div>

      {/* No wallet needed notice */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl px-4 py-2.5 mb-6 flex items-center gap-2">
        <svg className="w-4 h-4 text-blue-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z" />
        </svg>
        <span className="text-xs text-blue-800">No wallet required — anyone can verify referrals</span>
      </div>

      {/* Input */}
      <div className="space-y-3">
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Enter referral ID"
          className="w-full px-4 py-3.5 rounded-xl border border-gray-300 text-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition font-mono"
        />
        <button
          onClick={handleVerify}
          disabled={loading || !input.trim()}
          className="w-full py-3.5 rounded-xl bg-teal-700 hover:bg-teal-800 text-white font-semibold text-sm transition-colors disabled:opacity-50 min-h-[48px] flex items-center justify-center gap-2"
        >
          {loading ? <><Spinner size="w-4 h-4" /> Verifying...</> : 'Verify'}
        </button>
      </div>

      {/* Invalid result */}
      {result && !result.valid && (
        <div className="mt-6 bg-red-50 border border-red-200 rounded-2xl p-5 text-center">
          <svg className="w-10 h-10 text-red-500 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
          </svg>
          <h3 className="text-lg font-semibold text-red-800">Invalid Referral — not found on Solana</h3>
        </div>
      )}

      {/* Valid result */}
      {result && result.valid && result.referral && (
        <div className="mt-6 bg-emerald-50 border border-emerald-200 rounded-2xl overflow-hidden">
          {/* Valid header */}
          <div className="px-5 py-4 bg-emerald-100/60 flex items-center gap-3">
            <svg className="w-8 h-8 text-emerald-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" />
            </svg>
            <div>
              <h3 className="text-lg font-bold text-emerald-800">Valid Referral</h3>
              <p className="text-xs text-emerald-600">Verified on Solana blockchain</p>
            </div>
          </div>

          {/* Details */}
          <div className="px-5 py-4 space-y-3">
            {/* Facilities */}
            <div>
              <span className="text-xs text-gray-500 uppercase tracking-wider font-medium">Facilities</span>
              <div className="flex items-center gap-2 mt-1 text-sm font-semibold text-gray-800">
                <span>{result.referral.fromFacility}</span>
                <svg className="w-4 h-4 text-teal-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                </svg>
                <span>{result.referral.toFacility}</span>
              </div>
            </div>

            {/* Notes */}
            <div>
              <span className="text-xs text-gray-500 uppercase tracking-wider font-medium">Notes</span>
              <p className="text-sm text-gray-700 mt-1">{result.referral.notes}</p>
            </div>

            {/* Badges */}
            <div className="flex items-center gap-2">
              <UrgencyBadge urgency={result.referral.urgency} />
              <StatusBadge status={result.paymentStatus || 'pending'} />
              {result.isMock ? (
                <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wide bg-amber-100 text-amber-800">Verified (demo)</span>
              ) : (
                <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wide bg-emerald-100 text-emerald-800">Verified on Solana</span>
              )}
            </div>

            {/* Doctor */}
            <div>
              <span className="text-xs text-gray-500 uppercase tracking-wider font-medium">Referring Doctor</span>
              <p className="text-sm font-mono text-gray-700 mt-0.5">{truncate(result.referral.doctorWallet)}</p>
            </div>

            {/* Timestamp */}
            <div>
              <span className="text-xs text-gray-500 uppercase tracking-wider font-medium">Created</span>
              <p className="text-sm text-gray-700 mt-0.5">{formatTimestamp(result.referral.timestamp)}</p>
            </div>

            {/* Payment */}
            {result.paymentTx && (
              <div>
                <span className="text-xs text-gray-500 uppercase tracking-wider font-medium">Payment</span>
                <a
                  href={`https://explorer.solana.com/tx/${result.paymentTx}?cluster=devnet`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block text-sm text-emerald-600 hover:underline mt-0.5"
                >
                  View payment transaction →
                </a>
              </div>
            )}

            {/* Explorer link */}
            <a
              href={`https://explorer.solana.com/tx/${result.referral.referralId || input.trim()}?cluster=devnet`}
              target="_blank"
              rel="noopener noreferrer"
              className="block text-sm text-indigo-600 hover:underline pt-2 border-t border-emerald-200"
            >
              View referral on Solana Explorer →
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
