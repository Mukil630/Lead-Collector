import './style.css';
import { shopsData } from './data/shops.js';
import { searchPlacesLive, getPreloadedShopsForQuery, enrichPlaceData } from './services/placesService.js';
import { getSavedLeads, saveLead, removeLead, exportLeadsToCSV } from './services/leadExportService.js';
import { parseGoogleMapsText } from './services/googleParserService.js';
import { checkWhatsAppWithBaileys, dispatchOutreachQueueOneByOne, handleCustomerReplyAttractionAgent } from './services/baileysOutreachService.js';

let appState = {
  shops: getPreloadedShopsForQuery('karur shops'),
  currentQuery: 'karur shops',
  rightView: 'spreadsheet', // 'spreadsheet' | 'map' | 'pipeline' | 'flow'
  selectedCategory: 'All',
  minRating: 0,
  openOnly: false,
  waOnlyFilter: false,
  selectedShopId: null,
  isPanelOpen: false,
  isLoading: false,
  isCheckingWhatsApp: false,
  waVerifiedMap: new Map(), // shopId -> { exists: boolean, jid: string }
  mobilePane: 'list', // 'list' | 'spreadsheet' | 'map'
  mapCenter: [10.9601, 78.0766], // Karur
  selectedLeadIds: new Set(),
  simulatedStepIndex: -1,
  isSimulating: false
};

let map = null;
let mapMarkers = {};

document.addEventListener('DOMContentLoaded', () => {
  initApp();
  performGlobalSearch('karur shops');
});

function initApp() {
  const appElement = document.getElementById('app');
  appElement.innerHTML = `
    <!-- Header -->
    <header class="app-header">
      <div class="brand-section">
        <div class="brand-icon">⚡</div>
        <div class="brand-text">
          <h1>Lead Collector <span class="brand-badge" style="background: #dcfce7; color: #166534;">🟢 Free Live Web Scraper</span></h1>
          <p>Scrape & export business phone numbers, addresses, and contacts into live spreadsheets (No Cards / No Fees)</p>
        </div>
      </div>

      <div class="header-search-container">
        <span class="search-icon-inside">🔍</span>
        <input 
          type="text" 
          id="globalSearchInput" 
          class="header-search-input" 
          placeholder="Search any query anywhere (e.g. karur shops, trichy hotels, salem textiles)..."
          value="${appState.currentQuery}"
        />
        <button id="searchSubmitBtn" class="search-submit-btn">Scrape Leads</button>
        <button id="clearSearchBtn" class="clear-search-btn" style="display: none;">✕</button>
      </div>

      <div class="header-actions">
        <button id="importGoogleTextBtn" class="action-btn action-btn-secondary" title="Paste raw Google Search/Maps text to extract leads">
          📋 <span>Import Text</span>
        </button>

        <!-- Workspace Right Mode Switcher -->
        <div class="tab-switch-group">
          <button id="viewSpreadsheetBtn" class="tab-switch-btn active">📊 Live Spreadsheet</button>
          <button id="viewMapBtn" class="tab-switch-btn">🗺️ Map</button>
          <button id="viewPipelineBtn" class="tab-switch-btn">💼 CRM (<span id="savedLeadCount">0</span>)</button>
          <button id="viewFlowBtn" class="tab-switch-btn" style="background: #fef3c7; color: #92400e; font-weight: 700;">🧠 LangGraph Flow</button>
        </div>

        <button id="exportCsvBtn" class="action-btn action-btn-primary">
          📥 Export CSV
        </button>
      </div>
    </header>

    <!-- Mobile View Switcher Bar -->
    <div class="mobile-view-bar">
      <button id="showListPaneBtn" class="mobile-pane-btn active">📋 Shop Cards</button>
      <button id="showSpreadsheetPaneBtn" class="mobile-pane-btn">📊 Spreadsheet</button>
      <button id="showMapPaneBtn" class="mobile-pane-btn">🗺️ Map</button>
    </div>

    <!-- Main Layout -->
    <main class="app-main">
      <!-- Left Sidebar Panel -->
      <aside class="sidebar-panel" id="sidebarPanel">
        <div class="filter-section">
          <!-- Preset Location & Category Chips -->
          <div class="filter-pills-scroll">
            <button class="pill-btn active" data-preset="karur shops">🛍️ Karur Shops</button>
            <button class="pill-btn" data-preset="puliyur shops">🏬 Puliyur Shops</button>
            <button class="pill-btn" data-preset="trichy hotels">🏨 Trichy Hotels</button>
            <button class="pill-btn" data-preset="karur textiles">🧵 Karur Textiles</button>
            <button class="pill-btn" data-preset="erode textiles">👕 Erode Fabrics</button>
            <button class="pill-btn" data-preset="tirupur garments">🚚 Tirupur Factories</button>
          </div>

          <div class="sub-filters">
            <div id="waOnlyFilterChip" class="toggle-chip">
              💬 WhatsApp Active Only
            </div>
            <div id="ratingFilterChip" class="toggle-chip">
              ⭐ 4.5+ Rating
            </div>
            <div id="selectAllLeadsChip" class="toggle-chip">
              ☑️ Select All (<span id="selectedCountText">0</span>)
            </div>
          </div>
        </div>

        <div class="results-meta">
          <span id="resultsCount">Found <strong>${appState.shops.length}</strong> shop leads</span>
          <span id="locationBadge">📍 ${escapeHtml(appState.currentQuery)}</span>
        </div>

        <!-- Loading Indicator -->
        <div id="searchLoadingBar" class="search-loading" style="display: none;">
          <div class="spinner"></div> Running live web scraper for ${escapeHtml(appState.currentQuery)}...
        </div>

        <div id="shopsListContainer" class="shops-list-container">
          <!-- Dynamic Shop Cards inserted here -->
        </div>
      </aside>

      <!-- Right Main Workspace Canvas -->
      <section id="mainCanvasContainer" class="map-canvas-container">
        
        <!-- Mode 1: Live Spreadsheet View (DEFAULT) -->
        <div id="spreadsheetContainer" class="spreadsheet-container">
          <div class="spreadsheet-toolbar">
            <div class="sheet-title-info">
              <h2>📊 Live Leads Spreadsheet (<span id="sheetResultCount">${appState.shops.length}</span> Shops)</h2>
              <p>Scraped B2B contacts, phone numbers, and decision makers for <strong>${escapeHtml(appState.currentQuery)}</strong></p>
            </div>
            <div style="display: flex; gap: 0.5rem;">
              <button id="verifyWhatsAppBtn" class="action-btn action-btn-secondary" style="background: #dcfce7; color: #166534; font-weight: 700; border-color: #86efac;">
                📱 Verify WhatsApp Status
              </button>
              <button id="sheetExportBtn" class="action-btn action-btn-primary">📥 Download Excel / CSV</button>
            </div>
          </div>

          <div id="spreadsheetTableWrapper" class="spreadsheet-table-wrapper">
            <!-- Dynamic Spreadsheet Table injected here -->
          </div>
        </div>

        <!-- Mode 2: Live Map Container -->
        <div id="map" style="width: 100%; height: 100%; display: none;"></div>

        <!-- Mode 3: Pipeline CRM Table Container -->
        <div id="pipelineContainer" class="pipeline-container" style="display: none;">
          <div class="pipeline-header">
            <div>
              <h2>💼 Saved Lead Pipeline & Contact Database</h2>
              <p>Manage sales notes, contact status, and export qualified B2B leads to CSV</p>
            </div>
            <div style="display: flex; gap: 0.5rem;">
              <button id="exportPipelineCsvBtn" class="action-btn action-btn-primary">📥 Export Pipeline to CSV</button>
            </div>
          </div>

          <div id="pipelineTableWrapper" class="pipeline-table-wrapper">
            <!-- Dynamic CRM table injected here -->
          </div>
        </div>

        <!-- Mode 4: LangGraph Interactive Flow Canvas -->
        <div id="flowCanvasContainer" class="flow-canvas-container" style="display: none;">
          <div class="flow-toolbar">
            <div>
              <h2>🧠 LangGraph Autonomous AI Agent State Machine</h2>
              <p>Visual node graph execution, channel routing, and Human-in-the-Loop (HITL) approval engine</p>
            </div>
            <button id="runSimulationBtn" class="action-btn action-btn-primary" style="background: #2563eb;">
              ▶ Run Live AI Lead Simulation
            </button>
          </div>

          <div class="flow-interactive-wrapper">
            <div class="flow-nodes-grid" id="flowNodesGrid"></div>
            <div class="flow-state-inspector" id="flowStateInspector">
              <h3>🔍 LangGraph State Inspector</h3>
              <p style="font-size: 0.75rem; color: var(--color-text-muted); margin-bottom: 0.75rem;">
                Select any node or run simulation to view real-time state mutations.
              </p>
              <pre id="stateJsonDisplay" class="state-json-box">Select a node to inspect state...</pre>
            </div>
          </div>
        </div>

        <!-- Slide-over Detailed Inspection Panel -->
        <div id="detailSlidePanel" class="detail-slide-panel">
          <div class="detail-header-bar">
            <button id="closePanelBtn" class="close-panel-btn" title="Close Panel">✕</button>
          </div>
          <div id="detailPanelContent" style="display: flex; flex-direction: column; height: 100%;"></div>
        </div>
      </section>
    </main>

    <!-- Google Maps Text Import Modal -->
    <div id="googleImportModal" class="modal-overlay" style="display: none;">
      <div class="modal-card">
        <div class="modal-header">
          <h3>📋 Import & Scrape Google Search Text</h3>
          <button id="closeModalBtn" class="close-panel-btn">✕</button>
        </div>
        <p style="font-size: 0.82rem; color: var(--color-text-muted); margin-bottom: 0.75rem;">
          Paste any raw text copied directly from Google Search / Maps results below. The AI Lead Scraper will automatically extract business names, ratings, categories, phone numbers, and addresses into your live spreadsheet!
        </p>
        <textarea id="googleRawTextInput" class="form-textarea" rows="10" placeholder="Paste Google Search output text here (e.g. Minister White - Karur 3.8(4) 04324 261 333...)..."></textarea>
        <div style="display: flex; justify-content: flex-end; gap: 0.5rem; margin-top: 1rem;">
          <button id="cancelModalBtn" class="btn-card-action">Cancel</button>
          <button id="processImportBtn" class="action-btn action-btn-primary">⚡ Extract Leads & Build Spreadsheet</button>
        </div>
      </div>
    </div>

    <!-- Toast Notification -->
    <div id="toastMsg" class="toast-msg">Lead saved to pipeline!</div>
  `;

  initLeafletMap();
  setupEventListeners();
  renderShopsList();
  renderSpreadsheetView();
  renderFlowCanvas();
  updateSavedLeadCountBadge();
}

