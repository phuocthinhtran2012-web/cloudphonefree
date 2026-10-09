const state = {
  currentUser: null,
  page: 'home',
  links: [],
  users: [],
  updates: []
};

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

function showToast(message) {
  const toastEl = document.getElementById('toast');
  toastEl.textContent = message;
  toastEl.classList.add('show');
  clearTimeout(toastEl._timer);
  toastEl._timer = setTimeout(() => {
    toastEl.classList.remove('show');
  }, 2200);
}

async function apiRequest(path, options = {}) {
  const response = await fetch(path, {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {})
    },
    ...options
  });

  const contentType = response.headers.get('content-type') || '';
  const data = contentType.includes('application/json') ? await response.json() : await response.text();

  if (!response.ok) {
    throw new Error(data?.message || 'Yêu cầu không thành công.');
  }

  return data;
}

function renderAvatar(user, sizeClass = '') {
  if (user && user.avatar) {
    return `<img class="avatar ${sizeClass}" src="${user.avatar}" alt="Ảnh đại diện ${escapeHtml(user.name || user.username || 'Thành viên')}" />`;
  }

  const initial = (user?.name || user?.username || '?').charAt(0).toUpperCase();
  return `<div class="avatar ${sizeClass}">${escapeHtml(initial)}</div>`;
}

function setPage(page) {
  state.page = page;
  render();
}

async function init() {
  try {
    const session = await apiRequest('/api/session');
    if (session.user) {
      state.currentUser = session.user;
      await loadDashboard();
      render();
      showUpdateNotice();
      return;
    }
  } catch (error) {
    console.error(error);
  }

  renderAuthScreen();
}

async function loadDashboard() {
  try {
    const [usersRes, linksRes, updatesRes] = await Promise.all([
      apiRequest('/api/users'),
      apiRequest('/api/links'),
      apiRequest('/api/updates')
    ]);

    state.users = usersRes.users || [];
    state.links = linksRes.links || [];
    state.updates = updatesRes.updates || [];
  } catch (error) {
    console.error(error);
    showToast('Không thể tải dữ liệu từ máy chủ.');
  }
}

function renderAuthScreen() {
  state.currentUser = null;
  document.getElementById('logoutButton').classList.add('hidden');
  document.getElementById('bottomNav').classList.add('hidden');

  document.getElementById('app').innerHTML = `
    <section class="hero">
      <div class="eyebrow">Your digital space</div>
      <h1>Chào mừng đến<br>CLOUDPHONEFREE.</h1>
      <p class="muted">Một không gian tối giản để quản lý website, cộng đồng thành viên và thông báo cập nhật.</p>
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
        <small class="muted">Demo admin: admin / admin123</small>
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
      <p class="muted">Bản demo này lưu thông tin trong máy chủ nội bộ của dự án. Đăng nhập, đăng ký, thêm link và đăng thông báo đều có thể hoạt động thực tế trên một website đã chạy.</p>
    </div>
  `;

  document.getElementById('loginForm').addEventListener('submit', async (event) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const payload = {
      username: String(form.get('username')).trim(),
      password: String(form.get('password'))
    };

    try {
      const result = await apiRequest('/api/login', {
        method: 'POST',
        body: JSON.stringify(payload)
      });

      state.currentUser = result.user;
      await loadDashboard();
      render();
      showUpdateNotice();
      showToast('Đăng nhập thành công.');
    } catch (error) {
      showToast(error.message);
    }
  });

  document.getElementById('registerForm').addEventListener('submit', async (event) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const payload = {
      name: String(form.get('name')).trim(),
      username: String(form.get('username')).trim(),
      password: String(form.get('password'))
    };

    try {
      const result = await apiRequest('/api/register', {
        method: 'POST',
        body: JSON.stringify(payload)
      });

      state.currentUser = result.user;
      await loadDashboard();
      render();
      showUpdateNotice();
      showToast('Đăng ký thành công.');
    } catch (error) {
      showToast(error.message);
    }
  });
}

async function logoutUser() {
  try {
    await apiRequest('/api/logout', { method: 'POST' });
  } catch (error) {
    console.error(error);
  }

  state.currentUser = null;
  renderAuthScreen();
}

