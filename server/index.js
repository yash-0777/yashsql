import express from 'express';
import cors from 'cors';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { nanoid } from 'nanoid';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'dev_jwt_secret_change_me';

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Multer storage for banner images
const storage = multer.diskStorage({
  destination: function (_req, _file, cb) {
    cb(null, uploadsDir);
  },
  filename: function (_req, file, cb) {
    const unique = `${Date.now()}-${nanoid(8)}`;
    const safeOriginal = file.originalname.replace(/[^a-zA-Z0-9_.-]/g, '_');
    cb(null, `${unique}-${safeOriginal}`);
  },
});
const upload = multer({ storage });

// Simple JSON file datastore helpers
import { readJsonArray, writeJsonArray } from './utils/datastore.js';

// Middleware
app.use(cors({ origin: 'http://localhost:5173' }));
app.use(express.json());
app.use('/uploads', express.static(uploadsDir));

// Auth utilities
function createToken(user) {
  return jwt.sign({ id: user.id, email: user.email, name: user.name }, JWT_SECRET, { expiresIn: '7d' });
}

async function getUserByEmail(email) {
  const users = await readJsonArray('users');
  return users.find((u) => u.email.toLowerCase() === email.toLowerCase());
}

async function getUserById(userId) {
  const users = await readJsonArray('users');
  return users.find((u) => u.id === userId);
}

// Auth middleware
function authRequired(req, res, next) {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
  if (!token) return res.status(401).json({ message: 'Missing token' });
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.user = { id: payload.id, email: payload.email, name: payload.name };
    return next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid token' });
  }
}

// Routes: Auth
app.post('/api/auth/signup', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email, and password are required' });
    }
    const existing = await getUserByEmail(email);
    if (existing) return res.status(400).json({ message: 'Email already in use' });
    const passwordHash = await bcrypt.hash(password, 10);
    const newUser = { id: nanoid(), name, email, passwordHash, createdAt: new Date().toISOString() };
    const users = await readJsonArray('users');
    users.push(newUser);
    await writeJsonArray('users', users);
    const token = createToken(newUser);
    return res.json({ token, user: { id: newUser.id, name: newUser.name, email: newUser.email } });
  } catch (err) {
    return res.status(500).json({ message: 'Server error' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: 'Email and password are required' });
    const user = await getUserByEmail(email);
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });
    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) return res.status(400).json({ message: 'Invalid credentials' });
    const token = createToken(user);
    return res.json({ token, user: { id: user.id, name: user.name, email: user.email } });
  } catch (err) {
    return res.status(500).json({ message: 'Server error' });
  }
});

// Routes: Events
app.post('/api/events', authRequired, upload.single('banner'), async (req, res) => {
  try {
    const { title, description, date, time, location, category } = req.body;
    if (!title || !description || !date || !time || !location) {
      return res.status(400).json({ message: 'Missing required fields' });
    }
    if (!req.file) return res.status(400).json({ message: 'Banner image is required' });
    const bannerUrl = `/uploads/${req.file.filename}`;
    const events = await readJsonArray('events');
    const newEvent = {
      id: nanoid(),
      title,
      description,
      date, // ISO date string (YYYY-MM-DD)
      time, // HH:mm
      location,
      category: category || 'General',
      bannerUrl,
      createdBy: req.user.id,
      createdAt: new Date().toISOString(),
      attendeesCount: 0,
    };
    events.push(newEvent);
    await writeJsonArray('events', events);
    return res.status(201).json(newEvent);
  } catch (err) {
    return res.status(500).json({ message: 'Server error' });
  }
});

app.get('/api/events', async (req, res) => {
  try {
    const { q, category, range } = req.query;
    const events = await readJsonArray('events');
    const now = new Date();
    let filtered = events.filter((e) => {
      // upcoming events only
      const eventDate = new Date(`${e.date}T${e.time || '00:00'}:00`);
      return eventDate >= now;
    });
    if (q) {
      const ql = String(q).toLowerCase();
      filtered = filtered.filter((e) => e.title.toLowerCase().includes(ql));
    }
    if (category && category !== 'All') {
      filtered = filtered.filter((e) => (e.category || 'General') === category);
    }
    if (range) {
      const start = new Date();
      let end = null;
      if (range === 'this_week') {
        const day = start.getDay();
        const diffToSunday = day; // 0 is Sunday
        const endDate = new Date(start);
        endDate.setDate(start.getDate() + (7 - diffToSunday));
        end = endDate;
      } else if (range === 'this_month') {
        const endDate = new Date(start.getFullYear(), start.getMonth() + 1, 0);
        end = endDate;
      }
      if (end) {
        filtered = filtered.filter((e) => {
          const d = new Date(`${e.date}T${e.time || '00:00'}:00`);
          return d >= start && d <= end;
        });
      }
    }
    filtered.sort((a, b) => new Date(`${a.date}T${a.time || '00:00'}:00`) - new Date(`${b.date}T${b.time || '00:00'}:00`));
    return res.json(filtered);
  } catch (err) {
    return res.status(500).json({ message: 'Server error' });
  }
});

