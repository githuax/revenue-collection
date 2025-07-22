# Cal-Trac Web Application

A streamlined and optimized web application built using MVC architecture for managing revenue collection, payments, vendor management, and property transactions.

## Features

### 🔐 **Authentication System**
- Secure email-based authentication
- Session management with PostgreSQL store
- Password hashing with bcryptjs
- JWT token support
- Protected routes and middleware

### 💰 **Payment Management**
- Track, add, and edit payments
- Payment history and analytics
- Multiple payment method support
- Payment status tracking
- Real-time dashboard updates

### 👥 **Vendor Management**
- Vendor profiles and contact information
- Add, edit, and view vendors
- Payment and property history per vendor
- Business type categorization
- Search and filtering capabilities

### 🏢 **Property Management**
- Add, edit, and view property details
- Property owner tracking
- Payment expiry monitoring
- Property type classification
- Location-based organization

### 📊 **Dashboard & Analytics**
- Real-time payment statistics
- Quick action tiles
- Recent activity tracking
- Overview metrics
- Time-based analytics (today, week, month)

### 🧾 **Invoice Management**
- Invoice generation and tracking
- Payment reconciliation
- Status management
- Due date monitoring
- PDF export capability

## Tech Stack

- **Backend**: Node.js with Express.js
- **Architecture**: Model-View-Controller (MVC)
- **Database**: PostgreSQL with connection pooling
- **Session Store**: PostgreSQL-based sessions
- **Authentication**: bcryptjs + JWT
- **Security**: Helmet, CORS, Rate limiting
- **Frontend**: Vanilla JavaScript with Tailwind CSS
- **Icons**: Font Awesome
- **Performance**: Compression, caching headers

## Prerequisites

- **Node.js**: v16.0.0 or higher
- **npm**: v8.0.0 or higher
- **PostgreSQL**: v12 or higher (or Supabase)

## Installation

1. **Clone the repository**:
```bash
git clone <repository-url>
cd cal-trac/web-app
```

2. **Install dependencies**:
```bash
npm install
```

3. **Environment setup**:
```bash
cp .env.example .env
# Edit .env with your configuration
```

4. **Database setup**:
```bash
# Create PostgreSQL database
createdb cal_trac

# Run migrations (if available)
npm run db:migrate

# Seed initial data (optional)
npm run db:seed
```

5. **Start the application**:
```bash
# Development mode
npm run dev

# Production mode
npm start
```

## Environment Configuration

Create a `.env` file with the following variables:

```env
# Application
NODE_ENV=development
PORT=3000

# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=cal_trac
DB_USER=postgres
DB_PASSWORD=password

# Or use Supabase
DATABASE_URL=postgresql://user:password@host:port/database

# Security
SESSION_SECRET=your-super-secret-session-key
JWT_SECRET=your-jwt-secret-key

# Features
ENABLE_REGISTRATION=true
ENABLE_EMAIL_NOTIFICATIONS=false
```

## Project Structure

```
web-app/
├── app.js                 # Main application entry point
├── package.json           # Dependencies and scripts
├── .env.example          # Environment variables template
├── models/               # Data models
│   ├── User.js
│   ├── Payer.js
│   ├── Payment.js
│   ├── Property.js
│   └── Invoice.js
├── views/                # HTML templates
│   ├── layouts/
│   │   └── main.html     # Main layout template
│   ├── dashboard/
│   │   └── index.html    # Dashboard view
│   ├── payments/
│   │   └── index.html    # Payments listing
│   ├── vendors/
│   │   └── index.html    # Vendors management
│   ├── properties/
│   │   └── index.html    # Properties management
│   └── auth/
│       └── login.html    # Login page
├── controllers/          # Business logic controllers
│   ├── AuthController.js
│   ├── DashboardController.js
│   ├── PaymentController.js
│   ├── VendorController.js
│   └── PropertyController.js
├── config/              # Configuration files
│   ├── database.js      # Database configuration
│   └── session.js       # Session configuration
├── routes/              # Route definitions
│   └── index.js         # Main routes file
└── public/              # Static assets
    ├── css/
    │   └── main.css     # Custom styles
    ├── js/
    │   └── main.js      # Frontend JavaScript
    └── images/          # Static images
```

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `POST /api/auth/logout` - User logout
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update user profile

### Dashboard
- `GET /api/dashboard` - Dashboard data
- `GET /api/dashboard/stats` - Statistics
- `GET /api/dashboard/activity` - Recent activity

### Payments
- `GET /api/payments` - List payments
- `GET /api/payments/:id` - Get payment details
- `POST /api/payments` - Create payment
- `PUT /api/payments/:id` - Update payment
- `DELETE /api/payments/:id` - Delete payment

### Vendors
- `GET /api/vendors` - List vendors
- `GET /api/vendors/:id` - Get vendor details
- `POST /api/vendors` - Create vendor
- `PUT /api/vendors/:id` - Update vendor
- `DELETE /api/vendors/:id` - Delete vendor

### Properties
- `GET /api/properties` - List properties
- `GET /api/properties/:id` - Get property details
- `POST /api/properties` - Create property
- `PUT /api/properties/:id` - Update property
- `DELETE /api/properties/:id` - Delete property

## Available Scripts

- `npm start` - Start production server
- `npm run dev` - Start development server with nodemon
- `npm test` - Run tests
- `npm run lint` - Check code style
- `npm run lint:fix` - Fix code style issues
- `npm run format` - Format code with Prettier

## Database Schema

The application uses the following main tables:

- `users` - User accounts and authentication
- `payers` - Vendor/customer information
- `properties` - Property records
- `invoices` - Invoice management
- `payments` - Payment transactions
- `user_sessions` - Session storage

## Security Features

- **HTTPS Enforced** (in production)
- **Helmet.js** for security headers
- **Rate Limiting** on API endpoints
- **Session Security** with secure cookies
- **Password Hashing** with bcryptjs
- **Input Validation** and sanitization
- **CORS Protection** configured

## Development Guidelines

1. **Code Style**: Follow ESLint configuration
2. **Commits**: Use meaningful commit messages
3. **Testing**: Write tests for new features
4. **Documentation**: Update README for new features
5. **Security**: Never commit sensitive data

## Deployment

### Using Docker

1. **Build image**:
```bash
npm run docker:build
```

2. **Run container**:
```bash
npm run docker:run
```

### Using PM2

1. **Install PM2**:
```bash
npm install -g pm2
```

2. **Start application**:
```bash
pm2 start app.js --name "cal-trac-web"
```

### Environment Setup

For production deployment:

1. Set `NODE_ENV=production`
2. Use strong secrets for sessions and JWT
3. Configure SSL/TLS certificates
4. Set up database connection pooling
5. Configure reverse proxy (nginx/Apache)
6. Set up monitoring and logging

## Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Make your changes following coding standards
4. Write or update tests as needed
5. Commit changes (`git commit -m 'Add AmazingFeature'`)
6. Push to branch (`git push origin feature/AmazingFeature`)
7. Open Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support and questions:
- Create an issue on GitHub
- Check the documentation
- Review existing issues and discussions