function renderHomePage() {
  const cards = state.links.length
    ? state.links
        .map((link, index) => {
          const adminDelete = state.currentUser?.admin
            ? `<button class="btn btn-danger" type="button" data-delete-link="${link.id}">Xóa liên kết</button>`
            : '';

          return `
            <article class="link-card">
              <div class="icon">🌐</div>
              <div>
                <h3>${escapeHtml(link.title)}</h3>
                <p class="muted">${escapeHtml(link.desc || 'Website được cộng đồng sử dụng.')}</p>
              </div>
              <a href="${safeUrl(link.url)}" target="_blank" rel="noopener noreferrer">Truy cập website ↗</a>
              ${adminDelete}
            </article>
          `;
        })
        .join('')
    : `
      <div class="panel">
        <h2>Chưa có liên kết nào</h2>
        <p class="muted">${state.currentUser.admin ? 'Vào phần “Tôi” → Cài đặt quản trị để thêm website đầu tiên.' : 'Admin đang cập nhật danh sách website. Hãy quay lại sau.'}</p>
      </div>
    `;

  return `
    <section class="hero">
      <div class="eyebrow">Trang chủ</div>
      <h1>Khám phá thế giới của bạn.</h1>
      <p class="muted">Các website tiện ích, thành viên và cập nhật quan trọng được gom lại trong một không gian duy nhất.</p>
    </section>

    <div class="section-head">
      <h2>Website của bạn</h2>
      <small>${state.links.length} liên kết</small>
    </div>

    <div class="grid">
      ${cards}
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
      <p class="muted">Chỉ tài khoản admin được phép quản lý website và cập nhật.</p>

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

function safeUrl(url) {
  try {
    const parsed = new URL(url);
    if (parsed.protocol === 'http:' || parsed.protocol === 'https:') {
      return parsed.href;
    }
  } catch {
    // ignore invalid
  }
  return '#';
}

function render() {
  if (!state.currentUser) {
    renderAuthScreen();
    return;
  }

  document.getElementById('logoutButton').classList.remove('hidden');
  document.getElementById('logoutButton').onclick = logoutUser;
  document.getElementById('bottomNav').classList.remove('hidden');

  document.querySelectorAll('.nav-item').forEach((button) => {
    button.classList.toggle('active', button.dataset.page === state.page);
  });

  document.getElementById('app').innerHTML = state.page === 'home' ? renderHomePage() : renderProfilePage();

  document.querySelectorAll('.nav-item').forEach((button) => {
    button.onclick = () => setPage(button.dataset.page);
  });

  bindHomeEvents();
  bindProfileEvents();
}

function bindHomeEvents() {
  document.querySelectorAll('[data-delete-link]').forEach((button) => {
    button.addEventListener('click', async () => {
      try {
        await apiRequest(`/api/links/${button.dataset.deleteLink}`, { method: 'DELETE' });
        await loadDashboard();
        render();
        showToast('Đã xóa liên kết.');
      } catch (error) {
        showToast(error.message);
      }
    });
  });
}

function bindProfileEvents() {
  document.getElementById('logoutSecondary')?.addEventListener('click', logoutUser);

  document.getElementById('avatarInput')?.addEventListener('change', async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (file.size > 1200000) {
      showToast('Vui lòng chọn ảnh dưới 1.2MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const result = await apiRequest('/api/avatar', {
          method: 'POST',
          body: JSON.stringify({ avatarDataUrl: reader.result })
        });

        state.currentUser = result.user;
        await loadDashboard();
        render();
        showToast('Đã cập nhật ảnh đại diện.');
      } catch (error) {
        showToast(error.message);
      }
    };

    reader.readAsDataURL(file);
  });

  document.getElementById('addLinkForm')?.addEventListener('submit', async (event) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const payload = {
      title: String(form.get('title')).trim(),
      url: String(form.get('url')).trim(),
      desc: String(form.get('desc')).trim()
    };

    try {
      await apiRequest('/api/links', {
        method: 'POST',
        body: JSON.stringify(payload)
      });

      event.currentTarget.reset();
      await loadDashboard();
      render();
      showToast('Đã thêm liên kết mới.');
    } catch (error) {
      showToast(error.message);
    }
  });

  document.getElementById('addUpdateForm')?.addEventListener('submit', async (event) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const payload = {
      title: String(form.get('title')).trim(),
      body: String(form.get('body')).trim()
    };

    try {
      await apiRequest('/api/updates', {
        method: 'POST',
        body: JSON.stringify(payload)
      });

      event.currentTarget.reset();
      await loadDashboard();
      render();
      showUpdateNotice(true);
      showToast('Đã đăng thông báo cập nhật.');
    } catch (error) {
      showToast(error.message);
    }
  });
}

function showUpdateNotice(force = false) {
  if (!state.currentUser) return;

  const latest = state.updates[0];
  if (!latest) return;

  const seenKey = `cpf_seen_${state.currentUser.id}`;
  const seen = JSON.parse(localStorage.getItem(seenKey) || '[]');
  if (!force && seen.includes(latest.id)) return;

  const overlay = document.getElementById('noticeOverlay');
  const title = document.getElementById('noticeTitle');
  const body = document.getElementById('noticeBody');

  title.textContent = latest.title;
  body.textContent = latest.body;
  overlay.classList.remove('hidden');

  const closeNotice = () => {
    const currentSeen = JSON.parse(localStorage.getItem(seenKey) || '[]');
    const nextSeen = Array.from(new Set([...currentSeen, latest.id]));
    localStorage.setItem(seenKey, JSON.stringify(nextSeen));
    overlay.classList.add('hidden');
  };

  document.getElementById('closeNotice').onclick = closeNotice;
  document.getElementById('noticeOk').onclick = closeNotice;
}

init();
