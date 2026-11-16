import React, { useContext } from 'react'
import { AppContext } from '../context/AppContext'
import axios from 'axios'
import { toast } from 'react-toastify'

const MyAppointments = () => {

  const { appointments, token, backendUrl, loadAppointments } = useContext(AppContext)

  const cancelAppointment = async (appointmentId) => {
    try {
      const { data } = await axios.post(backendUrl + '/api/user/cancel-appointment', { appointmentId }, { headers: { token } });
      if (!data.success) return toast.error(data.message);
      await loadAppointments();
      toast.success(data.message);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Unable to cancel appointment');
    }
  };
  return (
    <div className='glass-panel mt-8 rounded-2xl p-6'>
      <p className='pb-3 mt-12 font-medium text-zinc-700 border-b'>
        My appointments
      </p>
      <div>
        {!appointments.length && <p className='py-8 text-zinc-500'>You have no appointments yet.</p>}
        {appointments.map((item)=>(
          <div className='grid grid-cols-[1fr_2fr] gap-4 sm:flex sm:gap-6 py-2 border-b'key={item._id}>
            <div>
              <img className='w-32 bg-indigo-50 ' src={item.docData.image} alt={item.docData.name} />
            </div>
            <div className='flex-1 text-small text-zinc-600'>
              <p className='text-neutral-800 font-semibold'>{item.docData.name}</p>
              <p>{item.docData.speciality}</p>
              <p className='text-zinc-700 font-medium mt-1'>Address</p>
              <p className='text-xs'>{item.docData.address?.line1}</p>
              <p className='text-xs'>{item.docData.address?.line2}</p>
              <p className='text-xs mt-1 '><span className='text-sm text-neutral-700 font-medium'>Date & time :</span> {item.slotDate} | {item.slotTime}</p>
            </div>
            <div>

            </div>
            <div className='flex flex-col gap-2 justify-end'>
              <button disabled className='text-sm text-stone-500 text-center sm:min-w-48 py-2 border rounded cursor-not-allowed'>{item.payment ? 'Paid' : 'Offline payment: pay at clinic'}</button>
              <button disabled={item.cancelled} onClick={() => cancelAppointment(item._id)} className='text-sm text-stone-500 text-center sm:min-w-48 py-2 border rounded hover:bg-red-400 hover:text-white transition-all duration-300 disabled:opacity-50'>{item.cancelled ? 'Cancelled' : 'Cancel Appointment'}</button>
            </div>

          </div>
          

          
        ))}
      </div>
      <div>

      </div>

        
    </div>
  )
}

export default MyAppointments
