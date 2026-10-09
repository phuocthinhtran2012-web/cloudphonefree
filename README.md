const STORAGE_KEYS = {
  users: 'cpf_users',
  links: 'cpf_links',
  updates: 'cpf_updates'
};

const state = {
  users: readStorage(STORAGE_KEYS.users, []),
  links: readStorage(STORAGE_KEYS.links, []),
  updates: readStorage(STORAGE_KEYS.updates, []),
  currentUser: null,
  page: 'home'
};

function readStorage(key, fallback) {
  try {
    const value = JSON.parse(localStorage.getItem(key));
    return value ?? fallback;
  } catch {
    return fallback;
  }
}

function writeStorage(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function escapeHtml(value = '') {
  return String(value).replace(/[&<>"']/g, (char) => {
    const map = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;'
    };
    return map[char] || char;
  });
}

function toast(message) {
  const toastEl = document.getElementById('toast');
  toastEl.textContent = message;
  toastEl.classList.add('show');
  clearTimeout(toastEl._timer);
  toastEl._timer = setTimeout(() => {
    toastEl.classList.remove('show');
  }, 2200);
}

function persistUsers() {
  writeStorage(STORAGE_KEYS.users, state.users);
}

function seedDemoData() {
  if (!state.users.some((user) => user.username === 'admin')) {
    state.users.push({
      username: 'admin',
      password: 'admin123',
      name: 'ADMIN',
      id: '10001',
      admin: true,
      avatar: '',
      status: 'online'
    });
    persistUsers();
  }
}

function generateUniqueFiveDigitId() {
  let candidate = '';
  do {
    candidate = String(Math.floor(10000 + Math.random() * 90000));
  } while (state.users.some((user) => user.id === candidate));
  return candidate;
}

function renderAuthScreen() {
  state.currentUser = null;

  document.getElementById('logoutButton').classList.add('hidden');
  document.getElementById('bottomNav').classList.add('hidden');

  document.getElementById('app').innerHTML = `
    <section class="hero">
      <div class="eyebrow">Your digital space</div>
      <h1>Chào mừng đến<br>CLOUDPHONEFREE.</h1>
      <p class="muted">Website tiện ích, cộng đồng thành viên và thông báo cập nhật được tổng hợp trong một không gian tối giản.</p>
    </section>

    <div class="grid" style="margin-top: 20px;">
      <form id="loginForm" class="panel form-grid">
        <h2>Đăng nhập</h2>
        <label>
          Tên đăng nhập
          <input name="username" type="text" autocomplete="username" required />
        </label>
        <label>
          Mật khẩu
          <input name="password" type="password" autocomplete="current-password" required />
        </label>
        <button type="submit" class="btn">Đăng nhập</button>
        <small class="muted">Tài khoản demo admin: admin / admin123</small>
      </form>

      <form id="registerForm" class="panel form-grid">
        <h2>Tạo tài khoản</h2>
        <label>
          Họ tên
          <input name="name" type="text" maxlength="35" required />
        </label>
        <label>
          Tên đăng nhập
          <input name="username" type="text" minlength="3" maxlength="24" required />
        </label>
        <label>
          Mật khẩu
          <input name="password" type="password" minlength="6" required />
        </label>
        <button type="submit" class="btn btn-secondary">Đăng ký miễn phí</button>
      </form>
    </div>

    <div class="panel" style="margin-top: 20px;">
      <p class="muted">Bản demo này lưu dữ liệu trên trình duyệt hiện tại. Tài khoản, link và cập nhật sẽ còn nguyên cho đến khi bạn xóa dữ liệu trình duyệt.</p>
    </div>
  `;

  document.getElementById('loginForm').addEventListener('submit', (event) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const username = String(form.get('username')).trim();
    const password = String(form.get('password'));

    const user = state.users.find(
      (item) => item.username === username && item.password === password
    );

    if (!user) {
      toast('Tên đăng nhập hoặc mật khẩu không chính xác.');
      return;
    }

    enterUser(user);
  });

  document.getElementById('registerForm').addEventListener('submit', (event) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const name = String(form.get('name')).trim();
    const username = String(form.get('username')).trim();
    const password = String(form.get('password'));

    if (!name || !username || !password) {
      toast('Vui lòng nhập đầy đủ thông tin.');
      return;
    }

    if (!/^[a-zA-Z0-9_]{3,24}$/.test(username)) {
      toast('Tên đăng nhập chỉ gồm chữ, số hoặc _ và dài 3–24 ký tự.');
      return;
    }

    if (state.users.some((user) => user.username.toLowerCase() === username.toLowerCase())) {
      toast('Tên đăng nhập đã tồn tại.');
      return;
    }

    const newUser = {
      username,
      password,
      name,
      id: generateUniqueFiveDigitId(),
      admin: false,
      avatar: '',
      status: 'offline'
    };

    state.users.push(newUser);
    persistUsers();
    enterUser(newUser);
    toast('Đăng ký thành công!');
  });
}

