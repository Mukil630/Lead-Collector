// Lead persistence & CSV exporter service
const LEAD_STORAGE_KEY = 'karur_textiles_saved_leads_v1';

export function getSavedLeads() {
  try {
    const data = localStorage.getItem(LEAD_STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    console.error('Error loading saved leads:', e);
    return [];
  }
}

export function saveLead(shop, status = 'New Lead', notes = '') {
  const existing = getSavedLeads();
  const index = existing.findIndex(l => l.id === shop.id);

  const leadItem = {
    ...shop,
    leadStatus: status,
    salesNotes: notes || (existing[index] ? existing[index].salesNotes : ''),
    savedAt: new Date().toLocaleDateString('en-GB')
  };

  if (index >= 0) {
    existing[index] = leadItem;
  } else {
    existing.unshift(leadItem);
  }

  try {
    localStorage.setItem(LEAD_STORAGE_KEY, JSON.stringify(existing));
  } catch (e) {
    console.error('Error persisting lead:', e);
  }

  return existing;
}

export function removeLead(shopId) {
  const existing = getSavedLeads();
  const filtered = existing.filter(l => l.id !== shopId);
  try {
    localStorage.setItem(LEAD_STORAGE_KEY, JSON.stringify(filtered));
  } catch (e) {
    console.error('Error deleting lead:', e);
  }
  return filtered;
}

export function exportLeadsToCSV(leadsArray, filename = 'Karur_Textiles_Leads.csv') {
  if (!leadsArray || leadsArray.length === 0) return false;

  const headers = [
    'Business Name',
    'Category',
    'Phone',
    'WhatsApp',
    'Email/Website',
    'Address',
    'Rating',
    'Reviews Count',
    'Lead Score',
    'Lead Status',
    'Sales Notes',
    'Saved Date'
  ];

  const rows = leadsArray.map(shop => [
    `"${(shop.name || '').replace(/"/g, '""')}"`,
    `"${(shop.category || '').replace(/"/g, '""')}"`,
    `"${(shop.phone || '').replace(/"/g, '""')}"`,
    `"${(shop.whatsapp || '').replace(/"/g, '""')}"`,
    `"${(shop.website || '').replace(/"/g, '""')}"`,
    `"${(shop.address || '').replace(/"/g, '""')}"`,
    shop.rating || 0,
    shop.reviewsCount || 0,
    `"${shop.leadScore || 'High'}"`,
    `"${shop.leadStatus || 'New'}"`,
    `"${(shop.salesNotes || '').replace(/"/g, '""')}"`,
    `"${shop.savedAt || new Date().toLocaleDateString('en-GB')}"`
  ]);

  const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);

  return true;
}