function updateSavedLeadCountBadge() {
  const saved = getSavedLeads();
  const badge = document.getElementById('savedLeadCount');
  if (badge) badge.textContent = saved.length;
}

function initLeafletMap() {
  if (typeof L === 'undefined') return;

  map = L.map('map', {
    zoomControl: false
  }).setView(appState.mapCenter, 13);

  L.control.zoom({ position: 'bottomright' }).addTo(map);

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; OpenStreetMap'
  }).addTo(map);

  updateMapMarkers();
}

function updateMapMarkers() {
  if (!map || appState.rightView !== 'map') return;

  Object.values(mapMarkers).forEach(marker => map.removeLayer(marker));
  mapMarkers = {};

  const filteredShops = getFilteredShops();

  if (filteredShops.length > 0) {
    const bounds = L.latLngBounds(filteredShops.map(s => [s.lat, s.lng]));
    if (bounds.isValid()) {
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 });
    }
  }

  filteredShops.forEach(shop => {
    const isSaved = getSavedLeads().some(l => l.id === shop.id);
    const iconHtml = `<div class="custom-map-pin ${shop.id === appState.selectedShopId ? 'active' : ''} ${isSaved ? 'saved' : ''}" data-shop-id="${shop.id}">💼</div>`;
    const customIcon = L.divIcon({
      html: iconHtml,
      className: '',
      iconSize: [34, 34],
      iconAnchor: [17, 17]
    });

    const marker = L.marker([shop.lat, shop.lng], { icon: customIcon }).addTo(map);

    marker.bindPopup(`
      <div class="popup-mini-card">
        <h4>${escapeHtml(shop.name)}</h4>
        <p>👤 Contact: ${escapeHtml(shop.ownerName || 'Manager')}</p>
        <p>📞 Phone: ${escapeHtml(shop.mobile || shop.phone)}</p>
        <button class="popup-mini-btn" onclick="window.selectShopById('${shop.id}')">Inspect Lead & Contact</button>
      </div>
    `);

    marker.on('click', () => {
      selectShop(shop.id);
    });

    mapMarkers[shop.id] = marker;
  });
}

