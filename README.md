# Rachanatmak Portfolio

A minimal full-stack portfolio website for the artist brand **Rachanatmak**, inspired by clean grid-based studio portfolios.

## Tech Stack

- Frontend: HTML, CSS, Vanilla JavaScript
- Backend: Node.js, Express
- Database: MongoDB
- Image storage: Cloudinary
- Email: Nodemailer

## Setup

1. Install Node.js and MongoDB.
2. Create a Cloudinary account and copy your cloud name, API key, and API secret.
3. Copy `.env.example` to `.env` and fill in the values.
4. Install dependencies:

```bash
npm install
```

5. Start the server:

```bash
npm run dev
```

6. Open:

```text
http://localhost:5000
```

## Admin Panel

- Login: `http://localhost:5000/admin/login`
- Dashboard: `http://localhost:5000/admin/dashboard`

Set `ADMIN_USERNAME` and `ADMIN_PASSWORD` in `.env`. For production, prefer `ADMIN_PASSWORD_HASH`.

To generate a password hash:

```bash
node -e "const bcrypt=require('bcryptjs'); bcrypt.hash('your-password', 12).then(console.log)"
```

Then paste the output into `ADMIN_PASSWORD_HASH` and remove `ADMIN_PASSWORD`.

## API Routes

- `GET /api/works` fetches all artworks.
- `POST /api/works` adds an artwork. Requires admin login.
- `DELETE /api/works/:id` deletes an artwork. Requires admin login.
- `POST /api/contact` sends contact form email.

## Folder Structure

```text
/frontend
  index.html
  works.html
  about.html
  contact.html
  /css
  /js
/backend
  server.js
  /routes
  /models
  /controllers
  /middleware
  /views
/uploads
```
