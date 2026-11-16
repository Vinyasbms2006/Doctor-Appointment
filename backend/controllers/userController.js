import validator from "validator";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import userModel from "../models/userModel.js";
import { v2 as cloudinary } from "cloudinary";
import doctorModel from "../models/doctorModel.js";
import appointmentModel from "../models/appointmentModel.js";
const createToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET || 'secret123', { expiresIn: '7d' });
}

const registerUser = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            return res.json({ success: false, message: "Missing Details" });
        }

        if (!validator.isEmail(email)) {
            return res.json({ success: false, message: "Please enter a valid email" });
        }

        if (password.length < 8) {
            return res.json({ success: false, message: "Please enter a strong password (min 8 characters)" });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const userData = {
            name,
            email,
            password: hashedPassword
        };

        const existingUser = await userModel.findOne({ email: email.toLowerCase() });
        if (existingUser) {
            return res.status(409).json({ success: false, message: "An account with this email already exists" });
        }

        userData.email = email.toLowerCase();
        const newUser = new userModel(userData);
        const user = await newUser.save();
        const token = createToken(user._id);

        res.json({ success: true, token });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
}

const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) return res.status(400).json({ success: false, message: "Email and password are required" });

        const user = await userModel.findOne({ email: email.toLowerCase() });

        if (!user) {
            return res.json({ success: false, message: "User does not exist" });
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (isMatch) {
            const token = createToken(user._id);
            res.json({ success: true, token });
        } else {
            res.json({ success: false, message: "Invalid credentials" });
        }

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
}

const getProfile = async (req, res) => {
    try {
        const userData = await userModel.findById(req.userId).select('-password');
        if (!userData) {
            return res.json({ success: false, message: "User not found" });
        }
        res.json({ success: true, userData });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
}

const updateProfile = async (req, res) => {
    try {
        const { name, phone, address, dob, gender } = req.body;
        const imageFile = req.file;

        if (!name || !phone || !dob || !gender || !address) {
            return res.json({ success: false, message: "Data Missing" });
        }

        let parsedAddress;
        try {
            parsedAddress = typeof address === 'string' ? JSON.parse(address) : address;
        } catch {
            return res.status(400).json({ success: false, message: "Address must be valid JSON" });
        }
        if (!parsedAddress || typeof parsedAddress !== 'object') {
            return res.status(400).json({ success: false, message: "A valid address is required" });
        }

        await userModel.findByIdAndUpdate(req.userId, {
            name,
            phone,
            address: parsedAddress,
            dob,
            gender
        });

        if (imageFile) {
            // upload image to cloudinary
            const imageUpload = await cloudinary.uploader.upload(imageFile.path, { resource_type: "image" });
            const imageURL = imageUpload.secure_url;
            await userModel.findByIdAndUpdate(req.userId, { image: imageURL });
        }

        res.json({ success: true, message: "Profile Updated" });

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
}

const bookAppointment = async (req, res) => {
    try {
        const { docId, slotDate, slotTime, paymentMethod = 'offline' } = req.body;
        if (!docId || !slotDate || !slotTime) {
            return res.status(400).json({ success: false, message: "Doctor, date, and time are required" });
        }
        if (paymentMethod !== 'offline') {
            return res.status(400).json({ success: false, message: 'Only offline payment is currently available' });
        }

        if (!/^\d{4}-\d{2}-\d{2}$/.test(slotDate) || !/^\d{1,2}:\d{2}\s(?:AM|PM)$/i.test(slotTime)) {
            return res.status(400).json({ success: false, message: "Invalid appointment date or time" });
        }
        if (new Date(`${slotDate}T00:00:00`) < new Date(new Date().toDateString())) {
            return res.status(400).json({ success: false, message: "Appointments cannot be booked in the past" });
        }

        const [doctor, user] = await Promise.all([
            doctorModel.findById(docId).select('-password'),
            userModel.findById(req.userId).select('-password'),
        ]);
        if (!doctor || !doctor.available) return res.status(404).json({ success: false, message: "Doctor is not available" });
        if (!user) return res.status(404).json({ success: false, message: "User not found" });

        const appointment = await appointmentModel.create({
            userId: user._id,
            docId: doctor._id,
            slotDate,
            slotTime,
            userData: user.toObject(),
            docData: doctor.toObject(),
            amount: doctor.fee,
            paymentMethod,
        });
        res.status(201).json({ success: true, message: "Appointment booked successfully", appointment });
    } catch (error) {
        if (error?.code === 11000) {
            return res.status(409).json({ success: false, message: "This appointment slot has already been booked" });
        }
        console.log(error);
        res.status(500).json({ success: false, message: "Unable to book appointment" });
    }
};

const listAppointments = async (req, res) => {
    try {
        const appointments = await appointmentModel.find({ userId: req.userId }).sort({ slotDate: 1, slotTime: 1 });
        res.json({ success: true, appointments });
    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: "Unable to load appointments" });
    }
};

const cancelAppointment = async (req, res) => {
    try {
        const appointment = await appointmentModel.findOneAndUpdate(
            { _id: req.body.appointmentId, userId: req.userId, cancelled: false },
            { cancelled: true },
            { new: true }
        );
        if (!appointment) return res.status(404).json({ success: false, message: "Active appointment not found" });
        res.json({ success: true, message: "Appointment cancelled", appointment });
    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: "Unable to cancel appointment" });
    }
};

export { registerUser, loginUser, getProfile, updateProfile, bookAppointment, listAppointments, cancelAppointment };
