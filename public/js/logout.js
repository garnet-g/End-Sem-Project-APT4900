// Universal logout functionality - include this in ALL pages

document.addEventListener("DOMContentLoaded", function() {
    // Setup logout button
    setupLogoutButton();
    
    // Display user info
    displayUserInfo();
    
    // Check authentication on all pages except login
    const currentPage = window.location.pathname.split('/').pop();
    const isLoginPage = currentPage === "index.html" || currentPage === "" || currentPage === "login.html";
    
    if (!isLoginPage) {
        checkAuthentication();
    }
});

function setupLogoutButton() {
    // Find logout button by ID
    const logoutBtn = document.getElementById("logoutBtn");
    if (logoutBtn) {
        logoutBtn.addEventListener("click", function(event) {
            event.preventDefault();
            performLogout();
        });
    }
    
    // Also handle any element with class "logout-link" or text "Logout"
    const logoutLinks = document.querySelectorAll(".logout-link, a[href*='logout'], a:contains('Logout')");
    logoutLinks.forEach(link => {
        link.addEventListener("click", function(event) {
            event.preventDefault();
            performLogout();
        });
    });
    
    // Add logout to dropdown items
    const logoutDropdownItems = document.querySelectorAll(".dropdown-item.text-danger");
    logoutDropdownItems.forEach(item => {
        if (item.textContent.includes("Logout")) {
            item.addEventListener("click", function(event) {
                event.preventDefault();
                performLogout();
            });
        }
    });
}

function performLogout() {
    if (confirm("Are you sure you want to logout?")) {
        // Clear all user data from localStorage
        localStorage.removeItem("userId");
        localStorage.removeItem("username");
        localStorage.removeItem("userRole");
        localStorage.removeItem("fullName");
        localStorage.removeItem("isLoggedIn");
        localStorage.removeItem("loginTime");
        
        console.log("User logged out, redirecting to login...");
        
        // Redirect to login page
        window.location.href = "index.html";
    }
}

function checkAuthentication() {
    const isLoggedIn = localStorage.getItem("isLoggedIn");
    const userRole = localStorage.getItem("userRole");
    
    if (!isLoggedIn || isLoggedIn !== "true" || !userRole) {
        // Redirect to login
        console.log("Not authenticated, redirecting to login...");
        window.location.href = "index.html";
        return;
    }
    
    // Check if user has permission for current page
    const currentPage = window.location.pathname.split('/').pop();
    const pageRoles = {
        "admin_dashboard.html": ["admin"],
        "officer_dashboard.html": ["officer", "admin"],
        "evidence_upload.html": ["officer", "admin"],
        "analyst_dashboard.html": ["analyst", "admin"],
        "court_presentation.html": ["court", "admin"],
        "my_evidence.html": ["officer", "analyst", "admin", "court"],
        "evidence_details.html": ["officer", "analyst", "admin", "court"],
        "admin_create_user.html": ["admin"],
        "admin_view_users.html": ["admin"],
        "admin_view_evidence.html": ["admin"]
    };
    
    const allowedRoles = pageRoles[currentPage];
    if (allowedRoles && !allowedRoles.includes(userRole)) {
        alert("Access denied. You don't have permission to view this page.");
        redirectToDashboard(userRole);
    }
}

function displayUserInfo() {
    const username = localStorage.getItem("username");
    const fullName = localStorage.getItem("fullName");
    const userRole = localStorage.getItem("userRole");
    
    if (!username) return; // No user info to display
    
    // Update all display elements with user info
    updateElementText("#admin-name", username);
    updateElementText(".display-username", username);
    updateElementText(".display-fullname", fullName || username);
    updateElementText(".display-role", userRole ? userRole.charAt(0).toUpperCase() + userRole.slice(1) : "");
    
    // Update any "Welcome" messages
    document.querySelectorAll(".navbar-text, .welcome-text").forEach(el => {
        let text = el.textContent;
        if (text.includes("**")) {
            text = text.replace(/\*\*(.*?)\*\*/g, fullName || username);
            el.textContent = text;
        }
        if (text.includes("(Forensic Analyst)") && userRole) {
            text = text.replace("(Forensic Analyst)", `(${userRole})`);
            el.textContent = text;
        }
    });
}

function updateElementText(selector, text) {
    const elements = document.querySelectorAll(selector);
    elements.forEach(el => {
        el.textContent = text;
    });
}

function redirectToDashboard(userRole) {
    const dashboards = {
        "admin": "admin_dashboard.html",
        "officer": "officer_dashboard.html",
        "analyst": "analyst_dashboard.html",
        "court": "court_presentation.html"
    };
    
    const dashboard = dashboards[userRole] || "index.html";
    window.location.href = dashboard;
}

// Add this function to manually logout from console if needed
window.forceLogout = function() {
    localStorage.clear();
    window.location.href = "index.html";
};