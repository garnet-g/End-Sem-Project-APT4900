// Common utility functions used across all pages

// Check if user is authenticated
function checkAuth() {
    const isLoggedIn = localStorage.getItem("isLoggedIn");
    if (!isLoggedIn || isLoggedIn !== "true") {
        window.location.href = "index.html";
        return false;
    }
    return true;
}

// Redirect based on user role
function redirectBasedOnRole() {
    const userRole = localStorage.getItem("userRole");
    const dashboards = {
        "admin": "admin_dashboard.html",
        "officer": "officer_dashboard.html",
        "analyst": "analyst_dashboard.html",
        "court": "court_presentation.html"
    };
    const dashboard = dashboards[userRole] || "index.html";
    window.location.href = dashboard;
}

// Show notification
function showNotification(message, type = "info") {
    // Create notification element
    const notification = document.createElement("div");
    notification.className = `alert alert-${type} alert-dismissible fade show position-fixed`;
    notification.style.cssText = `
        top: 20px;
        right: 20px;
        z-index: 9999;
        min-width: 300px;
        box-shadow: 0 4px 6px rgba(0,0,0,0.1);
    `;
    notification.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    
    document.body.appendChild(notification);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        if (notification.parentNode) {
            notification.remove();
        }
    }, 5000);
}

// Format date
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
}

// Format file size
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Get query parameters
function getQueryParam(name) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(name);
}

// Debounce function for search
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

// Check server connection
async function checkServerConnection() {
    try {
        const response = await fetch("/api/health");
        const data = await response.json();
        return data.success;
    } catch (error) {
        return false;
    }
}

// Logout function
function logout() {
    if (confirm("Are you sure you want to logout?")) {
        localStorage.clear();
        window.location.href = "index.html";
    }
}

// Export for use in other files
if (typeof window !== 'undefined') {
    window.utils = {
        checkAuth,
        redirectBasedOnRole,
        showNotification,
        formatDate,
        formatFileSize,
        getQueryParam,
        debounce,
        checkServerConnection,
        logout
    };
}