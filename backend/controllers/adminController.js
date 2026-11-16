
import validator from "validator";
import bcrypt from "bcrypt";
import { v2 as cloudinary } from "cloudinary";
import doctorModel from "../models/doctorModel.js";

// api for adding doctor
const addDoctor = async (req, res) => {
    try {
        const { name, email, password, speciality, degree, experience, about, fee, address } = req.body;
        const imageFile = req.file;

        // checking for all data to add doctor
        if (!name || !email || !password || !speciality || !degree || !experience || !about || !fee || !address) {
            return res.json({ success: false, message: "Missing Details" });
        }

        // validating email format
        if (!validator.isEmail(email)) {
            return res.json({ success: false, message: "Please enter a valid email" });
        }

        // validating strong password
        if (password.length < 8) {
            return res.json({ success: false, message: "Please enter a strong password (min 8 characters)" });
        }

        // hashing doctor password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        if (!imageFile) {
            return res.status(400).json({ success: false, message: "Doctor image is required" });
        }

        const existingDoctor = await doctorModel.findOne({ email: email.toLowerCase() });
        if (existingDoctor) {
            return res.status(409).json({ success: false, message: "A doctor with this email already exists" });
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

        let imageUrl = "";
        if (imageFile) {
            // upload image to cloudinary
            const imageUpload = await cloudinary.uploader.upload(imageFile.path, { resource_type: "image" });
            imageUrl = imageUpload.secure_url;
        }

        const doctorData = {
            name,
            email: email.toLowerCase(),
            image: imageUrl,
            password: hashedPassword,
            speciality,
            degree,
            experience,
            about,
            fee,
            address: parsedAddress,
            date: Date.now()
        };

        const newDoctor = new doctorModel(doctorData);
        await newDoctor.save();

        res.json({ success: true, message: "Doctor Added" });

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
}

export { addDoctor };
