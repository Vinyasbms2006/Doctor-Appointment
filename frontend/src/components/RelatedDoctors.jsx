import React, { useContext, useEffect, useState } from 'react'
import { AppContext } from '../context/AppContext'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import DoctorCard from './DoctorCard'

const RelatedDoctors = ({ speciality, docId }) => {
    const { doctors } = useContext(AppContext)
    const [relDoc, setRelDocs] = useState([])
    const navigate = useNavigate()

    useEffect(() => {
        if (doctors.length > 0 && speciality) {
            const doctorsData = doctors.filter((doc) => doc.speciality === speciality && doc._id !== docId)
            setRelDocs(doctorsData)
        }
    }, [doctors, speciality, docId])

    const container = {
        hidden: { opacity: 0 },
        show: {
          opacity: 1,
          transition: { staggerChildren: 0.1 }
        }
    }

    const itemVariant = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0 }
    }

    return (
        <div className="flex flex-col items-center gap-4 my-16 text-gray-900 md:my-10">
            <h1 className="text-3xl font-medium">Top Doctors to Book </h1>
            <p className="sm:w-1/3 text-center text-sm">Simply browse through our extensive list of trusted doctors.</p>
            <motion.div 
                variants={container} 
                initial="hidden" 
                whileInView="show" 
                viewport={{ once: true, amount: 0.1 }}
                className="w-full grid grid-cols-auto gap-4 pt-5 gap-y-6 px-3 sm:px-0"
            >
                {relDoc.slice(0, 5).map((item) => (
                    <motion.div variants={itemVariant} key={item._id}>
                        <DoctorCard doctor={item} hoverClass='hover:scale-105' />
                    </motion.div>
                ))}
            </motion.div>
            <button onClick={() => { navigate('/doctors'); scrollTo(0, 0) }} className='bg-blue-50 text-gray-700 px-12 py-3 rounded-full mt-10 hover:bg-blue-100 transition-colors font-medium hover:shadow-md'>more</button>
        </div>
    )
}

export default RelatedDoctors
