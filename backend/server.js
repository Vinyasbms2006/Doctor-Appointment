import express from 'express'
import path from 'path'
import { fileURLToPath } from 'url'
import cors from 'cors'
import 'dotenv/config'
import connectDB  from './config/mongodb.js'
import connectCloudinary from './config/cloudnary.js'
import adminRouter from './routes/adminRoute.js'
import doctorRouter from './routes/doctorRoute.js'
import userRouter from './routes/userRoute.js'

// app config
const app = express()
const port = process.env.PORT || 4000
const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')

connectCloudinary()

// middlewares
app.use(express.json())
app.use(cors({ origin: process.env.FRONTEND_URL?.split(',') || true }))
app.use('/doctor-images', express.static(path.join(projectRoot, 'frontend', 'src', 'assets')))

// api endpoints
app.use('/api/admin',adminRouter)
app.use('/api/doctor',doctorRouter)
app.use('/api/user',userRouter)

app.get('/',(req,res)=>{
    res.json({ success: true, message: 'Prescripto API is running' })
})

app.use((req, res) => res.status(404).json({ success: false, message: 'Endpoint not found' }))

app.use((error, req, res, next) => {
    console.error(error)
    res.status(500).json({ success: false, message: 'Internal server error' })
})

connectDB()
    .then(() => app.listen(port,()=> console.log("server started",port)))
    .catch((error) => {
        console.error('Failed to start server:', error.message)
        process.exit(1)
    })