app.get('/api/events/:id', async (req, res) => {
  try {
    const events = await readJsonArray('events');
    const event = events.find((e) => e.id === req.params.id);
    if (!event) return res.status(404).json({ message: 'Event not found' });
    return res.json(event);
  } catch (err) {
    return res.status(500).json({ message: 'Server error' });
  }
});

app.put('/api/events/:id', authRequired, upload.single('banner'), async (req, res) => {
  try {
    const events = await readJsonArray('events');
    const index = events.findIndex((e) => e.id === req.params.id);
    if (index === -1) return res.status(404).json({ message: 'Event not found' });
    const event = events[index];
    if (event.createdBy !== req.user.id) return res.status(403).json({ message: 'Not allowed' });

    const fields = ['title', 'description', 'date', 'time', 'location', 'category'];
    for (const f of fields) {
      if (req.body[f] !== undefined) event[f] = req.body[f];
    }
    if (req.file) {
      event.bannerUrl = `/uploads/${req.file.filename}`;
    }
    events[index] = event;
    await writeJsonArray('events', events);
    return res.json(event);
  } catch (err) {
    return res.status(500).json({ message: 'Server error' });
  }
});

app.delete('/api/events/:id', authRequired, async (req, res) => {
  try {
    const events = await readJsonArray('events');
    const index = events.findIndex((e) => e.id === req.params.id);
    if (index === -1) return res.status(404).json({ message: 'Event not found' });
    const event = events[index];
    if (event.createdBy !== req.user.id) return res.status(403).json({ message: 'Not allowed' });

    events.splice(index, 1);
    await writeJsonArray('events', events);

    // Remove registrations for this event
    const registrations = await readJsonArray('registrations');
    const remaining = registrations.filter((r) => r.eventId !== req.params.id);
    await writeJsonArray('registrations', remaining);
    return res.json({ message: 'Deleted' });
  } catch (err) {
    return res.status(500).json({ message: 'Server error' });
  }
});

app.post('/api/events/:id/register', authRequired, async (req, res) => {
  try {
    const events = await readJsonArray('events');
    const event = events.find((e) => e.id === req.params.id);
    if (!event) return res.status(404).json({ message: 'Event not found' });

    const registrations = await readJsonArray('registrations');
    const existing = registrations.find((r) => r.eventId === event.id && r.userId === req.user.id);
    if (existing) return res.status(400).json({ message: 'Already registered' });

    const newReg = { id: nanoid(), eventId: event.id, userId: req.user.id, registeredAt: new Date().toISOString() };
    registrations.push(newReg);
    await writeJsonArray('registrations', registrations);

    // Update attendees count
    const idx = events.findIndex((e) => e.id === event.id);
    events[idx].attendeesCount = (events[idx].attendeesCount || 0) + 1;
    await writeJsonArray('events', events);
    return res.status(201).json({ message: 'Registered' });
  } catch (err) {
    return res.status(500).json({ message: 'Server error' });
  }
});

// Me endpoints
app.get('/api/me/created-events', authRequired, async (req, res) => {
  try {
    const events = await readJsonArray('events');
    const mine = events.filter((e) => e.createdBy === req.user.id);
    return res.json(mine);
  } catch (err) {
    return res.status(500).json({ message: 'Server error' });
  }
});

app.get('/api/me/registrations', authRequired, async (req, res) => {
  try {
    const registrations = await readJsonArray('registrations');
    const myRegs = registrations.filter((r) => r.userId === req.user.id);
    return res.json(myRegs);
  } catch (err) {
    return res.status(500).json({ message: 'Server error' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

