🗑️ Smart Bin IoT Dashboard

A full-stack web application designed to monitor Smart Waste Bins. This dashboard visualizes real-time fill levels, battery status, and system alerts, allowing administrators to manage waste collection efficiently.

🚀 Tech Stack

Frontend:

React.js (v18+)

Chart.js (Data Visualization)

Axios (API Requests)

CSS3 (Custom Responsive Design)

Backend:

Laravel 11 (PHP Framework)

MySQL (Database)

RESTful API Architecture

Environment:

XAMPP (Apache Server & MySQL)

Node.js & Composer

📂 Project Structure

The project is divided into two main directories:

SmartBinProject/
├── backend/       # Laravel API (Server-side logic)
├── frontend/      # React App (Client-side UI)
└── README.md      # Project Documentation


🛠️ Installation Guide

Follow these steps to set up the project locally.

1. Prerequisites

Ensure you have the following installed:

XAMPP (Start Apache & MySQL)

Node.js

Composer

2. Database Setup

Open phpMyAdmin (http://localhost/phpmyadmin).

Create a new database named: smart_bin_db.

(Optional) The Laravel migrations will create the tables for you automatically in step 3.

3. Backend Setup (Laravel)

Open a terminal and navigate to the backend folder:

cd backend


Install dependencies:

composer install


Configure Environment:

Copy .env.example to .env.

Open .env and set the database connection:

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=smart_bin_db
DB_USERNAME=root
DB_PASSWORD=


Run Migrations (Create Tables) & Start Server:

php artisan migrate
php artisan serve


The backend runs on: http://127.0.0.1:8000

4. Frontend Setup (React)

Open a new terminal (keep the backend running) and navigate to the frontend folder:

cd frontend


Install dependencies:

npm install


Start the React App:

npm start


The frontend runs on: http://localhost:3000

📡 API Endpoints

The Backend exposes the following REST API endpoints:

Method

Endpoint

Description

GET

/api/v1/dashboard/stats

Returns total bins, active alerts, and chart data.

GET

/api/v1/bins

Returns a list of all smart bins.

POST

/api/v1/bins/add

Adds a new bin to the database.

GET

/api/v1/alerts

Returns a list of active system alerts.

✨ Features

Dashboard: Real-time visualization of average fill levels (Chart.js) and quick stats.

Bin Management: View status, battery level, and fill percentage of all bins.

Add Bin: Interactive modal to register new bins into the system.

Alerts: Monitor critical events (e.g., "Fire Detected", "Bin Overflow").

🐛 Troubleshooting

1. API 404 Not Found?
If the backend returns 404, ensure API routes are installed:

cd backend
php artisan install:api


2. React "useRef" or Version Error?
If npm start fails with "useRef" errors, you may have conflicting versions. Run:

cd frontend
rm -rf node_modules package-lock.json
npm install


3. Database Connection Refused?
Ensure XAMPP MySQL is running (Green light in Control Panel).