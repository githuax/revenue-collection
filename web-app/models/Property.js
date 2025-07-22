class Property {
    constructor(id, propertyRefNo, address, geolocation, assessPayment, paymentExpiryDate, type, notes, images, ownerId, lastModifiedDate) {
        this.id = id;
        this.propertyRefNo = propertyRefNo;
        this.address = address;
        this.geolocation = geolocation;
        this.assessPayment = assessPayment;
        this.paymentExpiryDate = paymentExpiryDate;
        this.type = type;
        this.notes = notes;
        this.images = images;
        this.ownerId = ownerId;
        this.lastModifiedDate = lastModifiedDate;
    }

    static async findAll() {
        // Database query to get all properties
    }

    static async findById(id) {
        // Database query to find property by ID
    }

    static async findByOwnerId(ownerId) {
        // Database query to find properties by owner ID
    }

    static async findByRefNo(refNo) {
        // Database query to find property by reference number
    }

    static async create(propertyData) {
        // Database query to create new property
    }

    async update(propertyData) {
        // Database query to update property
    }

    async delete() {
        // Database query to delete property
    }

    async getOwner() {
        // Get the owner (payer) of this property
    }

    async getInvoices() {
        // Get all invoices related to this property
    }

    isPaymentExpired() {
        if (!this.paymentExpiryDate) return false;
        return new Date() > new Date(this.paymentExpiryDate);
    }

    toJSON() {
        return {
            id: this.id,
            propertyRefNo: this.propertyRefNo,
            address: this.address,
            geolocation: this.geolocation,
            assessPayment: this.assessPayment,
            paymentExpiryDate: this.paymentExpiryDate,
            type: this.type,
            notes: this.notes,
            images: this.images,
            ownerId: this.ownerId,
            lastModifiedDate: this.lastModifiedDate,
            isPaymentExpired: this.isPaymentExpired()
        };
    }
}

module.exports = Property;