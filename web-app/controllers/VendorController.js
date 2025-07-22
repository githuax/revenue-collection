const Payer = require('../models/Payer');
const Property = require('../models/Property');
const Payment = require('../models/Payment');
const Invoice = require('../models/Invoice');

class VendorController {
    static async index(req, res) {
        try {
            const userId = req.session.userId;
            const { page = 1, limit = 12, search, businessType, location } = req.query;

            // Build filter options
            const filters = { 
                createdBy: userId,
                vendor: true // Only get vendors
            };
            
            if (search) {
                filters.search = search;
            }
            
            if (businessType) {
                filters.businessType = businessType;
            }
            
            if (location) {
                filters.location = location;
            }

            // Get vendors with pagination
            const result = await Payer.findWithFilters(filters, {
                page: parseInt(page),
                limit: parseInt(limit)
            });

            // Get additional data for each vendor
            for (let vendor of result.data) {
                const properties = await Property.findByOwnerId(vendor.id);
                const lastPayment = await Payment.getLastPaymentByPayerId(vendor.id);
                
                vendor.propertiesCount = properties.length;
                vendor.lastPaymentDate = lastPayment?.createdDate || null;
            }

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
            console.error('Get vendors error:', error);
            res.status(500).json({
                success: false,
                message: 'Error loading vendors'
            });
        }
    }

    static async show(req, res) {
        try {
            const { id } = req.params;
            const userId = req.session.userId;

            const vendor = await Payer.findById(id);
            
            if (!vendor || vendor.createdBy !== userId || !vendor.vendor) {
                return res.status(404).json({
                    success: false,
                    message: 'Vendor not found'
                });
            }

            // Get related data
            const properties = await Property.findByOwnerId(id);
            const payments = await Payment.findByPayerId(id);
            const invoices = await Invoice.findByPayerId(id);

            res.json({
                success: true,
                data: {
                    vendor: vendor.toJSON(),
                    properties: properties.map(p => p.toJSON()),
                    payments: payments.map(p => p.toJSON()),
                    invoices: invoices.map(i => i.toJSON()),
                    stats: {
                        totalProperties: properties.length,
                        totalPayments: payments.length,
                        totalInvoices: invoices.length,
                        totalAmountPaid: payments.reduce((sum, p) => sum + p.amount, 0),
                        lastPaymentDate: payments.length > 0 ? Math.max(...payments.map(p => new Date(p.createdDate))) : null
                    }
                }
            });

        } catch (error) {
            console.error('Get vendor error:', error);
            res.status(500).json({
                success: false,
                message: 'Error loading vendor'
            });
        }
    }

    static async create(req, res) {
        try {
            const userId = req.session.userId;
            const { 
                firstName, 
                lastName, 
                companyName, 
                tin, 
                phone, 
                email, 
                businessType, 
                location, 
                notes 
            } = req.body;

            // Validate required fields
            if (!firstName || !lastName || !tin) {
                return res.status(400).json({
                    success: false,
                    message: 'First name, last name, and TIN are required'
                });
            }

            // Check if TIN already exists
            const existingVendor = await Payer.findByTIN(tin);
            if (existingVendor) {
                return res.status(400).json({
                    success: false,
                    message: 'A vendor with this TIN already exists'
                });
            }

            // Create vendor (payer with vendor flag)
            const vendorData = {
                firstName,
                lastName,
                companyName,
                tin,
                phone,
                email,
                vendor: true,
                propertyOwner: false,
                businessType,
                location,
                notes,
                createdBy: userId,
                createdAt: new Date(),
                updatedAt: new Date()
            };

            const newVendor = await Payer.create(vendorData);

            res.status(201).json({
                success: true,
                message: 'Vendor created successfully',
                data: newVendor.toJSON()
            });

        } catch (error) {
            console.error('Create vendor error:', error);
            res.status(500).json({
                success: false,
                message: 'Error creating vendor'
            });
        }
    }

