const jwt = require('jsonwebtoken');



module.exports.adminaAuthMiddleware = (req, res, next) => {
    // Accept token from cookie OR Authorization header
    let token = req.cookies.access_token;
    if (!token && req.headers.authorization?.startsWith('Bearer ')) {
        token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
        return res.status(401).json({ error: 'Unauthorized Please login first !' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWt_SECRET_KEY);
        if (decoded) {
            req.id = decoded.id;
            req.role = decoded.role;
            next();
        } else {
            return res.status(401).json({ error: 'Unauthorized Please login first .. !' });
        }
    } catch (error) {
        return res.status(401).json({ error: 'Unauthorized Please login first .... !' });
    }
}
