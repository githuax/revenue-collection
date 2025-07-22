const { Pool } = require('pg');
require('dotenv').config();

// Database configuration for Supabase
const dbConfig = {
    user: process.env.DB_USER || 'postgres',
    host: process.env.DB_HOST || 'localhost',
    database: process.env.DB_NAME || 'postgres',
    password: process.env.DB_PASSWORD || 'password',
    port: process.env.DB_PORT || 5432,
    ssl: { rejectUnauthorized: false }
};

// Use Supabase connection string if provided, otherwise use individual config
const connectionString = process.env.DATABASE_URL;

const pool = connectionString 
    ? new Pool({ 
        connectionString, 
        ssl: { rejectUnauthorized: false },
        max: 10,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 2000
    })
    : new Pool({
        ...dbConfig,
        max: 10,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 2000
    });

// Test database connection
pool.on('connect', () => {
    console.log('Connected to the PostgreSQL database');
});

pool.on('error', (err) => {
    console.error('Database connection error:', err);
});

// Database helper functions
class Database {
    static async query(text, params) {
        const start = Date.now();
        const client = await pool.connect();
        
        try {
            const result = await client.query(text, params);
            const duration = Date.now() - start;
            
            if (process.env.NODE_ENV === 'development') {
                console.log('Executed query:', { text, duration, rows: result.rowCount });
            }
            
            return result;
        } finally {
            client.release();
        }
    }

    static async transaction(queries) {
        const client = await pool.connect();
        
        try {
            await client.query('BEGIN');
            
            const results = [];
            for (const { text, params } of queries) {
                const result = await client.query(text, params);
                results.push(result);
            }
            
            await client.query('COMMIT');
            return results;
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    }

    static async findOne(table, conditions = {}, options = {}) {
        const { columns = '*', orderBy } = options;
        let query = `SELECT ${columns} FROM ${table}`;
        const params = [];
        
        if (Object.keys(conditions).length > 0) {
            const whereClause = Object.keys(conditions).map((key, index) => {
                params.push(conditions[key]);
                return `${key} = $${index + 1}`;
            }).join(' AND ');
            
            query += ` WHERE ${whereClause}`;
        }
        
        if (orderBy) {
            query += ` ORDER BY ${orderBy}`;
        }
        
        query += ' LIMIT 1';
        
        const result = await this.query(query, params);
        return result.rows[0] || null;
    }

    static async findMany(table, conditions = {}, options = {}) {
        const { columns = '*', orderBy, limit, offset } = options;
        let query = `SELECT ${columns} FROM ${table}`;
        const params = [];
        
        if (Object.keys(conditions).length > 0) {
            const whereClause = Object.keys(conditions).map((key, index) => {
                params.push(conditions[key]);
                return `${key} = $${index + 1}`;
            }).join(' AND ');
            
            query += ` WHERE ${whereClause}`;
        }
        
        if (orderBy) {
            query += ` ORDER BY ${orderBy}`;
        }
        
        if (limit) {
            query += ` LIMIT ${limit}`;
        }
        
        if (offset) {
            query += ` OFFSET ${offset}`;
        }
        
        const result = await this.query(query, params);
        return result.rows;
    }

    static async create(table, data) {
        const columns = Object.keys(data);
        const values = Object.values(data);
        const placeholders = values.map((_, index) => `$${index + 1}`).join(', ');
        
        const query = `
            INSERT INTO ${table} (${columns.join(', ')})
            VALUES (${placeholders})
            RETURNING *
        `;
        
        const result = await this.query(query, values);
        return result.rows[0];
    }

    static async update(table, data, conditions) {
        const setClause = Object.keys(data).map((key, index) => {
            return `${key} = $${index + 1}`;
        }).join(', ');
        
        const conditionClause = Object.keys(conditions).map((key, index) => {
            return `${key} = $${Object.keys(data).length + index + 1}`;
        }).join(' AND ');
        
        const values = [...Object.values(data), ...Object.values(conditions)];
        
        const query = `
            UPDATE ${table}
            SET ${setClause}
            WHERE ${conditionClause}
            RETURNING *
        `;
        
        const result = await this.query(query, values);
        return result.rows[0];
    }

    static async delete(table, conditions) {
        const whereClause = Object.keys(conditions).map((key, index) => {
            return `${key} = $${index + 1}`;
        }).join(' AND ');
        
        const query = `DELETE FROM ${table} WHERE ${whereClause}`;
        const result = await this.query(query, Object.values(conditions));
        return result.rowCount;
    }

    static async count(table, conditions = {}) {
        let query = `SELECT COUNT(*) as count FROM ${table}`;
        const params = [];
        
        if (Object.keys(conditions).length > 0) {
            const whereClause = Object.keys(conditions).map((key, index) => {
                params.push(conditions[key]);
                return `${key} = $${index + 1}`;
            }).join(' AND ');
            
            query += ` WHERE ${whereClause}`;
        }
        
        const result = await this.query(query, params);
        return parseInt(result.rows[0].count);
    }

    static async close() {
        await pool.end();
    }
}

module.exports = {
    pool,
    Database,
    query: Database.query.bind(Database)
};