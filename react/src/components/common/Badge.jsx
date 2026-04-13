export default function Badge({ status }) {
  const colors = {
    pending: 'bg-yellow-500 text-white',
    in_progress: 'bg-teal-500 text-white',
    completed: 'bg-green-500 text-white',
    cancelled: 'bg-red-500 text-white',
  };

  return (
    <span className={`px-2 py-1 rounded-md text-xs font-semibold ${colors[status] || 'bg-gray-500 text-white'}`}>
      {status === 'in_progress' ? 'In Progress' : status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}