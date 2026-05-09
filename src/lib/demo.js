import { getReferrals, saveReferral } from './storage';

/**
 * Seeds localStorage with realistic demo referrals.
 * If a connectedWallet is provided, uses it as the patientWallet
 * so referrals appear on the Patient dashboard immediately.
 * Returns the number of referrals seeded.
 */
export function seedDemoData(connectedWallet = '') {
  const existing = getReferrals();
  if (existing.length > 0) return 0; // Don't double-seed

  const demoReferrals = [
    {
      referralId: '5UfDuX9yKYjrNqFbGbXRvNpDh6GHeXwmap9eFbMFMNkTZrjyQCN4caGPzrVvXRPxTzBjVcnXK3xdW9eLc8EQSz9Y',
      doctorWallet: '3F4kMBYzJ7ZTqsnuKhtR2reJcssvJMdXZc7d3X4LRBay',
      patientWallet: connectedWallet || '7KxH4sFQM8NhY2eRaPevUgdGqr1pm5sCQJSqLwZS8FNe',
      fromFacility: 'Nairobi West Hospital',
      toFacility: 'Kenyatta National Hospital',
      toFacilityWallet: 'HN7cABqLq46Es1jh92dQQisAi5YqpGj1RRdbzmH2dgHY',
      notes: 'Patient presents with persistent chest pain and shortness of breath on exertion. ECG shows ST-segment changes requiring urgent cardiology evaluation. Urgent specialist evaluation and intervention required.',
      urgency: 'urgent',
      timestamp: Date.now() - 3600000, // 1 hour ago
      status: 'pending',
      app: 'afyalink',
    },
    {
      referralId: '3HmRK6FxBpJqe7NKdQAMG4wRYfrN2vkGevRmfXZqUCKYs8n4jhRVDxF9BNc7kLU5MBCeW4d6XTHM9FGn7djST2C',
      doctorWallet: '3F4kMBYzJ7ZTqsnuKhtR2reJcssvJMdXZc7d3X4LRBay',
      patientWallet: connectedWallet || '7KxH4sFQM8NhY2eRaPevUgdGqr1pm5sCQJSqLwZS8FNe',
      fromFacility: 'Mbagathi Hospital',
      toFacility: 'Nairobi Hospital',
      toFacilityWallet: 'HN7cABqLq46Es1jh92dQQisAi5YqpGj1RRdbzmH2dgHY',
      notes: 'Diabetic patient with non-healing foot ulcer requiring specialist wound care and vascular assessment. Routine specialist consultation recommended.',
      urgency: 'medium',
      timestamp: Date.now() - 86400000, // 1 day ago
      status: 'paid',
      paymentTx: '2bYe9vxJGxMQPqJkN8rSfTnBcdRwX3NkLy2BgqVmJ7fVz8PxCAHnR6Nv4LqvKXGy3kSj9TqAeL5D8wrEFHmM7wnV',
      app: 'afyalink',
    },
    {
      referralId: '4Yr7kLasnMQpJ8dVwFexN3BhVXjCQ8Dz6kqJM7KYnW2G5fNhTbxRs9PvYeArmL3U4QcW6dZXSHf8FGKz7djRT1A',
      doctorWallet: '3F4kMBYzJ7ZTqsnuKhtR2reJcssvJMdXZc7d3X4LRBay',
      patientWallet: connectedWallet || '7KxH4sFQM8NhY2eRaPevUgdGqr1pm5sCQJSqLwZS8FNe',
      fromFacility: 'Mama Lucy Kibaki Hospital',
      toFacility: 'Aga Khan University Hospital',
      toFacilityWallet: 'HN7cABqLq46Es1jh92dQQisAi5YqpGj1RRdbzmH2dgHY',
      notes: 'Patient with recurrent malaria episodes and suspected hepatosplenomegaly. Follow-up evaluation and continued monitoring recommended.',
      urgency: 'low',
      timestamp: Date.now() - 172800000, // 2 days ago
      status: 'pending',
      app: 'afyalink',
    },
  ];

  demoReferrals.forEach(r => saveReferral(r));
  return demoReferrals.length;
}

/**
 * Reseeds demo data with the connected wallet as patient.
 * Clears existing data first.
 */
export function reseedDemoData(connectedWallet) {
  localStorage.removeItem('afyalink_referrals');
  return seedDemoData(connectedWallet);
}
