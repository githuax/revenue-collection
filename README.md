# Cal-Trac - Revenue Collection Management System

A comprehensive multi-platform solution for managing revenue collection, payments, vendor management, and property transactions. Cal-Trac provides both mobile and web applications, streamlining the process of tracking payments, managing vendors, handling property-related transactions, and generating invoices/receipts.

## 🚀 Platform Support

### 📱 **Mobile Application (React Native + Expo)**
Native iOS and Android applications with offline-first architecture and Bluetooth thermal printer integration.

### 🌐 **Web Application (Node.js + MVC)**
Full-featured web application with responsive design and comprehensive admin capabilities.

---

## 🌟 Features Overview

### 🔐 **Secure Authentication System**
- **Mobile**: Email-based authentication with Supabase, secure password management, session persistence with Zustand
- **Web**: Session-based authentication with PostgreSQL store, JWT token support, secure cookie management
- Protected routes and data access across both platforms

### 💰 **Payment Management**
- Track, add, and edit payments across all platforms
- Payment history and comprehensive analytics (today, week, month, recent)
- Multiple payment method support (cash, card, transfer, etc.)
- Real-time payment status tracking and notifications
- Payment reconciliation with invoices
- Automated payment reminders (planned)

### 👥 **Vendor/Customer Management**
- Complete vendor profiles with contact information
- Add, edit, and view vendors with detailed history
- Payment and property history per vendor
- Business type categorization and filtering
- Vendor performance metrics and analytics (planned)
- Document management and communication history (planned)
- Advanced search and filtering capabilities

### 🏢 **Property Management**
- Comprehensive property details with owner tracking
- Property type classification (residential, commercial, industrial, land)
- Payment expiry monitoring and alerts
- Occupancy tracking and maintenance schedules (planned)
- Property value tracking and location-based services
- Property-to-invoice relationship management

### 📊 **Dashboard & Analytics**
- Real-time payment statistics and KPIs
- Interactive charts and graphs
- Quick action tiles for common operations
- Recent activity tracking and audit logs
- Time-based analytics with drill-down capabilities
- Export capabilities for reports

### 🧾 **Invoice Generation & Management**
- Customizable invoice templates
- Automated invoice generation workflows
- PDF export functionality with professional styling
- Invoice tracking and comprehensive status management
- Payment reconciliation and matching
- Due date monitoring with automated reminders

### 📱 **Mobile-Specific Features**
- **Bluetooth thermal printer integration** with custom permissions
- **Offline-first architecture** with WatermelonDB local storage
- **Camera integration** for document capture
- **Location services** for payment tracking
- **Dark/Light mode support** with custom animations
- **Push notifications** for important updates

### 🌐 **Web-Specific Features**
- **Advanced reporting** with export capabilities
- **Bulk operations** for efficient data management
- **User management** and role-based access control
- **Data import/export** functionality
- **Advanced search and filtering** across all entities
- **Responsive design** for desktop, tablet, and mobile

---

## 🛠 Tech Stack

### Mobile Application
- **Framework**: React Native with Expo
- **Navigation**: Expo Router with nested navigation
- **State Management**: Zustand for client state
- **Database**: WatermelonDB (Local) & Supabase (Remote sync)
- **Styling**: NativeWind (TailwindCSS for React Native)
- **UI Components**: Custom components with React Native Elements
- **Icons**: Expo Vector Icons
- **Forms**: React Native Elements with validation
- **Date Handling**: React Native Date Picker
- **Printer**: react-native-thermal-receipt-printer, react-native-ble-plx
- **Permissions**: Custom Bluetooth/location permissions for Android

### Web Application
- **Backend**: Node.js with Express.js
- **Architecture**: Model-View-Controller (MVC) pattern
- **Database**: PostgreSQL with connection pooling
- **Session Store**: PostgreSQL-based sessions with connect-pg-simple
- **Authentication**: bcryptjs password hashing + JWT tokens
- **Security**: Helmet.js, CORS, rate limiting, input validation
- **Frontend**: Vanilla JavaScript with modern ES6+ features
- **Styling**: Tailwind CSS with custom components
- **Icons**: Font Awesome
- **Performance**: Compression, caching, optimized queries
- **API**: RESTful endpoints with comprehensive error handling

---

## 📋 Prerequisites

### General Requirements
- **Node.js**: Latest LTS version (v18.x or higher)
- **npm**: Latest version (v8.x or higher) or yarn (v1.22.x or higher)
- **Git**: For version control

### Mobile Development
- **Expo CLI**: Latest version (v6.x or higher)
- **Development Environment**:
  - **iOS**: Xcode 14+ (macOS required)
  - **Android**: Android Studio with required SDKs and build tools
- **Device/Emulator**: Physical device or emulator for testing

### Web Development
- **PostgreSQL**: v12 or higher (or Supabase account)
- **Modern Browser**: Chrome, Firefox, Safari, or Edge

---

## 🚀 Installation & Setup

### 1. Clone the Repository
```bash
git clone [repository-url]
cd revenue-collection
```