function getFilteredShops() {
  return appState.shops.filter(shop => {
    if (appState.minRating > 0 && shop.rating < appState.minRating) return false;
    if (appState.openOnly && !shop.isOpen) return false;
    if (appState.waOnlyFilter) {
      const waInfo = appState.waVerifiedMap.get(shop.id);
      if (!waInfo || !waInfo.exists) return false;
    }
    return true;
  });
}

async function performGlobalSearch(queryStr) {
  if (!queryStr || queryStr.trim().length === 0) return;

  if (queryStr.includes('(') && queryStr.includes(')') && (queryStr.includes('Closed') || queryStr.includes('Opens') || queryStr.includes('In-store') || queryStr.includes('Delivery') || queryStr.includes('09') || queryStr.includes('04324'))) {
    const parsedFromInput = parseGoogleMapsText(queryStr, 'Karur, Tamil Nadu');
    if (parsedFromInput && parsedFromInput.length > 0) {
      appState.shops = parsedFromInput;
      appState.currentQuery = 'Pasted Google Search Output';
      const badge = document.getElementById('locationBadge');
      if (badge) badge.innerHTML = `📍 Imported Google Leads`;
      renderShopsList();
      renderSpreadsheetView();
      showToast(`Extracted ${parsedFromInput.length} shop leads from pasted Google text!`);
      return;
    }
  }

  appState.currentQuery = queryStr;
  appState.isLoading = true;

  const instantPreloaded = getPreloadedShopsForQuery(queryStr);
  if (instantPreloaded && instantPreloaded.length > 0) {
    appState.shops = instantPreloaded;
    renderShopsList();
    renderSpreadsheetView();
  }

  const loadingBar = document.getElementById('searchLoadingBar');
  if (loadingBar) {
    loadingBar.innerHTML = `<div class="spinner"></div> Running live web scraper for "${escapeHtml(queryStr)}"...`;
    loadingBar.style.display = 'flex';
  }

  const badge = document.getElementById('locationBadge');
  if (badge) badge.innerHTML = `📍 ${escapeHtml(queryStr)}`;

  try {
    const liveResults = await searchPlacesLive(queryStr);
    if (liveResults && liveResults.length > 0) {
      appState.shops = liveResults;
    }
  } catch (err) {
    console.error("Scraper search error:", err);
  } finally {
    appState.isLoading = false;
    if (loadingBar) loadingBar.style.display = 'none';
    renderShopsList();
    renderSpreadsheetView();
    // Auto-verify WhatsApp numbers for top shops
    verifyWhatsAppNumbersForShops();
  }
}

async function verifyWhatsAppNumbersForShops() {
  if (appState.isCheckingWhatsApp) return;
  appState.isCheckingWhatsApp = true;

  for (const shop of appState.shops) {
    const phone = shop.mobile || shop.phone;
    const res = await checkWhatsAppWithBaileys(phone);
    appState.waVerifiedMap.set(shop.id, res);
  }

  appState.isCheckingWhatsApp = false;
  renderShopsList();
  renderSpreadsheetView();
}

function renderShopsList() {
  const container = document.getElementById('shopsListContainer');
  const filteredShops = getFilteredShops();

  const resultsCountEl = document.getElementById('resultsCount');
  if (resultsCountEl) {
    resultsCountEl.innerHTML = `Found <strong>${filteredShops.length}</strong> shop leads`;
  }

  const savedLeads = getSavedLeads();

  if (filteredShops.length === 0) {
    container.innerHTML = `
      <div style="text-align: center; padding: 3rem 1rem; color: var(--color-text-muted);">
        <div style="font-size: 2.5rem; margin-bottom: 0.5rem;">🔍</div>
        <h3 style="font-family: var(--font-heading); color: var(--color-primary); margin-bottom: 0.25rem;">No shop leads found</h3>
        <p style="font-size: 0.85rem;">Try searching a location or click 'Import Text' above.</p>
      </div>
    `;
    return;
  }

  container.innerHTML = filteredShops.map(shop => {
    const isSelected = shop.id === appState.selectedShopId;
    const isChecked = appState.selectedLeadIds.has(shop.id);
    const isSaved = savedLeads.some(l => l.id === shop.id);
    const waInfo = appState.waVerifiedMap.get(shop.id);

    return `
      <div class="shop-card ${isSelected ? 'selected' : ''}" data-shop-id="${shop.id}">
        <div class="card-cover">
          <img src="${shop.image}" alt="${escapeHtml(shop.name)}" loading="lazy" onerror="this.onerror=null; this.src='/images/shiva.jpg';" />
          <span class="category-tag">${escapeHtml(shop.category)}</span>
          <span class="lead-score-badge ${shop.leadBadgeClass || 'badge-high'}">${escapeHtml(shop.leadScore || '⚡ High')}</span>
          <div class="lead-checkbox-overlay">
            <input type="checkbox" class="lead-select-checkbox" data-shop-id="${shop.id}" ${isChecked ? 'checked' : ''} onclick="event.stopPropagation(); window.toggleLeadSelect('${shop.id}')" />
          </div>
        </div>

        <div class="card-body">
          <div class="card-title-row">
            <h3>${escapeHtml(shop.name)}</h3>
            <span class="rating-badge">
              <span class="star-icon">★</span> ${shop.rating}
            </span>
          </div>

          <div class="contact-highlight-box">
            <div>👤 <strong>Contact:</strong> ${escapeHtml(shop.ownerName || 'Manager')}</div>
            <div>
              📞 <strong>Phone:</strong> ${escapeHtml(shop.mobile || shop.phone)}
              ${waInfo ? (waInfo.exists ? `<span class="wa-badge active" title="WhatsApp Active"> 🟢 WA Active</span>` : `<span class="wa-badge inactive" title="Landline / No WhatsApp"> 🔴 Landline</span>`) : ''}
            </div>
            <div>✉️ <strong>Email:</strong> ${escapeHtml(shop.email)}</div>
          </div>

          <div class="card-address">
            📍 ${escapeHtml(shop.address)}
          </div>

          <div class="card-actions-footer">
            <button class="btn-card-action primary inspect-btn" data-shop-id="${shop.id}">
              🔍 Inspect Lead
            </button>
            <button class="btn-card-action ${isSaved ? 'saved-btn' : 'save-lead-btn'}" onclick="event.stopPropagation(); window.toggleSaveLead('${shop.id}')">
              ${isSaved ? '✓ Lead Saved' : '➕ Save Lead'}
            </button>
          </div>
        </div>
      </div>
    `;
  }).join('');

  container.querySelectorAll('.shop-card').forEach(card => {
    card.addEventListener('click', () => {
      const shopId = card.getAttribute('data-shop-id');
      selectShop(shopId);
    });
  });

  updateMapMarkers();
}

