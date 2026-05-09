const styles = {
  pending: 'bg-gray-100 text-gray-700',
  paid: 'bg-emerald-100 text-emerald-800',
  completed: 'bg-blue-100 text-blue-800',
};

export default function StatusBadge({ status }) {
  return (
    <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wide ${styles[status] || styles.pending}`}>
      {status}
    </span>
  );
}
