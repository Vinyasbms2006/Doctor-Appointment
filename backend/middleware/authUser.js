import jwt from 'jsonwebtoken'

const authUser = async (req, res, next) => {
    try {
        const headerToken = req.headers.token || req.headers.authorization
        const token = headerToken?.startsWith('Bearer ') ? headerToken.slice(7) : headerToken
        if (!token) {
            return res.status(401).json({ success: false, message: 'Not authorized. Please log in again.' })
        }
        const token_decode = jwt.verify(token, process.env.JWT_SECRET || 'secret123')
        req.userId = token_decode.id
        next()
    } catch (error) {
        console.log(error)
        res.status(401).json({ success: false, message: 'Invalid or expired session. Please log in again.' })
    }
}

export default authUser
