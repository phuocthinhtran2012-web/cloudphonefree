const express = require('express');
const session = require('express-session');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_DIR = path.join(__dirname, 'data');
const STORE_FILE = path.join(DATA_DIR, 'store.json');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

function defaultStore() {
  return {
    users: [
      {
        id: '10001',
        username: 'admin',
        password: 'admin123',
        name: 'ADMIN',
        avatar: '',
        admin: true,
        status: 'online',
        createdAt: new Date().toISOString()
      }
    ],
    links: [
      {
        id: 'link-1',
        title: 'Google',
        url: 'https://google.com',
        desc: 'Công cụ tìm kiếm và truy cập thông tin.',
        createdAt: new Date().toISOString()
      },
      {
        id: 'link-2',
        title: 'GitHub',
        url: 'https://github.com',
        desc: 'Kho lưu trữ mã nguồn và cộng đồng lập trình.',
        createdAt: new Date().toISOString()
      }
    ],
    updates: [
      {
        id: 'update-1',
        title: 'CLOUDPHONEFREE ra mắt',
        body: 'Phiên bản demo đầu tiên của CLOUDPHONEFREE đã sẵn sàng cho thử nghiệm. Hãy khám phá các tính năng quản trị, thành viên và website hữu ích.',
        createdAt: new Date().toISOString()
      }
    ]
  };
}

function writeStore(data) {
  fs.writeFileSync(STORE_FILE, JSON.stringify(data, null, 2));
}

function readStore() {
  try {
    if (!fs.existsSync(STORE_FILE)) {
      const seed = defaultStore();
      writeStore(seed);
      return seed;
    }

    const raw = fs.readFileSync(STORE_FILE, 'utf8');
    if (!raw.trim()) {
      const seed = defaultStore();
      writeStore(seed);
      return seed;
    }

    const parsed = JSON.parse(raw);
    parsed.users = parsed.users || [];
    parsed.links = parsed.links || [];
    parsed.updates = parsed.updates || [];
    return parsed;
  } catch (error) {
    console.error('Failed to read store:', error.message);
    const seed = defaultStore();
    writeStore(seed);
    return seed;
  }
}

function sanitizeUser(user) {
  if (!user) return null;
  return {
    id: user.id,
    username: user.username,
    name: user.name,
    admin: Boolean(user.admin),
    avatar: user.avatar || '',
    status: user.status || 'offline'
  };
}

function findUserById(id) {
  const store = readStore();
  return store.users.find((user) => user.id === id) || null;
}

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(
  session({
    secret: 'cloudphonefree-demo-secret',
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      sameSite: 'lax'
    }
  })
);

app.use(express.static(path.join(__dirname, 'public')));

function requireAuth(req, res, next) {
  if (!req.session.userId) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  next();
}

app.get('/api/health', (req, res) => {
  res.json({ ok: true, app: 'CLOUDPHONEFREE' });
});

app.get('/api/session', (req, res) => {
  if (!req.session.userId) {
    return res.json({ user: null });
  }

  const user = findUserById(req.session.userId);
  if (!user) {
    req.session.destroy();
    return res.json({ user: null });
  }

  res.json({ user: sanitizeUser(user) });
});

app.post('/api/login', (req, res) => {
  const { username, password } = req.body || {};
  const store = readStore();
  const user = store.users.find(
    (item) => item.username === String(username || '').trim() && item.password === String(password || '')
  );

  if (!user) {
    return res.status(401).json({ message: 'Tên đăng nhập hoặc mật khẩu không chính xác.' });
  }

  user.status = 'online';
  writeStore(store);
  req.session.userId = user.id;

  res.json({ user: sanitizeUser(user) });
});

