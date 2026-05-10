const STORAGE_KEY = 'afyalink_referrals';
const PATIENTS_KEY = 'afyalink_patients';

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

/**
 * Get all patients from localStorage
 * @returns {Array<{ patientId: string, wallet: string, name: string, phone: string, nhif: string, createdAt: number }>}
 */
export function getPatients() {
  try {
    const data = localStorage.getItem(PATIENTS_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

/**
 * Create a unique AFL ID
 * @returns {string}
 */
export function generatePatientId() {
  const patients = getPatients();
  let patientId = '';

  while (!patientId || patients.some(p => p.patientId === patientId)) {
    const num = Math.floor(1000 + Math.random() * 9000);
    patientId = `AFL-${num}`;
  }

  return patientId;
}

/**
 * Save a new patient in localStorage
 * @param {{ patientId: string, wallet: string, name: string, phone: string, nhif: string, createdAt: number }} patient
 */
export function savePatient(patient) {
  const patients = getPatients();
  patients.push(patient);
  localStorage.setItem(PATIENTS_KEY, JSON.stringify(patients));
}

/**
 * Find a patient by AFL ID
 * @param {string} patientId
 * @returns {{ patientId: string, wallet: string, name: string, phone: string, nhif: string, createdAt: number } | null}
 */
export function getPatientById(patientId) {
  if (!patientId) return null;
  const patients = getPatients();
  return patients.find(p => p.patientId === patientId) || null;
}

/**
 * Find a patient by wallet address
 * @param {string} wallet
 * @returns {{ patientId: string, wallet: string, name: string, phone: string, nhif: string, createdAt: number } | null}
 */
export function getPatientByWallet(wallet) {
  if (!wallet) return null;
  const patients = getPatients();
  return patients.find(p => p.wallet === wallet) || null;
}
