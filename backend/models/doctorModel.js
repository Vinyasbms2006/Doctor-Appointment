import mongoose from "mongoose";


const doctorSchema = new mongoose.Schema({
    name: { type: String, required: true},
    email: { type: String, required: true, unique: true},
    password: { type: String, required: true},
    image: { type: String, required: true},
    speciality: { type: String, required: true},
    degree: { type: String, required: true},
    experience: { type: String, required: true},
    expertise: { type: [String], default: [] },
    certificates: { type: [String], default: [] },
    about: {type: String, required: true},
    available: { type: Boolean, default: true},
    fee: { type: Number, required: true},
    address: { type: Object, required: true},
    // Optional profile fields shown on the frontend doctor cards. Defaults keep existing documents valid.
    rating: { type: Number, default: 0, min: 0, max: 5 },
    ratingCount: { type: Number, default: 0, min: 0 },
    busy: { type: Boolean, default: false },
    location: {
        type: {
            lat: { type: Number },
            lng: { type: Number },
            city: { type: String },
            address: { type: String },
        },
        default: undefined,
    },
    date: { type: Date, required: true, },
    slots_bookes : {type : Object, default: {}}
},{minimize: false});


const doctorModel = mongoose.models.doctor ||  mongoose.model('doctor', doctorSchema);

export default doctorModel;