function enterUser(user) {
  state.currentUser = user;
  state.currentUser.status = 'online';
  persistUsers();
  document.getElementById('logoutButton').classList.remove('hidden');
  document.getElementById('bottomNav').classList.remove('hidden');
  document.getElementById('logoutButton').onclick = logoutUser;
  render();
  showUpdateNotice();
}

function logoutUser() {
  if (state.currentUser) {
    const matched = state.users.find((user) => user.id === state.currentUser.id);
    if (matched) {
      matched.status = 'offline';
    }
    persistUsers();
  }

  state.currentUser = null;
  renderAuthScreen();
}

function render() {
  if (!state.currentUser) {
    renderAuthScreen();
    return;
  }

  const navButtons = document.querySelectorAll('.nav-item');
  navButtons.forEach((button) => {
    button.classList.toggle('active', button.dataset.page === state.page);
  });

  document.getElementById('app').innerHTML = state.page === 'home' ? renderHomePage() : renderProfilePage();

  navButtons.forEach((button) => {
    button.onclick = () => {
      state.page = button.dataset.page;
      render();
    };
  });

  bindHomeEvents();
  bindProfileEvents();
}

function renderHomePage() {
  const items = state.links.length
    ? state.links
        .map((link, index) => {
          const isAdmin = state.currentUser.admin;
          return `
            <article class="link-card">
              <div class="icon">🌐</div>
              <div>
                <h3>${escapeHtml(link.title)}</h3>
                <p class="muted">${escapeHtml(link.desc || 'Website được cộng đồng sử dụng.')}</p>
              </div>
              <a href="${safeUrl(link.url)}" target="_blank" rel="noopener noreferrer">Truy cập website ↗</a>
              ${isAdmin ? `<button class="btn btn-danger" type="button" data-delete-link="${index}">Xóa liên kết</button>` : ''}
            </article>
          `;
        })
        .join('')
    : `
      <div class="panel">
        <h2>Chưa có liên kết nào</h2>
        <p class="muted">${state.currentUser.admin ? 'Vào phần “Tôi” → Cài đặt quản trị để thêm website đầu tiên.' : 'Admin hiện chưa thêm website nào. Hãy quay lại sau.'}</p>
      </div>
    `;

  return `
    <section class="hero">
      <div class="eyebrow">Trang chủ</div>
      <h1>Khám phá thế giới của bạn.</h1>
      <p class="muted">Các website hữu ích, thành viên và cập nhật quan trọng được gom lại trong một không gian duy nhất.</p>
    </section>

    <div class="section-head">
      <h2>Website của bạn</h2>
      <small>${state.links.length} liên kết</small>
    </div>

    <div class="grid">
      ${items}
    </div>
  `;
}

