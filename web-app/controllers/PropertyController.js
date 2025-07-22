const Property = require('../models/Property');
const Payer = require('../models/Payer');
const Invoice = require('../models/Invoice');

class PropertyController {
    static async index(req, res) {
        try {
            const userId = req.session.userId;
            const { page = 1, limit = 12, search, type, owner, status } = req.query;

            // Build filter options
            const filters = { createdBy: userId };
            
            if (search) {
                filters.search = search;
            }
            
            if (type) {
                filters.type = type;
            }
            
            if (owner) {
                filters.owner = owner;
            }
            
            if (status) {
                filters.paymentStatus = status;
            }

            // Get properties with pagination
            const result = await Property.findWithFilters(filters, {
                page: parseInt(page),
                limit: parseInt(limit),
                include: ['owner']
            });

            // Get additional data for each property
            for (let property of result.data) {
                const owner = await Payer.findById(property.ownerId);
                const invoices = await Invoice.findByPropertyId(property.id);
                
                property.owner = owner?.toJSON();
                property.invoicesCount = invoices.length;
                property.totalInvoiceAmount = invoices.reduce((sum, inv) => sum + inv.amountDue, 0);
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
            console.error('Get properties error:', error);
            res.status(500).json({
                success: false,
                message: 'Error loading properties'
            });
        }
    }

    static async show(req, res) {
        try {
            const { id } = req.params;
            const userId = req.session.userId;

            const property = await Property.findById(id);
            
            if (!property) {
                return res.status(404).json({
                    success: false,
                    message: 'Property not found'
                });
            }

            // Verify ownership through the property owner
            const owner = await Payer.findById(property.ownerId);
            if (!owner || owner.createdBy !== userId) {
                return res.status(403).json({
                    success: false,
                    message: 'Access denied'
                });
            }

            // Get related data
            const invoices = await Invoice.findByPropertyId(id);

            res.json({
                success: true,
                data: {
                    property: property.toJSON(),
                    owner: owner.toJSON(),
                    invoices: invoices.map(i => i.toJSON()),
                    stats: {
                        totalInvoices: invoices.length,
                        totalAmountDue: invoices.reduce((sum, inv) => sum + inv.amountDue, 0),
                        paidInvoices: invoices.filter(inv => inv.status === 'paid').length,
                        pendingInvoices: invoices.filter(inv => inv.status === 'pending').length,
                        overdueInvoices: invoices.filter(inv => inv.isOverdue()).length
                    }
                }
            });

        } catch (error) {
            console.error('Get property error:', error);
            res.status(500).json({
                success: false,
                message: 'Error loading property'
            });
        }
    }

    static async create(req, res) {
        try {
            const userId = req.session.userId;
            const { 
                propertyRefNo, 
                address, 
                geolocation, 
                assessPayment, 
                paymentExpiryDate, 
                type, 
                notes, 
                images, 
                ownerId 
            } = req.body;

            // Validate required fields
            if (!propertyRefNo || !address || !ownerId) {
                return res.status(400).json({
                    success: false,
                    message: 'Property reference number, address, and owner are required'
                });
            }

            // Verify owner exists and belongs to user
            const owner = await Payer.findById(ownerId);
            if (!owner || owner.createdBy !== userId) {
                return res.status(404).json({
                    success: false,
                    message: 'Owner not found'
                });
            }

            // Check if property reference number already exists
            const existingProperty = await Property.findByRefNo(propertyRefNo);
            if (existingProperty) {
                return res.status(400).json({
                    success: false,
                    message: 'A property with this reference number already exists'
                });
            }

            // Create property
            const propertyData = {
                propertyRefNo,
                address,
                geolocation,
                assessPayment: assessPayment ? parseFloat(assessPayment) : null,
                paymentExpiryDate,
                type,
                notes,
                images: images ? JSON.stringify(images) : null,
                ownerId,
                lastModifiedDate: new Date()
            };

            const newProperty = await Property.create(propertyData);

            // Update owner to mark as property owner if not already
            if (!owner.propertyOwner) {
                await owner.update({ propertyOwner: true });
            }

            res.status(201).json({
                success: true,
                message: 'Property created successfully',
                data: newProperty.toJSON()
            });

        } catch (error) {
            console.error('Create property error:', error);
            res.status(500).json({
                success: false,
                message: 'Error creating property'
            });
        }
    }

    static async update(req, res) {
        try {
            const { id } = req.params;
            const userId = req.session.userId;
            const updateData = req.body;

            const property = await Property.findById(id);
            
            if (!property) {
                return res.status(404).json({
                    success: false,
                    message: 'Property not found'
                });
            }

            // Verify ownership
            const owner = await Payer.findById(property.ownerId);
            if (!owner || owner.createdBy !== userId) {
                return res.status(403).json({
                    success: false,
                    message: 'Access denied'
                });
            }

            // If property reference number is being updated, check for duplicates
            if (updateData.propertyRefNo && updateData.propertyRefNo !== property.propertyRefNo) {
                const existingProperty = await Property.findByRefNo(updateData.propertyRefNo);
                if (existingProperty && existingProperty.id !== id) {
                    return res.status(400).json({
                        success: false,
                        message: 'A property with this reference number already exists'
                    });
                }
            }

            // Handle images if provided
            if (updateData.images) {
                updateData.images = JSON.stringify(updateData.images);
            }

            // Update property
            updateData.lastModifiedDate = new Date();
            const updatedProperty = await property.update(updateData);

            res.json({
                success: true,
                message: 'Property updated successfully',
                data: updatedProperty.toJSON()
            });

        } catch (error) {
            console.error('Update property error:', error);
            res.status(500).json({
                success: false,
                message: 'Error updating property'
            });
        }
    }

    static async delete(req, res) {
        try {
            const { id } = req.params;
            const userId = req.session.userId;

            const property = await Property.findById(id);
            
            if (!property) {
                return res.status(404).json({
                    success: false,
                    message: 'Property not found'
                });
            }

            // Verify ownership
            const owner = await Payer.findById(property.ownerId);
            if (!owner || owner.createdBy !== userId) {
                return res.status(403).json({
                    success: false,
                    message: 'Access denied'
                });
            }

            // Check if property has associated invoices
            const invoices = await Invoice.findByPropertyId(id);
            if (invoices.length > 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Cannot delete property with existing invoices'
                });
            }

            await property.delete();

            res.json({
                success: true,
                message: 'Property deleted successfully'
            });

        } catch (error) {
            console.error('Delete property error:', error);
            res.status(500).json({
                success: false,
                message: 'Error deleting property'
            });
        }
    }

    static async getPropertyInvoices(req, res) {
        try {
            const { id } = req.params;
            const userId = req.session.userId;
            const { page = 1, limit = 10 } = req.query;

            const property = await Property.findById(id);
            
            if (!property) {
                return res.status(404).json({
                    success: false,
                    message: 'Property not found'
                });
            }

            // Verify ownership
            const owner = await Payer.findById(property.ownerId);
            if (!owner || owner.createdBy !== userId) {
                return res.status(403).json({
                    success: false,
                    message: 'Access denied'
                });
            }

            const result = await Invoice.findByPropertyId(id, {
                page: parseInt(page),
                limit: parseInt(limit),
                orderBy: 'date DESC'
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
            console.error('Get property invoices error:', error);
            res.status(500).json({
                success: false,
                message: 'Error loading property invoices'
            });
        }
    }

    static async renderIndex(req, res) {
        try {
            res.render('properties/index', {
                title: 'Properties',
                user: req.session.user
            });
        } catch (error) {
            console.error('Render properties error:', error);
            res.status(500).render('error', {
                message: 'Error loading properties page'
            });
        }
    }

    static async renderShow(req, res) {
        try {
            const { id } = req.params;
            const userId = req.session.userId;

            const property = await Property.findById(id);
            
            if (!property) {
                return res.status(404).render('error', {
                    message: 'Property not found'
                });
            }

            // Verify ownership
            const owner = await Payer.findById(property.ownerId);
            if (!owner || owner.createdBy !== userId) {
                return res.status(403).render('error', {
                    message: 'Access denied'
                });
            }

            res.render('properties/show', {
                title: `Property - ${property.propertyRefNo}`,
                user: req.session.user,
                property: property.toJSON(),
                owner: owner.toJSON()
            });

        } catch (error) {
            console.error('Render property show error:', error);
            res.status(500).render('error', {
                message: 'Error loading property page'
            });
        }
    }

    static async renderNew(req, res) {
        try {
            res.render('properties/new', {
                title: 'New Property',
                user: req.session.user
            });
        } catch (error) {
            console.error('Render new property error:', error);
            res.status(500).render('error', {
                message: 'Error loading new property page'
            });
        }
    }

    static async renderEdit(req, res) {
        try {
            const { id } = req.params;
            const userId = req.session.userId;

            const property = await Property.findById(id);
            
            if (!property) {
                return res.status(404).render('error', {
                    message: 'Property not found'
                });
            }

            // Verify ownership
            const owner = await Payer.findById(property.ownerId);
            if (!owner || owner.createdBy !== userId) {
                return res.status(403).render('error', {
                    message: 'Access denied'
                });
            }

            res.render('properties/edit', {
                title: 'Edit Property',
                user: req.session.user,
                property: property.toJSON(),
                owner: owner.toJSON()
            });

        } catch (error) {
            console.error('Render edit property error:', error);
            res.status(500).render('error', {
                message: 'Error loading edit property page'
            });
        }
    }
}

module.exports = PropertyController;