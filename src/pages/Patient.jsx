import { useState, useEffect, useCallback } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { QRCodeSVG } from 'qrcode.react';
import ReferralCard from '../components/ReferralCard';
import { useToast } from '../components/Toast';
import { generatePatientId, getPatientByWallet, getReferrals, savePatient } from '../lib/storage';
import { reseedDemoData } from '../lib/demo';

export default function Patient() {
  const { publicKey, connected } = useWallet();
  const { addToast } = useToast();
  const [referrals, setReferrals] = useState([]);
  const [patientProfile, setPatientProfile] = useState(null);
  const [profileForm, setProfileForm] = useState({ name: '', phone: '', nhif: '' });
  const [savingProfile, setSavingProfile] = useState(false);

  const loadReferrals = useCallback(() => {
    if (!publicKey) return;
    const all = getReferrals();
    const mine = all.filter(r => r.patientWallet === publicKey.toBase58());
    setReferrals(mine.sort((a, b) => b.timestamp - a.timestamp));
  }, [publicKey]);

  useEffect(() => {
    loadReferrals();
  }, [loadReferrals]);

  const loadProfile = useCallback(() => {
    if (!publicKey) {
      setPatientProfile(null);
      return;
    }
    const profile = getPatientByWallet(publicKey.toBase58());
    setPatientProfile(profile);
    if (!profile) {
      setProfileForm({ name: '', phone: '', nhif: '' });
    }
  }, [publicKey]);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  const handleProfileChange = (e) => {
    setProfileForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleRegister = (e) => {
    e.preventDefault();
    if (!publicKey) return;

    if (!profileForm.name.trim() || !profileForm.phone.trim() || !profileForm.nhif.trim()) {
      addToast('Please fill in all details', 'error');
      return;
    }

    setSavingProfile(true);
    const patient = {
      patientId: generatePatientId(),
      wallet: publicKey.toBase58(),
      name: profileForm.name.trim(),
      phone: profileForm.phone.trim(),
      nhif: profileForm.nhif.trim(),
      createdAt: Date.now(),
    };

    savePatient(patient);
    setPatientProfile(patient);
    setSavingProfile(false);
    addToast('Patient ID created', 'success');
  };

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

      {/* Registration */}
      {connected && !patientProfile && (
        <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm mb-6">
          <h2 className="text-lg font-semibold text-gray-900">Create your Patient ID</h2>
          <p className="text-xs text-gray-500 mt-1">Add your details once to get your AFL ID</p>
          <form onSubmit={handleRegister} className="mt-4 space-y-3">
            <input
              name="name"
              value={profileForm.name}
              onChange={handleProfileChange}
              placeholder="Full name"
              className="w-full px-4 py-3 rounded-xl border border-gray-300 text-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition"
              disabled={savingProfile}
            />
            <input
              name="phone"
              value={profileForm.phone}
              onChange={handleProfileChange}
              placeholder="Phone number"
              className="w-full px-4 py-3 rounded-xl border border-gray-300 text-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition"
              disabled={savingProfile}
            />
            <input
              name="nhif"
              value={profileForm.nhif}
              onChange={handleProfileChange}
              placeholder="NHIF number"
              className="w-full px-4 py-3 rounded-xl border border-gray-300 text-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition"
              disabled={savingProfile}
            />
            <button
              type="submit"
              disabled={savingProfile}
              className="w-full py-3 rounded-xl bg-teal-700 hover:bg-teal-800 text-white text-sm font-semibold transition-colors disabled:opacity-50 min-h-[48px]"
            >
              {savingProfile ? 'Creating...' : 'Get Patient ID'}
            </button>
          </form>
        </div>
      )}

      {/* Patient ID card */}
      {connected && patientProfile && (
        <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm mb-6">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Your Patient ID</h2>
              <p className="text-xs text-gray-500 mt-1">Share this AFL ID with your doctor</p>
              <p className="mt-2 text-sm font-medium text-gray-900">{patientProfile.name}</p>
              <p className="text-sm font-mono text-teal-700">{patientProfile.patientId}</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-2">
              <QRCodeSVG value={patientProfile.patientId} size={88} />
            </div>
          </div>
          <p className="text-xs text-gray-400 mt-3">Show this QR code at the doctor desk</p>
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