app.post('/api/register', (req, res) => {
  const { name, username, password } = req.body || {};
  const cleanName = String(name || '').trim();
  const cleanUsername = String(username || '').trim();
  const cleanPassword = String(password || '');

  if (!cleanName || !cleanUsername || !cleanPassword) {
    return res.status(400).json({ message: 'Vui lòng nhập đầy đủ thông tin.' });
  }

  if (!/^[a-zA-Z0-9_]{3,24}$/.test(cleanUsername)) {
    return res.status(400).json({ message: 'Tên đăng nhập không hợp lệ.' });
  }

  const store = readStore();
  if (store.users.some((user) => user.username.toLowerCase() === cleanUsername.toLowerCase())) {
    return res.status(409).json({ message: 'Tên đăng nhập đã tồn tại.' });
  }

  const id = (() => {
    let candidate = '';
    do {
      candidate = String(Math.floor(10000 + Math.random() * 90000));
    } while (store.users.some((user) => user.id === candidate));
    return candidate;
  })();

  const newUser = {
    id,
    username: cleanUsername,
    password: cleanPassword,
    name: cleanName,
    avatar: '',
    admin: false,
    status: 'online',
    createdAt: new Date().toISOString()
  };

  store.users.push(newUser);
  writeStore(store);
  req.session.userId = newUser.id;

  res.status(201).json({ user: sanitizeUser(newUser) });
});

app.post('/api/logout', requireAuth, (req, res) => {
  const store = readStore();
  const user = store.users.find((item) => item.id === req.session.userId);
  if (user) {
    user.status = 'offline';
    writeStore(store);
  }

  req.session.destroy(() => {
    res.json({ ok: true });
  });
});

app.get('/api/users', requireAuth, (req, res) => {
  const store = readStore();
  res.json({ users: store.users.map((user) => sanitizeUser(user)) });
});

app.get('/api/links', requireAuth, (req, res) => {
  const store = readStore();
  res.json({ links: store.links });
});

app.post('/api/links', requireAuth, (req, res) => {
  const user = findUserById(req.session.userId);
  if (!user || !user.admin) {
    return res.status(403).json({ message: 'Bạn không có quyền thêm liên kết.' });
  }

  const { title, url, desc } = req.body || {};
  if (!title || !url) {
    return res.status(400).json({ message: 'Tiêu đề và URL là bắt buộc.' });
  }

  try {
    const parsed = new URL(url);
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      throw new Error('Invalid protocol');
    }
  } catch (error) {
    return res.status(400).json({ message: 'URL không hợp lệ.' });
  }

  const store = readStore();
  const newLink = {
    id: `link-${Date.now()}`,
    title: String(title).trim(),
    url: String(url).trim(),
    desc: String(desc || '').trim(),
    createdAt: new Date().toISOString()
  };

  store.links.unshift(newLink);
  writeStore(store);
  res.status(201).json({ link: newLink });
});

app.delete('/api/links/:id', requireAuth, (req, res) => {
  const user = findUserById(req.session.userId);
  if (!user || !user.admin) {
    return res.status(403).json({ message: 'Bạn không có quyền xóa liên kết.' });
  }

  const store = readStore();
  const before = store.links.length;
  store.links = store.links.filter((link) => link.id !== req.params.id);

  if (store.links.length === before) {
    return res.status(404).json({ message: 'Không tìm thấy liên kết.' });
  }

  writeStore(store);
  res.json({ ok: true });
});

app.get('/api/updates', requireAuth, (req, res) => {
  const store = readStore();
  res.json({ updates: store.updates });
});

app.post('/api/updates', requireAuth, (req, res) => {
  const user = findUserById(req.session.userId);
  if (!user || !user.admin) {
    return res.status(403).json({ message: 'Bạn không có quyền đăng thông báo.' });
  }

  const { title, body } = req.body || {};
  if (!title || !body) {
    return res.status(400).json({ message: 'Vui lòng nhập tiêu đề và nội dung.' });
  }

  const store = readStore();
  const update = {
    id: `update-${Date.now()}`,
    title: String(title).trim(),
    body: String(body).trim(),
    createdAt: new Date().toISOString()
  };

  store.updates.unshift(update);
  writeStore(store);
  res.status(201).json({ update });
});

app.post('/api/avatar', requireAuth, (req, res) => {
  const { avatarDataUrl } = req.body || {};
  if (!avatarDataUrl) {
    return res.status(400).json({ message: 'Không có dữ liệu ảnh.' });
  }

  const store = readStore();
  const user = store.users.find((item) => item.id === req.session.userId);
  if (!user) {
    return res.status(404).json({ message: 'Không tìm thấy người dùng.' });
  }

  user.avatar = avatarDataUrl;
  writeStore(store);
  res.json({ user: sanitizeUser(user) });
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`CLOUDPHONEFREE running at http://localhost:${PORT}`);
});
