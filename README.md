# Cal-Trac

A comprehensive mobile application built with React Native and Expo for managing revenue collection, payments, and vendor management. Cal-Trac streamlines the process of tracking payments, managing vendors, and handling property-related transactions, making it an essential tool for property managers and revenue collectors.

## Features

- 🔐 **Secure Authentication System**
  - Email-based authentication
  - Secure password management
  - Session persistence
  - Protected routes and data

- 💰 **Payment Management**
  - Track incoming and outgoing payments
  - Payment history and analytics
  - Automated payment reminders
  - Multiple payment method support
  - Payment status tracking

- 👥 **Vendor Management**
  - Vendor profiles and contact information
  - Payment history per vendor
  - Vendor performance metrics
  - Document management for vendors
  - Communication history

- 🏢 **Property Management**
  - Property details and specifications
  - Occupancy tracking
  - Maintenance schedules
  - Property value tracking
  - Location-based services

- 📊 **Invoice Generation**
  - Customizable invoice templates
  - Automated invoice generation
  - PDF export functionality
  - Invoice tracking and status
  - Payment reconciliation

- 📱 **Cross-platform Support**
  - Native iOS application
  - Native Android application
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
- `npm run build:dev` - Build development version with debug features
- `npm run build:preview` - Build preview version for testing
- `npm run build:prod` - Build production version with optimizations
- `npm run lint` - Run ESLint for code quality checks
- `npm run format` - Format code with Prettier for consistent style

## Project Structure

```
cal-trac/
├── app/                    # Main application code
│   ├── (tabs)/            # Tab-based navigation
│   │   ├── index.tsx      # Home screen
│   │   ├── payments.tsx   # Payments management
│   │   ├── vendors.tsx    # Vendor management
│   │   └── profile.tsx    # User profile
│   ├── (payment)/         # Payment related screens
│   ├── (invoice)/         # Invoice related screens
│   ├── (vendor)/          # Vendor management screens
│   └── (property)/        # Property management screens
├── components/            # Reusable components
├── store/                 # State management
│   └── authStore.ts       # Authentication state
├── services/              # API and service integrations
│   ├── constants.ts       # Constants
│   └── dbService.ts       # Common DB Queries
├── utils/                 # Utility functions
│   ├── supabase.ts        # Supabase Configs
│   └── migrations/        # Supabase Migrations
├── types/                 # TypeScript type definitions
├── assets/                # Static assets
│   ├── images/            # Image assets
│   └── fonts/             # Font files
└── db/                    # Database models and migrations
    ├── models/            # WatermelonDB models
    ├── schema/            # WatermelonDB schema
    └── migrations/        # Database migrations
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