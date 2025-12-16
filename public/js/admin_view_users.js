document.addEventListener("DOMContentLoaded", function() {
    console.log("Admin View Users page loaded");
    
    // Check authentication
    checkAdminAuth();
    
    // Load users
    loadUsers();
    
    // Search functionality
    const searchInput = document.getElementById("search-users");
    if (searchInput) {
        searchInput.addEventListener("input", debounce(searchUsers, 300));
    }
    
    // Refresh button
    const refreshBtn = document.getElementById("refresh-users");
    if (refreshBtn) {
        refreshBtn.addEventListener("click", loadUsers);
    }
});

async function loadUsers() {
    console.log("Loading users from API...");
    
    try {
        showLoading(true);
        
        const response = await fetch("/api/users");
        console.log("API Response status:", response.status);
        
        const data = await response.json();
        console.log("API Response data:", data);
        
        if (data.success) {
            console.log(`Found ${data.users.length} users`);
            displayUsers(data.users);
            showToast(`Loaded ${data.users.length} users`, "success");
        } else {
            console.error("Failed to load users:", data.message);
            showToast(`Error: ${data.message}`, "danger");
        }
    } catch (error) {
        console.error("Load users error:", error);
        showToast("Network error. Please check server connection.", "danger");
    } finally {
        showLoading(false);
    }
}

function displayUsers(users) {
    const container = document.getElementById("users-container");
    if (!container) {
        console.error("Users container not found!");
        return;
    }
    
    if (!users || users.length === 0) {
        container.innerHTML = `
            <tr>
                <td colspan="9" class="text-center py-5">
                    <div class="text-muted">
                        <i class="bi bi-people display-4 d-block mb-3"></i>
                        No users found in the database.
                    </div>
                </td>
            </tr>
        `;
        return;
    }
    
    const html = users.map(user => {
        // Format dates
        const createdDate = user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A';
        const lastLogin = user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'Never';
        
        return `
        <tr>
            <td><strong>${user.username || 'N/A'}</strong></td>
            <td>${user.fullName || 'N/A'}</td>
            <td>
                <span class="badge ${getRoleBadgeClass(user.userRole)}">
                    ${user.userRole || 'N/A'}
                </span>
            </td>
            <td>${user.station || 'N/A'}</td>
            <td>${user.email || 'N/A'}</td>
            <td>${createdDate}</td>
            <td>${lastLogin}</td>
            <td>
                <span class="badge ${user.isActive ? 'bg-success' : 'bg-danger'}">
                    ${user.isActive ? 'Active' : 'Inactive'}
                </span>
            </td>
            <td>
                <div class="btn-group btn-group-sm">
                    <button class="btn btn-outline-primary" onclick="editUser('${user.id}')" title="Edit">
                        <i class="bi bi-pencil"></i>
                    </button>
                    <button class="btn btn-outline-danger" onclick="deleteUser('${user.id}')" title="Deactivate">
                        <i class="bi bi-trash"></i>
                    </button>
                </div>
            </td>
        </tr>
        `;
    }).join('');
    
    container.innerHTML = html;
}

function getRoleBadgeClass(role) {
    const classes = {
        "admin": "bg-danger",
        "officer": "bg-primary",
        "analyst": "bg-warning text-dark",
        "court": "bg-info",
        "investigator": "bg-secondary",
        "legal": "bg-dark"
    };
    return classes[role] || "bg-secondary";
}

function searchUsers() {
    const searchTerm = document.getElementById("search-users").value.toLowerCase();
    const rows = document.querySelectorAll("#users-container tr");
    
    let visibleCount = 0;
    rows.forEach(row => {
        const text = row.textContent.toLowerCase();
        const isVisible = text.includes(searchTerm);
        row.style.display = isVisible ? "" : "none";
        if (isVisible) visibleCount++;
    });
    
    // Update count display if exists
    const countElement = document.getElementById("user-count");
    if (countElement) {
        countElement.textContent = `Showing ${visibleCount} users`;
    }
}

function showLoading(show) {
    const container = document.getElementById("users-container");
    const refreshBtn = document.getElementById("refresh-users");
    
    if (show) {
        if (container) {
            container.innerHTML = `
                <tr>
                    <td colspan="9" class="text-center py-5">
                        <div class="spinner-border text-primary" role="status">
                            <span class="visually-hidden">Loading users...</span>
                        </div>
                        <p class="mt-2 text-muted">Loading users from database...</p>
                    </td>
                </tr>
            `;
        }
        if (refreshBtn) {
            refreshBtn.disabled = true;
            refreshBtn.innerHTML = '<span class="spinner-border spinner-border-sm"></span> Loading';
        }
    } else {
        if (refreshBtn) {
            refreshBtn.disabled = false;
            refreshBtn.innerHTML = '<i class="bi bi-arrow-clockwise"></i> Refresh';
        }
    }
}

function showToast(message, type = "info") {
    // Create toast if not exists
    if (!document.getElementById('toast-container')) {
        const toastContainer = document.createElement('div');
        toastContainer.id = 'toast-container';
        toastContainer.className = 'toast-container position-fixed top-0 end-0 p-3';
        toastContainer.style.zIndex = '9999';
        document.body.appendChild(toastContainer);
    }
    
    const toastId = 'toast-' + Date.now();
    const toastHtml = `
        <div id="${toastId}" class="toast align-items-center text-bg-${type} border-0" role="alert" aria-live="assertive" aria-atomic="true">
            <div class="d-flex">
                <div class="toast-body">
                    ${message}
                </div>
                <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
            </div>
        </div>
    `;
    
    document.getElementById('toast-container').insertAdjacentHTML('beforeend', toastHtml);
    const toastElement = document.getElementById(toastId);
    const toast = new bootstrap.Toast(toastElement, { delay: 3000 });
    toast.show();
    
    toastElement.addEventListener('hidden.bs.toast', function () {
        toastElement.remove();
    });
}

async function deleteUser(userId) {
    if (!confirm("Are you sure you want to deactivate this user?\n\nThey will no longer be able to login.")) return;
    
    try {
        const response = await fetch(`/api/users/${userId}`, {
            method: "DELETE"
        });
        
        const data = await response.json();
        
        if (data.success) {
            showToast("User deactivated successfully", "success");
            loadUsers(); // Refresh the list
        } else {
            showToast(`Error: ${data.message}`, "danger");
        }
    } catch (error) {
        console.error("Delete user error:", error);
        showToast("Network error. Please try again.", "danger");
    }
}

function editUser(userId) {
    // For now, just show an alert. You can implement edit modal later.
    alert(`Edit user ID: ${userId}\n\nEdit functionality would open here in a full implementation.`);
}

function checkAdminAuth() {
    const isLoggedIn = localStorage.getItem("isLoggedIn");
    const userRole = localStorage.getItem("userRole");
    
    if (!isLoggedIn || isLoggedIn !== "true") {
        window.location.href = "index.html";
        return;
    }
    
    if (userRole !== "admin") {
        showToast("Access denied. Admin privileges required.", "danger");
        setTimeout(() => {
            window.location.href = getDashboardForRole(userRole);
        }, 2000);
    }
}

// Utility function
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}