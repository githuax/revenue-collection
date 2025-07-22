const express = require('express');
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

// Authentication API routes
router.post('/api/auth/login', AuthController.login);
router.post('/api/auth/register', AuthController.register);
router.post('/api/auth/logout', AuthController.logout);
router.get('/api/auth/profile', requireAuth, AuthController.getProfile);
router.put('/api/auth/profile', requireAuth, AuthController.updateProfile);
router.put('/api/auth/password', requireAuth, AuthController.changePassword);

// Protected page routes
router.get('/dashboard', requireAuth, DashboardController.renderDashboard);
router.get('/payments', requireAuth, PaymentController.renderIndex);
router.get('/payments/new', requireAuth, PaymentController.renderNew);
router.get('/payments/:id/edit', requireAuth, PaymentController.renderEdit);
router.get('/vendors', requireAuth, VendorController.renderIndex);
router.get('/vendors/new', requireAuth, VendorController.renderNew);
router.get('/vendors/:id', requireAuth, VendorController.renderShow);
router.get('/vendors/:id/edit', requireAuth, VendorController.renderEdit);
router.get('/properties', requireAuth, PropertyController.renderIndex);
router.get('/properties/new', requireAuth, PropertyController.renderNew);
router.get('/properties/:id', requireAuth, PropertyController.renderShow);
router.get('/properties/:id/edit', requireAuth, PropertyController.renderEdit);

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