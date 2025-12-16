document.addEventListener('DOMContentLoaded', () => {
    console.log("Transfer Success page loaded.");
    
    const urlParams = new URLSearchParams(window.location.search);
    const receiptId = urlParams.get('receipt');
    const evidenceId = urlParams.get('evidenceId');

    if (receiptId) {
        document.getElementById('receipt-no-display').textContent = receiptId;
        document.getElementById('evidence-id-display').textContent = evidenceId || 'N/A';
        console.log(`Receipt: ${receiptId}, Evidence: ${evidenceId}`);
    } else {
        console.log("No receipt ID found in URL. Using placeholder.");
    }
});