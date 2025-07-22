const express = require('express');
const path = require('path');
const router = express.Router();
const { requireAuth, optionalAuth } = require('../config/session');

// Import controllers
const AuthController = require('../controllers/AuthController');
const DashboardController = require('../controllers/DashboardController');
const PaymentController = require('../controllers/PaymentController');
const VendorController = require('../controllers/VendorController');
const PropertyController = require('../controllers/PropertyController');

// Public routes
router.get('/login', (req, res) => {
    if (req.session.userId) {
        return res.redirect('/dashboard');
    }
    res.sendFile(path.join(__dirname, '../views/auth/login.html'));
});

router.get('/', (req, res) => {
    if (req.session.userId) {
        return res.redirect('/dashboard');
    }
    res.redirect('/login');
});

// Test route
router.get('/test', (req, res) => {
    res.json({ 
        message: 'Cal-Trac Web Application is running!', 
        timestamp: new Date().toISOString(),
        session: req.session ? 'Session available' : 'No session'
    });
});

// Simple HTML test route
router.get('/simple', (req, res) => {
    res.send(`
        <html>
            <head>
                <title>Cal-Trac Test</title>
                <style>body { font-family: Arial, sans-serif; margin: 40px; }</style>
            </head>
            <body>
                <h1>🚀 Cal-Trac Web Application</h1>
                <p><strong>Status:</strong> Running Successfully!</p>
                <p><strong>Time:</strong> ${new Date().toISOString()}</p>
                <p><strong>Session:</strong> ${req.session ? 'Available' : 'Not Available'}</p>
                <hr>
                <ul>
                    <li><a href="/test">Test API Endpoint</a></li>
                    <li><a href="/login">Login Page</a></li>
                    <li><a href="/health">Health Check</a></li>
                </ul>
            </body>
        </html>
    `);
});

// Authentication API routes
router.post('/api/auth/login', AuthController.login);
router.post('/api/auth/register', AuthController.register);
router.post('/api/auth/logout', AuthController.logout);
router.get('/api/auth/profile', requireAuth, AuthController.getProfile);
router.put('/api/auth/profile', requireAuth, AuthController.updateProfile);
router.put('/api/auth/password', requireAuth, AuthController.changePassword);

// Protected page routes (using direct HTML files for now)
router.get('/dashboard', requireAuth, (req, res) => {
    res.renderWithLayout('dashboard/index', {
        title: 'Dashboard',
        user_name: req.session.user?.first_name || 'User'
    });
});

router.get('/payments', requireAuth, (req, res) => {
    res.renderWithLayout('payments/index', {
        title: 'Payments',
        user_name: req.session.user?.first_name || 'User'
    });
});

router.get('/vendors', requireAuth, (req, res) => {
    res.renderWithLayout('vendors/index', {
        title: 'Vendors',
        user_name: req.session.user?.first_name || 'User'
    });
});

router.get('/properties', requireAuth, (req, res) => {
    res.renderWithLayout('properties/index', {
        title: 'Properties',
        user_name: req.session.user?.first_name || 'User'
    });
});

// Dashboard API routes
router.get('/api/dashboard', requireAuth, DashboardController.index);
router.get('/api/dashboard/stats', requireAuth, DashboardController.getStats);
router.get('/api/dashboard/activity', requireAuth, DashboardController.getRecentActivity);
router.get('/api/dashboard/overview', requireAuth, DashboardController.getOverview);

// Payment API routes
router.get('/api/payments', requireAuth, PaymentController.index);
router.get('/api/payments/:id', requireAuth, PaymentController.show);
router.post('/api/payments', requireAuth, PaymentController.create);
router.put('/api/payments/:id', requireAuth, PaymentController.update);
router.delete('/api/payments/:id', requireAuth, PaymentController.delete);

// Vendor API routes
router.get('/api/vendors', requireAuth, VendorController.index);
router.get('/api/vendors/:id', requireAuth, VendorController.show);
router.post('/api/vendors', requireAuth, VendorController.create);
router.put('/api/vendors/:id', requireAuth, VendorController.update);
router.delete('/api/vendors/:id', requireAuth, VendorController.delete);
router.get('/api/vendors/:id/payments', requireAuth, VendorController.getVendorPayments);

// Property API routes
router.get('/api/properties', requireAuth, PropertyController.index);
router.get('/api/properties/:id', requireAuth, PropertyController.show);
router.post('/api/properties', requireAuth, PropertyController.create);
router.put('/api/properties/:id', requireAuth, PropertyController.update);
router.delete('/api/properties/:id', requireAuth, PropertyController.delete);
router.get('/api/properties/:id/invoices', requireAuth, PropertyController.getPropertyInvoices);

// Error handling
router.use((err, req, res, next) => {
    console.error('Route error:', err);
    
    if (req.xhr || req.headers.accept.indexOf('json') > -1) {
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    } else {
        res.status(500).render('error', {
            message: 'Internal server error'
        });
    }
});

// 404 handler
router.use((req, res) => {
    if (req.xhr || req.headers.accept.indexOf('json') > -1) {
        res.status(404).json({
            success: false,
            message: 'Not found'
        });
    } else {
        res.status(404).render('error', {
            message: 'Page not found'
        });
    }
});

module.exports = router;