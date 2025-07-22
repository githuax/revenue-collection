class Invoice {
    constructor(id, date, amountDue, dueDate, notes, status, createdBy, payerId, propertyId, refNo, lastModifiedDate) {
        this.id = id;
        this.date = date;
        this.amountDue = amountDue;
        this.dueDate = dueDate;
        this.notes = notes;
        this.status = status;
        this.createdBy = createdBy;
        this.payerId = payerId;
        this.propertyId = propertyId;
        this.refNo = refNo;
        this.lastModifiedDate = lastModifiedDate;
    }

    static get STATUS() {
        return {
            PENDING: 'pending',
            PAID: 'paid',
            OVERDUE: 'overdue',
            CANCELLED: 'cancelled'
        };
    }

    static async findAll() {
        // Database query to get all invoices
    }

    static async findById(id) {
        // Database query to find invoice by ID
    }

    static async findByPayerId(payerId) {
        // Database query to find invoices by payer ID
    }

    static async findByPropertyId(propertyId) {
        // Database query to find invoices by property ID
    }

    static async findByRefNo(refNo) {
        // Database query to find invoice by reference number
    }

    static async findByCreatedBy(userId) {
        // Database query to find invoices created by specific user
    }

    static async create(invoiceData) {
        // Database query to create new invoice
    }

    async update(invoiceData) {
        // Database query to update invoice
    }

    async delete() {
        // Database query to delete invoice
    }

    async getPayer() {
        // Get the payer associated with this invoice
    }

    async getProperty() {
        // Get the property associated with this invoice
    }

    async getPayments() {
        // Get all payments made for this invoice
    }

    async getTotalPaid() {
        // Calculate total amount paid for this invoice
        const payments = await this.getPayments();
        return payments.reduce((total, payment) => total + payment.amount, 0);
    }

    async getAmountRemaining() {
        // Calculate remaining amount to be paid
        const totalPaid = await this.getTotalPaid();
        return this.amountDue - totalPaid;
    }

    isOverdue() {
        if (!this.dueDate) return false;
        return new Date() > new Date(this.dueDate) && this.status !== Invoice.STATUS.PAID;
    }

    isPaid() {
        return this.status === Invoice.STATUS.PAID;
    }

    toJSON() {
        return {
            id: this.id,
            date: this.date,
            amountDue: this.amountDue,
            dueDate: this.dueDate,
            notes: this.notes,
            status: this.status,
            createdBy: this.createdBy,
            payerId: this.payerId,
            propertyId: this.propertyId,
            refNo: this.refNo,
            lastModifiedDate: this.lastModifiedDate,
            isOverdue: this.isOverdue(),
            isPaid: this.isPaid()
        };
    }
}

module.exports = Invoice;