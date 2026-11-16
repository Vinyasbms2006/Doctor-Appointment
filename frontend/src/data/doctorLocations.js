// MOCK DATA: the database has no doctor location data yet.
// Backend field needed later (doctor model): location: { lat: Number, lng: Number, address: String, city: String }
// When doctor.location exists, getDoctorLocation() uses it and ignores this mock mapping.

export const CITIES = [
  { name: 'Mumbai', lat: 19.076, lng: 72.8777 },
  { name: 'Delhi', lat: 28.6139, lng: 77.209 },
  { name: 'Bengaluru', lat: 12.9716, lng: 77.5946 },
  { name: 'Hyderabad', lat: 17.385, lng: 78.4867 },
  { name: 'Chennai', lat: 13.0827, lng: 80.2707 },
  { name: 'Kolkata', lat: 22.5726, lng: 88.3639 },
]

export const DEFAULT_CITY = CITIES[0]

export const hash = (str) => {
  let h = 0
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) >>> 0
  return h
}

// Deterministic: the same doctor always lands on the same approximate spot.
export const getDoctorLocation = (doctor) => {
  if (doctor.location?.lat != null && doctor.location?.lng != null) {
    return { ...doctor.location, approximate: false }
  }
  const h = hash(String(doctor._id))
  const city = CITIES[h % CITIES.length]
  const dLat = (((h >> 3) % 1000) / 1000 - 0.5) * 0.14
  const dLng = (((h >> 13) % 1000) / 1000 - 0.5) * 0.14
  return {
    lat: city.lat + dLat,
    lng: city.lng + dLng,
    city: city.name,
    address: doctor.address ? `${doctor.address.line1}, ${doctor.address.line2}` : city.name,
    approximate: true,
  }
}
