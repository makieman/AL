export const HOSPITALS = [
  {
    id: 'knh',
    name: 'Kenyatta National Hospital',
    city: 'Nairobi',
    wallet: '5KZN8qR4vK3pWxY9mL2jN6bQsT8vU1hG2aD4eF5cH6iJ7kL8',
  },
  {
    id: 'nwh',
    name: 'Nairobi West Hospital',
    city: 'Nairobi',
    wallet: '9mN3oP4qR5sT6uV7wX8yZ1aB2cD3eF4gH5iJ6kL7mN8oP',
  },
  {
    id: 'aghc',
    name: 'Aga Khan Hospital',
    city: 'Nairobi',
    wallet: '4xY7zL2mK9jN6bP1qR8sT5uV3wX0yZ4aB6cD9eF2gH5i',
  },
  {
    id: 'mtrh',
    name: 'Mater Teaching and Referral Hospital',
    city: 'Nairobi',
    wallet: '7dE4fG1hI8jK5lM2nO9pQ6rS3tU0vW7xY4zA1bC8dE5f',
  },
  {
    id: 'kumC',
    name: 'Kenyatta University Medical Center',
    city: 'Nairobi',
    wallet: '2gH9iJ6kL3mN0oP7qR4sT1uV8wX5yZ2aB9cD6eF3gH0',
  },
  {
    id: 'ush',
    name: 'Ushindi Hospital',
    city: 'Nairobi',
    wallet: '6iJ1kL8mN5oP2qR9sT6uV3wX0yZ7aB4cD1eF8gH5iJ',
  },
  {
    id: 'msh',
    name: 'Metropolitan Hospital',
    city: 'Nairobi',
    wallet: '3jK6lM9nO2pQ5rS8tU1vW4xX7yZ0aB3cD6eF9gH2iJ5',
  },
  {
    id: 'vsh',
    name: 'Vital Hospital',
    city: 'Nairobi',
    wallet: '8kL3mN0oP7qR4sT1uV8wX5yZ2aB9cD6eF3gH0iJ7kL4',
  },
];

export function getHospitalByWallet(wallet) {
  return HOSPITALS.find(h => h.wallet === wallet);
}

export function searchHospitals(query) {
  if (!query.trim()) return HOSPITALS;
  const lower = query.toLowerCase();
  return HOSPITALS.filter(h =>
    h.name.toLowerCase().includes(lower) ||
    h.city.toLowerCase().includes(lower)
  );
}
