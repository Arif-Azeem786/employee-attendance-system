const express = require('express');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const morgan = require('morgan');
const cors = require('cors');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares
app.use(express.json());
app.use(cors());
app.use(morgan('dev'));

// Simple root
app.get('/', (req, res) => {
  res.json({ message: 'Attendance System Backend Running' });
});

// --- TEMP: quick test endpoint (bypasses routers) ---
app.post('/test-register', (req, res) => {
  // echo body for quick debug
  return res.json({ ok: true, msg: 'test-register reached', body: req.body || null });
});

// Route placeholders (we will mount real routers below)
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/attendance', require('./routes/attendanceRoutes'));
app.use('/api/dashboard', require('./routes/dashboardRoutes'));

// --- TEMP: print all registered routes for debugging ---
function listRoutes(stack, prefix = '') {
  const routes = [];
  stack.forEach((layer) => {
    if (layer.route && layer.route.path) {
      const methods = Object.keys(layer.route.methods).join(',').toUpperCase();
      routes.push(`${methods} ${prefix}${layer.route.path}`);
    } else if (layer.name === 'router' && layer.handle && layer.handle.stack) {
      // express router
      const newPrefix = layer.regexp && layer.regexp.source
        ? (layer.regexp.source.replace('^\\', '').replace('\\/?(?=\\/|$)', '').replace('\\/', '/').replace('(?=\\/|$)', '') || '')
        : '';
      routes.push(...listRoutes(layer.handle.stack, newPrefix));
    }
  });
  return routes;
}

setTimeout(() => {
  try {
    if (app._router && app._router.stack) {
      console.log('----- Registered routes -----');
      const found = listRoutes(app._router.stack, '');
      found.forEach(r => console.log(r));
      console.log('-----------------------------');
    } else {
      console.log('No router stack found yet.');
    }
  } catch (err) {
    console.error('Error listing routes:', err);
  }
}, 500); // wait a moment so routers are mounted

// Start server + MongoDB
async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });

    console.log('✅ MongoDB connected');

    app.listen(PORT, () =>
      console.log(`✅ Server running on port: ${PORT}`)
    );
  } catch (error) {
    console.error('❌ DB connection failed:', error);
    process.exit(1);
  }
}

connectDB();
