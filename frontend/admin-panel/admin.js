/* =========================================================
   admin.js — BloodLinks Super Admin Dashboard Controller
   Fetches all data from MongoDB backend via REST API
   ========================================================= */

const API = BLDb.BACKEND_URL;

/* ---- Auth Check ---- */
(function () {
  var auth = sessionStorage.getItem('bl_admin_auth');
  if (!auth) { window.location.href = 'login.html'; return; }
  try {
    var admin = JSON.parse(auth);
    var el = document.getElementById('admin-name-display');
    if (el) el.textContent = admin.username || 'Admin';
  } catch (e) {}
})();

/* ---- State ---- */
var STATE = {
  donors: [], banks: [], requests: [], hospitals: [],
  camps: [], labs: [], messages: []
};

/* ---- Preloader ---- */
setTimeout(function () {
  var pl = document.getElementById('preloader');
  if (pl) { pl.style.opacity = '0'; setTimeout(function () { pl.style.display = 'none'; }, 400); }
}, 800);

/* ---- Time ---- */
function updateTime() {
  var el = document.getElementById('topbar-time');
  if (el) el.textContent = new Date().toLocaleString('en-IN', { weekday: 'short', day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
}
updateTime();
setInterval(updateTime, 30000);

/* ---- Sidebar ---- */
function toggleSidebar() {
  document.getElementById('sidebar').classList.toggle('collapsed');
  document.getElementById('main-wrap').classList.toggle('expanded');
}
function toggleMobileSidebar() {
  document.getElementById('sidebar').classList.toggle('mobile-open');
}

/* ---- Tabs ---- */
function showTab(tab, el) {
  document.querySelectorAll('.tab-pane').forEach(function (p) { p.style.display = 'none'; });
  document.querySelectorAll('.nav-link').forEach(function (n) { n.classList.remove('active'); });
  var pane = document.getElementById('tab-' + tab);
  if (pane) pane.style.display = 'block';
  if (el) el.classList.add('active');
  var titles = {
    dashboard: '<i class="fas fa-tachometer-alt"></i> Dashboard',
    donors: '<i class="fas fa-users"></i> Donors',
    bloodbanks: '<i class="fas fa-hospital-alt"></i> Blood Banks',
    requests: '<i class="fas fa-first-aid"></i> Blood Requests',
    hospitals: '<i class="fas fa-hospital"></i> Hospitals',
    camps: '<i class="fas fa-campground"></i> Blood Camps',
    labs: '<i class="fas fa-flask"></i> Labs',
    messages: '<i class="fas fa-envelope"></i> Messages',
    analytics: '<i class="fas fa-chart-bar"></i> Analytics',
    settings: '<i class="fas fa-cog"></i> Settings',
  };
  var tt = document.getElementById('topbar-title');
  if (tt && titles[tab]) tt.innerHTML = titles[tab];
}

/* ---- Toast ---- */
function toast(msg, type) { BLDb.toast(msg, type || 'success'); }

/* ---- Format Date ---- */
function fmtDate(d) {
  if (!d) return '-';
  return new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

/* ===========================================================
   DATA LOADING — Fetches from MongoDB backend
=========================================================== */
async function loadAllData() {
  try {
    var [donors, banks, requests, hospitals, camps, labs, messages] = await Promise.all([
      BLDb.api.get('/donors'),
      BLDb.api.get('/bloodbanks'),
      BLDb.api.get('/requests'),
      BLDb.api.get('/hospitals'),
      BLDb.api.get('/camps'),
      BLDb.api.get('/labs'),
      BLDb.api.get('/messages'),
    ]);
    STATE.donors = donors || [];
    STATE.banks = banks || [];
    STATE.requests = requests || [];
    STATE.hospitals = hospitals || [];
    STATE.camps = camps || [];
    STATE.labs = labs || [];
    STATE.messages = messages || [];
  } catch (e) {
    console.error('Failed to load data:', e);
    toast('Failed to load data from server.', 'error');
  }
}

/* ===========================================================
   RENDER FUNCTIONS
=========================================================== */

/* ---- Dashboard Overview ---- */
function renderOverview() {
  var stats = [
    { label: 'Total Donors', value: STATE.donors.length, icon: 'fas fa-users', color: '#2ecc71', bg: 'rgba(46,204,113,0.12)' },
    { label: 'Blood Banks', value: STATE.banks.length, icon: 'fas fa-hospital-alt', color: '#e01e37', bg: 'rgba(224,30,55,0.12)' },
    { label: 'Blood Requests', value: STATE.requests.length, icon: 'fas fa-first-aid', color: '#5a9fff', bg: 'rgba(90,159,255,0.12)' },
    { label: 'Hospitals', value: STATE.hospitals.length, icon: 'fas fa-hospital', color: '#f39c12', bg: 'rgba(243,156,18,0.12)' },
    { label: 'Blood Camps', value: STATE.camps.length, icon: 'fas fa-campground', color: '#9b59b6', bg: 'rgba(155,89,182,0.12)' },
    { label: 'Labs', value: STATE.labs.length, icon: 'fas fa-flask', color: '#1abc9c', bg: 'rgba(26,188,156,0.12)' },
    { label: 'Messages', value: STATE.messages.length, icon: 'fas fa-envelope', color: '#57c5ff', bg: 'rgba(87,197,255,0.12)' },
    { label: 'Pending Requests', value: STATE.requests.filter(function (r) { return r.status === 'pending'; }).length, icon: 'fas fa-clock', color: '#ff6464', bg: 'rgba(255,100,100,0.12)' },
  ];
  var el = document.getElementById('overview-stats');
  if (el) el.innerHTML = stats.map(function (s) {
    return '<div class="stat-card"><div class="stat-icon" style="background:' + s.bg + ';color:' + s.color + '"><i class="' + s.icon + '"></i></div><div class="stat-info"><div class="stat-value">' + s.value + '</div><div class="stat-label">' + s.label + '</div></div></div>';
  }).join('');

  // Update badges
  var badges = { donors: STATE.donors.length, banks: STATE.banks.length, requests: STATE.requests.length, hospitals: STATE.hospitals.length, camps: STATE.camps.length, labs: STATE.labs.length, messages: STATE.messages.filter(function (m) { return m.status === 'unread'; }).length };
  Object.keys(badges).forEach(function (k) {
    var b = document.getElementById('badge-' + k);
    if (b) b.textContent = badges[k];
  });
}

/* ---- Blood Group Chart ---- */
function renderBloodChart() {
  var groups = ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'];
  var colors = {
    'A+': { bg: 'linear-gradient(135deg, #e01e37 0%, #c71f37 100%)', glow: 'rgba(224,30,55,0.3)' },
    'A-': { bg: 'linear-gradient(135deg, #d90429 0%, #a4133c 100%)', glow: 'rgba(217,4,41,0.3)' },
    'B+': { bg: 'linear-gradient(135deg, #5a9fff 0%, #3a7bd5 100%)', glow: 'rgba(90,159,255,0.3)' },
    'B-': { bg: 'linear-gradient(135deg, #4361ee 0%, #3a0ca3 100%)', glow: 'rgba(67,97,238,0.3)' },
    'O+': { bg: 'linear-gradient(135deg, #2ecc71 0%, #27ae60 100%)', glow: 'rgba(46,204,113,0.3)' },
    'O-': { bg: 'linear-gradient(135deg, #1abc9c 0%, #16a085 100%)', glow: 'rgba(26,188,156,0.3)' },
    'AB+': { bg: 'linear-gradient(135deg, #f39c12 0%, #e67e22 100%)', glow: 'rgba(243,156,18,0.3)' },
    'AB-': { bg: 'linear-gradient(135deg, #9b59b6 0%, #8e44ad 100%)', glow: 'rgba(155,89,182,0.3)' },
  };
  var counts = {};
  groups.forEach(function (g) { counts[g] = 0; });
  STATE.donors.forEach(function (d) { if (counts[d.bloodGroup] !== undefined) counts[d.bloodGroup]++; });
  var total = STATE.donors.length || 1;
  var max = Math.max.apply(null, groups.map(function (g) { return counts[g]; })) || 1;
  var el = document.getElementById('blood-chart');
  if (!el) return;

  el.innerHTML = '<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:12px;padding:4px">' +
    groups.map(function (g) {
      var c = colors[g];
      var pct = max > 0 ? Math.round((counts[g] / max) * 100) : 0;
      var donorPct = total > 0 ? ((counts[g] / total) * 100).toFixed(1) : '0.0';
      return '<div style="' +
        'background:rgba(255,255,255,0.03);' +
        'border:1px solid rgba(255,255,255,0.06);' +
        'border-radius:14px;' +
        'padding:16px 12px;' +
        'text-align:center;' +
        'transition:all 0.3s ease;' +
        'cursor:default;' +
        'position:relative;' +
        'overflow:hidden;' +
        '">' +
        /* Blood drop icon */
        '<div style="' +
          'width:48px;height:48px;' +
          'background:' + c.bg + ';' +
          'border-radius:50%;' +
          'margin:0 auto 10px;' +
          'display:flex;align-items:center;justify-content:center;' +
          'font-size:1.1rem;font-weight:900;color:#fff;' +
          'box-shadow:0 4px 15px ' + c.glow + ';' +
          'letter-spacing:-0.5px;' +
        '">' + g + '</div>' +
        /* Count */
        '<div style="' +
          'font-size:1.5rem;font-weight:800;color:#fff;' +
          'line-height:1;margin-bottom:4px;' +
        '">' + counts[g] + '</div>' +
        '<div style="' +
          'font-size:0.7rem;color:rgba(255,255,255,0.45);' +
          'text-transform:uppercase;letter-spacing:0.5px;font-weight:600;' +
          'margin-bottom:10px;' +
        '">donors</div>' +
        /* Progress bar */
        '<div style="' +
          'height:4px;background:rgba(255,255,255,0.06);' +
          'border-radius:4px;overflow:hidden;' +
        '">' +
          '<div style="' +
            'height:100%;width:' + pct + '%;' +
            'background:' + c.bg + ';' +
            'border-radius:4px;' +
            'transition:width 0.8s ease;' +
          '"></div>' +
        '</div>' +
        /* Percentage */
        '<div style="' +
          'font-size:0.68rem;color:rgba(255,255,255,0.35);' +
          'margin-top:6px;font-weight:500;' +
        '">' + donorPct + '% of total</div>' +
      '</div>';
    }).join('') +
  '</div>';
}

/* ---- Activity ---- */
function renderActivity() {
  var items = [];
  STATE.donors.slice(0, 3).forEach(function (d) { items.push({ text: 'New donor: ' + d.name, time: d.createdAt, icon: 'fas fa-user-plus', color: '#2ecc71' }); });
  STATE.requests.slice(0, 3).forEach(function (r) { items.push({ text: 'Blood request: ' + r.bloodGroup + ' by ' + r.name, time: r.createdAt, icon: 'fas fa-first-aid', color: '#5a9fff' }); });
  STATE.banks.slice(0, 2).forEach(function (b) { items.push({ text: 'New blood bank: ' + b.name, time: b.createdAt, icon: 'fas fa-hospital-alt', color: '#e01e37' }); });
  items.sort(function (a, b) { return new Date(b.time) - new Date(a.time); });
  var el = document.getElementById('activity-list');
  if (!el) return;
  if (items.length === 0) { el.innerHTML = '<div style="padding:20px;text-align:center;color:var(--text-muted)">No recent activity</div>'; return; }
  el.innerHTML = items.slice(0, 8).map(function (i) {
    return '<div class="activity-item"><div class="activity-icon" style="color:' + i.color + '"><i class="' + i.icon + '"></i></div><div class="activity-info"><div class="activity-text">' + i.text + '</div><div class="activity-time">' + fmtDate(i.time) + '</div></div></div>';
  }).join('');
}

/* ---- Urgent Requests ---- */
function renderUrgent() {
  var urgent = STATE.requests.filter(function (r) { return (r.urgency === 'critical' || r.urgency === 'urgent') && r.status === 'pending'; });
  var el = document.getElementById('urgent-requests-list');
  if (!el) return;
  if (urgent.length === 0) { el.innerHTML = '<div style="padding:16px;text-align:center;color:var(--text-muted)"><i class="fas fa-check-circle" style="color:#2ecc71;margin-right:6px"></i>No urgent requests</div>'; return; }
  el.innerHTML = urgent.map(function (r) {
    var urgClass = r.urgency === 'critical' ? 'background:rgba(255,60,60,0.15);border:1px solid rgba(255,60,60,0.3)' : 'background:rgba(243,156,18,0.1);border:1px solid rgba(243,156,18,0.25)';
    return '<div style="' + urgClass + ';border-radius:10px;padding:12px 16px;margin-bottom:8px;display:flex;align-items:center;gap:12px"><div><strong style="color:#fff">' + (r.name || 'Patient') + '</strong> needs <strong style="color:var(--primary-light)">' + r.bloodGroup + '</strong> (' + (r.units || 1) + ' unit) — <span style="color:var(--text-secondary)">' + (r.city || '') + '</span></div><span class="badge-' + r.urgency + '" style="margin-left:auto;padding:4px 10px;border-radius:6px;font-size:0.75rem;font-weight:700;text-transform:uppercase;' + (r.urgency === 'critical' ? 'background:rgba(255,60,60,0.2);color:#ff4444' : 'background:rgba(243,156,18,0.2);color:#f39c12') + '">' + r.urgency + '</span></div>';
  }).join('');
}

/* ---- Donors Table ---- */
function renderDonors(list) {
  list = list || STATE.donors;
  var el = document.getElementById('donors-tbody');
  if (!el) return;
  if (list.length === 0) { el.innerHTML = '<tr><td colspan="8" style="text-align:center;padding:30px;color:var(--text-muted)">No donors found</td></tr>'; return; }
  el.innerHTML = list.map(function (d, i) {
    return '<tr><td>' + (i + 1) + '</td><td><strong>' + (d.name || d.firstName + ' ' + d.lastName) + '</strong></td><td>' + (d.email || '-') + '</td><td>' + (d.phone || '-') + '</td><td><span class="blood-badge">' + (d.bloodGroup || '-') + '</span></td><td>' + (d.city || '-') + '</td><td>' + fmtDate(d.createdAt) + '</td><td><button class="action-btn-sm danger" onclick="deleteDonor(\'' + d._id + '\')"><i class="fas fa-trash"></i></button></td></tr>';
  }).join('');
}

function filterDonors() {
  var search = (document.getElementById('donor-search').value || '').toLowerCase();
  var bg = document.getElementById('donor-bg-filter').value;
  var filtered = STATE.donors.filter(function (d) {
    var matchSearch = !search || (d.name || '').toLowerCase().includes(search) || (d.email || '').toLowerCase().includes(search) || (d.phone || '').includes(search);
    var matchBg = !bg || d.bloodGroup === bg;
    return matchSearch && matchBg;
  });
  renderDonors(filtered);
}

async function deleteDonor(id) {
  if (!confirm('Delete this donor?')) return;
  await BLDb.api.delete('/donors/' + id);
  toast('Donor deleted');
  await refreshAll();
}

/* ---- Blood Banks Table ---- */
function renderBanks(list) {
  list = list || STATE.banks;
  var el = document.getElementById('banks-tbody');
  if (!el) return;
  if (list.length === 0) { el.innerHTML = '<tr><td colspan="8" style="text-align:center;padding:30px;color:var(--text-muted)">No blood banks found</td></tr>'; return; }
  el.innerHTML = list.map(function (b, i) {
    var status = b.verified ? '<span style="color:#2ecc71;font-weight:600"><i class="fas fa-check-circle"></i> Verified</span>' : '<span style="color:#f39c12;font-weight:600"><i class="fas fa-clock"></i> Pending</span>';
    return '<tr><td>' + (i + 1) + '</td><td><strong>' + b.name + '</strong></td><td>' + (b.email || '-') + '</td><td>' + (b.city || b.location || '-') + '</td><td>' + (b.category || '-') + '</td><td>' + status + '</td><td>' + fmtDate(b.createdAt) + '</td><td>' + (!b.verified ? '<button class="action-btn-sm success" onclick="verifyBank(\'' + b._id + '\')"><i class="fas fa-check"></i></button> ' : '') + '<button class="action-btn-sm danger" onclick="deleteBank(\'' + b._id + '\')"><i class="fas fa-trash"></i></button></td></tr>';
  }).join('');
}

function filterBanks() {
  var search = (document.getElementById('bank-search').value || '').toLowerCase();
  var status = document.getElementById('bank-verified-filter').value;
  var filtered = STATE.banks.filter(function (b) {
    var matchSearch = !search || b.name.toLowerCase().includes(search) || (b.email || '').toLowerCase().includes(search);
    var matchStatus = !status || (status === 'verified' ? b.verified : !b.verified);
    return matchSearch && matchStatus;
  });
  renderBanks(filtered);
}

async function verifyBank(id) {
  await BLDb.api.put('/bloodbanks/' + id + '/verify', {});
  toast('Blood bank verified!');
  await refreshAll();
}

async function deleteBank(id) {
  if (!confirm('Delete this blood bank?')) return;
  await BLDb.api.delete('/bloodbanks/' + id);
  toast('Blood bank deleted');
  await refreshAll();
}

/* ---- Requests Table ---- */
function renderRequests(list) {
  list = list || STATE.requests;
  var el = document.getElementById('requests-tbody');
  if (!el) return;
  if (list.length === 0) { el.innerHTML = '<tr><td colspan="9" style="text-align:center;padding:30px;color:var(--text-muted)">No requests found</td></tr>'; return; }
  el.innerHTML = list.map(function (r, i) {
    var urgColor = { critical: '#ff4444', urgent: '#f39c12', normal: '#2ecc71' };
    var statusColor = { pending: '#f39c12', fulfilled: '#2ecc71', cancelled: '#999' };
    return '<tr><td>' + (i + 1) + '</td><td>' + (r.name || '-') + '</td><td><span class="blood-badge">' + r.bloodGroup + '</span></td><td>' + (r.units || 1) + '</td><td><span style="color:' + (urgColor[r.urgency] || '#999') + ';font-weight:600;text-transform:capitalize">' + (r.urgency || 'normal') + '</span></td><td>' + (r.city || '-') + '</td><td><span style="color:' + (statusColor[r.status] || '#999') + ';font-weight:600;text-transform:capitalize">' + (r.status || 'pending') + '</span></td><td>' + fmtDate(r.createdAt) + '</td><td>' + (r.status === 'pending' ? '<button class="action-btn-sm success" onclick="fulfillRequest(\'' + r._id + '\')"><i class="fas fa-check"></i></button> ' : '') + '<button class="action-btn-sm danger" onclick="deleteRequest(\'' + r._id + '\')"><i class="fas fa-trash"></i></button></td></tr>';
  }).join('');
}

function filterRequests() {
  var search = (document.getElementById('req-search').value || '').toLowerCase();
  var status = document.getElementById('req-status-filter').value;
  var urgency = document.getElementById('req-urgency-filter').value;
  var filtered = STATE.requests.filter(function (r) {
    return (!search || (r.name || '').toLowerCase().includes(search) || (r.bloodGroup || '').includes(search)) &&
      (!status || r.status === status) && (!urgency || r.urgency === urgency);
  });
  renderRequests(filtered);
}

async function fulfillRequest(id) {
  await BLDb.api.put('/requests/' + id + '/status', { status: 'fulfilled' });
  toast('Request marked as fulfilled!');
  await refreshAll();
}

async function deleteRequest(id) {
  if (!confirm('Delete this request?')) return;
  await BLDb.api.delete('/requests/' + id);
  toast('Request deleted');
  await refreshAll();
}

/* ---- Hospitals Table ---- */
function renderHospitals(list) {
  list = list || STATE.hospitals;
  var el = document.getElementById('hospitals-tbody');
  if (!el) return;
  if (list.length === 0) { el.innerHTML = '<tr><td colspan="7" style="text-align:center;padding:30px;color:var(--text-muted)">No hospitals found</td></tr>'; return; }
  el.innerHTML = list.map(function (h, i) {
    return '<tr><td>' + (i + 1) + '</td><td><strong>' + h.name + '</strong></td><td>' + (h.location || '-') + '</td><td>' + (h.phone || '-') + '</td><td>' + (h.type || '-') + '</td><td>' + (h.bloodBank ? '<span style="color:#2ecc71"><i class="fas fa-check"></i> Yes</span>' : '<span style="color:#999">No</span>') + '</td><td><button class="action-btn-sm danger" onclick="deleteHospital(\'' + h._id + '\')"><i class="fas fa-trash"></i></button></td></tr>';
  }).join('');
}

function filterHospitals() {
  var search = (document.getElementById('hosp-search').value || '').toLowerCase();
  var type = document.getElementById('hosp-type-filter').value;
  var filtered = STATE.hospitals.filter(function (h) {
    return (!search || h.name.toLowerCase().includes(search)) && (!type || h.type === type);
  });
  renderHospitals(filtered);
}

async function deleteHospital(id) {
  if (!confirm('Delete this hospital?')) return;
  await BLDb.api.delete('/hospitals/' + id);
  toast('Hospital deleted');
  await refreshAll();
}

/* ---- Camps Table ---- */
function renderCamps(list) {
  list = list || STATE.camps;
  var el = document.getElementById('camps-tbody');
  if (!el) return;
  if (list.length === 0) { el.innerHTML = '<tr><td colspan="8" style="text-align:center;padding:30px;color:var(--text-muted)">No camps found</td></tr>'; return; }
  el.innerHTML = list.map(function (c, i) {
    return '<tr><td>' + (i + 1) + '</td><td><strong>' + c.name + '</strong></td><td>' + (c.org || '-') + '</td><td>' + (c.location || '-') + '</td><td>' + (c.date || '-') + '</td><td>' + (c.time || '-') + '</td><td>' + (c.type || '-') + '</td><td><button class="action-btn-sm danger" onclick="deleteCamp(\'' + c._id + '\')"><i class="fas fa-trash"></i></button></td></tr>';
  }).join('');
}

function filterCamps() {
  var search = (document.getElementById('camp-search').value || '').toLowerCase();
  var filtered = STATE.camps.filter(function (c) {
    return !search || c.name.toLowerCase().includes(search) || (c.org || '').toLowerCase().includes(search);
  });
  renderCamps(filtered);
}

async function deleteCamp(id) {
  if (!confirm('Delete this camp?')) return;
  await BLDb.api.delete('/camps/' + id);
  toast('Camp deleted');
  await refreshAll();
}

/* ---- Labs Table ---- */
function renderLabs(list) {
  list = list || STATE.labs;
  var el = document.getElementById('labs-tbody');
  if (!el) return;
  if (list.length === 0) { el.innerHTML = '<tr><td colspan="8" style="text-align:center;padding:30px;color:var(--text-muted)">No labs found</td></tr>'; return; }
  el.innerHTML = list.map(function (l, i) {
    return '<tr><td>' + (i + 1) + '</td><td><strong>' + l.name + '</strong></td><td>' + (l.location || '-') + '</td><td>' + (l.phone || '-') + '</td><td>' + (l.type || '-') + '</td><td>' + (l.nabl ? '<span style="color:#2ecc71"><i class="fas fa-check-circle"></i> Yes</span>' : '<span style="color:#999">No</span>') + '</td><td>' + (l.hours || '-') + '</td><td><button class="action-btn-sm danger" onclick="deleteLab(\'' + l._id + '\')"><i class="fas fa-trash"></i></button></td></tr>';
  }).join('');
}

function filterLabs() {
  var search = (document.getElementById('lab-search').value || '').toLowerCase();
  var nabl = document.getElementById('lab-nabl-filter').value;
  var filtered = STATE.labs.filter(function (l) {
    return (!search || l.name.toLowerCase().includes(search)) && (!nabl || String(l.nabl) === nabl);
  });
  renderLabs(filtered);
}

async function deleteLab(id) {
  if (!confirm('Delete this lab?')) return;
  await BLDb.api.delete('/labs/' + id);
  toast('Lab deleted');
  await refreshAll();
}

/* ---- Messages ---- */
function renderMessages(list) {
  list = list || STATE.messages;
  var el = document.getElementById('messages-grid');
  if (!el) return;
  if (list.length === 0) { el.innerHTML = '<div style="text-align:center;padding:40px;color:var(--text-muted)"><i class="fas fa-inbox" style="font-size:2rem;margin-bottom:8px;display:block"></i>No messages yet</div>'; return; }
  el.innerHTML = list.map(function (m) {
    var unread = m.status === 'unread';
    return '<div class="card" style="margin-bottom:12px;' + (unread ? 'border-left:3px solid var(--primary)' : '') + '"><div style="display:flex;justify-content:space-between;align-items:start"><div><strong style="color:#fff">' + m.name + '</strong> <span style="color:var(--text-muted);font-size:0.8rem">(' + (m.email || '') + ')</span>' + (unread ? ' <span style="background:var(--primary);color:#fff;font-size:0.65rem;padding:2px 6px;border-radius:4px;font-weight:700">NEW</span>' : '') + '<div style="color:var(--text-secondary);margin-top:6px;font-size:0.87rem">' + (m.message || '') + '</div><div style="color:var(--text-muted);font-size:0.78rem;margin-top:6px">' + fmtDate(m.createdAt) + '</div></div><div style="display:flex;gap:6px">' + (unread ? '<button class="action-btn-sm" onclick="markRead(\'' + m._id + '\')"><i class="fas fa-check"></i></button>' : '') + '<button class="action-btn-sm danger" onclick="deleteMessage(\'' + m._id + '\')"><i class="fas fa-trash"></i></button></div></div></div>';
  }).join('');
}

function filterMessages() {
  var search = (document.getElementById('msg-search').value || '').toLowerCase();
  var status = document.getElementById('msg-status-filter').value;
  var filtered = STATE.messages.filter(function (m) {
    return (!search || m.name.toLowerCase().includes(search) || (m.message || '').toLowerCase().includes(search)) &&
      (!status || m.status === status);
  });
  renderMessages(filtered);
}

async function markRead(id) {
  await BLDb.api.put('/messages/' + id + '/read', {});
  toast('Marked as read');
  await refreshAll();
}

async function deleteMessage(id) {
  if (!confirm('Delete this message?')) return;
  await BLDb.api.delete('/messages/' + id);
  toast('Message deleted');
  await refreshAll();
}

async function clearMessages() {
  if (!confirm('Delete ALL messages? This cannot be undone.')) return;
  await BLDb.api.delete('/messages');
  toast('All messages cleared');
  await refreshAll();
}

/* ---- Analytics ---- */
function renderAnalytics() {
  var el = document.getElementById('analytics-content');
  if (!el) return;
  var bgGroups = {};
  STATE.donors.forEach(function (d) { bgGroups[d.bloodGroup] = (bgGroups[d.bloodGroup] || 0) + 1; });
  var pendingReqs = STATE.requests.filter(function (r) { return r.status === 'pending'; }).length;
  var fulfilledReqs = STATE.requests.filter(function (r) { return r.status === 'fulfilled'; }).length;
  var verifiedBanks = STATE.banks.filter(function (b) { return b.verified; }).length;

  el.innerHTML =
    '<div class="card"><div class="card-head"><div class="card-icon" style="background:rgba(46,204,113,0.12);color:#2ecc71"><i class="fas fa-chart-pie"></i></div><div><div class="card-title">Platform Summary</div></div></div><div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:16px;margin-top:12px">' +
    '<div style="text-align:center"><div style="font-size:1.8rem;font-weight:800;color:#2ecc71">' + STATE.donors.length + '</div><div style="font-size:0.8rem;color:var(--text-secondary)">Total Donors</div></div>' +
    '<div style="text-align:center"><div style="font-size:1.8rem;font-weight:800;color:#e01e37">' + STATE.banks.length + '</div><div style="font-size:0.8rem;color:var(--text-secondary)">Blood Banks</div></div>' +
    '<div style="text-align:center"><div style="font-size:1.8rem;font-weight:800;color:#5a9fff">' + pendingReqs + '</div><div style="font-size:0.8rem;color:var(--text-secondary)">Pending Requests</div></div>' +
    '<div style="text-align:center"><div style="font-size:1.8rem;font-weight:800;color:#2ecc71">' + fulfilledReqs + '</div><div style="font-size:0.8rem;color:var(--text-secondary)">Fulfilled</div></div>' +
    '<div style="text-align:center"><div style="font-size:1.8rem;font-weight:800;color:#f39c12">' + verifiedBanks + '/' + STATE.banks.length + '</div><div style="font-size:0.8rem;color:var(--text-secondary)">Verified Banks</div></div>' +
    '</div></div>' +
    '<div class="card" style="margin-top:16px"><div class="card-head"><div class="card-icon" style="background:rgba(224,30,55,0.12);color:#e01e37"><i class="fas fa-tint"></i></div><div><div class="card-title">Donors by Blood Group</div></div></div><div style="display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin-top:12px">' +
    ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'].map(function (g) {
      return '<div style="text-align:center;padding:12px;background:rgba(255,255,255,0.03);border-radius:8px;border:1px solid var(--border)"><div style="font-size:1.2rem;font-weight:800;color:var(--primary-light)">' + (bgGroups[g] || 0) + '</div><div style="font-size:0.8rem;color:var(--text-secondary)">' + g + '</div></div>';
    }).join('') + '</div></div>';
}

/* ---- System Info ---- */
function renderSystemInfo() {
  var el = document.getElementById('system-info');
  if (!el) return;
  var info = [
    { label: 'Platform', value: 'BloodLinks v2.0' },
    { label: 'Database', value: 'MongoDB Atlas' },
    { label: 'Backend', value: 'Node.js + Express' },
    { label: 'Total Records', value: (STATE.donors.length + STATE.banks.length + STATE.hospitals.length + STATE.camps.length + STATE.labs.length) },
    { label: 'Admin', value: JSON.parse(sessionStorage.getItem('bl_admin_auth') || '{}').username || 'admin' },
    { label: 'Last Refresh', value: new Date().toLocaleString('en-IN') },
  ];
  el.innerHTML = info.map(function (i) {
    return '<div class="info-item"><span class="info-label">' + i.label + '</span><span class="info-value">' + i.value + '</span></div>';
  }).join('');
}

/* ---- Settings ---- */
function changeCredentials() {
  toast('Credential change requires backend implementation. Contact the developer.', 'info');
}

/* ---- Export ---- */
function exportData(type) {
  var data = STATE[type] || [];
  var blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  var a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'bloodlinks_' + type + '_' + new Date().toISOString().split('T')[0] + '.json';
  a.click();
  toast('Exported ' + data.length + ' ' + type + ' records');
}

function exportAllData() {
  var blob = new Blob([JSON.stringify(STATE, null, 2)], { type: 'application/json' });
  var a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'bloodlinks_full_export_' + new Date().toISOString().split('T')[0] + '.json';
  a.click();
  toast('Full data export completed!');
}

function seedSampleData() { toast('Data is now managed via MongoDB. Use the seed.js script.', 'info'); }
function clearAllData() { toast('Use MongoDB Atlas dashboard to manage data directly.', 'info'); }

/* ---- Add Modals (stubs — open add pages) ---- */
function openAddHospital() { window.open('../add_hospital.html', '_blank'); }
function openAddCamp() { window.open('../add_camps.html', '_blank'); }
function openAddLab() { window.open('../add_lab.html', '_blank'); }

/* ---- Modals ---- */
function closeModal() { document.getElementById('modal-overlay').style.display = 'none'; }
function closeConfirm() { document.getElementById('confirm-overlay').style.display = 'none'; }

/* ---- Logout ---- */
function adminLogout() {
  sessionStorage.removeItem('bl_admin_auth');
  sessionStorage.removeItem('bl_token');
  window.location.href = 'login.html';
}

/* ===========================================================
   REFRESH & INIT
=========================================================== */
async function refreshAll() {
  var icon = document.getElementById('refresh-icon');
  if (icon) icon.classList.add('fa-spin');
  await loadAllData();
  renderOverview();
  renderBloodChart();
  renderActivity();
  renderUrgent();
  renderDonors();
  renderBanks();
  renderRequests();
  renderHospitals();
  renderCamps();
  renderLabs();
  renderMessages();
  renderAnalytics();
  renderSystemInfo();
  if (icon) setTimeout(function () { icon.classList.remove('fa-spin'); }, 500);
}

// Boot
refreshAll();