function renderSpreadsheetView() {
  const container = document.getElementById('spreadsheetTableWrapper');
  const filteredShops = getFilteredShops();

  const countBadge = document.getElementById('sheetResultCount');
  if (countBadge) countBadge.textContent = filteredShops.length;

  const savedLeads = getSavedLeads();

  if (filteredShops.length === 0) {
    container.innerHTML = `
      <div style="text-align: center; padding: 4rem 1rem; color: var(--color-text-muted);">
        <div style="font-size: 3rem; margin-bottom: 0.5rem;">📊</div>
        <h3>No shop data available</h3>
        <p style="font-size: 0.85rem;">Perform a search above or click 'Import Text' to extract shop leads.</p>
      </div>
    `;
    return;
  }

  container.innerHTML = `
    <table class="spreadsheet-table">
      <thead>
        <tr>
          <th style="width: 40px; text-align: center;">#</th>
          <th>Business Name</th>
          <th>Category</th>
          <th>Contact Person</th>
          <th>Direct Phone / Mobile</th>
          <th>WhatsApp Status</th>
          <th>Official Email</th>
          <th>Address</th>
          <th>Rating</th>
          <th>Lead Quality</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        ${filteredShops.map((shop, idx) => {
          const isSaved = savedLeads.some(l => l.id === shop.id);
          const isSelected = shop.id === appState.selectedShopId;
          const waInfo = appState.waVerifiedMap.get(shop.id);

          return `
            <tr class="${isSelected ? 'active-row' : ''}" data-shop-id="${shop.id}">
              <td style="text-align: center; font-weight: 600; color: var(--color-text-muted);">${idx + 1}</td>
              <td>
                <strong style="color: var(--color-primary);">${escapeHtml(shop.name)}</strong>
                ${shop.verified ? `<span class="ver-icon" title="Verified business"> ✓</span>` : ''}
              </td>
              <td><span class="spec-tag">${escapeHtml(shop.category)}</span></td>
              <td><strong>${escapeHtml(shop.ownerName || 'Managing Director')}</strong></td>
              <td>
                <a href="tel:${(shop.mobile || shop.phone).replace(/\s+/g, '')}" class="table-tel-link">
                  📞 ${escapeHtml(shop.mobile || shop.phone)}
                </a>
              </td>
              <td>
                ${waInfo ? (waInfo.exists 
                  ? `<a href="https://wa.me/${shop.whatsapp}" target="_blank" class="table-wa-btn">💬 🟢 WA Active</a>`
                  : `<span class="wa-badge inactive">🔴 Landline / No WA</span>`
                ) : `<span style="font-size: 0.72rem; color: #94a3b8;">⏳ Checking...</span>`}
              </td>
              <td><a href="mailto:${shop.email}" style="color: var(--color-text-muted); font-size: 0.8rem;">${escapeHtml(shop.email)}</a></td>
              <td style="max-width: 220px; font-size: 0.78rem; color: var(--color-text-muted);" title="${escapeHtml(shop.address)}">
                📍 ${escapeHtml(shop.address)}
              </td>
              <td><span class="rating-badge">★ ${shop.rating}</span></td>
              <td><span class="lead-score-badge ${shop.leadBadgeClass || 'badge-high'}">${escapeHtml(shop.leadScore || '⚡ High')}</span></td>
              <td>
                <div style="display: flex; gap: 0.3rem;">
                  <button class="btn-card-action primary" style="padding: 0.25rem 0.5rem; font-size: 0.75rem;" onclick="window.selectShopById('${shop.id}')">Inspect</button>
                  <button class="btn-card-action ${isSaved ? 'saved-btn' : 'save-lead-btn'}" style="padding: 0.25rem 0.5rem; font-size: 0.75rem;" onclick="window.toggleSaveLead('${shop.id}')">
                    ${isSaved ? '✓ Saved' : '➕ Save'}
                  </button>
                </div>
              </td>
            </tr>
          `;
        }).join('')}
      </tbody>
    </table>
  `;

  container.querySelectorAll('tbody tr').forEach(row => {
    row.addEventListener('click', (e) => {
      if (e.target.tagName === 'BUTTON' || e.target.tagName === 'A' || e.target.tagName === 'INPUT') return;
      const shopId = row.getAttribute('data-shop-id');
      selectShop(shopId);
    });
  });
}

/**
 * LANGGRAPH INTERACTIVE VISUAL CANVAS
 */
const LANGGRAPH_NODES = [
  { id: 'n1', label: '1. Normalize Lead', type: 'node', desc: 'Trim phone formatting, clean business name & city', stateKey: 'normalized_lead' },
  { id: 'n2', label: '2. Validate WhatsApp Status', type: 'node', desc: 'Run Baileys onWhatsApp socket lookup (0 messages sent)', stateKey: 'wa_verified' },
  { id: 'n3', label: '3. AI Lead Scorer', type: 'node', desc: 'Calculate 0-100 B2B commercial potential score', stateKey: 'score_num' },
  { id: 'n4', label: '4. Select Channel', type: 'node', desc: 'Route to WhatsApp, Email, or Cold Call script', stateKey: 'selected_channel' },
  { id: 'n5', label: '5. Prepare Pitch', type: 'agent', desc: 'LLM generates personalized pitch message', stateKey: 'ai_pitch' },
  { id: 'n6', label: '6. Human Approval (HITL)', type: 'hitl', desc: 'Mukil approves, edits, or skips message before send', stateKey: 'approval_status' },
  { id: 'n7', label: '7. Send Outreach Queue', type: 'node', desc: 'Safe 1-by-1 queue dispatch with 1-2 min delays', stateKey: 'outreach_sent' },
  { id: 'n8', label: '8. AI Attraction Chatbot', type: 'agent', desc: 'Humanized 15-20s typing delay attraction bot', stateKey: 'reply_intent' },
  { id: 'n9', label: '9. Lead AI Project Extractor', type: 'agent', desc: 'Extracts Project Scope, Budget & saves to CRM', stateKey: 'crm_stage' }
];

