import React from 'react'
import Header from '../components/Header'
import SpecialityMenu from '../components/SpecialityMenu'
import TopDoctors from '../components/TopDoctors'
import LabReportTeaser from '../components/LabReportTeaser'
import Testimonials from '../components/Testimonials'
import Banner from '../components/Banner'
import { motion } from 'framer-motion'

const Home = () => {
  return (
    <motion.div
       initial={{ opacity: 0, y: 20 }}
       animate={{ opacity: 1, y: 0 }}
       transition={{ duration: 0.5 }}
       className="min-h-screen"
    >
       <Header/>
       <SpecialityMenu/>
       <TopDoctors/>
       <LabReportTeaser/>
       <Testimonials/>
       <Banner/>
    </motion.div>
  )
}

export default Home