    static async update(req, res) {
        try {
            const { id } = req.params;
            const userId = req.session.userId;
            const updateData = req.body;

            const vendor = await Payer.findById(id);
            
            if (!vendor || vendor.createdBy !== userId || !vendor.vendor) {
                return res.status(404).json({
                    success: false,
                    message: 'Vendor not found'
                });
            }

            // If TIN is being updated, check for duplicates
            if (updateData.tin && updateData.tin !== vendor.tin) {
                const existingVendor = await Payer.findByTIN(updateData.tin);
                if (existingVendor && existingVendor.id !== id) {
                    return res.status(400).json({
                        success: false,
                        message: 'A vendor with this TIN already exists'
                    });
                }
            }

            // Update vendor
            updateData.updatedAt = new Date();
            const updatedVendor = await vendor.update(updateData);

            res.json({
                success: true,
                message: 'Vendor updated successfully',
                data: updatedVendor.toJSON()
            });

        } catch (error) {
            console.error('Update vendor error:', error);
            res.status(500).json({
                success: false,
                message: 'Error updating vendor'
            });
        }
    }

    static async delete(req, res) {
        try {
            const { id } = req.params;
            const userId = req.session.userId;

            const vendor = await Payer.findById(id);
            
            if (!vendor || vendor.createdBy !== userId || !vendor.vendor) {
                return res.status(404).json({
                    success: false,
                    message: 'Vendor not found'
                });
            }

            // Check if vendor has associated properties or payments
            const properties = await Property.findByOwnerId(id);
            const payments = await Payment.findByPayerId(id);
            
            if (properties.length > 0 || payments.length > 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Cannot delete vendor with existing properties or payments'
                });
            }

            await vendor.delete();

            res.json({
                success: true,
                message: 'Vendor deleted successfully'
            });

        } catch (error) {
            console.error('Delete vendor error:', error);
            res.status(500).json({
                success: false,
                message: 'Error deleting vendor'
            });
        }
    }

    static async getVendorPayments(req, res) {
        try {
            const { id } = req.params;
            const userId = req.session.userId;
            const { page = 1, limit = 10 } = req.query;

            const vendor = await Payer.findById(id);
            
            if (!vendor || vendor.createdBy !== userId || !vendor.vendor) {
                return res.status(404).json({
                    success: false,
                    message: 'Vendor not found'
                });
            }

            const result = await Payment.findByPayerId(id, {
                page: parseInt(page),
                limit: parseInt(limit),
                orderBy: 'createdDate DESC'
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
            console.error('Get vendor payments error:', error);
            res.status(500).json({
                success: false,
                message: 'Error loading vendor payments'
            });
        }
    }

    static async renderIndex(req, res) {
        try {
            res.render('vendors/index', {
                title: 'Vendors',
                user: req.session.user
            });
        } catch (error) {
            console.error('Render vendors error:', error);
            res.status(500).render('error', {
                message: 'Error loading vendors page'
            });
        }
    }

    static async renderShow(req, res) {
        try {
            const { id } = req.params;
            const userId = req.session.userId;

            const vendor = await Payer.findById(id);
            
            if (!vendor || vendor.createdBy !== userId || !vendor.vendor) {
                return res.status(404).render('error', {
                    message: 'Vendor not found'
                });
            }

            res.render('vendors/show', {
                title: `Vendor - ${vendor.displayName}`,
                user: req.session.user,
                vendor: vendor.toJSON()
            });

        } catch (error) {
            console.error('Render vendor show error:', error);
            res.status(500).render('error', {
                message: 'Error loading vendor page'
            });
        }
    }

    static async renderNew(req, res) {
        try {
            res.render('vendors/new', {
                title: 'New Vendor',
                user: req.session.user
            });
        } catch (error) {
            console.error('Render new vendor error:', error);
            res.status(500).render('error', {
                message: 'Error loading new vendor page'
            });
        }
    }

    static async renderEdit(req, res) {
        try {
            const { id } = req.params;
            const userId = req.session.userId;

            const vendor = await Payer.findById(id);
            
            if (!vendor || vendor.createdBy !== userId || !vendor.vendor) {
                return res.status(404).render('error', {
                    message: 'Vendor not found'
                });
            }

            res.render('vendors/edit', {
                title: 'Edit Vendor',
                user: req.session.user,
                vendor: vendor.toJSON()
            });

        } catch (error) {
            console.error('Render edit vendor error:', error);
            res.status(500).render('error', {
                message: 'Error loading edit vendor page'
            });
        }
    }
}

module.exports = VendorController;