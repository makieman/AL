/**
 * SHA-256 hash of a referral object using Web Crypto API
 * @param {import('../types/referral').Referral} referral
 * @returns {Promise<string>}
 */
export async function hashReferral(referral) {
  const text = JSON.stringify(referral);
  const encoder = new TextEncoder();
  const data = encoder.encode(text);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}
