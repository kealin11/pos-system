// Returns a random Tailwind background color class
export const getRandomBG = () => {
  const colors = [
    'bg-red-500',    'bg-blue-500',   'bg-green-600',
    'bg-purple-500', 'bg-pink-500',   'bg-indigo-500',
    'bg-teal-500',   'bg-orange-500', 'bg-cyan-600',
    'bg-rose-500',   'bg-violet-500', 'bg-amber-600',
  ];
  return colors[Math.floor(Math.random() * colors.length)];
};

// Format currency in ZAR
export const formatCurrency = (amount) =>
  `R ${Number(amount).toFixed(2)}`;

// Format date/time
export const formatDateTime = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleString('en-ZA', {
    year:   'numeric',
    month:  'long',
    day:    'numeric',
    hour:   '2-digit',
    minute: '2-digit',
    hour12: true,
  });
};

// Get status style classes
export const getStatusStyles = (status) => {
  switch (status) {
    case 'Ready':
      return { text: 'text-green-400', bg: 'bg-[#2e4a40]', dot: 'text-green-400' };
    case 'In Progress':
      return { text: 'text-yellow-400', bg: 'bg-[#4a3a04]', dot: 'text-yellow-400' };
    case 'Completed':
      return { text: 'text-blue-400', bg: 'bg-[#1a2a4a]', dot: 'text-blue-400' };
    case 'Cancelled':
      return { text: 'text-red-400', bg: 'bg-[#4a1a1a]', dot: 'text-red-400' };
    default:
      return { text: 'text-gray-400', bg: 'bg-[#2a2a2a]', dot: 'text-gray-400' };
  }
};

// Generate initials from name
export const getInitials = (name) => {
  if (!name) return '??';
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};