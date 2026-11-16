import React, { useEffect, useRef, useState } from 'react'
import { AnimatePresence, animate, motion, useInView, useReducedMotion } from 'framer-motion'
import { toast } from 'react-toastify'
import { ChevronDown, Clock, HeartPulse, LifeBuoy, Loader2, Mail, MapPin, Phone, Salad, Siren, TriangleAlert } from 'lucide-react'

// Placeholder contact details: replace with the real ones.
const CONTACT = {
  address: ['54709 Willms Station', 'Suite 350, Washington, USA'],
  phone: '+1-212-456-7890',
  email: 'greatstackdev@gmail.com',
  hours: ['Mon – Sat: 8:00 AM – 8:00 PM', 'Sunday: 9:00 AM – 2:00 PM'],
  emergency: '112',
}

const INFO = [
  { icon: MapPin, title: 'Visit us', lines: CONTACT.address },
  { icon: Phone, title: 'Call us', lines: [CONTACT.phone], href: `tel:${CONTACT.phone.replace(/[^+\d]/g, '')}` },
  { icon: Mail, title: 'Email us', lines: [CONTACT.email], href: `mailto:${CONTACT.email}`, wide: true },
  { icon: Clock, title: 'Opening hours', lines: CONTACT.hours, wide: true },
]

const TOPICS = ['Booking an appointment', 'Doctor information', 'Lab report help', 'Feedback', 'Something else']

const validators = {
  name: (v) => (v.trim().length < 2 ? 'Enter your name.' : ''),
  email: (v) => (/^\S+@\S+\.\S+$/.test(v) ? '' : 'Enter a valid email address, like name@example.com.'),
  message: (v) => (v.trim().length < 10 ? 'Tell us a little more (at least 10 characters).' : ''),
}

const ECG_PATH = 'M0 40 H110 L128 40 L142 14 L158 66 L174 4 L190 40 H300 L316 40 L328 24 L340 56 L352 40 H470 L486 40 L498 18 L512 62 L526 40 H600'

// Heartbeat line that draws itself, loops, and falls back to a static line for reduced motion
const Heartbeat = ({ reduce }) => (
  <svg viewBox='0 0 600 80' className='absolute inset-x-0 bottom-0 h-20 w-full' preserveAspectRatio='none' aria-hidden='true'>
    <path d={ECG_PATH} fill='none' stroke='rgba(255,255,255,0.25)' strokeWidth='2' strokeLinejoin='round' strokeLinecap='round' />
    {!reduce && (
      <motion.path
        d={ECG_PATH}
        fill='none'
        stroke='#ffffff'
        strokeWidth='2.5'
        strokeLinejoin='round'
        strokeLinecap='round'
        initial={{ pathLength: 0, opacity: 1 }}
        animate={{ pathLength: [0, 1, 1], opacity: [1, 1, 0] }}
        transition={{ duration: 3.2, times: [0, 0.7, 1], repeat: Infinity, ease: 'easeInOut' }}
      />
    )}
  </svg>
)

// Plate segments as percentages of one full circle (pathLength=100). Foods are Indian staples.
const PLATE = [
  { id: 'veg', label: 'Vegetables', share: 50, color: '#16a34a', foods: 'Palak, bhindi, lauki, cabbage, salads, sprouts' },
  { id: 'grain', label: 'Whole grains', share: 25, color: '#d97706', foods: 'Atta roti, brown rice, ragi, jowar, bajra, oats' },
  { id: 'protein', label: 'Protein', share: 25, color: '#e11d48', foods: 'Dal, rajma, chana, paneer, eggs, fish, curd' },
]
const GAP = 1.5
// each segment starts where the previous one ends
const PLATE_WITH_OFFSET = PLATE.map((seg, i) => ({ ...seg, offset: -PLATE.slice(0, i).reduce((sum, p) => sum + p.share, 0) }))

// Counts up once when scrolled into view; shows the final number straight away for reduced motion.
const CountUp = ({ to, reduce }) => {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true })
  const [value, setValue] = useState(reduce ? to : 0)
  useEffect(() => {
    if (reduce || !inView) return
    const controls = animate(0, to, { duration: 1.8, ease: 'easeOut', onUpdate: (v) => setValue(Math.round(v)) })
    return () => controls.stop()
  }, [inView, reduce, to])
  return <span ref={ref} className='tabular-nums'>{value}</span>
}

