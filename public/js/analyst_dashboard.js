document.addEventListener("DOMContentLoaded", function() {
    console.log("Admin Dashboard loaded");
    
    // Check authentication
    checkAdminAuth();
    
    // Load dashboard stats
    loadDashboardStats();
    
    // Setup logout button
    setupLogoutButton();
    
    // Display user info
    displayUserInfo();
});

async function loadDashboardStats() {
    console.log("Loading dashboard stats...");
    
    try {
        const response = await fetch("/api/stats");
        const data = await response.json();
        
        console.log("Dashboard stats response:", data);
        
        if (data.success) {
            // Update the stat elements in your HTML
            // You need to add these IDs to your admin_dashboard.html
            updateElementText("#totalUsers", data.stats.totalUsers || 0);
            updateElementText("#totalEvidence", data.stats.totalEvidence || 0);
            updateElementText("#activeOfficers", data.stats.officers || 0);
            updateElementText("#todayUploads", data.stats.todayUploads || 0);
        } else {
            console.error("Failed to load stats:", data.message);
        }
        
    } catch (error) {
        console.error("Error loading dashboard stats:", error);
    }
}

function checkAdminAuth() {
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

function setupLogoutButton() {
    const logoutBtn = document.getElementById("logoutBtn");
    if (logoutBtn) {
        logoutBtn.addEventListener("click", function(e) {
            e.preventDefault();
            performLogout();
        });
    }
}

function performLogout() {
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

function displayUserInfo() {
    const username = localStorage.getItem("username");
    const fullName = localStorage.getItem("fullName");
    const userRole = localStorage.getItem("userRole");
    
    console.log("Loading user info:", { username, fullName, userRole });
    
    // Update page title
    if (username) {
        document.title = "Admin Dashboard - " + username;
    }
    
    // Display user info in navbar
    const adminNameElement = document.getElementById("admin-name");
    if (adminNameElement) {
        adminNameElement.textContent = fullName || username;
    }
}

function updateElementText(elementId, text) {
    const element = document.getElementById(elementId);
    if (element) {
        element.textContent = text;
    }
}

function getDashboardForRole(role) {
    const dashboards = {
        "admin": "admin_dashboard.html",
        "officer": "officer_dashboard.html",
        "analyst": "analyst_dashboard.html",
        "court": "court_presentation.html"
    };
    return dashboards[role] || "index.html";
}