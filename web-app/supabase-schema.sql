-- Cal-Trac Database Schema for Supabase
-- This file contains the complete database schema for the web application
-- Run this SQL in your Supabase SQL Editor to set up the database

-- Enable Row Level Security
ALTER DEFAULT PRIVILEGES REVOKE EXECUTE ON FUNCTIONS FROM PUBLIC;

-- Create custom types
DO $$ BEGIN
    CREATE TYPE payment_status AS ENUM ('pending', 'completed', 'failed', 'cancelled');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE invoice_status AS ENUM ('pending', 'paid', 'overdue', 'cancelled');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE property_type AS ENUM ('residential', 'commercial', 'industrial', 'land');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE business_type AS ENUM ('individual', 'business', 'corporation');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Users table (for web app authentication)
CREATE TABLE IF NOT EXISTS users (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    role VARCHAR(50) DEFAULT 'user',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Payers table (vendors/customers)
CREATE TABLE IF NOT EXISTS payers (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    company_name VARCHAR(255),
    tin VARCHAR(50) UNIQUE NOT NULL,
    phone VARCHAR(20),
    email VARCHAR(255),
    vendor BOOLEAN DEFAULT false,
    property_owner BOOLEAN DEFAULT false,
    business_type business_type DEFAULT 'individual',
    last_payment_date TIMESTAMP WITH TIME ZONE,
    notes TEXT,
    location VARCHAR(255),
    created_by UUID REFERENCES users(id) ON DELETE CASCADE,
    last_modified_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Properties table
CREATE TABLE IF NOT EXISTS properties (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    property_ref_no VARCHAR(100) UNIQUE NOT NULL,
    address TEXT NOT NULL,
    geolocation JSONB,
    assess_payment DECIMAL(12,2),
    payment_expiry_date DATE,
    type property_type DEFAULT 'residential',
    notes TEXT,
    images JSONB,
    owner_id UUID REFERENCES payers(id) ON DELETE CASCADE,
    last_modified_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Invoices table
CREATE TABLE IF NOT EXISTS invoices (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    ref_no VARCHAR(100) UNIQUE NOT NULL,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    amount_due DECIMAL(12,2) NOT NULL,
    due_date DATE,
    notes TEXT,
    status invoice_status DEFAULT 'pending',
    payer_id UUID REFERENCES payers(id) ON DELETE CASCADE,
    property_id UUID REFERENCES properties(id) ON DELETE SET NULL,
    created_by UUID REFERENCES users(id) ON DELETE CASCADE,
    last_modified_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Payments table
CREATE TABLE IF NOT EXISTS payments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    ref_no VARCHAR(100) UNIQUE NOT NULL,
    amount DECIMAL(12,2) NOT NULL,
    payment_type VARCHAR(50),
    payment_method VARCHAR(50) NOT NULL,
    location VARCHAR(255),
    invoice_id UUID REFERENCES invoices(id) ON DELETE SET NULL,
    status payment_status DEFAULT 'completed',
    notes TEXT,
    payer_id UUID REFERENCES payers(id) ON DELETE CASCADE,
    created_by UUID REFERENCES users(id) ON DELETE CASCADE,
    created_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_modified_date TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User sessions table (for session management)
CREATE TABLE IF NOT EXISTS user_sessions (
    sid VARCHAR NOT NULL PRIMARY KEY,
    sess JSONB NOT NULL,
    expire TIMESTAMP(6) NOT NULL
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_payers_created_by ON payers(created_by);
CREATE INDEX IF NOT EXISTS idx_payers_tin ON payers(tin);
CREATE INDEX IF NOT EXISTS idx_payers_vendor ON payers(vendor);
CREATE INDEX IF NOT EXISTS idx_payers_property_owner ON payers(property_owner);

CREATE INDEX IF NOT EXISTS idx_properties_owner_id ON properties(owner_id);
CREATE INDEX IF NOT EXISTS idx_properties_ref_no ON properties(property_ref_no);

CREATE INDEX IF NOT EXISTS idx_invoices_payer_id ON invoices(payer_id);
CREATE INDEX IF NOT EXISTS idx_invoices_property_id ON invoices(property_id);
CREATE INDEX IF NOT EXISTS idx_invoices_created_by ON invoices(created_by);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON invoices(status);
CREATE INDEX IF NOT EXISTS idx_invoices_ref_no ON invoices(ref_no);

CREATE INDEX IF NOT EXISTS idx_payments_payer_id ON payments(payer_id);
CREATE INDEX IF NOT EXISTS idx_payments_invoice_id ON payments(invoice_id);
CREATE INDEX IF NOT EXISTS idx_payments_created_by ON payments(created_by);
CREATE INDEX IF NOT EXISTS idx_payments_created_date ON payments(created_date);
CREATE INDEX IF NOT EXISTS idx_payments_ref_no ON payments(ref_no);

CREATE INDEX IF NOT EXISTS idx_sessions_expire ON user_sessions(expire);

-- Functions to automatically update timestamps
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for automatic timestamp updates
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS update_payers_updated_at ON payers;
CREATE TRIGGER update_payers_updated_at
    BEFORE UPDATE ON payers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Function to generate reference numbers
CREATE OR REPLACE FUNCTION generate_ref_no(prefix TEXT DEFAULT 'REF')
RETURNS TEXT AS $$
DECLARE
    new_ref TEXT;
    counter INTEGER := 1;
BEGIN
    LOOP
        new_ref := prefix || '-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || LPAD(counter::TEXT, 4, '0');
        -- Check if this reference number already exists in any table
        IF NOT EXISTS (
            SELECT 1 FROM invoices WHERE ref_no = new_ref
            UNION ALL
            SELECT 1 FROM payments WHERE ref_no = new_ref
        ) THEN
            RETURN new_ref;
        END IF;
        counter := counter + 1;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO authenticated;

-- Summary of tables created:
-- 1. users - Web application user accounts
-- 2. payers - Vendors/customers 
-- 3. properties - Property records
-- 4. invoices - Invoice management
-- 5. payments - Payment transactions  
-- 6. user_sessions - Session storage for web app

-- Instructions:
-- 1. Copy this entire SQL code
-- 2. Go to your Supabase dashboard: https://supabase.com/dashboard/project/lxwjmhjdsogqjmwyrtjv/sql/new
-- 3. Paste the code in the SQL Editor
-- 4. Click "RUN" to execute
-- 5. Verify tables were created in the Table Editor

COMMIT;