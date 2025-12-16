// my_evidence.js
document.addEventListener('DOMContentLoaded', () => {
  const tableBody = document.getElementById('my-evidence-table') || document.getElementById('myEvidenceTable');
  const totalEl = document.getElementById('stat-total-submitted');
  const custodyEl = document.getElementById('stat-current-custody');

  const userId = localStorage.getItem('userId');
  if (!userId) {
    console.warn('User not logged in — cannot load My Evidence.');
    return;
  }

  loadMyEvidence(userId);

  async function loadMyEvidence(userId) {
    try {
      const res = await fetch(`/api/evidence/my/${encodeURIComponent(userId)}`);
      if (!res.ok) {
        console.error('Failed to load evidence for user', res.status);
        return;
      }
      const data = await res.json();
      // data expected shape: { totalSubmitted, currentCustody, items }
      if (totalEl) totalEl.textContent = data.totalSubmitted ?? (data.items?.length ?? 0);
      if (custodyEl) custodyEl.textContent = data.currentCustody ?? (data.items?.filter(i => i.status === 'in_custody').length ?? 0);

      if (!tableBody) return;
      tableBody.innerHTML = '';

      const items = data.items || [];
      if (items.length === 0) {
        tableBody.innerHTML = `<tr><td colspan="6" class="text-center small text-muted">No evidence submitted yet.</td></tr>`;
        return;
      }

      items.forEach(ev => {
        const statusBadge = ev.status === 'in_custody' ? '<span class="badge bg-warning">In Custody</span>' : `<span class="badge bg-success">${ev.status || 'OK'}</span>`;
        const desc = ev.description || ev.evidenceType || '';
        const timestamp = ev.timestamp ? new Date(ev.timestamp).toLocaleString() : '';

        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td>${ev.evidenceId || ev._id || ''}</td>
          <td>${ev.caseNumber || ''}</td>
          <td class="text-truncate" style="max-width:280px">${desc}</td>
          <td>${ev.custodianName || 'You'}</td>
          <td>${statusBadge}</td>
          <td>
            <a class="btn btn-sm btn-outline-primary" href="evidence_details.html?id=${encodeURIComponent(ev.evidenceId || ev._id || '')}">View</a>
          </td>
        `;
        tableBody.appendChild(tr);
      });
    } catch (err) {
      console.error('Error loading my evidence', err);
    }
  }
});
