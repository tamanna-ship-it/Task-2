const path = require('path');
const fs = require('fs');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');

const DB_PATH = path.join(__dirname, '..', '..', 'data', 'database.sqlite');

let db;

function getDb() {
  if (db) return db;

  const dataDir = path.dirname(DB_PATH);
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  db = new sqlite3.Database(DB_PATH, (err) => {
    if (err) {
      console.error('❌ Database connection error:', err.message);
      throw err;
    }
  });

  return db;
}

function runAsync(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function(err) {
      if (err) reject(err);
      else resolve({ lastID: this.lastID, changes: this.changes });
    });
  });
}

function getAsync(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
}

function allAsync(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
}

function execAsync(sql) {
  return new Promise((resolve, reject) => {
    db.exec(sql, (err) => {
      if (err) reject(err);
      else resolve();
    });
  });
}

async function initDb() {
  const database = getDb();

  // Enable WAL and foreign keys
  await runAsync('PRAGMA journal_mode=WAL');
  await runAsync('PRAGMA foreign_keys=ON');

  // Create tables
  await execAsync(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'staff' CHECK(role IN ('owner', 'manager', 'staff')),
      permissions TEXT DEFAULT '["dashboard", "appointments"]',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS staff (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      phone TEXT,
      role_type TEXT DEFAULT 'Full-Time',
      outlet TEXT,
      designation TEXT,
      status TEXT DEFAULT 'Active' CHECK(status IN ('Active', 'On Leave', 'Inactive')),
      rating REAL DEFAULT 0,
      join_date TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS appointments (
      id TEXT PRIMARY KEY,
      client_name TEXT NOT NULL,
      client_phone TEXT,
      client_email TEXT,
      client_dob TEXT,
      client_gender TEXT,
      service TEXT,
      staff_name TEXT,
      staff_id TEXT,
      manager_id INTEGER,
      date TEXT NOT NULL,
      time TEXT,
      duration TEXT,
      amount REAL DEFAULT 0,
      status TEXT DEFAULT 'Upcoming' CHECK(status IN ('Ongoing', 'Completed', 'Upcoming', 'Cancelled')),
      type TEXT DEFAULT 'Online Booking' CHECK(type IN ('Walk-in', 'Home Visit', 'Online Booking', 'Pre-booking')),
      appointment_type TEXT DEFAULT 'pre-booking' CHECK(appointment_type IN ('walkin-immediate', 'pre-booking', 'home-visit')),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (manager_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS staff_attendance (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      staff_id TEXT NOT NULL,
      date TEXT NOT NULL,
      clock_in TEXT,
      clock_out TEXT,
      status TEXT DEFAULT 'Present',
      FOREIGN KEY (staff_id) REFERENCES staff(id)
    );
  `);

  // Migrate staff_attendance table if it has restrictive CHECK constraint
  try {
    const tableSql = (await getAsync("SELECT sql FROM sqlite_master WHERE type='table' AND name='staff_attendance'"))?.sql || '';
    if (tableSql.includes("CHECK(status IN ('clocked-in'") && !tableSql.includes("'Leave'")) {
      await runAsync("ALTER TABLE staff_attendance RENAME TO staff_attendance_old");
      await execAsync(`
        CREATE TABLE staff_attendance (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          staff_id TEXT NOT NULL,
          date TEXT NOT NULL,
          clock_in TEXT,
          clock_out TEXT,
          status TEXT DEFAULT 'Present',
          FOREIGN KEY (staff_id) REFERENCES staff(id)
        );
      `);
      await execAsync("INSERT INTO staff_attendance (id, staff_id, date, clock_in, clock_out, status) SELECT id, staff_id, date, clock_in, clock_out, status FROM staff_attendance_old");
      await runAsync("DROP TABLE staff_attendance_old");
      console.log("✅ staff_attendance table migrated to allow all status values.");
    }
  } catch (err) {
    console.error("staff_attendance migration error:", err);
  }

  await execAsync(`
    CREATE TABLE IF NOT EXISTS leave_requests (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      staff_id TEXT NOT NULL,
      start_date TEXT NOT NULL,
      end_date TEXT NOT NULL,
      reason TEXT,
      status TEXT DEFAULT 'Pending' CHECK(status IN ('Pending', 'Approved', 'Rejected')),
      approved_by TEXT,
      rejected_by TEXT,
      half_day_type TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (staff_id) REFERENCES staff(id)
    );
  `);

  // Migrate leave_requests table if missing new columns
  try {
    const lrCols = (await allAsync('PRAGMA table_info(leave_requests)')).map(c => c.name);
    if (!lrCols.includes('approved_by')) {
      await runAsync('ALTER TABLE leave_requests ADD COLUMN approved_by TEXT');
    }
    if (!lrCols.includes('rejected_by')) {
      await runAsync('ALTER TABLE leave_requests ADD COLUMN rejected_by TEXT');
    }
    if (!lrCols.includes('half_day_type')) {
      await runAsync('ALTER TABLE leave_requests ADD COLUMN half_day_type TEXT');
    }
  } catch (err) {
    console.error('Migration error:', err);
  }

  await execAsync(`
    CREATE TABLE IF NOT EXISTS daily_collections (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      date TEXT NOT NULL,
      day_name TEXT,
      total_amount REAL DEFAULT 0,
      services_amount REAL DEFAULT 0,
      retail_amount REAL DEFAULT 0,
      membership_amount REAL DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS activity_log (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      action TEXT NOT NULL,
      description TEXT,
      module TEXT,
      user_name TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS reports_cache (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      report_type TEXT NOT NULL,
      period TEXT,
      data TEXT,
      generated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Migrate users table if missing permissions column
  try {
    const userCols = (await allAsync('PRAGMA table_info(users)')).map(c => c.name);
    if (!userCols.includes('permissions')) {
      await runAsync("ALTER TABLE users ADD COLUMN permissions TEXT DEFAULT '[\"dashboard\", \"appointments\"]'");
      console.log('✅ permissions column added to users table');
    }
  } catch (err) {
    console.error('Users permissions migration error:', err);
  }

  // Migrate appointments table if missing manager_id column
  try {
    const aptCols = (await allAsync('PRAGMA table_info(appointments)')).map(c => c.name);
    if (!aptCols.includes('manager_id')) {
      await runAsync("ALTER TABLE appointments ADD COLUMN manager_id INTEGER REFERENCES users(id)");
      console.log('✅ manager_id column added to appointments table');
    }
    await execAsync(`
      CREATE INDEX IF NOT EXISTS idx_appointments_manager_id ON appointments(manager_id);
      CREATE INDEX IF NOT EXISTS idx_appointments_date_status ON appointments(date, status);
    `);
  } catch (err) {
    console.error('Appointments manager_id migration error:', err);
  }

  // Seed default users if empty
  const userCount = await getAsync('SELECT COUNT(*) as count FROM users');
  if (userCount.count === 0) {
    const hash = bcrypt.hashSync('password123', 10);
    await runAsync('INSERT INTO users (email, password, role, permissions) VALUES (?, ?, ?, ?)', ['owner@esteticanow.com', hash, 'owner', '["all"]']);
    await runAsync('INSERT INTO users (email, password, role, permissions) VALUES (?, ?, ?, ?)', ['manager@esteticanow.com', hash, 'manager', '["dashboard", "appointments"]']);
    await runAsync('INSERT INTO users (email, password, role, permissions) VALUES (?, ?, ?, ?)', ['staff@esteticanow.com', hash, 'staff', '["staff"]']);
    console.log('✅ Default users seeded.');
  }

  // Ensure default manager and staff records have proper permissions
  const managerUser = await getAsync("SELECT * FROM users WHERE role = 'manager'");
  if (managerUser) {
    await runAsync("UPDATE users SET permissions = ? WHERE id = ?", ['["dashboard", "appointments"]', managerUser.id]);
    await runAsync("UPDATE appointments SET manager_id = ? WHERE manager_id IS NULL", [managerUser.id]);
  }
  const staffUser = await getAsync("SELECT * FROM users WHERE role = 'staff'");
  if (staffUser) {
    await runAsync("UPDATE users SET permissions = ? WHERE id = ?", ['["dashboard"]', staffUser.id]);
  }

  // Seed staff data if empty or missing screenshot members
  const staffCheck = await getAsync('SELECT COUNT(*) as count FROM staff WHERE id = ?', ['EMP010']);
  if (!staffCheck || staffCheck.count === 0) {
    await runAsync('DELETE FROM staff');
    await execAsync(`
      INSERT INTO staff (id, name, email, phone, role_type, outlet, designation, status, rating, join_date) VALUES
        ('EMP001', 'Alachandra', 'alachandra@estetica.com', '+91 98765 43210', 'Full-Time', 'Main Branch', 'Hair Stylist', 'Active', 4.9, 'Jan 2022'),
        ('EMP002', 'asd', 'asd@estetica.com', '+91 98765 43211', 'Full-Time', 'Main Branch', 'Hair Stylist', 'Active', 4.5, 'Feb 2023'),
        ('EMP003', 'ashwinia', 'ashwinia@estetica.com', '+91 98765 43212', 'Part-Time', 'Bandra Branch', 'Nail Tech', 'Active', 4.7, 'Mar 2023'),
        ('EMP004', 'Doctor', 'doctor@estetica.com', '+91 98765 43213', 'Full-Time', 'Powai Branch', 'Senior Doctor', 'Active', 4.8, 'Feb 2021'),
        ('EMP005', 'Dr.Thanos', 'thanos@estetica.com', '+91 98765 43214', 'Full-Time', 'Main Branch', 'Chief Doctor', 'Active', 5.0, 'Aug 2020'),
        ('EMP006', 'Lady', 'lady@estetica.com', '+91 98765 43215', 'Full-Time', 'Main Branch', 'Hair Stylist', 'Active', 4.9, 'Jan 2023'),
        ('EMP007', 'Revanth', 'revanth@estetica.com', '+91 98765 43216', 'Full-Time', 'Main Branch', 'Hair Stylist', 'Active', 4.8, 'May 2022'),
        ('EMP008', 'Kruthika Reddy Bokka', 'kruthika@estetica.com', '+91 98765 43217', 'Full-Time', 'Bandra Branch', 'Hair Stylist', 'Active', 4.7, 'Jul 2022'),
        ('EMP009', 'Susmitha', 'susmitha@estetica.com', '+91 98765 43218', 'Full-Time', 'Main Branch', 'Senior Stylist', 'Active', 4.9, 'Nov 2021'),
        ('EMP010', 'Testing 2', 'testing2@estetica.com', '+91 98765 43219', 'Contract', 'Powai Branch', 'Stylist', 'Active', 4.2, 'Jan 2024');
    `);
  }

  // Seed Leave Requests if empty
  const leaveCheck = await getAsync('SELECT COUNT(*) as count FROM leave_requests');
  if (leaveCheck.count === 0) {
    await execAsync(`
      INSERT INTO leave_requests (staff_id, start_date, end_date, reason, status, approved_by, rejected_by, half_day_type) VALUES
        ('EMP006', '2026-07-20', '2026-07-20', 'nothing', 'Approved', 'Rishita', NULL, NULL),
        ('EMP007', '2026-05-27', '2026-05-27', 'Personal work', 'Rejected', NULL, 'Rishita', NULL),
        ('EMP008', '2026-05-27', '2026-05-30', 'ok', 'Pending', NULL, NULL, NULL),
        ('EMP008', '2026-05-23', '2026-05-23', 'ok', 'Pending', NULL, NULL, 'First Half'),
        ('EMP007', '2026-05-28', '2026-05-28', 'ok', 'Pending', NULL, NULL, 'Second Half');
    `);
  } else {
    await runAsync("UPDATE leave_requests SET approved_by = 'Rishita' WHERE approved_by = 'Vamsi'");
    await runAsync("UPDATE leave_requests SET rejected_by = 'Rishita' WHERE rejected_by = 'Vamsi'");
  }

  // Ensure daily collections for last 7 days exist
  await runAsync('DELETE FROM daily_collections');
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const amounts = [
    { total: 620000, svc: 480000, ret: 100000, mem: 40000 },
    { total: 750000, svc: 550000, ret: 150000, mem: 50000 },
    { total: 680000, svc: 500000, ret: 120000, mem: 60000 },
    { total: 440000, svc: 320000, ret: 80000, mem: 40000 },
    { total: 790000, svc: 600000, ret: 140000, mem: 50000 },
    { total: 850000, svc: 650000, ret: 150000, mem: 50000 },
    { total: 510000, svc: 400000, ret: 80000, mem: 30000 },
  ];
  for (let i = 0; i < 7; i++) {
    const d = new Date(Date.now() - (6 - i) * 86400000);
    const dateStr = d.toISOString().split('T')[0];
    const dayName = days[d.getDay() === 0 ? 6 : d.getDay() - 1];
    await runAsync(
      'INSERT INTO daily_collections (date, day_name, total_amount, services_amount, retail_amount, membership_amount) VALUES (?, ?, ?, ?, ?, ?)',
      [dateStr, dayName, amounts[i].total, amounts[i].svc, amounts[i].ret, amounts[i].mem]
    );
  }

  // Seed sample appointments
  const aptCheck = await getAsync('SELECT COUNT(*) as count FROM appointments');
  if (aptCheck.count === 0) {
    const today = new Date().toISOString().split('T')[0];
    const mgr = await getAsync("SELECT id FROM users WHERE role = 'manager'");
    const mgrId = mgr ? mgr.id : 2;
    await execAsync(`
      INSERT INTO appointments (id, client_name, client_phone, service, staff_name, staff_id, manager_id, date, time, duration, amount, status, type) VALUES
        ('APT001', 'Revanth', '+91 98765 43210', 'Hair Cut & Styling', 'Revanth', 'EMP007', ${mgrId}, '${today}', '10:30 AM', '1h 30m', 790000, 'Completed', 'Online Booking'),
        ('APT002', 'Susmitha', '+91 98765 43211', 'Facial & Care', 'Susmitha', 'EMP009', ${mgrId}, '${today}', '11:00 AM', '45m', 740000, 'Completed', 'Walk-in'),
        ('APT003', 'Dr.Thanos', '+91 98765 43212', 'Laser Treatment', 'Dr.Thanos', 'EMP005', ${mgrId}, '${today}', '9:00 AM', '2h 00m', 680000, 'Completed', 'Online Booking'),
        ('APT004', 'Testing 2', '+91 98765 43213', 'Full Hair Treatment', 'Testing 2', 'EMP010', ${mgrId}, '${today}', '11:15 AM', '1h 00m', 440000, 'Completed', 'Online Booking'),
        ('APT005', 'Lady', '+91 98765 43214', 'Blow Dry', 'Lady', 'EMP006', ${mgrId}, '${today}', '2:00 PM', '1h 00m', 100000, 'Completed', 'Home Visit');
    `);
  }

  // Seed activity log
  const actCount = await getAsync('SELECT COUNT(*) as count FROM activity_log');
  if (actCount.count === 0) {
    await execAsync(`
      INSERT INTO activity_log (action, description, module, user_name) VALUES
        ('Appointment Created', 'New appointment for Ananya Iyer - Hair Coloring & Styling', 'Appointments', 'Priya Sharma'),
        ('Staff Clocked In', 'Vikram Singh clocked in at 10:00 AM', 'Attendance', 'Vikram Singh'),
        ('Payment Received', 'Payment of ₹8,500 received from Ritu Agarwal', 'Payments', 'Sneha Reddy'),
        ('New Client Registered', 'Kavita Joshi registered as new client', 'Clients', 'System'),
        ('Staff Leave Approved', 'Neha Gupta leave request approved', 'Staff', 'Owner'),
        ('Appointment Cancelled', 'Appointment cancelled by client', 'Appointments', 'System'),
        ('Daily Report Generated', 'Daily sales report generated', 'Reports', 'Owner'),
        ('Inventory Updated', 'Stock level updated for Professional Hair Color', 'Inventory', 'Manager');
    `);
  }

  console.log('✅ Database initialized with all tables and sample data.');
  return database;
}

// User model helper functions for existing auth routes
const dbQuery = {
  getUserByEmail: async (email) => {
    return await getAsync('SELECT * FROM users WHERE email = ?', [email]);
  },
  getUserById: async (id) => {
    return await getAsync('SELECT * FROM users WHERE id = ?', [id]);
  },
  getUserCount: async () => {
    const row = await getAsync('SELECT COUNT(*) as count FROM users');
    return row.count;
  },
  createUser: async ({ email, passwordHash, role }) => {
    const result = await runAsync(
      'INSERT INTO users (email, password, role) VALUES (?, ?, ?)',
      [email, passwordHash, role]
    );
    return await getAsync('SELECT * FROM users WHERE id = ?', [result.lastID]);
  }
};

module.exports = { getDb, initDb, runAsync, getAsync, allAsync, execAsync, dbQuery };