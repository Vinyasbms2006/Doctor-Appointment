import React, { useState, useContext, useEffect } from 'react'
import { assets } from '../assets/assets'
import { NavLink, useLocation, useNavigate } from 'react-router-dom'
import { House, Stethoscope, FileSearch, Info, Phone } from 'lucide-react'
import LiquidNavbar from './ui/liquid-glass-navbar'
import { AppContext } from '../context/AppContext'

const NAV_LINKS = [
    { to: '/', label: 'HOME' },
    { to: '/doctors', label: 'ALL DOCTORS' },
    { to: '/lab-report', label: 'LAB REPORT' },
    { to: '/about', label: 'ABOUT' },
    { to: '/contact', label: 'CONTACT' },
]

// items for the liquid pill (desktop); same destinations as NAV_LINKS
const LIQUID_ITEMS = [
    { label: 'Home', icon: <House size={18} />, fx: 'glow' },
    { label: 'Doctors', icon: <Stethoscope size={18} />, fx: 'pop' },
    { label: 'Lab Report', icon: <FileSearch size={18} />, fx: 'drop' },
    { label: 'About', icon: <Info size={18} />, fx: 'spin' },
    { label: 'Contact', icon: <Phone size={18} />, fx: 'wave' },
]

const PILL_STYLE = { '--n-tint': 'rgba(95,111,255,0.10)', '--n-fg': '#1e1b4b', '--n-fg-soft': 'rgba(30,27,75,0.62)' }

const useIsWide = () => {
    const query = '(min-width: 1440px)'
    const [wide, setWide] = useState(() => window.matchMedia(query).matches)
    useEffect(() => {
        const mq = window.matchMedia(query)
        const onChange = (e) => setWide(e.matches)
        mq.addEventListener('change', onChange)
        return () => mq.removeEventListener('change', onChange)
    }, [])
    return wide
}

