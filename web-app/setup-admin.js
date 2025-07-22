// Setup script to test database connection and create admin user
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

async function testConnection() {
    try {
        console.log('🔄 Testing database connection...');
        const client = await pool.connect();
        const result = await client.query('SELECT NOW()');
        console.log('✅ Database connection successful!');
        console.log('📅 Database time:', result.rows[0].now);
        client.release();
        return true;
    } catch (error) {
        console.error('❌ Database connection failed:', error.message);
        return false;
    }
}

async function createAdminUser() {
    try {
        console.log('🔄 Creating admin user...');
        
        // Check if admin user already exists
        const existingUser = await pool.query('SELECT id FROM users WHERE email = $1', ['admin@caltrac.com']);
        
        if (existingUser.rows.length > 0) {
            console.log('✅ Admin user already exists!');
            console.log('📧 Email: admin@caltrac.com');
            console.log('🔑 Password: admin123');
            return existingUser.rows[0].id;
        }
        
        // Hash password
        const password = 'admin123';
        const saltRounds = 12;
        const hashedPassword = await bcrypt.hash(password, saltRounds);
        
        // Create admin user
        const result = await pool.query(`
            INSERT INTO users (first_name, last_name, email, password, role)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING id, email, first_name, last_name, role
        `, ['Admin', 'User', 'admin@caltrac.com', hashedPassword, 'admin']);
        
        const user = result.rows[0];
        console.log('✅ Admin user created successfully!');
        console.log('👤 User ID:', user.id);
        console.log('📧 Email:', user.email);
        console.log('👨‍💼 Name:', user.first_name, user.last_name);
        console.log('🛡️ Role:', user.role);
        console.log('🔑 Password: admin123');
        
        return user.id;
        
    } catch (error) {
        console.error('❌ Error creating admin user:', error.message);
        throw error;
    }
}

async function createSampleData(userId) {
    try {
        console.log('🔄 Creating sample data...');
        
        // Create sample payer
        const payerResult = await pool.query(`
            INSERT INTO payers (first_name, last_name, company_name, tin, phone, email, vendor, property_owner, business_type, location, created_by)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
            RETURNING id, first_name, last_name, company_name
        `, ['John', 'Smith', 'Smith Enterprises', 'TIN123456789', '+1234567890', 'john@smithenterprises.com', true, true, 'business', 'Downtown Business District', userId]);
        
        const payer = payerResult.rows[0];
        console.log('✅ Sample payer created:', payer.first_name, payer.last_name, '(' + payer.company_name + ')');
        
        // Create sample property
        const propertyResult = await pool.query(`
            INSERT INTO properties (property_ref_no, address, assess_payment, type, notes, owner_id)
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING id, property_ref_no, address
        `, ['PROP-001', '123 Main Street, Business District', 2500.00, 'commercial', 'Sample commercial property', payer.id]);
        
        const property = propertyResult.rows[0];
        console.log('✅ Sample property created:', property.property_ref_no, '-', property.address);
        
        // Create sample invoice
        const invoiceResult = await pool.query(`
            INSERT INTO invoices (ref_no, amount_due, notes, payer_id, property_id, created_by)
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING id, ref_no, amount_due
        `, ['INV-20240122-0001', 2500.00, 'Q1 2024 property tax assessment', payer.id, property.id, userId]);
        
        const invoice = invoiceResult.rows[0];
        console.log('✅ Sample invoice created:', invoice.ref_no, '- $' + invoice.amount_due);
        
        // Create sample payment
        const paymentResult = await pool.query(`
            INSERT INTO payments (ref_no, amount, payment_method, payer_id, invoice_id, created_by)
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING id, ref_no, amount
        `, ['PAY-20240122-0001', 1000.00, 'bank_transfer', payer.id, invoice.id, userId]);
        
        const payment = paymentResult.rows[0];
        console.log('✅ Sample payment created:', payment.ref_no, '- $' + payment.amount);
        
    } catch (error) {
        console.error('❌ Error creating sample data:', error.message);
        // Don't throw here, sample data is optional
    }
}

async function main() {
    try {
        console.log('🚀 Cal-Trac Database Setup');
        console.log('========================\n');
        
        // Test connection
        const connectionOk = await testConnection();
        if (!connectionOk) {
            process.exit(1);
        }
        
        // Create admin user
        const userId = await createAdminUser();
        
        // Create sample data
        await createSampleData(userId);
        
        console.log('\n✅ Setup completed successfully!');
        console.log('\n🌐 You can now access the web application at: http://localhost:3000');
        console.log('📧 Login with: admin@caltrac.com');
        console.log('🔑 Password: admin123');
        
    } catch (error) {
        console.error('\n❌ Setup failed:', error.message);
        process.exit(1);
    } finally {
        await pool.end();
    }
}

main();