function renderFlowCanvas() {
  const container = document.getElementById('flowNodesGrid');
  if (!container) return;

  container.innerHTML = LANGGRAPH_NODES.map((node, idx) => {
    const isActive = appState.simulatedStepIndex === idx;
    const isPast = appState.simulatedStepIndex > idx;

    let badgeClass = 'flow-badge-node';
    if (node.type === 'agent') badgeClass = 'flow-badge-agent';
    if (node.type === 'hitl') badgeClass = 'flow-badge-hitl';

    return `
      <div class="flow-node-card ${isActive ? 'active-step' : ''} ${isPast ? 'completed-step' : ''}" data-node-id="${node.id}" data-node-idx="${idx}">
        <div class="flow-node-header">
          <span class="flow-node-title">${escapeHtml(node.label)}</span>
          <span class="${badgeClass}">${node.type.toUpperCase()}</span>
        </div>
        <div class="flow-node-desc">${escapeHtml(node.desc)}</div>
        <div class="flow-status-dot ${isActive ? 'dot-active' : (isPast ? 'dot-complete' : 'dot-idle')}"></div>
      </div>
      ${idx < LANGGRAPH_NODES.length - 1 ? `<div class="flow-connector ${isPast ? 'connector-active' : ''}">➔</div>` : ''}
    `;
  }).join('');

  container.querySelectorAll('.flow-node-card').forEach(card => {
    card.addEventListener('click', () => {
      const idx = parseInt(card.getAttribute('data-node-idx'), 10);
      inspectNodeState(idx);
    });
  });
}

function inspectNodeState(idx) {
  const node = LANGGRAPH_NODES[idx];
  if (!node) return;

  const currentLead = appState.shops[0] || { name: 'Minister White - Karur', category: "Men's Clothes Shop", phone: '+91 9432426133' };
  const waInfo = appState.waVerifiedMap.get(currentLead.id) || { exists: true, jid: '919432426133@s.whatsapp.net' };

  const mockState = {
    current_node: node.id,
    node_name: node.label,
    node_type: node.type,
    lead_id: currentLead.id || 'karur-lead-01',
    business_name: currentLead.name,
    category: currentLead.category,
    phone: currentLead.mobile || currentLead.phone,
    whatsapp_exists: waInfo.exists,
    whatsapp_jid: waInfo.jid,
    email: currentLead.email,
    rating: currentLead.rating,
    score_num: currentLead.leadScoreNum || 88,
    lead_priority: 'HIGH_POTENTIAL',
    selected_channel: waInfo.exists ? 'WHATSAPP' : 'EMAIL',
    ai_generated_pitch: `Hi ${currentLead.ownerName ? currentLead.ownerName.split(' ')[0] : 'Sir'}! 👋 We build simple websites, mobile apps & lead systems for ${currentLead.category} stores in ${currentLead.address.split(',')[0]}. Are you planning any new project for ${currentLead.name}?`,
    human_approval_status: idx >= 5 ? 'APPROVED' : 'PENDING_APPROVAL',
    dispatch_delay: '1 to 2 minutes between members',
    chatbot_typing_delay: '15 to 20 seconds',
    reply_intent: idx >= 7 ? 'INTERESTED' : 'AWAITING_REPLY',
    extracted_project_dossier: idx >= 8 ? {
      projectId: 'proj-4921',
      clientName: currentLead.name,
      projectType: 'Business Website & Mobile App',
      projectSummary: `Custom Website & App for ${currentLead.name}`,
      status: 'Qualified Project Idea'
    } : null,
    crm_stage: idx >= 8 ? 'Hot Prospect' : 'New Lead'
  };

  const jsonDisplay = document.getElementById('stateJsonDisplay');
  if (jsonDisplay) {
    jsonDisplay.textContent = JSON.stringify(mockState, null, 2);
  }
}

function startFlowSimulation() {
  if (appState.isSimulating) return;
  appState.isSimulating = true;
  appState.simulatedStepIndex = 0;

  const runBtn = document.getElementById('runSimulationBtn');
  if (runBtn) {
    runBtn.disabled = true;
    runBtn.textContent = '⏳ Simulating LangGraph Execution...';
  }

  renderFlowCanvas();
  inspectNodeState(0);

  const interval = setInterval(() => {
    appState.simulatedStepIndex++;
    if (appState.simulatedStepIndex >= LANGGRAPH_NODES.length) {
      clearInterval(interval);
      appState.isSimulating = false;
      if (runBtn) {
        runBtn.disabled = false;
        runBtn.textContent = '▶ Run Live AI Lead Simulation';
      }
      showToast('🎉 LangGraph State Machine Execution Completed Successfully!');
      return;
    }

    renderFlowCanvas();
    inspectNodeState(appState.simulatedStepIndex);
  }, 1000);
}

window.toggleLeadSelect = function(shopId) {
  if (appState.selectedLeadIds.has(shopId)) {
    appState.selectedLeadIds.delete(shopId);
  } else {
    appState.selectedLeadIds.add(shopId);
  }

  const countText = document.getElementById('selectedCountText');
  if (countText) countText.textContent = appState.selectedLeadIds.size;
};

window.toggleSaveLead = function(shopId) {
  const shop = appState.shops.find(s => s.id === shopId) || getSavedLeads().find(s => s.id === shopId);
  if (!shop) return;

  const saved = getSavedLeads();
  const existing = saved.find(l => l.id === shopId);

  if (existing) {
    removeLead(shopId);
    showToast(`Removed ${shop.name} from leads pipeline.`);
  } else {
    saveLead(shop, 'New Lead', 'Collected via Live Scraper');
    showToast(`Saved ${shop.name} to B2B Lead Pipeline!`);
  }

  updateSavedLeadCountBadge();
  renderShopsList();
  renderSpreadsheetView();
  if (appState.rightView === 'pipeline') renderPipelineView();
};

function selectShop(shopId) {
  const shop = appState.shops.find(s => s.id === shopId) || getSavedLeads().find(s => s.id === shopId);
  if (!shop) return;

  appState.selectedShopId = shopId;
  appState.isPanelOpen = true;

  renderShopsList();
  renderSpreadsheetView();
  renderDetailPanel(shop);

  const panel = document.getElementById('detailSlidePanel');
  panel.classList.add('open');

  if (map && shop.lat && shop.lng && appState.rightView === 'map') {
    map.flyTo([shop.lat, shop.lng], 16, { duration: 1.2 });
    if (mapMarkers[shopId]) mapMarkers[shopId].openPopup();
  }
}

window.selectShopById = selectShop;