const Navbar = () => {
    const navigate = useNavigate();
    const { pathname } = useLocation()
    const isWide = useIsWide()
    const activeIndex = NAV_LINKS.findIndex(({ to }) => (to === '/' ? pathname === '/' : pathname.startsWith(to)))
    const [showMenu, setShowMenu] = useState(false)
    const { token, setToken, userData } = useContext(AppContext)
    const doctorToken = localStorage.getItem('doctorToken')

    useEffect(() => {
        if (!showMenu) return
        const onKey = (e) => { if (e.key === 'Escape') setShowMenu(false) }
        document.addEventListener('keydown', onKey)
        document.body.style.overflow = 'hidden'
        return () => {
            document.removeEventListener('keydown', onKey)
            document.body.style.overflow = ''
        }
    }, [showMenu])

  return (
    <>
    <div className='glass-header sticky top-3 z-30 flex items-center justify-between rounded-2xl px-4 text-sm py-3 mb-5'>
        <img onClick={()=>navigate('/')} className='w-40 shrink-0 cursor-pointer' src={assets.logo} alt="Prescripto" />
        <div className='hidden md:block'>
            <LiquidNavbar
                tone='light'
                compact={!isWide}
                items={LIQUID_ITEMS}
                active={activeIndex}
                onChange={(i) => navigate(NAV_LINKS[i].to)}
                style={PILL_STYLE}
            />
        </div>
        <div className='flex items-center gap-4'>
            {
                doctorToken
                ? <div className='hidden md:flex items-center gap-3'>
                    <button onClick={() => navigate('/doctor-dashboard')} className='border-2 border-teal-600 bg-white/70 text-teal-700 font-medium px-4 py-2.5 rounded-full whitespace-nowrap shadow-sm hover:bg-teal-600 hover:text-white transition-colors'>Doctor Dashboard</button>
                    <button onClick={() => { localStorage.removeItem('doctorToken'); navigate('/login?mode=doctor') }} className='border-2 border-teal-600 bg-teal-600 text-white font-medium px-4 py-2.5 rounded-full whitespace-nowrap shadow-sm hover:bg-teal-700 hover:border-teal-700 transition-colors'>Doctor Logout</button>
                  </div>
                : token
                ? <div className='flex items-center gap-2 cursor-pointer group relative'>
                    {userData && userData.image
                      ? <img className='w-8 h-8 rounded-full object-cover' src={userData.image} alt="" />
                      : <div className='w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center text-sm font-medium'>
                          {userData && userData.name ? userData.name.charAt(0).toUpperCase() : 'U'}
                        </div>
                    }
                    <img className='w-2.5' src={assets.dropdown_icon} alt="" />
                    <div className='absolute top-0 right-0 pt-14 text-base font-medium text-gray-600 z-20 hidden group-hover:block group-focus-within:block'>
                        <div className='glass-header min-w-48 rounded-2xl flex flex-col gap-1 p-2'>
                            <button type='button' onClick={()=>navigate('/my-profile')} className='text-left px-3 py-2 rounded hover:bg-white/80 hover:text-black focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary'>My Profile</button>
                            <button type='button' onClick={()=>navigate('/my-appointment')} className='text-left px-3 py-2 rounded hover:bg-white/80 hover:text-black focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary'>My Appointments</button>
                            <button type='button' onClick={()=>{ setToken(false); localStorage.removeItem('token') }} className='text-left px-3 py-2 rounded hover:bg-white/80 hover:text-black focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary'>Log out</button>
                        </div>
                    </div>
                </div>
                :<div className='hidden md:flex items-center gap-3'>
                    <button onClick={()=>navigate('/login')} className="border-2 border-primary bg-white/70 text-primary font-medium px-4 py-2.5 rounded-full whitespace-nowrap shadow-sm hover:bg-primary hover:text-white transition-colors">Patient Login</button>
                    <button onClick={()=>navigate('/login?mode=doctor')} className="border-2 border-teal-600 bg-teal-600 text-white font-medium px-4 py-2.5 rounded-full whitespace-nowrap shadow-sm hover:bg-teal-700 hover:border-teal-700 transition-colors">Doctor Login</button>
                  </div>
            }
            <button type='button' aria-label='Open menu' onClick={()=>setShowMenu(true)} className='md:hidden'>
                <img className='w-6' src={assets.menu_icon} alt="" />
            </button>
        </div>

    </div>

        {/* mobile drawer */}
        <div className={`md:hidden fixed inset-0 z-40 ${showMenu ? '' : 'pointer-events-none'}`} aria-hidden={!showMenu}>
            <div onClick={()=>setShowMenu(false)} className={`absolute inset-0 bg-black/40 transition-opacity duration-200 ${showMenu ? 'opacity-100' : 'opacity-0'}`} />
            <div className={`absolute right-0 top-0 bottom-0 w-72 max-w-[85vw] bg-white shadow-xl flex flex-col transition-transform duration-200 ${showMenu ? 'translate-x-0' : 'translate-x-full'}`}>
                <div className='flex items-center justify-between px-5 py-4'>
                    <img className='w-36' src={assets.logo} alt="Prescripto" />
                    <button type='button' aria-label='Close menu' onClick={()=>setShowMenu(false)} className='p-2'>
                        <img className='w-6' src={assets.cross_icon} alt="" />
                    </button>
                </div>
                <ul className='flex flex-col gap-1 mt-2 px-3 text-base font-medium'>
                    {NAV_LINKS.map(({ to, label }) => (
                        <li key={to}>
                            <NavLink onClick={()=>setShowMenu(false)} to={to} className={({ isActive }) => `block px-4 py-3 rounded-lg ${isActive ? 'bg-indigo-50 text-primary' : 'hover:bg-gray-50'}`}>{label}</NavLink>
                        </li>
                    ))}
                </ul>
                {!token && !doctorToken && (
                    <div className='mt-auto flex flex-col gap-2 p-5'>
                        <button onClick={()=>{ setShowMenu(false); navigate('/login') }} className='border-2 border-primary bg-white/70 text-primary font-medium px-4 py-2.5 rounded-full whitespace-nowrap shadow-sm hover:bg-primary hover:text-white transition-colors'>Patient Login</button>
                        <button onClick={()=>{ setShowMenu(false); navigate('/login?mode=doctor') }} className='border-2 border-teal-600 bg-teal-600 text-white font-medium px-4 py-2.5 rounded-full whitespace-nowrap shadow-sm hover:bg-teal-700 hover:border-teal-700 transition-colors'>Doctor Login</button>
                    </div>
                )}
            </div>
        </div>
    </>
  )
}

export default Navbar
