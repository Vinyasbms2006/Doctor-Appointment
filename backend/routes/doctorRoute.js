import express from 'express';
import { getDoctorList, loginDoctor, getDoctorProfile, getDoctorAppointments, changeAvailability, updateDoctorProfile, updateDoctorImage, updateAppointmentStatus } from '../controllers/doctorController.js';
import authDoctor from '../middleware/authDoctor.js';
import upload from '../middleware/multer.js';

const doctorRouter = express.Router();

doctorRouter.get('/list', getDoctorList);
doctorRouter.post('/login', loginDoctor);
doctorRouter.get('/profile', authDoctor, getDoctorProfile);
doctorRouter.get('/appointments', authDoctor, getDoctorAppointments);
doctorRouter.post('/change-availability', authDoctor, changeAvailability);
doctorRouter.post('/update-profile', authDoctor, updateDoctorProfile);
doctorRouter.post('/update-image', upload.single('image'), authDoctor, updateDoctorImage);
doctorRouter.post('/update-appointment-status', authDoctor, updateAppointmentStatus);

export default doctorRouter;
