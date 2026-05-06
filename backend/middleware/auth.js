function requireAdmin(req, res, next) {
  if (req.session && req.session.isAdmin) {
    return next();
  }

  if (req.path.startsWith('/api') || req.originalUrl.startsWith('/api')) {
    return res.status(401).json({ message: 'Admin login required.' });
  }

  return res.redirect('/admin/login');
}

module.exports = { requireAdmin };
