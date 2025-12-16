document.addEventListener("DOMContentLoaded", function() {
    console.log("Admin Dashboard loaded");
    
    // Check authentication first
    checkAuthentication();
    
    // Load user info
    loadUserInfo();
    
    // Load dashboard stats
    loadDashboardStats();
    
    // Setup logout button
    const logoutBtn = document.getElementById("logoutBtn");
    if (logoutBtn) {
        logoutBtn.addEventListener("click", function(e) {
            e.preventDefault();
            logout();
        });
    }
    
    // Setup refresh button
    const refreshBtn = document.getElementById("refreshBtn");
    if (refreshBtn) {
        refreshBtn.addEventListener("click", function(e) {
            e.preventDefault();
            loadDashboardStats();
        });
    }
    
    // Check server status
    checkServerStatus();
});

// Check if user is authenticated and is an admin
function checkAuthentication() {
    const isLoggedIn = localStorage.getItem("isLoggedIn");
    const userRole = localStorage.getItem("userRole");
    
    console.log("Auth check - Logged in:", isLoggedIn, "Role:", userRole);
    
    if (!isLoggedIn || isLoggedIn !== "true") {
        alert("Please login first");
        window.location.href = "index.html";
        return;
    }
    
    if (userRole !== "admin") {
        alert("Access denied. Admin privileges required.");
        window.location.href = getDashboardForRole(userRole);
        return;
    }
}

// Load user information into the page
function loadUserInfo() {
    const username = localStorage.getItem("username");
    const fullName = localStorage.getItem("fullName");
    const userRole = localStorage.getItem("userRole");
    
    console.log("Loading user info:", { username, fullName, userRole });
    
    // Update page title
    if (username) {
        document.title = "Admin Dashboard - " + username;
    }
    
    // Display user info
    const userInfoElement = document.getElementById("userInfo");
    if (userInfoElement) {
        userInfoElement.innerHTML = `
            <div class="text-white">
                <strong>${fullName || username}</strong>
                <span class="badge bg-light text-dark ms-2">${userRole}</span>
            </div>
        `;
    }
}

// Load dashboard statistics using the new endpoint
async function loadDashboardStats() {
    console.log("Loading dashboard stats...");
    
    try {
        const response = await fetch("/api/dashboard/stats");
        const data = await response.json();
        
        console.log("Dashboard stats response:", data);
        
        if (data.success) {
            updateStatsDisplay(data.stats);
        } else {
            console.error("Failed to load stats:", data.message);
            showErrorMessage("Could not load dashboard stats: " + data.message);
        }
        
    } catch (error) {
        console.error("Error loading dashboard stats:", error);
        showErrorMessage("Could not load dashboard data. Check server connection.");
    }
}

// Update the stats display
function updateStatsDisplay(stats) {
    console.log("Updating stats display:", stats);
    
    // Update all stat elements
    updateElementText("totalUsers", stats.totalUsers || 0);
    updateElementText("totalEvidence", stats.totalEvidence || 0);
    updateElementText("officersCount", stats.activeOfficers || 0);
    updateElementText("todayUploads", stats.todayUploads || 0);
    
    // Show success message briefly
    showSuccessMessage("Stats updated successfully!");
}

// Check server status
async function checkServerStatus() {
    try {
        const response = await fetch("/api/health");
        const data = await response.json();
        
        const statusElement = document.getElementById("serverStatus");
        if (statusElement) {
            if (data.success) {
                statusElement.innerHTML = '<span class="text-success">✓ Server connected</span>';
            } else {
                statusElement.innerHTML = '<span class="text-danger">✗ Server error</span>';
            }
        }
    } catch (error) {
        console.warn("Cannot reach server");
        const statusElement = document.getElementById("serverStatus");
        if (statusElement) {
            statusElement.innerHTML = '<span class="text-danger">✗ Server offline</span>';
        }
    }
}

// Helper function to update element text
function updateElementText(elementId, text) {
    const element = document.getElementById(elementId);
    if (element) {
        element.textContent = text;
    }
}

// Show error message
function showErrorMessage(message) {
    const errorDiv = document.getElementById("errorMessage");
    if (errorDiv) {
        errorDiv.textContent = message;
        errorDiv.className = "alert alert-danger";
        errorDiv.style.display = "block";
        
        // Auto-hide after 5 seconds
        setTimeout(() => {
            errorDiv.style.display = "none";
        }, 5000);
    } else {
        console.error(message);
    }
}

// Show success message
function showSuccessMessage(message) {
    const errorDiv = document.getElementById("errorMessage");
    if (errorDiv) {
        errorDiv.textContent = message;
        errorDiv.className = "alert alert-success";
        errorDiv.style.display = "block";
        
        // Auto-hide after 3 seconds
        setTimeout(() => {
            errorDiv.style.display = "none";
        }, 3000);
    }
}

// Logout function
function logout() {
    if (confirm("Are you sure you want to logout?")) {
        // Clear all user data
        localStorage.removeItem("userId");
        localStorage.removeItem("username");
        localStorage.removeItem("userRole");
        localStorage.removeItem("fullName");
        localStorage.removeItem("isLoggedIn");
        localStorage.removeItem("loginTime");
        
        // Redirect to login page
        window.location.href = "index.html";
    }
}

// Helper function to get dashboard for user role
function getDashboardForRole(role) {
    const dashboards = {
        "admin": "admin_dashboard.html",
        "officer": "officer_dashboard.html",
        "analyst": "analyst_dashboard.html",
        "court": "court_presentation.html"
    };
    return dashboards[role] || "index.html";
}

// Keyboard shortcuts
document.addEventListener("keydown", function(event) {
    // Ctrl + L for logout
    if (event.ctrlKey && event.key === 'l') {
        event.preventDefault();
        logout();
    }
    
    // F5 to refresh stats
    if (event.key === 'F5') {
        event.preventDefault();
        loadDashboardStats();
    }
});