import React from 'react'
import { useNavigate } from 'react-router-dom'
import { FileSearch, ListChecks, Stethoscope } from 'lucide-react'

const STEPS = [
  { icon: FileSearch, title: 'Upload', text: 'Add your lab report as a PDF or image.' },
  { icon: ListChecks, title: 'Understand', text: 'See each value marked normal, high or low.' },
  { icon: Stethoscope, title: 'Act', text: 'Get a suggested specialist to consult.' },
]

const LabReportTeaser = () => {
  const navigate = useNavigate()
  return (
    <section className='my-20 flex flex-col items-center gap-4 text-gray-900'>
      <h2 className='text-3xl font-medium'>Understand your lab report</h2>
      <p className='sm:w-1/3 text-center text-sm'>Get a plain-language summary of your results in seconds.</p>
      <div className='mt-4 grid w-full max-w-3xl gap-4 sm:grid-cols-3'>
        {STEPS.map((step) => (
          <div key={step.title} className='rounded-xl border border-blue-200 bg-white p-5'>
            <step.icon size={24} className='text-primary' />
            <p className='mt-3 font-medium'>{step.title}</p>
            <p className='mt-1 text-sm text-gray-600'>{step.text}</p>
          </div>
        ))}
      </div>
      <button type='button' onClick={() => { navigate('/lab-report'); scrollTo(0, 0) }} className='mt-4 rounded-full bg-primary px-10 py-3 text-white'>Analyze a report</button>
    </section>
  )
}

export default LabReportTeaser
