// analysis_workspace.js
document.addEventListener('DOMContentLoaded', () => {
  const role = localStorage.getItem('userRole');
  if (!role || (role !== 'analyst' && role !== 'admin')) {
    // Not an analyst — allow but warn
    console.warn('User not analyst/admin. Page may have restricted features.');
  }

  const listContainer = document.getElementById('analysis-list') || document.getElementById('evidence-list') || null;
  const filterCaseInput = document.getElementById('filterCase');
  const refreshBtn = document.getElementById('refreshEvidenceBtn');

  if (refreshBtn) refreshBtn.addEventListener('click', loadEvidence);
  if (filterCaseInput) filterCaseInput.addEventListener('keyup', (e) => {
    if (e.key === 'Enter') loadEvidence();
  });

  loadEvidence();

  async function loadEvidence() {
    try {
      const q = {};
      if (filterCaseInput && filterCaseInput.value.trim()) q.caseNumber = filterCaseInput.value.trim();
      const qs = new URLSearchParams(q).toString();
      const endpoint = `/api/evidence${qs ? ('?' + qs) : ''}`;

      const res = await fetch(endpoint);
      if (!res.ok) {
        console.error('Failed to load evidence list', res.status);
        if (listContainer) listContainer.innerHTML = '<div class="small text-danger">Failed to load evidence.</div>';
        return;
      }

      const items = await res.json();
      renderList(items);
    } catch (err) {
      console.error('Error loading evidence list', err);
      if (listContainer) listContainer.innerHTML = '<div class="small text-danger">Error loading evidence. See console.</div>';
    }
  }

  function renderList(items) {
    if (!listContainer) {
      console.log('No analysis list container found in DOM.');
      return;
    }
    if (!Array.isArray(items) || items.length === 0) {
      listContainer.innerHTML = '<div class="small text-muted p-3">No evidence found.</div>';
      return;
    }

    listContainer.innerHTML = '';
    items.forEach(ev => {
      const card = document.createElement('div');
      card.className = 'card mb-2';
      card.innerHTML = `
        <div class="card-body">
          <h6 class="card-title">${ev.evidenceId || ev._id || 'Unknown ID'} <small class="text-muted">(${ev.caseNumber || 'No case'})</small></h6>
          <p class="card-text small text-truncate" style="max-width:600px">${ev.description || ev.evidenceType || ''}</p>
          <div>
            <a class="btn btn-sm btn-outline-primary" href="evidence_details.html?id=${encodeURIComponent(ev.evidenceId || ev._id || '')}">Open</a>
            <button class="btn btn-sm btn-outline-secondary btn-verify" data-id="${ev.evidenceId || ev._id || ''}">Verify</button>
          </div>
        </div>
      `;
      listContainer.appendChild(card);
    });

    // attach verify handlers
    listContainer.querySelectorAll('.btn-verify').forEach(b => {
      b.addEventListener('click', async (ev) => {
        const id = b.dataset.id;
        if (!id) return;
        // open details and auto-click verify if available
        window.location.href = `evidence_details.html?id=${encodeURIComponent(id)}&autoverify=1`;
      });
    });
  }
});
