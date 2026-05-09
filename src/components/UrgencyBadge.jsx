const styles = {
  low: 'bg-green-100 text-green-800',
  medium: 'bg-amber-100 text-amber-800',
  urgent: 'bg-red-100 text-red-800',
};

export default function UrgencyBadge({ urgency }) {
  return (
    <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wide ${styles[urgency] || styles.low}`}>
      {urgency}
    </span>
  );
}
