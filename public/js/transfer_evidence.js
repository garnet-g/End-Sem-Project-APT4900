document.addEventListener('DOMContentLoaded', () => {
    console.log("Transfer Evidence page loaded.");
    
    const loadEvidenceBtn = document.getElementById('loadEvidenceBtn');
    const transferFields = document.getElementById('transferFields');
    const transferForm = document.getElementById('transfer-form');
    
    // 1. Load Evidence Details
    loadEvidenceBtn.addEventListener('click', loadEvidenceDetails);

    function loadEvidenceDetails() {
        const evidenceId = document.getElementById('evidenceIdInput').value.trim();
        if (!evidenceId) {
            alert("Please enter an Evidence ID.");
            return;
        }

        loadEvidenceBtn.disabled = true;
        loadEvidenceBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span> Loading...';

        // --- Node.js API call to fetch evidence details ---
        setTimeout(() => {
            // Assume success
            document.getElementById('evidenceDetailsContainer').classList.remove('d-none');
            transferFields.disabled = false; // Enable transfer form
            
            // Populate simulated data (in a real app, this comes from the API response)
            document.getElementById('loaded-case-no').textContent = "CR/101/2025";
            document.getElementById('loaded-description').textContent = "Mobile phone dump (12GB).";
            
            loadEvidenceBtn.disabled = false;
            loadEvidenceBtn.innerHTML = '<i class="bi bi-box-seam me-1"></i> Loaded!';
        }, 1500);
    }

    // 2. Handle Transfer Submission
    transferForm.addEventListener('submit', function(event) {
        event.preventDefault();
        const submitBtn = document.getElementById('submitTransferBtn');
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span> Transferring...';

        // --- Node.js API call to /api/custody/transfer ---
        setTimeout(() => {
            console.log("Transfer simulated. Redirecting to success page.");
            const transferReceiptId = "TR-20251124-12345";
            window.location.href = `transfer_success.html?receipt=${transferReceiptId}&evidenceId=${document.getElementById('evidenceIdInput').value}`;
        }, 2500);
    });
});