function renderDetailPanel(shop) {
  const container = document.getElementById('detailPanelContent');
  const isSaved = getSavedLeads().some(l => l.id === shop.id);
  const savedItem = getSavedLeads().find(l => l.id === shop.id);
  const waInfo = appState.waVerifiedMap.get(shop.id);

  container.innerHTML = `
    <div class="detail-hero-cover">
      <img src="${shop.image}" alt="${escapeHtml(shop.name)}" onerror="this.onerror=null; this.src='/images/shiva.jpg';" />
      <div class="detail-hero-overlay">
        <span class="detail-category-badge">${escapeHtml(shop.category)}</span>
        <h2>${escapeHtml(shop.name)}</h2>
        <div style="display: flex; align-items: center; gap: 0.5rem; margin-top: 0.25rem; font-size: 0.85rem;">
          <span style="color: #f59e0b; font-weight: 700;">★ ${shop.rating}</span>
          <span>(${shop.reviewsCount} reviews)</span>
          <span>•</span>
          <span class="lead-score-badge ${shop.leadBadgeClass || 'badge-high'}">${escapeHtml(shop.leadScore || '⚡ High Potential')}</span>
        </div>
      </div>
    </div>

    <div class="detail-content-scroll">
      <div class="quick-action-bar">
        <a href="tel:${(shop.mobile || shop.phone).replace(/\s+/g, '')}" class="quick-action-btn">
          <span class="icon">📞</span>
          <span>Call ${escapeHtml(shop.ownerName ? shop.ownerName.split(' ')[0] : 'Owner')}</span>
        </a>
        <a href="https://wa.me/${shop.whatsapp}?text=Hello%20${encodeURIComponent(shop.ownerName || shop.name)},%20reaching%20out%20regarding%20${encodeURIComponent(shop.category)}%20collaboration." target="_blank" class="quick-action-btn">
          <span class="icon">💬</span>
          <span>WhatsApp Pitch</span>
        </a>
        <a href="mailto:${shop.email}?subject=Business%20Inquiry%20for%20${encodeURIComponent(shop.name)}" class="quick-action-btn">
          <span class="icon">✉️</span>
          <span>Send Email</span>
        </a>
        <button onclick="window.toggleSaveLead('${shop.id}')" class="quick-action-btn ${isSaved ? 'active' : ''}">
          <span class="icon">${isSaved ? '✓' : '💾'}</span>
          <span>${isSaved ? 'Lead Saved' : 'Save to CRM'}</span>
        </button>
      </div>

      <div class="detail-section-box" style="border-left: 4px solid var(--color-primary);">
        <h4>📇 Decision Maker Contact Dossier</h4>
        <div class="info-grid">
          <div class="info-item">
            <span class="icon">👤</span>
            <div><strong>Key Contact Person:</strong> ${escapeHtml(shop.ownerName || 'Managing Director')}</div>
          </div>
          <div class="info-item">
            <span class="icon">📱</span>
            <div>
              <strong>Direct Mobile / WhatsApp:</strong> <a href="tel:${shop.mobile}">${escapeHtml(shop.mobile || shop.phone)}</a>
              ${waInfo ? (waInfo.exists ? `<span class="wa-badge active"> 🟢 WA Active</span>` : `<span class="wa-badge inactive"> 🔴 Landline</span>`) : ''}
            </div>
          </div>
          <div class="info-item">
            <span class="icon">☎️</span>
            <div><strong>Office Phone:</strong> ${escapeHtml(shop.phone)}</div>
          </div>
          <div class="info-item">
            <span class="icon">✉️</span>
            <div><strong>Official Email:</strong> <a href="mailto:${shop.email}">${escapeHtml(shop.email)}</a></div>
          </div>
          <div class="info-item">
            <span class="icon">🏢</span>
            <div><strong>Full Address:</strong> ${escapeHtml(shop.address)}</div>
          </div>
        </div>
      </div>

      <div class="detail-section-box">
        <h4>💼 Sales Pipeline Status & Notes</h4>
        <div class="form-group">
          <label>Pipeline Stage</label>
          <select id="leadStageSelect" class="form-input">
            <option value="New Lead" ${savedItem && savedItem.leadStatus === 'New Lead' ? 'selected' : ''}>🆕 New Prospect</option>
            <option value="Contacted" ${savedItem && savedItem.leadStatus === 'Contacted' ? 'selected' : ''}>📞 Contacted / Pitch Sent</option>
            <option value="Follow Up Required" ${savedItem && savedItem.leadStatus === 'Follow Up Required' ? 'selected' : ''}>⏰ Follow Up Needed</option>
            <option value="Hot Prospect" ${savedItem && savedItem.leadStatus === 'Hot Prospect' ? 'selected' : ''}>🔥 Hot Prospect</option>
            <option value="Deal Closed" ${savedItem && savedItem.leadStatus === 'Deal Closed' ? 'selected' : ''}>✅ Deal Closed / Converted</option>
          </select>
        </div>
        <div class="form-group" style="margin-top: 0.6rem;">
          <label>Sales Notes (Call summary, pricing, requirements)</label>
          <textarea id="leadNotesInput" class="form-textarea" rows="3" placeholder="Enter notes from call or meeting...">${savedItem ? escapeHtml(savedItem.salesNotes) : ''}</textarea>
        </div>
        <button id="updateLeadNotesBtn" class="form-submit-btn" style="margin-top: 0.5rem;">
          💾 Save Notes & Update CRM
        </button>
      </div>

      <div class="detail-section-box">
        <h4>ℹ️ Company Overview</h4>
        <p style="font-size: 0.86rem; color: var(--color-text-main); line-height: 1.6;">
          ${escapeHtml(shop.description)}
        </p>
      </div>
    </div>
  `;

  const saveNotesBtn = document.getElementById('updateLeadNotesBtn');
  if (saveNotesBtn) {
    saveNotesBtn.addEventListener('click', () => {
      const stage = document.getElementById('leadStageSelect').value;
      const notes = document.getElementById('leadNotesInput').value;
      saveLead(shop, stage, notes);
      updateSavedLeadCountBadge();
      showToast(`Updated CRM notes for ${shop.name}!`);
      renderShopsList();
      renderSpreadsheetView();
      if (appState.rightView === 'pipeline') renderPipelineView();
    });
  }
}