// Interactive illustration: tap a food group to see its share of a balanced plate. General information only.
const HealthyPlate = ({ reduce }) => {
  const [selected, setSelected] = useState('veg')
  const active = PLATE.find((p) => p.id === selected)

  return (
    <div className='flex flex-col gap-5 rounded-2xl border border-emerald-200 bg-white p-6'>
      <div className='flex items-center justify-between'>
        <p className='flex items-center gap-2 text-sm font-medium text-gray-900'><Salad size={18} className='text-emerald-600' aria-hidden='true' /> Build a balanced plate</p>
        <span className='rounded-full bg-emerald-50 px-3 py-1 text-xs text-emerald-700'>Healthy eating</span>
      </div>

      <div className='flex flex-col items-center gap-5 sm:flex-row sm:items-center'>
        <div className='relative h-48 w-48 shrink-0'>
          <svg viewBox='0 0 100 100' className='h-full w-full -rotate-90' role='img' aria-label='Plate: half vegetables, a quarter whole grains, a quarter protein'>
            <circle cx='50' cy='50' r='38' fill='#f8fafc' stroke='#e2e8f0' strokeWidth='1' />
            {PLATE_WITH_OFFSET.map((seg) => {
              const isActive = seg.id === selected
              return (
                <motion.circle
                  key={seg.id}
                  cx='50'
                  cy='50'
                  r='30'
                  fill='none'
                  stroke={seg.color}
                  pathLength='100'
                  strokeDashoffset={seg.offset}
                  initial={reduce ? false : { strokeDasharray: '0 100' }}
                  animate={{ strokeDasharray: `${seg.share - GAP} ${100 - seg.share + GAP}`, strokeWidth: isActive ? 15 : 11, opacity: isActive ? 1 : 0.4 }}
                  transition={{ duration: reduce ? 0 : 0.7, ease: 'easeOut' }}
                  onClick={() => setSelected(seg.id)}
                  style={{ cursor: 'pointer' }}
                />
              )
            })}
          </svg>
          <div className='pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center'>
            <span className='text-2xl font-semibold text-gray-900'>{active.share}%</span>
            <span className='text-[11px] leading-tight text-gray-500'>{active.label}</span>
          </div>
        </div>

        <div className='w-full'>
          <div className='flex flex-wrap gap-2' role='group' aria-label='Food groups'>
            {PLATE.map((seg) => (
              <button
                key={seg.id}
                type='button'
                aria-pressed={seg.id === selected}
                onClick={() => setSelected(seg.id)}
                className={`flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm transition-colors ${seg.id === selected ? 'border-gray-800 bg-gray-900 text-white' : 'border-gray-200 text-gray-600 hover:border-gray-400'}`}
              >
                <span className='h-2.5 w-2.5 rounded-full' style={{ background: seg.color }} />
                {seg.label}
              </button>
            ))}
          </div>
          <p className='mt-3 text-sm text-gray-600' aria-live='polite'>
            <span className='font-medium text-gray-900'>{active.label}:</span> {active.foods}.
          </p>
        </div>
      </div>

      {/* caution about diabetes in India */}
      <div className='flex items-start gap-3 rounded-xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900'>
        <span className='relative mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center'>
          {!reduce && <span className='absolute inset-0 animate-ping rounded-full bg-amber-300/70' />}
          <TriangleAlert size={20} className='relative' aria-hidden='true' />
        </span>
        <div>
          <p className='font-medium'>Diabetes is a growing concern in India</p>
          <p className='mt-1'>
            An estimated <span className='font-semibold'><CountUp to={101} reduce={reduce} /> million</span> adults live with diabetes and about 136 million have prediabetes (ICMR-INDIAB study, 2023). Limiting sugary drinks and sweets, and eating more fibre-rich food, helps lower the risk.
          </p>
          <p className='mt-1 text-xs text-amber-800'>The WHO advises keeping free sugars below 10% of daily energy, ideally below 5%. This is general information, not medical advice. Please talk to a doctor or dietitian.</p>
        </div>
      </div>
    </div>
  )
}

