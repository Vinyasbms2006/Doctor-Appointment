// Rating and busy status use the real doctor fields when present (rating, ratingCount, busy).
// Otherwise they fall back to deterministic MOCK values so the UI works before the backend has data.
import { hash } from './doctorLocations'

export const getDoctorRating = (doctor) => {
  if (doctor.rating > 0) return { value: doctor.rating, count: doctor.ratingCount || 0, mock: false }
  const h = hash(`${doctor._id}-rating`)
  return { value: 3.8 + (h % 12) / 10, count: 20 + (h % 180), mock: true }
}

// returns 'available' | 'busy' | 'unavailable'
export const getDoctorStatus = (doctor) => {
  if (doctor.available === false) return 'unavailable'
  if (typeof doctor.busy === 'boolean') return doctor.busy ? 'busy' : 'available'
  return hash(`${doctor._id}-busy`) % 4 === 0 ? 'busy' : 'available'
}

export const STATUS_STYLE = {
  available: { label: 'Available', dot: 'bg-green-500', text: 'text-green-600' },
  busy: { label: 'Busy today', dot: 'bg-amber-500', text: 'text-amber-600' },
  unavailable: { label: 'Unavailable', dot: 'bg-gray-400', text: 'text-gray-500' },
}
