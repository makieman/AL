const STORAGE_KEY = 'afyalink_referrals';

/**
 * Get all referrals from localStorage
 * @returns {import('../types/referral').Referral[]}
 */
export function getReferrals() {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

/**
 * Save a new referral to localStorage
 * @param {import('../types/referral').Referral} referral
 */
export function saveReferral(referral) {
  const referrals = getReferrals();
  referrals.push(referral);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(referrals));
}

/**
 * Update an existing referral by referralId
 * @param {string} referralId
 * @param {Partial<import('../types/referral').Referral>} updates
 */
export function updateReferral(referralId, updates) {
  const referrals = getReferrals();
  const index = referrals.findIndex(r => r.referralId === referralId);
  if (index !== -1) {
    referrals[index] = { ...referrals[index], ...updates };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(referrals));
  }
}
