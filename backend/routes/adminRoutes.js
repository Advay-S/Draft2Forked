const express = require('express');
const bcrypt = require('bcryptjs');

const router = express.Router();

async function isValidPassword(password) {
  if (process.env.ADMIN_PASSWORD_HASH) {
    return bcrypt.compare(password, process.env.ADMIN_PASSWORD_HASH);
  }

  return password === process.env.ADMIN_PASSWORD;
}

router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  const expectedUsername = process.env.ADMIN_USERNAME || 'admin';

  if (username !== expectedUsername || !(await isValidPassword(password))) {
    return res.redirect('/admin/login?error=1');
  }

  req.session.isAdmin = true;
  return res.redirect('/admin/dashboard');
});

router.post('/logout', (req, res) => {
  req.session.destroy(() => {
    res.redirect('/admin/login');
  });
});

module.exports = router;
