import React, { memo, useContext, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useReducedMotion } from 'framer-motion'
import { GraduationCap, MapPin, Star, Wallet } from 'lucide-react'
import { AppContext } from '../context/AppContext'
import { getDoctorLocation } from '../data/doctorLocations'
import { getDoctorRating, getDoctorStatus, STATUS_STYLE } from '../data/doctorMeta'

const FACE = { backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden' }

// Hover flips the card to its details; moving the pointer away flips it back.
// Touch devices flip on tap, keyboard users flip on focus.
const DoctorCard = ({ doctor, hoverClass = 'hover:-translate-y-2', distance }) => {
  const navigate = useNavigate()
  const reduce = useReducedMotion()
  const { currencySymbol } = useContext(AppContext)
  const [flipped, setFlipped] = useState(false)

  const status = STATUS_STYLE[getDoctorStatus(doctor)]
  const rating = useMemo(() => getDoctorRating(doctor), [doctor])
  const location = useMemo(() => getDoctorLocation(doctor), [doctor])
  const fee = doctor.fee ?? doctor.fees

  const open = () => { navigate(`/appointment/${doctor._id}`); scrollTo(0, 0) }
  const onClick = () => {
    // no hover on touch screens: first tap flips, the Book button opens the profile
    if (window.matchMedia('(hover: none)').matches) setFlipped((f) => !f)
    else open()
  }

  const faceMotion = reduce
    ? (visible) => ({ opacity: visible ? 1 : 0, transition: 'opacity 150ms', pointerEvents: visible ? 'auto' : 'none' })
    : () => ({})

  return (
    <div
      role='group'
      aria-label={`${doctor.name}, ${doctor.speciality}`}
      tabIndex={0}
      onMouseEnter={() => setFlipped(true)}
      onMouseLeave={() => setFlipped(false)}
      onFocus={() => setFlipped(true)}
      onBlur={(e) => { if (!e.currentTarget.contains(e.relatedTarget)) setFlipped(false) }}
      onClick={onClick}
      onKeyDown={(e) => { if (e.key === 'Enter' && e.target === e.currentTarget) open() }}
      className={`cursor-pointer transition-transform duration-300 ${hoverClass} focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary rounded-xl`}
      style={{ perspective: '1000px' }}
    >
      <div
        className='grid h-full'
        style={{
          transformStyle: reduce ? 'flat' : 'preserve-3d',
          transform: !reduce && flipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
          transition: reduce ? 'none' : 'transform 500ms cubic-bezier(0.4, 0, 0.2, 1)',
        }}
      >
        {/* front */}
        <div
          className='col-start-1 row-start-1 flex flex-col overflow-hidden rounded-xl border border-blue-200 bg-white'
          style={{ ...FACE, ...faceMotion(!flipped) }}
        >
          <img className='bg-blue-50 w-full min-h-48 flex-1 object-cover' src={doctor.image} alt={doctor.name} width='300' height='192' loading='lazy' decoding='async' />
          <div className='p-4'>
            <div className='flex items-center gap-2 text-sm mb-2'>
              <span className={`w-2 h-2 rounded-full ${status.dot}`}></span>
              <span className={status.text}>{status.label}</span>
            </div>
            <p className='text-gray-900 text-lg font-medium leading-tight'>{doctor.name}</p>
            <p className='text-gray-600 text-sm mt-1'>{doctor.speciality}</p>
            {distance != null && <p className='mt-2 text-xs font-medium text-primary'>{distance.toFixed(1)} km away</p>}
          </div>
        </div>

        {/* back */}
        <div
          className='col-start-1 row-start-1 flex flex-col gap-3 overflow-hidden rounded-xl border border-primary/40 bg-white p-4 text-sm text-gray-700'
          style={{ ...FACE, transform: reduce ? 'none' : 'rotateY(180deg)', ...faceMotion(flipped) }}
          aria-hidden={!flipped}
        >
          <div>
            <p className='text-base font-medium leading-tight text-gray-900'>{doctor.name}</p>
            <div className='mt-1 flex items-center gap-2 text-xs'>
              <span className={`w-2 h-2 rounded-full ${status.dot}`}></span>
              <span className={status.text}>{status.label}</span>
            </div>
          </div>

          <ul className='flex flex-col gap-2.5'>
            <li className='flex items-start gap-2'>
              <GraduationCap size={16} className='mt-0.5 shrink-0 text-primary' />
              <span><span className='block text-xs text-gray-500'>Qualification</span>{doctor.degree}{doctor.experience ? ` · ${doctor.experience}` : ''}</span>
            </li>
            <li className='flex items-start gap-2'>
              <MapPin size={16} className='mt-0.5 shrink-0 text-primary' />
              <span>
                <span className='block text-xs text-gray-500'>Location{location.approximate ? ' (approx.)' : ''}</span>
                {location.city}{distance != null ? ` · ${distance.toFixed(1)} km` : ''}
              </span>
            </li>
            <li className='flex items-start gap-2'>
              <Wallet size={16} className='mt-0.5 shrink-0 text-primary' />
              <span><span className='block text-xs text-gray-500'>Approx. fees</span>~{currencySymbol}{Number(fee).toLocaleString('en-IN')}</span>
            </li>
            <li className='flex items-start gap-2'>
              <Star size={16} className='mt-0.5 shrink-0 fill-amber-400 text-amber-400' />
              <span><span className='block text-xs text-gray-500'>Rating</span>{rating.value.toFixed(1)}{rating.count ? ` (${rating.count} reviews)` : ''}</span>
            </li>
          </ul>

          <button
            type='button'
            tabIndex={flipped ? 0 : -1}
            onClick={(e) => { e.stopPropagation(); open() }}
            className='mt-auto w-full rounded-full bg-primary py-2 text-white hover:bg-blue-600 transition-colors'
          >
            Book appointment
          </button>
        </div>
      </div>
    </div>
  )
}

export default memo(DoctorCard)
