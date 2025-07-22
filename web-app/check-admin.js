const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

async function checkAdmin() {
    try {
        console.log('🔄 Checking admin user...');
        const result = await pool.query('SELECT id, email, first_name, last_name, role FROM users WHERE email = $1', ['admin@caltrac.com']);
        
        if (result.rows.length > 0) {
            console.log('✅ Admin user found:', result.rows[0]);
        } else {
            console.log('❌ Admin user not found in database');
        }
        
        // Also check if users table exists
        const tableCheck = await pool.query(`
            SELECT table_name FROM information_schema.tables 
            WHERE table_schema = 'public' AND table_name = 'users'
        `);
        
        if (tableCheck.rows.length > 0) {
            console.log('✅ Users table exists');
        } else {
            console.log('❌ Users table does not exist - run schema first');
        }
        
    } catch (error) {
        console.error('❌ Database error:', error.message);
    } finally {
        await pool.end();
    }
}

checkAdmin();