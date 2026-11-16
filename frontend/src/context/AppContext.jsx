import { createContext, useState, useEffect, useCallback, useMemo } from "react";
import axios from 'axios';
import { toast } from 'react-toastify';
import { doctors as localDoctors } from '../assets/assets';

export const AppContext = createContext();

const AppContextProvider = (props) => {
    const currencySymbol = '₹';
    const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:4000';
    const [doctors, setDoctors] = useState([]);
    const [token, setToken] = useState(localStorage.getItem('token') ? localStorage.getItem('token') : false);
    const [userData, setUserData] = useState(false);
    const [appointments, setAppointments] = useState([]);

    const getDoctorsData = useCallback(async () => {
        try {
            const { data } = await axios.get(backendUrl + '/api/doctor/list');
            if (data.success && data.doctors.length > 0) {
                setDoctors(data.doctors);
            } else {
                // Database is empty, use the frontend mock data to ensure the UI works
                setDoctors(localDoctors);
            }
        } catch (error) {
            console.log(error);
            // Fallback to local data on connection error
            setDoctors(localDoctors);
        }
    }, [backendUrl]);

    const loadUserProfileData = useCallback(async () => {
        try {
            const { data } = await axios.post(backendUrl + '/api/user/get-profile', {}, { headers: { token } })
            if (data.success) {
                setUserData(data.userData)
            } else {
                console.log(data.message)
            }
        } catch (error) {
            console.log(error);
        }
    }, [backendUrl, token]);

    const loadAppointments = useCallback(async () => {
        if (!token) return setAppointments([]);
        try {
            const { data } = await axios.get(backendUrl + '/api/user/appointments', { headers: { token } });
            if (data.success) setAppointments(data.appointments);
            else toast.error(data.message);
        } catch (error) {
            console.error(error);
            toast.error('Unable to load appointments');
        }
    }, [backendUrl, token]);

    const value = useMemo(() => ({
        doctors,
        getDoctorsData,
        currencySymbol,
        token,
        setToken,
        backendUrl,
        userData,
        setUserData,
        loadUserProfileData
        ,appointments,
        loadAppointments
    }), [doctors, getDoctorsData, token, backendUrl, userData, loadUserProfileData, appointments, loadAppointments]);

    useEffect(() => {
        getDoctorsData();
    }, [getDoctorsData]);

    useEffect(() => {
        if (token) {
            loadUserProfileData();
            loadAppointments();
        } else {
            setUserData(false);
        }
    }, [token, loadUserProfileData, loadAppointments]);

    return (
        <AppContext.Provider value={value}>
            {props.children}
        </AppContext.Provider>
    )
}

export default AppContextProvider;
