/* =====================================================
   nav.js  — Shared navigation & footer injector
   Call: BloodLinks.initPage({ active: 'blood-banks' })
   ===================================================== */
(function () {
  'use strict';

  const NAV_LINKS = [
    {
      label: 'Blood Banks', key: 'blood-banks', dropdown: [
        { icon: 'fas fa-search', label: 'Find Blood Bank', href: 'find_bloodbank.html' },
        { icon: 'fas fa-tint', label: 'Donate Blood', href: 'register.html' },
        { icon: 'fas fa-first-aid', label: 'Request Blood', href: 'register.html' },
        { icon: 'fas fa-plus-circle', label: 'Register Blood Bank', href: 'add_bloodbank.html' },
      ]
    },
    {
      label: 'Hospitals', key: 'hospitals', dropdown: [
        { icon: 'fas fa-hospital', label: 'Find Hospitals', href: 'find_hospital.html' },
        { icon: 'fas fa-plus-circle', label: 'Register Hospital', href: 'add_hospital.html' },
      ]
    },
    {
      label: 'Blood Camps', key: 'blood-camps', dropdown: [
        { icon: 'fas fa-campground', label: 'Find Blood Camps', href: 'find_camp.html' },
        { icon: 'fas fa-plus-circle', label: 'Register Blood Camp', href: 'add_camps.html' },
      ]
    },
    {
      label: 'Labs', key: 'labs', dropdown: [
        { icon: 'fas fa-flask', label: 'Find Labs', href: 'find_lab.html' },
        { icon: 'fas fa-plus-circle', label: 'Register Lab', href: 'add_lab.html' },
      ]
    },
    {
      label: 'Donation Guide', key: 'guide', dropdown: [
        { icon: 'fas fa-book-open', label: 'The Process', href: 'process.html' },
        { icon: 'fas fa-heartbeat', label: 'After Donation', href: 'post_donate.html' },
        { icon: 'fas fa-clipboard-list', label: 'Pre & Post Pursuit', href: 'pre_post.html' },
      ]
    },
  ];

  function buildNav(activeKey) {
    const items = NAV_LINKS.map(nav => `
      <li class="nav-item">
        <a href="#" class="nav-link ${nav.key === activeKey ? 'active' : ''}">
          ${nav.label} <i class="fas fa-chevron-down"></i>
        </a>
        <div class="dropdown-menu-custom">
          ${nav.dropdown.map(d => `
            <a href="${d.href}" class="dropdown-item">
              <i class="${d.icon}"></i> ${d.label}
            </a>`).join('')}
        </div>
      </li>`).join('');

    const mobileItems = NAV_LINKS.flatMap(nav =>
      nav.dropdown.map(d => `<a href="${d.href}" class="mobile-nav-link">${d.label}</a>`)
    ).join('');

    return `
      <!-- Top Bar -->
      <div class="top-bar">
        <div class="container">
          <div class="top-bar-left">
            <a href="find_bloodbank.html"><i class="fas fa-search"></i> Find Blood Bank</a>
            <a href="find_camp.html"><i class="fas fa-campground"></i> Find Blood Camp</a>
          </div>
          <div class="top-bar-right">
            <a href="https://play.google.com/store/apps/details?id=com.bloodlink" target="_blank"><i class="fab fa-google-play"></i> Download App</a>
            <a href="admin.html"><i class="fas fa-lock"></i> Blood Bank Login</a>
            <a href="about.html">About Us</a>
            <a href="contact.html">Contact</a>
          </div>
        </div>
      </div>
      <!-- Navbar -->
      <nav class="navbar" id="navbar">
        <div class="container">
          <a href="index.html" class="navbar-brand">
            <div class="brand-logo-icon">🩸</div>
            <div class="brand-text">
              <div class="brand-name">BloodLinks</div>
              <div class="brand-tagline">Save a Life Today</div>
            </div>
          </a>
           <ul class="nav-menu">${items}</ul>
          <div class="nav-actions" id="nav-actions-placeholder">
            <a href="signin.html" class="btn-outline-red">Login</a>
            <a href="register.html" class="btn-red">Donate Blood</a>
          </div>
          <button class="hamburger" id="hamburger" aria-label="Toggle Menu">
            <span></span><span></span><span></span>
          </button>
        </div>
        <div class="mobile-menu" id="mobile-menu">
          ${mobileItems}
          <div style="height:1px;background:var(--border);margin:8px 0"></div>
          <a href="about.html" class="mobile-nav-link">About Us</a>
          <a href="contact.html" class="mobile-nav-link">Contact</a>
          <a href="admin.html" class="mobile-nav-link"><i class="fas fa-lock" style="margin-right:6px"></i> Blood Bank Login</a>
          <a href="https://play.google.com/store/apps/details?id=com.bloodlink" target="_blank" class="mobile-nav-link"><i class="fab fa-google-play" style="margin-right:6px"></i> Download App</a>
          <div style="height:1px;background:var(--border);margin:8px 0"></div>
          <a href="signin.html" class="mobile-nav-link highlight" id="m-login-link">Donor Login</a>
          <a href="register.html" class="mobile-nav-link highlight">Register</a>
        </div>
      </nav>`;
  }

  function buildFooter() {
    return `
      <footer class="footer">
        <div class="container">
          <div class="footer-grid">
            <div class="footer-brand">
              <div class="footer-logo">
                <div class="footer-logo-icon">🩸</div>
                <div class="footer-brand-name">BloodLinks</div>
              </div>
              <p class="footer-desc">BloodLinks is a platform that helps streamline blood donation and blood requests — putting the power to save a life in the palm of your hand.</p>
              <div class="footer-social">
                <a href="#" class="social-link" aria-label="Facebook"><i class="fab fa-facebook-f"></i></a>
                <a href="#" class="social-link" aria-label="Twitter"><i class="fab fa-twitter"></i></a>
                <a href="#" class="social-link" aria-label="Instagram"><i class="fab fa-instagram"></i></a>
                <a href="#" class="social-link" aria-label="LinkedIn"><i class="fab fa-linkedin-in"></i></a>
              </div>
            </div>
            <div class="footer-col">
              <h4>Save Life</h4>
              <div class="footer-links">
                <a href="register.html"><i class="fas fa-angle-right"></i> Request Blood</a>
                <a href="register.html"><i class="fas fa-angle-right"></i> Donate Blood</a>
                <a href="find_bloodbank.html"><i class="fas fa-angle-right"></i> Find Blood Bank</a>
                <a href="find_hospital.html"><i class="fas fa-angle-right"></i> Find Hospital</a>
                <a href="find_camp.html"><i class="fas fa-angle-right"></i> Find Blood Camp</a>
                <a href="find_lab.html"><i class="fas fa-angle-right"></i> Find Labs</a>
              </div>
            </div>
            <div class="footer-col">
              <h4>Register</h4>
              <div class="footer-links">
                <a href="signin.html"><i class="fas fa-angle-right"></i> Donor Signup</a>
                <a href="add_bloodbank.html"><i class="fas fa-angle-right"></i> Blood Bank Sign Up</a>
                <a href="add_hospital.html"><i class="fas fa-angle-right"></i> Hospital Sign Up</a>
                <a href="add_lab.html"><i class="fas fa-angle-right"></i> Lab Sign Up</a>
              </div>
            </div>
            <div class="footer-col">
              <h4>Company</h4>
              <div class="footer-links">
                <a href="about.html"><i class="fas fa-angle-right"></i> About Us</a>
                <a href="contact.html"><i class="fas fa-angle-right"></i> Contact Us</a>
                <a href="privacy.html"><i class="fas fa-angle-right"></i> Privacy Policy</a>
                <a href="terms.html"><i class="fas fa-angle-right"></i> Terms of Service</a>
              </div>
              <div style="margin-top:20px">
                <h4>Download App</h4>
                <a href="https://play.google.com/store/apps/details?id=com.bloodlink" target="_blank" class="footer-app-badge">
                  <i class="fab fa-google-play"></i>
                  <div><div style="font-size:0.68rem;color:var(--text-muted)">Get it on</div><div style="font-size:0.85rem;font-weight:600">Google Play</div></div>
                </a>
              </div>
            </div>
          </div>
        </div>
        <div class="footer-bottom">
          <div class="container" style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:16px">
            <p>© 2024 BloodLinks · Colossal Health Private Limited. All rights reserved.</p>
            <div class="footer-bottom-links">
              <a href="privacy.html">Privacy Policy</a>
              <a href="terms.html">Terms of Service</a>
              <a href="contact.html">Contact</a>
            </div>
          </div>
        </div>
      </footer>`;
  }

  window.BloodLinks = {
    initPage: function (opts) {
      opts = opts || {};
      const activeKey = opts.active || '';
      // Inject nav
      const navEl = document.getElementById('bl-nav');
      if (navEl) navEl.innerHTML = buildNav(activeKey);
      // Inject footer
      const footerEl = document.getElementById('bl-footer');
      if (footerEl) footerEl.innerHTML = buildFooter();
      // Update nav buttons based on auth (db.js may be loaded)
      setTimeout(function() {
        try {
          const user = window.BLDb ? window.BLDb.currentUser() : JSON.parse(sessionStorage.getItem('bl_user') || 'null');
          const actionsEl = document.getElementById('nav-actions-placeholder');
          const mLoginEl = document.getElementById('m-login-link');
          if (user && actionsEl) {
            const dashHref = user.type === 'bloodbank' ? 'bank_dashboard.html' : 'dashboard.html';
            const label = user.firstName || user.name || 'Dashboard';
            actionsEl.innerHTML = `<a href="${dashHref}" class="btn-outline-red" style="display:flex;align-items:center;gap:6px"><i class="fas fa-user-circle"></i> ${label.split(' ')[0]}</a><a href="register.html" class="btn-red">Donate Blood</a>`;
            if (mLoginEl) { mLoginEl.href = dashHref; mLoginEl.textContent = 'My Dashboard'; }
          }
        } catch(e) {}
      }, 50);

      // ---- Hamburger Menu Toggle (must be after nav injection) ----
      const hamburger = document.getElementById('hamburger');
      const mobileMenu = document.getElementById('mobile-menu');
      if (hamburger && mobileMenu) {
        hamburger.addEventListener('click', function() {
          mobileMenu.classList.toggle('open');
          hamburger.classList.toggle('active');
          const spans = hamburger.querySelectorAll('span');
          if (hamburger.classList.contains('active')) {
            spans[0].style.transform = 'rotate(45deg) translate(5px, 5px)';
            spans[1].style.opacity = '0';
            spans[2].style.transform = 'rotate(-45deg) translate(5px, -5px)';
          } else {
            spans[0].style.transform = '';
            spans[1].style.opacity = '';
            spans[2].style.transform = '';
          }
        });
      }

      // ---- Navbar scroll effect ----
      const navbar = document.getElementById('navbar');
      if (navbar) {
        window.addEventListener('scroll', function() {
          navbar.classList.toggle('scrolled', window.scrollY > 60);
        });
      }
    }
  };
})();
