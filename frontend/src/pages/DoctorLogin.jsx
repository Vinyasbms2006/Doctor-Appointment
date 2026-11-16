import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'

const DoctorLogin = () => {
  const navigate = useNavigate()
  const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:4000'
  const [email, setEmail] = useState('demo.doctor1@prescripto.test')
  const [password, setPassword] = useState('DemoDoctor123!')

  useEffect(() => { if (localStorage.getItem('doctorToken')) navigate('/doctor-dashboard') }, [navigate])

  const submit = async (event) => {
    event.preventDefault()
    try {
      const { data } = await axios.post(`${backendUrl}/api/doctor/login`, { email, password })
      if (!data.success) return toast.error(data.message)
      localStorage.setItem('doctorToken', data.token)
      navigate('/doctor-dashboard')
    } catch (error) {
      toast.error(error.response?.data?.message || 'Unable to sign in')
    }
  }

  return <form onSubmit={submit} className='min-h-[70vh] flex items-center'>
    <div className='glass-panel m-auto w-full max-w-md rounded-2xl p-8'>
      <h1 className='text-2xl font-semibold'>Doctor Portal</h1>
      <p className='mt-2 text-sm text-gray-600'>Manage availability and your appointments.</p>
      <label className='block mt-5 text-sm'>Email<input className='mt-1 w-full rounded border p-2' type='email' value={email} onChange={e => setEmail(e.target.value)} required /></label>
      <label className='block mt-4 text-sm'>Password<input className='mt-1 w-full rounded border p-2' type='password' value={password} onChange={e => setPassword(e.target.value)} required /></label>
      <button className='mt-6 w-full rounded bg-primary py-2 text-white'>Sign in</button>
      <p className='mt-4 text-xs text-gray-500'>Demo account: demo.doctor1@prescripto.test / DemoDoctor123!</p>
    </div>
  </form>
}

export default DoctorLogin
