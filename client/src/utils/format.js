export function money(n, currency = 'INR') {
  try {
    return new Intl.NumberFormat(currency === 'INR' ? 'en-IN' : 'en-US', {
      style: 'currency', currency, maximumFractionDigits: 0, notation: Math.abs(n) >= 1e7 ? 'compact' : 'standard',
    }).format(n || 0);
  } catch {
    return `${currency} ${Math.round(n || 0)}`;
  }
}

export const shortDate = (d) => new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });

export const scoreTone = (s) => (s >= 70 ? 'pine' : s >= 45 ? 'saffron' : 'rose');
export const scoreColor = (s) => ({ pine: '#0F766E', saffron: '#D97706', rose: '#BE123C' }[scoreTone(s)]);
