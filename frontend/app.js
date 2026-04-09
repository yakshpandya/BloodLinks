/* app.js - Blood Links Clone - Dynamic Logic */

(function () {
  'use strict';

  /* ===================== PRELOADER ===================== */
  window.addEventListener('load', () => {
    const preloader = document.getElementById('preloader');
    if (preloader) {
      setTimeout(() => preloader.classList.add('hidden'), 600);
    }
  });

  /* ===================== NAVBAR SCROLL ===================== */
  const navbar = document.querySelector('.navbar');
  if (navbar) {
    window.addEventListener('scroll', () => {
      navbar.classList.toggle('scrolled', window.scrollY > 60);
    });
  }

  /* ===================== HAMBURGER MENU ===================== */
  const hamburger = document.getElementById('hamburger');
  const mobileMenu = document.getElementById('mobile-menu');
  if (hamburger && mobileMenu) {
    hamburger.addEventListener('click', () => {
      mobileMenu.classList.toggle('open');
      const spans = hamburger.querySelectorAll('span');
      hamburger.classList.toggle('active');
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

  /* ===================== UTILS ===================== */
  function getQueryParam(name) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(name);
  }

  function renderStars(rating) {
    const full = Math.floor(rating);
    const half = rating % 1 >= 0.5;
    const empty = 5 - full - (half ? 1 : 0);
    let html = '';
    for (let i = 0; i < full; i++) html += '<i class="fas fa-star star"></i>';
    if (half) html += '<i class="fas fa-star-half-alt star"></i>';
    for (let i = 0; i < empty; i++) html += '<i class="far fa-star star empty"></i>';
    return html;
  }

  function getCategoryClass(category) {
    const map = { private: 'badge-private', government: 'badge-government', trust: 'badge-trust', ngo: 'badge-ngo' };
    return map[(category || '').toLowerCase()] || 'badge-private';
  }

  /* ===================== DETAIL PAGE LOGIC ===================== */
  function loadBankDetails() {
    const container = document.getElementById('bank-details-container');
    if (!container) return; // Not the detail page

    const id = parseInt(getQueryParam('id'), 10);

    try {
      const json = window.BLOOD_BANK_DATA;
      if (!json) throw new Error('Data not loaded');
      const bank = json.bloodBanks.find(b => b.id === id);
      const others = json.bloodBanks.filter(b => b.id !== id);

      if (!bank) {
        renderError(container, id);
        return;
      }

      // Update page title
      document.title = `${bank.name} - BloodLinks`;

      // Render the page hero area
      renderHero(bank);

      // Render main card
      renderMainCard(bank);

      // Render sidebar
      renderSidebar(bank, others);

      // Animate
      document.querySelectorAll('[data-animate]').forEach((el, i) => {
        el.style.animationDelay = `${i * 0.07}s`;
        el.classList.add('fade-in-up');
      });

    } catch (err) {
      renderError(container, id, 'Could not load blood bank data. Make sure data.js is loaded.');
    }
  }

  function renderHero(bank) {
    const nameEl = document.getElementById('hero-bank-name');
    const locEl = document.getElementById('hero-bank-location');
    if (nameEl) nameEl.textContent = bank.name;
    if (locEl) locEl.textContent = bank.location;

    const breadcrumbName = document.getElementById('breadcrumb-name');
    if (breadcrumbName) breadcrumbName.textContent = bank.name;
  }

  function renderMainCard(bank) {
    const container = document.getElementById('bank-details-container');
    const phones = (bank.phone || []).map(p => `<a href="tel:${p}">${p}</a>`).join('');
    const componentClass = bank.bloodComponentAvailable ? 'component-yes' : 'component-no';
    const componentText = bank.bloodComponentAvailable ? '✓ Available' : '✗ Not Available';
    const categoryClass = getCategoryClass(bank.category);

    const bloodGroupsHtml = (bank.bloodGroups || [])
      .map(g => `<div class="blood-group-chip" title="Blood Group ${g}">${g}</div>`)
      .join('');

    const officerHtml = bank.nodalOfficer ? `
      <div class="officer-card">
        <div class="officer-avatar">👨‍⚕️</div>
        <div class="officer-info">
          <div class="officer-name">${bank.nodalOfficer.name}</div>
          <div class="officer-designation">${bank.nodalOfficer.designation}</div>
          <div class="officer-contact">
            <a href="tel:${bank.nodalOfficer.phone}"><i class="fas fa-phone"></i>${bank.nodalOfficer.phone}</a>
            <a href="mailto:${bank.nodalOfficer.email}"><i class="fas fa-envelope"></i>${bank.nodalOfficer.email}</a>
          </div>
        </div>
      </div>` : '<p style="color:var(--text-muted)">Not specified</p>';

    container.innerHTML = `
      <!-- Bank Hero Card -->
      <div class="bank-hero-card" data-animate>
        <div class="bank-hero-top">
          <div class="bank-name-section">
            <div class="bank-category-badge ${categoryClass}">
              <i class="fas fa-circle"></i> ${bank.category}
            </div>
            <h1 class="bank-name" id="hero-bank-name">${bank.name}</h1>
            <div class="bank-location">
              <i class="fas fa-map-marker-alt"></i>
              <span>${bank.location}</span>
            </div>
          </div>
          <div class="bank-rating-section">
            <div class="stars">${renderStars(bank.rating)}</div>
            <div class="rating-number">${bank.rating}</div>
            <div class="rating-count">${bank.reviews} reviews</div>
          </div>
        </div>
        <div class="bank-quick-stats">
          <div class="quick-stat">
            <div class="quick-stat-icon"><i class="fas fa-clock"></i></div>
            <div>
              <div class="quick-stat-label">Timings</div>
              <div class="quick-stat-value">${bank.timings}</div>
            </div>
          </div>
          <div class="quick-stat">
            <div class="quick-stat-icon"><i class="fas fa-certificate"></i></div>
            <div>
              <div class="quick-stat-label">License</div>
              <div class="quick-stat-value">${bank.license}</div>
            </div>
          </div>
          <div class="quick-stat">
            <div class="quick-stat-icon"><i class="fas fa-tint"></i></div>
            <div>
              <div class="quick-stat-label">Blood Components</div>
              <div class="quick-stat-value">
                <span class="component-badge ${componentClass}">${componentText}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Contact & Info Card -->
      <div class="card" data-animate>
        <div class="card-header">
          <div class="card-header-icon"><i class="fas fa-address-card"></i></div>
          <div>
            <h2>Contact Information</h2>
            <p>Primary contacts for this blood bank</p>
          </div>
        </div>
        <div class="info-grid">
          <div class="info-item full-width">
            <div class="info-label"><i class="fas fa-map-marker-alt"></i> Full Address</div>
            <div class="info-value">${bank.address}</div>
          </div>
          <div class="info-item">
            <div class="info-label"><i class="fas fa-phone-alt"></i> Phone Numbers</div>
            <div class="info-value phone">${phones}</div>
          </div>
          <div class="info-item">
            <div class="info-label"><i class="fas fa-envelope"></i> Email Address</div>
            <div class="info-value"><a href="mailto:${bank.email}" style="color:var(--primary-light)">${bank.email}</a></div>
          </div>
          <div class="info-item">
            <div class="info-label"><i class="fas fa-headset"></i> Helpline</div>
            <div class="info-value">${bank.helpline || '—'}</div>
          </div>
          <div class="info-item">
            <div class="info-label"><i class="fas fa-fax"></i> Fax</div>
            <div class="info-value">${bank.fax || '—'}</div>
          </div>
        </div>
      </div>

      <!-- Blood Groups Card -->
      <div class="card" data-animate>
        <div class="card-header">
          <div class="card-header-icon"><i class="fas fa-tint"></i></div>
          <div>
            <h2>Available Blood Groups</h2>
            <p>Hover a blood group to see it highlighted</p>
          </div>
        </div>
        <div class="blood-groups-grid">${bloodGroupsHtml}</div>
      </div>

      <!-- Nodal Officer Card -->
      <div class="card" data-animate>
        <div class="card-header">
          <div class="card-header-icon"><i class="fas fa-user-md"></i></div>
          <div>
            <h2>Nodal Officer</h2>
            <p>Point of contact for official matters</p>
          </div>
        </div>
        ${officerHtml}
      </div>
    `;
  }

  function renderSidebar(bank, others) {
    const sidebar = document.getElementById('sidebar-container');
    if (!sidebar) return;

    const nearbyHtml = others.slice(0, 4).map(b => `
      <a href="details_bank.html?id=${b.id}" class="nearby-item">
        <div class="nearby-item-icon"><i class="fas fa-hospital-alt"></i></div>
        <div class="nearby-item-info">
          <div class="nearby-item-name">${b.name}</div>
          <div class="nearby-item-loc">${b.location}</div>
        </div>
        <div class="nearby-item-badge">${b.rating}★</div>
      </a>`).join('');

    sidebar.innerHTML = `
      <!-- Action Buttons -->
      <div class="sidebar-card" data-animate>
        <div class="sidebar-card-header">
          <i class="fas fa-hand-holding-heart"></i>
          <h3>Take Action</h3>
        </div>
        <div class="sidebar-card-body">
          <div class="action-buttons">
            <a href="register.html" class="action-btn primary">
              <i class="fas fa-tint"></i>
              <span>Donate Blood Now</span>
            </a>
            <a href="register.html" class="action-btn secondary">
              <i class="fas fa-first-aid"></i>
              <span>Request Blood</span>
            </a>
            <a href="tel:${bank.phone[0]}" class="action-btn secondary">
              <i class="fas fa-phone-alt"></i>
              <span>Call Blood Bank</span>
            </a>
            <a href="mailto:${bank.email}" class="action-btn secondary">
              <i class="fas fa-envelope"></i>
              <span>Send Email</span>
            </a>
          </div>
        </div>
      </div>

      <!-- Map Card -->
      <div class="sidebar-card" data-animate>
        <div class="sidebar-card-header">
          <i class="fas fa-map-marked-alt"></i>
          <h3>Location</h3>
        </div>
        <div class="sidebar-card-body">
          <div class="map-placeholder" onclick="window.open('https://www.google.com/maps/search/${encodeURIComponent(bank.address)}','_blank')">
            <i class="fas fa-map-pin"></i>
            <p>View on Google Maps</p>
            <small>${bank.address.split(',').slice(0, 2).join(',')}</small>
          </div>
        </div>
      </div>

      <!-- Quick Links Card -->
      <div class="sidebar-card" data-animate>
        <div class="sidebar-card-header">
          <i class="fas fa-th"></i>
          <h3>Quick Links</h3>
        </div>
        <div class="sidebar-card-body">
          <div class="quick-links-grid">
            <a href="find_bloodbank.html" class="quick-link-item">
              <i class="fas fa-search-location"></i> Find Banks
            </a>
            <a href="find_hospital.html" class="quick-link-item">
              <i class="fas fa-hospital"></i> Hospitals
            </a>
            <a href="find_camp.html" class="quick-link-item">
              <i class="fas fa-campground"></i> Blood Camps
            </a>
            <a href="find_lab.html" class="quick-link-item">
              <i class="fas fa-flask"></i> Find Labs
            </a>
          </div>
        </div>
      </div>

      <!-- Nearby Banks -->
      <div class="sidebar-card" data-animate>
        <div class="sidebar-card-header">
          <i class="fas fa-hospital-alt"></i>
          <h3>Other Blood Banks</h3>
        </div>
        <div class="sidebar-card-body">
          <div class="nearby-list">${nearbyHtml}</div>
        </div>
      </div>
    `;
  }

  function renderError(container, id, message) {
    container.innerHTML = `
      <div class="error-state">
        <div class="error-icon">🩸</div>
        <h2>Blood Bank Not Found</h2>
        <p>${message || `We couldn't find a blood bank with ID: <strong>${id}</strong>`}</p>
        <a href="find_bloodbank.html" class="action-btn primary" style="display:inline-flex;width:auto;padding:14px 28px;">
          <i class="fas fa-search"></i> Find Blood Banks
        </a>
      </div>
    `;
  }

  /* ===================== SEARCH PAGE LOGIC ===================== */
  function loadBloodBankList() {
    const grid = document.getElementById('banks-grid');
    if (!grid) return;

    try {
      const json = window.BLOOD_BANK_DATA;
      if (!json) throw new Error('Data not loaded');
      renderBankCards(grid, json.bloodBanks);

      // Search & Filter
      const searchInput = document.getElementById('search-input');
      const categoryFilter = document.getElementById('category-filter');

      function filterBanks() {
        const query = (searchInput?.value || '').toLowerCase();
        const category = categoryFilter?.value || '';
        const filtered = json.bloodBanks.filter(b => {
          const matchSearch = !query ||
            b.name.toLowerCase().includes(query) ||
            b.location.toLowerCase().includes(query) ||
            (b.address || '').toLowerCase().includes(query);
          const matchCat = !category || b.category.toLowerCase() === category.toLowerCase();
          return matchSearch && matchCat;
        });
        renderBankCards(grid, filtered);
      }

      searchInput?.addEventListener('input', filterBanks);
      categoryFilter?.addEventListener('change', filterBanks);

    } catch (err) {
      grid.innerHTML = '<p style="color:var(--text-secondary);text-align:center;padding:40px">Failed to load blood banks. Make sure data.js is loaded.</p>';
    }
  }

  function renderBankCards(container, banks) {
    if (!banks.length) {
      container.innerHTML = `
        <div style="grid-column:1/-1;text-align:center;padding:60px 20px;color:var(--text-secondary)">
          <i class="fas fa-search" style="font-size:3rem;color:var(--primary);margin-bottom:16px;display:block"></i>
          <h3 style="color:var(--white);margin-bottom:8px">No Results Found</h3>
          <p>Try different keywords or filters</p>
        </div>`;
      return;
    }

    container.innerHTML = banks.map((bank, i) => `
      <a href="details_bank.html?id=${bank.id}" class="bank-search-card" style="animation-delay:${i*0.07}s">
        <div class="bsc-header">
          <div class="bsc-category ${getCategoryClass(bank.category)}">${bank.category}</div>
          <div class="bsc-rating">${renderStars(bank.rating)} <span>${bank.rating}</span></div>
        </div>
        <h3 class="bsc-name">${bank.name}</h3>
        <div class="bsc-location"><i class="fas fa-map-marker-alt"></i> ${bank.location}</div>
        <div class="bsc-address">${bank.address.substring(0, 80)}...</div>
        <div class="bsc-footer">
          <span class="bsc-reviews">${bank.reviews} reviews</span>
          <span class="bsc-component ${bank.bloodComponentAvailable ? 'yes' : 'no'}">
            ${bank.bloodComponentAvailable ? '✓ Components Available' : '✗ No Components'}
          </span>
        </div>
      </a>
    `).join('');
  }

  /* ===================== INIT ===================== */
  document.addEventListener('DOMContentLoaded', () => {
    loadBankDetails();
    loadBloodBankList();
  });

})();
