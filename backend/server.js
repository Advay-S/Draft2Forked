require('dotenv').config();

const path = require('path');
const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const cloudinary = require('cloudinary').v2;

const worksRoutes = require('./routes/worksRoutes');
const contactRoutes = require('./routes/contactRoutes');
const adminRoutes = require('./routes/adminRoutes');
const demoArtRoutes = require('./routes/demoArtRoutes');
const { requireAdmin } = require('./middleware/auth');

const app = express();
const PORT = process.env.PORT || 5000;
const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/rachanatmak';
const shouldUseMongoStore = Boolean(process.env.MONGODB_URI) && process.env.USE_MEMORY_SESSION !== 'true';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(
  session({
    name: 'rachanatmak.sid',
    secret: process.env.SESSION_SECRET || 'dev-only-session-secret',
    resave: false,
    saveUninitialized: false,
    store: shouldUseMongoStore ? MongoStore.create({ mongoUrl: mongoUri }) : undefined,
    cookie: {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      maxAge: 1000 * 60 * 60 * 8
    }
  })
);

const frontendPath = path.join(__dirname, '..', 'frontend');
const viewsPath = path.join(__dirname, 'views');

app.use('/css', express.static(path.join(frontendPath, 'css')));
app.use('/js', express.static(path.join(frontendPath, 'js')));

app.use('/api/works', worksRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/demo-art', demoArtRoutes);
app.use('/admin', adminRoutes);

app.get('/admin/login', (req, res) => {
  if (req.session.isAdmin) {
    return res.redirect('/admin/dashboard');
  }

  return res.sendFile(path.join(viewsPath, 'admin-login.html'));
});

app.get('/admin/dashboard', requireAdmin, (req, res) => {
  res.sendFile(path.join(viewsPath, 'admin-dashboard.html'));
});

app.use(express.static(frontendPath));

app.get('/', (req, res) => {
  res.sendFile(path.join(frontendPath, 'index.html'));
});

app.use('/api', (req, res) => {
  res.status(404).json({ message: 'API route not found.' });
});

// Keep upload and validation failures readable for the admin dashboard.
app.use((error, req, res, next) => {
  if (req.originalUrl.startsWith('/api')) {
    return res.status(400).json({ message: error.message || 'Request failed.' });
  }

  return next(error);
});

app.use((req, res) => {
  res.status(404).sendFile(path.join(frontendPath, 'index.html'));
});

async function startServer() {
  try {
    await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 3000 });
  } catch (error) {
    console.warn('MongoDB is not connected. Running local preview mode with demo artworks.');
  }

  try {
    app.listen(PORT, () => {
      console.log(`Rachanatmak is running at http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Could not start server:', error.message);
    process.exit(1);
  }
}

startServer();
