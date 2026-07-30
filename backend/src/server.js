const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const authRoutes = require('./routes/authRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const { initDb } = require('./config/db');

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS for frontend dev server
app.use(cors({
  origin: ['http://localhost:5174','http://localhost:5173', 'http://127.0.0.1:5173', 'http://localhost:3000'],
  credentials: true
}));

// Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api', dashboardRoutes);

// Root route info page
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>Role-Based Auth API Server</title>
        <style>
          body { font-family: system-ui, sans-serif; background: #0f172a; color: #f8fafc; padding: 40px; text-align: center; }
          .card { background: #1e293b; max-width: 600px; margin: 0 auto; padding: 30px; border-radius: 16px; border: 1px solid #334155; }
          h1 { color: #818cf8; margin-top: 0; }
          a { color: #38bdf8; text-decoration: none; font-weight: bold; }
          a:hover { text-decoration: underline; }
          .endpoint { background: #0f172a; padding: 8px 12px; border-radius: 8px; font-family: monospace; font-size: 14px; text-align: left; margin: 8px 0; border: 1px solid #334155; }
        </style>
      </head>
      <body>
        <div class="card">
          <h1>⚡ Estetica Auth API Backend</h1>
          <p>This port (<strong>${PORT}</strong>) is the Express REST API backend server.</p>
          <p>👉 To access the <strong>React User Interface</strong>, please open: <br/><br/>
            <a href="http://localhost:5173" style="font-size: 20px; background: #4f46e5; color: white; padding: 12px 24px; border-radius: 12px; display: inline-block;">Open React Frontend App (http://localhost:5173)</a>
          </p>
          <hr style="border-color: #334155; margin: 24px 0;"/>
          <h3>Available API Endpoints:</h3>
          <div class="endpoint">POST /api/auth/login</div>
          <div class="endpoint">GET  /api/auth/me</div>
          <div class="endpoint">GET  /api/owner/dashboard</div>
          <div class="endpoint">GET  /api/owner/staff</div>
          <div class="endpoint">GET  /api/owner/appointments</div>
          <div class="endpoint">GET  /api/owner/reports</div>
          <div class="endpoint">POST /api/owner/staff (Create staff)</div>
          <div class="endpoint">PUT  /api/owner/staff/:id (Update staff)</div>
          <div class="endpoint">POST /api/owner/appointments (Create appointment)</div>
          <div class="endpoint">GET  /api/activity-log</div>
          <div class="endpoint">GET  /api/owner/reports/export</div>
        </div>
      </body>
    </html>
  `);
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'Role-Based Authentication Backend'
  });
});

// Fallback error handler
app.use((err, req, res, next) => {
  console.error('Unhandled Server Error:', err);
  res.status(500).json({
    success: false,
    message: 'An unexpected internal server error occurred.'
  });
});

// Initialize DB then start server
initDb().then(() => {
  app.listen(PORT, () => {
    console.log(`=================================================`);
    console.log(`⚡ Backend running on http://localhost:${PORT}`);
    console.log(`🔐 Role-Based Auth Endpoints available at:`);
    console.log(`   - POST http://localhost:${PORT}/api/auth/login`);
    console.log(`   - GET  http://localhost:${PORT}/api/auth/me`);
    console.log(`   - GET  http://localhost:${PORT}/api/owner/dashboard`);
    console.log(`   - GET  http://localhost:${PORT}/api/owner/staff`);
    console.log(`   - GET  http://localhost:${PORT}/api/owner/appointments`);
    console.log(`   - GET  http://localhost:${PORT}/api/owner/reports`);
    console.log(`=================================================`);
  });
}).catch(err => {
  console.error('❌ Failed to initialize database:', err);
  process.exit(1);
});