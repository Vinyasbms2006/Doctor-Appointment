import doctorModel from "../models/doctorModel.js";
import appointmentModel from "../models/appointmentModel.js";
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { v2 as cloudinary } from 'cloudinary';

const getDoctorList = async (req, res) => {
    try {
        const doctors = await doctorModel.find({}).select(['-password', '-email']);
        res.json({ success: true, doctors });
    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: "Unable to load doctors" });
    }
}

const createDoctorToken = (id) => jwt.sign({ id, role: 'doctor' }, process.env.JWT_SECRET || 'secret123', { expiresIn: '7d' });

const loginDoctor = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) return res.status(400).json({ success: false, message: 'Email and password are required' });
        const doctor = await doctorModel.findOne({ email: email.toLowerCase() });
        if (!doctor || !(await bcrypt.compare(password, doctor.password))) {
            return res.status(401).json({ success: false, message: 'Invalid email or password' });
        }
        res.json({ success: true, token: createDoctorToken(doctor._id) });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Unable to sign in' });
    }
};

const getDoctorProfile = async (req, res) => {
    try {
        const doctor = await doctorModel.findById(req.docId).select('-password');
        if (!doctor) return res.status(404).json({ success: false, message: 'Doctor not found' });
        res.json({ success: true, doctor });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Unable to load profile' });
    }
};

const getDoctorAppointments = async (req, res) => {
    try {
        const appointments = await appointmentModel.find({ docId: req.docId }).sort({ slotDate: 1, slotTime: 1 });
        res.json({ success: true, appointments });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Unable to load appointments' });
    }
};

const changeAvailability = async (req, res) => {
    try {
        if (typeof req.body.available !== 'boolean') return res.status(400).json({ success: false, message: 'Availability must be true or false' });
        const doctor = await doctorModel.findByIdAndUpdate(req.docId, { available: req.body.available }, { new: true }).select('-password');
        if (!doctor) return res.status(404).json({ success: false, message: 'Doctor not found' });
        res.json({ success: true, message: `Availability updated to ${doctor.available ? 'available' : 'unavailable'}`, doctor });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Unable to update availability' });
    }
};

const updateDoctorProfile = async (req, res) => {
    try {
        const { experience, expertise, certificates, about } = req.body;
        if (!experience?.trim() || !about?.trim()) {
            return res.status(400).json({ success: false, message: 'Experience and about information are required' });
        }
        const normalizeList = (value, field) => {
            if (!Array.isArray(value) || value.some(item => typeof item !== 'string' || !item.trim())) {
                throw new Error(`${field} must be a list of non-empty text entries`);
            }
            return [...new Set(value.map(item => item.trim()))];
        };
        const doctor = await doctorModel.findByIdAndUpdate(req.docId, {
            experience: experience.trim(),
            about: about.trim(),
            expertise: normalizeList(expertise || [], 'Expertise'),
            certificates: normalizeList(certificates || [], 'Certificates'),
        }, { new: true, runValidators: true }).select('-password');
        if (!doctor) return res.status(404).json({ success: false, message: 'Doctor not found' });
        res.json({ success: true, message: 'Profile updated', doctor });
    } catch (error) {
        const status = error.name === 'ValidationError' || error.message.includes('must be a list') ? 400 : 500;
        res.status(status).json({ success: false, message: status === 400 ? error.message : 'Unable to update profile' });
    }
};

const updateDoctorImage = async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ success: false, message: 'Please select an image file' });
        const upload = await cloudinary.uploader.upload(req.file.path, { resource_type: 'image' });
        const doctor = await doctorModel.findByIdAndUpdate(req.docId, { image: upload.secure_url }, { new: true }).select('-password');
        if (!doctor) return res.status(404).json({ success: false, message: 'Doctor not found' });
        res.json({ success: true, message: 'Profile image updated', doctor });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Unable to upload profile image' });
    }
};

const updateAppointmentStatus = async (req, res) => {
    try {
        const { appointmentId, status } = req.body;
        if (!['completed', 'cancelled'].includes(status)) return res.status(400).json({ success: false, message: 'Invalid appointment status' });
        const update = status === 'completed' ? { isCompleted: true } : { cancelled: true };
        const appointment = await appointmentModel.findOneAndUpdate({ _id: appointmentId, docId: req.docId }, update, { new: true });
        if (!appointment) return res.status(404).json({ success: false, message: 'Appointment not found' });
        res.json({ success: true, message: `Appointment marked ${status}`, appointment });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Unable to update appointment' });
    }
};

export { getDoctorList, loginDoctor, getDoctorProfile, getDoctorAppointments, changeAvailability, updateDoctorProfile, updateDoctorImage, updateAppointmentStatus };
