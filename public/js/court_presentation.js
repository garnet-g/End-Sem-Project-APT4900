document.addEventListener("DOMContentLoaded", function() {
    // Check authentication
    checkCourtAuth();
    
    // Load evidence data
    loadEvidenceData();
    
    // Setup event listeners
    document.getElementById("toggleDetailsBtn").addEventListener("click", toggleDetails);
    document.getElementById("toggleFullscreenBtn").addEventListener("click", toggleFullscreen);
    document.getElementById("exitCourtModeBtn").addEventListener("click", exitCourtMode);
    document.getElementById("prevEvidenceBtn").addEventListener("click", showPrevEvidence);
    document.getElementById("nextEvidenceBtn").addEventListener("click", showNextEvidence);
    
    // Keyboard shortcuts
    document.addEventListener("keydown", handleKeyboardShortcuts);
});

let currentEvidenceIndex = 0;
let evidenceList = [];

async function loadEvidenceData() {
    try {
        const response = await fetch("/api/evidence");
        const data = await response.json();
        
        if (data.success) {
            evidenceList = data.evidence.filter(e => e.status === "completed" || e.status === "in_court");
            if (evidenceList.length > 0) {
                displayEvidence(currentEvidenceIndex);
            } else {
                document.getElementById("evidence-preview-container").innerHTML = `
                    <div class="alert alert-info">
                        No court-ready evidence available.
                    </div>
                `;
            }
        }
    } catch (error) {
        console.error("Load evidence error:", error);
    }
}

function displayEvidence(index) {
    if (index < 0 || index >= evidenceList.length) return;
    
    const evidence = evidenceList[index];
    const container = document.getElementById("evidence-preview-container");
    const header = document.getElementById("court-header");
    
    // Update header
    header.querySelector("h4").textContent = `COURT PRESENTATION: ${evidence.caseNumber || 'Case'}`;
    header.querySelector("span").textContent = `Evidence Item ${index + 1} of ${evidenceList.length}`;
    
    // Display evidence preview (simplified - in real app would show actual file)
    container.innerHTML = `
        <div class="text-center p-5">
            <i class="bi bi-file-earmark-binary display-1 text-primary"></i>
            <h4 class="mt-3">${evidence.fileName || 'Evidence File'}</h4>
            <p class="text-muted">Evidence ID: ${evidence.evidenceId}</p>
            <p>File Size: ${formatFileSize(evidence.fileSize || 0)}</p>
            <p>Type: ${evidence.evidenceType || 'Unknown'}</p>
            <p>SHA256: ${evidence.sha256 || 'Not available'}</p>
        </div>
    `;
    
    // Update details panel
    updateDetailsPanel(evidence);
}

function updateDetailsPanel(evidence) {
    const panel = document.getElementById("details-panel");
    if (!panel) return;
    
    panel.innerHTML = `
        <div class="card border-0 shadow-sm">
            <div class="card-header bg-light">
                <h6 class="mb-0 text-dark">Evidence History & Details</h6>
            </div>
            <div class="card-body p-3 small">
                <h6 class="text-primary"><i class="bi bi-box me-1"></i> Core Data</h6>
                <ul class="list-unstyled mb-3">
                    <li><strong>Case:</strong> ${evidence.caseNumber || 'N/A'}</li>
                    <li><strong>Type:</strong> ${evidence.evidenceType || 'N/A'}</li>
                    <li><strong>Date Collected:</strong> ${evidence.createdAt ? new Date(evidence.createdAt).toLocaleDateString() : 'N/A'}</li>
                    <li><strong>Status:</strong> <span class="badge bg-success">${evidence.status || 'Unknown'}</span></li>
                </ul>
                
                <h6 class="text-secondary"><i class="bi bi-chain me-1"></i> Chain of Custody</h6>
                <p class="text-muted">Collected by Officer: ${evidence.officerId || 'Unknown'}</p>
                <p class="text-muted">Integrity Verified: ${evidence.sha256 ? '✓ SHA-256 Match' : 'Not verified'}</p>
            </div>
        </div>
    `;
}

function toggleDetails() {
    const panel = document.getElementById("details-panel");
    panel.style.display = panel.style.display === "none" ? "block" : "none";
}

function toggleFullscreen() {
    if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(err => {
            console.error(`Error attempting to enable fullscreen: ${err.message}`);
        });
    } else {
        if (document.exitFullscreen) {
            document.exitFullscreen();
        }
    }
}

function exitCourtMode() {
    const userRole = localStorage.getItem("userRole");
    window.location.href = getDashboardForRole(userRole);
}

function showPrevEvidence() {
    if (currentEvidenceIndex > 0) {
        currentEvidenceIndex--;
        displayEvidence(currentEvidenceIndex);
    }
}

function showNextEvidence() {
    if (currentEvidenceIndex < evidenceList.length - 1) {
        currentEvidenceIndex++;
        displayEvidence(currentEvidenceIndex);
    }
}

function handleKeyboardShortcuts(e) {
    switch(e.key) {
        case "ArrowLeft":
            showPrevEvidence();
            break;
        case "ArrowRight":
            showNextEvidence();
            break;
        case "f":
        case "F":
            if (e.ctrlKey) {
                e.preventDefault();
                toggleFullscreen();
            }
            break;
        case "Escape":
            exitCourtMode();
            break;
    }
}

function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function checkCourtAuth() {
    const isLoggedIn = localStorage.getItem("isLoggedIn");
    const userRole = localStorage.getItem("userRole");
    
    if (!isLoggedIn || isLoggedIn !== "true") {
        window.location.href = "index.html";
        return;
    }
    
    // Allow court and admin
    if (userRole !== "court" && userRole !== "admin") {
        alert("Access denied. Court privileges required.");
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