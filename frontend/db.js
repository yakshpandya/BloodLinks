/* =========================================================
   db.js — BloodLinks API Client + Utilities
   Connects to the Express/MongoDB backend
   ========================================================= */
(function () {
  'use strict';

  // Auto-detect backend URL:
  // - In production (Vercel), set window.BLOODLINKS_API_URL before loading db.js
  // - In development, defaults to localhost:4000
  const BACKEND_URL = window.BLOODLINKS_API_URL || 'http://localhost:4000/api';

  /* ---------- Toast Notification System ---------- */
  function showToast(msg, type) {
    type = type || 'success';
    var existing = document.getElementById('bl-toast');
    if (existing) existing.remove();
    var t = document.createElement('div');
    t.id = 'bl-toast';
    var icons = { success: '✅', error: '❌', info: 'ℹ️', warning: '⚠️' };
    t.innerHTML = icons[type] + ' ' + msg;
    Object.assign(t.style, {
      position: 'fixed', bottom: '28px', right: '28px', zIndex: '99999',
      background: type === 'success' ? '#1a2a1a' : type === 'error' ? '#2a1a1a' : '#1a1a2a',
      color: '#fff', padding: '14px 22px', borderRadius: '12px',
      border: '1px solid ' + (type === 'success' ? '#2ecc71' : type === 'error' ? '#e74c3c' : '#5a9fff'),
      fontSize: '0.9rem', fontFamily: 'Inter, sans-serif',
      boxShadow: '0 8px 30px rgba(0,0,0,0.5)',
      transform: 'translateY(20px)', opacity: '0',
      transition: 'all 0.3s ease', maxWidth: '360px',
    });
    document.body.appendChild(t);
    requestAnimationFrame(function () {
      t.style.transform = 'translateY(0)';
      t.style.opacity = '1';
    });
    setTimeout(function () {
      t.style.opacity = '0';
      t.style.transform = 'translateY(20px)';
      setTimeout(function () { t.remove(); }, 300);
    }, 3500);
  }

  /* ---------- Utility: format date ---------- */
  function fmtDate(iso) {
    if (!iso) return '';
    var d = new Date(iso);
    return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  }

  /* ---------- Token Management ---------- */
  function getToken() {
    return sessionStorage.getItem('bl_token');
  }

  function setToken(token) {
    sessionStorage.setItem('bl_token', token);
  }

  function authHeaders() {
    var token = getToken();
    var headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = 'Bearer ' + token;
    return headers;
  }

  /* ---------- API Helper ---------- */
  async function apiGet(path) {
    var res = await fetch(BACKEND_URL + path, { headers: authHeaders() });
    return res.json();
  }

  async function apiPost(path, data) {
    var res = await fetch(BACKEND_URL + path, {
      method: 'POST', headers: authHeaders(), body: JSON.stringify(data)
    });
    return { ok: res.ok, status: res.status, data: await res.json() };
  }

  async function apiPut(path, data) {
    var res = await fetch(BACKEND_URL + path, {
      method: 'PUT', headers: authHeaders(), body: JSON.stringify(data)
    });
    return { ok: res.ok, status: res.status, data: await res.json() };
  }

  async function apiDelete(path) {
    var res = await fetch(BACKEND_URL + path, {
      method: 'DELETE', headers: authHeaders()
    });
    return { ok: res.ok, status: res.status, data: await res.json() };
  }

  /* ==================================================
     DATABASE API — Now backed by MongoDB
  ================================================== */
  window.BLDb = {
    BACKEND_URL: BACKEND_URL,

    /* ---- DONORS ---- */
    getDonors: async function () { return apiGet('/donors'); },
    addDonor: async function (d) {
      var result = await apiPost('/auth/donor/register', d);
      if (result.ok) {
        setToken(result.data.token);
        sessionStorage.setItem('bl_user', JSON.stringify(result.data.user));
        return result.data.user;
      }
      throw new Error(result.data.error || 'Registration failed');
    },
    getDonorByEmail: async function (email) {
      var donors = await apiGet('/donors');
      return donors.find(function (d) { return d.email === email; });
    },

    /* ---- BLOOD BANKS ---- */
    getRegisteredBanks: async function () { return apiGet('/bloodbanks'); },
    addBloodBank: async function (b) {
      var result = await apiPost('/auth/bank/register', b);
      if (result.ok) {
        return result.data.user;
      }
      throw new Error(result.data.error || 'Registration failed');
    },
    getBankByEmail: async function (email) {
      var banks = await apiGet('/bloodbanks');
      return banks.find(function (b) { return b.email === email; });
    },

    /* ---- HOSPITALS ---- */
    getHospitals: async function () { return apiGet('/hospitals'); },
    addHospital: async function (h) {
      var result = await apiPost('/hospitals', h);
      return result.data;
    },

    /* ---- CAMPS ---- */
    getCamps: async function () { return apiGet('/camps'); },
    addCamp: async function (c) {
      var result = await apiPost('/camps', c);
      return result.data;
    },

    /* ---- LABS ---- */
    getLabs: async function () { return apiGet('/labs'); },
    addLab: async function (l) {
      var result = await apiPost('/labs', l);
      return result.data;
    },

    /* ---- BLOOD REQUESTS ---- */
    getRequests: async function () { return apiGet('/requests'); },
    addRequest: async function (r) {
      var result = await apiPost('/requests', r);
      return result.data;
    },
    updateRequestStatus: async function (id, status) {
      return apiPut('/requests/' + id + '/status', { status: status });
    },

    /* ---- MESSAGES ---- */
    getMessages: async function () { return apiGet('/messages'); },
    addMessage: async function (m) {
      var result = await apiPost('/messages', m);
      return result.data;
    },

    /* ---- AUTH ---- */
    currentUser: function () { return JSON.parse(sessionStorage.getItem('bl_user') || 'null'); },
    login: function (user, token) {
      sessionStorage.setItem('bl_user', JSON.stringify(user));
      if (token) setToken(token);
    },
    logout: function () {
      sessionStorage.removeItem('bl_user');
      sessionStorage.removeItem('bl_token');
      window.location.href = 'index.html';
    },
    requireAuth: function (redirectTo) {
      if (!this.currentUser()) {
        window.location.href = (redirectTo || 'signin.html') + '?next=' + window.location.pathname;
        return false;
      }
      return true;
    },

    /* ---- Donor Login via API ---- */
    loginDonor: async function (email, password) {
      var result = await apiPost('/auth/donor/login', { email: email, password: password });
      if (result.ok) {
        this.login(result.data.user, result.data.token);
        return result.data.user;
      }
      throw new Error(result.data.error || 'Login failed');
    },

    /* ---- Blood Bank Login via API ---- */
    loginBank: async function (email, password) {
      var result = await apiPost('/auth/bank/login', { email: email, password: password });
      if (result.ok) {
        this.login(result.data.user, result.data.token);
        return result.data.user;
      }
      throw new Error(result.data.error || 'Login failed');
    },

    /* ---- Admin Login via API ---- */
    loginAdmin: async function (username, password) {
      var result = await apiPost('/auth/admin/login', { username: username, password: password });
      if (result.ok) {
        setToken(result.data.token);
        sessionStorage.setItem('bl_admin_auth', JSON.stringify(result.data.user));
        return result.data.user;
      }
      throw new Error(result.data.error || 'Login failed');
    },

    /* ---- API helpers (for admin panel) ---- */
    api: { get: apiGet, post: apiPost, put: apiPut, delete: apiDelete },

    /* ---- Utilities ---- */
    toast: showToast,
    fmtDate: fmtDate,
    getToken: getToken,
  };

})();
