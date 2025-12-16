document.addEventListener("DOMContentLoaded", function() {
    const loginForm = document.getElementById("loginForm");
    const errorMessage = document.getElementById("errorMessage");
    
    if (!loginForm) return;
    
    // Clear any existing login data on the login page
    // This prevents auto-redirect when manually visiting login page
    if (window.location.pathname.includes("index.html") || window.location.pathname === "/") {
        // Only clear if user explicitly wants to login fresh
        // Don't auto-clear, just check
    }
    
    // Check if already logged in - but don't auto-redirect from login page
    // Let user see the login page even if logged in
    const isLoggedIn = localStorage.getItem("isLoggedIn");
    const userRole = localStorage.getItem("userRole");
    
    // Only auto-redirect if user is on login page but already logged in
    // AND they didn't just logout
    if (isLoggedIn === "true" && userRole) {
        // Check if this is a fresh page load (not from logout)
        const currentPage = window.location.pathname.split('/').pop();
        if (currentPage === "index.html" || currentPage === "" || currentPage === "login.html") {
            // User is on login page but already logged in - redirect to their dashboard
            setTimeout(() => {
                redirectToDashboard(userRole);
            }, 500);
        }
    }
    
    loginForm.addEventListener("submit", async function(event) {
        event.preventDefault();
        
        const username = document.getElementById("username").value.trim();
        const password = document.getElementById("password").value.trim();
        const submitBtn = loginForm.querySelector('button[type="submit"]');
        
        // Validation
        if (!username || !password) {
            showError("Please enter username and password");
            return;
        }
        
        // Show loading
        const originalText = submitBtn.textContent;
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm"></span> Logging in...';
        
        try {
            const response = await fetch("/api/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username, password })
            });
            
            const data = await response.json();
            
            if (data.success) {
                // Store user data
                localStorage.setItem("userId", data.userId);
                localStorage.setItem("username", data.username);
                localStorage.setItem("userRole", data.userRole);
                localStorage.setItem("fullName", data.fullName);
                localStorage.setItem("isLoggedIn", "true");
                localStorage.setItem("loginTime", new Date().toISOString());
                
                showSuccess("Login successful! Redirecting...");
                
                // Redirect after delay
                setTimeout(() => {
                    redirectToDashboard(data.userRole);
                }, 1000);
                
            } else {
                showError(data.message || "Invalid username or password");
            }
            
        } catch (error) {
            console.error("Login error:", error);
            showError("Cannot connect to server. Make sure server is running.");
        } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = originalText;
        }
    });
    
    function showError(message) {
        if (errorMessage) {
            errorMessage.textContent = message;
            errorMessage.className = "text-danger text-center mt-3";
        }
    }
    
    function showSuccess(message) {
        if (errorMessage) {
            errorMessage.textContent = message;
            errorMessage.className = "text-success text-center mt-3";
        }
    }
    
    function redirectToDashboard(userRole) {
        const dashboards = {
            "admin": "admin_dashboard.html",
            "officer": "officer_dashboard.html",
            "analyst": "analyst_dashboard.html",
            "court": "court_presentation.html"
        };
        
        const dashboard = dashboards[userRole] || "dashboard.html";
        
        // Prevent redirect loop - check if we're already on the right page
        const currentPage = window.location.pathname.split('/').pop();
        if (currentPage !== dashboard) {
            window.location.href = dashboard;
        }
    }
    
    // Test server connection on page load
    async function checkServerHealth() {
        try {
            const response = await fetch("/api/health");
            const data = await response.json();
            
            if (!data.success) {
                console.warn("Server health check failed:", data);
            }
        } catch (error) {
            console.warn("Cannot reach server:", error.message);
            showError("Cannot connect to server. Please make sure the server is running.");
        }
    }
    
    // Check server health after a short delay
    setTimeout(checkServerHealth, 500);
});