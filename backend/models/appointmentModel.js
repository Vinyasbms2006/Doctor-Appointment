import mongoose from 'mongoose';

const appointmentSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'user', required: true },
    docId: { type: mongoose.Schema.Types.ObjectId, ref: 'doctor', required: true },
    slotDate: { type: String, required: true },
    slotTime: { type: String, required: true },
    userData: { type: Object, required: true },
    docData: { type: Object, required: true },
    amount: { type: Number, required: true },
    date: { type: Date, default: Date.now },
    cancelled: { type: Boolean, default: false },
    payment: { type: Boolean, default: false },
    paymentMethod: { type: String, enum: ['offline'], default: 'offline' },
    isCompleted: { type: Boolean, default: false },
}, { timestamps: true });

appointmentSchema.index({ docId: 1, slotDate: 1, slotTime: 1 }, { unique: true });

const appointmentModel = mongoose.models.appointment || mongoose.model('appointment', appointmentSchema);

export default appointmentModel;
