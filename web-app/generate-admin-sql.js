const bcrypt = require('bcryptjs');

async function generateAdminSQL() {
    const password = 'admin123';
    const saltRounds = 12;
    const hash = await bcrypt.hash(password, saltRounds);
    
    console.log('Copy and paste this SQL into your Supabase SQL Editor:');
    console.log('');
    console.log(`INSERT INTO users (first_name, last_name, email, password, role) 
VALUES ('Admin', 'User', 'admin@caltrac.com', '${hash}', 'admin');`);
    console.log('');
    console.log('Then you can login with:');
    console.log('Email: admin@caltrac.com');
    console.log('Password: admin123');
}

generateAdminSQL().catch(console.error);