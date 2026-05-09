import { useState } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { QRCodeSVG } from 'qrcode.react';
import UrgencyBadge from './UrgencyBadge';
import StatusBadge from './StatusBadge';
import Spinner from './Spinner';
import { useToast } from './Toast';
import { sendPayment } from '../lib/solana';
import { updateReferral } from '../lib/storage';

function truncate(addr) {
  if (!addr || addr.length < 10) return addr || '';
  return `${addr.slice(0, 4)}...${addr.slice(-4)}`;
}

function formatTimestamp(ts) {
  return new Date(ts).toLocaleDateString('en-KE', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function ReferralCard({ referral, onUpdate }) {
  const { connection } = useConnection();
  const { publicKey, sendTransaction } = useWallet();
  const { addToast } = useToast();
  const [paying, setPaying] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [copied, setCopied] = useState(false);
  const [copying, setCopying] = useState(false);

  const explorerUrl = `https://explorer.solana.com/tx/${referral.referralId}?cluster=devnet`;

  const handleCopy = async () => {
    setCopying(true);
    try {
      await navigator.clipboard.writeText(referral.referralId);
      setCopied(true);
      addToast('Referral ID copied', 'success');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      addToast('Failed to copy', 'error');
    } finally {
      setCopying(false);
    }
  };

  const handlePay = async () => {
    if (!publicKey || !sendTransaction) {
      addToast('Connect wallet to pay', 'error');
      return;
    }
    setPaying(true);
    try {
      const sig = await sendPayment(connection, sendTransaction, referral.toFacilityWallet, publicKey);
      updateReferral(referral.referralId, { status: 'paid', paymentTx: sig });
      addToast('Payment sent', 'success');
      if (onUpdate) onUpdate();
    } catch (err) {
      console.error('Payment failed:', err);
      addToast(`Payment failed: ${err.message || 'Unknown error'}`, 'error');
    } finally {
      setPaying(false);
    }
  };

  const handleSpeak = async () => {
    setSpeaking(true);
    try {
      const apiKey = import.meta.env.VITE_ELEVENLABS_API_KEY;
      if (!apiKey) {
        throw new Error('Missing ElevenLabs API key');
      }

      const text = `You have been referred to ${currentReferral.toFacility} from ${currentReferral.fromFacility} for ${currentReferral.notes}. This referral is marked ${currentReferral.urgency} priority. Your referral ID begins with ${currentReferral.referralId.slice(0, 8)}. Please show the QR code at reception.`;

      const response = await fetch('https://api.elevenlabs.io/v1/text-to-speech/21m00Tcm4TlvDq8ikWAM', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'audio/mpeg',
          'xi-api-key': apiKey,
        },
        body: JSON.stringify({
          text,
          model_id: 'eleven_monolingual_v1',
        }),
      });

      if (!response.ok) {
        throw new Error('Voice service unavailable');
      }

      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      const audio = new Audio(blobUrl);
      addToast('Playing referral audio', 'success');
      audio.play();
      audio.onended = () => URL.revokeObjectURL(blobUrl);
    } catch (err) {
      console.error('Speech failed:', err);
      addToast('Voice playback failed. Check ElevenLabs API key.', 'error');
    } finally {
      setSpeaking(false);
    }
  };

  // Get updated referral status
  const currentReferral = referral;

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-100 bg-gray-50/60">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-1.5 text-sm font-semibold text-gray-800">
            <span>{currentReferral.fromFacility}</span>
            <svg className="w-4 h-4 text-teal-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
            </svg>
            <span>{currentReferral.toFacility}</span>
          </div>
          <div className="flex gap-1.5">
            <UrgencyBadge urgency={currentReferral.urgency} />
            <StatusBadge status={currentReferral.status} />
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="px-4 py-4 space-y-4">
        {/* Notes */}
        <p className="text-sm text-gray-600 leading-relaxed">{currentReferral.notes}</p>

        {/* Timestamp */}
        <p className="text-xs text-gray-400">{formatTimestamp(currentReferral.timestamp)}</p>

        {/* Referral ID row */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500 font-mono">ID: {truncate(currentReferral.referralId)}</span>
          <button onClick={handleCopy} className="text-xs text-teal-600 hover:text-teal-800 font-medium min-h-[48px] px-2 flex items-center gap-1">
            {copying ? <Spinner size="w-3 h-3" color="text-teal-600" /> : null}
            {copied ? 'Copied!' : 'Copy'}
          </button>
          <a
            href={explorerUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-indigo-600 hover:underline ml-auto"
          >
            View on Solana Explorer →
          </a>
        </div>

        {/* QR Code */}
        <div className="flex flex-col items-center py-3 bg-gray-50 rounded-xl">
          <QRCodeSVG value={currentReferral.referralId} size={160} />
          <span className="text-xs text-gray-400 mt-2">Show this at reception</span>
        </div>

        {/* Action buttons */}
        <div className="flex gap-2">
          {/* Voice button */}
          <button
            onClick={handleSpeak}
            disabled={speaking}
            className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium transition-colors disabled:opacity-50 min-h-[48px] flex-1"
          >
            {speaking ? (
              <Spinner size="w-4 h-4" />
            ) : (
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.114 5.636a9 9 0 0 1 0 12.728M16.463 8.288a5.25 5.25 0 0 1 0 7.424M6.75 8.25l4.72-4.72a.75.75 0 0 1 1.28.53v15.88a.75.75 0 0 1-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.009 9.009 0 0 1 2.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75Z" />
              </svg>
            )}
            {speaking ? 'Playing...' : 'Hear referral'}
          </button>

          {/* Pay button — only when pending */}
          {currentReferral.status === 'pending' && (
            <button
              onClick={handlePay}
              disabled={paying || !publicKey}
              className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-teal-700 hover:bg-teal-800 text-white text-sm font-medium transition-colors disabled:opacity-50 min-h-[48px] flex-1"
            >
              {paying ? <Spinner size="w-4 h-4" /> : null}
              {paying ? 'Sending...' : 'Pay Hospital (0.1 SOL)'}
            </button>
          )}
        </div>

        {/* Payment tx link */}
        {currentReferral.paymentTx && (
          <a
            href={`https://explorer.solana.com/tx/${currentReferral.paymentTx}?cluster=devnet`}
            target="_blank"
            rel="noopener noreferrer"
            className="block text-center text-xs text-emerald-600 hover:underline"
          >
            View payment on Solana Explorer →
          </a>
        )}
      </div>
    </div>
  );
}
