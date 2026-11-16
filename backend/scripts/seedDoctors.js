import 'dotenv/config';
import bcrypt from 'bcrypt';
import mongoose from 'mongoose';
import connectDB from '../config/mongodb.js';
import doctorModel from '../models/doctorModel.js';

const doctorSeeds = [
    ['Dr. Richard James', 'General physician', '4 Years', 50, 'doc1.png'],
    ['Dr. Emily Larson', 'Gynecologist', '3 Years', 60, 'doc2.png'],
    ['Dr. Sarah Patel', 'Dermatologist', '1 Year', 30, 'doc3.png'],
    ['Dr. Christopher Lee', 'Pediatricians', '2 Years', 40, 'doc4.png'],
    ['Dr. Jennifer Garcia', 'Neurologist', '4 Years', 50, 'doc5.png'],
    ['Dr. Andrew Williams', 'Neurologist', '4 Years', 50, 'doc6.png'],
    ['Dr. Christopher Davis', 'General physician', '4 Years', 50, 'doc7.png'],
    ['Dr. Timothy White', 'Gynecologist', '3 Years', 60, 'doc8.png'],
    ['Dr. Ava Mitchell', 'Dermatologist', '1 Year', 30, 'doc9.png'],
    ['Dr. Jeffrey King', 'Pediatricians', '2 Years', 40, 'doc10.png'],
    ['Dr. Zoe Kelly', 'Neurologist', '4 Years', 50, 'doc11.png'],
    ['Dr. Patrick Harris', 'Neurologist', '4 Years', 50, 'doc12.png'],
    ['Dr. Chloe Evans', 'General physician', '4 Years', 50, 'doc13.png'],
    ['Dr. Ryan Martinez', 'Gynecologist', '3 Years', 60, 'doc14.png'],
    ['Dr. Amelia Hill', 'Dermatologist', '1 Year', 30, 'doc15.png'],
];

const seedDoctors = async () => {
    await connectDB();
    const password = await bcrypt.hash('DemoDoctor123!', 10);
    const imageBaseUrl = (process.env.BACKEND_URL || `http://localhost:${process.env.PORT || 4000}`).replace(/\/$/, '');

    const operations = doctorSeeds.map(([name, speciality, experience, fee, image], index) => ({
        updateOne: {
            filter: { email: `demo.doctor${index + 1}@prescripto.test` },
            update: {
                $set: {
                    name,
                    email: `demo.doctor${index + 1}@prescripto.test`,
                    password,
                    image: `${imageBaseUrl}/doctor-images/${image}`,
                    speciality,
                    degree: 'MBBS',
                    experience,
                    about: `${name} provides patient-focused, comprehensive care and is available for appointments through Prescripto.`,
                    available: true,
                    fee,
                    address: { line1: `${17 + index * 10}th Cross, Richmond`, line2: 'Circle, Ring Road, London' },
                    date: new Date(),
                },
            },
            upsert: true,
        },
    }));

    const result = await doctorModel.bulkWrite(operations);
    console.log(`Seeded ${doctorSeeds.length} doctors (created: ${result.upsertedCount}, updated: ${result.modifiedCount}).`);
    await mongoose.disconnect();
};

seedDoctors().catch(async (error) => {
    console.error('Doctor seeding failed:', error.message);
    await mongoose.disconnect();
    process.exit(1);
});
