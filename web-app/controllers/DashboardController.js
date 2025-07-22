const Payment = require('../models/Payment');
const Invoice = require('../models/Invoice');
const Payer = require('../models/Payer');
const Property = require('../models/Property');

class DashboardController {
    static async index(req, res) {
        try {
            const userId = req.session.userId;

            // Get dashboard statistics
            const stats = await Payment.getDashboardStats(userId);

            // Get recent payments
            const recentPayments = await Payment.findByCreatedBy(userId, { limit: 5, orderBy: 'createdDate DESC' });

            // Get pending invoices
            const pendingInvoices = await Invoice.findByCreatedBy(userId, { 
                status: 'pending', 
                limit: 5,
                orderBy: 'dueDate ASC'
            });

            res.json({
                success: true,
                data: {
                    stats,
                    recentPayments,
                    pendingInvoices
                }
            });

        } catch (error) {
            console.error('Dashboard error:', error);
            res.status(500).json({
                success: false,
                message: 'Error loading dashboard data'
            });
        }
    }

    static async getStats(req, res) {
        try {
            const userId = req.session.userId;
            const { period } = req.query; // today, week, month, all

            let stats = {};

            switch (period) {
                case 'today':
                    stats = await Payment.getTodayPayments(userId);
                    break;
                case 'week':
                    stats = await Payment.getWeekPayments(userId);
                    break;
                case 'month':
                    stats = await Payment.getMonthPayments(userId);
                    break;
                default:
                    stats = await Payment.getDashboardStats(userId);
            }

            res.json({
                success: true,
                data: stats
            });

        } catch (error) {
            console.error('Get stats error:', error);
            res.status(500).json({
                success: false,
                message: 'Error loading statistics'
            });
        }
    }

    static async getRecentActivity(req, res) {
        try {
            const userId = req.session.userId;
            const { limit = 10 } = req.query;

            // Get recent payments with payer information
            const recentPayments = await Payment.findByCreatedBy(userId, {
                limit: parseInt(limit),
                orderBy: 'createdDate DESC',
                include: ['payer']
            });

            // Get recent invoices
            const recentInvoices = await Invoice.findByCreatedBy(userId, {
                limit: parseInt(limit),
                orderBy: 'date DESC',
                include: ['payer']
            });

            res.json({
                success: true,
                data: {
                    payments: recentPayments,
                    invoices: recentInvoices
                }
            });

        } catch (error) {
            console.error('Get recent activity error:', error);
            res.status(500).json({
                success: false,
                message: 'Error loading recent activity'
            });
        }
    }

    static async getOverview(req, res) {
        try {
            const userId = req.session.userId;

            // Get counts for different entities
            const totalPayers = await Payer.countByCreatedBy(userId);
            const totalProperties = await Property.countByCreatedBy(userId);
            const totalInvoices = await Invoice.countByCreatedBy(userId);
            const totalPayments = await Payment.countByCreatedBy(userId);

            // Get overdue invoices
            const overdueInvoices = await Invoice.findByCreatedBy(userId, {
                isOverdue: true
            });

            // Get payment status breakdown
            const paymentStatusBreakdown = await Payment.getStatusBreakdown(userId);

            res.json({
                success: true,
                data: {
                    totals: {
                        payers: totalPayers,
                        properties: totalProperties,
                        invoices: totalInvoices,
                        payments: totalPayments
                    },
                    overdueInvoices: overdueInvoices.length,
                    paymentStatusBreakdown
                }
            });

        } catch (error) {
            console.error('Get overview error:', error);
            res.status(500).json({
                success: false,
                message: 'Error loading overview data'
            });
        }
    }

    static async renderDashboard(req, res) {
        try {
            // Render the dashboard view
            res.render('dashboard/index', {
                title: 'Dashboard',
                user: req.session.user
            });

        } catch (error) {
            console.error('Render dashboard error:', error);
            res.status(500).render('error', {
                message: 'Error loading dashboard'
            });
        }
    }
}

module.exports = DashboardController;