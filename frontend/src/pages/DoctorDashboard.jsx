import React, { useCallback, useEffect, useMemo, useState } from 'react'
import axios from 'axios'
import { useLocation, useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'

const DoctorDashboard = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:4000'
  const token = localStorage.getItem('doctorToken')
  const [doctor, setDoctor] = useState(null)
  const [appointments, setAppointments] = useState([])
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState({ experience: '', about: '', expertise: '', certificates: '' })
  const activePage = location.pathname.endsWith('/profile') ? 'profile' : 'appointments'

  const headers = useMemo(() => ({ token }), [token])
  const loadDashboard = useCallback(async () => {
    try {
      const [profile, appointmentData] = await Promise.all([axios.get(`${backendUrl}/api/doctor/profile`, { headers }), axios.get(`${backendUrl}/api/doctor/appointments`, { headers })])
      if (profile.data.success) {
        const value = profile.data.doctor
        setDoctor(value)
        setForm({ experience: value.experience || '', about: value.about || '', expertise: (value.expertise || []).join(', '), certificates: (value.certificates || []).join(', ') })
      }
      if (appointmentData.data.success) setAppointments(appointmentData.data.appointments)
    } catch (error) {
      if ([401, 403].includes(error.response?.status)) { localStorage.removeItem('doctorToken'); navigate('/login?mode=doctor') }
      else toast.error('Unable to load the doctor dashboard')
    }
  }, [backendUrl, headers, navigate])

  useEffect(() => { if (!token) navigate('/login?mode=doctor'); else loadDashboard() }, [token, navigate, loadDashboard])
  const toList = value => value.split(',').map(item => item.trim()).filter(Boolean)
  const logout = () => { localStorage.removeItem('doctorToken'); navigate('/login?mode=doctor') }
  const uploadImage = async (image) => {
    if (!image) return
    try {
      const data = new FormData()
      data.append('image', image)
      const response = await axios.post(`${backendUrl}/api/doctor/update-image`, data, { headers })
      if (!response.data.success) return toast.error(response.data.message)
      setDoctor(response.data.doctor)
      toast.success(response.data.message)
    } catch (error) { toast.error(error.response?.data?.message || 'Unable to upload profile image') }
  }
  const setAvailability = async () => {
    try { const { data } = await axios.post(`${backendUrl}/api/doctor/change-availability`, { available: !doctor.available }, { headers }); if (!data.success) return toast.error(data.message); setDoctor(data.doctor); toast.success(data.message) }
    catch (error) { toast.error(error.response?.data?.message || 'Unable to update availability') }
  }
  const saveProfile = async () => {
    try {
      const { data } = await axios.post(`${backendUrl}/api/doctor/update-profile`, { experience: form.experience, about: form.about, expertise: toList(form.expertise), certificates: toList(form.certificates) }, { headers })
      if (!data.success) return toast.error(data.message)
      setDoctor(data.doctor); setEditing(false); toast.success(data.message)
    } catch (error) { toast.error(error.response?.data?.message || 'Unable to update profile') }
  }
  const updateStatus = async (appointmentId, status) => {
    try { const { data } = await axios.post(`${backendUrl}/api/doctor/update-appointment-status`, { appointmentId, status }, { headers }); if (!data.success) return toast.error(data.message); toast.success(data.message); loadDashboard() }
    catch (error) { toast.error(error.response?.data?.message || 'Unable to update appointment') }
  }

  if (!doctor) return <p className='py-20 text-center text-gray-500'>Loading doctor dashboard...</p>
  return <div className='min-h-screen bg-slate-50 text-slate-800'>
    <header className='border-b border-white/60 bg-white/65 backdrop-blur-xl'><div className='mx-auto flex max-w-6xl items-center justify-between px-6 py-4'><div><p className='text-lg font-semibold'>Doctor Portal</p><p className='text-sm text-slate-500'>{doctor.name}</p></div><button onClick={logout} className='rounded-full border border-red-200 px-4 py-2 text-sm text-red-600 hover:bg-red-50'>Logout</button></div></header>
    <div className='mx-auto grid max-w-6xl gap-6 px-6 py-8 md:grid-cols-[200px_1fr]'>
      <aside className='glass-panel h-fit rounded-2xl p-3'><button onClick={() => navigate('/doctor-dashboard/appointments')} className={`w-full rounded-xl px-4 py-3 text-left ${activePage === 'appointments' ? 'bg-primary text-white shadow-lg shadow-blue-200' : 'hover:bg-slate-100'}`}>Appointments</button><button onClick={() => navigate('/doctor-dashboard/profile')} className={`mt-2 w-full rounded-xl px-4 py-3 text-left ${activePage === 'profile' ? 'bg-primary text-white shadow-lg shadow-blue-200' : 'hover:bg-slate-100'}`}>Profile</button></aside>
      <main>
    {activePage === 'profile' && <><div className='glass-panel flex flex-wrap items-center justify-between gap-4 rounded-2xl p-6'><div className='flex items-center gap-4'><label className='relative cursor-pointer'><img src={doctor.image} alt={doctor.name} className='h-16 w-16 rounded-2xl object-cover ring-4 ring-white' /><span className='absolute -bottom-1 -right-1 rounded-full bg-primary px-2 py-1 text-xs text-white'>Edit</span><input type='file' accept='image/*' hidden onChange={e => uploadImage(e.target.files[0])} /></label><div><h1 className='text-2xl font-semibold'>My Professional Profile</h1><p className='text-gray-600'>{doctor.speciality}</p></div></div><button onClick={setAvailability} className={`rounded-full px-5 py-2 text-white ${doctor.available ? 'bg-green-600' : 'bg-gray-500'}`}>{doctor.available ? 'Available for booking' : 'Unavailable for booking'}</button></div>
    <section className='glass-panel mt-6 rounded-2xl p-6'><div className='flex items-center justify-between gap-4'><h2 className='text-xl font-semibold'>Profile details</h2>{!editing && <button onClick={() => setEditing(true)} className='text-primary'>Edit profile</button>}</div>
      {editing ? <div className='mt-4 grid gap-4'><label>Experience<input className='mt-1 w-full rounded border p-2' value={form.experience} onChange={e => setForm({ ...form, experience: e.target.value })} /></label><label>About<textarea className='mt-1 w-full rounded border p-2' rows='4' value={form.about} onChange={e => setForm({ ...form, about: e.target.value })} /></label><label>Expertise <span className='text-xs text-gray-500'>(comma separated)</span><input className='mt-1 w-full rounded border p-2' value={form.expertise} onChange={e => setForm({ ...form, expertise: e.target.value })} /></label><label>Certificates / credentials <span className='text-xs text-gray-500'>(comma separated)</span><textarea className='mt-1 w-full rounded border p-2' rows='3' value={form.certificates} onChange={e => setForm({ ...form, certificates: e.target.value })} /></label><div className='flex gap-3'><button onClick={saveProfile} className='rounded bg-primary px-5 py-2 text-white'>Save profile</button><button onClick={() => setEditing(false)} className='rounded border px-5 py-2'>Cancel</button></div></div> : <div className='mt-4 text-sm text-gray-700'><p><b>Experience:</b> {doctor.experience}</p><p className='mt-3'><b>About:</b> {doctor.about}</p><p className='mt-3'><b>Expertise:</b> {(doctor.expertise || []).join(', ') || 'Not added yet'}</p><p className='mt-3'><b>Certificates:</b> {(doctor.certificates || []).join(', ') || 'Not added yet'}</p></div>}
    </section></>}
    {activePage === 'appointments' && <><div className='glass-panel flex flex-wrap items-center justify-between gap-4 rounded-2xl p-6'><div><h1 className='text-2xl font-semibold'>Appointments</h1><p className='text-gray-600'>Manage patient bookings and appointment status.</p></div><button onClick={setAvailability} className={`rounded-full px-5 py-2 text-white ${doctor.available ? 'bg-green-600' : 'bg-gray-500'}`}>{doctor.available ? 'Available for booking' : 'Unavailable for booking'}</button></div><div className='glass-panel mt-6 rounded-2xl p-6'>{!appointments.length && <p className='text-gray-500'>No appointments yet.</p>}<div className='space-y-3'>{appointments.map(item => <div key={item._id} className='flex flex-wrap items-center justify-between gap-4 rounded-xl border border-slate-100 bg-white/60 p-4'><div><p className='font-medium'>{item.userData.name}</p><p className='text-sm text-gray-600'>{item.slotDate} · {item.slotTime}</p><p className='text-xs text-gray-500'>{item.cancelled ? 'Cancelled' : item.isCompleted ? 'Completed' : 'Booked'} · {item.payment ? 'Paid' : 'Offline payment pending'}</p></div>{!item.cancelled && !item.isCompleted && <div className='flex gap-2'><button onClick={() => updateStatus(item._id, 'completed')} className='rounded border border-green-600 px-3 py-1 text-sm text-green-700'>Complete</button><button onClick={() => updateStatus(item._id, 'cancelled')} className='rounded border border-red-500 px-3 py-1 text-sm text-red-600'>Cancel</button></div>}</div>)}</div></div></>}
      </main></div></div>
}

export default DoctorDashboard
