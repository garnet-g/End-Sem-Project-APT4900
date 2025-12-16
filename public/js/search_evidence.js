// search_evidence.js
document.addEventListener('DOMContentLoaded', () => {
  // Support either a form with id="searchForm" or simple input+button (searchId + searchBtn)
  const form = document.getElementById('searchForm');
  const input = document.getElementById('searchId');
  const btn = document.getElementById('searchBtn');

  if (form) {
    form.addEventListener('submit', handleSearch);
  } else if (btn && input) {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      handleSearch();
    });
  } else {
    console.log('No search form or search elements found on page.');
  }

  async function handleSearch(e) {
    if (e) e.preventDefault();

    const id = (input && input.value) ? input.value.trim() : (document.getElementById('evidenceIdInput')?.value || '');
    if (!id) {
      alert('Enter an Evidence ID to search (e.g., DE-1A4C).');
      return;
    }

    try {
      const res = await fetch(`/api/evidence/${encodeURIComponent(id)}`);
      if (res.status === 404) {
        alert('Evidence not found.');
        return;
      }
      if (!res.ok) {
        const txt = await res.text();
        console.warn('Search response not ok:', res.status, txt);
        alert('Search failed. Check console for details.');
        return;
      }
      const data = await res.json();
      // Redirect to details page using evidenceId (keeps your UI unchanged)
      window.location.href = `evidence_details.html?id=${encodeURIComponent(data.evidenceId || id)}`;
    } catch (err) {
      console.error('Search error', err);
      alert('Could not reach the server. Is the backend running?');
    }
  }
});
