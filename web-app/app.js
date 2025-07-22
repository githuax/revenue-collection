const express = require('express');
const path = require('path');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

// Import middleware and routes
const { sessionMiddleware, addUserToLocals } = require('./config/session');
const routes = require('./routes');
const { Database } = require('./config/database');

const app = express();
const PORT = process.env.PORT || 3000;

// Security middleware
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'", "https://cdnjs.cloudflare.com"],
            scriptSrc: ["'self'", "https://cdnjs.cloudflare.com"],
            fontSrc: ["'self'", "https://cdnjs.cloudflare.com"],
            imgSrc: ["'self'", "data:", "https:"],
            connectSrc: ["'self'"]
        }
    }
}));

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: {
        success: false,
        message: 'Too many requests, please try again later.'
    }
});

const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // limit each IP to 5 auth requests per windowMs
    message: {
        success: false,
        message: 'Too many authentication attempts, please try again later.'
    }
});

app.use(limiter);
app.use('/api/auth', authLimiter);

// CORS
app.use(cors({
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    credentials: true
}));

// Compression
app.use(compression());

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Session middleware
app.use(sessionMiddleware);
app.use(addUserToLocals);

// Static files
app.use(express.static(path.join(__dirname, 'public')));

// View engine setup (using simple HTML files for now)
app.set('views', path.join(__dirname, 'views'));
app.engine('html', (filePath, options, callback) => {
    const fs = require('fs');
    fs.readFile(filePath, (err, content) => {
        if (err) return callback(err);
        
        // Simple template replacement
        let rendered = content.toString();
        
        // Replace {{content}} placeholder in layout
        if (options.content) {
            rendered = rendered.replace('{{content}}', options.content);
        }
        
        // Replace other placeholders
        Object.keys(options).forEach(key => {
            const regex = new RegExp(`{{${key}}}`, 'g');
            rendered = rendered.replace(regex, options[key] || '');
        });
        
        return callback(null, rendered);
    });
});
app.set('view engine', 'html');

// Custom render method for layouts
app.use((req, res, next) => {
    res.renderWithLayout = function(view, options = {}) {
        const fs = require('fs');
        const viewPath = path.join(__dirname, 'views', view + '.html');
        const layoutPath = path.join(__dirname, 'views/layouts/main.html');
        
        fs.readFile(viewPath, (err, viewContent) => {
            if (err) return res.status(500).send('View not found');
            
            fs.readFile(layoutPath, (err, layoutContent) => {
                if (err) return res.status(500).send('Layout not found');
                
                let rendered = layoutContent.toString();
                rendered = rendered.replace('{{content}}', viewContent.toString());
                
                // Replace placeholders
                Object.keys(options).forEach(key => {
                    const regex = new RegExp(`{{${key}}}`, 'g');
                    rendered = rendered.replace(regex, options[key] || '');
                });
                
                res.send(rendered);
            });
        });
    };
    next();
});

// Routes
app.use('/', routes);

// Health check endpoint
app.get('/health', async (req, res) => {
    try {
        // Test database connection
        await Database.query('SELECT 1');
        
        res.json({
            status: 'OK',
            timestamp: new Date().toISOString(),
            uptime: process.uptime(),
            environment: process.env.NODE_ENV || 'development',
            version: require('./package.json')?.version || '1.0.0'
        });
    } catch (error) {
        console.error('Health check failed:', error);
        res.status(503).json({
            status: 'ERROR',
            timestamp: new Date().toISOString(),
            error: 'Database connection failed'
        });
    }
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Application error:', err);
    
    // Don't leak error details in production
    const isDevelopment = process.env.NODE_ENV === 'development';
    
    if (req.xhr || req.headers.accept?.indexOf('json') > -1) {
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            ...(isDevelopment && { error: err.message, stack: err.stack })
        });
    } else {
        res.status(500).renderWithLayout('error', {
            title: 'Server Error',
            message: 'Internal server error',
            ...(isDevelopment && { error: err.message })
        });
    }
});

// 404 handler
app.use((req, res) => {
    if (req.xhr || req.headers.accept?.indexOf('json') > -1) {
        res.status(404).json({
            success: false,
            message: 'Not found'
        });
    } else {
        res.status(404).renderWithLayout('error', {
            title: 'Page Not Found',
            message: 'The page you requested could not be found.'
        });
    }
});

// Graceful shutdown
process.on('SIGTERM', async () => {
    console.log('SIGTERM received, shutting down gracefully');
    
    try {
        await Database.close();
        console.log('Database connections closed');
        process.exit(0);
    } catch (error) {
        console.error('Error during shutdown:', error);
        process.exit(1);
    }
});

process.on('SIGINT', async () => {
    console.log('SIGINT received, shutting down gracefully');
    
    try {
        await Database.close();
        console.log('Database connections closed');
        process.exit(0);
    } catch (error) {
        console.error('Error during shutdown:', error);
        process.exit(1);
    }
});

// Start server
app.listen(PORT, () => {
    console.log(`Cal-Trac Web Application running on port ${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`Access the application at: http://localhost:${PORT}`);
});

module.exports = app;