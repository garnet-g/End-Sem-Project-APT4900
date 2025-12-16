document.addEventListener("DOMContentLoaded", () => {
    const uploadForm = document.getElementById("uploadForm");
    if (!uploadForm) return;

    uploadForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        const formData = new FormData(uploadForm);
        formData.append("officerId", localStorage.getItem("userId"));

        try {
            const res = await fetch("/api/evidence/upload", {
                method: "POST",
                body: formData
            });
            const data = await res.json();

            if (data.success) {
                alert(`Upload successful! Evidence ID: ${data.evidenceId}`);
                uploadForm.reset();
            } else {
                alert(data.message || "Upload failed.");
            }

        } catch (err) {
            console.error(err);
            alert("Server connection error.");
        }
    });
});
