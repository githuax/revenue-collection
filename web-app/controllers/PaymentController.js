const Payment = require('../models/Payment');
const Payer = require('../models/Payer');
const Invoice = require('../models/Invoice');

class PaymentController {
    static async index(req, res) {
        try {
            const userId = req.session.userId;
            const { page = 1, limit = 10, search, status, dateFrom, dateTo } = req.query;

            // Build filter options
            const filters = { createdBy: userId };
            
            if (search) {
                filters.search = search;
            }
            
            if (status) {
                filters.status = status;
            }
            
            if (dateFrom) {
                filters.dateFrom = dateFrom;
            }
            
            if (dateTo) {
                filters.dateTo = dateTo;
            }

            // Get payments with pagination
            const result = await Payment.findWithFilters(filters, {
                page: parseInt(page),
                limit: parseInt(limit),
                include: ['payer', 'invoice']
            });

            res.json({
                success: true,
                data: result.data,
                pagination: {
                    current: result.page,
                    pages: result.pages,
                    total: result.total,
                    limit: result.limit
                }
            });

        } catch (error) {
            console.error('Get payments error:', error);
            res.status(500).json({
                success: false,
                message: 'Error loading payments'
            });
        }
    }

    static async show(req, res) {
        try {
            const { id } = req.params;
            const userId = req.session.userId;

            const payment = await Payment.findById(id);
            
            if (!payment || payment.createdBy !== userId) {
                return res.status(404).json({
                    success: false,
                    message: 'Payment not found'
                });
            }

            // Get related data
            const payer = await payment.getPayer();
            const invoice = await payment.getInvoice();

            res.json({
                success: true,
                data: {
                    payment: payment.toJSON(),
                    payer: payer?.toJSON(),
                    invoice: invoice?.toJSON()
                }
            });

        } catch (error) {
            console.error('Get payment error:', error);
            res.status(500).json({
                success: false,
                message: 'Error loading payment'
            });
        }
    }

    static async create(req, res) {
        try {
            const userId = req.session.userId;
            const { 
                amount, 
                paymentType, 
                paymentMethod, 
                location, 
                invoiceId, 
                payerId, 
                notes 
            } = req.body;

            // Validate required fields
            if (!amount || !paymentType || !paymentMethod || !payerId) {
                return res.status(400).json({
                    success: false,
                    message: 'Amount, payment type, payment method, and payer are required'
                });
            }

            // Verify payer exists and belongs to user
            const payer = await Payer.findById(payerId);
            if (!payer || payer.createdBy !== userId) {
                return res.status(404).json({
                    success: false,
                    message: 'Payer not found'
                });
            }

            // If invoice is provided, verify it exists
            let invoice = null;
            if (invoiceId) {
                invoice = await Invoice.findById(invoiceId);
                if (!invoice || invoice.createdBy !== userId) {
                    return res.status(404).json({
                        success: false,
                        message: 'Invoice not found'
                    });
                }
            }

            // Generate reference number
            const refNo = await Payment.generateRefNo();

            // Create payment
            const paymentData = {
                amount: parseFloat(amount),
                paymentType,
                paymentMethod,
                location,
                invoice: invoiceId,
                status: 'completed',
                notes,
                createdBy: userId,
                payerId,
                refNo,
                createdDate: new Date(),
                lastModifiedDate: new Date()
            };

            const newPayment = await Payment.create(paymentData);

            // If payment is for an invoice, update invoice status if fully paid
            if (invoice) {
                const totalPaid = await invoice.getTotalPaid();
                if (totalPaid >= invoice.amountDue) {
                    await invoice.update({ status: 'paid' });
                }
            }

            res.status(201).json({
                success: true,
                message: 'Payment created successfully',
                data: newPayment.toJSON()
            });

        } catch (error) {
            console.error('Create payment error:', error);
            res.status(500).json({
                success: false,
                message: 'Error creating payment'
            });
        }
    }

    static async update(req, res) {
        try {
            const { id } = req.params;
            const userId = req.session.userId;
            const updateData = req.body;

            const payment = await Payment.findById(id);
            
            if (!payment || payment.createdBy !== userId) {
                return res.status(404).json({
                    success: false,
                    message: 'Payment not found'
                });
            }

            // Update payment
            updateData.lastModifiedDate = new Date();
            const updatedPayment = await payment.update(updateData);

            res.json({
                success: true,
                message: 'Payment updated successfully',
                data: updatedPayment.toJSON()
            });

        } catch (error) {
            console.error('Update payment error:', error);
            res.status(500).json({
                success: false,
                message: 'Error updating payment'
            });
        }
    }

    static async delete(req, res) {
        try {
            const { id } = req.params;
            const userId = req.session.userId;

            const payment = await Payment.findById(id);
            
            if (!payment || payment.createdBy !== userId) {
                return res.status(404).json({
                    success: false,
                    message: 'Payment not found'
                });
            }

            await payment.delete();

            res.json({
                success: true,
                message: 'Payment deleted successfully'
            });

        } catch (error) {
            console.error('Delete payment error:', error);
            res.status(500).json({
                success: false,
                message: 'Error deleting payment'
            });
        }
    }

    static async renderIndex(req, res) {
        try {
            res.render('payments/index', {
                title: 'Payments',
                user: req.session.user
            });
        } catch (error) {
            console.error('Render payments error:', error);
            res.status(500).render('error', {
                message: 'Error loading payments page'
            });
        }
    }

    static async renderNew(req, res) {
        try {
            res.render('payments/new', {
                title: 'New Payment',
                user: req.session.user
            });
        } catch (error) {
            console.error('Render new payment error:', error);
            res.status(500).render('error', {
                message: 'Error loading new payment page'
            });
        }
    }

    static async renderEdit(req, res) {
        try {
            const { id } = req.params;
            const userId = req.session.userId;

            const payment = await Payment.findById(id);
            
            if (!payment || payment.createdBy !== userId) {
                return res.status(404).render('error', {
                    message: 'Payment not found'
                });
            }

            res.render('payments/edit', {
                title: 'Edit Payment',
                user: req.session.user,
                payment: payment.toJSON()
            });

        } catch (error) {
            console.error('Render edit payment error:', error);
            res.status(500).render('error', {
                message: 'Error loading edit payment page'
            });
        }
    }
}

module.exports = PaymentController;