function renderProfilePage() {
  const memberList = state.users
    .map((user) => `
      <div class="member-item">
        <div class="row">
          ${renderAvatar(user, 'small')}
          <div class="member-meta">
            <strong>${escapeHtml(user.name)}</strong>
            <small>ID: ${escapeHtml(user.id)}</small>
          </div>
        </div>
        <span class="pill ${user.status === 'online' ? '' : 'offline'}">
          ${user.status === 'online' ? '● Online' : '○ Offline'}
        </span>
      </div>
    `)
    .join('');

  return `
    <section class="panel">
      <div class="row">
        ${renderAvatar(state.currentUser, 'large')}
        <div style="min-width: 0; flex: 1;">
          <h1 style="font-size: 1.6rem; margin-bottom: 4px;">${escapeHtml(state.currentUser.name)}</h1>
          <p class="muted" style="margin: 0;">ID: ${escapeHtml(state.currentUser.id)} • @${escapeHtml(state.currentUser.username)}</p>
          <label class="btn btn-secondary" style="margin-top: 12px; display: inline-flex; cursor: pointer;">
            Đổi ảnh đại diện
            <input id="avatarInput" type="file" accept="image/*" hidden />
          </label>
        </div>
      </div>
    </section>

    <section class="panel" style="margin-top: 18px;">
      <div class="section-head" style="margin-top: 0;">
        <h2>Thành viên</h2>
        <small>${state.users.length} tài khoản</small>
      </div>
      <div class="list-people">${memberList}</div>
    </section>

    ${state.currentUser.admin ? renderAdminPanel() : ''}

    <button id="logoutSecondary" class="btn btn-secondary" type="button" style="margin-top: 18px; width: 100%;">Đăng xuất</button>
  `;
}

function renderAdminPanel() {
  return `
    <section class="panel" style="margin-top: 18px; border-color: rgba(92, 132, 255, 0.7);">
      <h2>⚙ Cài đặt quản trị</h2>
      <p class="muted">Chỉ tài khoản admin được quyền quản trị website demo này.</p>

      <form id="addLinkForm" class="form-grid" style="margin-top: 16px;">
        <h3 style="margin-bottom: 0;">Thêm website</h3>
        <label>
          Tên website
          <input name="title" type="text" maxlength="70" placeholder="Ví dụ: Cloud Hosting" required />
        </label>
        <label>
          Đường dẫn URL
          <input name="url" type="url" placeholder="https://example.com" required />
        </label>
        <label>
          Mô tả
          <textarea name="desc" maxlength="180" placeholder="Mô tả ngắn về website..."></textarea>
        </label>
        <button type="submit" class="btn">＋ Thêm liên kết</button>
      </form>

      <hr style="border: 0; border-top: 1px solid var(--line); margin: 22px 0;" />

      <form id="addUpdateForm" class="form-grid">
        <h3 style="margin-bottom: 0;">📢 Đăng thông báo cập nhật</h3>
        <label>
          Tiêu đề
          <input name="title" type="text" maxlength="100" placeholder="CLOUDPHONEFREE v1.1" required />
        </label>
        <label>
          Nội dung
          <textarea name="body" rows="4" maxlength="2000" placeholder="Mô tả tính năng mới hoặc thay đổi..." required></textarea>
        </label>
        <button type="submit" class="btn">Đăng thông báo</button>
      </form>
    </section>
  `;
}

function renderAvatar(user, sizeClass) {
  if (user.avatar) {
    return `<img class="avatar ${sizeClass}" src="${user.avatar}" alt="Ảnh đại diện ${escapeHtml(user.name)}" />`;
  }

  const initial = (user.name || '?').charAt(0).toUpperCase();
  return `<div class="avatar ${sizeClass}">${escapeHtml(initial)}</div>`;
}

function safeUrl(url) {
  try {
    const parsed = new URL(url);
    if (parsed.protocol === 'http:' || parsed.protocol === 'https:') {
      return parsed.href;
    }
  } catch {
    // ignore invalid URL
  }
  return '#';
}

