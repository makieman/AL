import { useState, useEffect, useCallback } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import UrgencyBadge from '../components/UrgencyBadge';
import Spinner from '../components/Spinner';
import { useToast } from '../components/Toast';
import { createReferral } from '../lib/solana';
import { getReferrals, saveReferral } from '../lib/storage';
import { summariseNotes } from '../lib/summarise';
import { HOSPITALS, searchHospitals } from '../lib/hospitals';

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

const INITIAL_FORM = {
  patientWallet: '',
  fromFacility: '',
  toFacilityId: '',
  notes: '',
  urgency: 'low',
};

export default function Doctor() {
  const { connection } = useConnection();
  const { publicKey, sendTransaction, connected } = useWallet();
  const { addToast } = useToast();

  const [form, setForm] = useState(INITIAL_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [summarising, setSummarising] = useState(false);
  const [success, setSuccess] = useState(null);
  const [copying, setCopying] = useState(false);
  const [history, setHistory] = useState([]);
  const [hospitalSearch, setHospitalSearch] = useState('');
  const [showHospitalDropdown, setShowHospitalDropdown] = useState(false);
  const [filteredHospitals, setFilteredHospitals] = useState(HOSPITALS);

  const loadHistory = useCallback(() => {
    if (!publicKey) return;
    const all = getReferrals();
    const mine = all.filter(r => r.doctorWallet === publicKey.toBase58());
    setHistory(mine.sort((a, b) => b.timestamp - a.timestamp));
  }, [publicKey]);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleHospitalSearch = (query) => {
    setHospitalSearch(query);
    setFilteredHospitals(searchHospitals(query));
  };

  const handleSelectHospital = (hospital) => {
    setForm(prev => ({
      ...prev,
      toFacilityId: hospital.id,
    }));
    setHospitalSearch(hospital.name);
    setShowHospitalDropdown(false);
  };

  const selectedHospital = HOSPITALS.find(h => h.id === form.toFacilityId);

  const handleSummarise = async () => {
    if (!form.notes.trim()) {
      addToast('Enter notes first', 'error');
      return;
    }
    setSummarising(true);
    try {
      const summary = summariseNotes(form.notes);
      setForm(prev => ({ ...prev, notes: summary }));
      addToast('Notes summarised', 'success');
    } catch {
      addToast('Summarisation failed', 'error');
    } finally {
      setSummarising(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!connected || !publicKey) {
      addToast('Connect wallet first', 'error');
      return;
    }

    if (!selectedHospital) {
      addToast('Please select a receiving facility', 'error');
      return;
    }

    // Validate all fields except toFacilityWallet
    if (!form.patientWallet.trim() || !form.fromFacility.trim() || !form.notes.trim()) {
      addToast('Please fill in all fields', 'error');
      return;
    }

    setSubmitting(true);
    setSuccess(null);

    try {
      const referral = {
        referralId: '',
        doctorWallet: publicKey.toBase58(),
        patientWallet: form.patientWallet.trim(),
        fromFacility: form.fromFacility.trim(),
        toFacility: selectedHospital.name,
        toFacilityWallet: selectedHospital.wallet,
        notes: form.notes.trim(),
        urgency: form.urgency,
        timestamp: Date.now(),
        status: 'pending',
        app: 'afyalink',
      };

      const signature = await createReferral(connection, sendTransaction, referral, publicKey);
      referral.referralId = signature;

      saveReferral(referral);
      setSuccess(signature);
      setForm(INITIAL_FORM);
      setHospitalSearch('');
      loadHistory();
      addToast('Referral created on Solana', 'success');
    } catch (err) {
      console.error('Create referral failed:', err);
      addToast(`Failed: ${err.message || 'Transaction rejected'}`, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto px-4 pb-24 pt-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Doctor Dashboard</h1>
          <p className="text-sm text-gray-500">Create patient referrals on-chain</p>
        </div>
        <WalletMultiButton />
      </div>

      {/* Wallet warning */}
      {!connected && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
          <p className="text-sm text-amber-800 font-medium">Connect your wallet to create referrals</p>
        </div>
      )}

      {/* Connected address */}
      {connected && publicKey && (
        <div className="bg-teal-50 border border-teal-200 rounded-xl px-4 py-2.5 mb-6 flex items-center gap-2">
          <span className="w-2 h-2 bg-green-500 rounded-full" />
          <span className="text-sm text-teal-800 font-mono">{truncate(publicKey.toBase58())}</span>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Patient Wallet Address</label>
          <input
            name="patientWallet"
            value={form.patientWallet}
            onChange={handleChange}
            placeholder="Patient's Solana wallet address"
            className="w-full px-4 py-3 rounded-xl border border-gray-300 text-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition"
            disabled={!connected}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Referring Facility</label>
          <input
            name="fromFacility"
            value={form.fromFacility}
            onChange={handleChange}
            placeholder="e.g. Nairobi West Hospital"
            className="w-full px-4 py-3 rounded-xl border border-gray-300 text-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition"
            disabled={!connected}
          />
        </div>

        <div className="relative">
          <label className="block text-sm font-medium text-gray-700 mb-1">Receiving Facility</label>
          <div className="relative">
            <input
              type="text"
              value={hospitalSearch}
              onChange={(e) => {
                handleHospitalSearch(e.target.value);
                setShowHospitalDropdown(true);
              }}
              onFocus={() => setShowHospitalDropdown(true)}
              placeholder="Search hospital..."
              className="w-full px-4 py-3 rounded-xl border border-gray-300 text-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition"
              disabled={!connected}
            />
            {showHospitalDropdown && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-xl shadow-lg z-50 max-h-64 overflow-y-auto">
                {filteredHospitals.length === 0 ? (
                  <div className="px-4 py-3 text-sm text-gray-500">No hospitals found</div>
                ) : (
                  filteredHospitals.map(hospital => (
                    <button
                      key={hospital.id}
                      type="button"
                      onClick={() => handleSelectHospital(hospital)}
                      className="w-full text-left px-4 py-2.5 hover:bg-teal-50 transition text-sm border-b border-gray-100 last:border-0"
                    >
                      <div className="font-medium text-gray-900">{hospital.name}</div>
                      <div className="text-xs text-gray-500">{hospital.city}</div>
                    </button>
                  ))
                )}
              </div>
            )}
          </div>
          {selectedHospital && (
            <p className="text-xs text-teal-600 mt-1.5">✓ {selectedHospital.name} selected</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Referral Notes</label>
          <textarea
            name="notes"
            value={form.notes}
            onChange={handleChange}
            rows={4}
            placeholder="Clinical notes for this referral..."
            className="w-full px-4 py-3 rounded-xl border border-gray-300 text-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition resize-none"
            disabled={!connected}
          />
          <button
            type="button"
            onClick={handleSummarise}
            disabled={summarising || !connected || !form.notes.trim()}
            className="mt-1.5 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-50 text-indigo-700 text-xs font-medium hover:bg-indigo-100 transition disabled:opacity-40"
          >
            {summarising ? <Spinner size="w-3 h-3" color="text-indigo-600" /> : null}
            Summarise with AI
          </button>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Urgency</label>
          <select
            name="urgency"
            value={form.urgency}
            onChange={handleChange}
            className="w-full px-4 py-3 rounded-xl border border-gray-300 text-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition bg-white"
            disabled={!connected}
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="urgent">Urgent</option>
          </select>
        </div>

        <button
          type="submit"
          disabled={submitting || !connected}
          className="w-full py-3.5 rounded-xl bg-teal-700 hover:bg-teal-800 text-white font-semibold text-sm transition-colors disabled:opacity-50 min-h-[48px] flex items-center justify-center gap-2"
        >
          {submitting ? <><Spinner size="w-4 h-4" /> Creating on Solana...</> : 'Create Referral on Solana'}
        </button>
      </form>

      {/* Success card */}
      {success && (
        <div className="mt-6 bg-emerald-50 border border-emerald-200 rounded-2xl p-4 space-y-3">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
            </svg>
            <span className="text-sm font-semibold text-emerald-800">Referral Created Successfully</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-gray-600 truncate flex-1">{success}</span>
            <button
              onClick={async () => {
                setCopying(true);
                try {
                  await navigator.clipboard.writeText(success);
                  addToast('Referral ID copied', 'success');
                } catch {
                  addToast('Failed to copy', 'error');
                } finally {
                  setCopying(false);
                }
              }}
              className="text-xs text-teal-600 font-medium shrink-0 flex items-center gap-1"
            >
              {copying ? <Spinner size="w-3 h-3" color="text-teal-600" /> : null}
              Copy
            </button>
          </div>
          <a
            href={`https://explorer.solana.com/tx/${success}?cluster=devnet`}
            target="_blank"
            rel="noopener noreferrer"
            className="block text-xs text-indigo-600 hover:underline"
          >
            View on Solana Explorer →
          </a>
        </div>
      )}

      {/* History */}
      {connected && history.length > 0 && (
        <div className="mt-8">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Referral History</h2>
          <div className="space-y-3">
            {history.map(ref => (
              <div key={ref.referralId} className="bg-white rounded-xl border border-gray-200 p-3.5">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-mono text-gray-500">{truncate(ref.patientWallet)}</span>
                  <UrgencyBadge urgency={ref.urgency} />
                </div>
                <div className="flex items-center gap-1 text-sm text-gray-700">
                  <span>{ref.fromFacility}</span>
                  <svg className="w-3.5 h-3.5 text-teal-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                  </svg>
                  <span>{ref.toFacility}</span>
                </div>
                <p className="text-xs text-gray-400 mt-1">{formatTimestamp(ref.timestamp)}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
