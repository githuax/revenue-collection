# Cal-Trac

A comprehensive mobile application built with React Native and Expo for managing revenue collection, payments, vendor management, and property transactions. Cal-Trac streamlines the process of tracking payments, managing vendors, handling property-related transactions, and printing invoices/receipts, making it an essential tool for property managers and revenue collectors.

## Features

- 🔐 **Secure Authentication System**
  - Email-based authentication (Supabase)
  - Secure password management
  - Session persistence (Zustand)
  - Protected routes and data

- 💰 **Payment Management**
  - Track, add, and edit payments
  - Payment history and analytics (dashboard: today, week, month, recent)
  - Automated payment reminders (planned)
  - Multiple payment method support
  - Payment status tracking

- 👥 **Vendor Management**
  - Vendor profiles and contact information
  - Add, edit, and view vendors
  - Payment and property history per vendor
  - Vendor performance metrics (planned)
  - Document management for vendors (planned)
  - Communication history (planned)

- 🏢 **Property Management**
  - Add, edit, and view property details
  - Occupancy tracking
  - Maintenance schedules (planned)
  - Property value tracking
  - Location-based services

- 📊 **Dashboard & Analytics**
  - Payments analytics (today, week, month, recent)
  - Quick stats and action tiles

- 🧾 **Invoice Generation & Printing**
  - Customizable invoice templates
  - Automated invoice generation
  - PDF export functionality
  - Invoice tracking and status
  - Payment reconciliation

- **Bluetooth thermal printer integration** (with custom permissions)

- 📱 **Cross-platform Support**
  - Native iOS and Android applications
  - Consistent UI/UX across platforms
  - Platform-specific optimizations

- 🔄 **Offline Support**
  - Local data persistence with WatermelonDB
  - Offline-first architecture
  - Automatic sync when online
  - Conflict resolution
  - Data integrity checks

- 🎨 **Modern UI/UX**
  - Clean and intuitive interface
  - Responsive design
  - Dark/Light mode support
  - Custom animations
  - Accessibility features

- 🔌 **Printer & Bluetooth Permissions**
  - Bluetooth printer support (thermal receipts)
  - Custom permission handling for Android (Bluetooth, Location)

## Tech Stack

- **Framework**: React Native with Expo
- **Navigation**: Expo Router
- **State Management**: Zustand
- **Database**: WatermelonDB (Local) & Supabase (Remote)
- **Styling**: NativeWind (TailwindCSS for React Native)
- **UI Components**: Custom components with React Native
- **Icons**: Expo Vector Icons
- **Forms**: React Native Elements
- **Date Handling**: React Native Date Picker
- **Printer**: react-native-thermal-receipt-printer, react-native-ble-plx
- **Permissions**: Custom Bluetooth/location permissions for Android

## Prerequisites

- **Node.js**: Latest LTS version (v18.x or higher)
- **npm**: Latest version (v8.x or higher) or yarn (v1.22.x or higher)
- **Expo CLI**: Latest version (v6.x or higher)
- **Development Environment**:
  - iOS: Xcode 14+ (for Mac)
  - Android: Android Studio (latest version)
  - Required SDKs and build tools

## Installation

1. Clone the repository:
```bash
git clone [repository-url]
cd cal-trac
```

2. Install dependencies:
```bash
npm install
# or
yarn install
```

3. Configure environment variables:
```bash
cp .env.example .env
# Edit .env with your configuration
```

4. Start the development server:
```bash
npm start
# or
yarn start
```

## Available Scripts

- `npm start` - Start the Expo development server with hot reloading
- `npm run ios` - Run the app on iOS simulator with development client
- `npm run android` - Run the app on Android emulator with development client
- `npm run web` - Run the app in a web browser
- `npm run build:dev` - Build development version with debug features
- `npm run build:preview` - Build preview version for testing
- `npm run build:prod` - Build production version with optimizations
- `npm run lint` - Run ESLint for code quality checks
- `npm run format` - Format code with Prettier for consistent style
- `npm run prebuild` - Prepare native code for EAS builds

## Project Structure

```
cal-trac/
├── app/                    # Main application code
│   ├── (tabs)/            # Tab-based navigation (Home, Payments, Vendors, Profile)
│   ├── (payment)/         # Payment-related screens
│   ├── (invoice)/         # Invoice-related screens
│   ├── (vendor)/          # Vendor management screens
│   ├── (property)/        # Property management screens
│   ├── (new_payments)/    # New payment flow screens
│   ├── printer/           # Printer integration screens
│   ├── login/             # Authentication screens
│   ├── _layout.tsx        # App layout
│   └── index.tsx          # App entry point
├── components/            # Reusable components
│   ├── dashboard/         # Dashboard analytics components
│   ├── payer_details/     # Payer details components
│   ├── modals/            # Modal dialogs (e.g., Register Property)
│   ├── settings/          # Settings components
│   └── ...                # Other UI components
├── db/                    # Database models and migrations
│   ├── model/             # WatermelonDB models
│   ├── schema/            # WatermelonDB schema
│   ├── migrations/        # Database migrations
│   ├── index.ts           # DB entry point
│   └── sync.ts            # Sync logic
├── services/              # API and service integrations
│   ├── constants.ts       # Constants
│   ├── dbService.ts       # Common DB Queries
│   └── printerService.ts  # Printer logic
├── store/                 # State management (Zustand stores)
│   ├── authStore.ts       # Authentication state
│   ├── tempStore.ts       # Temporary state
│   └── mock_data.js       # Mock data for development
├── utils/                 # Utility functions
│   ├── supabase.ts        # Supabase Configs
│   └── migrations/        # Supabase Migrations
├── permissions/           # Custom permissions (Bluetooth, etc.)
├── types/                 # TypeScript type definitions
├── assets/                # Static assets (images, fonts)
└── ...                    # Config files, scripts, etc.
```

## Environment Setup

1. Create a `.env` file in the root directory
2. Add the following environment variables:
```
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

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Make your changes following the coding standards
4. Write or update tests as needed
5. Ensure all tests pass
6. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
7. Push to the branch (`git push origin feature/AmazingFeature`)
8. Open a Pull Request with a detailed description

## Development Guidelines

- Follow the TypeScript style guide
- Write meaningful commit messages
- Update documentation for new features
- Add tests for new functionality
- Keep the codebase clean and maintainable