import React, { useState, useContext, useMemo, lazy, Suspense } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { AppContext } from '../context/AppContext'
import { motion } from 'framer-motion'
import { List, Map as MapIcon, LocateFixed } from 'lucide-react'
import { toast } from 'react-toastify'
import DoctorCard from '../components/DoctorCard'
import { CITIES, DEFAULT_CITY, getDoctorLocation } from '../data/doctorLocations'
import { distanceKm } from '../services/geo'

const DoctorsMap = lazy(() => import('../components/DoctorsMap'))

const SPECIALITIES = ['General physician', 'Gynecologist', 'Dermatologist', 'Pediatricians', 'Neurologist', 'Gastroenterologist']
const RADII = [5, 10, 25, 50]

const Doctors = () => {
  const { speciality } = useParams()
  const [showFilter, setShowFilter] = useState(false)
  const [view, setView] = useState('list')
  const [origin, setOrigin] = useState(null) // { lat, lng, label }
  const [radius, setRadius] = useState(25)
  const [locating, setLocating] = useState(false)
  const navigate = useNavigate()
  const { doctors } = useContext(AppContext)

  const filterDoc = useMemo(
    () => (speciality ? doctors.filter((doc) => doc.speciality === speciality) : doctors),
    [doctors, speciality]
  )

  // Doctors with distance from the chosen origin, sorted nearest first
  const nearby = useMemo(() => {
    if (!origin) return []
    return filterDoc
      .map((doctor) => {
        const location = getDoctorLocation(doctor)
        return { doctor, location, distance: distanceKm(origin, location) }
      })
      .filter((item) => item.distance <= radius)
      .sort((a, b) => a.distance - b.distance)
  }, [filterDoc, origin, radius])

  const useMyLocation = () => {
    if (!navigator.geolocation) {
      toast.info('Location is not supported here. Pick a city instead.')
      return
    }
    setLocating(true)
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        setOrigin({ lat: coords.latitude, lng: coords.longitude, label: 'your location' })
        setLocating(false)
      },
      () => {
        setLocating(false)
        toast.info('Location access was denied. Pick a city instead.')
        setOrigin((prev) => prev || { ...DEFAULT_CITY, label: DEFAULT_CITY.name })
      },
      { timeout: 10000 }
    )
  }

  const pickCity = (name) => {
    const city = CITIES.find((c) => c.name === name)
    if (city) setOrigin({ lat: city.lat, lng: city.lng, label: city.name })
  }

  const showNearby = view === 'map' || origin !== null
  const list = origin ? nearby : filterDoc.map((doctor) => ({ doctor }))

  const selectView = (next) => {
    setView(next)
    if (next === 'map' && !origin) setOrigin({ ...DEFAULT_CITY, label: DEFAULT_CITY.name })
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
      <p className='text-gray-600'>Browse through the doctors specialist</p>

      {/* location controls */}
      <div className='mt-4 flex flex-wrap items-center gap-3 text-sm'>
        <div className='inline-flex rounded-lg border border-gray-300 bg-white p-1' role='group' aria-label='View mode'>
          <button type='button' onClick={() => selectView('list')} aria-pressed={view === 'list'} className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 ${view === 'list' ? 'bg-primary text-white' : 'text-gray-600'}`}>
            <List size={16} /> List
          </button>
          <button type='button' onClick={() => selectView('map')} aria-pressed={view === 'map'} className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 ${view === 'map' ? 'bg-primary text-white' : 'text-gray-600'}`}>
            <MapIcon size={16} /> Map
          </button>
        </div>
        <button type='button' onClick={useMyLocation} disabled={locating} className='flex items-center gap-1.5 rounded-lg border border-primary px-3 py-2 text-primary hover:bg-indigo-50 disabled:opacity-60'>
          <LocateFixed size={16} /> {locating ? 'Finding you…' : 'Doctors near me'}
        </button>
        <label className='flex items-center gap-2 text-gray-600'>
          <span>City</span>
          <select value={CITIES.find((c) => c.name === origin?.label)?.name || ''} onChange={(e) => pickCity(e.target.value)} className='rounded-lg border border-gray-300 bg-white px-2 py-2'>
            <option value='' disabled>Choose a city</option>
            {CITIES.map((c) => <option key={c.name} value={c.name}>{c.name}</option>)}
          </select>
        </label>
        {showNearby && (
          <label className='flex items-center gap-2 text-gray-600'>
            <span>Within</span>
            <select value={radius} onChange={(e) => setRadius(Number(e.target.value))} className='rounded-lg border border-gray-300 bg-white px-2 py-2'>
              {RADII.map((r) => <option key={r} value={r}>{r} km</option>)}
            </select>
          </label>
        )}
      </div>
      {origin && (
        <p className='mt-2 text-xs text-gray-500'>
          Showing doctors near {origin.label}. Doctor locations are approximate (demo data).
        </p>
      )}

      <div className='flex flex-col sm:flex-row items-start gap-5 mt-5'>
        <button className={`py-1 px-3 border rounded text-sm transition-colors sm:hidden ${showFilter ? 'bg-primary text-white ' : ''}`} onClick={() => setShowFilter((prev) => !prev)}>Filters</button>
        <div className={`flex-col gap-4 text-sm text-gray-600 ${showFilter ? 'flex' : 'hidden sm:flex'}`}>
          {SPECIALITIES.map((name) => (
            <button
              type='button'
              key={name}
              onClick={() => (speciality === name ? navigate('/doctors') : navigate(`/doctors/${name}`))}
              className={`w-[94vw] sm:w-auto text-left pl-3 py-1.5 pr-16 border border-gray-300 rounded transition-colors ${speciality === name ? 'bg-indigo-100 text-black' : ''}`}
            >
              {name}
            </button>
          ))}
        </div>

        <div className='w-full'>
          {view === 'map' && origin && (
            <Suspense fallback={<div className='h-[460px] w-full animate-pulse rounded-xl bg-gray-100' />}>
              <DoctorsMap center={origin} radiusKm={radius} doctors={nearby} />
            </Suspense>
          )}

          {origin && nearby.length === 0 ? (
            <div className='mt-6 rounded-xl border border-dashed border-gray-300 bg-white p-8 text-center text-sm text-gray-600'>
              <p className='font-medium text-gray-800'>No doctors within {radius} km of {origin.label}</p>
              <p className='mt-1'>Try a larger radius or choose another city.</p>
              <button type='button' onClick={() => setRadius(50)} className='mt-4 rounded-full bg-primary px-6 py-2 text-white'>Search within 50 km</button>
            </div>
          ) : (
            <div className={`grid grid-cols-auto gap-4 gap-y-6 ${view === 'map' ? 'mt-6' : ''}`}>
              {list.map(({ doctor, distance }) => (
                <DoctorCard key={doctor._id} doctor={doctor} distance={distance} />
              ))}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  )
}

export default Doctors