### 2. Mobile Application Setup
```bash
# Navigate to mobile app (root directory)
npm install
# or
yarn install

# Configure environment variables
cp .env.example .env
# Edit .env with your Supabase configuration

# Start development server
npm start
# or
yarn start

# Run on specific platform
npm run ios      # iOS simulator
npm run android  # Android emulator
npm run web      # Web browser
```

### 3. Web Application Setup
```bash
# Navigate to web application
cd web-app

# Install dependencies
npm install

# Configure environment variables
cp .env.example .env
# Edit .env with your database and security configuration

# Set up PostgreSQL database
createdb cal_trac

# Start development server
npm run dev

# Or start production server
npm start
```

---

## 📁 Project Structure

```
revenue-collection/
├── README.md                    # This file
├── package.json                 # Mobile app dependencies
├── app.json                     # Expo configuration
├── .env.example                 # Mobile app environment template
├── app/                         # Mobile app screens and navigation
│   ├── (tabs)/                 # Tab-based navigation
│   ├── (payment)/              # Payment-related screens
│   ├── (invoice)/              # Invoice screens
│   ├── (vendor)/               # Vendor management
│   ├── (property)/             # Property management
│   └── login/                  # Authentication screens
├── components/                  # Reusable mobile components
│   ├── dashboard/              # Dashboard components
│   ├── payer_details/          # Payer detail components
│   ├── modals/                 # Modal dialogs
│   └── settings/               # Settings components
├── db/                         # Mobile database (WatermelonDB)
│   ├── model/                  # Data models
│   ├── schema/                 # Database schema
│   └── migrations/             # Database migrations
├── services/                   # Business logic services
│   ├── constants.ts            # Application constants
│   ├── dbService.ts            # Database operations
│   └── printerService.ts       # Printer integration
├── store/                      # State management (Zustand)
│   ├── authStore.ts            # Authentication state
│   └── tempStore.ts            # Temporary state
├── utils/                      # Utility functions
│   └── supabase.ts             # Supabase configuration
├── permissions/                # Custom permissions
├── types/                      # TypeScript definitions
├── assets/                     # Static assets
└── web-app/                    # Web application (MVC)
    ├── README.md               # Web app documentation
    ├── package.json            # Web app dependencies
    ├── app.js                  # Main application entry
    ├── .env.example           # Web app environment template
    ├── models/                 # Data models (MVC)
    │   ├── User.js
    │   ├── Payer.js
    │   ├── Payment.js
    │   ├── Property.js
    │   └── Invoice.js
    ├── views/                  # HTML templates (MVC)
    │   ├── layouts/
    │   ├── dashboard/
    │   ├── payments/
    │   ├── vendors/
    │   ├── properties/
    │   └── auth/
    ├── controllers/            # Business logic (MVC)
    │   ├── AuthController.js
    │   ├── DashboardController.js
    │   ├── PaymentController.js
    │   ├── VendorController.js
    │   └── PropertyController.js
    ├── config/                 # Configuration
    │   ├── database.js
    │   └── session.js
    ├── routes/                 # Route definitions
    │   └── index.js
    └── public/                 # Static assets
        ├── css/
        ├── js/
        └── images/
```

---

## ⚙️ Environment Configuration

### Mobile App (.env)
```env
# Supabase Configuration
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key

# API Configuration
API_BASE_URL=your_api_base_url
API_TIMEOUT=30000

# Feature Flags
ENABLE_ANALYTICS=true
ENABLE_CRASH_REPORTING=true

# App Configuration
APP_ENV=development
DEBUG_MODE=true
```

### Web App (web-app/.env)
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

---

## 📱 Available Scripts

### Mobile Application
```bash
npm start          # Start Expo development server
npm run ios        # Run on iOS simulator
npm run android    # Run on Android emulator
npm run web        # Run in web browser
npm run build:dev  # Build development version
npm run build:prod # Build production version
npm run lint       # ESLint code quality checks
npm run format     # Format code with Prettier
```

### Web Application
```bash
cd web-app
npm start          # Start production server
npm run dev        # Start development server
npm test           # Run tests
npm run lint       # Check code style
npm run lint:fix   # Fix code style issues
npm run format     # Format code
```

---

## 🔌 API Endpoints (Web Application)

