import { useState, useEffect, useCallback } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import ReferralCard from '../components/ReferralCard';
import { useToast } from '../components/Toast';
import { getReferrals } from '../lib/storage';
import { reseedDemoData } from '../lib/demo';

export default function Patient() {
  const { publicKey, connected } = useWallet();
  const { addToast } = useToast();
  const [referrals, setReferrals] = useState([]);

  const loadReferrals = useCallback(() => {
    if (!publicKey) return;
    const all = getReferrals();
    const mine = all.filter(r => r.patientWallet === publicKey.toBase58());
    setReferrals(mine.sort((a, b) => b.timestamp - a.timestamp));
  }, [publicKey]);

  useEffect(() => {
    loadReferrals();
  }, [loadReferrals]);

  const handleLoadDemo = () => {
    if (!publicKey) return;
    const count = reseedDemoData(publicKey.toBase58());
    loadReferrals();
    addToast(`${count} demo referrals loaded for your wallet`, 'success');
  };

  return (
    <div className="max-w-lg mx-auto px-4 pb-24 pt-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Referrals</h1>
          <p className="text-sm text-gray-500">View and manage your referrals</p>
        </div>
        <WalletMultiButton />
      </div>

      {/* Not connected */}
      {!connected && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a2.25 2.25 0 0 0-2.25-2.25H15a3 3 0 1 1-6 0H5.25A2.25 2.25 0 0 0 3 12m18 0v6a2.25 2.25 0 0 1-2.25 2.25H5.25A2.25 2.25 0 0 1 3 18v-6m18 0V9M3 12V9m18 0a2.25 2.25 0 0 0-2.25-2.25H5.25A2.25 2.25 0 0 0 3 9m18 0V6a2.25 2.25 0 0 0-2.25-2.25H5.25A2.25 2.25 0 0 0 3 6v3" />
            </svg>
          </div>
          <h2 className="text-lg font-semibold text-gray-700 mb-1">Connect Wallet</h2>
          <p className="text-sm text-gray-500">Connect your wallet to view your referrals</p>
        </div>
      )}

      {/* Connected — empty state */}
      {connected && referrals.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-16 h-16 bg-teal-50 rounded-full flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-teal-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
            </svg>
          </div>
          <h2 className="text-lg font-semibold text-gray-700 mb-1">No referrals found. Ask your doctor to create one.</h2>
          <button
            onClick={handleLoadDemo}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gray-900 hover:bg-gray-800 text-white text-sm font-medium transition-colors min-h-[48px]"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
            </svg>
            Load Demo Referrals for My Wallet
          </button>
        </div>
      )}

      {/* Referral cards */}
      {connected && referrals.length > 0 && (
        <div className="space-y-4">
          {referrals.map(ref => (
            <ReferralCard
              key={ref.referralId}
              referral={ref}
              onUpdate={loadReferrals}
            />
          ))}
        </div>
      )}
    </div>
  );
}
