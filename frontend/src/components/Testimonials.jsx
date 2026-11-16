import React, { useCallback, useEffect, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { ChevronLeft, ChevronRight, Star } from 'lucide-react'

const TESTIMONIALS = [
  { name: 'Ananya Sharma', role: 'Patient, Mumbai', rating: 5, quote: 'Booking took under a minute. I picked a slot, paid at the clinic and the doctor was on time.' },
  { name: 'Rahul Verma', role: 'Patient, Delhi', rating: 5, quote: 'The nearby doctors map saved me a lot of searching. I found a dermatologist ten minutes from home.' },
  { name: 'Priya Nair', role: 'Parent, Bengaluru', rating: 4, quote: 'Finding a pediatrician for my daughter was simple, and rescheduling was just as easy.' },
  { name: 'Mohammed Iqbal', role: 'Patient, Hyderabad', rating: 5, quote: 'Clear profiles, honest fees and available slots shown up front. No phone calls needed.' },
  { name: 'Sneha Reddy', role: 'Patient, Chennai', rating: 5, quote: 'I uploaded my lab report and understood my results before the consultation. Very helpful.' },
  { name: 'Arjun Mehta', role: 'Patient, Kolkata', rating: 4, quote: 'A clean, quick experience. I booked a neurologist for my father without any hassle.' },
]

const INTERVAL_MS = 6000

const Testimonials = () => {
  const reduce = useReducedMotion()
  const [[index, direction], setPage] = useState([0, 1])
  const [paused, setPaused] = useState(false)

  const paginate = useCallback((dir) => {
    setPage(([i]) => [(i + dir + TESTIMONIALS.length) % TESTIMONIALS.length, dir])
  }, [])

  useEffect(() => {
    if (paused || reduce) return
    const id = setInterval(() => paginate(1), INTERVAL_MS)
    return () => clearInterval(id)
  }, [paused, reduce, paginate])

  const t = TESTIMONIALS[index]
  const variants = {
    enter: (d) => ({ opacity: 0, x: reduce ? 0 : d * 60 }),
    center: { opacity: 1, x: 0 },
    exit: (d) => ({ opacity: 0, x: reduce ? 0 : d * -60 }),
  }

  return (
    <section
      className='my-20 flex flex-col items-center gap-4 text-gray-900'
      aria-roledescription='carousel'
      aria-label='Patient testimonials'
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      <h2 className='text-3xl font-medium'>What our patients say</h2>
      <p className='sm:w-1/3 text-center text-sm'>Real stories from people who booked with Prescripto.</p>

      <div className='relative mt-6 w-full max-w-2xl'>
        <div className='relative min-h-[260px] overflow-hidden rounded-2xl border border-blue-200 bg-white px-6 py-10 sm:px-12'>
          <AnimatePresence mode='wait' custom={direction} initial={false}>
            <motion.figure
              key={index}
              custom={direction}
              variants={variants}
              initial='enter'
              animate='center'
              exit='exit'
              transition={{ type: 'spring', stiffness: 260, damping: 28 }}
              drag={reduce ? false : 'x'}
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.3}
              onDragEnd={(_, info) => { if (Math.abs(info.offset.x) > 60) paginate(info.offset.x < 0 ? 1 : -1) }}
              className='flex flex-col items-center text-center'
              aria-live='polite'
            >
              <div className='flex gap-1' role='img' aria-label={`${t.rating} out of 5 stars`}>
                {Array.from({ length: 5 }, (_, i) => (
                  <Star key={i} size={18} className={i < t.rating ? 'fill-amber-400 text-amber-400' : 'text-gray-300'} />
                ))}
              </div>
              <blockquote className='mt-5 text-lg leading-relaxed text-gray-700'>“{t.quote}”</blockquote>
              <figcaption className='mt-6 flex items-center gap-3'>
                <span className='flex h-11 w-11 items-center justify-center rounded-full bg-primary text-sm font-medium text-white'>
                  {t.name.split(' ').map((n) => n[0]).join('')}
                </span>
                <span className='text-left'>
                  <span className='block text-sm font-medium'>{t.name}</span>
                  <span className='block text-xs text-gray-500'>{t.role}</span>
                </span>
              </figcaption>
            </motion.figure>
          </AnimatePresence>
        </div>

        <button type='button' aria-label='Previous testimonial' onClick={() => paginate(-1)} className='absolute left-2 top-1/2 hidden -translate-y-1/2 rounded-full border border-gray-200 bg-white p-2 shadow-sm hover:bg-gray-50 sm:block sm:-left-5'>
          <ChevronLeft size={18} />
        </button>
        <button type='button' aria-label='Next testimonial' onClick={() => paginate(1)} className='absolute right-2 top-1/2 hidden -translate-y-1/2 rounded-full border border-gray-200 bg-white p-2 shadow-sm hover:bg-gray-50 sm:block sm:-right-5'>
          <ChevronRight size={18} />
        </button>
      </div>

      <div className='mt-2 flex items-center gap-2'>
        {TESTIMONIALS.map((item, i) => (
          <button
            key={item.name}
            type='button'
            aria-label={`Show testimonial ${i + 1}`}
            aria-current={i === index}
            onClick={() => setPage([i, i > index ? 1 : -1])}
            className='flex h-6 w-6 items-center justify-center'
          >
            <span className={`block h-2 w-6 origin-center rounded-full transition-[transform,background-color] duration-300 ${i === index ? 'scale-x-100 bg-primary' : 'scale-x-[0.33] bg-gray-300'}`} />
          </button>
        ))}
      </div>
    </section>
  )
}

export default Testimonials