### Authentication
- `POST /api/auth/login` - User authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/logout` - User logout
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update user profile

### Dashboard
- `GET /api/dashboard` - Dashboard data and analytics
- `GET /api/dashboard/stats` - Statistical data
- `GET /api/dashboard/activity` - Recent activity

### Payments
- `GET /api/payments` - List payments with filtering
- `GET /api/payments/:id` - Get payment details
- `POST /api/payments` - Create new payment
- `PUT /api/payments/:id` - Update payment
- `DELETE /api/payments/:id` - Delete payment

### Vendors
- `GET /api/vendors` - List vendors with pagination
- `GET /api/vendors/:id` - Get vendor details
- `POST /api/vendors` - Create new vendor
- `PUT /api/vendors/:id` - Update vendor
- `DELETE /api/vendors/:id` - Delete vendor
- `GET /api/vendors/:id/payments` - Get vendor payments

### Properties
- `GET /api/properties` - List properties
- `GET /api/properties/:id` - Get property details
- `POST /api/properties` - Create new property
- `PUT /api/properties/:id` - Update property
- `DELETE /api/properties/:id` - Delete property
- `GET /api/properties/:id/invoices` - Get property invoices

---

## 🔒 Security Features

### Mobile Application
- Secure local storage with encryption
- Biometric authentication support
- Certificate pinning for API calls
- Data validation and sanitization
- Offline data protection

### Web Application
- HTTPS enforcement in production
- Helmet.js security headers
- Rate limiting on API endpoints
- Session security with secure cookies
- Password hashing with bcryptjs
- Input validation and sanitization
- CORS protection
- SQL injection prevention
- XSS protection

---

## 🚀 Deployment

### Mobile Application Deployment

#### Using Expo Application Services (EAS)
```bash
# Install EAS CLI
npm install -g @expo/eas-cli

# Configure EAS
eas build:configure

# Build for development
npm run build:dev

# Build for production
npm run build:prod
```

#### App Store Submission
1. Build production version with EAS
2. Test thoroughly on physical devices
3. Prepare app store listings and screenshots
4. Submit to Apple App Store and Google Play Store

### Web Application Deployment

#### Using Docker
```bash
cd web-app

# Build Docker image
docker build -t cal-trac-web .

# Run container
docker run -p 3000:3000 --env-file .env cal-trac-web
```

#### Using PM2 (Production)
```bash
cd web-app

# Install PM2 globally
npm install -g pm2

# Start application with PM2
pm2 start app.js --name "cal-trac-web"

# Save PM2 configuration
pm2 save

# Setup PM2 startup
pm2 startup
```

#### Environment Checklist for Production
- [ ] Set `NODE_ENV=production`
- [ ] Use strong secrets for sessions and JWT
- [ ] Configure SSL/TLS certificates
- [ ] Set up database connection pooling
- [ ] Configure reverse proxy (nginx/Apache)
- [ ] Set up monitoring and logging
- [ ] Configure backup procedures
- [ ] Set up CI/CD pipeline

---

## 🧪 Testing

### Mobile Application
```bash
# Run tests
npm test

# Run specific test suite
npm test -- --testPathPattern=components

# Coverage report
npm test -- --coverage
```

### Web Application
```bash
cd web-app

# Run all tests
npm test

# Run tests in watch mode
npm test -- --watch

# Generate coverage report
npm test -- --coverage
```

---

## 📊 Monitoring & Analytics

### Application Monitoring
- Performance monitoring with built-in metrics
- Error tracking and reporting
- User analytics and behavior tracking
- Database query performance monitoring
- API endpoint response time tracking

### Logging
- Structured logging with different levels
- Error logs with stack traces
- Audit logs for sensitive operations
- Performance logs for optimization

---

## 🤝 Contributing

We welcome contributions to Cal-Trac! Please follow these guidelines:

### Getting Started
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Follow the coding standards and style guides

### Development Process
1. Write tests for new functionality
2. Ensure all tests pass
3. Update documentation as needed
4. Follow commit message conventions
5. Submit a Pull Request with detailed description

### Code Standards
- **Mobile**: Follow React Native and TypeScript best practices
- **Web**: Follow Node.js and JavaScript ES6+ standards
- Use ESLint and Prettier for code formatting
- Write meaningful variable and function names
- Add comments for complex business logic
- Keep functions small and focused

### Pull Request Process
1. Ensure your code passes all tests
2. Update the README if you've made changes to functionality
3. Add screenshots for UI changes
4. Request review from maintainers
5. Address feedback promptly

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🆘 Support & Help

### Documentation
- Check this README for comprehensive setup instructions
- Review the web-app/README.md for web-specific documentation
- Look through the codebase comments and documentation

### Issues & Questions
- Create an issue on GitHub for bugs or feature requests
- Use GitHub Discussions for questions and community support
- Check existing issues before creating new ones

### Community
- Join our Discord/Slack community (link to be added)
- Follow our blog for updates and tutorials
- Contribute to documentation improvements

---

## 🗓 Roadmap

### Short Term (Next 3 months)
- [ ] Enhanced reporting capabilities
- [ ] Automated backup system
- [ ] Advanced user role management
- [ ] Mobile app performance optimizations
- [ ] Integration with popular accounting software

### Medium Term (6 months)
- [ ] Multi-language support
- [ ] Advanced analytics dashboard
- [ ] Email notification system
- [ ] Document management system
- [ ] API for third-party integrations

### Long Term (12+ months)
- [ ] Machine learning for payment predictions
- [ ] Advanced workflow automation
- [ ] Multi-tenant support
- [ ] Advanced security features
- [ ] IoT device integrations

---

## 📞 Contact

**Cal-Trac Development Team**
- Email: support@cal-trac.com
- GitHub: [https://github.com/cal-trac](https://github.com/cal-trac)
- Website: [https://cal-trac.com](https://cal-trac.com)

---

**Made with ❤️ for better revenue collection management**