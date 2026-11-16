import React from 'react'
import { assets } from '../assets/assets'

const About = () => (
  <div>
    <div className='text-center text-2xl pt-10 text-gray-500'>
      <p>ABOUT <span className='text-gray-700 font-medium'>US</span></p>
    </div>
    <div className='my-10 flex flex-col md:flex-row gap-12'>
      <img className='w-full md:max-w-[360px]' src={assets.about_image} alt='Prescripto healthcare team' />
      <div className='flex flex-col justify-center gap-6 md:w-2/4 text-sm text-gray-600'>
        <p>Welcome to Prescripto, your trusted partner in managing your healthcare needs conveniently and efficiently. We understand the challenges of scheduling doctor appointments and managing health records.</p>
        <p>Prescripto is committed to excellence in healthcare technology. We continually improve our platform to deliver a better experience and dependable service, whether you are booking your first appointment or managing ongoing care.</p>
        <p className='text-gray-800'>OUR VISION</p>
        <p>Our vision is a seamless healthcare experience for every user, connecting patients and healthcare providers so you can access the care you need, when you need it.</p>
      </div>
    </div>
  </div>
)

export default About