const Contact = () => {
  const reduce = useReducedMotion()
  const [form, setForm] = useState({ name: '', email: '', topic: TOPICS[0], message: '' })
  const [touched, setTouched] = useState({})
  const [sending, setSending] = useState(false)
  const [helpOpen, setHelpOpen] = useState(false)

  const errors = { name: validators.name(form.name), email: validators.email(form.email), message: validators.message(form.message) }
  const showError = (f) => touched[f] && errors[f]
  const set = (field) => (e) => setForm((prev) => ({ ...prev, [field]: e.target.value }))
  const blur = (field) => () => setTouched((t) => ({ ...t, [field]: true }))

  const onSubmit = (e) => {
    e.preventDefault()
    setTouched({ name: true, email: true, message: true })
    if (errors.name || errors.email || errors.message) return
    setSending(true)
    // Demo only: no backend endpoint yet. Replace with an axios.post call when one exists.
    setTimeout(() => {
      setSending(false)
      toast.success('Thanks! Your message has been sent. We will reply within one business day.')
      setForm({ name: '', email: '', topic: TOPICS[0], message: '' })
      setTouched({})
      setHelpOpen(false)
    }, 1200)
  }

  const fieldClass = (invalid) =>
    `mt-1 w-full rounded-lg border bg-white px-3 py-2.5 text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-primary/30 ${invalid ? 'border-red-400' : 'border-zinc-300 focus:border-primary'}`

  const container = { hidden: {}, show: { transition: { staggerChildren: 0.08 } } }
  const item = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0 } }

  return (
    <div className='pb-16'>
      <div className='pt-10 text-center text-2xl text-gray-500'>
        <p>CONTACT <span className='font-medium text-gray-700'>US</span></p>
      </div>

      {/* hero with animated heartbeat */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className='relative mt-8 overflow-hidden rounded-2xl bg-primary px-6 pb-24 pt-10 text-white sm:px-12'
      >
        <div className='flex items-center gap-4'>
          <span className='relative flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-white/15'>
            {!reduce && (
              <motion.span
                className='absolute inset-0 rounded-full border border-white/60'
                animate={{ scale: [1, 1.6], opacity: [0.7, 0] }}
                transition={{ duration: 1.6, repeat: Infinity, ease: 'easeOut' }}
              />
            )}
            <motion.span
              animate={reduce ? undefined : { scale: [1, 1.18, 1, 1.12, 1] }}
              transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
              className='flex'
            >
              <HeartPulse size={28} aria-hidden='true' />
            </motion.span>
          </span>
          <div>
            <h1 className='text-2xl font-semibold sm:text-3xl'>We are here to help</h1>
            <p className='mt-1 max-w-xl text-sm text-white/85'>Questions about booking, doctors or your reports? Reach us any time or open the help section below.</p>
          </div>
        </div>
        <Heartbeat reduce={reduce} />
      </motion.div>

      <div className='mt-10 grid gap-8 lg:grid-cols-2 lg:items-start'>
        <div className='flex flex-col gap-4'>
          {/* contact details */}
          <motion.ul variants={container} initial='hidden' animate='show' className='grid gap-4 sm:grid-cols-2'>
            {INFO.map((info) => (
              <motion.li variants={item} key={info.title} className={`flex items-start gap-3 rounded-xl border border-blue-200 bg-white p-4 ${info.wide ? 'sm:col-span-2' : ''}`}>
                <span className='flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-indigo-50 text-primary'><info.icon size={18} aria-hidden='true' /></span>
                <div className='min-w-0 text-sm text-gray-600'>
                  <p className='font-medium text-gray-900'>{info.title}</p>
                  {info.lines.map((line) => (
                    <p key={line} className='mt-0.5 break-words'>
                      {info.href ? <a href={info.href} className='hover:text-primary hover:underline'>{line}</a> : line}
                    </p>
                  ))}
                </div>
              </motion.li>
            ))}
          </motion.ul>

          {/* help section: expands into the message form */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className='rounded-xl border border-slate-200 bg-white'>
            <button
              type='button'
              onClick={() => setHelpOpen((o) => !o)}
              aria-expanded={helpOpen}
              aria-controls='help-form'
              className='flex w-full items-center justify-between gap-3 rounded-xl p-4 text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary'
            >
              <span className='flex items-center gap-3'>
                <span className='flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-indigo-50 text-primary'><LifeBuoy size={18} aria-hidden='true' /></span>
                <span>
                  <span className='block font-medium text-gray-900'>Need help?</span>
                  <span className='block text-sm text-gray-500'>Send us a message and we will reply within one business day.</span>
                </span>
              </span>
              <ChevronDown size={20} className={`shrink-0 text-gray-500 transition-transform duration-300 ${helpOpen ? 'rotate-180' : ''}`} aria-hidden='true' />
            </button>

            <AnimatePresence initial={false}>
              {helpOpen && (
                <motion.form
                  id='help-form'
                  key='help-form'
                  onSubmit={onSubmit}
                  noValidate
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: reduce ? 0 : 0.3, ease: 'easeInOut' }}
                  className='overflow-hidden'
                >
                  <div className='border-t border-slate-100 p-4 pt-5'>
                    <div className='grid gap-x-4 sm:grid-cols-2'>
                      <div>
                        <label htmlFor='c-name' className='text-sm font-medium text-zinc-700'>Full name</label>
                        <input id='c-name' value={form.name} onChange={set('name')} onBlur={blur('name')} autoComplete='name' aria-invalid={!!showError('name')} aria-describedby='c-name-err' className={fieldClass(showError('name'))} />
                        <p id='c-name-err' className='min-h-5 pt-1 text-xs text-red-600' aria-live='polite'>{showError('name') || ''}</p>
                      </div>
                      <div>
                        <label htmlFor='c-email' className='text-sm font-medium text-zinc-700'>Email</label>
                        <input id='c-email' type='email' value={form.email} onChange={set('email')} onBlur={blur('email')} autoComplete='email' aria-invalid={!!showError('email')} aria-describedby='c-email-err' className={fieldClass(showError('email'))} />
                        <p id='c-email-err' className='min-h-5 pt-1 text-xs text-red-600' aria-live='polite'>{showError('email') || ''}</p>
                      </div>
                    </div>

                    <label htmlFor='c-topic' className='text-sm font-medium text-zinc-700'>Topic</label>
                    <select id='c-topic' value={form.topic} onChange={set('topic')} className={`${fieldClass(false)} mb-4`}>
                      {TOPICS.map((t) => <option key={t}>{t}</option>)}
                    </select>

                    <label htmlFor='c-message' className='text-sm font-medium text-zinc-700'>Message</label>
                    <textarea id='c-message' rows={3} value={form.message} onChange={set('message')} onBlur={blur('message')} aria-invalid={!!showError('message')} aria-describedby='c-message-err' className={`${fieldClass(showError('message'))} resize-none`} />
                    <p id='c-message-err' className='min-h-5 pt-1 text-xs text-red-600' aria-live='polite'>{showError('message') || ''}</p>

                    <button disabled={sending} className='mt-2 flex w-full items-center justify-center gap-2 rounded-full bg-primary py-3 text-white transition-colors hover:bg-blue-600 disabled:opacity-70 sm:w-auto sm:px-10'>
                      {sending && <Loader2 size={18} className='animate-spin' />}
                      {sending ? 'Sending…' : 'Send message'}
                    </button>
                  </div>
                </motion.form>
              )}
            </AnimatePresence>
          </motion.div>
        </div>

        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
          <HealthyPlate reduce={reduce} />
        </motion.div>
      </div>

      {/* emergency notice */}
      <div className='mt-10 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-5 text-sm text-red-800'>
        <span className='relative mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center'>
          {!reduce && <span className='absolute inset-0 animate-ping rounded-full bg-red-300/70' />}
          <Siren size={20} className='relative' aria-hidden='true' />
        </span>
        <p>
          <span className='font-medium'>In a medical emergency, do not use this form.</span>{' '}
          Call your local emergency number right away (<a href={`tel:${CONTACT.emergency}`} className='font-medium underline'>{CONTACT.emergency}</a> in India) or go to the nearest hospital.
        </p>
      </div>
    </div>
  )
}

export default Contact
