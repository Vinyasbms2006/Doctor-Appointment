import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { AppContext } from '../context/AppContext'
import { assets } from '../assets/assets'
import RelatedDoctors from '../components/RelatedDoctors'
import { toast } from 'react-toastify'
import axios from 'axios'

const Appointment = () => {

  const{docId}= useParams()
  const{doctors,currencySymbol,token,backendUrl,loadAppointments} = useContext(AppContext)
  const navigate = useNavigate()
  const daysOfWeek = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT']
  

  const docInfo = useMemo(()=> doctors.find(doc=> doc._id===docId) || null,[doctors,docId])
  const[docSlots,setDocSlots]= useState([])
  const[slotIndex,setSlotIndex] = useState(0)
  const[slotTime,setSlotTime] = useState('')

  const getAvailableSlots = useCallback(async ()=>{
    setDocSlots([])

    // getting current date
    let today= new Date()

    for(let i=0 ;i<7 ;i++){
      // getting date with index 
      let currentDate= new Date(today)
      currentDate.setDate(today.getDate()+i)
      
      // setting end time of the date with index 
      let endTime = new Date()
      endTime.setDate(today.getDate()+i)
      endTime.setHours(21,0,0,0)

      //setting Hours
      if(today.getDate()=== currentDate.getDate()){
        currentDate.setHours(currentDate.getHours() > 10 ? currentDate.getHours()+ 1 : 10)
        currentDate.setMinutes(currentDate.getMinutes() > 30 ? 30 : 0 )
      }  else{
        currentDate.setHours(10)
        currentDate.setMinutes(0)
      }

      let timeSlots =[]

      while(currentDate < endTime){
        let formattedTime = currentDate.toLocaleTimeString([], {hour:'2-digit', minute: '2-digit'})

        //add slot to array 
        timeSlots.push({
          datetime: new Date(currentDate),
          time : formattedTime
        })

        // increment time by 30 minutes 
        currentDate.setMinutes(currentDate.getMinutes() + 30 )
      }

      setDocSlots(prev => ([...prev,timeSlots]))
    }
  },[])

  const bookAppointment = async () => {
    if (docInfo?.available === false) {
      return toast.error('This doctor is currently unavailable for new bookings');
    }
    if (!token) {
        toast.warn('Please login to book an appointment');
        return navigate('/login');
    }
    if (!slotTime) {
        toast.error('Please select a time slot first');
        return;
    }
    
    try {
      const selectedSlot = docSlots[slotIndex]?.find((slot) => slot.time === slotTime);
      if (!selectedSlot) return toast.error('Please select an available time slot');
      const slotDate = selectedSlot.datetime.toISOString().slice(0, 10);
      const { data } = await axios.post(
        backendUrl + '/api/user/book-appointment',
        { docId, slotDate, slotTime, paymentMethod: 'offline' },
        { headers: { token } }
      );
      if (!data.success) return toast.error(data.message);
      await loadAppointments();
      toast.success(data.message);
      navigate('/my-appointment');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Unable to book the appointment');
    }
  }

  useEffect(()=>{
    getAvailableSlots()
  },[docInfo,getAvailableSlots])

  return docInfo &&(
    <div>
      {/*------Doctor details------*/}
      <div className="flex flex-col sm:flex-row gap-4">
        <div>
          <img className="bg-stone-400 w-full sm:max-w-72 rounded-lg"src={docInfo.image} alt="" />
        </div>

        <div className='flex-1 border border-gray-400 rounded-lg p-8 py-7 bg-white mx-2 sm:mx-0 mt-[-80px] sm:mt-0'>
          {/*------ doc info name degree exp ------*/}
          <p className='flex items-center gap-2 text-2xl font-medium text-gray-900'>{docInfo.name} 
            <img className="w-5"src={assets.verified_icon} alt="" /> 
          </p>
          <div className='flex items-center gap-2 text-sm mt-1 text-gray-600'>
            <p>{docInfo.degree}  -{docInfo.speciality}</p>
            <button className="py-0.5 px-2 border text-xs rounded-full">{docInfo.experience}</button>
          </div>

          {/*-------Doctor About-----*/}
          <div>
            <p className='flex items-center gap-1 text-sm font-medium text-gray-900 mt-3'>About <img src={assets.info_icon} alt="" /></p>
            <p className='text-sm text-gray-500 max-w-[700px] mt-1'>{docInfo.about}</p>
          </div>
          <p className='text-gray-700 font-medium mt-5'>
            Appointment fee :<span>{currencySymbol}{docInfo.fee || docInfo.fees}</span>
          </p>
        </div>
      </div>
      {/*------Booking SLots----*/}
      <div className='sm:ml-72 sm:pl-4 mt-4 font-medium text-gray-700'>
        <p>Booking Slots</p>
        <div className='flex gap-3 items-center w-full overflow-x-scroll mt-4'>
          {
            docSlots.length && docSlots.map((item,index)=> (
              <div onClick={()=> setSlotIndex(index)} className={`text-center py-6 min-w-16 rounded-full cursor-pointer ${slotIndex === index ? 'bg-primary text-white ' : 'border border-gray-200'}`} key={index}>
                <p>{item[0] && daysOfWeek[item[0].datetime.getDay()]}</p>
                <p>{item[0] && item[0].datetime.getDate()}</p>
              </div>
            ))
          }
        </div>
        <div className='flex items-center gap-3 w-full overflow-x-scroll mt-4 pb-4'>
          {docSlots.length && docSlots[slotIndex].map((item,index)=>(
            <p onClick={()=>setSlotTime(item.time)} className={`text-sm font-light flex-shrink-0 px-5 py-2 rounded-full cursor-pointer ${item.time === slotTime ? 'bg-primary text-white' : 'text-gray-400 border border-gray-300'}`} key={index}>
               {item.time.toLowerCase()} 
            </p>
          ))}
        </div>
        <p className='mt-4 text-sm font-normal text-gray-500'>Payment method: <span className='font-medium text-gray-700'>Offline — pay at the clinic</span></p>
        <button disabled={docInfo.available === false} onClick={bookAppointment} className='bg-primary hover:bg-blue-600 transition-colors text-white text-sm font-light px-14 py-3 rounded-full my-6 disabled:cursor-not-allowed disabled:bg-gray-400' >{docInfo.available === false ? 'Currently unavailable' : 'Book with offline payment'}</button>
      </div>
      {/*------Listing Related Doctors----*/}
      <RelatedDoctors docId={docId} speciality={docInfo.speciality} />
    </div>
  )
}

export default Appointment