function renderPipelineView() {
  const container = document.getElementById('pipelineTableWrapper');
  const savedLeads = getSavedLeads();

  if (savedLeads.length === 0) {
    container.innerHTML = `
      <div style="text-align: center; padding: 4rem 1rem; color: var(--color-text-muted);">
        <div style="font-size: 3rem; margin-bottom: 0.5rem;">📂</div>
        <h3 style="font-family: var(--font-heading); color: var(--color-primary); margin-bottom: 0.25rem;">No saved leads in CRM pipeline</h3>
        <p style="font-size: 0.9rem;">Search businesses in the Live Search tab and click 'Save Lead' to build your target client database.</p>
      </div>
    `;
    return;
  }

  container.innerHTML = `
    <table class="crm-table">
      <thead>
        <tr>
          <th>Business Name</th>
          <th>Category</th>
          <th>Contact Person</th>
          <th>Mobile / WhatsApp</th>
          <th>WhatsApp Verification</th>
          <th>Official Email</th>
          <th>Pipeline Status</th>
          <th>Sales Notes</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        ${savedLeads.map(lead => {
          const waInfo = appState.waVerifiedMap.get(lead.id);

          return `
            <tr data-shop-id="${lead.id}">
              <td>
                <strong style="color: var(--color-primary);">${escapeHtml(lead.name)}</strong>
                <div style="font-size: 0.75rem; color: var(--color-text-muted);">${escapeHtml(lead.address.split(',')[0])}</div>
              </td>
              <td><span class="spec-tag">${escapeHtml(lead.category)}</span></td>
              <td><strong>${escapeHtml(lead.ownerName || 'Contact')}</strong></td>
              <td>
                <a href="https://wa.me/${lead.whatsapp}" target="_blank" style="color: #059669; font-weight: 600; text-decoration: none;">
                  💬 ${escapeHtml(lead.mobile || lead.phone)}
                </a>
              </td>
              <td>
                ${waInfo ? (waInfo.exists ? `<span class="wa-badge active">🟢 Active WhatsApp</span>` : `<span class="wa-badge inactive">🔴 Landline</span>`) : `<span style="font-size: 0.72rem; color: #94a3b8;">⏳ Checking...</span>`}
              </td>
              <td><a href="mailto:${lead.email}">${escapeHtml(lead.email)}</a></td>
              <td>
                <span class="status-pill stage-${(lead.leadStatus || 'New').toLowerCase().replace(/\s+/g, '-')}">
                  ${escapeHtml(lead.leadStatus || 'New Lead')}
                </span>
              </td>
              <td style="font-size: 0.8rem; color: var(--color-text-muted); max-width: 200px;">
                ${escapeHtml(lead.salesNotes || 'No notes added')}
              </td>
              <td>
                <div style="display: flex; gap: 0.35rem;">
                  <button class="btn-card-action primary" onclick="window.selectShopById('${lead.id}')">Inspect</button>
                  <button class="btn-card-action" onclick="window.toggleSaveLead('${lead.id}')">Delete</button>
                </div>
              </td>
            </tr>
          `;
        }).join('')}
      </tbody>
    </table>
  `;
}

