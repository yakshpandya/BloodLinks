/* =========================================================
   db.js — BloodLinks localStorage mini-database + utilities
   ========================================================= */
(function () {
  'use strict';

  /* ---------- Toast Notification System ---------- */
  function showToast(msg, type) {
    type = type || 'success';
    var existing = document.getElementById('bl-toast');
    if (existing) existing.remove();
    var t = document.createElement('div');
    t.id = 'bl-toast';
    t.innerHTML = '<span>' + msg + '</span>';
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

  /* ---------- Utility: generate ID ---------- */
  function uid() { return Date.now() + Math.floor(Math.random() * 1000); }

  /* ---------- Utility: format date ---------- */
  function fmtDate(iso) {
    if (!iso) return '';
    var d = new Date(iso);
    return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  }

  /* ==================================================
     SEED DATA — written once on first load
  ================================================== */
  function seedIfEmpty(key, data) {
    if (!localStorage.getItem(key)) {
      localStorage.setItem(key, JSON.stringify(data));
    }
  }

  seedIfEmpty('bl_hospitals', [
    { id: 1001, name: 'Civil Hospital Ahmedabad', location: 'Ahmedabad, Gujarat', phone: '079-22683721', type: 'Government', bloodBank: true, desc: 'Largest government hospital in Gujarat with full blood bank and transfusion unit.', createdAt: '2024-01-01' },
    { id: 1002, name: 'Sunshine Global Hospitals', location: 'Surat, Gujarat', phone: '0261-6663366', type: 'Private', bloodBank: true, desc: 'Multi-specialty private hospital with 24/7 blood bank services.', createdAt: '2024-01-01' },
    { id: 1003, name: 'Sterling Hospital', location: 'Vadodara, Gujarat', phone: '0265-3988000', type: 'Private', bloodBank: true, desc: 'Leading private hospital with modern blood transfusion department.', createdAt: '2024-01-01' },
    { id: 1004, name: 'Sir T. General Hospital', location: 'Bhavnagar, Gujarat', phone: '0278-2427550', type: 'Government', bloodBank: true, desc: 'Government referral hospital with comprehensive blood services.', createdAt: '2024-01-01' },
    { id: 1005, name: 'Apollo Hospitals Navi Mumbai', location: 'Mumbai, Maharashtra', phone: '022-42697777', type: 'Private', bloodBank: true, desc: 'Apollo Hospitals with full-service blood bank and pathology.', createdAt: '2024-01-01' },
    { id: 1006, name: 'KEM Hospital', location: 'Mumbai, Maharashtra', phone: '022-24136051', type: 'Government', bloodBank: true, desc: 'Municipal hospital with one of the largest blood banks in Maharashtra.', createdAt: '2024-01-01' },
  ]);

  seedIfEmpty('bl_camps', [
    { id: 2001, name: 'Lions Club Blood Camp', location: 'Ahmedabad, Gujarat', date: '2024-04-20', time: '9:00 AM - 5:00 PM', org: 'Lions Club International', phone: '9876543210', desc: 'Annual mega blood donation drive. Free health checkup for all donors.', type: 'Club', createdAt: '2024-01-01' },
    { id: 2002, name: 'IIM Ahmedabad Student Drive', location: 'Ahmedabad, Gujarat', date: '2024-04-25', time: '10:00 AM - 4:00 PM', org: 'IIMA Student Council', phone: '9123456789', desc: 'Campus blood donation camp open to the public. Refreshments provided.', type: 'Educational Institution', createdAt: '2024-01-01' },
    { id: 2003, name: 'Rotary Club Blood Camp', location: 'Vadodara, Gujarat', date: '2024-05-02', time: '8:00 AM - 6:00 PM', org: 'Rotary Club Vadodara', phone: '9234567890', desc: 'Community blood camp with free screening and blood group detection.', type: 'Club', createdAt: '2024-01-01' },
    { id: 2004, name: 'Surat Youth Blood Drive', location: 'Surat, Gujarat', date: '2024-05-10', time: '9:00 AM - 3:00 PM', org: 'Youth Foundation Surat', phone: '9345678901', desc: 'Youth-led blood donation initiative. Certificates issued to all donors.', type: 'NGO', createdAt: '2024-01-01' },
    { id: 2005, name: 'NSS National Camp', location: 'Mumbai, Maharashtra', date: '2024-05-15', time: '9:00 AM - 5:00 PM', org: 'NSS Unit, Mumbai University', phone: '9456789012', desc: 'NSS blood donation camp for students and staff.', type: 'Educational Institution', createdAt: '2024-01-01' },
    { id: 2006, name: 'Rajkot Corporate Blood Drive', location: 'Rajkot, Gujarat', date: '2024-05-22', time: '10:00 AM - 4:00 PM', org: 'FICCI Rajkot Chapter', phone: '9567890123', desc: 'CSR blood camp by leading businesses of Rajkot.', type: 'Corporate', createdAt: '2024-01-01' },
  ]);

  seedIfEmpty('bl_labs', [
    { id: 3001, name: 'SRL Diagnostics', location: 'Ahmedabad, Gujarat', phone: '1800-102-0805', type: 'Private', nabl: true, hours: '6:00 AM - 10:00 PM', services: 'CBC, Blood Group, Cross-matching, HbA1c', desc: 'Comprehensive blood and urine testing with NABL accreditation.', createdAt: '2024-01-01' },
    { id: 3002, name: 'Dr. Lal Path Labs', location: 'Surat, Gujarat', phone: '1800-11-2222', type: 'Private', nabl: true, hours: '7:00 AM - 9:00 PM', services: 'Full blood panel, Hemogram, Special tests', desc: 'NABL-accredited lab with full blood panel and special tests.', createdAt: '2024-01-01' },
    { id: 3003, name: 'Thyrocare', location: 'Vadodara, Gujarat', phone: '9999-879-879', type: 'Private', nabl: false, hours: '7:00 AM - 8:00 PM', services: 'CBC, Thyroid, Diabetes, Metabolic', desc: 'Budget-friendly diagnostic lab offering home collection and online reports.', createdAt: '2024-01-01' },
    { id: 3004, name: 'Metropolis Healthcare', location: 'Mumbai, Maharashtra', phone: '1800-212-4242', type: 'Private', nabl: true, hours: '24 Hours', services: 'Complete blood count, Coagulation, 4000+ tests', desc: 'ISO-certified lab with over 4000 tests.', createdAt: '2024-01-01' },
    { id: 3005, name: 'Gujarat Government Lab', location: 'Gandhinagar, Gujarat', phone: '079-23253001', type: 'Government', nabl: true, hours: '8:00 AM - 6:00 PM', services: 'Basic blood tests, Blood group, Government subsidised', desc: 'State-run accredited pathology lab offering subsidised blood diagnostics.', createdAt: '2024-01-01' },
    { id: 3006, name: 'Neuberg Diagnostics', location: 'Rajkot, Gujarat', phone: '0281-2467111', type: 'Private', nabl: true, hours: '7:00 AM - 9:00 PM', services: 'CBC, Viral markers, Biochemistry', desc: 'Modern diagnostics lab with quick turnaround times and digital reports.', createdAt: '2024-01-01' },
  ]);

  seedIfEmpty('bl_requests', []);
  seedIfEmpty('bl_donors', []);
  seedIfEmpty('bl_bloodbanks', []);
  seedIfEmpty('bl_messages', []);

  /* ==================================================
     DATABASE API
  ================================================== */
  window.BLDb = {
    /* ---- DONORS ---- */
    getDonors: function () { return JSON.parse(localStorage.getItem('bl_donors') || '[]'); },
    addDonor: function (d) {
      var donors = this.getDonors();
      d.id = uid(); d.createdAt = new Date().toISOString();
      donors.push(d);
      localStorage.setItem('bl_donors', JSON.stringify(donors));
      return d;
    },
    getDonorByEmail: function (email) {
      return this.getDonors().find(function (d) { return d.email === email; });
    },
    getDonorByPhone: function (phone) {
      return this.getDonors().find(function (d) { return d.phone === phone; });
    },

    /* ---- BLOOD BANKS ---- */
    getRegisteredBanks: function () { return JSON.parse(localStorage.getItem('bl_bloodbanks') || '[]'); },
    addBloodBank: function (b) {
      var banks = this.getRegisteredBanks();
      b.id = uid(); b.createdAt = new Date().toISOString(); b.verified = false;
      banks.push(b);
      localStorage.setItem('bl_bloodbanks', JSON.stringify(banks));
      return b;
    },
    getBankByEmail: function (email) {
      return this.getRegisteredBanks().find(function (b) { return b.email === email; });
    },

    /* ---- HOSPITALS ---- */
    getHospitals: function () { return JSON.parse(localStorage.getItem('bl_hospitals') || '[]'); },
    addHospital: function (h) {
      var list = this.getHospitals();
      h.id = uid(); h.createdAt = new Date().toISOString();
      list.push(h);
      localStorage.setItem('bl_hospitals', JSON.stringify(list));
      return h;
    },

    /* ---- CAMPS ---- */
    getCamps: function () { return JSON.parse(localStorage.getItem('bl_camps') || '[]'); },
    addCamp: function (c) {
      var list = this.getCamps();
      c.id = uid(); c.createdAt = new Date().toISOString();
      list.push(c);
      localStorage.setItem('bl_camps', JSON.stringify(list));
      return c;
    },

    /* ---- LABS ---- */
    getLabs: function () { return JSON.parse(localStorage.getItem('bl_labs') || '[]'); },
    addLab: function (l) {
      var list = this.getLabs();
      l.id = uid(); l.createdAt = new Date().toISOString();
      list.push(l);
      localStorage.setItem('bl_labs', JSON.stringify(list));
      return l;
    },

    /* ---- BLOOD REQUESTS ---- */
    getRequests: function () { return JSON.parse(localStorage.getItem('bl_requests') || '[]'); },
    addRequest: function (r) {
      var list = this.getRequests();
      r.id = uid(); r.status = 'pending'; r.createdAt = new Date().toISOString();
      list.push(r);
      localStorage.setItem('bl_requests', JSON.stringify(list));
      return r;
    },
    updateRequestStatus: function (id, status) {
      var list = this.getRequests();
      list = list.map(function (r) { return r.id === id ? Object.assign({}, r, { status: status }) : r; });
      localStorage.setItem('bl_requests', JSON.stringify(list));
    },

    /* ---- MESSAGES ---- */
    getMessages: function () { return JSON.parse(localStorage.getItem('bl_messages') || '[]'); },
    addMessage: function (m) {
      var list = this.getMessages();
      m.id = uid(); m.createdAt = new Date().toISOString(); m.status = 'unread';
      list.push(m);
      localStorage.setItem('bl_messages', JSON.stringify(list));
      return m;
    },

    /* ---- AUTH ---- */
    currentUser: function () { return JSON.parse(sessionStorage.getItem('bl_user') || 'null'); },
    login: function (user) { sessionStorage.setItem('bl_user', JSON.stringify(user)); },
    logout: function () {
      sessionStorage.removeItem('bl_user');
      window.location.href = 'index.html';
    },
    requireAuth: function (redirectTo) {
      if (!this.currentUser()) {
        window.location.href = (redirectTo || 'signin.html') + '?next=' + window.location.pathname;
        return false;
      }
      return true;
    },

    /* ---- Utilities ---- */
    toast: showToast,
    fmtDate: fmtDate,
    uid: uid,
  };

})();
