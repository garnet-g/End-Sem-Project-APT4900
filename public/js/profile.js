// profile.js
document.addEventListener('DOMContentLoaded', () => {
  const userId = localStorage.getItem('userId');
  const username = localStorage.getItem('username');

  if (!userId && !username) {
    console.warn('No user logged in for profile.');
    return;
  }

  // DOM fields (common IDs)
  const nameEl = document.getElementById('profile-fullname') || document.getElementById('profile-name');
  const roleEl = document.getElementById('profile-role');
  const stationEl = document.getElementById('profile-station');
  const usernameEl = document.getElementById('profile-username');

  // Try endpoint /api/users/:id first
  (async function loadProfile() {
    try {
      if (userId) {
        const res = await fetch(`/api/users/${encodeURIComponent(userId)}`);
        if (res.ok) {
          const data = await res.json();
          populateProfile(data);
          return;
        }
      }

      // Fallback: fetch admin users list and match by username
      const res2 = await fetch('/api/admin/users');
      if (!res2.ok) {
        console.warn('No profile endpoint available.');
        return;
      }
      const users = await res2.json();
      const found = users.find(u => (u.username && username && u.username.toLowerCase() === username.toLowerCase()) || (u._id && u._id === userId));
      if (found) {
        populateProfile(found);
      } else {
        console.warn('Logged-in user not found in /api/admin/users');
      }
    } catch (err) {
      console.error('Error loading profile', err);
    }
  })();

  function populateProfile(u) {
    if (!u) return;
    if (nameEl) nameEl.textContent = u.fullName || u.name || (u.username || '');
    if (roleEl) roleEl.textContent = u.userRole || u.role || '';
    if (stationEl) stationEl.textContent = u.station || '';
    if (usernameEl) usernameEl.textContent = u.username || u.email || '';
  }
});
