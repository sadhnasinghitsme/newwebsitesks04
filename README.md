# SKS World School – Form Backend

Node.js + Express + MongoDB backend for the website's three forms:

| Form | Where on the site | API endpoint |
|---|---|---|
| Admission Enquiry | Popup on every page ("Apply Now", "Enquire Now") and the form on `contact.html` | `POST /api/admission-enquiry` |
| Contact Us | "Send Us a Message" on `contact.html` | `POST /api/contact` |
| Careers | "Apply Now" on `careers.html` (with PDF resume) | `POST /api/careers` |

For every submission the server:

1. checks the rate limit and the hidden spam-trap field
2. validates the fields (10-digit Indian mobile number, valid email, required fields; resume must be a real PDF of at most 2 MB)
3. saves it in MongoDB with the date and time (`createdAt`)
4. replies to the website, which shows a success or error message without reloading the page
5. emails the school all the details (with the resume attached for job applications), and sends the visitor a thank-you email if they gave an email address

There is no admin panel or login. To read submissions, use the emails, or open the database in
[MongoDB Compass](https://www.mongodb.com/products/compass) (free): collections `admissionenquiries`, `contactmessages`, `careerapplications`.

---

## Folder structure

```
backend/
├── server.js               starts the app
├── config/                 settings (.env), database and email connections
├── models/                 MongoDB schemas, one per form
├── routes/formRoutes.js    the three API endpoints and their checks, in order
├── controllers/            save the submission, reply, send the emails
├── middleware/             CORS, rate limit, spam trap, validation, PDF upload, errors
└── utils/                  validation rules and email templates
```

The website side is in `SKS-World-School-GNW-Website/assets/js/main.js` (search for `API_BASE`).

---

## Run it on your computer

You need **Node.js 20 or newer** and **MongoDB** (installed locally, or a free MongoDB Atlas database).

```bash
cd backend
npm install
cp .env.example .env        # on Windows: copy .env.example .env
```

Open `.env` and check the values (see the next section). For a local test you can leave the email settings empty: emails are then printed in the terminal instead of being sent.

Make sure MongoDB is running (Windows: open **Services** and start **MongoDB**, or run `net start MongoDB` as administrator). Then:

```bash
npm start
```

Open **http://localhost:5000**. With `STATIC_DIR` set, this one server shows the website *and* handles its forms.

Check that everything is connected: http://localhost:5000/api/health should show `{"ok":true,"db":"connected"}`.

---

## Settings (`.env`)

| Setting | What it is |
|---|---|
| `PORT` | Port the server listens on (default 5000) |
| `MONGODB_URI` | MongoDB connection string. Local: `mongodb://127.0.0.1:27017/sks_world_school`. Atlas: copy it from *Connect → Drivers* |
| `ALLOWED_ORIGINS` | Website address(es) allowed to send forms, comma-separated, no trailing slash, e.g. `https://skswsgnw.ac.in,https://www.skswsgnw.ac.in`. Forms sent from any other website are refused. A page served by this same server is always allowed |
| `STATIC_DIR` | Path to the website folder, to serve the site from this server. Leave empty if the site is hosted elsewhere |
| `TRUST_PROXY` | Set to `1` when behind Nginx, Render, Railway, Heroku etc., so the rate limit sees each visitor's real IP |
| `RATE_LIMIT_WINDOW_MINUTES`, `RATE_LIMIT_MAX` | Max accepted submissions per IP address, per form, per window (default 5 per 15 minutes). Submissions rejected for invalid fields don't count |
| `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `SMTP_USER`, `SMTP_PASS` | Email account used to send. Empty `SMTP_HOST` = print emails in the terminal only |
| `MAIL_FROM` | Sender shown on the emails |
| `SCHOOL_EMAIL` | Who receives admission and contact alerts (comma-separated for several people) |
| `CAREERS_EMAIL` | Who receives job applications; falls back to `SCHOOL_EMAIL` |

**Gmail / Google Workspace:** `SMTP_HOST=smtp.gmail.com`, `SMTP_PORT=465`, `SMTP_SECURE=true`, `SMTP_USER=` the full address, and `SMTP_PASS=` an **App Password** (Google Account → Security → 2-Step Verification → App passwords), not the normal password. Gmail allows about 500 emails a day; for more, use a service such as Brevo, Amazon SES or Zoho Mail with their SMTP details.

When the server starts it prints `SMTP ready` if the email settings work, or the reason they don't.

Never share or commit the `.env` file. It is listed in `.gitignore`.

---

## Deploy

### Option A – one server for the website and the forms (simplest)

Use a VPS (e.g. DigitalOcean, Hostinger VPS, AWS Lightsail) with Node.js installed.

1. Copy both folders (`backend` and `SKS-World-School-GNW-Website`) to the server, side by side.
2. In `backend`: `npm install --omit=dev`, then create `.env` with:
   - `MONGODB_URI` → your MongoDB Atlas string (or a MongoDB installed on the server)
   - `STATIC_DIR=../SKS-World-School-GNW-Website`
   - `ALLOWED_ORIGINS=https://skswsgnw.ac.in,https://www.skswsgnw.ac.in`
   - `TRUST_PROXY=1` and the email settings
3. Keep it running with PM2:
   ```bash
   npm install -g pm2
   pm2 start server.js --name sks-backend
   pm2 save && pm2 startup
   ```
4. Put Nginx in front for the domain and HTTPS (free certificate with Certbot):
   ```nginx
   server {
     server_name skswsgnw.ac.in www.skswsgnw.ac.in;
     client_max_body_size 3m;            # allows the 2 MB resume upload
     location / { proxy_pass http://127.0.0.1:5000; proxy_set_header Host $host; proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for; proxy_set_header X-Forwarded-Proto $scheme; }
   }
   ```
   then `sudo certbot --nginx -d skswsgnw.ac.in -d www.skswsgnw.ac.in`.

Leave `API_BASE` empty in `assets/js/main.js`.

### Option B – website and backend hosted separately

For example, the website on Netlify / cPanel hosting and the backend on Render or Railway.

1. Deploy the `backend` folder as a Node.js web service: build command `npm install`, start command `npm start`. Add the `.env` values as environment variables in the host's dashboard, with `STATIC_DIR` empty and `TRUST_PROXY=1`.
2. Give the backend its own address, e.g. `https://api.skswsgnw.ac.in`.
3. In the website's `assets/js/main.js`, set `const API_BASE="https://api.skswsgnw.ac.in";` and upload the website again.
4. Make sure `ALLOWED_ORIGINS` lists the website's exact address(es).

Resumes are never written to disk: each one is held in memory and sent to HR as an email attachment, so the backend also runs on read-only hosts such as Vercel. The email is the only copy of a resume, so make sure the SMTP settings work.

### MongoDB Atlas (free database in the cloud)

1. Create a free cluster at https://www.mongodb.com/atlas.
2. *Database Access*: add a user with a strong password.
3. *Network Access*: add your server's IP address (or `0.0.0.0/0` if the host has no fixed IP).
4. *Connect → Drivers*: copy the connection string into `MONGODB_URI`, with the database name `sks_world_school` before the `?`.

---

## Security built in

- **Rate limiting** on every form, per IP address (`express-rate-limit`).
- **Honeypot**: every form has a hidden `website` field that people never see. Bots that fill it get a fake "thank you" and nothing is saved or emailed.
- **CORS**: only the domains in `ALLOWED_ORIGINS` (and the server itself) can submit; other sites get `403`.
- **Validation on the server** for every field, even though the website checks them too.
- **Resume uploads**: PDF only (file type, `.pdf` extension *and* the file's actual content are checked), max 2 MB, kept in memory only and emailed to HR, never stored or served publicly.
- **Security headers** on the API (`helmet`), request size limits, and all visitor input is escaped in emails.
- Emails are sent after the visitor gets their reply, so a slow or failing mail server never loses a submission. Each saved record shows whether the school alert and thank-you email went out (`schoolNotified`, `userNotified`).

## API reference

All endpoints answer with JSON: `{ "ok": true, "message": "..." }` on success (`201`), or `{ "ok": false, "message": "...", "errors": { "field": "problem" } }` on failure (`400` invalid, `403` other website, `429` too many submissions, `500` server error).

| Endpoint | Body | Fields |
|---|---|---|
| `POST /api/admission-enquiry` | JSON | `parent`*, `phone`*, `email`, `grade`*, `message`, `source` (`popup` / `contact-page`) |
| `POST /api/contact` | JSON | `name`*, `phone`*, `email`*, `subject`*, `message`* |
| `POST /api/careers` | multipart/form-data | `name`*, `phone`*, `email`*, `position`*, `resume`* (PDF file) |
| `GET /api/health` | — | server and database status |

\* required. Every form also sends the hidden `website` field (must be empty).
