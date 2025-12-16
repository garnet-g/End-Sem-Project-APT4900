document.addEventListener("DOMContentLoaded", function() {
    // Check authentication
    checkOfficerAuth();
    
    // Load officer data
    loadOfficerData();
    
    // Update user info
    updateUserInfo();
    
    // Setup evidence upload form
    const uploadForm = document.getElementById("evidence-upload-form");
    if (uploadForm) {
        uploadForm.addEventListener("submit", handleEvidenceUpload);
    }
});

async function loadOfficerData() {
    try {
        const userId = localStorage.getItem("userId");
        
        // Load officer's evidence
        const evidenceResponse = await fetch(`/api/evidence/user/${userId}`);
        const evidenceData = await evidenceResponse.json();
        
        if (evidenceData.success) {
            displayOfficerEvidence(evidenceData.evidence);
            updateStats(evidenceData.evidence);
        }
        
    } catch (error) {
        console.error("Load officer data error:", error);
    }
}

function displayOfficerEvidence(evidence) {
    const container = document.getElementById("officer-evidence-table");
    if (!container || !evidence) return;
    
    if (evidence.length === 0) {
        container.innerHTML = `
            <tr>
                <td colspan="6" class="text-center py-4">
                    <div class="text-muted">
                        <i class="bi bi-upload display-4 d-block mb-2"></i>
                        No evidence uploaded yet. Upload your first evidence item.
                    </div>
                </td>
            </tr>
        `;
        return;
    }
    
    const html = evidence.map(item => `
        <tr>
            <td>${item.evidenceId || 'N/A'}</td>
            <td>${item.caseNumber || 'N/A'}</td>
            <td>${item.evidenceType || 'N/A'}</td>
            <td>${item.createdAt ? new Date(item.createdAt).toLocaleDateString() : 'N/A'}</td>
            <td>
                <span class="badge ${getStatusBadgeClass(item.status)}">
                    ${item.status || 'Unknown'}
                </span>
            </td>
            <td>
                <button class="btn btn-sm btn-outline-info" onclick="viewEvidenceDetails('${item.evidenceId}')">
                    <i class="bi bi-eye"></i> View
                </button>
            </td>
        </tr>
    `).join('');
    
    container.innerHTML = html;
}

function updateStats(evidence) {
    const total = evidence.length;
    const inCustody = evidence.filter(e => e.status === "in_custody").length;
    const inAnalysis = evidence.filter(e => e.status === "in_analysis").length;
    
    document.getElementById("total-uploaded").textContent = total;
    document.getElementById("in-custody").textContent = inCustody;
    document.getElementById("in-analysis").textContent = inAnalysis;
}

async function handleEvidenceUpload(e) {
    e.preventDefault();
    
    const form = e.target;
    const formData = new FormData(form);
    const officerId = localStorage.getItem("userId");
    
    // Add officer ID to form data
    formData.append("officerId", officerId);
    
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    
    // Show loading
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm"></span> Uploading...';
    
    try {
        const response = await fetch("/api/evidence", {
            method: "POST",
            body: formData
        });
        
        const data = await response.json();
        
        if (data.success) {
            alert(`Evidence uploaded successfully!\nEvidence ID: ${data.evidenceId}\nSHA256: ${data.sha256}`);
            form.reset();
            loadOfficerData(); // Refresh the evidence list
        } else {
            alert("Upload failed: " + data.message);
        }
    } catch (error) {
        console.error("Upload error:", error);
        alert("Network error. Please try again.");
    } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalText;
    }
}

function viewEvidenceDetails(evidenceId) {
    window.location.href = `evidence_details.html?id=${evidenceId}`;
}

function getStatusBadgeClass(status) {
    const classes = {
        "in_custody": "bg-primary",
        "in_analysis": "bg-warning text-dark",
        "completed": "bg-success",
        "in_court": "bg-info"
    };
    return classes[status] || "bg-secondary";
}

function updateUserInfo() {
    const fullName = localStorage.getItem("fullName");
    const userRole = localStorage.getItem("userRole");
    
    if (fullName) {
        // Update welcome message
        const welcomeElements = document.querySelectorAll('.navbar-text');
        welcomeElements.forEach(el => {
            if (el.textContent.includes('**Officer Name**')) {
                el.textContent = el.textContent.replace('**Officer Name**', fullName);
            }
        });
    }
}

function checkOfficerAuth() {
    const isLoggedIn = localStorage.getItem("isLoggedIn");
    const userRole = localStorage.getItem("userRole");
    
    if (!isLoggedIn || isLoggedIn !== "true") {
        window.location.href = "index.html";
        return;
    }
    
    // Allow officer and admin
    if (userRole !== "officer" && userRole !== "admin") {
        alert("Access denied. Officer privileges required.");
        window.location.href = getDashboardForRole(userRole);
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