const session = require('express-session');
const pgSession = require('connect-pg-simple')(session);
const { pool } = require('./database');

const sessionConfig = {
    store: new pgSession({
        pool: pool,
        tableName: 'user_sessions',
        createTableIfMissing: true
    }),
    name: 'caltrac.sid',
    secret: process.env.SESSION_SECRET || 'your-super-secret-session-key',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000, // 24 hours
        sameSite: 'lax'
    },
    rolling: true // Reset expiry on activity
};

// Session middleware
const sessionMiddleware = session(sessionConfig);

// Authentication middleware
const requireAuth = (req, res, next) => {
    if (req.session && req.session.userId) {
        return next();
    } else {
        if (req.xhr || req.headers.accept.indexOf('json') > -1) {
            return res.status(401).json({
                success: false,
                message: 'Authentication required'
            });
        }
        return res.redirect('/login');
    }
};

// Optional authentication middleware (doesn't redirect)
const optionalAuth = (req, res, next) => {
    // Just pass through, authentication is optional
    next();
};

// Admin only middleware
const requireAdmin = (req, res, next) => {
    if (req.session && req.session.user && req.session.user.role === 'admin') {
        return next();
    } else {
        if (req.xhr || req.headers.accept.indexOf('json') > -1) {
            return res.status(403).json({
                success: false,
                message: 'Admin access required'
            });
        }
        return res.redirect('/dashboard');
    }
};

// Middleware to add user data to locals for templates
const addUserToLocals = (req, res, next) => {
    res.locals.user = req.session.user || null;
    res.locals.isAuthenticated = !!req.session.userId;
    next();
};

module.exports = {
    sessionMiddleware,
    requireAuth,
    optionalAuth,
    requireAdmin,
    addUserToLocals
};