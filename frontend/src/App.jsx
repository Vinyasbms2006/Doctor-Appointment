import React, { lazy, Suspense } from 'react'
import { Routes ,Route, useLocation } from 'react-router-dom'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import ChatBot from './components/ChatBot'
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Home = lazy(() => import('./pages/Home'))
const Doctors = lazy(() => import('./pages/Doctors'))
const Login = lazy(() => import('./pages/Login'))
const About = lazy(() => import('./pages/About'))
const Contact = lazy(() => import('./pages/Contact'))
const MyProfile = lazy(() => import('./pages/MyProfile'))
const MyAppointments = lazy(() => import('./pages/MyAppointments'))
const Appointment = lazy(() => import('./pages/Appointment'))
const DoctorLogin = lazy(() => import('./pages/DoctorLogin'))
const DoctorDashboard = lazy(() => import('./pages/DoctorDashboard'))
const LabReport = lazy(() => import('./pages/LabReport'))

const PageFallback = () => (
  <div className='py-20' aria-busy='true' aria-label='Loading page'>
    <div className='h-8 w-1/3 animate-pulse rounded bg-gray-200 motion-reduce:animate-none' />
    <div className='mt-6 h-64 animate-pulse rounded-xl bg-gray-100 motion-reduce:animate-none' />
  </div>
)

const App = () => {
  const location = useLocation()
  const doctorToken = localStorage.getItem('doctorToken')

  if (doctorToken && location.pathname !== '/login') {
    return <div className='min-h-screen bg-[radial-gradient(circle_at_top_left,_#dbeafe,_transparent_32%),radial-gradient(circle_at_bottom_right,_#ede9fe,_transparent_30%),#f8fafc]'>
      <ToastContainer position='top-center' />
      <Suspense fallback={<PageFallback />}>
        <Routes><Route path='*' element={<DoctorDashboard />}/></Routes>
      </Suspense>
    </div>
  }

  return (
    <div className='min-h-screen bg-[radial-gradient(circle_at_top_left,_#dbeafe,_transparent_32%),radial-gradient(circle_at_bottom_right,_#ede9fe,_transparent_30%),#f8fafc]'>
    <div className='mx-4 sm:mx-[10%]'>
      <ToastContainer position='top-center' />
      <Navbar />
      <Suspense fallback={<PageFallback />}>
        <Routes>
          <Route path='/' element={<Home />}/>
          <Route path='/doctors' element={<Doctors />}/>
          <Route path='/doctors/:speciality' element={<Doctors />}/>
          <Route path='/login' element={<Login />}/>
          <Route path='/about' element={<About />}/>
          <Route path='/contact' element={<Contact />}/>
          <Route path='/my-profile' element={<MyProfile />}/>
          <Route path='/my-appointment' element={<MyAppointments />}/>
          <Route path='/appointment/:docId' element={<Appointment />}/>
          <Route path='/lab-report' element={<LabReport />}/>
          <Route path='/doctor-login' element={<DoctorLogin />}/>
          <Route path='/doctor-dashboard/*' element={<DoctorDashboard />}/>
        </Routes>
      </Suspense>
      <Footer/>
    </div>
    <ChatBot />
    </div>
  )
}

export default App
