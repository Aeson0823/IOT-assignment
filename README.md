# Smart Bin IOT System

## Project Overview
This repository contains the source code and resources for the Smart Bin IOT System, which includes both backend and frontend components, database schemas, and hardware integration files. The system enables real-time monitoring and management of smart bins via a web dashboard.

## Folder Structure

```
IOT/
├── arduino.ino                # Arduino source code for hardware integration
├── smartbin.sql               # SQL schema for smart bin database
├── smart_bin_db.sql           # Alternative SQL schema
├── UART/                      # UART communication resources
├── uiux_requirements.md       # UI/UX requirements documentation
├── smart_bin_project/
│   ├── backend/               # Laravel backend API and dashboard
│   │   ├── app/               # Application core (Http, Models, Providers)
│   │   ├── bootstrap/         # Laravel bootstrap files
│   │   ├── config/            # Configuration files
│   │   ├── database/          # Migrations, seeders, factories
│   │   ├── public/            # Public assets and entry point
│   │   ├── resources/         # Views, CSS, JS
│   │   ├── routes/            # API and web routes
│   │   ├── storage/           # Storage (cache, logs, sessions)
│   │   ├── tests/             # Unit and feature tests
│   │   ├── vendor/            # Composer dependencies
│   │   ├── composer.json      # PHP dependencies
│   │   ├── package.json       # Node dependencies for frontend assets
│   │   ├── vite.config.js     # Vite configuration
│   │   └── README.md          # Backend documentation
│   └── frontend/              # React frontend dashboard
│       ├── public/            # Static assets (index.html, icons, manifest)
│       ├── src/               # Source code (App.js, components, styles)
│       ├── package.json       # Node dependencies
│       └── README.md          # Frontend documentation
```

## Deployment Instructions

### Prerequisites
- Node.js (v16+ recommended)
- PHP (v8+ recommended)
- Composer
- MySQL or compatible database

### Backend (Laravel API)
1. Navigate to the backend folder:
   ```powershell
   cd smart_bin_project/backend
   ```
2. Install PHP dependencies:
   ```powershell
   composer install
   ```
3. Install Node dependencies:
   ```powershell
   npm install
   ```
4. Copy the example environment file and configure your settings:
   ```powershell
   copy .env.example .env
   # Edit .env to set your database credentials
   ```
5. Generate application key:
   ```powershell
   php artisan key:generate
   ```
6. Run database migrations and seeders:
   ```powershell
   php artisan migrate --seed
   ```
7. Start the Laravel development server:
   ```powershell
   php artisan serve
   ```
8. (Optional) Build frontend assets:
   ```powershell
   npm run build
   ```

### Frontend (React Dashboard)
1. Open a new terminal and navigate to the frontend folder:
   ```powershell
   cd smart_bin_project/frontend
   ```
2. Install Node dependencies:
   ```powershell
   npm install
   ```
3. Start the React development server:
   ```powershell
   npm start
   ```

### Hardware Integration
- Upload `arduino.ino` to your Arduino device using the Arduino IDE.
- Ensure UART drivers (e.g., `CP210x_Universal_Windows_Driver.zip`) are installed for serial communication.

### Database Setup
- Import `smartbin.sql` or `smart_bin_db.sql` into your MySQL database before running migrations if you want to pre-populate tables.

## Additional Notes
- Refer to `uiux_requirements.md` for UI/UX guidelines.
- For further details, see the individual `README.md` files in the backend and frontend folders.

---

For any issues, please contact the project maintainer or open an issue in the repository.
