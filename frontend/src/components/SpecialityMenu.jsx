import React from 'react'
import { specialityData } from '../assets/assets'
import { Link } from 'react-router-dom'
import { Stethoscope, Venus, Baby, Brain } from 'lucide-react'

// lucide has no stomach or blemished-face icon, so these two are drawn in the same 24px outline style
const BlemishedFace = ({ className, strokeWidth = 2, ...props }) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className} {...props}>
        <circle cx="12" cy="12" r="9.5" />
        <path d="M8.5 9.5h.01M15.5 9.5h.01" />
        <path d="M9.5 16c1.4 1 3.6 1 5 0" />
        <circle cx="6.8" cy="13.2" r=".9" />
        <circle cx="17.2" cy="13" r=".9" />
        <circle cx="12.5" cy="5.8" r=".9" />
    </svg>
)

const Stomach = ({ className, strokeWidth = 2, ...props }) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className} {...props}>
        <path d="M8 3v3c0 2.5-4 3.5-4 8a6.5 6.5 0 0 0 6.5 6.5c5.5 0 9.5-3.5 9.5-8v-3" />
        <path d="M12 3v2.5c0 2.2 1.6 3.5 4 3.5h4" />
    </svg>
)

const SPECIALITY_ICONS = {
    'General physician': Stethoscope,
    'Gynecologist': Venus,
    'Pediatricians': Baby,
    'Neurologist': Brain,
    'Dermatologist': BlemishedFace,
    'Gastroenterologist': Stomach,
}

const SpecialityMenu = () => {
  return (
    <div className="flex flex-col items-center gap-4 py-16 text-grey-800 "id='speciality'>
        <h1 className='text-3xl font-medium'>
            Find by Speciality
        </h1>
        <p>Simply browse through our extensive list of trusted doctors, schedule your appintments hussle-free </p>
        <div className="flex sm:justify-center gap-4 pt-5 w-full overflow-scroll">
            {
                specialityData.map((item,index)=>{
                    const Icon = SPECIALITY_ICONS[item.speciality]
                    return (
                    <Link onClick={()=>scrollTo(0,0)} className="flex flex-col items-center text-xs cursor-pointer flex-shrink-0 hover:translate-y-[-10px] transition-all duration-500 " key={index} to={`/doctors/${item.speciality}`}>
                         {Icon
                            ? <span className="flex h-16 w-16 sm:h-24 sm:w-24 mb-2 items-center justify-center rounded-full bg-indigo-50 text-primary ring-1 ring-primary/15">
                                <Icon className="h-7 w-7 sm:h-10 sm:w-10" strokeWidth={1.6} aria-hidden="true" />
                              </span>
                            : <img className="w-16 sm:w-24 mb-2" src={item.image} alt="" />}
                         <p>
                            {item.speciality}
                         </p>

                    </Link>
                    )
                })
            }

        </div>


    </div>
  )
}

export default SpecialityMenu