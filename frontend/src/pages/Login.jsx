import React, { useState, useContext, useEffect } from 'react'
import { AppContext } from '../context/AppContext'
import axios from 'axios'
import { toast } from 'react-toastify'
import { useLocation, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { CalendarCheck, Eye, EyeOff, Loader2, ShieldCheck, Stethoscope } from 'lucide-react'
import { assets } from '../assets/assets'

const BENEFITS = [
  { icon: Stethoscope, text: 'Book trusted doctors in under a minute' },
  { icon: CalendarCheck, text: 'Manage all your appointments in one place' },
  { icon: ShieldCheck, text: 'Your health data stays private' },
]

const inputClass = (invalid) =>
  `mt-1 w-full rounded-lg border px-3 py-2.5 transition-colors focus:outline-none focus:ring-2 focus:ring-primary/30 ${invalid ? 'border-red-400' : 'border-zinc-300 focus:border-primary'}`

const validators = {
  name: (v) => (v.trim().length < 2 ? 'Enter your full name.' : ''),
  email: (v) => (/^\S+@\S+\.\S+$/.test(v) ? '' : 'Enter a valid email address, like name@example.com.'),
  password: (v) => (v.length < 8 ? 'Use at least 8 characters.' : ''),
}

const Login = () => {
  const { backendUrl, token, setToken } = useContext(AppContext)
  const navigate = useNavigate()
  const location = useLocation()
  const [state, setState] = useState('Sign Up')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [touched, setTouched] = useState({})
  const [loginType, setLoginType] = useState(new URLSearchParams(location.search).get('mode') === 'doctor' ? 'doctor' : 'user')

  const isSignUp = loginType === 'user' && state === 'Sign Up'
  const values = { name, email, password }
  const errors = {
    name: isSignUp ? validators.name(name) : '',
    email: validators.email(email),
    // length rule only applies when creating a password, not when signing in
    password: isSignUp ? validators.password(password) : (password ? '' : 'Enter your password.'),
  }

  const blur = (field) => setTouched((t) => ({ ...t, [field]: true }))
  const showError = (field) => touched[field] && errors[field]

  const onSubmitHandler = async (event) => {
    event.preventDefault()
    setTouched({ name: true, email: true, password: true })
    if (errors.name || errors.email || errors.password) return
    setLoading(true)
    try {
      if (loginType === 'doctor') {
        const { data } = await axios.post(backendUrl + '/api/doctor/login', { password, email })
        if (data.success) {
          localStorage.setItem('doctorToken', data.token)
          toast.success('Doctor login successful!')
          navigate('/doctor-dashboard')
        } else toast.error(data.message)
      } else if (state === 'Sign Up') {
        const { data } = await axios.post(backendUrl + '/api/user/register', { name, password, email })
        if (data.success) {
          localStorage.setItem('token', data.token)
          setToken(data.token)
          toast.success("Account created successfully!")
        } else {
          toast.error(data.message)
        }
      } else {
        const { data } = await axios.post(backendUrl + '/api/user/login', { password, email })
        if (data.success) {
          localStorage.setItem('token', data.token)
          setToken(data.token)
          toast.success("Logged in successfully!")
        } else {
          toast.error(data.message)
        }
      }
    } catch (error) {
      toast.error(error.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (token && loginType === 'user') {
      navigate('/')
    }
  }, [token, navigate, loginType])

  const switchType = (type) => { setLoginType(type); setState('Login'); setTouched({}) }
  const switchState = (next) => { setState(next); setTouched({}) }

  const field = (id, label, type, onChange, extra) => (
    <div className='w-full'>
      <label htmlFor={id} className='text-sm font-medium text-zinc-700'>{label}</label>
      <div className='relative'>
        <input
          id={id}
          type={type}
          value={values[id]}
          onChange={(e) => onChange(e.target.value)}
          onBlur={() => blur(id)}
          aria-invalid={!!showError(id)}
          aria-describedby={showError(id) ? `${id}-error` : undefined}
          autoComplete={extra?.autoComplete}
          className={`${inputClass(showError(id))} ${extra?.toggle ? 'pr-11' : ''}`}
        />
        {extra?.toggle}
      </div>
      <p id={`${id}-error`} className='min-h-5 pt-1 text-xs text-red-600' aria-live='polite'>{showError(id) || ''}</p>
    </div>
  )

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className='my-6 grid min-h-[80vh] overflow-hidden rounded-2xl border border-slate-200 bg-white md:grid-cols-2'
    >
      {/* brand panel */}
      <div className='hidden flex-col justify-between bg-primary p-10 text-white md:flex'>
        <img src={assets.logo} alt='Prescripto' className='w-40 brightness-0 invert' />
        <div>
          <h2 className='text-3xl font-semibold leading-tight'>Your health, booked in a few taps.</h2>
          <ul className='mt-8 space-y-4'>
            {BENEFITS.map((item) => (
              <li key={item.text} className='flex items-center gap-3 text-sm text-white/90'>
                <span className='flex h-9 w-9 items-center justify-center rounded-full bg-white/15'><item.icon size={18} /></span>
                {item.text}
              </li>
            ))}
          </ul>
        </div>
        <p className='text-xs text-white/70'>Trusted by patients and doctors across the country.</p>
      </div>

      {/* form panel */}
      <form onSubmit={onSubmitHandler} noValidate className='flex items-center justify-center p-6 sm:p-10'>
        <div className='w-full max-w-sm text-zinc-600'>
          <div className='flex w-full rounded-lg bg-gray-100 p-1 text-sm' role='group' aria-label='Account type'>
            <button type='button' aria-pressed={loginType === 'user'} onClick={() => switchType('user')} className={`w-1/2 rounded-md py-2 transition-colors ${loginType === 'user' ? 'bg-white text-primary shadow' : ''}`}>Patient</button>
            <button type='button' aria-pressed={loginType === 'doctor'} onClick={() => switchType('doctor')} className={`w-1/2 rounded-md py-2 transition-colors ${loginType === 'doctor' ? 'bg-white text-primary shadow' : ''}`}>Doctor</button>
          </div>

          <h1 className='mt-6 text-2xl font-semibold text-zinc-900'>
            {loginType === 'doctor' ? 'Doctor portal' : isSignUp ? 'Create your account' : 'Welcome back'}
          </h1>
          <p className='mt-1 mb-5 text-sm'>
            {loginType === 'doctor' ? 'Sign in to manage your availability and appointments.' : isSignUp ? 'Sign up to book appointments with trusted doctors.' : 'Log in to book and manage your appointments.'}
          </p>

          {loginType === 'user' && (
            <div className='mb-4 flex w-full border-b border-zinc-200 text-sm' role='tablist'>
              {['Sign Up', 'Login'].map((tab) => (
                <button key={tab} type='button' role='tab' aria-selected={state === tab} onClick={() => switchState(tab)} className={`relative px-4 py-2 ${state === tab ? 'text-primary' : ''}`}>
                  {tab === 'Sign Up' ? 'Sign up' : 'Log in'}
                  {state === tab && <motion.span layoutId='login-tab' className='absolute inset-x-0 -bottom-px h-0.5 bg-primary' />}
                </button>
              ))}
            </div>
          )}

          {isSignUp && field('name', 'Full name', 'text', setName, { autoComplete: 'name' })}
          {field('email', 'Email', 'email', setEmail, { autoComplete: 'email' })}
          {field('password', 'Password', showPassword ? 'text' : 'password', setPassword, {
            autoComplete: isSignUp ? 'new-password' : 'current-password',
            toggle: (
              <button type='button' onClick={() => setShowPassword((s) => !s)} aria-label={showPassword ? 'Hide password' : 'Show password'} className='absolute right-2 top-1/2 -translate-y-1/2 rounded p-1.5 text-zinc-500 hover:text-zinc-800'>
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            ),
          })}

          {!isSignUp && (
            <div className='-mt-2 mb-3 text-right text-sm'>
              <button type='button' onClick={() => toast.info('Password reset is coming soon.')} className='text-primary hover:underline'>Forgot password?</button>
            </div>
          )}

          <button disabled={loading} className='flex w-full items-center justify-center gap-2 rounded-lg bg-primary py-3 text-base text-white transition-colors hover:bg-blue-600 disabled:opacity-70'>
            {loading && <Loader2 size={18} className='animate-spin' />}
            {loading ? 'Please wait…' : loginType === 'doctor' ? 'Sign in as doctor' : isSignUp ? 'Create account' : 'Log in'}
          </button>
        </div>
      </form>
    </motion.div>
  )
}

export default Login
