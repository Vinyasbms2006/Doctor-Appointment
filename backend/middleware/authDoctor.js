import jwt from 'jsonwebtoken';

const authDoctor = (req, res, next) => {
    try {
        const headerToken = req.headers.token || req.headers.authorization;
        const token = headerToken?.startsWith('Bearer ') ? headerToken.slice(7) : headerToken;
        if (!token) return res.status(401).json({ success: false, message: 'Not authorized. Please log in.' });

        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret123');
        if (decoded.role !== 'doctor') return res.status(403).json({ success: false, message: 'Doctor access is required.' });
        req.docId = decoded.id;
        next();
    } catch {
        res.status(401).json({ success: false, message: 'Invalid or expired session. Please log in again.' });
    }
};

export default authDoctor;
