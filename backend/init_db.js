require('dotenv').config();
const mysql = require('mysql2/promise');

const rawUri = process.env.DATABASE_URL || '';
if (!rawUri) {
    console.error("❌ DATABASE_URL environment variable is required.");
    process.exit(1);
}

// Strip query parameters for mysql2 URI parsing
const cleanUri = rawUri.split('?')[0];
const baseUri = cleanUri.substring(0, cleanUri.lastIndexOf('/'));
const defaultDbUri = `${baseUri}/defaultdb`;
const campusRideDbUri = `${baseUri}/Campus-ride`;

const queries = [
    `CREATE TABLE IF NOT EXISTS students (
        id INT AUTO_INCREMENT PRIMARY KEY,
        full_name VARCHAR(255),
        bus_id VARCHAR(100),
        course VARCHAR(100),
        branch_semester VARCHAR(100),
        contact_number VARCHAR(50),
        email_id VARCHAR(255) UNIQUE,
        address TEXT,
        password VARCHAR(255),
        role VARCHAR(50) DEFAULT 'student',
        profile_image LONGTEXT
    )`,
    `CREATE TABLE IF NOT EXISTS drivers (
        id INT AUTO_INCREMENT PRIMARY KEY,
        full_name VARCHAR(255),
        driver_id VARCHAR(100) UNIQUE,
        bus_id VARCHAR(100),
        bus_number VARCHAR(100),
        contact_number VARCHAR(50),
        email_id VARCHAR(255),
        address TEXT,
        password VARCHAR(255),
        role VARCHAR(50) DEFAULT 'driver',
        profile_image LONGTEXT,
        route VARCHAR(255),
        waypoints JSON,
        latitude DECIMAL(10, 8),
        longitude DECIMAL(11, 8)
    )`,
    `CREATE TABLE IF NOT EXISTS management (
        id INT AUTO_INCREMENT PRIMARY KEY,
        management_id VARCHAR(100) UNIQUE,
        full_name VARCHAR(255),
        email_id VARCHAR(255) UNIQUE,
        address TEXT,
        password VARCHAR(255),
        role VARCHAR(50) DEFAULT 'management',
        profile_image LONGTEXT
    )`,
    `CREATE TABLE IF NOT EXISTS otps (
        id INT AUTO_INCREMENT PRIMARY KEY,
        email VARCHAR(255),
        otp VARCHAR(10),
        expires_at DATETIME
    )`,
    `CREATE TABLE IF NOT EXISTS bus_tracking (
        bus_number VARCHAR(50) PRIMARY KEY,
        distance FLOAT,
        arrival_time INT,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )`,
    `CREATE TABLE IF NOT EXISTS attendance (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id VARCHAR(100),
        attendance_type VARCHAR(50),
        date_str VARCHAR(20),
        status VARCHAR(20),
        UNIQUE KEY uq_attendance (user_id, attendance_type, date_str)
    )`,
    `CREATE TABLE IF NOT EXISTS generic_reports (
        id INT AUTO_INCREMENT PRIMARY KEY,
        report_type VARCHAR(50),
        reference_id VARCHAR(100),
        data JSON,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`,
    `CREATE TABLE IF NOT EXISTS notifications (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        message TEXT NOT NULL,
        role VARCHAR(50) DEFAULT 'all',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`
];

async function initializeDatabase() {
    console.log("Connecting to defaultdb to create database `Campus-ride`...");
    let connection;
    try {
        connection = await mysql.createConnection({
            uri: defaultDbUri,
            ssl: { rejectUnauthorized: false }
        });
        await connection.query("CREATE DATABASE IF NOT EXISTS `Campus-ride`;");
        console.log("Database `Campus-ride` verified/created successfully.");
        await connection.end();

        console.log("Connecting to `Campus-ride` database to initialize tables...");
        connection = await mysql.createConnection({
            uri: campusRideDbUri,
            ssl: { rejectUnauthorized: false }
        });

        for (let query of queries) {
            await connection.query(query);
            const tableName = query.match(/CREATE TABLE IF NOT EXISTS ([a-z_]+)/i)[1];
            console.log(`Executed Table Creation: ${tableName}`);
        }

        // Seed notifications if empty
        const [rows] = await connection.query("SELECT COUNT(*) as count FROM notifications");
        if (rows[0].count === 0) {
            await connection.query(`
                INSERT INTO notifications (title, message, role) VALUES 
                ('Welcome to Campus-Ride!', 'We are excited to have you on board. You can track your bus and mark attendance in real-time.', 'student'),
                ('Delayed Route Alert', 'Bus service updates will be shown here.', 'student'),
                ('Notice', 'Bus services operating as scheduled.', 'all')
            `);
            console.log("Seeded default notifications.");
        }

        console.log("✅ All tables created and initialized successfully on `Campus-ride` database!");
    } catch (err) {
        console.error("❌ Database Initialization Error:", err);
    } finally {
        if (connection && connection.connection && !connection.connection._ending) {
            await connection.end();
        }
    }
}

initializeDatabase();
