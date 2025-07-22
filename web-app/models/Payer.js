class Payer {
    constructor(id, firstName, lastName, companyName, tin, phone, email, vendor, propertyOwner, businessType, lastPaymentDate, notes, createdBy, location, createdAt, updatedAt) {
        this.id = id;
        this.firstName = firstName;
        this.lastName = lastName;
        this.companyName = companyName;
        this.tin = tin;
        this.phone = phone;
        this.email = email;
        this.vendor = vendor;
        this.propertyOwner = propertyOwner;
        this.businessType = businessType;
        this.lastPaymentDate = lastPaymentDate;
        this.notes = notes;
        this.createdBy = createdBy;
        this.location = location;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    get fullName() {
        return `${this.firstName} ${this.lastName}`;
    }

    get displayName() {
        return this.companyName || this.fullName;
    }

    static async findAll() {
        // Database query to get all payers
    }

    static async findById(id) {
        // Database query to find payer by ID
    }

    static async findByTIN(tin) {
        // Database query to find payer by TIN
    }

    static async findByCreatedBy(userId) {
        // Database query to find payers created by specific user
    }

    static async create(payerData) {
        // Database query to create new payer
    }

    async update(payerData) {
        // Database query to update payer
    }

    async delete() {
        // Database query to delete payer
    }

    async getProperties() {
        // Get all properties owned by this payer
    }

    async getInvoices() {
        // Get all invoices for this payer
    }

    async getPayments() {
        // Get all payments made by this payer
    }

    toJSON() {
        return {
            id: this.id,
            firstName: this.firstName,
            lastName: this.lastName,
            fullName: this.fullName,
            displayName: this.displayName,
            companyName: this.companyName,
            tin: this.tin,
            phone: this.phone,
            email: this.email,
            vendor: this.vendor,
            propertyOwner: this.propertyOwner,
            businessType: this.businessType,
            lastPaymentDate: this.lastPaymentDate,
            notes: this.notes,
            createdBy: this.createdBy,
            location: this.location,
            createdAt: this.createdAt,
            updatedAt: this.updatedAt
        };
    }
}

module.exports = Payer;