function setupEventListeners() {
  const searchInput = document.getElementById('globalSearchInput');
  const searchBtn = document.getElementById('searchSubmitBtn');
  const clearBtn = document.getElementById('clearSearchBtn');

  const handleSearchTrigger = () => {
    const val = searchInput ? searchInput.value : '';
    performGlobalSearch(val);
  };

  if (searchBtn) searchBtn.addEventListener('click', handleSearchTrigger);

  if (searchInput) {
    searchInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') handleSearchTrigger();
    });
    searchInput.addEventListener('input', (e) => {
      if (clearBtn) clearBtn.style.display = e.target.value ? 'flex' : 'none';
    });
  }

  if (clearBtn) {
    clearBtn.addEventListener('click', () => {
      if (searchInput) searchInput.value = '';
      clearBtn.style.display = 'none';
    });
  }

  // Verify WhatsApp Button
  const verifyWABtn = document.getElementById('verifyWhatsAppBtn');
  if (verifyWABtn) {
    verifyWABtn.addEventListener('click', async () => {
      showToast('Running Baileys WhatsApp check on all shop leads...');
      await verifyWhatsAppNumbersForShops();
      showToast('WhatsApp Status Check Completed!');
    });
  }

  // WhatsApp Active Only Filter Chip
  const waChip = document.getElementById('waOnlyFilterChip');
  if (waChip) {
    waChip.addEventListener('click', () => {
      appState.waOnlyFilter = !appState.waOnlyFilter;
      waChip.classList.toggle('active', appState.waOnlyFilter);
      renderShopsList();
      renderSpreadsheetView();
    });
  }

  // Google Text Import Modal Handlers
  const importGoogleBtn = document.getElementById('importGoogleTextBtn');
  const googleModal = document.getElementById('googleImportModal');
  const closeModalBtn = document.getElementById('closeModalBtn');
  const cancelModalBtn = document.getElementById('cancelModalBtn');
  const processImportBtn = document.getElementById('processImportBtn');
  const googleRawTextInput = document.getElementById('googleRawTextInput');

  if (importGoogleBtn && googleModal) {
    importGoogleBtn.addEventListener('click', () => {
      googleModal.style.display = 'flex';
    });
  }

  const hideModal = () => {
    if (googleModal) googleModal.style.display = 'none';
  };

  if (closeModalBtn) closeModalBtn.addEventListener('click', hideModal);
  if (cancelModalBtn) cancelModalBtn.addEventListener('click', hideModal);

  if (processImportBtn && googleRawTextInput) {
    processImportBtn.addEventListener('click', () => {
      const rawText = googleRawTextInput.value;
      if (!rawText || rawText.trim().length === 0) {
        showToast('Please paste Google Search output text first.');
        return;
      }

      const extracted = parseGoogleMapsText(rawText, 'Karur, Tamil Nadu');
      if (extracted && extracted.length > 0) {
        appState.shops = extracted;
        appState.currentQuery = 'Pasted Google Search Output';
        const badge = document.getElementById('locationBadge');
        if (badge) badge.innerHTML = `📍 Imported Google Leads`;
        renderShopsList();
        renderSpreadsheetView();
        hideModal();
        googleRawTextInput.value = '';
        showToast(`Successfully extracted ${extracted.length} B2B shop leads from Google Search!`);
        verifyWhatsAppNumbersForShops();
      } else {
        showToast('No structured shop phone numbers found in text.');
      }
    });
  }

  // Right Mode Switcher
  const viewSheetBtn = document.getElementById('viewSpreadsheetBtn');
  const viewMapBtn = document.getElementById('viewMapBtn');
  const viewPipelineBtn = document.getElementById('viewPipelineBtn');
  const viewFlowBtn = document.getElementById('viewFlowBtn');

  const spreadsheetContainer = document.getElementById('spreadsheetContainer');
  const mapElement = document.getElementById('map');
  const pipelineContainer = document.getElementById('pipelineContainer');
  const flowCanvasContainer = document.getElementById('flowCanvasContainer');

  if (viewSheetBtn && viewMapBtn && viewPipelineBtn && viewFlowBtn) {
    viewSheetBtn.addEventListener('click', () => {
      appState.rightView = 'spreadsheet';
      viewSheetBtn.classList.add('active');
      viewMapBtn.classList.remove('active');
      viewPipelineBtn.classList.remove('active');
      viewFlowBtn.classList.remove('active');
      spreadsheetContainer.style.display = 'flex';
      mapElement.style.display = 'none';
      pipelineContainer.style.display = 'none';
      flowCanvasContainer.style.display = 'none';
      renderSpreadsheetView();
    });

    viewMapBtn.addEventListener('click', () => {
      appState.rightView = 'map';
      viewMapBtn.classList.add('active');
      viewSheetBtn.classList.remove('active');
      viewPipelineBtn.classList.remove('active');
      viewFlowBtn.classList.remove('active');
      mapElement.style.display = 'block';
      spreadsheetContainer.style.display = 'none';
      pipelineContainer.style.display = 'none';
      flowCanvasContainer.style.display = 'none';
      if (map) {
        setTimeout(() => map.invalidateSize(), 100);
        updateMapMarkers();
      }
    });

    viewPipelineBtn.addEventListener('click', () => {
      appState.rightView = 'pipeline';
      viewPipelineBtn.classList.add('active');
      viewSheetBtn.classList.remove('active');
      viewMapBtn.classList.remove('active');
      viewFlowBtn.classList.remove('active');
      pipelineContainer.style.display = 'block';
      spreadsheetContainer.style.display = 'none';
      mapElement.style.display = 'none';
      flowCanvasContainer.style.display = 'none';
      renderPipelineView();
    });

    viewFlowBtn.addEventListener('click', () => {
      appState.rightView = 'flow';
      viewFlowBtn.classList.add('active');
      viewSheetBtn.classList.remove('active');
      viewMapBtn.classList.remove('active');
      viewPipelineBtn.classList.remove('active');
      flowCanvasContainer.style.display = 'flex';
      spreadsheetContainer.style.display = 'none';
      mapElement.style.display = 'none';
      pipelineContainer.style.display = 'none';
      renderFlowCanvas();
    });
  }

  // Simulation Button Listener
  const runSimBtn = document.getElementById('runSimulationBtn');
  if (runSimBtn) {
    runSimBtn.addEventListener('click', startFlowSimulation);
  }

  // Mobile View Switching
  const showListBtn = document.getElementById('showListPaneBtn');
  const showSheetPaneBtn = document.getElementById('showSpreadsheetPaneBtn');
  const showMapPaneBtn = document.getElementById('showMapPaneBtn');
  const sidebarPanel = document.getElementById('sidebarPanel');

  if (showListBtn && showSheetPaneBtn && showMapPaneBtn) {
    showListBtn.addEventListener('click', () => {
      appState.mobilePane = 'list';
      showListBtn.classList.add('active');
      showSheetPaneBtn.classList.remove('active');
      showMapPaneBtn.classList.remove('active');
      if (sidebarPanel) sidebarPanel.style.display = 'flex';
    });

    showSheetPaneBtn.addEventListener('click', () => {
      appState.mobilePane = 'spreadsheet';
      showSheetPaneBtn.classList.add('active');
      showListBtn.classList.remove('active');
      showMapPaneBtn.classList.remove('active');
      if (viewSheetBtn) viewSheetBtn.click();
    });

    showMapPaneBtn.addEventListener('click', () => {
      appState.mobilePane = 'map';
      showMapPaneBtn.classList.add('active');
      showListBtn.classList.remove('active');
      showSheetPaneBtn.classList.remove('active');
      if (viewMapBtn) viewMapBtn.click();
    });
  }

  // Export CSV Buttons
  const exportBtn = document.getElementById('exportCsvBtn');
  const sheetExportBtn = document.getElementById('sheetExportBtn');

  const triggerExport = () => {
    let leadsToExport = [];
    if (appState.selectedLeadIds.size > 0) {
      leadsToExport = appState.shops.filter(s => appState.selectedLeadIds.has(s.id));
    } else {
      leadsToExport = getFilteredShops();
    }

    if (leadsToExport.length === 0) {
      showToast('No shop leads to export.');
      return;
    }

    exportLeadsToCSV(leadsToExport, `Shops_Lead_Data_${appState.currentQuery.replace(/\s+/g, '_')}.csv`);
    showToast(`Exported ${leadsToExport.length} shop leads to CSV!`);
  };

  if (exportBtn) exportBtn.addEventListener('click', triggerExport);
  if (sheetExportBtn) sheetExportBtn.addEventListener('click', triggerExport);

  const exportPipelineBtn = document.getElementById('exportPipelineCsvBtn');
  if (exportPipelineBtn) {
    exportPipelineBtn.addEventListener('click', () => {
      const saved = getSavedLeads();
      if (saved.length === 0) {
        showToast('No saved pipeline leads to export.');
        return;
      }
      exportLeadsToCSV(saved, `Saved_B2B_Pipeline_Leads.csv`);
      showToast(`Exported ${saved.length} pipeline leads to CSV!`);
    });
  }

  // Preset location chips
  document.querySelectorAll('.pill-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.pill-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const presetQuery = btn.getAttribute('data-preset');
      if (searchInput) searchInput.value = presetQuery;
      performGlobalSearch(presetQuery);
    });
  });

  // Select all leads chip
  const selectAllChip = document.getElementById('selectAllLeadsChip');
  if (selectAllChip) {
    selectAllChip.addEventListener('click', () => {
      const filtered = getFilteredShops();
      if (appState.selectedLeadIds.size === filtered.length) {
        appState.selectedLeadIds.clear();
      } else {
        filtered.forEach(s => appState.selectedLeadIds.add(s.id));
      }
      const countText = document.getElementById('selectedCountText');
      if (countText) countText.textContent = appState.selectedLeadIds.size;
      renderShopsList();
    });
  }

  // Close panel button
  const closePanelBtn = document.getElementById('closePanelBtn');
  if (closePanelBtn) {
    closePanelBtn.addEventListener('click', () => {
      const panel = document.getElementById('detailSlidePanel');
      panel.classList.remove('open');
      appState.isPanelOpen = false;
      appState.selectedShopId = null;
      renderShopsList();
      renderSpreadsheetView();
    });
  }
}

function showToast(msg) {
  const toast = document.getElementById('toastMsg');
  if (!toast) return;
  toast.textContent = msg;
  toast.classList.add('show');
  setTimeout(() => {
    toast.classList.remove('show');
  }, 3500);
}

function escapeHtml(str) {
  if (!str) return '';
  return str.replace(/[&<>"']/g, function(m) {
    return {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;'
    }[m];
  });
}
