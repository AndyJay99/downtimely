export function getBusinessId() {
  if (typeof window === 'undefined') return ''
  return localStorage.getItem('businessId') || ''
}