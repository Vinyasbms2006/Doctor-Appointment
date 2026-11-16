import multer from 'multer';
import path from 'path';
import crypto from 'crypto';

const storage = multer.diskStorage({
    filename : function(req, file, cb) {
        cb(null, `${crypto.randomUUID()}${path.extname(file.originalname)}`)
    }
})


const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (req, file, cb) => cb(null, file.mimetype.startsWith('image/')),
})

export default upload;