function bindHomeEvents() {
  document.querySelectorAll('[data-delete-link]').forEach((button) => {
    button.onclick = () => {
      const index = Number(button.dataset.deleteLink);
      state.links.splice(index, 1);
      writeStorage(STORAGE_KEYS.links, state.links);
      render();
      toast('Đã xóa liên kết.');
    };
  });
}

function bindProfileEvents() {
  document.getElementById('logoutSecondary')?.addEventListener('click', logoutUser);

  document.getElementById('avatarInput')?.addEventListener('change', (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (file.size > 1200000) {
      toast('Vui lòng chọn ảnh dưới 1.2MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const maxSize = 300;
        const scale = Math.min(1, maxSize / Math.max(img.width, img.height));
        canvas.width = img.width * scale;
        canvas.height = img.height * scale;

        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

        const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
        state.currentUser.avatar = dataUrl;

        const userMatch = state.users.find((user) => user.id === state.currentUser.id);
        if (userMatch) {
          userMatch.avatar = dataUrl;
        }

        persistUsers();
        render();
        toast('Đã cập nhật ảnh đại diện.');
      };
      img.src = reader.result;
    };

    reader.readAsDataURL(file);
  });

  document.getElementById('addLinkForm')?.addEventListener('submit', (event) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const title = String(form.get('title')).trim();
    const desc = String(form.get('desc')).trim();
    const url = String(form.get('url')).trim();

    try {
      const parsed = new URL(url);
      if (!['http:', 'https:'].includes(parsed.protocol)) {
        throw new Error('Invalid protocol');
      }
    } catch (error) {
      toast('Đường dẫn URL không hợp lệ.');
      return;
    }

    state.links.unshift({ title, desc, url });
    writeStorage(STORAGE_KEYS.links, state.links);
    event.currentTarget.reset();
    render();
    toast('Đã thêm liên kết mới.');
  });

  document.getElementById('addUpdateForm')?.addEventListener('submit', (event) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const title = String(form.get('title')).trim();
    const body = String(form.get('body')).trim();

    if (!title || !body) {
      toast('Vui lòng điền đầy đủ tiêu đề và nội dung.');
      return;
    }

    state.updates.unshift({
      id: crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}`,
      title,
      body,
      time: Date.now()
    });
    writeStorage(STORAGE_KEYS.updates, state.updates);
    event.currentTarget.reset();
    render();
    showUpdateNotice(true);
    toast('Đã đăng thông báo cập nhật.');
  });
}

function showUpdateNotice(force = false) {
  const latest = state.updates[0];
  if (!latest) return;

  const seenKey = `cpf_seen_${state.currentUser?.id || 'guest'}`;
  const seen = readStorage(seenKey, []);

  if (!force && seen.includes(latest.id)) {
    return;
  }

  const noticeOverlay = document.getElementById('noticeOverlay');
  const noticeTitle = document.getElementById('noticeTitle');
  const noticeBody = document.getElementById('noticeBody');

  noticeTitle.textContent = latest.title;
  noticeBody.textContent = latest.body;
  noticeOverlay.classList.remove('hidden');

  const closeNotice = () => {
    const currentSeen = readStorage(seenKey, []);
    writeStorage(seenKey, [...new Set([...currentSeen, latest.id])]);
    noticeOverlay.classList.add('hidden');
  };

  document.getElementById('closeNotice').onclick = closeNotice;
  document.getElementById('noticeOk').onclick = closeNotice;
}

seedDemoData();
renderAuthScreen();

if (localStorage.getItem('cpf_session')) {
  const sessionUser = state.users.find((user) => user.id === localStorage.getItem('cpf_session'));
  if (sessionUser) {
    enterUser(sessionUser);
  }
}

window.addEventListener('beforeunload', () => {
  if (state.currentUser) {
    localStorage.setItem('cpf_session', state.currentUser.id);
  } else {
    localStorage.removeItem('cpf_session');
  }
});
