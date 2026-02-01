const passport = require('passport');

// Middleware to authenticate JWT token
const authenticateJWT = (req, res, next) => {
    passport.authenticate('jwt', { session: false }, (err, user, info) => {
        if (err) {
            return res.status(500).json({ message: 'Authentication error' });
        }
        if (!user) {
            return res.status(401).json({ message: 'Unauthorized: Invalid or missing token' });
        }
        req.user = user;
        next();
    })(req, res, next);
};

// Middleware to check if user has required role
const authorizeRole = (...allowedRoles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ message: 'Unauthorized: User not authenticated' });
        }

        if (!allowedRoles.includes(req.user.role)) {
            return res.status(403).json({
                message: 'Forbidden: You do not have permission to access this resource'
            });
        }

        next();
    };
};

module.exports = {
    authenticateJWT,
    authorizeRole
};
