class User {
    constructor(id, firstName, lastName, email, phone, role, createdAt, updatedAt) {
        this.id = id;
        this.firstName = firstName;
        this.lastName = lastName;
        this.email = email;
        this.phone = phone;
        this.role = role;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    get fullName() {
        return `${this.firstName} ${this.lastName}`;
    }

    static async findById(id) {
        // Database query to find user by ID
    }

    static async findByEmail(email) {
        // Database query to find user by email
    }

    static async create(userData) {
        // Database query to create new user
    }

    async update(userData) {
        // Database query to update user
    }

    async delete() {
        // Database query to delete user
    }

    toJSON() {
        return {
            id: this.id,
            firstName: this.firstName,
            lastName: this.lastName,
            fullName: this.fullName,
            email: this.email,
            phone: this.phone,
            role: this.role,
            createdAt: this.createdAt,
            updatedAt: this.updatedAt
        };
    }
}

module.exports = User;