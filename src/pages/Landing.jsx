import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { seedDemoData } from '../lib/demo';

const roles = [
  {
    title: 'Doctor',
    description: 'Create and manage patient referrals',
    path: '/doctor',
    color: 'from-teal-600 to-teal-700',
    icon: (
      <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 0 1-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 0 1 4.5 0m0 0v5.714a2.25 2.25 0 0 0 .659 1.591L19 14.5m-4.75-11.396c.251.023.501.05.75.082M12 21a8.966 8.966 0 0 0 5.982-2.275M12 21a8.966 8.966 0 0 1-5.982-2.275M12 21V14.5" />
      </svg>
    ),
  },
  {
    title: 'Patient',
    description: 'View your referrals and pay hospitals',
    path: '/patient',
    color: 'from-indigo-600 to-indigo-700',
    icon: (
      <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
      </svg>
    ),
  },
  {
    title: 'Hospital',
    description: 'Verify referral authenticity instantly',
    path: '/verify',
    color: 'from-emerald-600 to-emerald-700',
    icon: (
      <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 21h19.5M3.75 3v18m16.5-18v18M5.25 3h13.5M5.25 21V6.75A2.25 2.25 0 0 1 7.5 4.5h9a2.25 2.25 0 0 1 2.25 2.25V21M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21" />
      </svg>
    ),
  },
];

function DemoButton() {
  const [seeded, setSeeded] = useState(false);

  const handleSeed = () => {
    const count = seedDemoData();
    if (count > 0) {
      setSeeded(true);
    } else {
      setSeeded(true); // Already has data
    }
  };

  return (
    <div className="mt-8 text-center">
      {!seeded ? (
        <button
          onClick={handleSeed}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gray-900 hover:bg-gray-800 text-white text-sm font-medium transition-colors min-h-[48px]"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
          </svg>
          Load Demo Data for Judges
        </button>
      ) : (
        <p className="text-sm text-emerald-600 font-medium">
          Demo data loaded — go to Patient to see referrals
        </p>
      )}
    </div>
  );
}

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div className="min-h-dvh flex flex-col items-center justify-center px-4 pb-24">
      {/* Header */}
      <div className="text-center mb-10 pt-8">
        <div className="inline-flex items-center gap-2 mb-4">
          <div className="w-10 h-10 bg-teal-700 rounded-xl flex items-center justify-center">
            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 0 0 3 8.25v10.5A2.25 2.25 0 0 0 5.25 21h10.5A2.25 2.25 0 0 0 18 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
            </svg>
          </div>
        </div>
        <h1 className="text-4xl font-bold text-gray-900 tracking-tight">
          Afya<span className="text-teal-700">Link</span>
        </h1>
        <p className="text-gray-500 mt-2 text-lg">Tamper-proof referrals on Solana</p>
        <div className="flex items-center justify-center gap-2 mt-3">
          <span className="inline-block w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          <span className="text-xs text-gray-400">Devnet</span>
        </div>
      </div>

      {/* Role cards */}
      <div className="w-full max-w-sm space-y-4">
        {roles.map(role => (
          <button
            key={role.path}
            onClick={() => navigate(role.path)}
            className="w-full bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-all p-5 text-left group active:scale-[0.98]"
          >
            <div className="flex items-center gap-4">
              <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${role.color} text-white flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform`}>
                {role.icon}
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-lg font-semibold text-gray-900">{role.title}</h2>
                <p className="text-sm text-gray-500 mt-0.5">{role.description}</p>
              </div>
              <svg className="w-5 h-5 text-gray-300 group-hover:text-gray-500 transition-colors shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
              </svg>
            </div>
          </button>
        ))}
      </div>

      {/* Demo seeder */}
      <DemoButton />

      {/* Footer */}
      <p className="text-xs text-gray-400 mt-6 text-center">
        Built on Solana &middot; Powered by blockchain
      </p>
    </div>
  );
}
