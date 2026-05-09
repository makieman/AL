import { useState, useEffect, useCallback } from 'react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { useWallet } from '@solana/wallet-adapter-react';
import UrgencyBadge from '../components/UrgencyBadge';
import StatusBadge from '../components/StatusBadge';
import { useToast } from '../components/Toast';
import { getReferrals, updateReferral } from '../lib/storage';

function truncate(addr) {
  if (!addr || addr.length < 10) return addr || '';
  return `${addr.slice(0, 4)}...${addr.slice(-4)}`;
}

function formatTimestamp(ts) {
  return new Date(ts).toLocaleDateString('en-KE', {
    month: 'short', day: 'numeric', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

export default function Hospital() {
  const { publicKey } = useWallet();
  const { addToast } = useToast();
  const [hospitalWallet, setHospitalWallet] = useState('');
  const [referrals, setReferrals] = useState([]);
  const [stats, setStats] = useState({ total: 0, paid: 0, pending: 0, totalRevenue: 0 });

  const loadReferrals = useCallback(() => {
    const wallet = hospitalWallet.trim() || publicKey?.toBase58();
    if (!wallet) return;

    const all = getReferrals();
    const incoming = all.filter(r => r.toFacilityWallet === wallet);
    setReferrals(incoming.sort((a, b) => b.timestamp - a.timestamp));

    const paid = incoming.filter(r => r.status === 'paid').length;
    const pending = incoming.filter(r => r.status === 'pending').length;
    const totalRevenue = paid * 0.1;

    setStats({
      total: incoming.length,
      paid,
      pending,
      totalRevenue: totalRevenue.toFixed(2),
    });
  }, [hospitalWallet, publicKey]);

  useEffect(() => {
    loadReferrals();
  }, [loadReferrals]);

  const handleMarkPaid = (referralId) => {
    updateReferral(referralId, { status: 'paid' });
    loadReferrals();
    addToast('Referral marked as paid', 'success');
  };

  const handleCopyId = async (id) => {
    try {
      await navigator.clipboard.writeText(id);
      addToast('Referral ID copied', 'success');
    } catch {
      addToast('Failed to copy', 'error');
    }
  };

  const wallet = hospitalWallet.trim() || publicKey?.toBase58();
  const isConfigured = !!wallet;

  return (
    <div className="max-w-4xl mx-auto px-4 pb-24 pt-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Hospital Dashboard</h1>
          <p className="text-sm text-gray-500">Manage incoming referrals and payments</p>
        </div>
        <WalletMultiButton />
      </div>

      {/* Wallet input */}
      <div className="mb-6 space-y-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Hospital Wallet Address</label>
          <input
            value={hospitalWallet}
            onChange={e => setHospitalWallet(e.target.value)}
            placeholder="Enter hospital wallet or connect your wallet above"
            className="w-full px-4 py-3 rounded-xl border border-gray-300 text-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition font-mono"
          />
          {publicKey && (
            <button
              onClick={() => setHospitalWallet(publicKey.toBase58())}
              className="mt-2 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-teal-50 text-teal-700 text-xs font-medium hover:bg-teal-100 transition"
            >
              Use connected wallet
            </button>
          )}
        </div>
      </div>

      {!isConfigured && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
          <p className="text-sm text-amber-800 font-medium">Enter your hospital wallet address above to view referrals</p>
        </div>
      )}

      {isConfigured && (
        <>
          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <p className="text-xs text-gray-500 uppercase font-medium mb-1">Total Referrals</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <p className="text-xs text-gray-500 uppercase font-medium mb-1">Paid</p>
              <p className="text-2xl font-bold text-emerald-600">{stats.paid}</p>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <p className="text-xs text-gray-500 uppercase font-medium mb-1">Pending</p>
              <p className="text-2xl font-bold text-amber-600">{stats.pending}</p>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <p className="text-xs text-gray-500 uppercase font-medium mb-1">Revenue (SOL)</p>
              <p className="text-2xl font-bold text-teal-600">{stats.totalRevenue}</p>
            </div>
          </div>

          {/* Referrals table */}
          {referrals.length === 0 ? (
            <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
              <svg className="w-12 h-12 text-gray-300 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 0 0 2.25-2.25V6.75A2.25 2.25 0 0 0 18 4.5h-2.25m0 0H9m0 0H7.5A2.25 2.25 0 0 0 5.25 6.75v11.5A2.25 2.25 0 0 0 7.5 20.25h9.75A2.25 2.25 0 0 0 19.5 18V7.5" />
              </svg>
              <h3 className="text-lg font-semibold text-gray-700 mb-1">No referrals yet</h3>
              <p className="text-sm text-gray-500">Referrals from doctors will appear here</p>
            </div>
          ) : (
            <div className="space-y-3">
              {referrals.map(ref => (
                <div key={ref.referralId} className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:border-gray-300 transition">
                  {/* Header */}
                  <div className="px-4 py-3 border-b border-gray-100 bg-gray-50/60">
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <div className="flex items-center gap-2">
                        <div>
                          <p className="text-sm font-semibold text-gray-900">{ref.fromFacility}</p>
                          <p className="text-xs text-gray-500 font-mono">{truncate(ref.patientWallet)}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <UrgencyBadge urgency={ref.urgency} />
                        <StatusBadge status={ref.status} />
                      </div>
                    </div>
                  </div>

                  {/* Body */}
                  <div className="px-4 py-3 space-y-3">
                    {/* Notes */}
                    <div>
                      <p className="text-xs text-gray-500 font-medium uppercase">Clinical Notes</p>
                      <p className="text-sm text-gray-700 mt-1">{ref.notes}</p>
                    </div>

                    {/* Details grid */}
                    <div className="grid grid-cols-2 gap-3 pt-2 border-t border-gray-100">
                      <div>
                        <p className="text-xs text-gray-500 font-medium uppercase">Referring Doctor</p>
                        <p className="text-xs font-mono text-gray-700 mt-0.5">{truncate(ref.doctorWallet)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 font-medium uppercase">Created</p>
                        <p className="text-xs text-gray-700 mt-0.5">{formatTimestamp(ref.timestamp)}</p>
                      </div>
                    </div>

                    {/* Referral ID and links */}
                    <div className="flex items-center gap-2 pt-2 border-t border-gray-100">
                      <span className="text-xs text-gray-500 font-mono">ID: {truncate(ref.referralId)}</span>
                      <button
                        onClick={() => handleCopyId(ref.referralId)}
                        className="text-xs text-teal-600 hover:text-teal-800 font-medium"
                      >
                        Copy
                      </button>
                      <a
                        href={`https://explorer.solana.com/tx/${ref.referralId}?cluster=devnet`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-indigo-600 hover:underline"
                      >
                        View Referral →
                      </a>
                    </div>

                    {/* Payment section */}
                    <div className="pt-2 border-t border-gray-100 space-y-2">
                      {ref.status === 'paid' && ref.paymentTx ? (
                        <div>
                          <p className="text-xs text-gray-500 font-medium uppercase mb-1">Payment Received</p>
                          <a
                            href={`https://explorer.solana.com/tx/${ref.paymentTx}?cluster=devnet`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block text-xs text-emerald-600 hover:underline break-all"
                          >
                            View Payment Transaction →
                          </a>
                        </div>
                      ) : ref.status === 'pending' ? (
                        <div>
                          <p className="text-xs text-gray-500 font-medium uppercase mb-2">Payment Pending</p>
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleMarkPaid(ref.referralId)}
                              className="flex-1 px-3 py-2 rounded-lg bg-emerald-50 text-emerald-700 text-xs font-medium hover:bg-emerald-100 transition"
                            >
                              Mark as Paid
                            </button>
                            <span className="text-xs text-gray-500 py-2">0.1 SOL</span>
                          </div>
                        </div>
                      ) : null}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
