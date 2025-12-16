document.addEventListener('DOMContentLoaded', () => {
    console.log("Evidence Details page loaded.");

    const evidenceId = new URLSearchParams(window.location.search).get('id') || 'DE-1A4C';
    console.log(`Viewing details for: ${evidenceId}`);
    
    // 1. Hash Verification Button Click
    const verifyBtn = document.getElementById('verifyHashBtn');
    if (verifyBtn) {
        verifyBtn.addEventListener('click', handleHashVerification);
    }
    
    // In a real scenario, this is where you'd call the Node.js API 
    // to fetch the evidence details for the given ID.
    // fetch(`/api/evidence/${evidenceId}`).then(response => ...);
});

function handleHashVerification() {
    const verifyBtn = document.getElementById('verifyHashBtn');
    
    verifyBtn.disabled = true;
    verifyBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span> Verifying...';

    // --- Simulation of hash check (2 seconds) ---
    setTimeout(() => {
        // Successful verification feedback
        verifyBtn.innerHTML = '<i class="bi bi-shield-check me-1"></i> Verification Complete';
        verifyBtn.classList.remove('btn-outline-primary');
        verifyBtn.classList.add('btn-success');
        
        // Update the status
        const statusItem = document.querySelector('.list-group-item-success');
        if (statusItem) {
            statusItem.innerHTML = '<strong>Integrity Status:</strong> <span class="fw-bold text-success"><i class="bi bi-check-circle-fill me-1"></i> RE-VERIFIED</span>';
        }

        verifyBtn.disabled = false;
        alert("Integrity check successful. Hash matches the original record.");

    }, 2000);
}