document.addEventListener('DOMContentLoaded', () => {
    console.log("Evidence Success page loaded.");
    
    // In a real app, the Evidence ID would be passed via a URL parameter 
    // or loaded from a temporary session state after the upload POST request.

    const urlParams = new URLSearchParams(window.location.search);
    const evidenceId = urlParams.get('id');

    if (evidenceId) {
        document.getElementById('evidence-id-display').textContent = evidenceId;
        console.log(`Confirmation for Evidence ID: ${evidenceId}`);
        // Optionally update the link button to view details
        document.querySelector('a[href*="evidence_details.html"]').href = `evidence_details.html?id=${evidenceId}`;
    } else {
        // Fallback for simulation
        console.log("No evidence ID found in URL. Using placeholder.");
    }
});